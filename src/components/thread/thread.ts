/**
 * Scroll thread geometry + scroll-driven drawing.
 *
 * Route: starts at the right end of the hero logo's swoosh (where the intro
 * ribbon ended), drops to a side margin, and at every section joint crosses
 * to the other side with a gesture (loop / twist / fold) inside the joint's
 * padding, where there is never text. Between joints it runs along the
 * margin with a gentle hand-made waver.
 *
 * Drawing: a y -> path-length lookup table maps "how far the reader has
 * scrolled" to stroke-dashoffset. ScrollTrigger (lazy-loaded) scrubs it.
 */
import { gsap } from 'gsap';

const SWOOSH_END = [1722, 1080]; // logo units, viewBox 0 0 1804 1772
const LOGO_W = 1804;
type Gesture = 'loop' | 'twist' | 'fold';
const GESTURES: Gesture[] = ['loop', 'twist', 'fold'];

export function initThread() {
  const svg = document.querySelector<SVGSVGElement>('[data-thread]');
  const main = svg?.closest('main');
  if (!svg || !main) return;
  const paths = [...svg.querySelectorAll<SVGPathElement>('[data-tp]')];
  const flour = svg.querySelector<SVGGElement>('[data-flour]')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let len = 0;
  let lut: { y: number; l: number }[] = [];
  const state = { y: 0 };

  const build = () => {
    const W = main.clientWidth;
    const mainTop = main.getBoundingClientRect().top + scrollY;
    const H = main.scrollHeight;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.style.height = `${H}px`;

    const mobile = W < 768;
    const contentMax = 72 * 16;
    const margin = Math.max(0, (W - contentMax) / 2);
    // Keep to the outer edge: inside the side margin on desktop, 9px from the edge on phones.
    const inset = mobile ? 9 : Math.max(14, Math.min(margin / 2, 64));
    const xs = [inset, W - inset];

    // Start: swoosh end of the hero logo.
    const hero = document.querySelector<SVGSVGElement>('#hero-logo');
    let sx = W * 0.7;
    let sy = 300;
    if (hero) {
      const r = hero.getBoundingClientRect();
      const k = r.width / LOGO_W;
      sx = r.left + SWOOSH_END[0]! * k;
      sy = r.top + scrollY - mainTop + SWOOSH_END[1]! * k;
    }

    const sections = [...main.querySelectorAll<HTMLElement>(':scope > section')].filter((s) => s.offsetHeight > 0);
    const joints = sections.slice(1).map((s) => s.offsetTop);
    const f = (n: number) => n.toFixed(1);
    const P = (x: number, y: number) => `${f(x)} ${f(y)}`;

    let side = 1; // start on the right
    let x = xs[side]!;
    let d = `M${P(sx, sy)}`;
    // Hero: curl out of the swoosh and settle on the margin.
    const firstY = sy + Math.min(160, (joints[0] ?? sy + 300) - sy) * 0.6;
    // Sag out of the swoosh like a draped ribbon, then reach the margin.
    d += ` C${P(sx + (x - sx) * 0.35, sy + 90)} ${P(x, sy + 40)} ${P(x, firstY)}`;
    let y = firstY;
    const flourDots: string[] = [];

    joints.forEach((jy, i) => {
      const g = mobile ? 34 : 46; // half-height of the joint gesture zone
      const top = jy - g;
      // Run down the margin with a slight hand-made waver.
      if (top > y + 10) {
        const mid = (y + top) / 2;
        const w = (i % 2 ? 1 : -1) * (mobile ? 3 : 6);
        d += ` C${P(x + w, y + (mid - y) * 0.6)} ${P(x - w, mid + (top - mid) * 0.4)} ${P(x, top)}`;
      }
      const nx = xs[1 - side]!;
      const gesture = GESTURES[i % GESTURES.length]!;
      const mx = (x + nx) / 2;
      const r = mobile ? 16 : 24;
      const bottom = jy + g;
      if (gesture === 'loop') {
        // Cross to the middle, curl once (a teardrop loop like a twirl of tagliatelle), carry on.
        d += ` C${P(x, jy)} ${P(mx - r * 3, jy)} ${P(mx, jy)}`;
        d += ` C${P(mx + r * 1.9, jy - r * 0.2)} ${P(mx + r * 0.9, jy - r * 2.2)} ${P(mx - r * 0.1, jy - r * 1.6)}`;
        d += ` C${P(mx - r * 1.1, jy - r)} ${P(mx - r * 0.2, jy + r * 0.3)} ${P(mx + r * 1.2, jy + r * 0.2)}`;
        d += ` C${P(nx - (nx - mx) * 0.3, jy + r * 0.1)} ${P(nx, jy + g * 0.4)} ${P(nx, bottom)}`;
      } else if (gesture === 'twist') {
        // Two soft half-waves: the ribbon turning over on itself.
        const q1 = x + (nx - x) * 0.33;
        const q2 = x + (nx - x) * 0.66;
        d += ` C${P(x, jy - g * 0.2)} ${P(q1 - (nx - x) * 0.12, jy - r)} ${P(q1, jy - r * 0.4)}`;
        d += ` S${P(q2 - (nx - x) * 0.12, jy + r)} ${P(q2, jy + r * 0.4)}`;
        d += ` S${P(nx, jy + g * 0.2)} ${P(nx, bottom)}`;
      } else {
        // Fold: overshoot past the far margin and fold back, like pasta laid over a rod.
        const over = side ? -1 : 1; // direction of travel
        d += ` C${P(x, jy - g * 0.1)} ${P(nx - over * 30, jy - r)} ${P(nx + over * (mobile ? 2 : 10), jy - r * 0.3)}`;
        d += ` C${P(nx + over * (mobile ? 6 : 24), jy + r * 0.1)} ${P(nx - over * 18, jy + r * 0.8)} ${P(nx, bottom)}`;
      }
      // A few grains of flour at the joint.
      for (let n = 0; n < 4; n++) {
        const fx = mx + Math.sin(i * 7 + n * 2.1) * (mobile ? 40 : 90);
        const fy = jy + Math.cos(i * 5 + n * 1.7) * 18;
        flourDots.push(`<circle cx="${f(fx)}" cy="${f(fy)}" r="${(0.8 + ((n * 37 + i * 13) % 10) / 10).toFixed(2)}"/>`);
      }
      side = 1 - side;
      x = nx;
      y = bottom;
    });
    // Tail: fade into the footer.
    d += ` C${P(x, y + 60)} ${P(x, H - 80)} ${P(x, H - 24)}`;

    for (const p of paths) p.setAttribute('d', d);
    flour.innerHTML = flourDots.join('');

    // Length lookup: monotonic max-y per length so loops don't flicker.
    len = paths[0]!.getTotalLength();
    const N = Math.max(200, Math.round(len / 25));
    lut = [];
    let maxY = -Infinity;
    for (let i = 0; i <= N; i++) {
      const l = (len * i) / N;
      maxY = Math.max(maxY, paths[0]!.getPointAtLength(l).y);
      lut.push({ y: maxY, l });
    }
    for (const p of paths) p.style.strokeDasharray = `${len} ${len}`;
    draw();
  };

  const lengthAt = (y: number) => {
    let lo = 0;
    let hi = lut.length - 1;
    if (y <= lut[0]!.y) return 0;
    if (y >= lut[hi]!.y) return len;
    while (hi - lo > 1) {
      const m = (lo + hi) >> 1;
      if (lut[m]!.y < y) lo = m;
      else hi = m;
    }
    const a = lut[lo]!;
    const b = lut[hi]!;
    return a.l + ((y - a.y) / Math.max(1e-6, b.y - a.y)) * (b.l - a.l);
  };

  const draw = () => {
    const l = reduced ? len : lengthAt(state.y);
    const off = String(len - l);
    for (const p of paths) p.style.strokeDashoffset = off;
  };

  /** Reading position in main coordinates: ~78% down the viewport. */
  const target = () => scrollY - (main.getBoundingClientRect().top + scrollY) + innerHeight * 0.78;

  const start = async () => {
    build();
    state.y = target();
    draw();
    svg.classList.add('is-ready');
    if (reduced) return;

    const { ScrollTrigger } = await import('gsap/ScrollTrigger');
    gsap.registerPlugin(ScrollTrigger);
    const setY = gsap.quickTo(state, 'y', { duration: 0.45, ease: 'power3.out', onUpdate: draw });
    ScrollTrigger.create({
      trigger: main,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: () => setY(target()),
    });

    // Recompute the route when layout changes (resize, orientation, menu search…).
    let t = 0;
    const rebuild = () => {
      clearTimeout(t);
      t = window.setTimeout(() => {
        build();
        state.y = target();
        draw();
        ScrollTrigger.refresh();
      }, 200);
    };
    let lastW = innerWidth;
    let lastH = main.scrollHeight;
    new ResizeObserver(() => {
      // Ignore mobile URL-bar height jitter; react to real width/content changes.
      if (innerWidth !== lastW || Math.abs(main.scrollHeight - lastH) > 40) {
        lastW = innerWidth;
        lastH = main.scrollHeight;
        rebuild();
      }
    }).observe(main);
  };

  const begin = () => {
    if ('requestIdleCallback' in window) requestIdleCallback(() => start(), { timeout: 600 });
    else setTimeout(start, 50);
  };
  if (document.documentElement.classList.contains('intro-on')) addEventListener('intro:done', begin, { once: true });
  else begin();
}
