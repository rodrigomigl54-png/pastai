/** Run `init` once the element is within ~1.5 viewports, or on idle as a fallback. */
export function whenNear(selector: string, init: () => void) {
  const el = document.querySelector(selector);
  if (!el) return;
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    io.disconnect();
    init();
  };
  const io = new IntersectionObserver((e) => e.some((x) => x.isIntersecting) && run(), { rootMargin: '150% 0px' });
  io.observe(el);
  // Deep links / in-page jumps: make sure it is ready even if never observed nearby.
  addEventListener('intro:done', () => setTimeout(() => ('requestIdleCallback' in window ? requestIdleCallback(run) : run()), 2500), { once: true });
}
