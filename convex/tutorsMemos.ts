// import { v } from "convex/values";
// import { mutation, query } from "./_generated/server";

// // Existing functions for lesson-specific memos
// export const createLessonMemo = mutation({
//   args: {
//     scheduleId: v.id("schedules"),
//     lessonId: v.string(),
//     studentId: v.id("users"),
//     teacherId: v.id("users"),
//     teacherName: v.string(),
//     status: v.union(
//       v.literal("OK"),
//       v.literal("ET"),
//       v.literal("NA"),
//       v.literal("TI"),
//       v.literal("TL"),
//     ),
//     bookUsed: v.optional(v.string()),
//     pageProgress: v.optional(v.string()),
//     reason: v.optional(v.string()),
//   },
//   handler: async (ctx, args) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) throw new Error("Unauthorized");

//     const teacher = await ctx.db
//       .query("users")
//       .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
//       .first();

//     if (!teacher || teacher.role !== "teacher") {
//       throw new Error("Only teachers can create lesson memos");
//     }

//     if (teacher._id !== args.teacherId) {
//       throw new Error("Can only create memos for your own lessons");
//     }

//     const existing = await ctx.db
//       .query("tutorMemos")
//       .withIndex("by_schedule_lesson", (q) =>
//         q.eq("scheduleId", args.scheduleId).eq("lessonId", args.lessonId),
//       )
//       .first();

//     if (existing) {
//       throw new Error("Memo already exists for this lesson");
//     }

//     await ctx.db.insert("tutorMemos", {
//       ...args,
//       type: "lesson", // Explicitly set type
//       createdAt: Date.now(),
//     });

//     return { success: true };
//   },
// });

// export const getLessonMemosForStudent = query({
//   args: { studentId: v.id("users") },
//   handler: async (ctx, { studentId }) => {
//     return await ctx.db
//       .query("tutorMemos")
//       .withIndex("by_student", (q) => q.eq("studentId", studentId))
//       .filter((q) => q.eq(q.field("type"), "lesson")) // Filter to lessons only
//       .collect();
//   },
// });

// export const getLessonMemosForTeacher = query({
//   args: { teacherId: v.id("users") },
//   handler: async (ctx, { teacherId }) => {
//     return await ctx.db
//       .query("tutorMemos")
//       .withIndex("by_teacher", (q) => q.eq("teacherId", teacherId))
//       .filter((q) => q.eq(q.field("type"), "lesson")) // Filter to lessons only
//       .collect();
//   },
// });

// // Functions for general student information (no status needed)
// export const getGeneralInfoForStudent = query({
//   args: { studentId: v.id("users") },
//   handler: async (ctx, { studentId }) => {
//     return await ctx.db
//       .query("tutorMemos")
//       .withIndex("by_student", (q) => q.eq("studentId", studentId))
//       .filter((q) => q.eq(q.field("type"), "general"))
//       .first();
//   },
// });

// export const updateGeneralInfoForStudent = mutation({
//   args: { studentId: v.id("users"), content: v.string() },
//   handler: async (ctx, { studentId, content }) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) throw new Error("Unauthorized");

//     const teacher = await ctx.db
//       .query("users")
//       .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
//       .first();

//     if (!teacher || teacher.role !== "teacher") {
//       throw new Error("Only teachers can update student information");
//     }

//     const existing = await ctx.db
//       .query("tutorMemos")
//       .withIndex("by_student", (q) => q.eq("studentId", studentId))
//       .filter((q) => q.eq(q.field("type"), "general"))
//       .first();

//     if (existing) {
//       await ctx.db.patch(existing._id, {
//         content: content.trim(),
//         updatedBy: teacher._id,
//         updatedAt: Date.now(),
//       });
//     } else {
//       await ctx.db.insert("tutorMemos", {
//         studentId,
//         type: "general",
//         content: content.trim(),
//         updatedBy: teacher._id,
//         updatedAt: Date.now(),
//         createdAt: Date.now(),
//         // No status or lesson-specific fields needed
//       });
//     }

//     return { success: true };
//   },
// });

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

// Existing functions for lesson-specific memos
export const createLessonMemo = mutation({
  args: {
    scheduleId: v.id("schedules"),
    lessonId: v.string(),
    studentId: v.id("users"),
    teacherId: v.id("users"),
    teacherName: v.string(),
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
      throw new Error("Only teachers can create lesson memos");
    }

    if (teacher._id !== args.teacherId) {
      throw new Error("Can only create memos for your own lessons");
    }

    const existing = await ctx.db
      .query("tutorMemos")
      .withIndex("by_schedule_lesson", (q) =>
        q.eq("scheduleId", args.scheduleId).eq("lessonId", args.lessonId),
      )
      .first();

    if (existing) {
      throw new Error("Memo already exists for this lesson");
    }

    await ctx.db.insert("tutorMemos", {
      ...args,
      type: "lesson", // Explicitly set type
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

export const getLessonMemosForStudent = query({
  args: { studentId: v.id("users") },
  handler: async (ctx, { studentId }) => {
    return await ctx.db
      .query("tutorMemos")
      .withIndex("by_student", (q) => q.eq("studentId", studentId))
      .filter((q) => q.eq(q.field("type"), "lesson")) // Filter to lessons only
      .collect();
  },
});

export const getLessonMemosForTeacher = query({
  args: { teacherId: v.id("users") },
  handler: async (ctx, { teacherId }) => {
    return await ctx.db
      .query("tutorMemos")
      .withIndex("by_teacher", (q) => q.eq("teacherId", teacherId))
      .filter((q) => q.eq(q.field("type"), "lesson")) // Filter to lessons only
      .collect();
  },
});

// Functions for general student information (no status needed)
export const getGeneralInfoForStudent = query({
  args: { studentId: v.id("users") },
  handler: async (ctx, { studentId }) => {
    return await ctx.db
      .query("tutorMemos")
      .withIndex("by_student", (q) => q.eq("studentId", studentId))
      .filter((q) => q.eq(q.field("type"), "general"))
      .first();
  },
});

export const updateGeneralInfoForStudent = mutation({
  args: { studentId: v.id("users"), content: v.string() },
  handler: async (ctx, { studentId, content }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const teacher = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!teacher || teacher.role !== "teacher") {
      throw new Error("Only teachers can update student information");
    }

    const existing = await ctx.db
      .query("tutorMemos")
      .withIndex("by_student", (q) => q.eq("studentId", studentId))
      .filter((q) => q.eq(q.field("type"), "general"))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        content: content.trim(),
        updatedBy: teacher._id,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("tutorMemos", {
        studentId,
        type: "general",
        content: content.trim(),
        updatedBy: teacher._id,
        updatedAt: Date.now(),
        createdAt: Date.now(),
        // No status or lesson-specific fields needed
      });
    }

    return { success: true };
  },
});
