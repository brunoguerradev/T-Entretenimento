/* Botão flutuante do WhatsApp: quando a última faixa do rodapé (com a assinatura
   da FOXES) entra na tela, o botão sobe junto e nunca a cobre. */
(function () {
  const fab = document.querySelector(".wa-fab");
  const faixa = document.querySelector(".footer__bottom");
  if (!fab || !faixa) return;
  let agendado = false;
  function ajustar() {
    agendado = false;
    const sobra = window.innerHeight - faixa.getBoundingClientRect().top; // quanto da faixa já aparece
    fab.style.transform = sobra > 0 ? `translateY(${-Math.round(sobra + 8)}px)` : "";
  }
  const pedir = () => { if (!agendado) { agendado = true; requestAnimationFrame(ajustar); } };
  window.addEventListener("scroll", pedir, { passive: true });
  window.addEventListener("resize", pedir);
  ajustar();
})();
