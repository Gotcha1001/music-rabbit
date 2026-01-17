// // convex/stats.ts
// import { query } from "./_generated/server";
// import { v } from "convex/values";
// import type { Id, Doc } from "./_generated/dataModel";
// import { api } from "./_generated/api";

// // ──────────────────────────────────────────────────────────────
// // Types
// // ──────────────────────────────────────────────────────────────
// type Lesson = Doc<"schedules">["lessons"][number];

// interface TeacherStats {
//   totalLessons: number;
//   startedLessons: number;
//   onTimeLessons: number;
//   lateLessons: number;
//   onTimeRate: number; // 0–100, rounded to 1 decimal
//   lateRate: number; // 0–100, rounded to 1 decimal
//   completed: number;
//   finishedEarly: number;
//   na: number;
//   teacherLate: number;
//   technical: number;
//   completionRate: number; // % of lessons that were not "na"
//   totalHours: number; // total scheduled hours (rounded to 2 decimals)
// }

// // ──────────────────────────────────────────────────────────────
// // Individual teacher stats (used by the dashboard)
// // ──────────────────────────────────────────────────────────────
// export const getTeacherStats = query({
//   args: {
//     teacherId: v.id("users"),
//     month: v.optional(v.string()), // "2025-11"
//   },
//   handler: async (ctx, { teacherId, month }): Promise<TeacherStats> => {
//     const schedules = await ctx.db
//       .query("schedules")
//       .withIndex("by_teacher_date", (q) => q.eq("teacherId", teacherId))
//       .collect();

//     const relevantSchedules = month
//       ? schedules.filter((s) => s.date.startsWith(month))
//       : schedules;

//     let totalLessons = 0;
//     let startedLessons = 0;
//     let lateLessons = 0;
//     let completed = 0;
//     let finishedEarly = 0;
//     let na = 0;
//     let teacherLate = 0;
//     let technical = 0;
//     let totalMinutes = 0;

//     for (const schedule of relevantSchedules) {
//       for (const lesson of schedule.lessons as Lesson[]) {
//         totalLessons++;
//         totalMinutes += lesson.duration;

//         // Build scheduled timestamp (date + time string → milliseconds)
//         const scheduledTime = new Date(
//           `${schedule.date}T${lesson.time}:00`
//         ).getTime();

//         if (lesson.actualStartTime) {
//           startedLessons++;
//           if (lesson.actualStartTime > scheduledTime + 60_000) {
//             // > 1 minute late
//             lateLessons++;
//           }
//         }

//         switch (lesson.status) {
//           case "completed":
//             completed++;
//             break;
//           case "finished_early":
//             finishedEarly++;
//             break;
//           case "na":
//             na++;
//             break;
//           case "teacher_late":
//             teacherLate++;
//             break;
//           case "technical_difficulty":
//             technical++;
//             break;
//         }
//       }
//     }

//     const onTimeLessons = startedLessons - lateLessons;
//     const onTimeRate =
//       startedLessons > 0 ? (onTimeLessons / startedLessons) * 100 : 0;
//     const lateRate =
//       startedLessons > 0 ? (lateLessons / startedLessons) * 100 : 0;
//     const completedLessons =
//       completed + finishedEarly + teacherLate + technical;
//     const completionRate =
//       totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

//     return {
//       totalLessons,
//       startedLessons,
//       onTimeLessons,
//       lateLessons,
//       onTimeRate: Number(onTimeRate.toFixed(1)),
//       lateRate: Number(lateRate.toFixed(1)),
//       completed,
//       finishedEarly,
//       na,
//       teacherLate,
//       technical,
//       completionRate: Number(completionRate.toFixed(1)),
//       totalHours: Number((totalMinutes / 60).toFixed(2)),
//     };
//   },
// });

// // ──────────────────────────────────────────────────────────────
// // Admin-only: Stats for every teacher in a given month
// // ──────────────────────────────────────────────────────────────
// export const getAllTeachersStats = query({
//   args: { month: v.string() },
//   handler: async (ctx, { month }) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) throw new Error("Unauthorized");

//     const caller = await ctx.db
//       .query("users")
//       .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
//       .first();

//     if (caller?.role !== "admin") throw new Error("Admin only");

//     const teachers = await ctx.db
//       .query("users")
//       .withIndex("by_role", (q) => q.eq("role", "teacher"))
//       .collect();

//     // Explicitly type the Promise array → no more "implicit any"
//     const statsPromises: Promise<{
//       teacher: Doc<"users">;
//       stats: TeacherStats;
//     }>[] = teachers.map(async (teacher) => {
//       const stats = await ctx.runQuery(api.stats.getTeacherStats, {
//         teacherId: teacher._id,
//         month,
//       });
//       return { teacher, stats };
//     });

//     return Promise.all(statsPromises);
//   },
// });
// convex/stats.ts
import { query } from "./_generated/server";
import { v } from "convex/values";
import type { Id, Doc } from "./_generated/dataModel";
import { api } from "./_generated/api";

// ──────────────────────────────────────────────────────────────
// Types (updated to match schedules.ts)
// ──────────────────────────────────────────────────────────────
type LessonState =
  | "scheduled"
  | "teacher_ready"
  | "in_progress"
  | "completed"
  | "missed_teacher"
  | "missed_student";

type LessonStatus =
  | "completed"
  | "finished_early"
  | "na"
  | "teacher_late"
  | "technical_difficulty";

type Lesson = {
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
  // NEW FIELDS
  state: LessonState;
  endedAt?: number;
  actualMinutes?: number;
  onTime?: boolean;
};

interface TeacherStats {
  totalLessons: number;
  startedLessons: number;
  onTimeLessons: number;
  lateLessons: number;
  onTimeRate: number; // 0–100, rounded to 1 decimal
  lateRate: number; // 0–100, rounded to 1 decimal
  completed: number;
  finishedEarly: number;
  na: number;
  teacherLate: number;
  technical: number;
  completionRate: number; // % of lessons that were not "na"
  totalHours: number; // total scheduled hours (rounded to 2 decimals)
}

// ──────────────────────────────────────────────────────────────
// Individual teacher stats (used by the dashboard)
// ──────────────────────────────────────────────────────────────
export const getTeacherStats = query({
  args: {
    teacherId: v.id("users"),
    month: v.optional(v.string()), // "2025-11"
  },
  handler: async (ctx, { teacherId, month }): Promise<TeacherStats> => {
    const schedules = await ctx.db
      .query("schedules")
      .withIndex("by_teacher_date", (q) => q.eq("teacherId", teacherId))
      .collect();

    const relevantSchedules = month
      ? schedules.filter((s) => s.date.startsWith(month))
      : schedules;

    let totalLessons = 0;
    let startedLessons = 0;
    let lateLessons = 0;
    let completed = 0;
    let finishedEarly = 0;
    let na = 0;
    let teacherLate = 0;
    let technical = 0;
    let totalMinutes = 0;

    for (const schedule of relevantSchedules) {
      for (const lesson of schedule.lessons as Lesson[]) {
        totalLessons++;
        totalMinutes += lesson.duration;

        if (lesson.startedAt) {
          startedLessons++;
          if (lesson.onTime === false) {
            // Use pre-computed onTime
            lateLessons++;
          }
        }

        switch (lesson.status) {
          case "completed":
            completed++;
            break;
          case "finished_early":
            finishedEarly++;
            break;
          case "na":
            na++;
            break;
          case "teacher_late":
            teacherLate++;
            break;
          case "technical_difficulty":
            technical++;
            break;
        }
      }
    }

    const onTimeLessons = startedLessons - lateLessons;
    const onTimeRate =
      startedLessons > 0 ? (onTimeLessons / startedLessons) * 100 : 0;
    const lateRate =
      startedLessons > 0 ? (lateLessons / startedLessons) * 100 : 0;
    const completedLessons =
      completed + finishedEarly + teacherLate + technical;
    const completionRate =
      totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    return {
      totalLessons,
      startedLessons,
      onTimeLessons,
      lateLessons,
      onTimeRate: Number(onTimeRate.toFixed(1)),
      lateRate: Number(lateRate.toFixed(1)),
      completed,
      finishedEarly,
      na,
      teacherLate,
      technical,
      completionRate: Number(completionRate.toFixed(1)),
      totalHours: Number((totalMinutes / 60).toFixed(2)),
    };
  },
});

// ──────────────────────────────────────────────────────────────
// Admin-only: Stats for every teacher in a given month
// ──────────────────────────────────────────────────────────────
export const getAllTeachersStats = query({
  args: { month: v.string() },
  handler: async (ctx, { month }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (caller?.role !== "admin") throw new Error("Admin only");

    const teachers = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "teacher"))
      .collect();

    // Explicitly type the Promise array → no more "implicit any"
    const statsPromises: Promise<{
      teacher: Doc<"users">;
      stats: TeacherStats;
    }>[] = teachers.map(async (teacher) => {
      const stats = await ctx.runQuery(api.stats.getTeacherStats, {
        teacherId: teacher._id,
        month,
      });
      return { teacher, stats };
    });

    return Promise.all(statsPromises);
  },
});
