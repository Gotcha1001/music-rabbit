// lib/leaveUtils.ts

import type { LeaveApplication, LeaveStatus } from "../app/types/leave";

export const LEAVE_TYPES = [
  "Sick Leave",
  "Personal Leave",
  "Emergency",
  "Vacation",
  "Other",
] as const;

export const TOTAL_ANNUAL_LEAVE_DAYS = 12;

/**
 * Returns the number of calendar days between two ISO date strings, inclusive.
 * Returns 0 if either value is missing or the range is invalid.
 */
export function calcDays(from: string, to: string): number {
  if (!from || !to) return 0;
  const diff =
    Math.ceil(
      (new Date(to).getTime() - new Date(from).getTime()) / 86_400_000,
    ) + 1;
  return diff > 0 ? diff : 0;
}

/**
 * Formats an ISO date string for display.
 */
export function fmtDate(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Calculates how many leave days a teacher has consumed in the current year.
 * Counts both pending and approved — rejected applications are excluded.
 */
export function calcUsedDays(
  leaves: LeaveApplication[],
  teacherId: string,
): number {
  return leaves
    .filter((l) => l.teacherId === teacherId && l.status !== "rejected")
    .reduce((sum, l) => sum + l.days, 0);
}

/**
 * Returns the remaining leave days for a teacher.
 */
export function calcRemainingDays(
  leaves: LeaveApplication[],
  teacherId: string,
): number {
  return TOTAL_ANNUAL_LEAVE_DAYS - calcUsedDays(leaves, teacherId);
}

/**
 * Sorts leave applications newest-first.
 */
export function sortByNewest(leaves: LeaveApplication[]): LeaveApplication[] {
  return [...leaves].sort(
    (a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  );
}

/**
 * Filters leaves by status. Passing "all" returns the full array.
 */
export function filterByStatus(
  leaves: LeaveApplication[],
  status: LeaveStatus | "all",
): LeaveApplication[] {
  if (status === "all") return leaves;
  return leaves.filter((l) => l.status === status);
}
