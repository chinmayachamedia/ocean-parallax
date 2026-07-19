/* =================================================================
   DESCENT — parallax scroll logic
   No dependencies. Everything below reacts to window scroll and
   IntersectionObserver events only.
================================================================= */

(() => {
  'use strict';

  const doc = document.documentElement;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------------------------------------------------------------
  // Cached DOM refs
  // ---------------------------------------------------------------
  const scrollFill   = document.getElementById('scrollFill');
  const depthFill    = document.getElementById('depthFill');
  const depthMeters  = document.getElementById('depthMeters');
  const depthZone    = document.getElementById('depthZone');
  const navLinks     = document.querySelectorAll('.nav__links a[data-nav]');
  const zones        = document.querySelectorAll('.zone');
  const parallaxEls  = document.querySelectorAll('[data-speed]');

  // Real-world depth (metres) reached at the bottom of each zone,
  // used only to drive the numbers on the depth gauge.
  const ZONE_DEPTH = {
    surface: 0,
    epipelagic: 200,
    mesopelagic: 1000,
    bathypelagic: 4000,
    abyssopelagic: 6000,
    hadal: 11000,
  };
  const ZONE_LABEL = {
    surface: 'Surface',
    epipelagic: 'Sunlight Zone',
    mesopelagic: 'Twilight Zone',
    bathypelagic: 'Midnight Zone',
    abyssopelagic: 'Abyssal Zone',
    hadal: 'Hadal Zone',
  };
  const zoneOrder = Object.keys(ZONE_DEPTH);

  let ticking = false;

  // ---------------------------------------------------------------
  // Main scroll handler — throttled with requestAnimationFrame so
  // we only touch the DOM once per repaint, however fast the user
  // scrolls or trackpads fling the page.
  // ---------------------------------------------------------------
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }

  function update() {
    const scrollY = window.scrollY;
    const docHeight = doc.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? scrollY / docHeight : 0;

    updateProgressBar(progress);
    updateDepthGauge(progress, scrollY);
    if (!prefersReducedMotion) updateParallaxLayers(scrollY);
    updateActiveNav(scrollY);

    ticking = false;
  }

  // ---------------------------------------------------------------
  // Top hairline scroll progress
  // ---------------------------------------------------------------
  function updateProgressBar(progress) {
    scrollFill.style.width = `${progress * 100}%`;
  }

  // ---------------------------------------------------------------
  // Depth gauge: fills vertically and reports a plausible depth in
  // metres based on which zone is currently in view.
  // ---------------------------------------------------------------
  function updateDepthGauge(progress, scrollY) {
    depthFill.style.height = `${progress * 100}%`;

    // Find the zone whose section currently occupies the viewport
    // centre, then interpolate a depth value within that zone's range.
    const viewportCenter = scrollY + window.innerHeight * 0.5;
    let currentZone = zoneOrder[0];
    let zoneStart = 0;

    zones.forEach((zone) => {
      const top = zone.offsetTop;
      if (viewportCenter >= top) {
        currentZone = zone.id;
        zoneStart = top;
      }
    });

    const zone = document.getElementById(currentZone);
    const zoneHeight = zone.offsetHeight;
    const withinZone = Math.min(Math.max((viewportCenter - zoneStart) / zoneHeight, 0), 1);

    const idx = zoneOrder.indexOf(currentZone);
    const prevDepth = idx === 0 ? 0 : ZONE_DEPTH[zoneOrder[idx - 1]];
    const nextDepth = ZONE_DEPTH[currentZone];
    const depth = Math.round(prevDepth + (nextDepth - prevDepth) * withinZone);

    depthMeters.textContent = depth.toLocaleString();
    depthZone.textContent = ZONE_LABEL[currentZone];
  }

  // ---------------------------------------------------------------
  // Parallax layers: each element with [data-speed] shifts at a
  // fraction of scroll velocity relative to its own section, so
  // background elements lag behind foreground ones.
  // ---------------------------------------------------------------
  function updateParallaxLayers(scrollY) {
    parallaxEls.forEach((el) => {
      const speed = parseFloat(el.dataset.speed) || 0;
      const section = el.closest('.zone');
      const sectionOffset = scrollY - section.offsetTop;
      const y = sectionOffset * speed;
      el.style.transform = `translate3d(0, ${y}px, 0)`;
    });
  }

  // ---------------------------------------------------------------
  // Sticky nav: highlight the link matching the zone in view
  // ---------------------------------------------------------------
  function updateActiveNav(scrollY) {
    const viewportCenter = scrollY + window.innerHeight * 0.5;
    let activeId = zones[0].id;
    zones.forEach((zone) => {
      if (viewportCenter >= zone.offsetTop) activeId = zone.id;
    });
    navLinks.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${activeId}`;
      link.classList.toggle('is-active', isActive);
    });
  }

  // ---------------------------------------------------------------
  // Fade-in reveals via IntersectionObserver (cheaper than scroll
  // math for a simple show/hide, and pauses off-screen work for us)
  // ---------------------------------------------------------------
  function initFadeIns() {
    const targets = document.querySelectorAll('.fade-in');
    if (!('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
    );
    targets.forEach((el) => observer.observe(el));
  }

  // ---------------------------------------------------------------
  // Init
  // ---------------------------------------------------------------
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  initFadeIns();
  update(); // set correct state on initial load (e.g. deep-linked hash)
})();
