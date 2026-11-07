// Vermessungsbüro Freund – kleine Helfer ohne Abhängigkeiten
(() => {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('site-nav');

  // Kopfzeile: Schatten erst, wenn Inhalt darunter liegt
  const onScroll = () => header?.toggleAttribute('data-scrolled', window.scrollY > 4);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Darstellung: Automatisch (System) / Hell / Dunkel
  const root = document.documentElement;
  const themeButtons = [...document.querySelectorAll('[data-theme-set]')];
  const themeMetas = [...document.querySelectorAll('meta[name="theme-color"]')];
  themeMetas.forEach((m) => { m.dataset.orig = m.content; });
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const applyTheme = (choice, animate) => {
    if (animate && !reduceMotion.matches) {
      root.classList.add('theme-switching');
      window.setTimeout(() => root.classList.remove('theme-switching'), 260);
    }
    if (choice === 'auto') delete root.dataset.theme;
    else root.dataset.theme = choice;
    try {
      if (choice === 'auto') localStorage.removeItem('theme');
      else localStorage.setItem('theme', choice);
    } catch (e) { /* Speicher gesperrt: Wahl gilt nur für diese Seite */ }
    themeButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.themeSet === choice)));
    themeMetas.forEach((m) => {
      m.content = choice === 'auto' ? m.dataset.orig : (choice === 'dark' ? '#141313' : '#f6f5f3');
    });
  };

  if (themeButtons.length) {
    applyTheme(root.dataset.theme || 'auto', false);
    themeButtons.forEach((b) => b.addEventListener('click', () => applyTheme(b.dataset.themeSet, true)));
  }

  // Mobiles Menü
  if (toggle && nav) {
    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.querySelector('.label').textContent = open ? 'Schließen' : 'Menü';
      nav.toggleAttribute('data-open', open);
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    window.matchMedia('(min-width: 54.0625rem)').addEventListener('change', (m) => { if (m.matches) setOpen(false); });
  }

  // Sprungnavigation: aktuellen Abschnitt je Navigation markieren
  if ('IntersectionObserver' in window) {
    document.querySelectorAll('[data-spy]').forEach((spy) => {
      const links = [...spy.querySelectorAll('a[href^="#"]')];
      const pairs = links
        .map((a) => [document.getElementById(a.getAttribute('href').slice(1)), a])
        .filter(([t]) => t);
      if (!pairs.length) return;
      const visible = new Set();
      const mark = () => {
        const hit = pairs.find(([t]) => visible.has(t));
        if (!hit) return; // letzten Stand behalten, solange nichts im Band liegt
        links.forEach((a) => a.removeAttribute('aria-current'));
        const active = hit[1];
        active.setAttribute('aria-current', 'true');
        const strip = active.closest('ul');
        if (strip && strip.scrollWidth > strip.clientWidth) {
          const l = active.offsetLeft - strip.offsetLeft;
          if (l < strip.scrollLeft || l + active.offsetWidth > strip.scrollLeft + strip.clientWidth) {
            strip.scrollTo({ left: Math.max(0, l - 16) });
          }
        }
      };
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
        mark();
      }, { rootMargin: '-30% 0px -60% 0px' });
      pairs.forEach(([t]) => io.observe(t));
    });
  }
})();
