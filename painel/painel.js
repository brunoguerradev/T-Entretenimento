/* T Ingressos – painel do produtor (protótipo) */
(function () {
  const T = window.TIX;
  const app = document.getElementById("app");
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const num = (n) => n.toLocaleString("pt-BR");
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

  function rota() {
    const [, pagina, id] = (location.hash || "#/").split("/");
    $$(".tix-top__nav a[data-nav]").forEach((a) => a.classList.toggle("is-current", a.dataset.nav === (pagina || "geral") || (pagina === "evento" && a.dataset.nav === "eventos")));
    if (pagina === "eventos") return listaEventos();
    if (pagina === "evento") return detalheEvento(decodeURIComponent(id || ""));
    if (pagina === "novo") return formEvento();
    if (pagina === "editar") return formEvento(decodeURIComponent(id || ""));
    visaoGeral();
  }
  const render = (html) => { app.innerHTML = html; window.scrollTo({ top: 0 }); };
  window.addEventListener("hashchange", rota);
  window.addEventListener("tix:mudou", () => { if (!/^#\/(novo|editar)/.test(location.hash)) rota(); });

  /* ---------- componentes ---------- */
  const kpis = (s, cap) => `
    <div class="tix-kpis">
      <div class="tix-card tix-kpi" style="--accent:var(--coral)"><small>Receita de ingressos</small><b>${T.brl(s.receita)}</b></div>
      <div class="tix-card tix-kpi" style="--accent:var(--c-teal)"><small>Ingressos vendidos</small><b>${num(s.ingressos)}${cap ? ` <small style="font-size:14px">/ ${num(cap)}</small>` : ""}</b></div>
      <div class="tix-card tix-kpi" style="--accent:var(--c-yellow)"><small>Pedidos · ticket médio</small><b>${num(s.pedidos)} · ${T.brl(s.ticketMedio)}</b></div>
      <div class="tix-card tix-kpi" style="--accent:var(--c-green)"><small>Check-ins na portaria</small><b>${num(s.checkins)}</b></div>
    </div>`;
  function grafico(eventoId) {
    const dias = T.vendasPorDia(14, eventoId), max = Math.max(1, ...dias.map((d) => d.valor));
    return `<div class="tix-bars">${dias.map((d) => `
      <div><span style="height:${Math.max(1, (d.valor / max) * 100)}%" data-v="${T.brl(d.valor)}"></span><small>${d.dia.slice(8)}/${d.dia.slice(5, 7)}</small></div>`).join("")}</div>`;
  }
  function ocupacao(ev) {
    const linhas = ev.setores.map((s) => ({ nome: s.nome, v: T.vendidosSetor(ev.id, s.id), c: s.capacidade }));
    if (ev.mesas) linhas.push({ nome: "Mesas", v: T.mesasOcupadas(ev.id).size, c: ev.mesas.lista.length });
    return linhas.map((l) => `
      <div><div><span>${esc(l.nome)}</span><span><b>${num(l.v)}</b> / ${num(l.c)} · ${pct(l.v, l.c)}%</span></div>
      <div class="tix-progress"><i style="width:${pct(l.v, l.c)}%"></i></div></div>`).join("");
  }

  /* ---------- visão geral ---------- */
  function visaoGeral() {
    const evs = T.eventos();
    render(`
      <h1 class="tix-h">Visão geral</h1>
      <p class="tix-sub">Todas as vendas pagas, de todos os eventos.</p>
      ${kpis(T.estatisticas())}
      <div class="tix-panel-grid">
        <section class="tix-card tix-box"><h2>Vendas dos últimos 14 dias</h2>${grafico()}</section>
        <section class="tix-card tix-box"><h2>Ocupação por evento</h2>
          <div class="tix-occ">${evs.map((ev) => { const s = T.estatisticas(ev.id), cap = T.capacidade(ev); return `
            <div><div><a href="#/evento/${encodeURIComponent(ev.id)}" style="color:var(--purple);font-weight:700">${esc(ev.nome)}</a><span>${pct(s.ingressos, cap)}%</span></div>
            <div class="tix-progress"><i style="width:${pct(s.ingressos, cap)}%"></i></div></div>`; }).join("")}</div>
        </section>
      </div>
      <section class="tix-card tix-box"><h2>Últimas vendas</h2>${tabelaPedidos(T.pedidos().filter((p) => p.status === "pago").sort((a, b) => new Date(b.pagoEm) - new Date(a.pagoEm)).slice(0, 8), true)}</section>`);
  }
  function tabelaPedidos(lista, comEvento) {
    if (!lista.length) return '<p class="tix-note">Nenhuma venda encontrada.</p>';
    return `<div class="tix-table-wrap"><table class="tix-table">
      <thead><tr><th>Pedido</th><th>Comprador</th>${comEvento ? "<th>Evento</th>" : ""}<th>Itens</th><th>Pagamento</th><th>Valor</th><th>Data</th><th>Check-in</th></tr></thead>
      <tbody>${lista.map((p) => { const ev = T.evento(p.eventoId); const ent = p.ingressos.filter((i) => i.checkin).length; return `
        <tr><td><a href="../ingressos/#/pedido/${p.id}" target="_blank" rel="noopener">${esc(p.id)}</a></td>
        <td>${esc(p.comprador.nome)}<br><small style="color:var(--muted)">${esc(p.comprador.email)}</small></td>
        ${comEvento ? `<td>${esc(ev ? ev.nome : "-")}</td>` : ""}
        <td>${p.ingressos.length} ingresso${p.ingressos.length > 1 ? "s" : ""}<br><small style="color:var(--muted)">${esc([...new Set(p.ingressos.map((i) => i.descricao.replace(/ · lugar \d+$/, "")))].join(", "))}</small></td>
        <td>${p.status !== "pago" ? '<span class="tix-badge tix-badge--warn">Pendente</span>' : p.pagamento.metodo === "pix" ? "Pix" : `Cartão ${p.pagamento.parcelas}×`}</td>
        <td>${T.brl(p.subtotal)}</td><td>${new Date(p.pagoEm || p.criadoEm).toLocaleDateString("pt-BR")}</td>
        <td>${ent ? `<span class="tix-badge tix-badge--ok">${ent}/${p.ingressos.length}</span>` : "-"}</td></tr>`; }).join("")}</tbody></table></div>`;
  }

  /* ---------- eventos ---------- */
  function listaEventos() {
    render(`
      <div class="tix-toolbar"><div><h1 class="tix-h">Eventos</h1><p class="tix-sub" style="margin:0">Clique em um evento para ver vendas, ocupação e compradores.</p></div>
      <a class="btn btn--coral" href="#/novo">+ Novo evento</a></div>
      <div class="tix-card tix-table-wrap"><table class="tix-table">
        <thead><tr><th>Evento</th><th>Data</th><th>Local</th><th>Vendidos</th><th>Ocupação</th><th>Receita</th><th></th></tr></thead>
        <tbody>${T.eventos().map((ev) => { const s = T.estatisticas(ev.id), cap = T.capacidade(ev), passado = new Date(ev.data) < Date.now(); return `
          <tr><td><a href="#/evento/${encodeURIComponent(ev.id)}">${esc(ev.nome)}</a>${passado ? ' <span class="tix-badge">Encerrado</span>' : ""}</td>
          <td>${new Date(ev.data).toLocaleDateString("pt-BR")} ${T.hora(ev.data)}</td><td>${esc(ev.local)} · ${esc(ev.cidade)}/${esc(ev.uf)}</td>
          <td>${num(s.ingressos)} / ${num(cap)}</td><td style="min-width:120px"><div class="tix-progress"><i style="width:${pct(s.ingressos, cap)}%"></i></div></td>
          <td>${T.brl(s.receita)}</td><td><a href="#/editar/${encodeURIComponent(ev.id)}">Editar</a></td></tr>`; }).join("")}</tbody></table></div>`);
  }
  function detalheEvento(id) {
    const ev = T.evento(id);
    if (!ev) return render('<div class="tix-card tix-empty">Evento não encontrado. <a href="#/eventos">Voltar</a></div>');
    const s = T.estatisticas(ev.id);
    const pedidos = T.pedidos().filter((p) => p.eventoId === ev.id).sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
    render(`
      <a class="tix-back" href="#/eventos">← Eventos</a>
      <div class="tix-toolbar"><div><h1 class="tix-h">${esc(ev.nome)}</h1>
        <p class="tix-sub" style="margin:0">${esc(T.dataLonga(ev.data))} · ${T.hora(ev.data)} · ${esc(ev.local)}, ${esc(ev.cidade)}/${esc(ev.uf)}</p></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn btn--outline" href="../ingressos/#/evento/${encodeURIComponent(ev.id)}" target="_blank" rel="noopener">Ver na loja</a>
        <a class="btn btn--outline" href="#/editar/${encodeURIComponent(ev.id)}">Editar</a>
        <a class="btn btn--purple" href="../portaria/#${encodeURIComponent(ev.id)}">Abrir portaria</a></div></div>
      ${kpis(s, T.capacidade(ev))}
      <div class="tix-panel-grid">
        <section class="tix-card tix-box"><h2>Vendas dos últimos 14 dias</h2>${grafico(ev.id)}</section>
        <section class="tix-card tix-box"><h2>Ocupação</h2><div class="tix-occ">${ocupacao(ev)}</div></section>
      </div>
      <section class="tix-card tix-box">
        <div class="tix-toolbar"><h2 style="margin:0">Compradores (${pedidos.length})</h2>
          <div style="display:flex;gap:8px;flex-wrap:wrap"><input type="search" id="busca" placeholder="Buscar nome, e-mail ou código" aria-label="Buscar comprador">
          <button class="btn btn--outline" type="button" id="csv">Exportar CSV</button></div></div>
        <div id="tabela">${tabelaPedidos(pedidos)}</div>
      </section>`);
    $("#busca").addEventListener("input", (e) => {
      const q = e.target.value.trim().toLowerCase();
      const f = pedidos.filter((p) => !q || [p.id, p.comprador.nome, p.comprador.email, ...p.ingressos.map((i) => i.codigo)].join(" ").toLowerCase().includes(q));
      $("#tabela").innerHTML = tabelaPedidos(f);
    });
    $("#csv").addEventListener("click", () => {
      const linhas = [["pedido", "status", "comprador", "email", "whatsapp", "ingresso", "descricao", "valor_pedido", "checkin"]];
      pedidos.forEach((p) => p.ingressos.forEach((i) => linhas.push([p.id, p.status, p.comprador.nome, p.comprador.email, p.comprador.telefone, i.codigo, i.descricao, p.subtotal.toFixed(2).replace(".", ","), i.checkin || ""])));
      const csv = "﻿" + linhas.map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      a.download = `compradores-${ev.id}.csv`; a.click(); URL.revokeObjectURL(a.href);
    });
  }

  /* ---------- novo / editar evento ---------- */
  function linhaSetor(s = { nome: "", preco: "", capacidade: "", meia: true }) {
    return `<div class="tix-srow">
      <label>Setor<input name="s_nome" value="${esc(s.nome)}" placeholder="Pista, VIP, Camarote…" required></label>
      <label>Preço (R$)<input name="s_preco" type="number" min="0" step="0.01" value="${esc(s.preco)}" required></label>
      <label>Capacidade<input name="s_cap" type="number" min="1" step="1" value="${esc(s.capacidade)}" required></label>
      <label class="tix-check"><input name="s_meia" type="checkbox" ${s.meia ? "checked" : ""}> Meia</label>
      <button type="button" class="btn btn--outline" data-remover-setor aria-label="Remover setor">×</button>
    </div>`;
  }
  function formEvento(id) {
    const ev = id ? T.evento(id) : null;
    if (id && !ev) return render('<div class="tix-card tix-empty">Evento não encontrado.</div>');
    const d = ev ? new Date(ev.data) : null;
    const dataVal = d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` : "";
    const horaVal = d ? T.hora(ev.data) : "21:00";
    const precos = ev && ev.mesas ? Object.fromEntries(ev.mesas.categorias.map((c) => [c.id, c.preco])) : { ouro: 1200, prata: 960, bronze: 720 };
    const cores = ["linear-gradient(135deg,#fe5e61,#5d2557)", "linear-gradient(135deg,#2bb8c9,#2a4d8f)", "linear-gradient(135deg,#f9d423,#f7941d)", "linear-gradient(135deg,#8e3bb0,#fe5e61)", "linear-gradient(135deg,#43c46b,#2bb8c9)"];
    const temVendas = ev && T.estatisticas(ev.id).ingressos > 0;
    render(`
      <a class="tix-back" href="#/eventos">← Eventos</a>
      <h1 class="tix-h">${ev ? "Editar evento" : "Novo evento"}</h1>
      <p class="tix-sub">${ev ? "As mudanças aparecem na loja na hora." : "Depois de salvar, o evento já aparece na loja de ingressos."}</p>
      <form class="tix-card tix-form" id="formEvento" novalidate>
        <div class="tix-2">
          <label>Nome do evento<input name="nome" value="${esc(ev?.nome)}" required></label>
          <label>Atração / chamada<input name="atracao" value="${esc(ev?.atracao)}" placeholder="Ex.: Show sertanejo com banda completa"></label>
        </div>
        <div class="tix-2">
          <label>Data<input name="data" type="date" value="${dataVal}" required></label>
          <label>Horário<input name="hora" type="time" value="${horaVal}" required></label>
        </div>
        <div class="tix-2">
          <label>Local<input name="local" value="${esc(ev?.local)}" required></label>
          <div class="tix-2"><label>Cidade<input name="cidade" value="${esc(ev?.cidade || "Ponta Grossa")}" required></label>
          <label>UF<input name="uf" value="${esc(ev?.uf || "PR")}" maxlength="2" required></label></div>
        </div>
        <label>Descrição<input name="descricao" value="${esc(ev?.descricao)}" placeholder="O que o público precisa saber"></label>
        <div class="tix-2">
          <label>Classificação<select name="classificacao">${["Livre", "14 anos", "16 anos", "18 anos"].map((c) => `<option ${ev?.classificacao === c ? "selected" : ""}>${c}</option>`).join("")}</select></label>
          <label>Cor do card<select name="cor">${cores.map((c, i) => `<option value="${c}" ${ev?.cor === c ? "selected" : ""}>${["Coral e roxo", "Turquesa e azul", "Amarelo e laranja", "Violeta e coral", "Verde e turquesa"][i]}</option>`).join("")}</select></label>
        </div>
        <h2 class="tix-section-title" style="margin-top:8px">Setores e preços</h2>
        <div class="tix-sector-rows" id="setores">${(ev ? ev.setores : [{ nome: "Pista", preco: 80, capacidade: 500, meia: true }]).map(linhaSetor).join("")}</div>
        <button type="button" class="btn btn--outline" id="addSetor" style="justify-self:start">+ Adicionar setor</button>
        <label class="tix-check"><input type="checkbox" name="temMesas" ${ev?.mesas ? "checked" : ""} ${temVendas && ev?.mesas ? "disabled" : ""}> Vender mesas no mapa (60 mesas de 4 lugares: Ouro, Prata e Bronze)</label>
        <div class="tix-2" id="precosMesas" style="grid-template-columns:repeat(3,1fr)" ${ev?.mesas ? "" : "hidden"}>
          <label>Mesa Ouro (R$)<input name="m_ouro" type="number" min="0" value="${precos.ouro}"></label>
          <label>Mesa Prata (R$)<input name="m_prata" type="number" min="0" value="${precos.prata}"></label>
          <label>Mesa Bronze (R$)<input name="m_bronze" type="number" min="0" value="${precos.bronze}"></label>
        </div>
        <p class="tix-error" id="erroEvento" role="alert" hidden></p>
        <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn--coral btn--lg" type="submit">${ev ? "Salvar alterações" : "Publicar evento"}</button>
        <a class="btn btn--outline btn--lg" href="#/eventos">Cancelar</a></div>
      </form>`);

    const form = $("#formEvento");
    $("#addSetor").addEventListener("click", () => $("#setores").insertAdjacentHTML("beforeend", linhaSetor()));
    $("#setores").addEventListener("click", (e) => { if (e.target.closest("[data-remover-setor]") && $$(".tix-srow").length > 1) e.target.closest(".tix-srow").remove(); });
    form.elements.temMesas.addEventListener("change", (e) => ($("#precosMesas").hidden = !e.target.checked));
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const f = form.elements, erro = $("#erroEvento");
      const obrig = ["nome", "data", "hora", "local", "cidade", "uf"].filter((k) => !String(f[k].value).trim());
      $$("[aria-invalid]", form).forEach((x) => x.removeAttribute("aria-invalid"));
      const setores = $$(".tix-srow").map((r, i) => {
        const nome = $("[name=s_nome]", r).value.trim(), preco = parseFloat($("[name=s_preco]", r).value), cap = parseInt($("[name=s_cap]", r).value, 10);
        if (!nome) $("[name=s_nome]", r).setAttribute("aria-invalid", "true");
        if (!(preco >= 0)) $("[name=s_preco]", r).setAttribute("aria-invalid", "true");
        if (!(cap > 0)) $("[name=s_cap]", r).setAttribute("aria-invalid", "true");
        const antigo = ev && ev.setores[i];
        const sid = antigo ? antigo.id : nome.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + i;
        return { id: sid, nome, preco, capacidade: cap, meia: $("[name=s_meia]", r).checked, lote: antigo ? antigo.lote : "1º lote" };
      });
      obrig.forEach((k) => f[k].setAttribute("aria-invalid", "true"));
      if (obrig.length || $("[aria-invalid]", form)) { erro.textContent = "Preencha os campos destacados."; erro.hidden = false; return; }
      const [h, m] = f.hora.value.split(":").map(Number);
      const [Y, M, D] = f.data.value.split("-").map(Number);
      const dt = new Date(Y, M - 1, D, h, m);
      const novo = {
        id: ev ? ev.id : T.slug(f.nome.value),
        nome: f.nome.value.trim(), atracao: f.atracao.value.trim() || "Show ao vivo",
        data: dt.toISOString(), cidade: f.cidade.value.trim(), uf: f.uf.value.trim().toUpperCase(), local: f.local.value.trim(),
        descricao: f.descricao.value.trim(), classificacao: f.classificacao.value, cor: f.cor.value, setores,
        mesas: f.temMesas.checked ? (ev && ev.mesas ? { ...ev.mesas, categorias: ev.mesas.categorias.map((c) => ({ ...c, preco: +f["m_" + c.id].value })) } : T.montarMesas({ ouro: +f.m_ouro.value, prata: +f.m_prata.value, bronze: +f.m_bronze.value })) : null,
      };
      T.salvarEvento(novo);
      location.hash = `#/evento/${encodeURIComponent(novo.id)}`;
    });
  }

  /* ---------- início ---------- */
  $("#restaurar").addEventListener("click", (e) => {
    e.preventDefault();
    if (confirm("Apagar as vendas e eventos de teste deste navegador e voltar aos dados de demonstração?")) { T.restaurarDemo(); location.hash = "#/"; rota(); }
  });
  $("#year").textContent = new Date().getFullYear();
  rota();
})();
