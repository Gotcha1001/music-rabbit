import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addRecording = mutation({
  args: {
    scheduleId: v.id("schedules"),
    lessonStringId: v.string(),
    recordingUrl: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const teacher = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (teacher?.role !== "teacher") throw new Error("Teachers only");

    return await ctx.db.insert("recordings", {
      scheduleId: args.scheduleId,
      lessonStringId: args.lessonStringId,
      teacherId: teacher._id,
      recordingUrl: args.recordingUrl,
      timestamp: Date.now(),
      notes: args.notes,
    });
  },
});

export const getByTeacher = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const teacher = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!teacher) return [];

    return await ctx.db
      .query("recordings")
      .withIndex("by_teacher", (q) => q.eq("teacherId", teacher._id))
      .order("desc")
      .collect();
  },
});
