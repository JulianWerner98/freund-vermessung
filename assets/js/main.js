// Vermessungsbüro Freund – kleine Helfer ohne Abhängigkeiten
(() => {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('site-nav');

  // Kopfzeile: Schatten erst, wenn Inhalt darunter liegt
  const onScroll = () => header?.toggleAttribute('data-scrolled', window.scrollY > 4);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

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
