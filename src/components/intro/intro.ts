/**
 * Intro timeline (≈5 s). See docs/faza-1-revizija.md §3 for the storyboard.
 *
 *  0.25–2.1  ribbon unrolls across the screen (S-curve), photos slide inside it
 *  2.1–3.2   ribbon accelerates, curls at the right edge, narrows and runs
 *            along the logo's swoosh centreline
 *  3.05–4.0  swoosh, wordmark (brush-direction wipe), emblem, year appear
 *  4.1–5.0   shared-element transition: logo glides to the hero logo while the
 *            ink overlay lifts; html.intro-on is removed at the end
 */
import { gsap } from 'gsap';

const html = document.documentElement;

/** Swoosh centreline in logo units (viewBox 0 0 1804 1772), measured from the SVG. */
const SWOOSH = { start: [540, 1200], c1: [900, 1112], c2: [1300, 1052], end: [1722, 1080], thickness: 92 };
const LOGO_W = 1804;

export function runIntro() {
  const root = document.querySelector<HTMLElement>('[data-intro]');
  if (!root || !html.classList.contains('intro-on')) return finish(root, true);

  const reduced = html.classList.contains('rm');
  const lite = html.classList.contains('lite');
  const logoWrap = root.querySelector<HTMLElement>('[data-intro-logo]')!;
  const logo = logoWrap.querySelector<SVGSVGElement>('svg')!;
  const part = (p: string) => logo.querySelector<SVGPathElement>(`[data-part="${p}"]`)!;
  const shadow = logo.querySelector<SVGPathElement>('.logo__swoosh-shadow');
  const heroLogo = document.querySelector<SVGSVGElement>('#hero-logo');

  let skipped = false;
  let master: gsap.core.Timeline | null = null;

  // ---- Shared element transition into the hero ----------------------------------
  const toHero = (speed = 1) => {
    const tl = gsap.timeline({ onComplete: () => finish(root) });
    const from = logo.getBoundingClientRect();
    const to = heroLogo?.getBoundingClientRect();
    tl.to(root.querySelector('[data-stage]'), { opacity: 0, duration: 0.4 / speed }, 0);
    if (reduced || !to || to.width === 0) {
      // Reduced motion: pure crossfade, no motion path.
      tl.to(root, { opacity: 0, duration: 0.5 / speed, ease: 'power1.inOut' }, 0.05);
      return tl;
    }
    const s = to.width / from.width;
    // Logo wrapper is centred with translate(-50%,-50%); switch to absolute px first.
    gsap.set(logoWrap, { left: from.left, top: from.top, xPercent: 0, yPercent: 0, x: 0, y: 0, scale: 1 });
    tl.to(logoWrap, { x: to.left - from.left, y: to.top - from.top, scale: s, duration: 0.9 / speed, ease: 'power3.inOut' }, 0)
      .to(root, { backgroundColor: 'rgba(18,17,16,0)', duration: 0.7 / speed, ease: 'power1.in' }, 0.15 / speed)
      .to(root.querySelector('[data-skip]'), { opacity: 0, duration: 0.25 }, 0);
    return tl;
  };

  const showLogoInstantly = (dur = 0.35) =>
    gsap.to([...logo.querySelectorAll('[data-part]'), shadow].filter(Boolean), {
      opacity: 1,
      clipPath: 'inset(0 0% 0 0)',
      y: 0,
      duration: dur,
      overwrite: true,
    });

  // ---- Skip: Esc, button, tap-and-hold ------------------------------------------
  const skip = () => {
    if (skipped) return;
    skipped = true;
    master?.kill();
    gsap.to(root.querySelector('[data-ribbon]'), { opacity: 0, duration: 0.3 });
    gsap.to(root.querySelector('[data-film]'), { opacity: 0, duration: 0.3 });
    showLogoInstantly().then(() => toHero(1.4));
  };
  root.querySelector('[data-skip]')!.addEventListener('click', skip);
  const onKey = (e: KeyboardEvent) => e.key === 'Escape' && skip();
  addEventListener('keydown', onKey);
  let holdTimer = 0;
  root.addEventListener('pointerdown', (e) => {
    if ((e.target as HTMLElement).closest('[data-skip]')) return;
    holdTimer = window.setTimeout(skip, 450);
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach((t) => root.addEventListener(t, () => clearTimeout(holdTimer)));
  root.addEventListener('intro:cleanup', () => removeEventListener('keydown', onKey), { once: true });

  // ---- Reduced motion: ~1.2 s crossfade of the logo over a still image -----------
  if (reduced) {
    master = gsap.timeline();
    master.add(showLogoInstantly(0.4), 0).add(() => {
      if (!skipped) {
        skipped = true;
        toHero();
      }
    }, 0.75);
    return;
  }

  // ---- Build the ribbon path for this viewport ------------------------------------
  const W = innerWidth;
  const H = innerHeight;
  const stage = root.querySelector<SVGSVGElement>('[data-stage]')!;
  stage.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const ribbon = root.querySelector<SVGPathElement>('[data-ribbon]')!;
  const filmMask = root.querySelector<SVGPathElement>('[data-film-mask]')!;
  const film = root.querySelector<SVGGElement>('[data-film]')!;
  // Low-power devices: no SVG filters at all, flat texture only.
  if (!lite) ribbon.setAttribute('filter', 'url(#dough-real)');

  const L = logo.getBoundingClientRect();
  const k = L.width / LOGO_W;
  const pt = ([x, y]: number[]) => [L.left + x! * k, L.top + y! * k] as const;
  const s0 = pt(SWOOSH.start);
  const s1 = pt(SWOOSH.c1);
  const s2 = pt(SWOOSH.c2);
  const s3 = pt(SWOOSH.end);
  const f = (n: number) => n.toFixed(1);
  const P = (x: number, y: number) => `${f(x)} ${f(y)}`;

  const partA = [
    `M${P(-0.12 * W, 0.8 * H)}`,
    `C${P(0.16 * W, 0.99 * H)} ${P(0.26 * W, 0.24 * H)} ${P(0.56 * W, 0.34 * H)}`,
    `C${P(0.84 * W, 0.44 * H)} ${P(1.04 * W, 0.84 * H)} ${P(0.76 * W, 0.9 * H)}`,
  ].join(' ');
  const partB = [
    `C${P(0.52 * W, 0.95 * H)} ${P(s0[0] - 0.2 * W, s0[1] + 0.2 * H)} ${P(s0[0], s0[1])}`,
    `C${P(s1[0], s1[1])} ${P(s2[0], s2[1])} ${P(s3[0], s3[1])}`,
  ].join(' ');
  const d = `${partA} ${partB}`;
  ribbon.setAttribute('d', d);
  filmMask.setAttribute('d', d);
  const len = ribbon.getTotalLength();
  const tmp = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  tmp.setAttribute('d', partA);
  const splitAt = tmp.getTotalLength() / len;

  const wide = Math.min(150, Math.max(70, Math.min(W, H) * 0.2));
  const thin = SWOOSH.thickness * k;
  const state = { reveal: 0, width: wide };
  const apply = () => {
    const off = len * (1 - state.reveal);
    ribbon.style.strokeDasharray = `${len} ${len}`;
    ribbon.style.strokeDashoffset = String(off);
    ribbon.style.strokeWidth = String(state.width);
    filmMask.style.strokeDasharray = `${len} ${len}`;
    filmMask.style.strokeDashoffset = String(off);
    filmMask.style.strokeWidth = String(Math.max(0, state.width - 12));
  };
  apply();

  // Film strip: frames side by side, staggered in height along the ribbon's path;
  // the ribbon only reveals slices of them. Frames stay smaller than the hero
  // photo so the intro can never become the page's LCP element.
  const frameH = H * 0.46;
  let x = 0;
  film.querySelectorAll<SVGImageElement>('image').forEach((img, i) => {
    const w = frameH * Math.min(1, Number(img.dataset.ratio) || 0.6) * 1.05;
    img.setAttribute('x', f(x));
    img.setAttribute('y', f(H * (i % 2 ? 0.48 : 0.2)));
    img.setAttribute('width', f(w));
    img.setAttribute('height', f(frameH));
    x += w + 6; // 6px "frame line" between photos
  });
  const stripW = x;
  // Stream the film frames only after the hero (LCP) image is in.
  const loadFrames = () =>
    film.querySelectorAll<SVGImageElement>('image[data-href]').forEach((img) => img.setAttribute('href', img.dataset.href!));
  const heroImg = document.querySelector<HTMLImageElement>('.hero__img');
  if (!heroImg || heroImg.complete) loadFrames();
  else {
    heroImg.addEventListener('load', loadFrames, { once: true });
    heroImg.addEventListener('error', loadFrames, { once: true });
  }
  gsap.set(film, { x: W, opacity: 0 });

  // ---- Master timeline -------------------------------------------------------
  const wm = part('wordmark');
  gsap.set(wm, { clipPath: 'inset(0 100% 0 0)', opacity: 1 });
  master = gsap.timeline({ defaults: { ease: 'power1.inOut' }, onUpdate: apply });
  master
    .to(state, { reveal: splitAt, duration: 1.85 }, 0.25)
    .to(film, { opacity: 1, duration: 0.35, ease: 'none' }, 0.35)
    .to(film, { x: -(stripW - W * 0.35), duration: 2.0, ease: 'none' }, 0.4)
    .to(film, { opacity: 0, duration: 0.4 }, 2.05)
    .to(state, { reveal: 1, duration: 1.1, ease: 'power2.in' }, 2.1)
    .to(state, { width: thin, duration: 0.95, ease: 'power2.inOut' }, 2.25)
    .to([part('swoosh'), shadow].filter(Boolean), { opacity: 1, duration: 0.4, ease: 'none' }, 3.05)
    .to(ribbon, { opacity: 0, duration: 0.35, ease: 'none' }, 3.25)
    .to(wm, { clipPath: 'inset(0 0% 0 0)', duration: 0.7, ease: 'power2.out' }, 3.1)
    .fromTo(part('emblem'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, 3.45)
    .to([part('year'), part('handmade')], { opacity: 1, duration: 0.4, stagger: 0.08 }, 3.6)
    .add(() => {
      if (!skipped) {
        skipped = true;
        toHero();
      }
    }, 4.1);
}

function finish(root: HTMLElement | null, immediate = false) {
  html.classList.remove('intro-on');
  if (root) {
    root.dispatchEvent(new Event('intro:cleanup'));
    if (immediate) root.remove();
    else requestAnimationFrame(() => root.remove());
  }
  // Scroll was locked at the top during the intro; honour a deep link now.
  if (location.hash.length > 1) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
  window.dispatchEvent(new Event('intro:done'));
  (window as unknown as { __introDone?: boolean }).__introDone = true;
}
