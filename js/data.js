/* ==========================================================
   CONTEÚDO DO SITE – edite aqui sem mexer no layout.
   Imagens: coloque os arquivos em assets/img/ e preencha "foto"
   (ex.: "assets/img/matogrosso-mathias.jpg").
   Sem foto, o card mostra um degradê com as iniciais.
   ========================================================== */

window.SITE = {
  // WhatsApp da T: usado pelo formulário de contato e pelo botão flutuante.
  whatsapp: "5542984079999",         // só números, com DDI (55) e DDD (42)
  telefone: "(42) 98407-9999",       // como aparece escrito no site
  mensagemWhatsapp: "Olá, T Entretenimento! Vim pelo site e gostaria de informações sobre shows.",

  // "turne: true" mostra o selo EM TURNÊ (como o "NO AR" da Rádio T)
  artistas: [
    { nome: "Matogrosso & Mathias", estilo: "Sertanejo", foto: "", turne: true },
    { nome: "Nome do Artista", estilo: "Sertanejo universitário", foto: "" },
    { nome: "Nome do Artista", estilo: "Pagode", foto: "" },
    { nome: "Nome do Artista", estilo: "Banda / Baile", foto: "" },
    { nome: "Nome do Artista", estilo: "Rock nacional", foto: "" },
    { nome: "Nome do Artista", estilo: "Gospel", foto: "" },
    { nome: "Nome do Artista", estilo: "Forró", foto: "" },
    { nome: "Nome do Artista", estilo: "Humor / Stand-up", foto: "" }
  ],

  // EXEMPLO – substitua pelas datas reais. Formato AAAA-MM-DD.
  // Datas passadas somem sozinhas; a data de hoje ganha o selo "HOJE".
  agenda: [
    { data: "2026-11-21", cidade: "Ponta Grossa", uf: "PR", local: "Festa do Peão", artista: "Matogrosso & Mathias" },
    { data: "2026-11-22", cidade: "Lages", uf: "SC", local: "Centro de Eventos", artista: "Matogrosso & Mathias" },
    { data: "2026-11-28", cidade: "Arapongas", uf: "PR", local: "Arapongas Fest", artista: "Matogrosso & Mathias" },
    { data: "2026-11-29", cidade: "Cerqueira César", uf: "SP", local: "Festa da cidade", artista: "Matogrosso & Mathias" },
    { data: "2026-12-05", cidade: "Iporã", uf: "PR", local: "Expo Iporã", artista: "Matogrosso & Mathias" },
    { data: "2026-12-06", cidade: "Mococa", uf: "SP", local: "Clube", artista: "Matogrosso & Mathias" },
    { data: "2026-12-12", cidade: "Ijuí", uf: "RS", local: "Expoijuí", artista: "Matogrosso & Mathias" },
    { data: "2026-12-13", cidade: "Pouso Alegre", uf: "MG", local: "Aniversário da cidade", artista: "Matogrosso & Mathias" },
    { data: "2026-12-19", cidade: "Curitiba", uf: "PR", local: "A definir", artista: "Matogrosso & Mathias" },
    { data: "2026-12-20", cidade: "Nova Alvorada do Sul", uf: "MS", local: "Aniversário da cidade", artista: "Matogrosso & Mathias" }
  ],

  // Carrossel "T Eventos" (como o "T News" da Rádio T) – posts do Instagram
  eventos: [
    { data: "2023-12-24", titulo: "Feliz Natal! Que o espírito natalino traga paz e serenidade para a sua vida", foto: "", link: "https://www.instagram.com/tentretenimento/" },
    { data: "2023-10-07", titulo: "Obrigado, Ponta Grossa! Matogrosso & Mathias com casa cheia", foto: "", link: "https://www.instagram.com/tentretenimento/" },
    { data: "2023-10-06", titulo: "É hoje! Matogrosso & Mathias na Sassaki Eventos, em Ponta Grossa/PR", foto: "", link: "https://www.instagram.com/tentretenimento/" },
    { data: "2023-10-02", titulo: "100% das mesas vendidas para Matogrosso & Mathias", foto: "", link: "https://www.instagram.com/tentretenimento/" },
    { data: "2023-09-15", titulo: "Ponta Grossa 200 anos: parabéns à nossa cidade!", foto: "", link: "https://www.instagram.com/tentretenimento/" }
  ]
};
