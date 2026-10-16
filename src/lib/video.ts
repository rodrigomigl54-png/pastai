/**
 * Runtime rendition picker for videos produced by scripts/encode-video.sh.
 * <source media> handles orientation where supported; this tiny selector is
 * the fallback and also honours DPR and network quality.
 */
export type Rendition = { src: string; type: string; height: number; portrait: boolean };

type NetInfo = { effectiveType?: string; saveData?: boolean };

export function pickRendition(list: Rendition[], env = runtimeEnv()): Rendition | undefined {
  const pool = list.filter((r) => r.portrait === env.portrait && (env.av1 || !r.type.includes('av01')));
  const candidates = pool.length ? pool : list;
  // Slow network or data saver -> 720p, whatever the screen.
  const target = env.slow ? 720 : Math.ceil((env.portrait ? env.width : env.height) * Math.min(env.dpr, 2));
  const sorted = [...candidates].sort((a, b) => a.height - b.height);
  return sorted.find((r) => r.height >= target) ?? sorted.at(-1);
}

export function runtimeEnv() {
  const conn = (navigator as Navigator & { connection?: NetInfo }).connection;
  const slow = Boolean(conn?.saveData) || /(^|-)(2g|3g)$/.test(conn?.effectiveType ?? '');
  const v = document.createElement('video');
  return {
    portrait: innerHeight > innerWidth,
    width: innerWidth,
    height: innerHeight,
    dpr: devicePixelRatio || 1,
    slow,
    av1: v.canPlayType('video/mp4; codecs="av01.0.08M.08"') === 'probably',
  };
}

/** Autoplay only while in view; pause when out of view. */
export function playWhenVisible(video: HTMLVideoElement) {
  new IntersectionObserver(([e]) => (e!.isIntersecting ? video.play().catch(() => {}) : video.pause()), {
    threshold: 0.25,
  }).observe(video);
}
