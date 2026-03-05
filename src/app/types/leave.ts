// types/leave.ts

import { Doc } from "../../../convex/_generated/dataModel";

export type LeaveStatus = "pending" | "approved" | "rejected";

export type LeaveType =
  | "Sick Leave"
  | "Personal Leave"
  | "Emergency"
  | "Vacation"
  | "Other";

/**
 * Use the Convex-generated type directly so it always stays in sync
 * with your schema — no more manual interface drift.
 */
export type LeaveApplication = Doc<"leaveApplications">;

export interface LeaveFormValues {
  type: LeaveType | "";
  from: string;
  to: string;
  reason: string;
  substitute: string;
}
