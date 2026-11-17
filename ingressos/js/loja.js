/* T Ingressos – loja (vitrine, evento, carrinho, checkout e ingressos) */
(function () {
  const T = window.TIX;
  const app = document.getElementById("app");
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const MAX_POR_LINHA = 10, MAX_MESAS = 4;
  const ICON = {
    cal: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 16H5V9h14Z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5.3 7 13 7 13s7-7.7 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 14.5 9 2.5 2.5 0 0 1 12 11.5Z"/></svg>',
    age: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm1 15h-2v-6h2Zm0-8h-2V7h2Z"/></svg>',
    pix: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 4.2 4.2-2.1 2.1L12 6.2 9.9 8.3 7.8 6.2Zm-5.8 5.8 2.1 2.1L6.2 12l2.1 2.1-2.1 2.1L2 12Zm11.6 0L22 12l-4.2 4.2-2.1-2.1 2.1-2.1-2.1-2.1ZM12 13.4 10.6 12 12 10.6 13.4 12ZM9.9 15.7 12 17.8l2.1-2.1 2.1 2.1L12 22l-4.2-4.2Z"/></svg>',
    card: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 14H4v-6h16Zm0-10H4V6h16Z"/></svg>',
    ok: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m9 16.2-4.2-4.2-1.4 1.4L9 19 21 7l-1.4-1.4Z"/></svg>',
  };

  /* ---------- carrinho (por aba) ---------- */
  const CARRINHO = "tix-carrinho", MEUS = "tix-meus-pedidos";
  const ler = (store, k, padrao) => { try { return JSON.parse(store.getItem(k)) ?? padrao; } catch (e) { return padrao; } };
  const gravar = (store, k, v) => { try { store.setItem(k, JSON.stringify(v)); } catch (e) {} };
  let carrinho = ler(sessionStorage, CARRINHO, { eventoId: null, itens: [] });
  const salvarCarrinho = () => gravar(sessionStorage, CARRINHO, carrinho);
  function carrinhoDo(eventoId) {
    if (carrinho.eventoId !== eventoId) carrinho = { eventoId, itens: [] };
    return carrinho;
  }
  const meusPedidos = () => ler(localStorage, MEUS, []);
  const guardarMeu = (id) => { const l = meusPedidos(); if (!l.includes(id)) { l.unshift(id); gravar(localStorage, MEUS, l); } };

  /* ---------- roteador ---------- */
  function rota() {
    const [, pagina, id] = (location.hash || "#/").split("/");
    clearInterval(window.__tixTimer);
    $$(".tix-top__nav a").forEach((a) => a.classList.toggle("is-current", a.dataset.nav === (pagina === "meus" ? "meus" : !pagina ? "eventos" : "")));
    if (!pagina) return vitrine();
    if (pagina === "evento") return paginaEvento(decodeURIComponent(id || ""));
    if (pagina === "checkout") return checkout();
    if (pagina === "pedido") return paginaPedido(id);
    if (pagina === "meus") return meus();
    vitrine();
  }
  function render(html, titulo) {
    app.innerHTML = html;
    document.title = (titulo ? titulo + " – " : "") + "Ingressos T Entretenimento";
    window.scrollTo({ top: 0 });
  }
  window.addEventListener("hashchange", rota);
  // outra aba mudou os dados: atualiza só telas sem formulário em andamento
  window.addEventListener("tix:mudou", () => { if (!/^#\/(checkout)/.test(location.hash)) rota(); });

  /* ---------- vitrine ---------- */
  function precoMinimo(ev) {
    const p = ev.setores.map((s) => (s.meia ? s.preco / 2 : s.preco));
    if (ev.mesas) p.push(Math.min(...ev.mesas.categorias.map((c) => c.preco)));
    return Math.min(...p);
  }
  function selo(ev) {
    const cap = T.capacidade(ev), vend = T.estatisticas(ev.id).ingressos;
    const dias = Math.ceil((new Date(ev.data) - Date.now()) / 864e5);
    if (vend / cap > 0.7) return '<span class="tix-badge tix-badge--hot">Últimos ingressos</span>';
    if (dias <= 14) return '<span class="tix-badge tix-badge--warn">Falta pouco</span>';
    return `<span class="tix-badge">${esc(ev.setores[0].lote)}</span>`;
  }
  function cardEvento(ev) {
    const d = new Date(ev.data);
    return `
      <a class="tix-card tix-event" href="#/evento/${encodeURIComponent(ev.id)}">
        <div class="tix-event__img" style="background:${ev.cor}">
          <div class="tix-date"><b>${String(d.getDate()).padStart(2, "0")}</b><small>${d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}</small></div>
          <strong>${esc(ev.nome)}</strong>
        </div>
        <div class="tix-event__body">
          <h2>${esc(ev.nome)}</h2>
          <p>${esc(ev.atracao)}</p>
          <p>${esc(ev.local)} · ${esc(ev.cidade)}/${esc(ev.uf)} · ${T.hora(ev.data)}</p>
          <div class="tix-event__foot">
            <span class="tix-from">a partir de<b>${T.brl(precoMinimo(ev))}</b></span>
            ${selo(ev)}
          </div>
        </div>
      </a>`;
  }
  function vitrine() {
    const lista = T.eventos().filter((e) => new Date(e.data) > Date.now());
    render(`
      <h1 class="tix-h">Ingressos à venda</h1>
      <p class="tix-sub">Escolha o evento, o setor ou a sua mesa e receba os ingressos com QR code na hora.</p>
      ${lista.length ? `<div class="tix-grid">${lista.map(cardEvento).join("")}</div>` : '<div class="tix-card tix-empty">Nenhum evento à venda no momento.</div>'}
    `);
  }

  /* ---------- evento ---------- */
  let abaEvento = "setores";
  function paginaEvento(id) {
    const ev = T.evento(id);
    if (!ev) return render('<div class="tix-card tix-empty">Evento não encontrado. <a href="#/">Ver eventos</a></div>');
    const c = carrinhoDo(ev.id);
    if (!ev.mesas) abaEvento = "setores";
    render(`
      <a class="tix-back" href="#/">← Todos os eventos</a>
      <section class="tix-hero" style="background:${ev.cor}">
        <span class="tag" style="--tag:rgba(0,0,0,.35)">${esc(ev.atracao)}</span>
        <h1>${esc(ev.nome)}</h1>
        <p>${esc(ev.descricao)}</p>
        <div class="tix-hero__meta">
          <span>${ICON.cal}${esc(T.dataLonga(ev.data))} · ${T.hora(ev.data)}</span>
          <span>${ICON.pin}${esc(ev.local)} · ${esc(ev.cidade)}/${esc(ev.uf)}</span>
          <span>${ICON.age}${esc(ev.classificacao)}</span>
        </div>
      </section>
      <div class="tix-layout">
        <div>
          ${ev.mesas ? `
          <div class="tix-tabs" role="tablist">
            <button role="tab" data-aba="setores" aria-selected="${abaEvento === "setores"}">Setores</button>
            <button role="tab" data-aba="mesas" aria-selected="${abaEvento === "mesas"}">Mapa de mesas</button>
          </div>` : ""}
          <div id="aba"></div>
        </div>
        <aside class="tix-card tix-summary" id="resumo" aria-live="polite"></aside>
      </div>`, ev.nome);

    const desenharAba = () => { $("#aba").innerHTML = abaEvento === "mesas" ? mapaMesas(ev, c) : setores(ev, c); };
    desenharAba(); desenharResumo(ev, c);

    $$(".tix-tabs button").forEach((b) => b.addEventListener("click", () => {
      abaEvento = b.dataset.aba;
      $$(".tix-tabs button").forEach((x) => x.setAttribute("aria-selected", String(x === b)));
      desenharAba();
    }));
    $("#aba").addEventListener("click", (e) => {
      const q = e.target.closest("[data-qtd]");
      if (q) {
        const [setorId, meia, delta] = q.dataset.qtd.split("|");
        mudarQtd(ev, c, setorId, meia === "1", +delta);
        desenharAba(); desenharResumo(ev, c); return;
      }
      const m = e.target.closest("[data-mesa]");
      if (m) {
        const i = c.itens.findIndex((x) => x.tipo === "mesa" && x.mesaId === m.dataset.mesa);
        if (i >= 0) c.itens.splice(i, 1);
        else if (c.itens.filter((x) => x.tipo === "mesa").length >= MAX_MESAS) { alert(`Você pode reservar até ${MAX_MESAS} mesas por compra.`); return; }
        else c.itens.push({ tipo: "mesa", mesaId: m.dataset.mesa });
        salvarCarrinho(); desenharAba(); desenharResumo(ev, c); return;
      }
      const ir = e.target.closest("[data-ir-setores]");
      if (ir) { abaEvento = "setores"; $$(".tix-tabs button").forEach((x) => x.setAttribute("aria-selected", String(x.dataset.aba === "setores"))); desenharAba(); }
    });
    $("#resumo").addEventListener("click", (e) => {
      const r = e.target.closest("[data-remover]");
      if (r) { c.itens.splice(+r.dataset.remover, 1); salvarCarrinho(); desenharAba(); desenharResumo(ev, c); }
    });
  }
  function qtdNoCarrinho(c, setorId, meia) {
    const it = c.itens.find((x) => x.tipo === "setor" && x.setorId === setorId && !!x.meia === meia);
    return it ? it.qtd : 0;
  }
  function mudarQtd(ev, c, setorId, meia, delta) {
    let it = c.itens.find((x) => x.tipo === "setor" && x.setorId === setorId && !!x.meia === meia);
    const disp = T.disponivelSetor(ev, setorId) - c.itens.filter((x) => x.tipo === "setor" && x.setorId === setorId && x !== it).reduce((s, x) => s + x.qtd, 0);
    const nova = Math.max(0, Math.min((it ? it.qtd : 0) + delta, MAX_POR_LINHA, disp));
    if (!it && nova > 0) { it = { tipo: "setor", setorId, meia, qtd: 0 }; c.itens.push(it); }
    if (it) { it.qtd = nova; if (!nova) c.itens.splice(c.itens.indexOf(it), 1); }
    salvarCarrinho();
  }
  function setores(ev, c) {
    return ev.setores.map((s) => {
      const disp = T.disponivelSetor(ev, s.id);
      const linha = (meia) => {
        const q = qtdNoCarrinho(c, s.id, meia), preco = meia ? s.preco / 2 : s.preco;
        return `
          <div class="tix-row">
            <div class="tix-row__label"><b>${meia ? "Meia-entrada" : "Inteira"} · ${T.brl(preco)}</b>
              <small>${meia ? "Estudantes, idosos e PCD, com documento na entrada" : `+ ${T.brl(preco * T.TAXA)} de taxa`}</small></div>
            <div class="tix-qty">
              <button type="button" data-qtd="${s.id}|${meia ? 1 : 0}|-1" aria-label="Menos ${meia ? "meia" : "inteira"} ${esc(s.nome)}" ${q ? "" : "disabled"}>−</button>
              <output aria-label="Quantidade">${q}</output>
              <button type="button" data-qtd="${s.id}|${meia ? 1 : 0}|1" aria-label="Mais ${meia ? "meia" : "inteira"} ${esc(s.nome)}" ${disp ? "" : "disabled"}>+</button>
            </div>
          </div>`;
      };
      return `
        <div class="tix-card tix-sector">
          <div class="tix-sector__head">
            <h3>${esc(s.nome)}</h3>
            ${disp ? `<span class="tix-badge${disp < s.capacidade * 0.15 ? " tix-badge--hot" : ""}">${esc(s.lote)}${disp < s.capacidade * 0.15 ? " · últimos" : ""}</span>` : '<span class="tix-badge tix-badge--bad">Esgotado</span>'}
          </div>
          ${linha(false)}${s.meia ? linha(true) : ""}
        </div>`;
    }).join("");
  }
  function mapaMesas(ev, c) {
    const ocupadas = T.mesasOcupadas(ev.id);
    const minhas = new Set(c.itens.filter((x) => x.tipo === "mesa").map((x) => x.mesaId));
    const cat = Object.fromEntries(ev.mesas.categorias.map((k) => [k.id, k]));
    let grid = "";
    "ABCDEF".split("").forEach((fila) => {
      grid += `<span class="tix-map__row">${fila}</span>`;
      ev.mesas.lista.filter((m) => m.fila === fila).forEach((m) => {
        const k = cat[m.categoria], ocup = ocupadas.has(m.id) && !minhas.has(m.id);
        grid += `<button type="button" class="tix-seat" style="--cat:${k.cor}" data-mesa="${m.id}" aria-pressed="${minhas.has(m.id)}" ${ocup ? "disabled" : ""}
          aria-label="${k.nome} ${m.id}, ${T.brl(k.preco)}${ocup ? ", ocupada" : ""}" title="${k.nome} ${m.id} · ${T.brl(k.preco)}">${m.numero}</button>`;
      });
    });
    const livres = ev.mesas.lista.length - ocupadas.size;
    return `
      <div class="tix-card tix-map">
        <h2 class="tix-section-title">Escolha sua mesa <small style="text-transform:none;color:var(--muted);font-weight:500">· ${livres} livres · 4 lugares cada</small></h2>
        <div class="tix-map__stage">PALCO</div>
        <div class="tix-map__grid">${grid}</div>
        <div class="tix-map__areas">
          <div style="background:#25d36633;color:#1b7a3d;cursor:pointer" data-ir-setores>VIP</div>
          <div style="background:#2b1a29;color:#fff">BAR</div>
          <div style="background:#2bb8c933;color:#16707b;cursor:pointer" data-ir-setores>PISTA</div>
        </div>
        <div class="tix-legend">
          ${ev.mesas.categorias.map((k) => `<span><i style="background:${k.cor}"></i>${k.nome} · ${T.brl(k.preco)}</span>`).join("")}
          <span><i style="background:var(--purple);box-shadow:0 0 0 2px var(--coral)"></i>Sua seleção</span>
          <span><i style="background:#d9d3d8"></i>Ocupada</span>
        </div>
      </div>`;
  }
  function desenharResumo(ev, c) {
    const box = $("#resumo");
    if (!c.itens.length) {
      box.innerHTML = `<h3>Seu pedido</h3><p class="tix-note" style="font-size:14px;margin:0">Escolha ${ev.mesas ? "uma mesa no mapa ou " : ""}a quantidade de ingressos.</p>`;
      return;
    }
    const r = T.resumo(ev, c.itens);
    box.innerHTML = `
      <h3>Seu pedido</h3>
      <ul>${r.linhas.map((l, i) => `<li><span>${l.tipo === "setor" ? `${l.qtd}× ` : ""}${esc(l.rotulo)}</span><span>${T.brl(l.total)} <button type="button" data-remover="${i}" aria-label="Remover ${esc(l.rotulo)}">×</button></span></li>`).join("")}</ul>
      <div class="tix-totals">
        <div><span>Subtotal (${r.qtdIngressos} ingresso${r.qtdIngressos > 1 ? "s" : ""})</span><span>${T.brl(r.subtotal)}</span></div>
        <div><span>Taxa de conveniência</span><span>${T.brl(r.taxa)}</span></div>
        <div class="tix-total"><span>Total</span><span>${T.brl(r.total)}</span></div>
      </div>
      <a class="btn btn--coral btn--lg tix-btn-block" href="#/checkout">Continuar</a>
      <p class="tix-note">Mesas ficam reservadas por 15 minutos enquanto você paga.</p>`;
  }

  /* ---------- checkout ---------- */
  let pedidoAtual = null;
  function checkout() {
    const ev = carrinho.eventoId && T.evento(carrinho.eventoId);
    if (!ev || !carrinho.itens.length) return render('<div class="tix-card tix-empty">Seu carrinho está vazio. <a href="#/">Escolher evento</a></div>');
    const r = T.resumo(ev, carrinho.itens);
    const salvo = ler(localStorage, "tix-comprador", {});
    render(`
      <a class="tix-back" href="#/evento/${encodeURIComponent(ev.id)}">← Voltar ao evento</a>
      <h1 class="tix-h">Finalizar compra</h1>
      <p class="tix-sub">${esc(ev.nome)} · ${esc(T.dataLonga(ev.data))} · ${esc(ev.cidade)}/${esc(ev.uf)}</p>
      <div class="tix-layout">
        <div id="etapa">
          <form class="tix-card tix-form" id="dados" novalidate>
            <h2 class="tix-section-title">1. Seus dados</h2>
            <label>Nome completo<input name="nome" autocomplete="name" value="${esc(salvo.nome)}" required></label>
            <div class="tix-2">
              <label>E-mail<input name="email" type="email" autocomplete="email" value="${esc(salvo.email)}" required></label>
              <label>WhatsApp<input name="telefone" type="tel" inputmode="tel" autocomplete="tel" value="${esc(salvo.telefone)}" required></label>
            </div>
            <p class="tix-note" style="margin:0">Os ingressos saem no seu nome e são enviados para este e-mail e WhatsApp.</p>
            <p class="tix-error" id="erroDados" role="alert" hidden></p>
            <button class="btn btn--coral btn--lg" type="submit">Ir para o pagamento</button>
          </form>
        </div>
        <aside class="tix-card tix-summary">
          <h3>Resumo</h3>
          <ul>${r.linhas.map((l) => `<li><span>${l.tipo === "setor" ? `${l.qtd}× ` : ""}${esc(l.rotulo)}</span><span>${T.brl(l.total)}</span></li>`).join("")}</ul>
          <div class="tix-totals">
            <div><span>Subtotal</span><span>${T.brl(r.subtotal)}</span></div>
            <div><span>Taxa de conveniência</span><span>${T.brl(r.taxa)}</span></div>
            <div class="tix-total"><span>Total</span><span>${T.brl(r.total)}</span></div>
          </div>
        </aside>
      </div>`, "Finalizar compra");

    const form = $("#dados"), tel = form.elements.telefone;
    tel.addEventListener("input", () => { tel.value = mascaraTel(tel.value); });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(form));
      Object.keys(d).forEach((k) => (d[k] = String(d[k]).trim()));
      const erros = [];
      if (d.nome.split(/\s+/).length < 2) erros.push(["nome", "nome e sobrenome"]);
      if (!/^\S+@\S+\.\S+$/.test(d.email)) erros.push(["email", "um e-mail válido"]);
      if (d.telefone.replace(/\D/g, "").length < 10) erros.push(["telefone", "um WhatsApp com DDD"]);
      $$("[aria-invalid]", form).forEach((x) => x.removeAttribute("aria-invalid"));
      if (erros.length) {
        erros.forEach(([k]) => form.elements[k].setAttribute("aria-invalid", "true"));
        const el = $("#erroDados"); el.textContent = "Informe " + erros.map((x) => x[1]).join(", ").replace(/, ([^,]*)$/, " e $1") + "."; el.hidden = false;
        form.elements[erros[0][0]].focus(); return;
      }
      gravar(localStorage, "tix-comprador", d);
      try { pedidoAtual = T.criarPedido(ev.id, carrinho.itens, d); }
      catch (err) { const el = $("#erroDados"); el.textContent = err.message; el.hidden = false; return; }
      guardarMeu(pedidoAtual.id);
      pagamento(ev, pedidoAtual);
    });
  }
  function mascaraTel(v) {
    const d = v.replace(/\D/g, "").slice(0, 11);
    return d.length > 10 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : d.length > 6 ? `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}` : d.length > 2 ? `(${d.slice(0, 2)}) ${d.slice(2)}` : d.length ? `(${d}` : "";
  }
  function pagamento(ev, p) {
    let metodo = "pix";
    $("#etapa").innerHTML = `
      <div class="tix-card tix-form">
        <h2 class="tix-section-title">2. Pagamento · ${T.brl(p.total)}</h2>
        <div class="tix-pay" role="group" aria-label="Forma de pagamento">
          <button type="button" data-metodo="pix" aria-pressed="true">${ICON.pix} Pix</button>
          <button type="button" data-metodo="cartao" aria-pressed="false">${ICON.card} Cartão de crédito</button>
        </div>
        <div id="metodo"></div>
      </div>`;
    const desenhar = () => {
      clearInterval(window.__tixTimer);
      $$("[data-metodo]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.metodo === metodo)));
      $("#metodo").innerHTML = metodo === "pix" ? telaPix(p) : telaCartao(p);
      if (metodo === "pix") ligarPix(p); else ligarCartao(p);
    };
    $$("[data-metodo]").forEach((b) => b.addEventListener("click", () => { metodo = b.dataset.metodo; desenhar(); }));
    desenhar();
    $("#etapa").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function codigoPix(p) {
    return `00020126580014BR.GOV.BCB.PIX0136t-entretenimento-demo5204000053039865406${p.total.toFixed(2)}5802BR5916T ENTRETENIMENTO6012PONTA GROSSA62${String(p.id.length + 4).padStart(2, "0")}05${p.id}6304DEMO`;
  }
  function telaPix(p) {
    const cod = codigoPix(p);
    return `
      <div class="tix-pix">
        <p style="margin:0">Abra o app do seu banco, escolha <b>Pix › Pagar com QR code</b> e aponte para o código.</p>
        <div class="tix-pix__qr" style="width:220px">${TIXQR.svg(cod, 0)}</div>
        <div class="tix-copy"><input readonly value="${esc(cod)}" aria-label="Pix copia e cola"><button type="button" class="btn btn--outline" id="copiar">Copiar</button></div>
        <p style="margin:0">O código expira em <span class="tix-timer" id="timer">15:00</span></p>
        <button type="button" class="btn btn--coral btn--lg tix-btn-block" id="pixPago">Simular pagamento aprovado</button>
        <p class="tix-note" style="margin:0">Protótipo: este Pix não é real. No sistema final, a confirmação chega sozinha pelo banco.</p>
      </div>`;
  }
  function ligarPix(p) {
    let resta = 15 * 60;
    window.__tixTimer = setInterval(() => {
      resta--; const t = $("#timer");
      if (!t) return clearInterval(window.__tixTimer);
      t.textContent = `${String(Math.floor(resta / 60)).padStart(2, "0")}:${String(resta % 60).padStart(2, "0")}`;
      if (resta <= 0) { clearInterval(window.__tixTimer); t.textContent = "expirado"; }
    }, 1000);
    $("#copiar").addEventListener("click", (e) => {
      const inp = e.target.previousElementSibling; inp.select();
      (navigator.clipboard ? navigator.clipboard.writeText(inp.value) : Promise.reject()).then(() => (e.target.textContent = "Copiado!"), () => document.execCommand("copy"));
    });
    $("#pixPago").addEventListener("click", () => concluir(p, { metodo: "pix", parcelas: 1 }));
  }
  function telaCartao(p) {
    const parcelas = [1, 2, 3].map((n) => `<option value="${n}">${n}× de ${T.brl(p.total / n)} sem juros</option>`).join("");
    return `
      <form id="cartao" class="tix-form" style="padding:0;box-shadow:none" novalidate autocomplete="off">
        <label>Número do cartão<input name="numero" inputmode="numeric" placeholder="0000 0000 0000 0000" autocomplete="off" required></label>
        <label>Nome impresso no cartão<input name="titular" autocomplete="off" required></label>
        <div class="tix-2">
          <label>Validade<input name="validade" inputmode="numeric" placeholder="MM/AA" autocomplete="off" required></label>
          <label>CVV<input name="cvv" inputmode="numeric" placeholder="123" maxlength="4" autocomplete="off" required></label>
        </div>
        <label>Parcelas<select name="parcelas">${parcelas}</select></label>
        <p class="tix-error" id="erroCartao" role="alert" hidden></p>
        <button class="btn btn--coral btn--lg tix-btn-block" type="submit">Pagar ${T.brl(p.total)}</button>
        <p class="tix-note" style="margin:0">Protótipo: nenhum dado de cartão é enviado ou guardado. Use dados de teste.</p>
      </form>`;
  }
  function ligarCartao(p) {
    const f = $("#cartao");
    f.elements.numero.addEventListener("input", (e) => { e.target.value = e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 "); });
    f.elements.validade.addEventListener("input", (e) => { const d = e.target.value.replace(/\D/g, "").slice(0, 4); e.target.value = d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d; });
    f.elements.cvv.addEventListener("input", (e) => { e.target.value = e.target.value.replace(/\D/g, ""); });
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const v = Object.fromEntries(new FormData(f));
      const erros = [];
      if (v.numero.replace(/\D/g, "").length < 13) erros.push("numero");
      if (v.titular.trim().length < 3) erros.push("titular");
      const [mm, aa] = v.validade.split("/").map(Number);
      if (!mm || mm > 12 || !aa || new Date(2000 + aa, mm) < new Date()) erros.push("validade");
      if (v.cvv.length < 3) erros.push("cvv");
      $$("[aria-invalid]", f).forEach((x) => x.removeAttribute("aria-invalid"));
      if (erros.length) {
        erros.forEach((k) => f.elements[k].setAttribute("aria-invalid", "true"));
        const el = $("#erroCartao"); el.textContent = "Confira os dados do cartão destacados."; el.hidden = false; f.elements[erros[0]].focus(); return;
      }
      f.innerHTML = '<div class="tix-processing"><span class="tix-spin"></span> Processando pagamento…</div>';
      setTimeout(() => concluir(p, { metodo: "cartao", parcelas: +v.parcelas, final: v.numero.replace(/\D/g, "").slice(-4) }), 1400);
    });
  }
  function concluir(p, pag) {
    clearInterval(window.__tixTimer);
    T.pagar(p.id, pag);
    carrinho = { eventoId: null, itens: [] }; salvarCarrinho();
    location.hash = `#/pedido/${p.id}`;
  }

  /* ---------- ingressos ---------- */
  function paginaPedido(id) {
    const p = T.pedido(id);
    if (!p) return render('<div class="tix-card tix-empty">Pedido não encontrado. <a href="#/meus">Meus ingressos</a></div>');
    const ev = T.evento(p.eventoId);
    const pago = p.status === "pago";
    render(`
      <a class="tix-back" href="#/meus">← Meus ingressos</a>
      ${pago ? `
      <div class="tix-card tix-success">
        <div class="tix-success__icon">${ICON.ok}</div>
        <h1>Compra confirmada!</h1>
        <p>Pedido <b>${esc(p.id)}</b> · ${T.brl(p.total)} no ${p.pagamento.metodo === "pix" ? "Pix" : `cartão${p.pagamento.final ? " final " + esc(p.pagamento.final) : ""} em ${p.pagamento.parcelas}×`}.
        <br>Enviamos os ingressos para <b>${esc(p.comprador.email)}</b>. Apresente o QR code na entrada.</p>
      </div>` : `<div class="tix-card tix-success"><h1>Aguardando pagamento</h1><p>Este pedido ainda não foi pago.</p></div>`}
      <h2 class="tix-section-title">${esc(ev.nome)} · ${esc(T.dataLonga(ev.data))} · ${T.hora(ev.data)}</h2>
      <div class="tix-tickets">
        ${p.ingressos.map((i) => `
          <article class="tix-card tix-ticket">
            <div class="tix-ticket__info">
              <h3>${esc(ev.nome)}</h3>
              <p>${esc(T.dataCurta(ev.data))} · ${T.hora(ev.data)} · ${esc(ev.local)}</p>
              <strong>${esc(i.descricao)}</strong>
              <p>Titular: ${esc(i.titular)}</p>
              ${i.checkin ? `<span class="tix-badge tix-badge--ok" style="justify-self:start">Utilizado ${T.hora(i.checkin)}</span>` : ""}
            </div>
            <div class="tix-ticket__qr">
              ${pago ? `<div class="tix-qr">${TIXQR.svg(i.codigo)}</div>` : '<div class="tix-code">pagamento pendente</div>'}
              <span class="tix-code">${esc(i.codigo)}</span>
            </div>
          </article>`).join("")}
      </div>
      <div class="tix-actions">
        <button type="button" class="btn btn--purple" onclick="window.print()">Imprimir ingressos</button>
        <a class="btn btn--outline" href="#/">Comprar mais</a>
      </div>`, "Seus ingressos");
  }
  function meus() {
    const lista = meusPedidos().map(T.pedido).filter(Boolean);
    render(`
      <h1 class="tix-h">Meus ingressos</h1>
      <p class="tix-sub">Compras feitas neste aparelho.</p>
      ${lista.length ? `<div class="tix-card tix-table-wrap"><table class="tix-table">
        <thead><tr><th>Pedido</th><th>Evento</th><th>Data</th><th>Ingressos</th><th>Total</th><th>Status</th></tr></thead>
        <tbody>${lista.map((p) => { const ev = T.evento(p.eventoId); return `
          <tr><td><a href="#/pedido/${p.id}">${esc(p.id)}</a></td><td>${esc(ev ? ev.nome : "-")}</td><td>${ev ? esc(T.dataCurta(ev.data)) : "-"}</td>
          <td>${p.ingressos.length}</td><td>${T.brl(p.total)}</td>
          <td>${p.status === "pago" ? '<span class="tix-badge tix-badge--ok">Pago</span>' : '<span class="tix-badge tix-badge--warn">Pendente</span>'}</td></tr>`; }).join("")}
        </tbody></table></div>` : '<div class="tix-card tix-empty">Você ainda não comprou ingressos por aqui. <a href="#/">Ver eventos</a></div>'}`, "Meus ingressos");
  }

  /* ---------- início ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
  $$(".js-whatsapp").forEach((a) => (a.href = "https://wa.me/5542984079999?text=" + encodeURIComponent("Olá, T Entretenimento! Tenho uma dúvida sobre ingressos.")));
  rota();
})();
