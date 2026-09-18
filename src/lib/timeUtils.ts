import { Locale } from "./i18n";

/**
 * Resolve a tipoff instant from what the database holds.
 *
 * The worker writes ESPN's ISO timestamp ("2026-10-21T23:00Z"), but a value that
 * has passed through SQLite's datetime() arrives as "2026-10-21 23:00:00" with no
 * zone marker. Both denote UTC, so both are normalised here rather than falling
 * through to a mislabelled raw string.
 */
function parseTipoff(dateStr: string, timeStr: string): Date | null {
  const raw = timeStr.trim();

  if (/\d{4}-\d{2}-\d{2}T/.test(raw)) {
    // Already ISO; add the zone only when it is genuinely absent.
    const iso = /[Zz]|[+-]\d{2}:?\d{2}$/.test(raw) ? raw : `${raw}Z`;
    return new Date(iso);
  }

  const sqlite = raw.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}(?::\d{2})?)$/);
  if (sqlite) return new Date(`${sqlite[1]}T${sqlite[2]}Z`);

  if (/\d{4}-\d{2}-\d{2}T/.test(dateStr)) return new Date(dateStr);

  const combined = new Date(`${dateStr} ${raw.replace(/\s+/g, " ")}`);
  return isNaN(combined.getTime()) ? null : combined;
}

/**
 * Format game time based on locale
 * - Chinese (zh): Shows Beijing time (UTC+8)
 * - English (en): Shows US Eastern time (ET)
 */
export function formatGameTime(
  dateStr: string,
  timeStr: string | null,
  locale: Locale
): { time: string; date: string; timezone: string } {
  // Handle null, empty, or invalid time strings
  if (!timeStr || timeStr === "0.0" || timeStr === "0" || timeStr.trim() === "" || timeStr === "TBD") {
    return { time: locale === 'zh' ? "待定" : "TBD", date: "", timezone: "" };
  }

  // If it's "Final" or a clock time for live games, return as-is
  if (timeStr === "Final" || /^\d+:\d+$/.test(timeStr) || /^\d+\.\d+$/.test(timeStr)) {
    return { time: timeStr, date: "", timezone: "" };
  }

  try {
    const dateTime = parseTipoff(dateStr, timeStr);

    // Never label an unparsed string with a timezone — claiming "ET" for a value
    // we could not interpret is worse than showing it plainly.
    if (!dateTime || isNaN(dateTime.getTime())) {
      return { time: timeStr, date: "", timezone: "" };
    }

    if (locale === "zh") {
      // Convert to Beijing time (UTC+8)
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Shanghai",
      };
      const dateOptions: Intl.DateTimeFormatOptions = {
        month: "numeric",
        day: "numeric",
        weekday: "short",
        timeZone: "Asia/Shanghai",
      };
      const timeFormatter = new Intl.DateTimeFormat("zh-CN", timeOptions);
      const dateFormatter = new Intl.DateTimeFormat("zh-CN", dateOptions);
      return {
        time: timeFormatter.format(dateTime),
        date: dateFormatter.format(dateTime),
        timezone: "北京时间",
      };
    } else {
      // US Eastern time
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "America/New_York",
      };
      const dateOptions: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "numeric",
        weekday: "short",
        timeZone: "America/New_York",
      };
      const timeFormatter = new Intl.DateTimeFormat("en-US", timeOptions);
      const dateFormatter = new Intl.DateTimeFormat("en-US", dateOptions);
      return {
        time: timeFormatter.format(dateTime),
        date: dateFormatter.format(dateTime),
        timezone: "ET",
      };
    }
  } catch {
    // Same reasoning as above: show the raw value, claim no timezone for it.
    return { time: timeStr, date: "", timezone: "" };
  }
}

/**
 * Format date based on locale
 */
export function formatGameDate(dateStr: string, locale: Locale): string {
  try {
    const date = new Date(dateStr);

    if (locale === "zh") {
      const options: Intl.DateTimeFormatOptions = {
        month: "long",
        day: "numeric",
        weekday: "short",
      };
      return new Intl.DateTimeFormat("zh-CN", options).format(date);
    } else {
      const options: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "numeric",
        weekday: "short",
      };
      return new Intl.DateTimeFormat("en-US", options).format(date);
    }
  } catch {
    return dateStr;
  }
}

/**
 * Simple time display component helper
 * Returns formatted string with date, time and timezone
 */
export function getTimeDisplay(
  dateStr: string,
  timeStr: string | null,
  locale: Locale
): string {
  const { time, date, timezone } = formatGameTime(dateStr, timeStr, locale);

  // If time is TBD, show the original date
  if (time === "TBD" || time === "待定") {
    const dateDisplay = formatGameDate(dateStr, locale);
    return `${dateDisplay} ${time}`;
  }

  // If no timezone (live games, final), just return time
  if (!timezone) return time;

  // Include date for scheduled games
  if (date) {
    return `${date} ${time} ${timezone}`;
  }

  return `${time} ${timezone}`;
}
