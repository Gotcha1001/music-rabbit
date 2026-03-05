// convex/leave.ts

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const TOTAL_ANNUAL_DAYS = 12;

/** Returns the current academic year as a string, e.g. "2025". */
function currentAcademicYear(): string {
  return String(new Date().getFullYear());
}

// ─────────────────────────────────────────────────────────────────────────────
// QUERIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Teacher: fetch all their own leave applications for the current academic year.
 * Used on the teacher leave page to show history + calculate days remaining.
 */
export const getMyLeave = query({
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
      throw new Error("Only teachers can view their leave");

    const year = currentAcademicYear();

    return await ctx.db
      .query("leaveApplications")
      .withIndex("by_teacher_year", (q) =>
        q.eq("teacherId", user._id).eq("academicYear", year),
      )
      .order("desc")
      .collect();
  },
});

/**
 * Teacher: returns how many leave days they have used this year
 * (pending + approved — rejected are excluded).
 * Exposed separately so the form can show the live counter.
 */
export const getMyUsedDays = query({
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

    const year = currentAcademicYear();

    const leaves = await ctx.db
      .query("leaveApplications")
      .withIndex("by_teacher_year", (q) =>
        q.eq("teacherId", user._id).eq("academicYear", year),
      )
      .collect();

    const used = leaves
      .filter((l) => l.status !== "rejected")
      .reduce((sum, l) => sum + l.days, 0);

    return {
      used,
      remaining: TOTAL_ANNUAL_DAYS - used,
      total: TOTAL_ANNUAL_DAYS,
    };
  },
});

/**
 * Admin: fetch ALL leave applications across all teachers,
 * optionally filtered by status.
 */
export const getAllLeave = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("approved"),
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
        .query("leaveApplications")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    }

    return await ctx.db.query("leaveApplications").order("desc").collect();
  },
});

/**
 * Admin: fetch leave applications for a specific teacher.
 * Useful for the teacher profile or a filtered admin view.
 */
export const getLeaveByTeacher = query({
  args: {
    teacherId: v.id("users"),
    academicYear: v.optional(v.string()),
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

    const year = args.academicYear ?? currentAcademicYear();

    return await ctx.db
      .query("leaveApplications")
      .withIndex("by_teacher_year", (q) =>
        q.eq("teacherId", args.teacherId).eq("academicYear", year),
      )
      .order("desc")
      .collect();
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// MUTATIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Teacher: submit a new leave application.
 * Validates the 12-day annual quota before inserting.
 */
export const submitLeave = mutation({
  args: {
    type: v.union(
      v.literal("Sick Leave"),
      v.literal("Personal Leave"),
      v.literal("Emergency"),
      v.literal("Vacation"),
      v.literal("Other"),
    ),
    from: v.string(),
    to: v.string(),
    days: v.number(),
    reason: v.string(),
    substitute: v.optional(v.string()),
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
      throw new Error("Only teachers can apply for leave");

    // Validate days value
    if (args.days <= 0) throw new Error("Invalid date range");

    const year = currentAcademicYear();

    // Check quota — count pending + approved, not rejected
    const existing = await ctx.db
      .query("leaveApplications")
      .withIndex("by_teacher_year", (q) =>
        q.eq("teacherId", user._id).eq("academicYear", year),
      )
      .collect();

    const usedDays = existing
      .filter((l) => l.status !== "rejected")
      .reduce((sum, l) => sum + l.days, 0);

    if (usedDays + args.days > TOTAL_ANNUAL_DAYS) {
      throw new Error(
        `Insufficient leave days. You have ${TOTAL_ANNUAL_DAYS - usedDays} day(s) remaining.`,
      );
    }

    return await ctx.db.insert("leaveApplications", {
      teacherId: user._id,
      teacherName: user.name ?? user.email,
      type: args.type,
      from: args.from,
      to: args.to,
      days: args.days,
      reason: args.reason,
      substitute: args.substitute,
      status: "pending",
      submittedAt: Date.now(),
      academicYear: year,
    });
  },
});

/**
 * Admin: approve or reject a leave application.
 * Records who decided and when, plus an optional note for the teacher.
 */
export const decideLeave = mutation({
  args: {
    leaveId: v.id("leaveApplications"),
    status: v.union(v.literal("approved"), v.literal("rejected")),
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

    const leave = await ctx.db.get(args.leaveId);
    if (!leave) throw new Error("Leave application not found");
    if (leave.status !== "pending") {
      throw new Error("This application has already been actioned");
    }

    await ctx.db.patch(args.leaveId, {
      status: args.status,
      adminNote: args.adminNote,
      decidedAt: Date.now(),
      decidedBy: admin._id,
    });
  },
});

/**
 * Teacher: withdraw a pending leave application.
 * Only allowed while the application is still pending.
 */
export const withdrawLeave = mutation({
  args: {
    leaveId: v.id("leaveApplications"),
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

    const leave = await ctx.db.get(args.leaveId);
    if (!leave) throw new Error("Leave application not found");
    if (leave.teacherId !== user._id) throw new Error("Not your application");
    if (leave.status !== "pending") {
      throw new Error("Can only withdraw pending applications");
    }

    await ctx.db.delete(args.leaveId);
  },
});
