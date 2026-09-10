/** Local day key used for daily-period state (e.g. hydration). */
export function todayKey(date = new Date()): string {
  const y = String(date.getFullYear()).padStart(4, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Compact local clock display, e.g. "10:35 AM". */
export function nowDisplayTime(date = new Date()): string {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function nowIso(date = new Date()): string {
  return date.toISOString();
}

const TIME_RE = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;

/**
 * True when a "8:00 AM"-style label is strictly before now (today).
 * Used to show a calm "Due" state without a scheduler.
 */
export function isPastTime(timeLabel: string, date = new Date()): boolean {
  const m = TIME_RE.exec(timeLabel.trim());
  if (!m) return false;
  let hour = Number(m[1]) % 12;
  if (m[3].toUpperCase() === 'PM') hour += 12;
  const scheduled = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, Number(m[2]), 0);
  return scheduled < date;
}

/** Split "8:00 AM" -> ["8:00", "AM"] for the clock-face display. */
export function splitTimeLabel(timeLabel: string): [string, string] {
  const m = TIME_RE.exec(timeLabel.trim());
  if (!m) return [timeLabel, ''];
  return [`${m[1]}:${m[2]}`, m[3].toUpperCase()];
}