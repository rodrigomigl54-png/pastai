import { describe, expect, it } from 'vitest';
import { addDaysISO, getOpenStatus, localParts, reservationSlots, todayISO, weekdayOfISO } from '../src/lib/hours';

// Oct 2026: Thu 15, Fri 16, Sat 17, Sun 18, Mon 19. Belgrade = UTC+2 (CEST).
const at = (iso: string) => new Date(iso);

describe('localParts', () => {
  it('reads Belgrade wall-clock time regardless of the input offset', () => {
    // 22:30 UTC on Fri = 00:30 Sat in Belgrade
    const p = localParts(at('2026-10-16T22:30:00Z'));
    expect(p.weekday).toBe(6);
    expect(p.minutes).toBe(30);
  });
  it('handles winter time (UTC+1)', () => {
    const p = localParts(at('2026-12-04T23:30:00Z')); // Sat 00:30 CET
    expect(p.weekday).toBe(6);
    expect(p.minutes).toBe(30);
  });
});

describe('getOpenStatus', () => {
  it('Friday 00:30 is still Thursday night -> closed (Thursday closes 23:00)', () => {
    const s = getOpenStatus(at('2026-10-16T00:30:00+02:00'));
    expect(s.open).toBe(false);
    expect(s.label).toBe('Zatvoreno · otvara se u 08:00');
  });
  it('Saturday 00:30 is still the Friday shift -> open until 01:00', () => {
    const s = getOpenStatus(at('2026-10-17T00:30:00+02:00'));
    expect(s.open).toBe(true);
    expect(s.label).toBe('Otvoreno sada · zatvara se u 01:00');
  });
  it('Sunday 00:30 is still the Saturday shift -> open', () => {
    const s = getOpenStatus(at('2026-10-18T00:30:00+02:00'));
    expect(s.open).toBe(true);
  });
  it('Sunday 01:00 exactly -> closed, opens 08:00 same day', () => {
    const s = getOpenStatus(at('2026-10-18T01:00:00+02:00'));
    expect(s).toMatchObject({ open: false, opensAt: '08:00', opensTomorrow: false });
  });
  it('Monday 00:30 -> closed (Sunday closes 23:00)', () => {
    expect(getOpenStatus(at('2026-10-19T00:30:00+02:00')).open).toBe(false);
  });
  it('Thursday 22:59 open, 23:00 closed and opens tomorrow', () => {
    expect(getOpenStatus(at('2026-10-15T22:59:00+02:00'))).toMatchObject({ open: true, closesAt: '23:00' });
    const s = getOpenStatus(at('2026-10-15T23:00:00+02:00'));
    expect(s).toMatchObject({ open: false, opensTomorrow: true });
    expect(s.label).toBe('Zatvoreno · otvara se sutra u 08:00');
  });
  it('Friday 20:00 -> closes at 01:00', () => {
    expect(getOpenStatus(at('2026-10-16T20:00:00+02:00'))).toMatchObject({ open: true, closesAt: '01:00' });
  });
  it('07:59 closed, 08:00 open', () => {
    expect(getOpenStatus(at('2026-10-14T07:59:00+02:00')).open).toBe(false);
    expect(getOpenStatus(at('2026-10-14T08:00:00+02:00')).open).toBe(true);
  });
});

describe('reservationSlots', () => {
  it('weekday: 08:00 … 22:00 in 30-min steps (last = 1h before 23:00)', () => {
    const s = reservationSlots(3);
    expect(s[0]!.time).toBe('08:00');
    expect(s.at(-1)!.time).toBe('22:00');
    expect(s).toHaveLength(29);
    expect(s.every((x) => !x.nextDay)).toBe(true);
  });
  it('Friday runs past midnight: last slot 00:00 on the next calendar day', () => {
    const s = reservationSlots(5);
    const last = s.at(-1)!;
    expect(last.time).toBe('00:00');
    expect(last.nextDay).toBe(true);
    expect(s.find((x) => x.time === '23:30')!.nextDay).toBe(false);
    expect(s).toHaveLength(33);
  });
  it('Saturday also ends with 00:00', () => {
    expect(reservationSlots(6).at(-1)!.time).toBe('00:00');
  });
  it('drops slots that already started today', () => {
    const s = reservationSlots(1, { nowMinutes: 14 * 60 + 10 });
    expect(s[0]!.time).toBe('14:30');
  });
  it('respects a custom offset', () => {
    expect(reservationSlots(1, { offset: 30 }).at(-1)!.time).toBe('22:30');
  });
  it('no slots left late in the evening', () => {
    expect(reservationSlots(1, { nowMinutes: 22 * 60 + 5 })).toHaveLength(0);
  });
});

describe('ISO date helpers', () => {
  it('todayISO is Belgrade-local', () => {
    expect(todayISO(at('2026-10-16T22:30:00Z'))).toBe('2026-10-17');
  });
  it('weekdayOfISO / addDaysISO across month ends', () => {
    expect(weekdayOfISO('2026-10-16')).toBe(5);
    expect(addDaysISO('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDaysISO('2026-12-31', 1)).toBe('2027-01-01');
  });
});
