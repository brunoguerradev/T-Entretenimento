/* T Ingressos – portaria: leitura de QR code e validação de entrada (protótipo) */
(function () {
  const T = window.TIX;
  const $ = (s) => document.querySelector(s);
  const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const sel = $("#evento"), res = $("#resultado"), recentes = [];
  const TITULO = { ok: "Liberado", usado: "Já utilizado", pendente: "Não pago", "outro-evento": "Outro evento", invalido: "Inválido" };

  /* ---------- eventos ---------- */
  function preencherEventos() {
    const atual = sel.value || decodeURIComponent(location.hash.slice(1)) || "";
    const lista = T.eventos();
    sel.innerHTML = lista.map((e) => `<option value="${esc(e.id)}">${esc(e.nome)} · ${new Date(e.data).toLocaleDateString("pt-BR")}</option>`).join("");
    const proximo = lista.find((e) => new Date(e.data) > Date.now() - 864e5);
    sel.value = lista.some((e) => e.id === atual) ? atual : (proximo || lista[0] || {}).id || "";
    atualizar();
  }
  function atualizar() {
    const pagos = T.pedidos().filter((p) => p.eventoId === sel.value && p.status === "pago");
    const total = pagos.reduce((s, p) => s + p.ingressos.length, 0);
    const dentro = pagos.reduce((s, p) => s + p.ingressos.filter((i) => i.checkin).length, 0);
    $("#contador").textContent = `${dentro.toLocaleString("pt-BR")} / ${total.toLocaleString("pt-BR")}`;
    // códigos de teste: alguns válidos, um já usado e um inválido
    const livres = pagos.flatMap((p) => p.ingressos.filter((i) => !i.checkin)).slice(-4).reverse();
    const usado = pagos.flatMap((p) => p.ingressos.filter((i) => i.checkin))[0];
    const outro = T.pedidos().find((p) => p.eventoId !== sel.value && p.status === "pago");
    const testes = [...livres.map((i) => [i.codigo, "válido"]), usado && [usado.codigo, "já usado"], outro && [outro.ingressos[0].codigo, "outro evento"], ["T-ABCD-1234", "inválido"]].filter(Boolean);
    $("#codigosTeste").innerHTML = testes.map(([c, r]) => `<button type="button" data-codigo="${esc(c)}">${esc(c)} <span style="opacity:.6">(${r})</span></button>`).join("");
  }
  sel.addEventListener("change", () => { history.replaceState(null, "", "#" + encodeURIComponent(sel.value)); atualizar(); });
  window.addEventListener("tix:mudou", preencherEventos);

  /* ---------- validação ---------- */
  let ultimo = { codigo: "", em: 0 };
  function validar(codigo) {
    codigo = String(codigo || "").trim().toUpperCase();
    if (!codigo) return;
    if (codigo === ultimo.codigo && Date.now() - ultimo.em < 2500) return; // mesma leitura repetida pela câmera
    ultimo = { codigo, em: Date.now() };
    const r = T.validar(codigo, sel.value);
    res.className = `tix-result tix-result--${r.status}`;
    res.innerHTML = `<h2>${TITULO[r.status]}</h2><p>${esc(r.mensagem)}</p>${r.ingresso ? `<p style="margin-top:8px"><b>${esc(r.ingresso.descricao)}</b><br>${esc(r.ingresso.titular)} · ${esc(r.ingresso.codigo)}</p>` : ""}`;
    if (navigator.vibrate) navigator.vibrate(r.status === "ok" ? 80 : [120, 80, 120]);
    bip(r.status === "ok");
    recentes.unshift({ codigo, status: r.status, hora: new Date() });
    $("#recentes").innerHTML = recentes.slice(0, 8).map((x) => `<li><span>${esc(x.codigo)}</span><span>${TITULO[x.status]} · ${x.hora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span></li>`).join("");
    atualizar();
  }
  function bip(ok) {
    try {
      const ctx = bip.ctx || (bip.ctx = new (window.AudioContext || window.webkitAudioContext)());
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = ok ? 880 : 220; o.type = ok ? "sine" : "square";
      g.gain.setValueAtTime(0.15, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (ok ? 0.15 : 0.4));
      o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.4);
    } catch (e) { /* sem áudio */ }
  }
  $("#manual").addEventListener("submit", (e) => { e.preventDefault(); ultimo.em = 0; validar($("#codigo").value); $("#codigo").value = ""; });
  $("#codigosTeste").addEventListener("click", (e) => { const b = e.target.closest("[data-codigo]"); if (b) { ultimo.em = 0; validar(b.dataset.codigo); } });

  /* ---------- câmera ---------- */
  let stream = null;
  $("#ligar").addEventListener("click", async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
    } catch (err) {
      $("#scanOff").innerHTML = `<p>Não foi possível abrir a câmera (${esc(err.name || "erro")}).<br>Permita o acesso à câmera ou digite o código abaixo.</p>`;
      return;
    }
    const video = document.createElement("video");
    video.setAttribute("playsinline", ""); video.muted = true; video.srcObject = stream;
    $("#scan").innerHTML = ""; $("#scan").append(video);
    $("#scan").insertAdjacentHTML("beforeend", '<div class="tix-scan__frame"></div><div class="tix-scan__line"></div>');
    await video.play();
    const detector = "BarcodeDetector" in window ? new window.BarcodeDetector({ formats: ["qr_code"] }) : null;
    const canvas = document.createElement("canvas"), ctx = canvas.getContext("2d", { willReadFrequently: true });
    const loop = async () => {
      if (!stream) return;
      try {
        if (detector) {
          const codes = await detector.detect(video);
          if (codes[0]) validar(codes[0].rawValue);
        } else if (window.jsQR && video.videoWidth) {
          canvas.width = video.videoWidth; canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);
          const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = window.jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
          if (code) validar(code.data);
        }
      } catch (e) { /* quadro ilegível */ }
      setTimeout(() => requestAnimationFrame(loop), 180);
    };
    loop();
  });
  window.addEventListener("pagehide", () => { if (stream) stream.getTracks().forEach((t) => t.stop()); stream = null; });

  preencherEventos();
})();
