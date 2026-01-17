// convex/tutorMemos.ts

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    scheduleId: v.id("schedules"),
    lessonId: v.string(),
    studentId: v.id("users"),
    status: v.union(
      v.literal("OK"),
      v.literal("ET"),
      v.literal("NA"),
      v.literal("TI"),
      v.literal("TL"),
    ),
    bookUsed: v.optional(v.string()),
    pageProgress: v.optional(v.string()),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const teacher = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!teacher || teacher.role !== "teacher") {
      throw new Error("Only teachers can create memos");
    }

    await ctx.db.insert("tutorMemos", {
      scheduleId: args.scheduleId,
      lessonId: args.lessonId,
      studentId: args.studentId,
      teacherId: teacher._id,
      teacherName: teacher.name || teacher.email,
      status: args.status,
      bookUsed: args.bookUsed,
      pageProgress: args.pageProgress,
      reason: args.reason,
      createdAt: Date.now(),
    });
  },
});

export const getByStudent = query({
  args: { studentId: v.id("users") },
  handler: async (ctx, { studentId }) => {
    return await ctx.db
      .query("tutorMemos")
      .withIndex("by_student", (q) => q.eq("studentId", studentId))
      .order("desc")
      .collect();
  },
});

export const getByLesson = query({
  args: {
    scheduleId: v.id("schedules"),
    lessonId: v.string(),
  },
  handler: async (ctx, { scheduleId, lessonId }) => {
    return await ctx.db
      .query("tutorMemos")
      .filter((q) =>
        q.and(
          q.eq(q.field("scheduleId"), scheduleId),
          q.eq(q.field("lessonId"), lessonId),
        ),
      )
      .first();
  },
});

export const getAllMemos = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
    }

    return await ctx.db.query("tutorMemos").order("desc").collect();
  },
});
