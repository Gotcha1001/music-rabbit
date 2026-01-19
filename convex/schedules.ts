import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

// UPDATED: New types matching new payment rules
type LessonState =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "missed_teacher"
  | "missed_student";

type LessonStatus =
  | "completed" // Full pay
  | "finished_early" // Full pay - student requested
  | "no_answer_on_time" // Full pay - teacher on time, student no-show
  | "teacher_never_called" // $20 deduction - teacher missed
  | "technical_difficulty" // No pay from either side
  | "teacher_late"; // Full pay - $5 deduction

export type Lesson = {
  lessonId: string;
  studentId: Id<"users">;
  time: string;
  duration: number;
  bookId: Id<"books"> | null;
  zoomLink?: string;
  completed: boolean;
  notes?: string;
  startedAt?: number;
  status: LessonStatus;
  state: LessonState;
  endedAt?: number;
  actualMinutes?: number;
  onTime?: boolean;
  joinedAt?: number;
};

// Helper to convert HH:mm to minutes
function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

// Helper to convert minutes to HH:mm
function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("schedules").collect();
  },
});

// ADMIN: Add a new lesson
export const addLesson = mutation({
  args: {
    teacherId: v.id("users"),
    date: v.string(),
    lesson: v.object({
      studentId: v.id("users"),
      time: v.string(),
      duration: v.number(),
      bookId: v.optional(v.union(v.id("books"), v.null())),
      zoomLink: v.optional(v.string()),
      completed: v.boolean(),
      notes: v.optional(v.string()),
      startedAt: v.optional(v.number()),
      status: v.union(
        v.literal("completed"),
        v.literal("finished_early"),
        v.literal("no_answer_on_time"),
        v.literal("teacher_never_called"),
        v.literal("technical_difficulty"),
        v.literal("teacher_late"),
      ),
      state: v.optional(
        v.union(
          v.literal("scheduled"),
          v.literal("in_progress"),
          v.literal("completed"),
          v.literal("missed_teacher"),
          v.literal("missed_student"),
        ),
      ),
      endedAt: v.optional(v.number()),
      actualMinutes: v.optional(v.number()),
      onTime: v.optional(v.boolean()),
      joinedAt: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (caller?.role !== "admin") throw new Error("Admin only");

    let schedule: Doc<"schedules"> | null = await ctx.db
      .query("schedules")
      .withIndex("by_teacher_date", (q) =>
        q.eq("teacherId", args.teacherId).eq("date", args.date),
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

    const newLesson: Lesson = {
      ...args.lesson,
      bookId: args.lesson.bookId ?? null,
      lessonId,
      startedAt: args.lesson.startedAt ?? undefined,
      status: args.lesson.status ?? ("completed" as const),
      state: args.lesson.state ?? ("scheduled" as const),
      endedAt: args.lesson.endedAt ?? undefined,
      actualMinutes: args.lesson.actualMinutes ?? undefined,
      onTime: args.lesson.onTime ?? undefined,
      joinedAt: args.lesson.joinedAt ?? undefined,
    };

    if (newLesson.bookId != null) {
      await ctx.db.patch(newLesson.studentId, {
        currentBookId: newLesson.bookId,
      });
    }

    await ctx.db.patch(schedule._id, {
      lessons: [...schedule.lessons, newLesson],
    });

    return { scheduleId: schedule._id, lessonId };
  },
});

// TEACHER: Start a lesson
export const startLesson = mutation({
  args: {
    scheduleId: v.id("schedules"),
    lessonId: v.string(),
  },
  handler: async (ctx, { scheduleId, lessonId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const teacher = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!teacher || teacher.role !== "teacher")
      throw new Error("Only teachers can start lessons");

    const schedule = await ctx.db.get(scheduleId);
    if (!schedule || schedule.teacherId !== teacher._id)
      throw new Error("Not your schedule");

    const lessonIndex = schedule.lessons.findIndex(
      (l) => l.lessonId === lessonId,
    );
    if (lessonIndex === -1) throw new Error("Lesson not found");

    const oldLesson = schedule.lessons[lessonIndex] as Lesson;

    if (oldLesson.state !== "scheduled") {
      throw new Error("Lesson can only be started from scheduled state");
    }

    const now = Date.now();
    const [year, month, day] = schedule.date.split("-").map(Number);
    const [hour, minute] = oldLesson.time.split(":").map(Number);
    const scheduledTime = new Date(
      year,
      month - 1,
      day,
      hour,
      minute,
    ).getTime();

    const isOnTime = now <= scheduledTime + 60000; // 1 min grace

    const newLesson: Lesson = {
      ...oldLesson,
      state: "in_progress" as const,
      startedAt: now,
      onTime: isOnTime,
      status: isOnTime ? ("completed" as const) : ("teacher_late" as const),
    };

    const updatedLessons = [...schedule.lessons];
    updatedLessons[lessonIndex] = newLesson;

    await ctx.db.patch(scheduleId, { lessons: updatedLessons });

    return { success: true, onTime: isOnTime };
  },
});

// TEACHER: End a lesson
export const endLesson = mutation({
  args: {
    scheduleId: v.id("schedules"),
    lessonId: v.string(),
    status: v.optional(
      v.union(
        v.literal("completed"),
        v.literal("finished_early"),
        v.literal("no_answer_on_time"),
        v.literal("technical_difficulty"),
        v.literal("teacher_late"),
      ),
    ),
  },
  handler: async (ctx, { scheduleId, lessonId, status }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!caller || (caller.role !== "teacher" && caller.role !== "admin"))
      throw new Error("Only teachers or admins can end lessons");

    const schedule = await ctx.db.get(scheduleId);
    if (!schedule) throw new Error("Schedule not found");

    if (caller.role === "teacher" && schedule.teacherId !== caller._id) {
      throw new Error("Not your schedule");
    }

    const lessonIndex = schedule.lessons.findIndex(
      (l) => l.lessonId === lessonId,
    );
    if (lessonIndex === -1) throw new Error("Lesson not found");

    const oldLesson = schedule.lessons[lessonIndex] as Lesson;
    if (oldLesson.state !== "in_progress")
      throw new Error("Lesson can only be ended from in_progress state");

    const now = Date.now();
    const actualMinutes = Math.round(
      (now - (oldLesson.startedAt ?? 0)) / 60000,
    );

    // Use provided status or keep existing (e.g., if already teacher_late from start)
    const finalStatus = status ?? oldLesson.status;

    const newLesson: Lesson = {
      ...oldLesson,
      state: "completed" as const,
      status: finalStatus,
      endedAt: now,
      actualMinutes,
    };

    const updatedLessons = [...schedule.lessons];
    updatedLessons[lessonIndex] = newLesson;

    await ctx.db.patch(scheduleId, { lessons: updatedLessons });

    // Deduct minutes from student package
    const student = await ctx.db.get(oldLesson.studentId);
    if (student) {
      const activePackage = await ctx.db
        .query("studentPackages")
        .withIndex("by_student", (q) => q.eq("studentId", student._id))
        .filter((q) =>
          q.and(
            q.eq(q.field("status"), "active"),
            q.gt(q.field("remainingMinutes"), 0),
          ),
        )
        .first();
      if (activePackage) {
        await ctx.db.patch(activePackage._id, {
          remainingMinutes: Math.max(
            0,
            activePackage.remainingMinutes -
              (actualMinutes ?? oldLesson.duration),
          ),
        });
      }
    }
    return { success: true, status: finalStatus, actualMinutes };
  },
});

// TEACHER/ADMIN: General updates
export const updateLesson = mutation({
  args: {
    scheduleId: v.id("schedules"),
    lessonId: v.string(),
    updates: v.object({
      zoomLink: v.optional(v.string()),
      notes: v.optional(v.string()),
      bookId: v.optional(v.union(v.id("books"), v.null())),
      state: v.optional(
        v.union(
          v.literal("scheduled"),
          v.literal("in_progress"),
          v.literal("completed"),
          v.literal("missed_teacher"),
          v.literal("missed_student"),
        ),
      ),
      forceStatus: v.optional(
        v.union(
          v.literal("completed"),
          v.literal("finished_early"),
          v.literal("no_answer_on_time"),
          v.literal("teacher_never_called"),
          v.literal("technical_difficulty"),
          v.literal("teacher_late"),
        ),
      ),
    }),
  },
  handler: async (ctx, { scheduleId, lessonId, updates }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!caller || (caller.role !== "teacher" && caller.role !== "admin"))
      throw new Error("Only teachers or admins can update lessons");

    const schedule = await ctx.db.get(scheduleId);
    if (!schedule) throw new Error("Schedule not found");

    if (caller.role === "teacher" && schedule.teacherId !== caller._id) {
      throw new Error("Not your schedule");
    }

    const lessonIndex = schedule.lessons.findIndex(
      (l) => l.lessonId === lessonId,
    );
    if (lessonIndex === -1) throw new Error("Lesson not found");

    const oldLesson = schedule.lessons[lessonIndex] as Lesson;

    if (updates.state && caller.role !== "admin") {
      throw new Error("Only admins can manually override state");
    }

    // CHANGE HERE: Destructure to separate forceStatus and state, creating a safe object for spreading
    const { forceStatus, state, ...safeUpdates } = updates;

    const newLesson: Lesson = {
      ...oldLesson,
      ...safeUpdates, // Now only spreads schema-safe fields (zoomLink, notes, bookId)
      bookId: updates.bookId !== undefined ? updates.bookId : oldLesson.bookId,
      status: forceStatus ?? oldLesson.status, // Handles override without adding extra field
      state: state ?? oldLesson.state,
    };

    if ("bookId" in updates) {
      await ctx.db.patch(oldLesson.studentId, {
        currentBookId: updates.bookId ?? undefined,
      });
    }

    const updatedLessons = [...schedule.lessons];
    updatedLessons[lessonIndex] = newLesson;

    await ctx.db.patch(scheduleId, { lessons: updatedLessons });

    return updatedLessons[lessonIndex];
  },
});

// STUDENT: Join a lesson
export const studentJoin = mutation({
  args: {
    scheduleId: v.id("schedules"),
    lessonId: v.string(),
  },
  handler: async (ctx, { scheduleId, lessonId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const student = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!student || student.role !== "student")
      throw new Error("Only students can join lessons");

    const schedule = await ctx.db.get(scheduleId);
    if (!schedule) throw new Error("Schedule not found");

    const lessonIndex = schedule.lessons.findIndex(
      (l) => l.lessonId === lessonId,
    );
    if (lessonIndex === -1) throw new Error("Lesson not found");

    const oldLesson = schedule.lessons[lessonIndex] as Lesson;
    if (oldLesson.studentId !== student._id) throw new Error("Not your lesson");

    if (oldLesson.state !== "in_progress") {
      throw new Error("Can only join in-progress lessons");
    }

    const newLesson: Lesson = {
      ...oldLesson,
      joinedAt: Date.now(),
    };

    const updatedLessons = [...schedule.lessons];
    updatedLessons[lessonIndex] = newLesson;

    await ctx.db.patch(scheduleId, { lessons: updatedLessons });

    return newLesson;
  },
});

// ADMIN: Mark lesson as "teacher never called"
export const markTeacherNeverCalled = mutation({
  args: {
    scheduleId: v.id("schedules"),
    lessonId: v.string(),
  },
  handler: async (ctx, { scheduleId, lessonId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!caller || caller.role !== "admin")
      throw new Error("Only admins can mark teacher never called");

    const schedule = await ctx.db.get(scheduleId);
    if (!schedule) throw new Error("Schedule not found");

    const lessonIndex = schedule.lessons.findIndex(
      (l) => l.lessonId === lessonId,
    );
    if (lessonIndex === -1) throw new Error("Lesson not found");

    const oldLesson = schedule.lessons[lessonIndex] as Lesson;

    const newLesson: Lesson = {
      ...oldLesson,
      state: "missed_teacher",
      status: "teacher_never_called",
      endedAt: Date.now(),
    };

    const updatedLessons = [...schedule.lessons];
    updatedLessons[lessonIndex] = newLesson;

    await ctx.db.patch(scheduleId, { lessons: updatedLessons });
  },
});

// TEACHER/ADMIN: Mark lesson as missed
export const markMissed = mutation({
  args: {
    scheduleId: v.id("schedules"),
    lessonId: v.string(),
    missedBy: v.union(v.literal("teacher"), v.literal("student")),
  },
  handler: async (ctx, { scheduleId, lessonId, missedBy }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!caller || (caller.role !== "teacher" && caller.role !== "admin"))
      throw new Error("Only teachers or admins can mark missed lessons");

    const schedule = await ctx.db.get(scheduleId);
    if (!schedule) throw new Error("Schedule not found");

    if (caller.role === "teacher" && schedule.teacherId !== caller._id) {
      throw new Error("Not your schedule");
    }

    const lessonIndex = schedule.lessons.findIndex(
      (l) => l.lessonId === lessonId,
    );
    if (lessonIndex === -1) throw new Error("Lesson not found");

    const oldLesson = schedule.lessons[lessonIndex] as Lesson;

    if (!["scheduled", "in_progress"].includes(oldLesson.state)) {
      throw new Error("Can only mark missed from scheduled or in_progress");
    }

    const newState: LessonState =
      missedBy === "teacher" ? "missed_teacher" : "missed_student";

    const newLesson: Lesson = {
      ...oldLesson,
      state: newState,
      status:
        missedBy === "teacher" ? "teacher_never_called" : "no_answer_on_time",
    };

    if (oldLesson.state === "in_progress" && missedBy === "student") {
      newLesson.endedAt = Date.now();
      newLesson.actualMinutes = Math.round(
        ((newLesson.endedAt ?? 0) - (oldLesson.startedAt ?? 0)) / 60000,
      );
    }

    const updatedLessons = [...schedule.lessons];
    updatedLessons[lessonIndex] = newLesson;

    await ctx.db.patch(scheduleId, { lessons: updatedLessons });
  },
});

// Auto-check for missed lessons (runs via cron)
export const checkMissedLessons = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    const recentSchedules = await ctx.db
      .query("schedules")
      .filter((q) => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 1);
        return q.gte(q.field("date"), cutoff.toISOString().split("T")[0]);
      })
      .collect();

    for (const sched of recentSchedules) {
      let needsUpdate = false;
      const updatedLessons = [...sched.lessons] as Lesson[];

      for (let i = 0; i < updatedLessons.length; i++) {
        const lesson = updatedLessons[i];
        const [year, month, day] = sched.date.split("-").map(Number);
        const [hour, minute] = lesson.time.split(":").map(Number);
        const scheduledTime = new Date(
          year,
          month - 1,
          day,
          hour,
          minute,
        ).getTime();

        // Check if teacher never started (15 min past scheduled time)
        if (
          lesson.state === "scheduled" &&
          now > scheduledTime + 15 * 60 * 1000
        ) {
          updatedLessons[i] = {
            ...lesson,
            state: "missed_teacher" as const,
            status: "teacher_never_called" as const,
          };
          needsUpdate = true;
        }

        // Check for missed student (5 min after start, no joinedAt)
        if (
          lesson.state === "in_progress" &&
          lesson.startedAt &&
          now > lesson.startedAt + 5 * 60 * 1000 &&
          lesson.joinedAt === undefined
        ) {
          updatedLessons[i] = {
            ...lesson,
            state: "missed_student" as const,
            status: "no_answer_on_time" as const,
            endedAt: now,
            actualMinutes: 0,
          };
          needsUpdate = true;
        }

        // Auto-complete stuck in-progress lessons
        if (
          lesson.state === "in_progress" &&
          lesson.startedAt &&
          now > lesson.startedAt + (lesson.duration + 30) * 60 * 1000
        ) {
          updatedLessons[i] = {
            ...lesson,
            state: "completed" as const,
            status: "completed" as const,
            endedAt: now,
            actualMinutes: Math.round((now - lesson.startedAt) / 60000),
          };
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        await ctx.db.patch(sched._id, { lessons: updatedLessons });
      }
    }
  },
});

// Get lessons by student
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
      bookId?: Id<"books"> | null;
      zoomLink?: string;
      completed: boolean;
      notes?: string;
      startedAt?: number;
      status: LessonStatus;
      state: LessonState;
      endedAt?: number;
      actualMinutes?: number;
      onTime?: boolean;
      joinedAt?: number;
    }> = [];

    for (const sched of allSchedules) {
      for (const lesson of sched.lessons as Lesson[]) {
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
            startedAt: lesson.startedAt,
            status: lesson.status,
            state: lesson.state,
            endedAt: lesson.endedAt,
            actualMinutes: lesson.actualMinutes,
            onTime: lesson.onTime,
            joinedAt: lesson.joinedAt,
          });
        }
      }
    }

    lessons.sort((a, b) =>
      `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`),
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

export const getLesson = query({
  args: { scheduleId: v.id("schedules"), lessonId: v.string() },
  handler: async (ctx, { scheduleId, lessonId }) => {
    const schedule = await ctx.db.get(scheduleId);
    if (!schedule) return null;
    const lesson = schedule.lessons.find((l) => l.lessonId === lessonId) as
      | Lesson
      | undefined;
    if (!lesson) return null;
    return { ...lesson, date: schedule.date, teacherId: schedule.teacherId };
  },
});

// ADMIN/TEACHER: Delete lesson (no penalty, for admin cleanup)
export const adminDeleteLesson = mutation({
  args: {
    scheduleId: v.id("schedules"),
    lessonId: v.string(),
  },
  handler: async (ctx, { scheduleId, lessonId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    const schedule = await ctx.db.get(scheduleId);
    if (!schedule) throw new Error("Schedule not found");

    const lessonIndex = schedule.lessons.findIndex(
      (l) => l.lessonId === lessonId,
    );
    if (lessonIndex === -1) throw new Error("Lesson not found");

    const lesson = schedule.lessons[lessonIndex] as Lesson;

    if (caller?.role !== "teacher" && caller?.role !== "admin") {
      throw new Error("Unauthorized");
    }

    if (caller?.role === "teacher" && schedule.teacherId !== caller._id) {
      throw new Error("Not your schedule");
    }

    const updatedLessons = [...schedule.lessons];
    updatedLessons.splice(lessonIndex, 1);

    if (updatedLessons.length === 0) {
      await ctx.db.delete(scheduleId);
    } else {
      await ctx.db.patch(scheduleId, { lessons: updatedLessons });
    }

    return { success: true };
  },
});

export const getByTeacherWithTimezones = query({
  args: { teacherId: v.id("users") },
  handler: async (ctx, { teacherId }) => {
    const schedules = await ctx.db
      .query("schedules")
      .withIndex("by_teacher_date", (q) => q.eq("teacherId", teacherId))
      .order("desc")
      .collect();

    const enrichedSchedules = await Promise.all(
      schedules.map(async (schedule) => {
        const lessonsWithStudentTz = await Promise.all(
          schedule.lessons.map(async (lesson) => {
            const student = await ctx.db.get(lesson.studentId);
            return {
              ...lesson,
              studentTimezone: student?.timezone,
              studentCountry: student?.country,
            };
          }),
        );
        return { ...schedule, lessons: lessonsWithStudentTz };
      }),
    );

    return enrichedSchedules;
  },
});

export const getLatenessStats = query({
  args: { teacherId: v.id("users") },
  handler: async (ctx, { teacherId }) => {
    const schedules = await ctx.db
      .query("schedules")
      .withIndex("by_teacher_date", (q) => q.eq("teacherId", teacherId))
      .collect();

    let totalLessons = 0;
    let lateCount = 0;

    for (const sched of schedules) {
      for (const lesson of sched.lessons as Lesson[]) {
        if (lesson.startedAt !== undefined && lesson.onTime !== undefined) {
          totalLessons++;
          if (!lesson.onTime) lateCount++;
        }
      }
    }

    return {
      totalLessons,
      lateCount,
      latePercentage: (lateCount / totalLessons) * 100 || 0,
    };
  },
});

export const getLessonWithBook = query({
  args: { scheduleId: v.id("schedules"), lessonId: v.string() },
  handler: async (ctx, { scheduleId, lessonId }) => {
    const schedule = await ctx.db.get(scheduleId);
    if (!schedule) return null;

    const lessons = schedule.lessons.map((l) => ({
      lessonId: l.lessonId,
      bookId: l.bookId,
    }));

    const lesson = schedule.lessons.find((l) => l.lessonId === lessonId) as
      | Lesson
      | undefined;
    if (!lesson) return null;

    const book = lesson.bookId ? await ctx.db.get(lesson.bookId) : null;

    return {
      ...lesson,
      date: schedule.date,
      teacherId: schedule.teacherId,
      bookTitle: book?.title,
      bookInstrument: book?.instrument,
      bookLevel: book?.levelNumber,
      driveViewLink: book?.driveViewLink,
      driveDownloadLink: book?.driveDownloadLink,
    };
  },
});

// NEW: Get available slots for a date
export const getAvailableSlots = query({
  args: {
    teacherId: v.id("users"),
    date: v.string(), // yyyy-MM-dd
    duration: v.number(),
  },
  handler: async (ctx, { teacherId, date, duration }) => {
    const schedule = await ctx.db
      .query("schedules")
      .withIndex("by_teacher_date", (q) =>
        q.eq("teacherId", teacherId).eq("date", date),
      )
      .first();

    const occupied: { startMin: number; endMin: number }[] = [];
    if (schedule) {
      for (const lesson of schedule.lessons as Lesson[]) {
        const startMin = timeToMinutes(lesson.time);
        const endMin = startMin + lesson.duration;
        occupied.push({ startMin, endMin });
      }
    }

    const startHour = 8;
    const endHour = 22;
    const interval = 30; // min

    const available: string[] = [];
    for (
      let min = startHour * 60;
      min <= endHour * 60 - duration;
      min += interval
    ) {
      const startMin = min;
      const endMin = min + duration;

      const overlaps = occupied.some(
        (occ) => startMin < occ.endMin && endMin > occ.startMin,
      );

      if (!overlaps) {
        available.push(minutesToTime(min));
      }
    }

    return available;
  },
});

// ============================================================================
// STUDENT CANCEL LESSON (with penalty for late, logging)
// ============================================================================
export const studentCancelLesson = mutation({
  args: {
    scheduleId: v.id("schedules"),
    lessonId: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { scheduleId, lessonId, reason }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const student = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!student || student.role !== "student") {
      throw new Error("Only students can cancel lessons");
    }

    const schedule = await ctx.db.get(scheduleId);
    if (!schedule) throw new Error("Schedule not found");

    const lessonIndex = schedule.lessons.findIndex(
      (l) => l.lessonId === lessonId,
    );
    if (lessonIndex === -1) throw new Error("Lesson not found");

    const lesson = schedule.lessons[lessonIndex] as Lesson;
    if (lesson.studentId !== student._id) {
      throw new Error("Not your lesson");
    }

    if (lesson.state !== "scheduled") {
      throw new Error("Can only cancel scheduled lessons");
    }

    // Calculate hours notice
    const [year, month, day] = schedule.date.split("-").map(Number);
    const [hour, minute] = lesson.time.split(":").map(Number);
    const lessonDateTime = new Date(
      year,
      month - 1,
      day,
      hour,
      minute,
    ).getTime();
    const now = Date.now();
    const hoursNotice = (lessonDateTime - now) / (1000 * 60 * 60);

    // Determine penalty
    const penaltyApplied = hoursNotice < 24;

    // If less than 24hr notice, deduct from package (no refund for early since not deducted yet)
    if (penaltyApplied) {
      const activePackage = await ctx.db
        .query("studentPackages")
        .withIndex("by_student", (q) => q.eq("studentId", student._id))
        .filter((q) =>
          q.and(
            q.eq(q.field("status"), "active"),
            q.gt(q.field("remainingMinutes"), 0),
          ),
        )
        .first();

      if (activePackage) {
        // Deduct lesson minutes as penalty
        await ctx.db.patch(activePackage._id, {
          remainingMinutes: Math.max(
            0,
            activePackage.remainingMinutes - lesson.duration,
          ),
        });
      }
    }

    // Log cancellation
    await ctx.db.insert("lessonCancellations", {
      scheduleId,
      lessonId,
      cancelledBy: student._id,
      cancelledAt: now,
      originalDate: schedule.date,
      originalTime: lesson.time,
      reason,
      hoursNotice,
      penaltyApplied,
    });

    // Remove lesson from schedule
    const updatedLessons = [...schedule.lessons];
    updatedLessons.splice(lessonIndex, 1);

    if (updatedLessons.length === 0) {
      await ctx.db.delete(scheduleId);
    } else {
      await ctx.db.patch(scheduleId, { lessons: updatedLessons });
    }

    return {
      success: true,
      penaltyApplied,
      hoursNotice: Math.round(hoursNotice * 10) / 10,
    };
  },
});

// ============================================================================
// TEACHER REQUEST RESCHEDULE
// ============================================================================
export const teacherRequestReschedule = mutation({
  args: {
    scheduleId: v.id("schedules"),
    lessonId: v.string(),
    newDate: v.string(),
    newTime: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { scheduleId, lessonId, newDate, newTime, reason }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const teacher = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!teacher || teacher.role !== "teacher") {
      throw new Error("Only teachers can request reschedule");
    }

    const schedule = await ctx.db.get(scheduleId);
    if (!schedule || schedule.teacherId !== teacher._id) {
      throw new Error("Not your schedule");
    }

    const lessonIndex = schedule.lessons.findIndex(
      (l) => l.lessonId === lessonId,
    );
    if (lessonIndex === -1) throw new Error("Lesson not found");

    const lesson = schedule.lessons[lessonIndex] as Lesson;

    if (lesson.state !== "scheduled") {
      throw new Error("Can only reschedule scheduled lessons");
    }

    // Check if new time is available
    const availableSlots = await ctx.runQuery(api.schedules.getAvailableSlots, {
      teacherId: teacher._id,
      date: newDate,
      duration: lesson.duration,
    });

    if (!availableSlots.includes(newTime)) {
      throw new Error("Proposed time is not available");
    }

    // Check for existing pending request
    // ✅ Corrected
    const existingRequest = await ctx.db
      .query("rescheduleRequests")
      .withIndex("by_schedule_lesson", (q) =>
        q.eq("scheduleId", scheduleId).eq("lessonId", lessonId),
      )
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existingRequest) {
      throw new Error(
        "There is already a pending reschedule request for this lesson",
      );
    }

    // Create reschedule request
    await ctx.db.insert("rescheduleRequests", {
      scheduleId,
      lessonId,
      requestedBy: teacher._id,
      requestedAt: Date.now(),
      status: "pending",
      originalDate: schedule.date,
      originalTime: lesson.time,
      newDate,
      newTime,
      reason,
    });

    return { success: true, status: "pending" };
  },
});

// ============================================================================
// STUDENT RESPOND TO RESCHEDULE
// ============================================================================
export const studentRespondToReschedule = mutation({
  args: {
    requestId: v.id("rescheduleRequests"),
    approved: v.boolean(),
  },
  handler: async (ctx, { requestId, approved }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const student = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!student || student.role !== "student") {
      throw new Error("Only students can respond");
    }

    const request = await ctx.db.get(requestId);
    if (!request) throw new Error("Request not found");

    if (request.status !== "pending") {
      throw new Error("Request already processed");
    }

    const schedule = await ctx.db.get(request.scheduleId);
    if (!schedule) throw new Error("Schedule not found");

    const lessonIndex = schedule.lessons.findIndex(
      (l) => l.lessonId === request.lessonId,
    );
    if (lessonIndex === -1) throw new Error("Lesson not found");

    const lesson = schedule.lessons[lessonIndex] as Lesson;
    if (lesson.studentId !== student._id) {
      throw new Error("Not your lesson");
    }

    // Update request status
    await ctx.db.patch(requestId, {
      status: approved ? "approved" : "rejected",
      respondedBy: student._id,
      respondedAt: Date.now(),
    });

    if (approved) {
      // Move lesson to new date/time
      const updatedLessons = [...schedule.lessons];
      updatedLessons.splice(lessonIndex, 1);

      // Update or delete old schedule
      if (updatedLessons.length === 0) {
        await ctx.db.delete(request.scheduleId);
      } else {
        await ctx.db.patch(request.scheduleId, { lessons: updatedLessons });
      }

      // Add to new schedule
      let newSchedule = await ctx.db
        .query("schedules")
        .withIndex("by_teacher_date", (q) =>
          q.eq("teacherId", schedule.teacherId).eq("date", request.newDate),
        )
        .first();

      if (!newSchedule) {
        const newId = await ctx.db.insert("schedules", {
          teacherId: schedule.teacherId,
          date: request.newDate,
          lessons: [],
        });
        newSchedule = await ctx.db.get(newId);
      }

      if (newSchedule) {
        const updatedLesson: Lesson = {
          ...lesson,
          time: request.newTime,
        };

        await ctx.db.patch(newSchedule._id, {
          lessons: [...newSchedule.lessons, updatedLesson],
        });
      }
    }

    return { success: true, approved };
  },
});

// ============================================================================
// GET PENDING RESCHEDULE REQUESTS
// ============================================================================
export const getPendingReschedules = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return [];

    // Get all pending requests
    const allRequests = await ctx.db
      .query("rescheduleRequests")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    // Filter based on role
    const relevantRequests = [];
    for (const req of allRequests) {
      const schedule = await ctx.db.get(req.scheduleId);
      if (!schedule) continue;

      const lesson = schedule.lessons.find((l) => l.lessonId === req.lessonId);
      if (!lesson) continue;

      // Students see requests from their teacher
      // Teachers see none (since they created them, perhaps add if needed)
      if (user.role === "student" && lesson.studentId === user._id) {
        const teacher = await ctx.db.get(schedule.teacherId);
        relevantRequests.push({
          ...req,
          teacherName: teacher?.name || teacher?.email || "Teacher",
          lessonDuration: lesson.duration,
        });
      }
    }

    return relevantRequests;
  },
});

// ============================================================================
// GET TEACHER AVAILABILITY (for reschedule calendar) - improved to return available slots per day
// ============================================================================
export const getTeacherAvailability = query({
  args: {
    teacherId: v.id("users"),
    startDate: v.string(),
    endDate: v.string(),
    duration: v.number(),
  },
  handler: async (ctx, { teacherId, startDate, endDate, duration }) => {
    // Get all schedules in date range
    const allSchedules = await ctx.db
      .query("schedules")
      .withIndex("by_teacher_date", (q) => q.eq("teacherId", teacherId))
      .collect();

    const schedulesInRange = allSchedules.filter(
      (s) => s.date >= startDate && s.date <= endDate,
    );

    // Build availability map: date -> array of available times
    const availability: Record<string, string[]> = {};

    // Generate dates in range
    const start = new Date(startDate);
    const end = new Date(endDate);
    const current = new Date(start);

    while (current <= end) {
      const dateStr = current.toISOString().split("T")[0];
      availability[dateStr] = [];
      current.setDate(current.getDate() + 1);
    }

    // For each day, calculate available slots like getAvailableSlots
    for (const date of Object.keys(availability)) {
      const schedule = schedulesInRange.find((s) => s.date === date);

      const occupied: { startMin: number; endMin: number }[] = [];
      if (schedule) {
        for (const lesson of schedule.lessons as Lesson[]) {
          const startMin = timeToMinutes(lesson.time);
          const endMin = startMin + lesson.duration;
          occupied.push({ startMin, endMin });
        }
      }

      const startHour = 8;
      const endHour = 22;
      const interval = 30; // min

      const availableTimes: string[] = [];
      for (
        let min = startHour * 60;
        min <= endHour * 60 - duration;
        min += interval
      ) {
        const startMin = min;
        const endMin = min + duration;

        const overlaps = occupied.some(
          (occ) => startMin < occ.endMin && endMin > occ.startMin,
        );

        if (!overlaps) {
          availableTimes.push(minutesToTime(min));
        }
      }

      availability[date] = availableTimes;
    }

    return availability;
  },
});

// ============================================================================
// GET CANCELLATION HISTORY
// ============================================================================
export const getCancellationHistory = query({
  args: { studentId: v.optional(v.id("users")) },
  handler: async (ctx, { studentId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return [];

    // Students see their own, admins see all or specific
    let targetId = studentId;
    if (user.role === "student") {
      targetId = user._id;
    } else if (user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    if (!targetId) return [];

    return await ctx.db
      .query("lessonCancellations")
      .withIndex("by_cancelled_by", (q) => q.eq("cancelledBy", targetId))
      .collect();
  },
});
// Add these mutations to your convex/schedules.ts file
// Place them after your existing mutations

// STUDENT: Book a lesson (creates new lesson in teacher's schedule)
export const bookLesson = mutation({
  args: {
    teacherId: v.id("users"),
    date: v.string(), // yyyy-MM-dd
    time: v.string(), // HH:mm (UTC)
    duration: v.number(),
    bookId: v.optional(v.union(v.id("books"), v.null())),
  },
  handler: async (ctx, { teacherId, date, time, duration, bookId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const student = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!student || student.role !== "student") {
      throw new Error("Only students can book lessons");
    }

    // Verify teacher exists and teaches the right instrument
    const teacher = await ctx.db.get(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      throw new Error("Invalid teacher");
    }

    if (teacher.instrument !== student.instrument) {
      throw new Error(
        `This teacher teaches ${teacher.instrument}, not ${student.instrument}`,
      );
    }

    // Check if student has an active package with remaining minutes
    const activePackage = await ctx.db
      .query("studentPackages")
      .withIndex("by_student", (q) => q.eq("studentId", student._id))
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "active"),
          q.gte(q.field("remainingMinutes"), duration),
        ),
      )
      .first();

    if (!activePackage) {
      throw new Error(
        "No active package with sufficient minutes. Please purchase a package first.",
      );
    }

    // Find or create schedule for this date
    let schedule = await ctx.db
      .query("schedules")
      .withIndex("by_teacher_date", (q) =>
        q.eq("teacherId", teacherId).eq("date", date),
      )
      .first();

    if (!schedule) {
      const newId = await ctx.db.insert("schedules", {
        teacherId,
        date,
        lessons: [],
      });
      schedule = await ctx.db.get(newId);
      if (!schedule) throw new Error("Failed to create schedule");
    }

    // Verify the time slot is still available
    const occupied: { startMin: number; endMin: number }[] = [];
    for (const lesson of schedule.lessons as Lesson[]) {
      const startMin = timeToMinutes(lesson.time);
      const endMin = startMin + lesson.duration;
      occupied.push({ startMin, endMin });
    }

    const requestedStart = timeToMinutes(time);
    const requestedEnd = requestedStart + duration;
    const overlaps = occupied.some(
      (occ) => requestedStart < occ.endMin && requestedEnd > occ.startMin,
    );

    if (overlaps) {
      throw new Error("This time slot is no longer available");
    }

    // Create the lesson
    const lessonId =
      Date.now().toString(36) + Math.random().toString(36).slice(2);
    const newLesson: Lesson = {
      lessonId,
      studentId: student._id,
      time,
      duration,
      bookId: bookId ?? null,
      zoomLink: teacher.zoomLink,
      completed: false,
      status: "no_answer_on_time" as const, // Default status
      state: "scheduled" as const,
    };

    // Update schedule
    await ctx.db.patch(schedule._id, {
      lessons: [...schedule.lessons, newLesson],
    });

    // Auto-assign teacher to student if not already set
    if (student.currentTeacher !== teacherId) {
      await ctx.db.patch(student._id, { currentTeacher: teacherId });
    }

    return {
      success: true,
      scheduleId: schedule._id,
      lessonId,
      message: "Lesson booked successfully!",
    };
  },
});

// ADMIN: Bulk create lessons for a student (e.g., weekly recurring)
export const adminBulkCreateLessons = mutation({
  args: {
    teacherId: v.id("users"),
    studentId: v.id("users"),
    dates: v.array(v.string()), // Array of yyyy-MM-dd dates
    time: v.string(), // HH:mm (same time for all)
    duration: v.number(),
    bookId: v.optional(v.union(v.id("books"), v.null())),
  },
  handler: async (
    ctx,
    { teacherId, studentId, dates, time, duration, bookId },
  ) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!admin || admin.role !== "admin") {
      throw new Error("Admin access required");
    }

    // Verify teacher and student
    const teacher = await ctx.db.get(teacherId);
    const student = await ctx.db.get(studentId);

    if (!teacher || teacher.role !== "teacher") {
      throw new Error("Invalid teacher");
    }
    if (!student || student.role !== "student") {
      throw new Error("Invalid student");
    }

    const createdLessons: { scheduleId: Id<"schedules">; lessonId: string }[] =
      [];

    // Create lessons for each date
    for (const date of dates) {
      let schedule = await ctx.db
        .query("schedules")
        .withIndex("by_teacher_date", (q) =>
          q.eq("teacherId", teacherId).eq("date", date),
        )
        .first();

      if (!schedule) {
        const newId = await ctx.db.insert("schedules", {
          teacherId,
          date,
          lessons: [],
        });
        schedule = await ctx.db.get(newId);
        if (!schedule) continue;
      }

      // Check for conflicts
      const occupied: { startMin: number; endMin: number }[] = [];
      for (const lesson of schedule.lessons as Lesson[]) {
        const startMin = timeToMinutes(lesson.time);
        const endMin = startMin + lesson.duration;
        occupied.push({ startMin, endMin });
      }

      const requestedStart = timeToMinutes(time);
      const requestedEnd = requestedStart + duration;
      const overlaps = occupied.some(
        (occ) => requestedStart < occ.endMin && requestedEnd > occ.startMin,
      );

      if (overlaps) {
        console.warn(`Skipping ${date} - time slot conflict`);
        continue;
      }

      // Create lesson
      const lessonId =
        Date.now().toString(36) + Math.random().toString(36).slice(2);
      const newLesson: Lesson = {
        lessonId,
        studentId,
        time,
        duration,
        bookId: bookId ?? null,
        zoomLink: teacher.zoomLink,
        completed: false,
        status: "no_answer_on_time" as const,
        state: "scheduled" as const,
      };

      await ctx.db.patch(schedule._id, {
        lessons: [...schedule.lessons, newLesson],
      });

      createdLessons.push({ scheduleId: schedule._id, lessonId });
    }

    // Auto-assign teacher
    if (student.currentTeacher !== teacherId) {
      await ctx.db.patch(studentId, { currentTeacher: teacherId });
    }

    return {
      success: true,
      created: createdLessons.length,
      skipped: dates.length - createdLessons.length,
      lessons: createdLessons,
    };
  },
});

// STUDENT REQUEST RESCHEDULE (mirror of teacher version)
export const studentRequestReschedule = mutation({
  args: {
    scheduleId: v.id("schedules"),
    lessonId: v.string(),
    newDate: v.string(),
    newTime: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { scheduleId, lessonId, newDate, newTime, reason }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const student = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!student || student.role !== "student") {
      throw new Error("Only students can request reschedule");
    }

    const schedule = await ctx.db.get(scheduleId);
    if (!schedule) throw new Error("Schedule not found");

    const lesson = schedule.lessons.find((l) => l.lessonId === lessonId);
    if (!lesson || lesson.studentId !== student._id) {
      throw new Error("Not your lesson");
    }

    if (lesson.state !== "scheduled") {
      throw new Error("Can only reschedule scheduled lessons");
    }

    // Check if new time is available
    const availableSlots = await ctx.runQuery(api.schedules.getAvailableSlots, {
      teacherId: schedule.teacherId,
      date: newDate,
      duration: lesson.duration,
    });

    if (!availableSlots.includes(newTime)) {
      throw new Error("Proposed time is not available");
    }

    // Check for existing pending request
    const existingRequest = await ctx.db
      .query("rescheduleRequests")
      .withIndex("by_schedule_lesson", (q) =>
        q.eq("scheduleId", scheduleId).eq("lessonId", lessonId),
      )
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existingRequest) {
      throw new Error("There is already a pending reschedule request");
    }

    // Create reschedule request (teacher will approve)
    await ctx.db.insert("rescheduleRequests", {
      scheduleId,
      lessonId,
      requestedBy: student._id,
      requestedAt: Date.now(),
      status: "pending",
      originalDate: schedule.date,
      originalTime: lesson.time,
      newDate,
      newTime,
      reason,
    });

    return { success: true, status: "pending" };
  },
});
