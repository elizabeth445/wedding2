import { weddingConfig as c } from '../config/weddingConfig';
const escapeICS = (value: string) =>
  value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
const utc = (value: string) =>
  new Date(value)
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
export function createCalendar() {
  const location = [c.venue.name, c.venue.address].filter(Boolean).join(', ');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AM Wedding//Invitation//UK',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    'UID:anastasiia-mark-20270825@wedding.local',
    `DTSTAMP:${utc(new Date().toISOString())}`,
    `DTSTART:${utc(c.date)}`,
    `DTEND:${utc(c.endDate)}`,
    `SUMMARY:${escapeICS(`Весілля: ${c.couple.together}`)}`,
    `LOCATION:${escapeICS(location)}`,
    `DESCRIPTION:${escapeICS(c.venue.name ? c.title : `${c.title} Точну локацію повідомимо особисто.`)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  // RFC 5545 folds content lines at no more than 75 UTF-8 octets.
  const encoder = new TextEncoder();
  return (
    lines
      .map((line) => {
        let result = '';
        let bytes = 0;
        for (const char of line) {
          const length = encoder.encode(char).length;
          if (bytes + length > 75) {
            result += '\r\n ';
            bytes = 1;
          }
          result += char;
          bytes += length;
        }
        return result;
      })
      .join('\r\n') + '\r\n'
  );
}
export function downloadCalendar() {
  const url = URL.createObjectURL(
    new Blob([createCalendar()], { type: 'text/calendar;charset=utf-8' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = 'anastasiia-mark.ics';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function validExternalURL(value: string): string | undefined {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : undefined;
  } catch {
    return undefined;
  }
}
