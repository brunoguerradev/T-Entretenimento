(function () {
  const S = Object.assign({ artistas: [], agenda: [], eventos: [] }, window.SITE);
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const initials = (n) => n.replace(/&/g, " ").split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  // cores do anel do logo
  const ring = ["#2bb8c9", "#f9d423", "#fe5e61", "#43c46b", "#f7941d", "#8e3bb0"];
  const gradients = [
    "linear-gradient(135deg,#fe5e61,#5d2557)",
    "linear-gradient(135deg,#2bb8c9,#2a4d8f)",
    "linear-gradient(135deg,#f9d423,#f7941d)",
    "linear-gradient(135deg,#8e3bb0,#fe5e61)",
    "linear-gradient(135deg,#43c46b,#2bb8c9)",
    "linear-gradient(135deg,#f7941d,#8e3bb0)",
  ];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Menu mobile + cabeçalho compacto ---------- */
  const header = $(".site-header"), toggle = $(".menu-toggle"), links = $("#mainNav");
  const setMenu = (open) => { toggle.setAttribute("aria-expanded", String(open)); links.classList.toggle("is-open", open); };
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  links.addEventListener("click", (e) => { if (e.target.tagName === "A") setMenu(false); });
  let lastY = scrollY;
  addEventListener("scroll", () => {
    const y = scrollY;
    if (Math.abs(y - lastY) > 8) { header.classList.toggle("is-compact", y > lastY && y > 200); lastY = y; }
  }, { passive: true });

  /* ---------- Banner ---------- */
  // Cada aba tem uma barra de progresso (CSS). Quando ela termina, passa para o próximo slide.
  // Com o mouse ou o foco no banner a barra pausa; com "menos movimento" não há troca automática.
  const slides = $$(".slide"), tabs = $$(".hero__tabs button");
  let current = 0;
  function go(i) {
    current = (i + slides.length) % slides.length;
    slides.forEach((s, k) => {
      s.classList.toggle("is-active", k === current);
      s.setAttribute("aria-hidden", String(k !== current));
      s.inert = k !== current;
    });
    tabs.forEach((t, k) => {
      t.setAttribute("aria-selected", String(k === current));
      t.tabIndex = k === current ? 0 : -1;
      t.classList.toggle("is-done", k < current);
      const bar = $(".hero__bar i", t); // reinicia a animação da barra
      bar.style.animation = "none"; void bar.offsetWidth; bar.style.animation = "";
    });
  }
  tabs.forEach((t, k) => {
    t.addEventListener("click", () => go(k));
    $(".hero__bar i", t).addEventListener("animationend", () => { if (k === current) go(current + 1); });
  });
  $(".hero__tabs").addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    go(current + (e.key === "ArrowRight" ? 1 : -1)); tabs[current].focus();
  });
  $(".hero__arrow--prev").addEventListener("click", () => go(current - 1));
  $(".hero__arrow--next").addEventListener("click", () => go(current + 1));
  go(0);

  /* ---------- Artistas ---------- */
  $("#artistTrack").innerHTML = S.artistas.map((a, i) => `
    <button class="card" type="button" data-artist="${esc(a.nome)}" aria-label="Contratar ${esc(a.nome)}">
      <div class="card__img" style="background:${gradients[i % gradients.length]}">
        ${a.foto ? `<img src="${esc(a.foto)}" alt="" loading="lazy">` : `<span class="card__initials">${esc(initials(a.nome))}</span>`}
        ${a.turne ? '<span class="card__badge">Em turnê</span>' : ""}
      </div>
      <div class="card__body"><h3>${esc(a.nome)}</h3><p>${esc(a.estilo)}</p></div>
    </button>`).join("");

  const names = [...new Set(S.artistas.map((a) => a.nome))];
  const selects = [...$$(".js-artist-select"), $("#formArtist")];
  selects.forEach((sel) => names.forEach((n) => sel.add(new Option(n, n))));
  function pickArtist(name) {
    $("#formArtist").value = name;
    $("#contato").scrollIntoView({ behavior: "smooth" });
    setTimeout(() => $('#contactForm [name="nome"]').focus({ preventScroll: true }), 700);
  }
  $("#artistTrack").addEventListener("click", (e) => { const c = e.target.closest(".card"); if (c) pickArtist(c.dataset.artist); });
  $$(".js-artist-select").forEach((sel) => sel.addEventListener("change", () => { if (sel.value) { pickArtist(sel.value); sel.value = ""; } }));

  /* ---------- Eventos (estilo T News) ---------- */
  const fmtDate = (iso) => iso.split("-").reverse().join("/");
  const camera = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3 7.2 5H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.2L15 3Zm3 15a5 5 0 1 1 5-5 5 5 0 0 1-5 5Zm0-2a3 3 0 1 0-3-3 3 3 0 0 0 3 3Z"/></svg>';
  $("#newsTrack").innerHTML = S.eventos.map((n, i) => `
    <a class="news" href="${esc(n.link)}" target="_blank" rel="noopener">
      <div class="news__img" style="background:${gradients[(i + 1) % gradients.length]}">
        ${n.foto ? `<img src="${esc(n.foto)}" alt="" loading="lazy">` : camera}
      </div>
      <time datetime="${esc(n.data)}">${fmtDate(n.data)}</time>
      <h3>${esc(n.titulo)}</h3>
    </a>`).join("");

  /* ---------- Carrosséis (setas + autoplay com pausa) ---------- */
  $$(".carousel").forEach((c) => {
    const track = $(".carousel__track", c);
    // vai direto para a posição exata do card seguinte (scrollBy + encaixe às vezes "voltava" ao card atual)
    const step = () => (track.firstElementChild?.getBoundingClientRect().width || 200) + parseFloat(getComputedStyle(track).columnGap || 20);
    const move = (dir) => {
      const max = track.scrollWidth - track.clientWidth;
      const passo = step(), atual = Math.round(track.scrollLeft / passo);
      let alvo = (atual + dir) * passo;
      if (dir > 0 && track.scrollLeft >= max - 4) alvo = 0;           // no fim, volta ao começo
      else if (dir < 0 && track.scrollLeft <= 4) alvo = max;          // no começo, vai ao fim
      track.scrollTo({ left: Math.min(Math.max(alvo, 0), max), behavior: reduceMotion ? "auto" : "smooth" });
    };
    $(".prev", c).addEventListener("click", () => move(-1));
    $(".next", c).addEventListener("click", () => move(1));
    // sem itens escondidos para rolar, as setas somem
    const conferir = () => c.classList.toggle("is-static", track.scrollWidth <= track.clientWidth + 4);
    new ResizeObserver(conferir).observe(track);
    new MutationObserver(conferir).observe(track, { childList: true });
    const ms = +c.dataset.autoplay;
    if (ms && !reduceMotion) {
      let paused = false;
      ["mouseenter", "focusin", "touchstart"].forEach((ev) => c.addEventListener(ev, () => (paused = true), { passive: true }));
      ["mouseleave", "focusout"].forEach((ev) => c.addEventListener(ev, () => (paused = false)));
      setInterval(() => { if (!paused && !document.hidden) move(1); }, ms);
    }
  });

  /* ---------- Agenda ---------- */
  const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const shows = S.agenda
    .map((s) => ({ ...s, d: new Date(s.data + "T00:00:00") }))
    .filter((s) => s.d >= today)
    .sort((a, b) => a.d - b.d);
  const list = $("#agendaList"), filter = $(".agenda-filter");
  const ufs = ["Todos", ...new Set(shows.map((s) => s.uf))];
  filter.innerHTML = ufs.length > 2 ? ufs.map((u, i) => `<button type="button" aria-pressed="${i === 0}">${u}</button>`).join("") : "";
  filter.addEventListener("click", (e) => {
    if (e.target.tagName !== "BUTTON") return;
    $$("button", filter).forEach((b) => b.setAttribute("aria-pressed", String(b === e.target)));
    renderAgenda(e.target.textContent);
  });
  function renderAgenda(uf) {
    const items = shows.filter((s) => uf === "Todos" || s.uf === uf);
    list.innerHTML = items.length ? items.map((s, i) => `
      <li style="--accent:${ring[i % ring.length]}">
        <div class="agenda__date"><b>${String(s.d.getDate()).padStart(2, "0")}</b><small>${months[s.d.getMonth()]}</small></div>
        <div class="agenda__info">
          <h3>${esc(s.cidade)} – ${esc(s.uf)}${+s.d === +today ? '<span class="agenda__today">HOJE</span>' : ""}</h3>
          <p>${esc(s.artista)} · ${esc(s.local)}</p>
        </div>
        <a class="btn btn--coral" href="#contato">Informações</a>
      </li>`).join("") : '<li class="agenda__empty">Nenhum show agendado no momento.</li>';
  }
  renderAgenda("Todos");

  /* ---------- Formulário ---------- */
  const waLink = (text) => `https://wa.me/${S.whatsapp}?text=${encodeURIComponent(text)}`;
  // Links de WhatsApp do site (topo, rodapé, botão flutuante) com a mensagem inicial.
  $$(".js-whatsapp").forEach((a) => (a.href = waLink(S.mensagemWhatsapp || "")));

  const form = $("#contactForm"), formError = $("#formError"), formOk = $("#formOk");
  const phone = form.elements.telefone;
  // Máscara simples: (42) 98407-9999
  phone.addEventListener("input", () => {
    const d = phone.value.replace(/\D/g, "").slice(0, 11);
    phone.value = d.length > 10 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
      : d.length > 6 ? `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
      : d.length > 2 ? `(${d.slice(0, 2)}) ${d.slice(2)}`
      : d.length ? `(${d}` : "";
  });
  form.addEventListener("input", (e) => { e.target.removeAttribute("aria-invalid"); formError.hidden = true; });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const val = (k) => String(f.get(k) || "").trim();
    const faltando = [];
    if (!val("nome")) faltando.push(["nome", "seu nome"]);
    if (val("telefone").replace(/\D/g, "").length < 10) faltando.push(["telefone", "um WhatsApp com DDD"]);
    if (!val("mensagem")) faltando.push(["mensagem", "uma mensagem sobre o evento"]);
    $$("[aria-invalid]", form).forEach((el) => el.removeAttribute("aria-invalid"));
    if (faltando.length) {
      faltando.forEach(([k]) => form.elements[k].setAttribute("aria-invalid", "true"));
      formError.textContent = `Preencha ${faltando.map(([, t]) => t).join(", ").replace(/, ([^,]*)$/, " e $1")}.`;
      formError.hidden = false;
      formOk.hidden = true;
      form.elements[faltando[0][0]].focus();
      return;
    }
    const data = val("data") && /^\d{4}-\d{2}-\d{2}$/.test(val("data")) ? val("data").split("-").reverse().join("/") : val("data");
    const text = [
      `Olá, T Entretenimento! Vim pelo site.`,
      ``,
      `*Nome:* ${val("nome")}`,
      `*WhatsApp:* ${val("telefone")}`,
      data ? `*Data do evento:* ${data}` : null,
      val("evento") ? `*Cidade/evento:* ${val("evento")}` : null,
      val("artista") ? `*Artista de interesse:* ${val("artista")}` : null,
      ``,
      val("mensagem"),
    ].filter((l) => l !== null).join("\n");
    const url = waLink(text);
    const w = window.open(url, "_blank");
    if (w) w.opener = null; else location.href = url; // pop-up bloqueado: abre na mesma aba
    $("#formOkLink").href = url;
    formError.hidden = true;
    formOk.hidden = false;
    form.reset();
    form.elements.data.type = "text";
  });

  /* ---------- Contadores + revelar ao rolar ---------- */
  const nf = new Intl.NumberFormat("pt-BR");
  const countUp = (el) => {
    const end = +el.dataset.count, suffix = el.dataset.suffix || "", t0 = performance.now();
    const tick = (t) => {
      const p = reduceMotion ? 1 : Math.min((t - t0) / 1400, 1);
      el.textContent = nf.format(Math.round(end * (1 - Math.pow(1 - p, 3)))) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  $$(".section .title, .service, .agenda, .features li, .carousel").forEach((el) => el.classList.add("reveal"));
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (!en.isIntersecting) return;
    en.target.classList.add("is-visible");
    $$("[data-count]", en.target).forEach(countUp);
    io.unobserve(en.target);
  }), { threshold: 0.12 });
  $$(".reveal").forEach((el) => io.observe(el));

  const navLinks = $$(".mainnav__links a");
  const spy = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) navLinks.forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === "#" + en.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  ["empresa", "servicos", "eventos", "agenda", "artistas", "contato"].forEach((id) => spy.observe(document.getElementById(id)));


  /* ── Assinatura Foxes (padrão de todos os projetos) ──────────────── */
  var FOX = '<svg class="foxes-credit-fox" viewBox="6 6 84 86" aria-hidden="true"><path class="foxes-fox-line" pathLength="100" d="M48 32 L64 32 L84 12 L84 50 L48 86 L12 50 L12 12 L32 32 Z" fill="none" stroke="#C8FF3A" stroke-linecap="round" stroke-width="12" stroke-linejoin="round"></path><circle class="foxes-fox-dot" cx="48" cy="59" r="6.5" fill="#FFFFFF"></circle></svg>';
  document.querySelectorAll('[data-foxes]').forEach(function (el) {
    el.outerHTML = '<a href="https://foxes.com.br" target="_blank" rel="noopener" data-state="waiting" class="foxes-credit-link"><small>Desenvolvido por</small>' + FOX + '<b>foxes<span class="foxes-credit-dot">.</span></b><span class="foxes-sr"> (abre em nova aba)</span></a>';
  });
  (function () {
    var links = document.querySelectorAll('.foxes-credit-link[data-state="waiting"]');
    if (!('IntersectionObserver' in window)) { links.forEach(function (l) { l.dataset.state = 'seen'; }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.dataset.state = 'seen'; io.unobserve(e.target); } }); });
    links.forEach(function (l) { io.observe(l); });
  })();

  /* ---------- Ingressos à venda (dados do sistema de ingressos) ---------- */
  const homeTix = $("#homeIngressos");
  if (homeTix && window.TIX) {
    const X = window.TIX;
    const prox = X.eventos().filter((ev) => new Date(ev.data) > Date.now());
    const minimo = (ev) => Math.min(...ev.setores.map((s) => (s.meia ? s.preco / 2 : s.preco)), ...(ev.mesas ? ev.mesas.categorias.map((c) => c.preco) : []));
    homeTix.innerHTML = prox.length ? prox.map((ev) => {
      const d = new Date(ev.data);
      return `
        <a class="tix-card tix-event" href="ingressos/#/evento/${encodeURIComponent(ev.id)}">
          <div class="tix-event__img" style="background:${ev.cor}">
            <div class="tix-date"><b>${String(d.getDate()).padStart(2, "0")}</b><small>${d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}</small></div>
            <strong>${esc(ev.nome)}</strong>
          </div>
          <div class="tix-event__body">
            <h2>${esc(ev.nome)}</h2>
            <p>${esc(ev.local)} · ${esc(ev.cidade)}/${esc(ev.uf)} · ${X.hora(ev.data)}</p>
            <div class="tix-event__foot"><span class="tix-from">a partir de<b>${X.brl(minimo(ev))}</b></span><span class="btn btn--coral btn--sm">Comprar</span></div>
          </div>
        </a>`;
    }).join("") : '<p class="center" style="color:#fff">Em breve, novos eventos com ingressos à venda.</p>';
  }

  $("#year").textContent = new Date().getFullYear();
})();
