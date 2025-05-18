import { endOfDay, format, startOfDay } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

const TIMEZONE = "Asia/Manila"; // Store this in env if needed

export function dateFormats(dateString: Date) {
  const dateFormat = new Date(dateString).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return dateFormat;
}

export function dateTimeFormats(dateString: Date) {
  const dateTimeFormat = new Date(dateString).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return dateTimeFormat;
}

export function timeFormats(dateString: Date) {
  const dateTimeFormat = new Date(dateString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return dateTimeFormat;
}

export function getDateBoundariesInTimezone(date: Date) {
  // Convert input date to Manila time
  const zonedDate = toZonedTime(date, TIMEZONE);

  // Get start and end of the day in Manila time
  const start = startOfDay(zonedDate);
  const end = endOfDay(zonedDate);

  // Convert boundaries back to UTC for database query
  const startInUTC = fromZonedTime(start, TIMEZONE);
  const endInUTC = fromZonedTime(end, TIMEZONE);

  return {
    startOfDay: startInUTC,
    endOfDay: endInUTC,
  };
}

// Helper for warehouse order creation
export function getManilaPHDateTime(date: Date) {
  const zonedDate = toZonedTime(date, TIMEZONE);
  return format(zonedDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
}

export function isWeekend(date: Date) {
  const day = toZonedTime(date, TIMEZONE).getDay();
  return day === 0 || day === 6;
}

export function getLastBusinessDay(date: Date) {
  const businessDay = toZonedTime(date, TIMEZONE);
  while (isWeekend(businessDay)) {
    businessDay.setDate(businessDay.getDate() - 1);
  }
  return businessDay;
}
