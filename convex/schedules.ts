import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("schedules").collect();
  },
});

export const addLesson = mutation({
  args: {
    teacherId: v.id("users"),
    date: v.string(),
    lesson: v.object({
      studentId: v.id("users"),
      time: v.string(),
      duration: v.number(),
      bookId: v.optional(v.id("books")),
      zoomLink: v.optional(v.string()),
      completed: v.boolean(),
      notes: v.optional(v.string()),
      status: v.optional(
        v.union(
          v.literal("scheduled"),
          v.literal("calling"),
          v.literal("in_progress"),
          v.literal("completed"),
          v.literal("finished_early"),
          v.literal("no_answer"),
          v.literal("teacher_late"),
          v.literal("cancelled")
        )
      ),
      statusNote: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (caller?.role !== "admin") throw new Error("Not admin");

    let schedule: Doc<"schedules"> | null = await ctx.db
      .query("schedules")
      .withIndex("by_teacher_date", (q) =>
        q.eq("teacherId", args.teacherId).eq("date", args.date)
      )
      .first();

    if (!schedule) {
      const newId = await ctx.db.insert("schedules", {
        teacherId: args.teacherId,
        date: args.date,
        lessons: [],
      });
      schedule = await ctx.db.get(newId);
      if (!schedule) throw new Error("Failed to create schedule");
    }

    const lessonId =
      Date.now().toString(36) + Math.random().toString(36).slice(2);

    const newLesson = {
      ...args.lesson,
      lessonId,
      status: args.lesson.status ?? "scheduled",
      statusNote: args.lesson.statusNote ?? undefined,
    };

    // ADD THIS ENTIRE BLOCK — SYNC BOOK TO STUDENT ON CREATION
    if (newLesson.bookId) {
      await ctx.db.patch(newLesson.studentId, {
        currentBookId: newLesson.bookId,
      });
      console.log("Book synced to student on lesson creation:", {
        studentId: newLesson.studentId,
        bookId: newLesson.bookId,
      });
    }
    // END OF NEW BLOCK

    await ctx.db.patch(schedule._id, {
      lessons: [...schedule.lessons, newLesson],
    });
  },
});

export const getByStudent = query({
  args: { studentId: v.id("users") },
  handler: async (ctx, { studentId }) => {
    const allSchedules = await ctx.db.query("schedules").collect();
    const lessons: Array<{
      scheduleId: Id<"schedules">;
      lessonId: string;
      date: string;
      time: string;
      duration: number;
      teacherId: Id<"users">;
      bookId?: Id<"books">;
      zoomLink?: string | undefined;
      completed: boolean;
      notes?: string;
      status:
        | "scheduled"
        | "calling"
        | "in_progress"
        | "completed"
        | "finished_early"
        | "no_answer"
        | "teacher_late"
        | "cancelled";
      statusNote?: string;
    }> = [];
    for (const sched of allSchedules) {
      for (const lesson of sched.lessons) {
        if (lesson.studentId === studentId) {
          lessons.push({
            scheduleId: sched._id,
            lessonId: lesson.lessonId,
            date: sched.date,
            time: lesson.time,
            duration: lesson.duration,
            teacherId: sched.teacherId,
            bookId: lesson.bookId,
            zoomLink: lesson.zoomLink,
            completed: lesson.completed,
            notes: lesson.notes,
            status: lesson.status ?? "scheduled", // ← add
            statusNote: lesson.statusNote ?? undefined, // ← add
          });
        }
      }
    }
    // newest first
    lessons.sort((a, b) =>
      `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)
    );
    return lessons;
  },
});

export const getByTeacher = query({
  args: { teacherId: v.id("users") },
  handler: async (ctx, { teacherId }) => {
    return await ctx.db
      .query("schedules")
      .withIndex("by_teacher_date", (q) => q.eq("teacherId", teacherId))
      .order("desc")
      .collect();
  },
});

export const updateLesson = mutation({
  args: {
    scheduleId: v.id("schedules"),
    lessonId: v.string(),
    updates: v.object({
      zoomLink: v.optional(v.string()),
      completed: v.optional(v.boolean()),
      notes: v.optional(v.string()),
      status: v.optional(
        v.union(
          v.literal("scheduled"),
          v.literal("calling"),
          v.literal("in_progress"),
          v.literal("completed"),
          v.literal("finished_early"),
          v.literal("no_answer"),
          v.literal("teacher_late"),
          v.literal("cancelled")
        )
      ),
      statusNote: v.optional(v.string()),
      bookId: v.optional(v.id("books")), // ← ADD THIS LINE
    }),
  },
  handler: async (ctx, { scheduleId, lessonId, updates }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const teacher = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!teacher || teacher.role !== "teacher")
      throw new Error("Not a teacher");

    const schedule = await ctx.db.get(scheduleId);
    if (!schedule || schedule.teacherId !== teacher._id)
      throw new Error("Not your schedule");

    const lessonIndex = schedule.lessons.findIndex(
      (l) => l.lessonId === lessonId
    );
    if (lessonIndex === -1) throw new Error("Lesson not found");

    const oldLesson = schedule.lessons[lessonIndex];
    const newLesson = { ...oldLesson, ...updates };

    // ──────────────────────────────────────────────────────────────
    // AUTO-SYNC BOOK TO STUDENT PROFILE
    // ──────────────────────────────────────────────────────────────
    if (updates.bookId !== undefined) {
      const studentId = oldLesson.studentId;
      if (studentId) {
        await ctx.db.patch(studentId, {
          currentBookId: updates.bookId || undefined, // null = clear book
        });
      }
    }
    // ──────────────────────────────────────────────────────────────

    // Update the lesson in the schedule
    const updatedLessons = [...schedule.lessons];
    updatedLessons[lessonIndex] = newLesson;

    await ctx.db.patch(scheduleId, { lessons: updatedLessons });

    return updatedLessons[lessonIndex];
  },
});

export const getLesson = query({
  args: { scheduleId: v.id("schedules"), lessonId: v.string() },
  handler: async (ctx, { scheduleId, lessonId }) => {
    const schedule = await ctx.db.get(scheduleId);
    if (!schedule) return null;
    const lesson = schedule.lessons.find((l) => l.lessonId === lessonId);
    if (!lesson) return null;
    return { ...lesson, date: schedule.date, teacherId: schedule.teacherId };
  },
});

// convex/schedules.ts
export const deleteLesson = mutation({
  args: { scheduleId: v.id("schedules"), lessonIndex: v.number() },
  handler: async (ctx, { scheduleId, lessonIndex }) => {
    const schedule = await ctx.db.get(scheduleId);
    if (!schedule) throw new Error("Schedule not found");

    schedule.lessons.splice(lessonIndex, 1);

    if (schedule.lessons.length === 0) {
      await ctx.db.delete(scheduleId);
    } else {
      await ctx.db.patch(scheduleId, { lessons: schedule.lessons });
    }
  },
});
