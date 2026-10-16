/**
 * Opening-hours logic, always evaluated in Europe/Belgrade time regardless of
 * the visitor's timezone. Handles shifts that close after midnight
 * (Fri/Sat -> 01:00 the next calendar day).
 */
import { business, type DayHours, type Weekday } from '../data/business';
import { LAST_RESERVATION_OFFSET_MIN, RESERVATION_SLOT_STEP_MIN, TIMEZONE } from '../config/site';

export type Schedule = Record<Weekday, DayHours>;

/** Wall-clock parts of `date` in the restaurant's timezone. */
export type LocalParts = {
  year: number;
  month: number; // 1-12
  day: number;
  weekday: Weekday;
  minutes: number; // minutes since local midnight
};

const WEEKDAY_INDEX: Record<string, Weekday> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

const partsFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TIMEZONE,
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  weekday: 'short',
  hour: 'numeric',
  minute: 'numeric',
  hourCycle: 'h23',
});

export function localParts(date: Date): LocalParts {
  const p: Record<string, string> = {};
  for (const { type, value } of partsFormatter.formatToParts(date)) p[type] = value;
  return {
    year: Number(p.year),
    month: Number(p.month),
    day: Number(p.day),
    weekday: WEEKDAY_INDEX[p.weekday!]!,
    minutes: (Number(p.hour) % 24) * 60 + Number(p.minute),
  };
}

export const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number);
  return h! * 60 + m!;
};

export const formatMinutes = (min: number): string => {
  const m = ((min % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

/** Shift of a weekday as [open, close) in minutes from that day's midnight; close may exceed 1440. */
export function shiftRange(day: DayHours): [number, number] {
  const open = toMinutes(day.open);
  const close = toMinutes(day.close) + (day.closesNextDay ? 1440 : 0);
  return [open, close];
}

const prevDay = (d: Weekday): Weekday => ((d + 6) % 7) as Weekday;
const nextDay = (d: Weekday): Weekday => ((d + 1) % 7) as Weekday;

export type OpenStatus =
  | { open: true; closesAt: string; label: string }
  | { open: false; opensAt: string; opensTomorrow: boolean; label: string };

/**
 * Is the restaurant open at `now`? After midnight we first check whether
 * yesterday's shift is still running (e.g. Saturday 00:30 belongs to Friday).
 */
export function getOpenStatus(now: Date, schedule: Schedule = business.hours): OpenStatus {
  const { weekday, minutes } = localParts(now);

  const [, yClose] = shiftRange(schedule[prevDay(weekday)]);
  if (yClose > 1440 && minutes < yClose - 1440) {
    const closesAt = formatMinutes(yClose);
    return { open: true, closesAt, label: `Otvoreno sada · zatvara se u ${closesAt}` };
  }

  const [open, close] = shiftRange(schedule[weekday]);
  if (minutes >= open && minutes < close) {
    const closesAt = formatMinutes(close);
    return { open: true, closesAt, label: `Otvoreno sada · zatvara se u ${closesAt}` };
  }

  if (minutes < open) {
    const opensAt = formatMinutes(open);
    return { open: false, opensAt, opensTomorrow: false, label: `Zatvoreno · otvara se u ${opensAt}` };
  }
  const opensAt = formatMinutes(shiftRange(schedule[nextDay(weekday)])[0]);
  return { open: false, opensAt, opensTomorrow: true, label: `Zatvoreno · otvara se sutra u ${opensAt}` };
}

export type Slot = {
  /** "HH:MM" as shown to the guest. */
  time: string;
  /** Minutes from the selected day's midnight (>= 1440 means after midnight). */
  minutes: number;
  /** True when the slot falls on the next calendar day (after midnight). */
  nextDay: boolean;
};

/**
 * Reservation slots for a weekday: every `step` minutes from opening until
 * closing minus `offset`. If `nowMinutes` is given (the chosen day is today),
 * slots that already started are dropped.
 */
export function reservationSlots(
  weekday: Weekday,
  opts: { nowMinutes?: number; offset?: number; step?: number; schedule?: Schedule } = {},
): Slot[] {
  const { offset = LAST_RESERVATION_OFFSET_MIN, step = RESERVATION_SLOT_STEP_MIN, schedule = business.hours } = opts;
  const [open, close] = shiftRange(schedule[weekday]);
  const last = close - offset;
  const slots: Slot[] = [];
  for (let m = open; m <= last; m += step) {
    if (opts.nowMinutes !== undefined && m <= opts.nowMinutes) continue;
    slots.push({ time: formatMinutes(m), minutes: m, nextDay: m >= 1440 });
  }
  return slots;
}

/** ISO date (YYYY-MM-DD) of "today" in Belgrade. */
export function todayISO(now: Date = new Date()): string {
  const p = localParts(now);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

/** Weekday of an ISO calendar date (timezone-independent). */
export function weekdayOfISO(iso: string): Weekday {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y!, m! - 1, d!)).getUTCDay() as Weekday;
}

/** Add days to an ISO calendar date. */
export function addDaysISO(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const t = new Date(Date.UTC(y!, m! - 1, d! + days));
  return t.toISOString().slice(0, 10);
}
