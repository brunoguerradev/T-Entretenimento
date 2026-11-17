/* Assinatura FOXES – padrão de todos os projetos (sites estáticos).
   Uso: coloque <span data-foxes></span> no rodapé, inclua foxes-assinatura.css
   e este arquivo (ou cole a função no JS do site). */
(function () {
  /* Raposa em linha. O traço começa no meio da testa (M48 32): se começar no
     canto da orelha, o stroke-dasharray da animação corta metade da orelha. */
  var FOX = '<svg class="foxes-credit-fox" viewBox="6 6 84 86" aria-hidden="true">' +
    '<path class="foxes-fox-line" pathLength="100" d="M48 32 L64 32 L84 12 L84 50 L48 86 L12 50 L12 12 L32 32 Z" fill="none" stroke="#C8FF3A" stroke-width="12" stroke-linejoin="round" stroke-linecap="round"></path>' +
    '<circle class="foxes-fox-dot" cx="48" cy="59" r="6.5" fill="#FFFFFF"></circle></svg>';

  function assinar() {
    document.querySelectorAll('[data-foxes]').forEach(function (el) {
      var claro = el.getAttribute('data-foxes') === 'claro' ? ' foxes-credit--claro' : '';
      el.outerHTML = '<a href="https://foxes.com.br" target="_blank" rel="noopener" data-state="waiting" class="foxes-credit-link' + claro + '">' +
        '<small>Desenvolvido por</small>' + FOX +
        '<b>foxes<span class="foxes-credit-dot">.</span></b>' +
        '<span class="foxes-sr"> (abre em nova aba)</span></a>';
    });
    var links = document.querySelectorAll('.foxes-credit-link[data-state="waiting"]');
    if (!('IntersectionObserver' in window)) { links.forEach(function (l) { l.dataset.state = 'seen'; }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.dataset.state = 'seen'; io.unobserve(e.target); } });
    });
    links.forEach(function (l) { io.observe(l); });
  }

  window.FOXES_ASSINAR = assinar;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', assinar);
  else assinar();
})();
