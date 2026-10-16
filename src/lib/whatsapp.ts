/** Builds the WhatsApp reservation message and deep link. */
import { business } from '../data/business';
import { addDaysISO, weekdayOfISO } from './hours';
import { WEEKDAYS_SR, formatDateSR } from './format';

export type Seating = 'basta' | 'unutra' | 'svejedno';

export type Reservation = {
  name: string;
  guests: number;
  /** Selected business day, ISO "YYYY-MM-DD". */
  date: string;
  /** "HH:MM" */
  time: string;
  /** True if the slot is after midnight, i.e. on the next calendar day. */
  nextDay?: boolean;
  seating: Seating;
  note?: string;
};

export const SEATING_LABEL: Record<Seating, string> = {
  basta: 'bašta',
  unutra: 'unutra',
  svejedno: 'svejedno',
};

export function buildReservationMessage(r: Reservation): string {
  // A 00:30 slot picked on Friday really happens on Saturday's calendar date.
  const calendarDate = r.nextDay ? addDaysISO(r.date, 1) : r.date;
  const weekday = WEEKDAYS_SR[weekdayOfISO(calendarDate)];
  const note = r.note?.trim() ? r.note.trim() : '—';
  return [
    'Zdravo! Želeo/la bih da rezervišem sto 🍝',
    '',
    `👤 Ime: ${r.name.trim()}`,
    `👥 Broj osoba: ${r.guests}`,
    `📅 Datum: ${weekday}, ${formatDateSR(calendarDate)}`,
    `🕐 Vreme: ${r.time}`,
    `📍 Mesto: ${SEATING_LABEL[r.seating]}`,
    `📝 Napomena: ${note}`,
    '',
    'Hvala!',
  ].join('\n');
}

/** wa.me link; encodeURIComponent keeps č ć đ š ž, emoji (UTF-8) and \n (%0A) intact. */
export function buildWhatsAppUrl(message: string, number: string = business.phone.whatsappNumber): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
