/**
 * Menu island: category tabs, search, swipe tracks (scroll-snap + mouse drag +
 * keyboard), pasta-strand progress, card flip, parallax (swipe / mouse / gyro)
 * and "live" aroma only for visible cards.
 */

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const normalize = (s: string) =>
  s.toLowerCase().replace(/đ/g, 'dj').normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

export function initMenu() {
  const root = document.querySelector<HTMLElement>('[data-menu]');
  if (!root) return;

  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[data-tab]')];
  const panels = [...root.querySelectorAll<HTMLElement>('[data-panel]')];
  const search = root.querySelector<HTMLInputElement>('[data-menu-search]')!;
  const empty = root.querySelector<HTMLElement>('[data-menu-empty]')!;
  const bar = root.querySelector<HTMLElement>('[data-menu-bar]')!;
  let active = tabs.find((t) => t.getAttribute('aria-selected') === 'true')?.dataset.tab ?? tabs[0]!.dataset.tab!;

  // ---- Tabs ------------------------------------------------------------------
  const select = (id: string, focus = false) => {
    active = id;
    for (const t of tabs) {
      const on = t.dataset.tab === id;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on) {
        t.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
        if (focus) t.focus();
      }
    }
    for (const p of panels) {
      p.hidden = p.dataset.panel !== id;
      if (!p.hidden) {
        const track = p.querySelector<HTMLElement>('[data-track]')!;
        track.scrollLeft = 0;
        update(track);
      }
    }
  };

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => {
      if (search.value) clearSearch();
      select(t.dataset.tab!);
    });
    t.addEventListener('keydown', (e) => {
      const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      select(tabs[(i + dir + tabs.length) % tabs.length]!.dataset.tab!, true);
    });
  });

  // Links elsewhere on the page can open a category: <a href="#meni" data-menu-jump="paste">
  document.querySelectorAll<HTMLAnchorElement>('[data-menu-jump]').forEach((a) =>
    a.addEventListener('click', () => select(a.dataset.menuJump!)),
  );

  // ---- Search ----------------------------------------------------------------
  const clearSearch = () => {
    search.value = '';
    applySearch('');
  };
  const applySearch = (raw: string) => {
    const q = normalize(raw);
    if (!q) {
      delete root.dataset.searching;
      root.querySelectorAll<HTMLElement>('[data-card]').forEach((c) => (c.hidden = false));
      empty.hidden = true;
      select(active);
      return;
    }
    root.dataset.searching = '';
    tabs.forEach((t) => t.setAttribute('aria-selected', 'false'));
    let total = 0;
    for (const p of panels) {
      let n = 0;
      p.querySelectorAll<HTMLElement>('[data-card]').forEach((c) => {
        const hit = c.dataset.search!.includes(q);
        c.hidden = !hit;
        if (hit) n++;
      });
      p.hidden = n === 0;
      total += n;
      if (n) update(p.querySelector<HTMLElement>('[data-track]')!);
    }
    empty.hidden = total > 0;
  };
  let searchTimer = 0;
  search.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => applySearch(search.value), 120);
  });
  search.addEventListener('focus', () => {
    // Bring the sticky bar into view so results are visible above the keyboard.
    if (bar.getBoundingClientRect().top > innerHeight * 0.5) root.scrollIntoView({ block: 'start' });
  });

  // ---- Tracks ----------------------------------------------------------------
  const tracks = [...root.querySelectorAll<HTMLElement>('[data-track]')];
  const visibleCards = (track: HTMLElement) =>
    [...track.querySelectorAll<HTMLElement>('[data-card]')].filter((c) => !c.hidden);

  function update(track: HTMLElement) {
    const panel = track.closest<HTMLElement>('[data-panel]')!;
    const cards = visibleCards(track);
    if (!cards.length) return;
    const max = track.scrollWidth - track.clientWidth;
    const progress = max > 0 ? track.scrollLeft / max : 1;
    const step = cards[0]!.offsetWidth + parseFloat(getComputedStyle(track).columnGap || '16');
    const idx = Math.min(cards.length - 1, Math.round(track.scrollLeft / step));

    const strand = panel.querySelector<SVGPathElement>('[data-strand]');
    if (strand) {
      const seen = Math.min(1, (track.clientWidth + track.scrollLeft) / track.scrollWidth);
      strand.style.strokeDashoffset = String(1 - Math.max(seen, progress));
    }
    const count = panel.querySelector<HTMLElement>('[data-count]');
    if (count) count.textContent = `${idx + 1} / ${cards.length}`;
    const prev = panel.querySelector<HTMLButtonElement>('[data-prev]');
    const next = panel.querySelector<HTMLButtonElement>('[data-next]');
    if (prev) prev.disabled = track.scrollLeft < 4;
    if (next) next.disabled = track.scrollLeft > max - 4;

    if (!reduceMotion) {
      const left = track.getBoundingClientRect().left;
      const pad = parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0;
      for (const c of cards) {
        const x = c.getBoundingClientRect().left - left - pad;
        const p = Math.max(-1.5, Math.min(1.5, x / step));
        if (Math.abs(p) < 1.6) c.style.setProperty('--p', p.toFixed(3));
      }
    }
  }

  for (const track of tracks) {
    let raf = 0;
    track.addEventListener(
      'scroll',
      () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => update(track));
      },
      { passive: true },
    );

    const by = (dir: number) => {
      const cards = visibleCards(track);
      const step = (cards[0]?.offsetWidth ?? 280) + 16;
      track.scrollBy({ left: dir * step, behavior: reduceMotion ? 'auto' : 'smooth' });
    };
    const panel = track.closest<HTMLElement>('[data-panel]')!;
    panel.querySelector('[data-prev]')?.addEventListener('click', () => by(-1));
    panel.querySelector('[data-next]')?.addEventListener('click', () => by(1));
    track.addEventListener('keydown', (e) => {
      if (e.target !== track) return;
      if (e.key === 'ArrowRight') (e.preventDefault(), by(1));
      if (e.key === 'ArrowLeft') (e.preventDefault(), by(-1));
    });

    // Mouse drag (touch uses native scrolling).
    let startX = 0;
    let startLeft = 0;
    let dragging = false;
    let moved = false;
    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      startLeft = track.scrollLeft;
    });
    addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 4) {
        moved = true;
        track.classList.add('is-dragging');
      }
      if (moved) track.scrollLeft = startLeft - dx;
    });
    addEventListener('pointerup', () => {
      if (!dragging) return;
      dragging = false;
      if (!moved) return;
      // Re-enable snapping and settle on the nearest card.
      const left = track.scrollLeft;
      track.classList.remove('is-dragging');
      track.scrollLeft = left;
      const cards = visibleCards(track);
      const step = (cards[0]?.offsetWidth ?? 280) + 16;
      track.scrollTo({ left: Math.round(left / step) * step, behavior: 'smooth' });
    });
    track.addEventListener(
      'click',
      (e) => {
        if (moved) {
          e.stopPropagation();
          e.preventDefault();
          moved = false;
        }
      },
      true,
    );

    update(track);
  }
  addEventListener('resize', () => tracks.forEach((t) => !t.closest('[hidden]') && update(t)), { passive: true });

  // ---- Flip -----------------------------------------------------------------
  root.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-flip]');
    if (!btn) return;
    const card = btn.closest<HTMLElement>('[data-card]')!;
    const flipped = card.classList.toggle('is-flipped');
    card.querySelectorAll('[data-flip]').forEach((b) => b.setAttribute('aria-expanded', String(flipped)));
    (card.querySelector<HTMLElement>(flipped ? '.mcard__back [data-flip]' : '.mcard__front [data-flip]'))?.focus();
  });

  if (reduceMotion) return;

  // ---- Live aroma: animate only cards that are on screen ---------------------------
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => en.target.classList.toggle('is-live', en.isIntersecting)),
    { threshold: 0.55 },
  );
  root.querySelectorAll('[data-card]').forEach((c) => io.observe(c));

  // ---- Mouse tilt (desktop) ---------------------------------------------------
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    root.addEventListener('pointermove', (e) => {
      const card = (e.target as HTMLElement).closest<HTMLElement>('[data-card]');
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--tx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
      card.style.setProperty('--ty', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
    });
    root.addEventListener(
      'pointerleave',
      (e) => {
        const card = (e.target as HTMLElement).closest?.<HTMLElement>('[data-card]');
        if (card) (card.style.removeProperty('--tx'), card.style.removeProperty('--ty'));
      },
      true,
    );
    return;
  }

  // ---- Gyroscope (mobile) -----------------------------------------------------
  let gyroRaf = 0;
  const onTilt = (e: DeviceOrientationEvent) => {
    if (e.gamma == null || e.beta == null) return;
    cancelAnimationFrame(gyroRaf);
    gyroRaf = requestAnimationFrame(() => {
      const x = Math.max(-1, Math.min(1, e.gamma! / 25));
      const y = Math.max(-1, Math.min(1, (e.beta! - 45) / 25));
      root.style.setProperty('--tx', x.toFixed(3));
      root.style.setProperty('--ty', y.toFixed(3));
    });
  };
  const startGyro = () => addEventListener('deviceorientation', onTilt, { passive: true });

  type IOSOrientation = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<'granted' | 'denied'> };
  const DOE = window.DeviceOrientationEvent as IOSOrientation | undefined;
  if (!DOE) return;
  if (typeof DOE.requestPermission === 'function') {
    // iOS: permission must come from an explicit tap.
    const btn = root.querySelector<HTMLButtonElement>('[data-motion-toggle]')!;
    btn.hidden = false;
    btn.addEventListener('click', async () => {
      try {
        if ((await DOE.requestPermission!()) === 'granted') startGyro();
      } finally {
        btn.hidden = true;
      }
    });
  } else {
    // Only listen while the menu is on screen.
    new IntersectionObserver(([en]) =>
      en!.isIntersecting ? startGyro() : removeEventListener('deviceorientation', onTilt),
    ).observe(root);
  }
}
