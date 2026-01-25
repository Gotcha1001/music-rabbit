import { parse } from "date-fns";

export function parseTimeToMinutes(timeStr: string): number {
  const date = parse(timeStr, "HH:mm", new Date());
  return date.getHours() * 60 + date.getMinutes();
}
