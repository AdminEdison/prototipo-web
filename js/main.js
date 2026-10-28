(() => {
  'use strict';
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  $('#year').textContent = new Date().getFullYear();
  const menuToggle = $('.menu-toggle');
  const nav = $('#main-nav');
  const closeMenu = () => {
    nav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menú');
  };
  menuToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  $$('.nav__link').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !menuToggle.contains(e.target)) closeMenu();
  });

  const header = $('.header');
  const backTop = $('.back-top');
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
    backTop.classList.toggle('is-visible', window.scrollY > 450);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.07, rootMargin: '0px 0px 30px 0px' });
    $$('.reveal').forEach((node) => observer.observe(node));

    const sections = $$('main section[id]');
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          $$('.nav__link').forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id));
        }
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    sections.forEach((node) => navObserver.observe(node));
  } else $$('.reveal').forEach((node) => node.classList.add('is-visible'));

  // Carrusel de portada: avance automático, flechas, indicadores, teclado y gestos táctiles.
  const heroCarousel = $('#heroCarousel');
  if (heroCarousel) {
    const slides = $$('.hero-slide', heroCarousel);
    const dots = $$('.hero-carousel__dot', heroCarousel);
    const counter = $('#heroCounter');
    const status = $('#heroStatus');
    const delay = 3000; // Avance automático cada 6,5 segundos.
    let active = 0;
    let inView = true;
    let timer = null;

    const stopTimer = () => { window.clearInterval(timer); timer = null; };
    // No se detiene al pasar el mouse ni tras pulsar las flechas.
    // Solo suspendemos el temporizador cuando la pestaña o el carrusel no son visibles.
    const canPlay = () => inView && !document.hidden;
    const startTimer = () => {
      stopTimer();
      if (canPlay() && slides.length > 1) timer = window.setInterval(() => goTo(active + 1, false), delay);
    };
    function goTo(index, announce = true) {
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        const current = i === active;
        slide.classList.toggle('is-active', current);
        slide.setAttribute('aria-hidden', String(!current));
        slide.inert = !current;
      });
      dots.forEach((dot, i) => {
        const current = i === active;
        dot.classList.toggle('is-current', current);
        dot.setAttribute('aria-current', String(current));
      });
      counter.innerHTML = `<strong>${String(active + 1).padStart(2, '0')}</strong> <span>/ ${String(slides.length).padStart(2, '0')}</span>`;
      if (announce) status.textContent = `Diapositiva ${active + 1} de ${slides.length}`;
      startTimer();
    }
    $('[data-hero-prev]', heroCarousel).addEventListener('click', () => goTo(active - 1));
    $('[data-hero-next]', heroCarousel).addEventListener('click', () => goTo(active + 1));
    dots.forEach((dot) => dot.addEventListener('click', () => goTo(Number(dot.dataset.heroGo))));
    heroCarousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(active - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(active + 1); }
    });
    document.addEventListener('visibilitychange', startTimer);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        startTimer();
      }, { threshold: .15 }).observe(heroCarousel);
    }
    let startTouchX = 0;
    let startTouchY = 0;
    heroCarousel.addEventListener('touchstart', (e) => {
      startTouchX = e.changedTouches[0].screenX;
      startTouchY = e.changedTouches[0].screenY;
    }, { passive: true });
    heroCarousel.addEventListener('touchend', (e) => {
      const deltaX = e.changedTouches[0].screenX - startTouchX;
      const deltaY = e.changedTouches[0].screenY - startTouchY;
      if (Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) goTo(active + (deltaX < 0 ? 1 : -1));
    }, { passive: true });
    startTimer();
  }

  $$('.filter').forEach((btn) => btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;
    $$('.filter').forEach((other) => {
      const selected = other === btn;
      other.classList.toggle('is-selected', selected);
      other.setAttribute('aria-pressed', String(selected));
    });
    $$('.product-card').forEach((card) => {
      const show = filter === 'todos' || card.dataset.group === filter;
      card.classList.toggle('is-hidden', !show);
    });
  }));

  const productDescriptions = {
    alimentos: ['Industria alimenticia', 'Envases cilíndricos con variedad de diámetros, tamaños, espesores y opciones de tapas. Pensados para la presentación y protección de productos alimenticios.'],
    farmaceutica: ['Farmacéutica y cuidado', 'Empaques cilíndricos especializados para nutracéuticos, suplementos, aplicaciones farmacéuticas y otras líneas que requieren una presentación confiable.'],
    tubos: ['Tubos industriales', 'Tubos de cartón elaborados a medida para usos textiles, agrícolas, plásticos, papeleros y de bobinado, según las necesidades de resistencia y producción.'],
    promocionales: ['Productos promocionales', 'Envases personalizados para regalos, artículos promocionales y presentaciones especiales, con diferentes materiales, acabados y opciones de impresión.'],
    papel: ['Papel absorbente', 'Líneas de papel higiénico, servilletas, toallas de mano y productos absorbentes para consumo doméstico e institucional, dentro del portafolio de ENVATUB y Melopaper.'],
    licorera: ['Industria licorera', 'Envases cilíndricos de cartón para presentar vinos, licores y otras bebidas, con opciones de tapas, terminaciones e impresión personalizada.']
  };
  const productToQuote = {
    alimentos: 'Envases alimenticios', farmaceutica: 'Farmacéutica y cuidado', tubos: 'Tubos industriales',
    promocionales: 'Promocionales', papel: 'Papel absorbente', licorera: 'Industria licorera'
  };
  const productDialog = $('#productDialog');
  const quoteDialog = $('#quoteDialog');
  let lastProduct = null;
  function showDialog(dialog) {
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }
  function hideDialog(dialog) {
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  }
  $$('.product-card').forEach((card) => card.addEventListener('click', () => {
    lastProduct = card.dataset.product;
    const [title, description] = productDescriptions[lastProduct];
    $('#productDialogTitle').textContent = title;
    $('#productDialogDescription').textContent = description;
    showDialog(productDialog);
  }));
  function openQuote(productKey = null) {
    if (productKey && productToQuote[productKey]) $('#productSelect').value = productToQuote[productKey];
    showDialog(quoteDialog);
  }
  $$('[data-open-quote]').forEach((btn) => btn.addEventListener('click', () => openQuote()));
  $('#productQuote').addEventListener('click', () => {
    hideDialog(productDialog);
    openQuote(lastProduct);
  });
  $$('[data-close-dialog]').forEach((btn) => btn.addEventListener('click', () => hideDialog(btn.closest('dialog'))));
  [productDialog, quoteDialog].forEach((dialog) => dialog.addEventListener('click', (e) => {
    if (e.target === dialog) hideDialog(dialog);
  }));

  let toastTimer;
  const toast = $('#toast');
  const notify = (message) => {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('is-visible');
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 5000);
  };
  $('#quoteForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const nombre = String(data.get('nombre') || '').trim();
    const empresa = String(data.get('empresa') || '').trim();
    const correo = String(data.get('correo') || '').trim();
    const producto = String(data.get('producto') || '').trim();
    const mensaje = String(data.get('mensaje') || '').trim();
    if (!nombre || !correo || !mensaje) {
      notify('Completa los campos obligatorios antes de continuar.');
      return;
    }
    const subject = `Consulta de cotización: ${producto}`;
    const body = `Hola, equipo ENVATUB:\n\nQuisiera solicitar información sobre:\n${producto}\n\nNombre: ${nombre}\nEmpresa: ${empresa || 'No indicada'}\nCorreo: ${correo}\n\nDetalle del proyecto:\n${mensaje}\n\nSaludos.`;
    const mailto = `mailto:info@envatub.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    hideDialog(quoteDialog);
    notify('Se preparó tu consulta. Se intentará abrir tu aplicación de correo (demo sin servidor).');
    window.location.href = mailto;
  });
})();
