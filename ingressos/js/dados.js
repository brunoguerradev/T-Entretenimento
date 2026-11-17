/* ==========================================================================
   T Ingressos – camada de dados do PROTÓTIPO
   Tudo fica no navegador (localStorage), compartilhado entre a loja,
   o painel do produtor e a portaria. Nenhum pagamento é real.
   Para o sistema real, estas funções viram chamadas a uma API.
   ========================================================================== */
(function () {
  const CHAVE = "t-ingressos-v1";
  const TAXA = 0.1; // taxa de conveniência (10%)
  const VERSAO = 2; // mude para recriar os dados de demonstração nos navegadores

  /* ---------- utilidades ---------- */
  const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const hoje = () => new Date();
  const diasDepois = (n, h = 21, m = 0) => {
    const d = hoje(); d.setDate(d.getDate() + n); d.setHours(h, m, 0, 0);
    return d.toISOString();
  };
  const ALFA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const codigo = (n = 4) => Array.from({ length: n }, () => ALFA[Math.floor(Math.random() * ALFA.length)]).join("");
  const novoCodigoIngresso = () => `T-${codigo()}-${codigo()}`;
  // gerador determinístico (para os dados de demonstração serem sempre iguais)
  function rng(seed) { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); }

  /* ---------- mapa de mesas ---------- */
  // Fileiras A–F, 10 mesas cada. A–B Ouro, C–D Prata, E–F Bronze.
  function montarMesas(precos) {
    const cat = { A: "ouro", B: "ouro", C: "prata", D: "prata", E: "bronze", F: "bronze" };
    const mesas = [];
    "ABCDEF".split("").forEach((fila) => {
      for (let i = 1; i <= 10; i++) mesas.push({ id: `${fila}${String(i).padStart(2, "0")}`, fila, numero: i, categoria: cat[fila] });
    });
    return {
      categorias: [
        { id: "ouro", nome: "Mesa Ouro", preco: precos.ouro, lugares: 4, cor: "#f9d423" },
        { id: "prata", nome: "Mesa Prata", preco: precos.prata, lugares: 4, cor: "#c9ccd6" },
        { id: "bronze", nome: "Mesa Bronze", preco: precos.bronze, lugares: 4, cor: "#e0955a" },
      ],
      lista: mesas,
    };
  }

  /* ---------- dados de demonstração ---------- */
  function demo() {
    const eventos = [
      {
        id: "noite-sertaneja",
        nome: "Noite Sertaneja",
        atracao: "Show sertanejo com banda completa",
        data: diasDepois(25, 21, 30),
        cidade: "Ponta Grossa", uf: "PR", local: "Centro de Eventos",
        descricao: "Uma noite de modão e sucessos do sertanejo, com mesas de frente para o palco, área VIP e pista. Abertura dos portões às 20h.",
        classificacao: "18 anos",
        cor: "linear-gradient(135deg,#fe5e61,#5d2557)",
        setores: [
          { id: "pista", nome: "Pista", preco: 90, meia: true, capacidade: 900, lote: "2º lote" },
          { id: "vip", nome: "VIP", preco: 180, meia: true, capacidade: 250, lote: "1º lote" },
        ],
        mesas: montarMesas({ ouro: 1200, prata: 960, bronze: 720 }),
      },
      {
        id: "reveillon-2027",
        nome: "Réveillon T 2027",
        atracao: "Virada com DJs e show ao vivo",
        data: diasDepois(44, 22, 0),
        cidade: "Ponta Grossa", uf: "PR", local: "Parque de Exposições",
        descricao: "Celebre a chegada de 2027 com show ao vivo, DJs, queima de fogos e open bar no camarote.",
        classificacao: "16 anos",
        cor: "linear-gradient(135deg,#2bb8c9,#2a4d8f)",
        setores: [
          { id: "pista", nome: "Pista", preco: 120, meia: true, capacidade: 2000, lote: "1º lote" },
          { id: "camarote", nome: "Camarote Open Bar", preco: 390, meia: false, capacidade: 300, lote: "1º lote" },
        ],
        mesas: null,
      },
      {
        id: "pagode-na-praca",
        nome: "Pagode do T",
        atracao: "Roda de pagode ao ar livre",
        data: diasDepois(12, 16, 0),
        cidade: "Castro", uf: "PR", local: "Praça Central",
        descricao: "Tarde de pagode com grupo convidado, praça de alimentação e espaço kids.",
        classificacao: "Livre",
        cor: "linear-gradient(135deg,#f9d423,#f7941d)",
        setores: [
          { id: "pista", nome: "Pista", preco: 40, meia: true, capacidade: 1200, lote: "Lote único" },
        ],
        mesas: null,
      },
      {
        id: "rodeio-t-country",
        nome: "Rodeio T Country",
        atracao: "Montarias, shows e queima do alho",
        data: diasDepois(60, 19, 0),
        cidade: "Telêmaco Borba", uf: "PR", local: "Parque de Exposições",
        descricao: "Três atrações sertanejas na mesma noite, rodeio profissional e praça de alimentação. Camarote com vista para a arena.",
        classificacao: "16 anos",
        cor: "linear-gradient(135deg,#f7941d,#8e3bb0)",
        setores: [
          { id: "arena", nome: "Arena", preco: 70, meia: true, capacidade: 3000, lote: "1º lote" },
          { id: "camarote", nome: "Camarote", preco: 220, meia: false, capacidade: 400, lote: "1º lote" },
        ],
        mesas: null,
      },
      {
        id: "baile-da-saudade",
        nome: "Baile da Saudade",
        atracao: "Banda de baile com os clássicos",
        data: diasDepois(78, 21, 0),
        cidade: "Ponta Grossa", uf: "PR", local: "Salão de Eventos",
        descricao: "Uma noite dançante com os sucessos que marcaram época. Mesas no salão e pista de dança.",
        classificacao: "18 anos",
        cor: "linear-gradient(135deg,#43c46b,#2bb8c9)",
        setores: [
          { id: "pista", nome: "Pista", preco: 60, meia: true, capacidade: 600, lote: "1º lote" },
        ],
        mesas: montarMesas({ ouro: 600, prata: 480, bronze: 360 }),
      },
    ];

    // vendas de demonstração para o painel ter números
    const nomes = ["Ana Souza", "Bruno Lima", "Carla Mendes", "Diego Rocha", "Elisa Martins", "Felipe Costa", "Gabriela Alves",
      "Henrique Dias", "Isabela Ramos", "João Pereira", "Karina Nunes", "Lucas Teixeira", "Mariana Lopes", "Natália Freitas",
      "Otávio Barros", "Paula Ribeiro", "Rafael Gomes", "Sabrina Castro", "Thiago Moura", "Vanessa Pinto"];
    const r = rng(42);
    const pedidos = [];
    const pedirDemo = (ev, itens, diasAtras) => {
      const nome = nomes[Math.floor(r() * nomes.length)];
      const criado = new Date(); criado.setDate(criado.getDate() - diasAtras); criado.setHours(9 + Math.floor(r() * 12), Math.floor(r() * 60));
      const p = construirPedido(ev, itens, { nome, email: nome.toLowerCase().replace(/[^a-z]+/g, ".") + "@email.com", telefone: "(42) 9" + Math.floor(1000 + r() * 8999) + "-" + Math.floor(1000 + r() * 8999) });
      p.status = "pago"; p.pagoEm = criado.toISOString(); p.criadoEm = criado.toISOString();
      p.pagamento = { metodo: r() > 0.45 ? "pix" : "cartao", parcelas: 1 };
      p.ingressos.forEach((i) => { if (r() < 0.04) i.checkin = criado.toISOString(); });
      pedidos.push(p);
    };
    eventos.forEach((ev, ei) => {
      const n = [70, 46, 38, 24, 18][ei] || 10;
      for (let k = 0; k < n; k++) {
        const setor = ev.setores[Math.floor(r() * ev.setores.length)];
        const qtd = 1 + Math.floor(r() * 3);
        pedirDemo(ev, [{ tipo: "setor", setorId: setor.id, meia: setor.meia && r() < 0.25, qtd }], Math.floor(r() * 21));
      }
      if (ev.mesas) {
        const livres = ev.mesas.lista.slice();
        for (let k = 0; k < 26; k++) {
          const idx = Math.floor(r() * livres.length);
          const mesa = livres.splice(idx, 1)[0];
          pedirDemo(ev, [{ tipo: "mesa", mesaId: mesa.id }], Math.floor(r() * 21));
        }
      }
    });
    return { versao: VERSAO, eventos, pedidos };
  }

  /* ---------- armazenamento ---------- */
  let cache = null;
  function carregar() {
    if (cache) return cache;
    try { cache = JSON.parse(localStorage.getItem(CHAVE)); } catch (e) { cache = null; }
    if (!cache || !cache.eventos || cache.versao !== VERSAO) { cache = demo(); salvar(); }
    return cache;
  }
  function salvar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(cache)); } catch (e) { /* modo privado: segue só em memória */ }
  }
  // outra aba (painel/portaria) alterou os dados
  window.addEventListener("storage", (e) => { if (e.key === CHAVE) { cache = null; window.dispatchEvent(new Event("tix:mudou")); } });

  /* ---------- consultas ---------- */
  const eventos = () => carregar().eventos.slice().sort((a, b) => new Date(a.data) - new Date(b.data));
  const evento = (id) => carregar().eventos.find((e) => e.id === id) || null;
  const pedidos = () => carregar().pedidos;
  const pedido = (id) => carregar().pedidos.find((p) => p.id === id) || null;
  const pagosDoEvento = (eventoId) => carregar().pedidos.filter((p) => p.eventoId === eventoId && p.status === "pago");

  function vendidosSetor(eventoId, setorId) {
    return pagosDoEvento(eventoId).reduce((s, p) => s + p.itens.filter((i) => i.tipo === "setor" && i.setorId === setorId).reduce((a, i) => a + i.qtd, 0), 0);
  }
  function mesasOcupadas(eventoId) {
    const set = new Set();
    carregar().pedidos.forEach((p) => {
      if (p.eventoId !== eventoId) return;
      if (p.status === "pago" || (p.status === "pendente" && Date.now() - new Date(p.criadoEm) < 15 * 60000)) {
        p.itens.forEach((i) => i.tipo === "mesa" && set.add(i.mesaId));
      }
    });
    return set;
  }
  function disponivelSetor(ev, setorId) {
    const s = ev.setores.find((x) => x.id === setorId);
    return s ? Math.max(0, s.capacidade - vendidosSetor(ev.id, setorId)) : 0;
  }

  /* ---------- pedidos ---------- */
  function precoItem(ev, item) {
    if (item.tipo === "setor") {
      const s = ev.setores.find((x) => x.id === item.setorId);
      const unit = item.meia ? s.preco / 2 : s.preco;
      return { unit, total: unit * item.qtd, rotulo: `${s.nome} · ${item.meia ? "Meia-entrada" : "Inteira"}` };
    }
    const m = ev.mesas.lista.find((x) => x.id === item.mesaId);
    const c = ev.mesas.categorias.find((x) => x.id === m.categoria);
    return { unit: c.preco, total: c.preco, rotulo: `${c.nome} ${m.id} · ${c.lugares} lugares` };
  }
  function resumo(ev, itens) {
    const linhas = itens.map((i) => ({ ...i, ...precoItem(ev, i) }));
    const subtotal = linhas.reduce((s, l) => s + l.total, 0);
    const taxa = Math.round(subtotal * TAXA * 100) / 100;
    const qtdIngressos = itens.reduce((s, i) => s + (i.tipo === "mesa" ? ev.mesas.categorias.find((c) => c.id === ev.mesas.lista.find((m) => m.id === i.mesaId).categoria).lugares : i.qtd), 0);
    return { linhas, subtotal, taxa, total: subtotal + taxa, qtdIngressos };
  }
  function construirPedido(ev, itens, comprador) {
    const res = resumo(ev, itens);
    const ingressos = [];
    res.linhas.forEach((l) => {
      if (l.tipo === "mesa") {
        const cat = ev.mesas.categorias.find((c) => c.id === ev.mesas.lista.find((m) => m.id === l.mesaId).categoria);
        for (let k = 1; k <= cat.lugares; k++) ingressos.push({ codigo: novoCodigoIngresso(), descricao: `${cat.nome} ${l.mesaId} · lugar ${k}`, titular: comprador.nome, checkin: null });
      } else {
        for (let k = 0; k < l.qtd; k++) ingressos.push({ codigo: novoCodigoIngresso(), descricao: l.rotulo, titular: comprador.nome, checkin: null });
      }
    });
    return {
      id: "P" + Date.now().toString(36).toUpperCase() + codigo(3),
      eventoId: ev.id, itens, comprador, ingressos,
      subtotal: res.subtotal, taxa: res.taxa, total: res.total,
      status: "pendente", criadoEm: new Date().toISOString(), pagoEm: null, pagamento: null,
    };
  }
  function criarPedido(eventoId, itens, comprador) {
    const ev = evento(eventoId);
    if (!ev || !itens.length) throw new Error("Pedido vazio.");
    // confere disponibilidade no momento da compra
    const ocupadas = mesasOcupadas(eventoId);
    for (const i of itens) {
      if (i.tipo === "mesa" && ocupadas.has(i.mesaId)) throw new Error(`A mesa ${i.mesaId} acabou de ser reservada por outra pessoa.`);
      if (i.tipo === "setor" && disponivelSetor(ev, i.setorId) < i.qtd) throw new Error("Não há mais ingressos suficientes nesse setor.");
    }
    const p = construirPedido(ev, itens, comprador);
    carregar().pedidos.push(p); salvar();
    return p;
  }
  function pagar(pedidoId, pagamento) {
    const p = pedido(pedidoId);
    if (!p) throw new Error("Pedido não encontrado.");
    p.status = "pago"; p.pagoEm = new Date().toISOString(); p.pagamento = pagamento;
    salvar(); return p;
  }

  /* ---------- portaria ---------- */
  function acharIngresso(codigoLido) {
    const c = String(codigoLido || "").trim().toUpperCase();
    for (const p of carregar().pedidos) {
      const i = p.ingressos.find((x) => x.codigo === c);
      if (i) return { pedido: p, ingresso: i, evento: evento(p.eventoId) };
    }
    return null;
  }
  function validar(codigoLido, eventoId) {
    const r = acharIngresso(codigoLido);
    if (!r) return { status: "invalido", mensagem: "Ingresso não encontrado." };
    if (eventoId && r.pedido.eventoId !== eventoId) return { status: "outro-evento", mensagem: `Ingresso de outro evento: ${r.evento.nome}.`, ...r };
    if (r.pedido.status !== "pago") return { status: "pendente", mensagem: "Pagamento ainda não confirmado.", ...r };
    if (r.ingresso.checkin) return { status: "usado", mensagem: `Já utilizado às ${new Date(r.ingresso.checkin).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}.`, ...r };
    r.ingresso.checkin = new Date().toISOString(); salvar();
    return { status: "ok", mensagem: "Entrada liberada.", ...r };
  }

  /* ---------- painel ---------- */
  function estatisticas(eventoId) {
    const lista = carregar().pedidos.filter((p) => p.status === "pago" && (!eventoId || p.eventoId === eventoId));
    const receita = lista.reduce((s, p) => s + p.subtotal, 0);
    const taxas = lista.reduce((s, p) => s + p.taxa, 0);
    const ingressos = lista.reduce((s, p) => s + p.ingressos.length, 0);
    const checkins = lista.reduce((s, p) => s + p.ingressos.filter((i) => i.checkin).length, 0);
    return { pedidos: lista.length, receita, taxas, ingressos, checkins, ticketMedio: lista.length ? receita / lista.length : 0 };
  }
  function capacidade(ev) {
    return ev.setores.reduce((s, x) => s + x.capacidade, 0) + (ev.mesas ? ev.mesas.lista.length * 4 : 0);
  }
  function vendasPorDia(dias = 14, eventoId) {
    const mapa = new Map();
    for (let k = dias - 1; k >= 0; k--) { const d = new Date(); d.setDate(d.getDate() - k); mapa.set(d.toISOString().slice(0, 10), 0); }
    carregar().pedidos.forEach((p) => {
      if (p.status !== "pago" || (eventoId && p.eventoId !== eventoId)) return;
      const dia = (p.pagoEm || p.criadoEm).slice(0, 10);
      if (mapa.has(dia)) mapa.set(dia, mapa.get(dia) + p.subtotal);
    });
    return [...mapa].map(([dia, valor]) => ({ dia, valor }));
  }
  function salvarEvento(ev) {
    const d = carregar();
    const i = d.eventos.findIndex((e) => e.id === ev.id);
    if (i >= 0) d.eventos[i] = ev; else d.eventos.push(ev);
    salvar(); return ev;
  }
  function slug(t) {
    const base = t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "evento";
    let s = base, n = 2; while (evento(s)) s = `${base}-${n++}`; return s;
  }
  function restaurarDemo() { cache = demo(); salvar(); window.dispatchEvent(new Event("tix:mudou")); }

  window.TIX = {
    TAXA, brl, eventos, evento, pedidos, pedido, vendidosSetor, disponivelSetor, mesasOcupadas,
    resumo, criarPedido, pagar, validar, acharIngresso, estatisticas, capacidade, vendasPorDia,
    salvarEvento, slug, montarMesas, restaurarDemo,
    dataLonga: (iso) => new Date(iso).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }),
    dataCurta: (iso) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", ""),
    hora: (iso) => new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
  };
})();
