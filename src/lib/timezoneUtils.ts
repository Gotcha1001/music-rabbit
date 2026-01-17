import { format, toZonedTime } from "date-fns-tz";

export const TIMEZONE_LIST = [
  // ── North America ──
  {
    label: "Pacific Time (PT)",
    value: "America/Los_Angeles",
    region: "North America",
  },
  {
    label: "Mountain Time (MT)",
    value: "America/Denver",
    region: "North America",
  },
  {
    label: "Central Time (CT)",
    value: "America/Chicago",
    region: "North America",
  },
  {
    label: "Eastern Time (ET)",
    value: "America/New_York",
    region: "North America",
  },
  { label: "Atlantic Time", value: "America/Halifax", region: "North America" },
  { label: "Alaska", value: "America/Anchorage", region: "North America" },
  { label: "Hawaii", value: "Pacific/Honolulu", region: "North America" },
  {
    label: "Mexico City",
    value: "America/Mexico_City",
    region: "North America",
  },
  {
    label: "Toronto / Ottawa",
    value: "America/Toronto",
    region: "North America",
  },

  // ── South America ──
  {
    label: "São Paulo / Rio",
    value: "America/Sao_Paulo",
    region: "South America",
  },
  {
    label: "Buenos Aires",
    value: "America/Argentina/Buenos_Aires",
    region: "South America",
  },
  { label: "Lima, Peru", value: "America/Lima", region: "South America" },
  {
    label: "Bogotá, Colombia",
    value: "America/Bogota",
    region: "South America",
  },
  {
    label: "Santiago, Chile",
    value: "America/Santiago",
    region: "South America",
  },

  // ── Europe ──
  { label: "London (GMT/BST)", value: "Europe/London", region: "Europe" },
  {
    label: "Paris / Berlin / Rome (CET/CEST)",
    value: "Europe/Paris",
    region: "Europe",
  },
  {
    label: "Amsterdam / Brussels",
    value: "Europe/Amsterdam",
    region: "Europe",
  },
  { label: "Warsaw / Prague", value: "Europe/Warsaw", region: "Europe" },
  { label: "Athens / Helsinki", value: "Europe/Athens", region: "Europe" },
  { label: "Moscow (MSK)", value: "Europe/Moscow", region: "Europe" },
  { label: "Kyiv, Ukraine", value: "Europe/Kyiv", region: "Europe" },

  // ── Africa ──
  {
    label: "Cape Town / Johannesburg (SAST)",
    value: "Africa/Johannesburg",
    region: "Africa",
  },
  { label: "Cairo, Egypt (EET)", value: "Africa/Cairo", region: "Africa" },
  { label: "Lagos, Nigeria (WAT)", value: "Africa/Lagos", region: "Africa" },
  { label: "Nairobi, Kenya (EAT)", value: "Africa/Nairobi", region: "Africa" },
  {
    label: "Casablanca, Morocco",
    value: "Africa/Casablanca",
    region: "Africa",
  },
  {
    label: "Addis Ababa, Ethiopia",
    value: "Africa/Addis_Ababa",
    region: "Africa",
  },

  // ── Middle East ──
  { label: "Dubai (GST)", value: "Asia/Dubai", region: "Middle East" },
  {
    label: "Riyadh, Saudi Arabia",
    value: "Asia/Riyadh",
    region: "Middle East",
  },
  { label: "Baghdad, Iraq", value: "Asia/Baghdad", region: "Middle East" },
  { label: "Tehran, Iran", value: "Asia/Tehran", region: "Middle East" },
  {
    label: "Istanbul, Turkey",
    value: "Europe/Istanbul",
    region: "Middle East",
  },

  // ── Asia ──
  { label: "Mumbai / Delhi (IST)", value: "Asia/Kolkata", region: "Asia" },
  { label: "Bangkok (ICT)", value: "Asia/Bangkok", region: "Asia" },
  { label: "Jakarta, Indonesia", value: "Asia/Jakarta", region: "Asia" },
  { label: "Singapore (SGT)", value: "Asia/Singapore", region: "Asia" },
  { label: "Manila, Philippines", value: "Asia/Manila", region: "Asia" },
  { label: "Kuala Lumpur", value: "Asia/Kuala_Lumpur", region: "Asia" },
  { label: "Hong Kong", value: "Asia/Hong_Kong", region: "Asia" },
  { label: "Taipei, Taiwan", value: "Asia/Taipei", region: "Asia" },
  { label: "Seoul, South Korea", value: "Asia/Seoul", region: "Asia" },
  { label: "Tokyo, Japan", value: "Asia/Tokyo", region: "Asia" },
  { label: "Beijing / Shanghai", value: "Asia/Shanghai", region: "Asia" },

  // ── Oceania ──
  { label: "Sydney / Melbourne", value: "Australia/Sydney", region: "Oceania" },
  { label: "Brisbane", value: "Australia/Brisbane", region: "Oceania" },
  { label: "Perth", value: "Australia/Perth", region: "Oceania" },
  {
    label: "Auckland, New Zealand",
    value: "Pacific/Auckland",
    region: "Oceania",
  },
  { label: "Fiji", value: "Pacific/Fiji", region: "Oceania" },
  { label: "Guam", value: "Pacific/Guam", region: "Oceania" },
];

// Keep your existing functions unchanged below...
export function getTimezoneAbbr(timezone: string): string {
  const now = new Date();
  const zonedTime = toZonedTime(now, timezone);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "short",
  });
  const parts = formatter.formatToParts(zonedTime);
  const abbr = parts.find((part) => part.type === "timeZoneName")?.value;
  return abbr || timezone.split("/").pop()?.replace(/_/g, " ") || "???";
}

export function formatTimeInTimezone(
  date: Date | number,
  timezone: string,
  formatStr: string = "HH:mm:ss"
): string {
  const zonedTime = toZonedTime(date, timezone);
  return format(zonedTime, formatStr, { timeZone: timezone });
}

export function formatTimeWithTimezone(
  date: Date | number,
  timezone: string
): string {
  const zonedTime = toZonedTime(date, timezone);
  const timeStr = format(zonedTime, "HH:mm:ss");
  const abbr = getTimezoneAbbr(timezone);
  return `${timeStr} ${abbr}`;
}

export function getCurrentTimeInTimezone(timezone: string): Date {
  return toZonedTime(new Date(), timezone);
}

export function getTimezoneOffset(tz1: string, tz2: string): number {
  const now = new Date();
  const time1 = toZonedTime(now, tz1);
  const time2 = toZonedTime(now, tz2);
  return (time1.getTime() - time2.getTime()) / (1000 * 60 * 60);
}
