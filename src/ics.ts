export interface IcsEvent {
  summary: string;
  date: { year: number; month: number; day: number };
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}${pad(month)}${pad(day)}`;
}

export function generateIcs(events: IcsEvent[]): string {
  const now = new Date();
  const dtstamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}T${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//lunar-ics//lunar-ics//KO',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  for (const event of events) {
    const dateStr = formatDate(event.date.year, event.date.month, event.date.day);
    const uid = `${dateStr}-${event.summary.replace(/\s/g, '')}@lunar-ics`;
    lines.push(
      'BEGIN:VEVENT',
      `DTSTART;VALUE=DATE:${dateStr}`,
      `DTEND;VALUE=DATE:${dateStr}`,
      `DTSTAMP:${dtstamp}`,
      `UID:${uid}`,
      `SUMMARY:${event.summary}`,
      'END:VEVENT',
    );
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadIcs(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
