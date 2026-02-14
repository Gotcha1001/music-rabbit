// // convex/tutorMemos.ts

// import { v } from "convex/values";
// import { mutation, query } from "./_generated/server";

// export const create = mutation({
//   args: {
//     scheduleId: v.id("schedules"),
//     lessonId: v.string(),
//     studentId: v.id("users"),
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
//       throw new Error("Only teachers can create memos");
//     }

//     await ctx.db.insert("tutorMemos", {
//       scheduleId: args.scheduleId,
//       lessonId: args.lessonId,
//       studentId: args.studentId,
//       teacherId: teacher._id,
//       teacherName: teacher.name || teacher.email,
//       status: args.status,
//       bookUsed: args.bookUsed,
//       pageProgress: args.pageProgress,
//       reason: args.reason,
//       createdAt: Date.now(),
//     });
//   },
// });

// export const getByStudent = query({
//   args: { studentId: v.id("users") },
//   handler: async (ctx, { studentId }) => {
//     return await ctx.db
//       .query("tutorMemos")
//       .withIndex("by_student", (q) => q.eq("studentId", studentId))
//       .order("desc")
//       .collect();
//   },
// });

// export const getByLesson = query({
//   args: {
//     scheduleId: v.id("schedules"),
//     lessonId: v.string(),
//   },
//   handler: async (ctx, { scheduleId, lessonId }) => {
//     return await ctx.db
//       .query("tutorMemos")
//       .filter((q) =>
//         q.and(
//           q.eq(q.field("scheduleId"), scheduleId),
//           q.eq(q.field("lessonId"), lessonId),
//         ),
//       )
//       .first();
//   },
// });

// export const getAllMemos = query({
//   handler: async (ctx) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) return [];

//     const user = await ctx.db
//       .query("users")
//       .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
//       .first();

//     if (!user || user.role !== "admin") {
//       throw new Error("Admin access required");
//     }

//     return await ctx.db.query("tutorMemos").order("desc").collect();
//   },
// });

// convex/tutorMemos.ts
// import { v } from "convex/values";
// import { mutation, query } from "./_generated/server";
// import { Doc } from "./_generated/dataModel";

// type TutorMemo = Doc<"tutorMemos">;
// type UserDoc = Doc<"users">;
// type ScheduleDoc = Doc<"schedules">;
// type LessonInSchedule = NonNullable<ScheduleDoc["lessons"]>[number];

// export const create = mutation({
//   args: {
//     scheduleId: v.id("schedules"),
//     lessonId: v.string(),
//     studentId: v.id("users"),
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
//       throw new Error("Only teachers can create memos");
//     }

//     await ctx.db.insert("tutorMemos", {
//       scheduleId: args.scheduleId,
//       lessonId: args.lessonId,
//       studentId: args.studentId,
//       teacherId: teacher._id,
//       teacherName: teacher.name || teacher.email,
//       status: args.status,
//       bookUsed: args.bookUsed,
//       pageProgress: args.pageProgress,
//       reason: args.reason,
//       createdAt: Date.now(),
//     });
//   },
// });

// // ────────────────────────────────────────────────
// // Create a new lesson memo (teacher submits after lesson)
// // ────────────────────────────────────────────────
// export const createLessonMemo = mutation({
//   args: {
//     scheduleId: v.id("schedules"),
//     lessonId: v.string(),
//     studentId: v.optional(v.id("users")),
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
//       throw new Error("Only teachers can create memos");
//     }

//     // Prevent duplicates
//     const existing = await ctx.db
//       .query("tutorMemos")
//       .withIndex("by_schedule_lesson", (q) =>
//         q.eq("scheduleId", args.scheduleId).eq("lessonId", args.lessonId),
//       )
//       .first();

//     if (existing) {
//       throw new Error("Memo already exists for this lesson");
//     }
//     if (!args.studentId) {
//       throw new Error("studentId is required when creating a new lesson memo");
//     }

//     await ctx.db.insert("tutorMemos", {
//       ...args,
//       teacherId: teacher._id,
//       teacherName: teacher.name || teacher.email,
//       type: "lesson",
//       createdAt: Date.now(),
//     });

//     return { success: true };
//   },
// });

// // ────────────────────────────────────────────────
// // FIXED: Save / Update feedback + mark as complete
// // This is the main mutation teachers will call from the dialog
// // ────────────────────────────────────────────────
// export const submitLessonFeedback = mutation({
//   args: {
//     memoId: v.optional(v.id("tutorMemos")), // if updating an existing memo
//     scheduleId: v.optional(v.id("schedules")),
//     lessonId: v.optional(v.string()),
//     studentId: v.optional(v.id("users")),
//     status: v.optional(
//       v.union(
//         v.literal("OK"),
//         v.literal("ET"),
//         v.literal("NA"),
//         v.literal("TI"),
//         v.literal("TL"),
//       ),
//     ),
//     bookUsed: v.optional(v.string()),
//     pageProgress: v.optional(v.string()),
//     reason: v.optional(v.string()),
//     // New feedback fields
//     nextLessonFocus: v.string(),
//     nextBookPageRef: v.optional(v.string()),
//     nextPiece: v.optional(v.string()),
//     wentWell: v.array(v.string()),
//     skillRatings: v.optional(
//       v.object({
//         technique: v.optional(v.number()),
//         rhythm: v.optional(v.number()),
//         reading: v.optional(v.number()),
//         theory: v.optional(v.number()),
//         expression: v.optional(v.number()),
//       }),
//     ),
//   },
//   handler: async (ctx, args) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) throw new Error("Unauthorized");

//     const teacher = await ctx.db
//       .query("users")
//       .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
//       .first();

//     if (!teacher || teacher.role !== "teacher") {
//       throw new Error("Only teachers can submit feedback");
//     }

//     const now = Date.now();

//     // ✅ FIX: Destructure to separate memoId from the data to be stored
//     const { memoId, ...feedbackData } = args;

//     if (memoId) {
//       // Update existing memo - DON'T include memoId in the patch data
//       await ctx.db.patch(memoId, {
//         ...feedbackData,
//         teacherId: teacher._id,
//         teacherName: teacher.name || teacher.email,
//         feedbackCompleted: true,
//         markedBy: teacher._id,
//         markedAt: now,
//         updatedBy: teacher._id,
//         updatedAt: now,
//       });
//       return memoId;
//     } else {
//       // Create new (fallback - should rarely happen if dialog is used correctly)
//       const newId = await ctx.db.insert("tutorMemos", {
//         ...feedbackData,
//         teacherId: teacher._id,
//         teacherName: teacher.name || teacher.email,
//         type: "lesson",
//         createdAt: now,
//         feedbackCompleted: true,
//         markedBy: teacher._id,
//         markedAt: now,
//       });
//       return newId;
//     }
//   },
// });

// // ────────────────────────────────────────────────
// // Get pending (incomplete) feedback for a teacher
// // ────────────────────────────────────────────────
// export const getPendingFeedbackForTeacher = query({
//   args: {
//     teacherId: v.id("users"),
//   },
//   handler: async (ctx, { teacherId }) => {
//     const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;

//     // Convex query chain — TS infers TutorMemo[] after collect()
//     const pendingMemos = await ctx.db
//       .query("tutorMemos")
//       .withIndex("by_teacher", (q) => q.eq("teacherId", teacherId))
//       .filter((q) =>
//         q.and(
//           q.eq(q.field("feedbackCompleted"), false),
//           q.gt(q.field("createdAt"), fourteenDaysAgo),
//           q.eq(q.field("type"), "lesson"),
//         ),
//       )
//       .order("desc")
//       .take(20);

//     // Now map + enrich with proper types
//     const enriched = await Promise.all(
//       pendingMemos.map(async (memo: TutorMemo) => {
//         let studentName = "Unknown Student";
//         let studentImage: string | null = null;
//         let scheduleDate: string | null = null;
//         let lessonTime: string | null = null;

//         // Student — safe optional chaining
//         if (memo.studentId) {
//           const student = await ctx.db.get(memo.studentId);
//           if (student) {
//             studentName =
//               (student as UserDoc).name ??
//               (student as UserDoc).email?.split("@")[0] ??
//               "Student";
//             studentImage = (student as UserDoc).imageUrl ?? null;
//           }
//         }

//         // Schedule — safe optional chaining + type guard
//         if (memo.scheduleId && memo.lessonId) {
//           const schedule = await ctx.db.get(memo.scheduleId);
//           if (schedule) {
//             const typedSchedule = schedule as ScheduleDoc;
//             scheduleDate = typedSchedule.date ?? null;

//             // lessons is optional array → safe access
//             const lesson = typedSchedule.lessons?.find(
//               (l: LessonInSchedule) => l.lessonId === memo.lessonId,
//             );

//             lessonTime = lesson?.time ?? null;
//           }
//         }

//         return {
//           ...memo,
//           studentName,
//           studentImage,
//           scheduleDate,
//           lessonTime,
//           createdAt: memo.createdAt, // raw for frontend formatting
//         };
//       }),
//     );

//     return enriched;
//   },
// });

// // ────────────────────────────────────────────────
// // Existing useful queries (kept from your files)
// // ────────────────────────────────────────────────
// export const getByStudent = query({
//   args: { studentId: v.id("users") },
//   handler: async (ctx, { studentId }) => {
//     return await ctx.db
//       .query("tutorMemos")
//       .withIndex("by_student", (q) => q.eq("studentId", studentId))
//       .order("desc")
//       .collect();
//   },
// });

// export const getByLesson = query({
//   args: {
//     scheduleId: v.id("schedules"),
//     lessonId: v.string(),
//   },
//   handler: async (ctx, { scheduleId, lessonId }) => {
//     return await ctx.db
//       .query("tutorMemos")
//       .filter((q) =>
//         q.and(
//           q.eq(q.field("scheduleId"), scheduleId),
//           q.eq(q.field("lessonId"), lessonId),
//         ),
//       )
//       .first();
//   },
// });

// export const getAllMemos = query({
//   handler: async (ctx) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) return [];

//     const user = await ctx.db
//       .query("users")
//       .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
//       .first();

//     if (!user || user.role !== "admin") {
//       throw new Error("Admin access required");
//     }

//     return await ctx.db.query("tutorMemos").order("desc").collect();
//   },
// });

// export const getGeneralInfoForStudent = query({
//   args: {
//     studentId: v.id("users"),
//   },
//   handler: async (ctx, { studentId }) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) return null; // ← Change from throw to return null

//     const user = await ctx.db
//       .query("users")
//       .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
//       .first();

//     // ✅ Allow teachers, admins, AND the student themselves to view
//     if (
//       !user ||
//       (user.role !== "teacher" &&
//         user.role !== "admin" &&
//         user._id !== studentId)
//     ) {
//       return null; // ← Return null instead of throwing error
//     }

//     return await ctx.db
//       .query("tutorMemos")
//       .withIndex("by_student", (q) => q.eq("studentId", studentId))
//       .filter((q) => q.eq(q.field("type"), "general"))
//       .first();
//   },
// });

// // Keep general info functions if you still use them
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
//       });
//     }

//     return { success: true };
//   },
// });

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

type TutorMemo = Doc<"tutorMemos">;
type UserDoc = Doc<"users">;
type ScheduleDoc = Doc<"schedules">;
type LessonInSchedule = NonNullable<ScheduleDoc["lessons"]>[number];

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

// ────────────────────────────────────────────────
// Create a new lesson memo (teacher submits after lesson)
// ────────────────────────────────────────────────
export const createLessonMemo = mutation({
  args: {
    scheduleId: v.id("schedules"),
    lessonId: v.string(),
    studentId: v.optional(v.id("users")),
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

    // Prevent duplicates
    const existing = await ctx.db
      .query("tutorMemos")
      .withIndex("by_schedule_lesson", (q) =>
        q.eq("scheduleId", args.scheduleId).eq("lessonId", args.lessonId),
      )
      .first();

    if (existing) {
      throw new Error("Memo already exists for this lesson");
    }
    if (!args.studentId) {
      throw new Error("studentId is required when creating a new lesson memo");
    }

    await ctx.db.insert("tutorMemos", {
      ...args,
      teacherId: teacher._id,
      teacherName: teacher.name || teacher.email,
      type: "lesson",
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

// ────────────────────────────────────────────────
// FIXED: Save / Update feedback + mark as complete
// This is the main mutation teachers will call from the dialog
// ────────────────────────────────────────────────
export const submitLessonFeedback = mutation({
  args: {
    memoId: v.optional(v.id("tutorMemos")), // if updating an existing memo
    scheduleId: v.optional(v.id("schedules")),
    lessonId: v.optional(v.string()),
    studentId: v.optional(v.id("users")),
    status: v.optional(
      v.union(
        v.literal("OK"),
        v.literal("ET"),
        v.literal("NA"),
        v.literal("TI"),
        v.literal("TL"),
      ),
    ),
    bookUsed: v.optional(v.string()),
    pageProgress: v.optional(v.string()),
    reason: v.optional(v.string()),
    // New feedback fields
    nextLessonFocus: v.string(),
    nextBookPageRef: v.optional(v.string()),
    nextPiece: v.optional(v.string()),
    wentWell: v.array(v.string()),
    skillRatings: v.optional(
      v.object({
        technique: v.optional(v.number()),
        rhythm: v.optional(v.number()),
        reading: v.optional(v.number()),
        theory: v.optional(v.number()),
        expression: v.optional(v.number()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const teacher = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!teacher || teacher.role !== "teacher") {
      throw new Error("Only teachers can submit feedback");
    }

    const now = Date.now();

    // ✅ FIX: Destructure to separate memoId from the data to be stored
    const { memoId, ...feedbackData } = args;

    if (memoId) {
      // Update existing memo - DON'T include memoId in the patch data
      await ctx.db.patch(memoId, {
        ...feedbackData,
        teacherId: teacher._id,
        teacherName: teacher.name || teacher.email,
        feedbackCompleted: true,
        markedBy: teacher._id,
        markedAt: now,
        updatedBy: teacher._id,
        updatedAt: now,
      });
      return memoId;
    } else {
      // Create new (fallback - should rarely happen if dialog is used correctly)
      const newId = await ctx.db.insert("tutorMemos", {
        ...feedbackData,
        teacherId: teacher._id,
        teacherName: teacher.name || teacher.email,
        type: "lesson",
        createdAt: now,
        feedbackCompleted: true,
        markedBy: teacher._id,
        markedAt: now,
      });
      return newId;
    }
  },
});

// ────────────────────────────────────────────────
// Get pending (incomplete) feedback for a teacher
// ────────────────────────────────────────────────
export const getPendingFeedbackForTeacher = query({
  args: {
    teacherId: v.id("users"),
  },
  handler: async (ctx, { teacherId }) => {
    const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;

    // Convex query chain — TS infers TutorMemo[] after collect()
    const pendingMemos = await ctx.db
      .query("tutorMemos")
      .withIndex("by_teacher", (q) => q.eq("teacherId", teacherId))
      .filter((q) =>
        q.and(
          q.eq(q.field("feedbackCompleted"), false),
          q.gt(q.field("createdAt"), fourteenDaysAgo),
          q.eq(q.field("type"), "lesson"),
        ),
      )
      .order("desc")
      .take(20);

    // Now map + enrich with proper types
    const enriched = await Promise.all(
      pendingMemos.map(async (memo: TutorMemo) => {
        let studentName = "Unknown Student";
        let studentImage: string | null = null;
        let scheduleDate: string | null = null;
        let lessonTime: string | null = null;

        // Student — safe optional chaining
        if (memo.studentId) {
          const student = await ctx.db.get(memo.studentId);
          if (student) {
            studentName =
              (student as UserDoc).name ??
              (student as UserDoc).email?.split("@")[0] ??
              "Student";
            studentImage = (student as UserDoc).imageUrl ?? null;
          }
        }

        // Schedule — safe optional chaining + type guard
        if (memo.scheduleId && memo.lessonId) {
          const schedule = await ctx.db.get(memo.scheduleId);
          if (schedule) {
            const typedSchedule = schedule as ScheduleDoc;
            scheduleDate = typedSchedule.date ?? null;

            // lessons is optional array → safe access
            const lesson = typedSchedule.lessons?.find(
              (l: LessonInSchedule) => l.lessonId === memo.lessonId,
            );

            lessonTime = lesson?.time ?? null;
          }
        }

        return {
          ...memo,
          studentName,
          studentImage,
          scheduleDate,
          lessonTime,
          createdAt: memo.createdAt, // raw for frontend formatting
        };
      }),
    );

    return enriched;
  },
});

// ────────────────────────────────────────────────
// Existing useful queries (kept from your files)
// ────────────────────────────────────────────────
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

export const getGeneralInfoForStudent = query({
  args: {
    studentId: v.id("users"),
  },
  handler: async (ctx, { studentId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null; // ← Change from throw to return null

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    // ✅ Allow teachers, admins, AND the student themselves to view
    if (
      !user ||
      (user.role !== "teacher" &&
        user.role !== "admin" &&
        user._id !== studentId)
    ) {
      return null; // ← Return null instead of throwing error
    }

    return await ctx.db
      .query("tutorMemos")
      .withIndex("by_student", (q) => q.eq("studentId", studentId))
      .filter((q) => q.eq(q.field("type"), "general"))
      .first();
  },
});

// Keep general info functions if you still use them
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
      });
    }

    return { success: true };
  },
});
