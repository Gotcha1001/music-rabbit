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

    // Generate unique lessonId (simple method; consider nanoid if installed)
    const lessonId =
      Date.now().toString(36) + Math.random().toString(36).slice(2);

    const newLesson = {
      ...args.lesson,
      lessonId,
    };

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

    const index = schedule.lessons.findIndex((l) => l.lessonId === lessonId);
    if (index === -1) throw new Error("Lesson not found");

    const lessons = [...schedule.lessons];
    lessons[index] = { ...lessons[index], ...updates };

    await ctx.db.patch(scheduleId, { lessons });
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
