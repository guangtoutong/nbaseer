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
): { time: string; timezone: string } {
  if (!timeStr) {
    return { time: "TBD", timezone: "" };
  }

  try {
    // Parse the date and time
    // ESPN times are typically in US Eastern Time
    let dateTime: Date;

    // Try to parse ISO format first
    if (dateStr.includes("T")) {
      dateTime = new Date(dateStr);
    } else {
      // Combine date and time string
      // Assume time is in format like "7:30 PM" or "19:30"
      const cleanTime = timeStr.replace(/\s+/g, " ").trim();
      dateTime = new Date(`${dateStr} ${cleanTime}`);

      // If invalid, try alternative parsing
      if (isNaN(dateTime.getTime())) {
        // Just return the original time with ET timezone
        if (locale === "zh") {
          return { time: timeStr, timezone: "美东" };
        }
        return { time: timeStr, timezone: "ET" };
      }
    }

    if (locale === "zh") {
      // Convert to Beijing time (UTC+8)
      // US Eastern is UTC-5 (EST) or UTC-4 (EDT)
      // Beijing is UTC+8, so difference is 13 hours (EST) or 12 hours (EDT)
      const options: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Shanghai",
      };
      const formatter = new Intl.DateTimeFormat("zh-CN", options);
      return {
        time: formatter.format(dateTime),
        timezone: "北京时间",
      };
    } else {
      // US Eastern time
      const options: Intl.DateTimeFormatOptions = {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "America/New_York",
      };
      const formatter = new Intl.DateTimeFormat("en-US", options);
      return {
        time: formatter.format(dateTime),
        timezone: "ET",
      };
    }
  } catch (error) {
    // Fallback: return original time
    if (locale === "zh") {
      return { time: timeStr, timezone: "美东" };
    }
    return { time: timeStr, timezone: "ET" };
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
 * Returns formatted string with time and timezone
 */
export function getTimeDisplay(
  dateStr: string,
  timeStr: string | null,
  locale: Locale
): string {
  const { time, timezone } = formatGameTime(dateStr, timeStr, locale);
  if (!timezone) return time;
  return `${time} ${timezone}`;
}
