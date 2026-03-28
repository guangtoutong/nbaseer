import { Locale } from "./i18n";

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
    let dateTime: Date;

    // Check if timeStr is an ISO string (e.g., "2026-03-29T19:30Z")
    if (timeStr.includes("T") && timeStr.includes("Z")) {
      dateTime = new Date(timeStr);
    } else if (dateStr.includes("T")) {
      dateTime = new Date(dateStr);
    } else {
      // Try to combine date and time
      const cleanTime = timeStr.replace(/\s+/g, " ").trim();
      dateTime = new Date(`${dateStr} ${cleanTime}`);
    }

    // If invalid date, return original
    if (isNaN(dateTime.getTime())) {
      return { time: timeStr, date: "", timezone: locale === "zh" ? "美东" : "ET" };
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
  } catch (error) {
    // Fallback: return original time
    return { time: timeStr, date: "", timezone: locale === "zh" ? "美东" : "ET" };
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
