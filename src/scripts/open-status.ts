/** Live "open now" pills + today's row in the hours table. Updates every minute. */
import { getOpenStatus, localParts } from '../lib/hours';

export function initOpenStatus() {
  const pills = document.querySelectorAll<HTMLElement>('[data-open-status]');
  const rows = document.querySelectorAll<HTMLElement>('tr[data-day]');

  const tick = () => {
    const now = new Date();
    const status = getOpenStatus(now);
    pills.forEach((pill) => {
      pill.dataset.state = status.open ? 'open' : 'closed';
      pill.querySelector('[data-open-label]')!.textContent = status.label;
    });
    // After midnight on a late shift the "business day" is still yesterday.
    const { weekday, minutes } = localParts(now);
    const prev = (weekday + 6) % 7;
    const day = status.open && minutes < 8 * 60 ? prev : weekday;
    rows.forEach((r) => {
      const on = Number(r.dataset.day) === day;
      r.classList.toggle('is-today', on);
      if (on) r.setAttribute('aria-current', 'date');
      else r.removeAttribute('aria-current');
    });
  };

  tick();
  // Align to the next full minute, then every 60 s.
  setTimeout(() => {
    tick();
    setInterval(tick, 60_000);
  }, 60_000 - (Date.now() % 60_000));
}
