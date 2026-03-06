// convex/resignation.ts
// ─────────────────────────────────────────────────────────────────────────────
// Convex queries & mutations for teacher resignations.
//
// NOTICE RULE:
//   - lastWorkingDay must be AT LEAST 1 calendar month from today.
//   - If a teacher submits with less than 1 month notice, the submission is
//     still accepted but flagged as `shortNotice: true`.
//   - Short-notice resignations result in no pay for the final month
//     (admin is shown the flag; payroll logic should check this field).
// ─────────────────────────────────────────────────────────────────────────────

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

export type ResignationStatus = "pending" | "acknowledged" | "rejected";

/**
 * Use the Convex-generated type directly so it always stays in sync
 * with your schema — no more manual interface drift.
 */
export type Resignation = Doc<"resignations">;

export interface ResignationFormValues {
  lastWorkingDay: string;
  reason: string;
  handoverNotes: string;
}
/**
 * Returns true if lastWorkingDay is at least 1 calendar month from today.
 * e.g. if today is 2025-06-01, lastWorkingDay must be >= 2025-07-01.
 */
function hasFullMonthNotice(lastWorkingDay: string): boolean {
  const today = new Date();
  const minDate = new Date(today);
  minDate.setMonth(minDate.getMonth() + 1);
  minDate.setHours(0, 0, 0, 0);
  const lwd = new Date(lastWorkingDay);
  lwd.setHours(0, 0, 0, 0);
  return lwd >= minDate;
}

// ─── QUERIES ────────────────────────────────────────────────────────────────

/** Teacher: fetch their own resignation submissions (most-recent first). */
export const getMyResignations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!user) throw new Error("User not found");
    if (user.role !== "teacher")
      throw new Error("Only teachers can view their resignations");

    return await ctx.db
      .query("resignations")
      .withIndex("by_teacher", (q) => q.eq("teacherId", user._id))
      .order("desc")
      .collect();
  },
});

/** Admin: fetch ALL resignations, optionally filtered by status. */
export const getAllResignations = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("acknowledged"),
        v.literal("rejected"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!user) throw new Error("User not found");
    if (user.role !== "admin") throw new Error("Admin only");

    if (args.status) {
      return await ctx.db
        .query("resignations")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    }

    return await ctx.db.query("resignations").order("desc").collect();
  },
});

// ─── MUTATIONS ───────────────────────────────────────────────────────────────

/**
 * Teacher: submit a resignation notice.
 *
 * - lastWorkingDay must be a future date.
 * - If lastWorkingDay is less than 1 full month away, shortNotice = true
 *   and the teacher is warned upfront that final-month pay will be forfeited.
 * - A teacher can only have one pending resignation at a time.
 */
export const submitResignation = mutation({
  args: {
    lastWorkingDay: v.string(),
    reason: v.string(),
    handoverNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!user) throw new Error("User not found");
    if (user.role !== "teacher")
      throw new Error("Only teachers can submit a resignation");

    // Must be a future date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lwd = new Date(args.lastWorkingDay);
    lwd.setHours(0, 0, 0, 0);
    if (lwd <= today) {
      throw new Error("Last working day must be a future date.");
    }

    // Guard: only one pending at a time
    const existing = await ctx.db
      .query("resignations")
      .withIndex("by_teacher", (q) => q.eq("teacherId", user._id))
      .collect();

    const hasPending = existing.some((r) => r.status === "pending");
    if (hasPending) {
      throw new Error(
        "You already have a pending resignation. Please wait for admin review.",
      );
    }

    // Flag if they have NOT given the required 1-month notice
    const shortNotice = !hasFullMonthNotice(args.lastWorkingDay);

    return await ctx.db.insert("resignations", {
      teacherId: user._id,
      teacherName: user.name ?? user.email,
      lastWorkingDay: args.lastWorkingDay,
      reason: args.reason,
      handoverNotes: args.handoverNotes,
      shortNotice,
      status: "pending",
      submittedAt: Date.now(),
    });
  },
});

/** Admin: acknowledge or reject a resignation. */
export const decideResignation = mutation({
  args: {
    resignationId: v.id("resignations"),
    status: v.union(v.literal("acknowledged"), v.literal("rejected")),
    adminNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!admin) throw new Error("User not found");
    if (admin.role !== "admin") throw new Error("Admin only");

    const resignation = await ctx.db.get(args.resignationId);
    if (!resignation) throw new Error("Resignation not found");
    if (resignation.status !== "pending") {
      throw new Error("This resignation has already been actioned");
    }

    await ctx.db.patch(args.resignationId, {
      status: args.status,
      adminNote: args.adminNote,
      decidedAt: Date.now(),
      decidedBy: admin._id,
    });
  },
});

/** Teacher: withdraw a pending resignation before it is reviewed. */
export const withdrawResignation = mutation({
  args: {
    resignationId: v.id("resignations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
    if (!user) throw new Error("User not found");

    const resignation = await ctx.db.get(args.resignationId);
    if (!resignation) throw new Error("Resignation not found");
    if (resignation.teacherId !== user._id)
      throw new Error("Not your resignation");
    if (resignation.status !== "pending")
      throw new Error("Can only withdraw pending resignations");

    await ctx.db.delete(args.resignationId);
  },
});
