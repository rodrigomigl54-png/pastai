import { describe, expect, it } from 'vitest';
import { buildReservationMessage, buildWhatsAppUrl } from '../src/lib/whatsapp';
import { formatPrice } from '../src/lib/format';

describe('buildReservationMessage', () => {
  it('formats the message exactly like the template', () => {
    const msg = buildReservationMessage({
      name: '  Đorđe Šćepanović ',
      guests: 4,
      date: '2026-10-16',
      time: '20:30',
      seating: 'basta',
      note: 'Proslava rođendana, bez orašastih plodova',
    });
    expect(msg).toBe(
      [
        'Zdravo! Želeo/la bih da rezervišem sto 🍝',
        '',
        '👤 Ime: Đorđe Šćepanović',
        '👥 Broj osoba: 4',
        '📅 Datum: petak, 16.10.2026.',
        '🕐 Vreme: 20:30',
        '📍 Mesto: bašta',
        '📝 Napomena: Proslava rođendana, bez orašastih plodova',
        '',
        'Hvala!',
      ].join('\n'),
    );
  });

  it('uses "—" for an empty note', () => {
    const msg = buildReservationMessage({ name: 'Ana', guests: 2, date: '2026-10-19', time: '12:00', seating: 'svejedno', note: '   ' });
    expect(msg).toContain('📝 Napomena: —');
    expect(msg).toContain('📅 Datum: ponedeljak, 19.10.2026.');
  });

  it('after-midnight slot moves to the next calendar date', () => {
    const msg = buildReservationMessage({ name: 'Ana', guests: 2, date: '2026-10-16', time: '00:00', nextDay: true, seating: 'unutra' });
    expect(msg).toContain('📅 Datum: subota, 17.10.2026.');
  });
});

describe('buildWhatsAppUrl', () => {
  const msg = 'Zdravo 🍝\nčćđšž ČĆĐŠŽ & ? # +';
  const url = buildWhatsAppUrl(msg);

  it('targets the restaurant number', () => {
    expect(url.startsWith('https://wa.me/381637019741?text=')).toBe(true);
  });
  it('round-trips diacritics, emoji and line breaks', () => {
    const encoded = url.split('?text=')[1]!;
    expect(decodeURIComponent(encoded)).toBe(msg);
    expect(encoded).toContain('%0A'); // newline
    expect(encoded).toContain('%F0%9F%8D%9D'); // 🍝 as UTF-8
    expect(encoded).toContain('%C4%8D'); // č
    expect(encoded).not.toMatch(/[&#?+ ]/); // reserved chars escaped
  });
  it('URL parser sees exactly one text param', () => {
    expect(new URL(url).searchParams.get('text')).toBe(msg);
  });
});

describe('formatPrice', () => {
  it.each([
    [1180, '1.180 RSD'],
    [880, '880 RSD'],
    [1280, '1.280 RSD'],
    [12500, '12.500 RSD'],
    [1000000, '1.000.000 RSD'],
    [0, '0 RSD'],
  ])('%i -> %s', (n, out) => expect(formatPrice(n)).toBe(out));
});
