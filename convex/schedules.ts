// export { generateRecurringDates };
import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { api } from "./_generated/api";
import {
  format,
  isMonday,
  isTuesday,
  isWednesday,
  isThursday,
  isFriday,
  getHours,
  addDays,
  differenceInHours,
  getDay,
} from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { formatInTimeZone } from "date-fns-tz";

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

// UPDATED: scheduledTime is now REQUIRED
export type Lesson = {
  lessonId: string;
  studentId: Id<"users">;
  time: string;
  duration: number;
  bookId: Id<"books"> | null;
  zoomLink?: string;
  completed: boolean;
  date?: number;
  notes?: string;
  startedAt?: number;
  status: LessonStatus;
  state: LessonState;
  endedAt?: number;
  actualMinutes?: number;
  onTime?: boolean;
  joinedAt?: number;
  markedBy?: Id<"users">;
  markedAt?: number;
  scheduledTime: number; // REQUIRED: UTC milliseconds
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

// NEW HELPER: Convert local date + time string to UTC milliseconds using given timezone
function localToUtcMs(
  dateStr: string,
  timeStr: string,
  timezone: string,
): number {
  if (!timezone) {
    console.warn(
      `No timezone provided for ${dateStr} ${timeStr}, falling back to UTC`,
    );
    timezone = "UTC";
  }

  const localDateTime = `${dateStr}T${timeStr}:00`;
  const zonedDate = fromZonedTime(localDateTime, timezone);
  return zonedDate.getTime();
}

// ============================================================================
// HELPER: Find next available slot (earliest possible, respects local 10-17)
// ============================================================================
function findNextAvailableSlot(
  occupiedSlots: { startMin: number; endMin: number }[],
  duration: number,
  date: string, // yyyy-MM-dd
  teacherTimezone: string,
): string | null {
  if (!teacherTimezone) return null;
  const startLocal = fromZonedTime(
    new Date(`${date}T10:00:00`),
    teacherTimezone,
  );
  const endLocal = fromZonedTime(new Date(`${date}T17:00:00`), teacherTimezone);
  const startMin = timeToMinutes(format(startLocal, "HH:mm"));
  const endMin = timeToMinutes(format(endLocal, "HH:mm"));
  for (let min = startMin; min <= endMin - duration; min += 30) {
    const slotStart = min;
    const slotEnd = min + duration + 1; // +1 min gap
    const hasConflict = occupiedSlots.some(
      (occ) => slotStart < occ.endMin && slotEnd > occ.startMin,
    );
    if (!hasConflict) {
      return minutesToTime(min);
    }
  }
  return null;
}

// Helper: Check if date is Mon-Fri
function isWorkingDay(dateStr: string): boolean {
  const date = new Date(dateStr);
  return (
    isMonday(date) ||
    isTuesday(date) ||
    isWednesday(date) ||
    isThursday(date) ||
    isFriday(date)
  );
}

// Helper: Generate recurring dates based on package
function generateRecurringDates(
  startDate: string,
  weeksAhead: number,
  lessonsPerWeek: number,
): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const dayIndices: number[] = [];
  if (lessonsPerWeek === 1) dayIndices.push(0);
  else if (lessonsPerWeek === 2) dayIndices.push(0, 2);
  else if (lessonsPerWeek === 3) dayIndices.push(0, 2, 4);
  else if (lessonsPerWeek === 4) dayIndices.push(0, 1, 3, 4);
  else if (lessonsPerWeek === 5) dayIndices.push(0, 1, 2, 3, 4);

  for (let week = 0; week < weeksAhead; week++) {
    let weekStart = addDays(start, week * 7);
    while (weekStart.getDay() !== 1) weekStart = addDays(weekStart, 1);
    for (const dayIndex of dayIndices) {
      const lessonDate = addDays(weekStart, dayIndex);
      const dateStr = format(lessonDate, "yyyy-MM-dd");
      if (lessonDate >= start) dates.push(dateStr);
    }
  }
  return dates;
}

// Helper: Check if time is within teacher's working hours (10-17 local)
function isWithinWorkingHours(
  date: string,
  time: string, // HH:mm
  teacherTimezone: string,
): boolean {
  try {
    const utcDateTime = `${date}T${time}:00Z`;
    const localDateTime = new Date(utcDateTime).toLocaleString("en-US", {
      timeZone: teacherTimezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const localMinutes = timeToMinutes(localDateTime);
    const startMin = 10 * 60;
    const endMin = 17 * 60;
    return localMinutes >= startMin && localMinutes <= endMin;
  } catch (e) {
    console.error("Error checking working hours:", e);
    return false;
  }
}

// ============================================================================
// QUERIES
// ============================================================================
export const getAll = query({
  handler: async (ctx) => await ctx.db.query("schedules").collect(),
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
      scheduledTime: number;
    }> = [];

    for (const sched of allSchedules) {
      for (const lessonRaw of sched.lessons) {
        const scheduledTime =
          lessonRaw.scheduledTime ??
          new Date(`${sched.date}T${lessonRaw.time}:00Z`).getTime();

        if (lessonRaw.studentId === studentId) {
          lessons.push({
            scheduleId: sched._id,
            lessonId: lessonRaw.lessonId,
            date: sched.date,
            time: lessonRaw.time,
            duration: lessonRaw.duration,
            teacherId: sched.teacherId,
            bookId: lessonRaw.bookId,
            zoomLink: lessonRaw.zoomLink,
            completed: lessonRaw.completed,
            notes: lessonRaw.notes,
            startedAt: lessonRaw.startedAt,
            status: lessonRaw.status,
            state: lessonRaw.state,
            endedAt: lessonRaw.endedAt,
            actualMinutes: lessonRaw.actualMinutes,
            onTime: lessonRaw.onTime,
            joinedAt: lessonRaw.joinedAt,
            scheduledTime,
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
  handler: async (ctx, { teacherId }) =>
    await ctx.db
      .query("schedules")
      .withIndex("by_teacher_date", (q) => q.eq("teacherId", teacherId))
      .order("desc")
      .collect(),
});

export const getLesson = query({
  args: { scheduleId: v.id("schedules"), lessonId: v.string() },
  handler: async (ctx, { scheduleId, lessonId }) => {
    const schedule = await ctx.db.get(scheduleId);
    if (!schedule) return null;

    const lessonRaw = schedule.lessons.find((l) => l.lessonId === lessonId);
    if (!lessonRaw) return null;

    const scheduledTime =
      lessonRaw.scheduledTime ??
      new Date(`${schedule.date}T${lessonRaw.time}:00Z`).getTime();

    return {
      ...lessonRaw,
      scheduledTime,
      date: schedule.date,
      teacherId: schedule.teacherId,
    };
  },
});

export const getLessonWithBook = query({
  args: { scheduleId: v.id("schedules"), lessonId: v.string() },
  handler: async (ctx, { scheduleId, lessonId }) => {
    const schedule = await ctx.db.get(scheduleId);
    if (!schedule) return null;

    const lessonRaw = schedule.lessons.find((l) => l.lessonId === lessonId);
    if (!lessonRaw) return null;

    const scheduledTime =
      lessonRaw.scheduledTime ??
      new Date(`${schedule.date}T${lessonRaw.time}:00Z`).getTime();

    const book = lessonRaw.bookId ? await ctx.db.get(lessonRaw.bookId) : null;

    return {
      ...lessonRaw,
      scheduledTime,
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
          schedule.lessons.map(async (lessonRaw) => {
            const scheduledTime =
              lessonRaw.scheduledTime ??
              new Date(`${schedule.date}T${lessonRaw.time}:00Z`).getTime();

            const student = await ctx.db.get(lessonRaw.studentId);
            return {
              ...lessonRaw,
              scheduledTime,
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
      for (const lesson of sched.lessons) {
        if (lesson.startedAt !== undefined && lesson.onTime !== undefined) {
          totalLessons++;
          if (!lesson.onTime) lateCount++;
        }
      }
    }

    return {
      totalLessons,
      lateCount,
      latePercentage: totalLessons > 0 ? (lateCount / totalLessons) * 100 : 0,
    };
  },
});

export const getAvailableSlots = query({
  args: {
    teacherId: v.id("users"),
    date: v.string(),
    duration: v.number(),
  },
  handler: async (ctx, { teacherId, date, duration }) => {
    if (!isWorkingDay(date)) return [];

    const teacher = await ctx.db.get(teacherId);
    if (!teacher || !teacher.timezone)
      throw new Error("Teacher timezone missing");

    const schedule = await ctx.db
      .query("schedules")
      .withIndex("by_teacher_date", (q) =>
        q.eq("teacherId", teacherId).eq("date", date),
      )
      .first();

    const occupied: { startMin: number; endMin: number }[] = [];
    if (schedule) {
      for (const lesson of schedule.lessons) {
        const startMin = timeToMinutes(lesson.time);
        const endMin = startMin + lesson.duration + 1;
        occupied.push({ startMin, endMin });
      }
    }

    const startLocal = fromZonedTime(
      new Date(`${date}T10:00:00`),
      teacher.timezone,
    );
    const endLocal = fromZonedTime(
      new Date(`${date}T17:00:00`),
      teacher.timezone,
    );
    const startMin = timeToMinutes(format(startLocal, "HH:mm"));
    const endMin = timeToMinutes(format(endLocal, "HH:mm"));

    const interval = 30;
    const utcAvailable: string[] = [];
    for (let min = startMin; min <= endMin - duration; min += interval) {
      const startMinLoop = min;
      const endMinLoop = min + duration + 1;
      const overlaps = occupied.some(
        (occ) => startMinLoop < occ.endMin && endMinLoop > occ.startMin,
      );
      if (!overlaps) utcAvailable.push(minutesToTime(min));
    }

    return utcAvailable.map((utcTime) => {
      const utcDateTime = new Date(`${date}T${utcTime}:00Z`);
      return utcDateTime.toLocaleString("en-US", {
        timeZone: teacher.timezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    });
  },
});

export const generatePackageSchedule = query({
  args: {
    studentId: v.id("users"),
    startDate: v.string(),
    weeksAhead: v.number(),
  },
  handler: async (ctx, { studentId, startDate, weeksAhead }) => {
    const activePackage = await ctx.db
      .query("studentPackages")
      .withIndex("by_student", (q) => q.eq("studentId", studentId))
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "active"),
          q.gt(q.field("remainingMinutes"), 0),
        ),
      )
      .first();

    if (!activePackage) {
      return { dates: [], error: "No active package" };
    }

    const dates = generateRecurringDates(
      startDate,
      weeksAhead,
      activePackage.lessonsPerWeek,
    );

    return {
      dates,
      lessonsPerWeek: activePackage.lessonsPerWeek,
      minutesPerLesson: activePackage.minutesPerLesson,
      totalLessons: dates.length,
    };
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

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

    let schedule = await ctx.db
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

    const teacher = await ctx.db.get(args.teacherId);
    if (!teacher || !teacher.timezone) {
      throw new Error("Teacher timezone not set");
    }

    const lessonId =
      Date.now().toString(36) + Math.random().toString(36).slice(2);

    // Timezone-aware scheduledTime
    const scheduledTime = localToUtcMs(
      args.date,
      args.lesson.time,
      teacher.timezone,
    );

    const newLesson: Lesson = {
      ...args.lesson,
      bookId: args.lesson.bookId ?? null,
      lessonId,
      startedAt: args.lesson.startedAt ?? undefined,
      status: args.lesson.status ?? "completed",
      state: args.lesson.state ?? "scheduled",
      endedAt: args.lesson.endedAt ?? undefined,
      actualMinutes: args.lesson.actualMinutes ?? undefined,
      onTime: args.lesson.onTime ?? undefined,
      joinedAt: args.lesson.joinedAt ?? undefined,
      scheduledTime,
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

export const bookLesson = mutation({
  args: {
    teacherId: v.id("users"),
    date: v.string(),
    time: v.string(),
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

    const teacher = await ctx.db.get(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      throw new Error("Invalid teacher");
    }

    if (teacher.instrument !== student.instrument) {
      throw new Error(
        `This teacher teaches ${teacher.instrument}, not ${student.instrument}`,
      );
    }

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

    const occupied: { startMin: number; endMin: number }[] = [];
    for (const lesson of schedule.lessons) {
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

    const lessonId =
      Date.now().toString(36) + Math.random().toString(36).slice(2);

    // Timezone-aware scheduledTime
    const scheduledTime = localToUtcMs(date, time, teacher.timezone!);

    const newLesson: Lesson = {
      lessonId,
      studentId: student._id,
      time,
      duration,
      bookId: bookId ?? null,
      zoomLink: teacher.zoomLink,
      completed: false,
      status: "no_answer_on_time",
      state: "scheduled",
      scheduledTime,
    };

    await ctx.db.patch(schedule._id, {
      lessons: [...schedule.lessons, newLesson],
    });

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

export const adminBulkCreateLessons = mutation({
  args: {
    teacherId: v.id("users"),
    studentId: v.id("users"),
    dates: v.array(v.string()),
    time: v.string(),
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

    const teacher = await ctx.db.get(teacherId);
    const student = await ctx.db.get(studentId);

    if (!teacher || teacher.role !== "teacher") {
      throw new Error("Invalid teacher");
    }
    if (!student || student.role !== "student") {
      throw new Error("Invalid student");
    }
    if (!teacher.timezone) {
      throw new Error("Teacher timezone not set");
    }

    const activePackage = await ctx.db
      .query("studentPackages")
      .withIndex("by_student", (q) => q.eq("studentId", studentId))
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "active"),
          q.gt(q.field("remainingMinutes"), 0),
        ),
      )
      .first();

    if (!activePackage) {
      throw new Error(
        "Student does not have an active package with remaining minutes",
      );
    }

    if (duration !== activePackage.minutesPerLesson) {
      throw new Error(
        `Lesson duration (${duration}min) must match package setting (${activePackage.minutesPerLesson}min)`,
      );
    }

    const totalMinutesNeeded = dates.length * duration;
    if (totalMinutesNeeded > activePackage.remainingMinutes) {
      throw new Error(
        `Not enough minutes in package. Need: ${totalMinutesNeeded}, Available: ${activePackage.remainingMinutes}`,
      );
    }

    const createdLessons: { scheduleId: string; lessonId: string }[] = [];
    let skippedCount = 0;
    const skippedReasons: string[] = [];

    for (const date of dates) {
      if (!isWorkingDay(date)) {
        skippedCount++;
        skippedReasons.push(`${date}: Not a working day`);
        continue;
      }

      if (!isWithinWorkingHours(date, time, teacher.timezone)) {
        skippedCount++;
        skippedReasons.push(
          `${date}: Time ${time} outside teacher's 10-17 hours`,
        );
        continue;
      }

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

      const occupied: { startMin: number; endMin: number }[] = [];
      for (const lesson of schedule.lessons) {
        const startMin = timeToMinutes(lesson.time);
        const endMin = startMin + lesson.duration + 1;
        occupied.push({ startMin, endMin });
      }

      const requestedStart = timeToMinutes(time);
      const requestedEnd = requestedStart + duration + 1;
      const overlaps = occupied.some(
        (occ) => requestedStart < occ.endMin && requestedEnd > occ.startMin,
      );

      if (overlaps) {
        skippedCount++;
        skippedReasons.push(`${date}: Time slot conflict`);
        continue;
      }

      const lessonId =
        Date.now().toString(36) + Math.random().toString(36).slice(2);

      // Timezone-aware scheduledTime
      const scheduledTime = localToUtcMs(date, time, teacher.timezone);

      const newLesson: Lesson = {
        lessonId,
        studentId,
        time,
        duration,
        bookId: bookId ?? null,
        zoomLink: teacher.zoomLink,
        completed: false,
        status: "no_answer_on_time",
        state: "scheduled",
        scheduledTime,
      };

      await ctx.db.patch(schedule._id, {
        lessons: [...schedule.lessons, newLesson],
      });

      createdLessons.push({ scheduleId: schedule._id, lessonId });
    }

    if (student.currentTeacher !== teacherId) {
      await ctx.db.patch(studentId, { currentTeacher: teacherId });
    }

    return {
      success: true,
      created: createdLessons.length,
      skipped: skippedCount,
      skippedReasons: skippedReasons.slice(0, 5),
      lessons: createdLessons,
      packageInfo: {
        remainingMinutes: activePackage.remainingMinutes,
        minutesUsed: totalMinutesNeeded - skippedCount * duration,
      },
    };
  },
});

export const smartBulkSchedule = mutation({
  args: {
    teacherId: v.id("users"),
    studentId: v.id("users"),
    startDate: v.string(),
    weeksAhead: v.number(),
  },
  handler: async (ctx, { teacherId, studentId, startDate, weeksAhead }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!admin || admin.role !== "admin") {
      throw new Error("Admin access required");
    }

    const teacher = await ctx.db.get(teacherId);
    const student = await ctx.db.get(studentId);

    if (!teacher || !teacher.timezone) {
      throw new Error("Teacher timezone not set");
    }
    if (!student) {
      throw new Error("Student not found");
    }

    const activePackage = await ctx.db
      .query("studentPackages")
      .withIndex("by_student", (q) => q.eq("studentId", studentId))
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "active"),
          q.gt(q.field("remainingMinutes"), 0),
        ),
      )
      .first();

    if (!activePackage) {
      throw new Error("Student does not have an active package");
    }

    const dates = generateRecurringDates(
      startDate,
      weeksAhead,
      activePackage.lessonsPerWeek,
    );

    let created = 0;
    let skipped = 0;
    const createdLessons: { date: string; time: string }[] = [];

    for (const date of dates) {
      if (!isWorkingDay(date)) {
        skipped++;
        continue;
      }

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

      const occupied: { startMin: number; endMin: number }[] = [];
      for (const lesson of schedule.lessons) {
        const startMin = timeToMinutes(lesson.time);
        const endMin = startMin + lesson.duration + 1;
        occupied.push({ startMin, endMin });
      }

      if (!teacher.timezone) {
        skipped++;
        continue;
      }

      const availableTime = findNextAvailableSlot(
        occupied,
        activePackage.minutesPerLesson,
        date,
        teacher.timezone,
      );

      if (!availableTime) {
        skipped++;
        continue;
      }

      const lessonId =
        Date.now().toString(36) + Math.random().toString(36).slice(2);

      // Timezone-aware scheduledTime
      const scheduledTime = localToUtcMs(date, availableTime, teacher.timezone);

      const newLesson: Lesson = {
        lessonId,
        studentId,
        time: availableTime,
        duration: activePackage.minutesPerLesson,
        bookId: null,
        zoomLink: teacher.zoomLink,
        completed: false,
        status: "no_answer_on_time",
        state: "scheduled",
        scheduledTime,
      };

      await ctx.db.patch(schedule._id, {
        lessons: [...schedule.lessons, newLesson],
      });

      createdLessons.push({ date, time: availableTime });
      created++;
    }

    if (student.currentTeacher !== teacherId) {
      await ctx.db.patch(studentId, { currentTeacher: teacherId });
    }

    return {
      success: true,
      created,
      skipped,
      lessons: createdLessons,
    };
  },
});

export const studentRescheduleLesson = mutation({
  args: {
    scheduleId: v.id("schedules"),
    lessonId: v.string(),
    newDate: v.string(),
    newTime: v.string(),
  },
  handler: async (ctx, { scheduleId, lessonId, newDate, newTime }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const student = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!student || student.role !== "student") {
      throw new Error("Only students can reschedule");
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
      throw new Error("Can only reschedule scheduled lessons");
    }

    const teacher = await ctx.db.get(schedule.teacherId);
    if (!teacher || !teacher.timezone) {
      throw new Error("Teacher timezone not configured");
    }

    const localDateTimeStr = `${newDate}T${newTime}:00`;
    const utcDateObj = fromZonedTime(localDateTimeStr, teacher.timezone);
    const utcTime = format(utcDateObj, "HH:mm");

    const now = Date.now();
    const newLessonTime = utcDateObj.getTime();
    const hoursToLesson = (newLessonTime - now) / (1000 * 60 * 60);

    if (hoursToLesson < 2) {
      throw new Error("Must reschedule at least 2 hours in advance");
    }

    if (!isWithinWorkingHours(newDate, utcTime, teacher.timezone)) {
      throw new Error("Time must be between 10:00-17:00 in teacher's timezone");
    }

    if (!isWorkingDay(newDate)) {
      throw new Error("Can only schedule on weekdays (Mon-Fri)");
    }

    let targetSchedule = await ctx.db
      .query("schedules")
      .withIndex("by_teacher_date", (q) =>
        q.eq("teacherId", schedule.teacherId).eq("date", newDate),
      )
      .first();

    if (!targetSchedule) {
      const newId = await ctx.db.insert("schedules", {
        teacherId: schedule.teacherId,
        date: newDate,
        lessons: [],
      });
      targetSchedule = await ctx.db.get(newId);
      if (!targetSchedule) throw new Error("Failed to create schedule");
    }

    const occupied: { startMin: number; endMin: number }[] = [];
    for (const l of targetSchedule.lessons) {
      if (targetSchedule._id === scheduleId && l.lessonId === lessonId)
        continue;
      const startMin = timeToMinutes(l.time);
      const endMin = startMin + l.duration + 1;
      occupied.push({ startMin, endMin });
    }

    const requestedStart = timeToMinutes(utcTime);
    const requestedEnd = requestedStart + lesson.duration + 1;
    const overlaps = occupied.some(
      (occ) => requestedStart < occ.endMin && requestedEnd > occ.startMin,
    );

    if (overlaps) {
      throw new Error("This time slot is already occupied");
    }

    const updatedOldLessons = [...schedule.lessons];
    updatedOldLessons.splice(lessonIndex, 1);

    if (updatedOldLessons.length === 0) {
      await ctx.db.delete(scheduleId);
    } else {
      await ctx.db.patch(scheduleId, { lessons: updatedOldLessons });
    }

    // Timezone-aware new scheduledTime
    const newScheduledTime = localToUtcMs(newDate, utcTime, teacher.timezone);

    const movedLesson: Lesson = {
      ...lesson,
      time: utcTime,
      scheduledTime: newScheduledTime,
    };

    await ctx.db.patch(targetSchedule._id, {
      lessons: [...targetSchedule.lessons, movedLesson],
    });

    await ctx.db.insert("messages", {
      fromId: student._id,
      toId: schedule.teacherId,
      content: `Student rescheduled lesson from ${schedule.date} ${lesson.time} to ${newDate} ${newTime}`,
      timestamp: Date.now(),
      isRead: false,
      deletedBy: [],
    });

    return { success: true };
  },
});

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

    const lesson = schedule.lessons.find((l) => l.lessonId === lessonId);
    if (!lesson) throw new Error("Lesson not found");

    if (lesson.state !== "scheduled") {
      throw new Error("Can only reschedule scheduled lessons");
    }

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

    // Use scheduledTime if available, fallback to parsing date/time
    let scheduledTime: number;
    if (oldLesson.scheduledTime !== undefined) {
      scheduledTime = oldLesson.scheduledTime;
    } else {
      const [year, month, day] = schedule.date.split("-").map(Number);
      const [hour, minute] = oldLesson.time.split(":").map(Number);
      scheduledTime = new Date(year, month - 1, day, hour, minute).getTime();
    }

    const isOnTime = now <= scheduledTime + 60000; // 1 min grace

    const newLesson: Lesson = {
      ...oldLesson,
      state: "in_progress",
      startedAt: now,
      onTime: isOnTime,
      status: isOnTime ? "completed" : "teacher_late",
      scheduledTime: oldLesson.scheduledTime ?? scheduledTime,
    };

    const updatedLessons = [...schedule.lessons];
    updatedLessons[lessonIndex] = newLesson;

    await ctx.db.patch(scheduleId, { lessons: updatedLessons });

    return { success: true, onTime: isOnTime };
  },
});

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

    const finalStatus = status ?? oldLesson.status;

    const newLesson: Lesson = {
      ...oldLesson,
      state: "completed",
      status: finalStatus,
      endedAt: now,
      actualMinutes,
      markedBy: caller._id,
      markedAt: now,
    };

    const updatedLessons = [...schedule.lessons];
    updatedLessons[lessonIndex] = newLesson;

    await ctx.db.patch(scheduleId, { lessons: updatedLessons });

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

    const now = Date.now();
    const newState: LessonState =
      missedBy === "teacher" ? "missed_teacher" : "missed_student";

    const newLesson: Lesson = {
      ...oldLesson,
      state: newState,
      status:
        missedBy === "teacher" ? "teacher_never_called" : "no_answer_on_time",
      markedBy: caller._id,
      markedAt: now,
    };

    if (oldLesson.state === "in_progress" && missedBy === "student") {
      newLesson.endedAt = now;
      newLesson.actualMinutes = Math.round(
        ((newLesson.endedAt ?? 0) - (oldLesson.startedAt ?? 0)) / 60000,
      );
    }

    const updatedLessons = [...schedule.lessons];
    updatedLessons[lessonIndex] = newLesson;

    await ctx.db.patch(scheduleId, { lessons: updatedLessons });
  },
});

export const checkMissedLessons = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - 2);
    const recentDate = cutoff.toISOString().split("T")[0];

    const recentSchedules = await ctx.db
      .query("schedules")
      .filter((q) => q.gte(q.field("date"), recentDate))
      .collect();

    for (const sched of recentSchedules) {
      let needsUpdate = false;
      const updatedLessons = [...sched.lessons] as Lesson[];

      for (let i = 0; i < updatedLessons.length; i++) {
        const lesson = updatedLessons[i];

        let scheduledTime: number;
        if (lesson.scheduledTime !== undefined) {
          scheduledTime = lesson.scheduledTime;
        } else {
          const [year, month, day] = sched.date.split("-").map(Number);
          const [hour, minute] = lesson.time.split(":").map(Number);
          scheduledTime = new Date(
            year,
            month - 1,
            day,
            hour,
            minute,
          ).getTime();
        }

        if (
          lesson.state === "scheduled" &&
          now > scheduledTime + 15 * 60 * 1000
        ) {
          updatedLessons[i] = {
            ...lesson,
            state: "missed_teacher",
            status: "teacher_never_called",
            scheduledTime: lesson.scheduledTime ?? scheduledTime,
          };
          needsUpdate = true;
        }

        if (
          lesson.state === "in_progress" &&
          lesson.startedAt &&
          now > lesson.startedAt + 5 * 60 * 1000 &&
          lesson.joinedAt === undefined
        ) {
          updatedLessons[i] = {
            ...lesson,
            state: "missed_student",
            status: "no_answer_on_time",
            endedAt: now,
            actualMinutes: 0,
            scheduledTime: lesson.scheduledTime ?? scheduledTime,
          };
          needsUpdate = true;
        }

        if (
          lesson.state === "in_progress" &&
          lesson.startedAt &&
          now > lesson.startedAt + (lesson.duration + 30) * 60 * 1000
        ) {
          updatedLessons[i] = {
            ...lesson,
            state: "completed",
            status: "completed",
            endedAt: now,
            actualMinutes: Math.round((now - lesson.startedAt) / 60000),
            scheduledTime: lesson.scheduledTime ?? scheduledTime,
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
    const { forceStatus, state, ...safeUpdates } = updates;
    const newLesson: Lesson = {
      ...oldLesson,
      ...safeUpdates,
      bookId: updates.bookId !== undefined ? updates.bookId : oldLesson.bookId,
      status: forceStatus ?? oldLesson.status,
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

    // Calculate hours notice using scheduledTime if available
    let lessonDateTime: number;
    if (lesson.scheduledTime !== undefined) {
      lessonDateTime = lesson.scheduledTime;
    } else {
      const [year, month, day] = schedule.date.split("-").map(Number);
      const [hour, minute] = lesson.time.split(":").map(Number);
      lessonDateTime = new Date(year, month - 1, day, hour, minute).getTime();
    }

    const now = Date.now();
    const hoursNotice = (lessonDateTime - now) / (1000 * 60 * 60);
    const penaltyApplied = hoursNotice < 24;

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
        await ctx.db.patch(activePackage._id, {
          remainingMinutes: Math.max(
            0,
            activePackage.remainingMinutes - lesson.duration,
          ),
        });
      }
    }

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

export const autoScheduleEntireCompany = mutation({
  args: {
    startDate: v.string(),
    weeksAhead: v.number(),
  },
  handler: async (ctx, { startDate, weeksAhead }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!admin || admin.role !== "admin") {
      throw new Error("Admin access required");
    }
    const allTeachers = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "teacher"))
      .collect();
    const allStudents = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "student"))
      .collect();
    let totalCreated = 0;
    let totalSkipped = 0;
    const results: {
      studentName: string;
      teacherName: string;
      lessonsCreated: number;
      reason?: string;
    }[] = [];
    for (const student of allStudents) {
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
      if (!activePackage) {
        results.push({
          studentName: student.name || student.email,
          teacherName: "N/A",
          lessonsCreated: 0,
          reason: "No active package",
        });
        continue;
      }
      const teacher = allTeachers.find(
        (t) => t.instrument === student.instrument && t.timezone,
      );
      if (!teacher) {
        results.push({
          studentName: student.name || student.email,
          teacherName: "N/A",
          lessonsCreated: 0,
          reason: `No teacher for ${student.instrument}`,
        });
        continue;
      }
      const dates = generateRecurringDates(
        startDate,
        weeksAhead,
        activePackage.lessonsPerWeek,
      );
      let studentLessonsCreated = 0;
      let studentSkipped = 0;
      for (const date of dates) {
        if (!isWorkingDay(date)) {
          studentSkipped++;
          continue;
        }
        let schedule = await ctx.db
          .query("schedules")
          .withIndex("by_teacher_date", (q) =>
            q.eq("teacherId", teacher._id).eq("date", date),
          )
          .first();
        if (!schedule) {
          const newId = await ctx.db.insert("schedules", {
            teacherId: teacher._id,
            date,
            lessons: [],
          });
          schedule = await ctx.db.get(newId);
          if (!schedule) continue;
        }
        const occupied: { startMin: number; endMin: number }[] = [];
        for (const lesson of schedule.lessons) {
          const startMin = timeToMinutes(lesson.time);
          const endMin = startMin + lesson.duration + 1;
          occupied.push({ startMin, endMin });
        }
        const availableTime = findNextAvailableSlot(
          occupied,
          activePackage.minutesPerLesson,
          date,
          teacher.timezone ?? "",
        );
        if (!availableTime) {
          studentSkipped++;
          continue;
        }
        const lessonId =
          Date.now().toString(36) + Math.random().toString(36).slice(2);

        // Timezone-aware scheduledTime
        const scheduledTime = localToUtcMs(
          date,
          availableTime,
          teacher.timezone ?? "UTC",
        );

        const newLesson: Lesson = {
          lessonId,
          studentId: student._id,
          time: availableTime,
          duration: activePackage.minutesPerLesson,
          bookId: null,
          zoomLink: teacher.zoomLink,
          completed: false,
          status: "no_answer_on_time",
          state: "scheduled",
          scheduledTime,
        };

        await ctx.db.patch(schedule._id, {
          lessons: [...schedule.lessons, newLesson],
        });
        studentLessonsCreated++;
        totalCreated++;
      }
      if (student.currentTeacher !== teacher._id) {
        await ctx.db.patch(student._id, { currentTeacher: teacher._id });
      }
      results.push({
        studentName: student.name || student.email,
        teacherName: teacher.name || teacher.email,
        lessonsCreated: studentLessonsCreated,
        reason:
          studentSkipped > 0
            ? `${studentSkipped} slots unavailable`
            : undefined,
      });
      totalSkipped += studentSkipped;
    }
    return {
      success: true,
      totalCreated,
      totalSkipped,
      studentsProcessed: allStudents.length,
      results,
    };
  },
});

export const getLessonsInTimeWindow = internalQuery({
  args: {
    windowStart: v.number(),
    windowEnd: v.number(),
  },
  handler: async (ctx, { windowStart, windowEnd }) => {
    const startDate = new Date(windowStart).toISOString().split("T")[0];
    const endDate = new Date(windowEnd + 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const relevantSchedules = await ctx.db
      .query("schedules")
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), startDate),
          q.lte(q.field("date"), endDate),
        ),
      )
      .collect();

    const upcoming = [];
    for (const sched of relevantSchedules) {
      for (const lessonRaw of sched.lessons) {
        let lessonTimestamp: number;
        if (lessonRaw.scheduledTime !== undefined) {
          lessonTimestamp = lessonRaw.scheduledTime;
        } else {
          const [year, month, day] = sched.date.split("-").map(Number);
          const [hour, minute] = lessonRaw.time.split(":").map(Number);
          lessonTimestamp = new Date(
            year,
            month - 1,
            day,
            hour,
            minute,
          ).getTime();
        }

        if (
          lessonTimestamp >= windowStart &&
          lessonTimestamp <= windowEnd &&
          lessonRaw.state === "scheduled"
        ) {
          const teacher = await ctx.db.get(sched.teacherId);
          upcoming.push({
            _id: lessonRaw.lessonId,
            studentId: lessonRaw.studentId,
            teacherName: teacher?.name || "Your teacher",
            time: lessonRaw.time,
            zoomLink: lessonRaw.zoomLink || teacher?.zoomLink || "/dashboard",
            scheduledTime: lessonTimestamp,
          });
        }
      }
    }
    return upcoming;
  },
});

export { generateRecurringDates };
