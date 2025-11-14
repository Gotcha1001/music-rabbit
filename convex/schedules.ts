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

    await ctx.db.patch(schedule._id, {
      lessons: [...schedule.lessons, args.lesson],
    });
  },
});

export const getByStudent = query({
  args: { studentId: v.id("users") },
  handler: async (ctx, { studentId }) => {
    const allSchedules = await ctx.db.query("schedules").collect();

    const lessons: Array<{
      scheduleId: Id<"schedules">;
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
    lessonIndex: v.number(),
    updates: v.object({
      zoomLink: v.optional(v.string()),
      completed: v.optional(v.boolean()),
      notes: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { scheduleId, lessonIndex, updates }) => {
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

    const lessons = [...schedule.lessons];
    lessons[lessonIndex] = { ...lessons[lessonIndex], ...updates };

    await ctx.db.patch(scheduleId, { lessons });
  },
});
import { defineSchema, defineTable } from "convex/server";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("teacher"),
      v.literal("student")
    ),
    email: v.string(),
    instrument: v.optional(v.string()),
    currentTeacher: v.optional(v.id("users")), // ← student’s preferred teacher
    tokenIdentifier: v.string(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_token", ["tokenIdentifier"])
    .index("by_role", ["role"])
    .index("by_role_instrument", ["role", "instrument"]),

  schedules: defineTable({
    teacherId: v.id("users"),
    date: v.string(), // YYYY-MM-DD
    lessons: v.array(
      v.object({
        studentId: v.id("users"),
        time: v.string(), // HH:MM
        duration: v.number(), // Minutes
        bookId: v.optional(v.id("books")),
        zoomLink: v.optional(v.string()),
        completed: v.boolean(),
        notes: v.optional(v.string()),
      })
    ),
  }).index("by_teacher_date", ["teacherId", "date"]),

  books: defineTable({
    title: v.string(),
    level: v.string(), // basic/advanced
    instrument: v.string(),
    fileId: v.id("_storage"), // Convex storage ID for PDF
  }),

  messages: defineTable({
    fromId: v.id("users"),
    toId: v.id("users"),
    content: v.string(),
    timestamp: v.number(),
  }).index("by_to", ["toId"]),

  payments: defineTable({
    teacherId: v.id("users"),
    month: v.string(), // YYYY-MM
    totalHours: v.number(),
    earnings: v.number(), // Calculated
    deductions: v.number(),
  }),
  // NEW: Invite codes table
  inviteCodes: defineTable({
    code: v.string(),
    createdBy: v.string(), // Clerk ID of admin who created it
    usedCount: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    description: v.optional(v.string()),
    role: v.union(v.literal("teacher"), v.literal("student")), // Role-specific
  })
    .index("by_code", ["code"])
    .index("by_createdBy", ["createdBy"])
    .index("by_isActive", ["isActive"])
    .index("by_role", ["role"]),
});
