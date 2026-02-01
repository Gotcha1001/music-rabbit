// convex/attendanceQueries.ts

import { query } from "./_generated/server";
import { v } from "convex/values";

// Query to get all lessons for a student with attendance history
export const getStudentLessons = query({
  args: {
    studentId: v.id("users"),
    teacherId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    let allSchedules = await ctx.db.query("schedules").collect();
    if (args.teacherId) {
      allSchedules = allSchedules.filter((s) => s.teacherId === args.teacherId);
    }

    const allLessons = [];

    for (const schedule of allSchedules) {
      const teacher = await ctx.db.get(schedule.teacherId);

      const studentLessons = schedule.lessons.filter(
        (lesson) => lesson.studentId === args.studentId,
      );

      const enrichedLessons = await Promise.all(
        studentLessons.map(async (lesson) => {
          // ✅ RESOLVE markedBy ID to name
          let markedByName = "System";
          if (lesson.markedBy) {
            const marker = await ctx.db.get(lesson.markedBy);
            markedByName = marker?.name || marker?.email || "Unknown";
          }

          return {
            _id: lesson.lessonId,
            scheduleId: schedule._id,
            date: schedule.date,
            time: lesson.time,
            duration: lesson.duration,
            instrument: schedule.instrument || "Unknown",
            teacherName: teacher?.name || "Unknown",
            teacherId: schedule.teacherId,
            studentId: args.studentId,
            status: lesson.status || "scheduled",
            state: lesson.state || "pending",
            markedByName, // ✅ Now returns resolved name
            markedAt: lesson.markedAt,
            notes: lesson.notes,
            zoomLink: lesson.zoomLink,
            startedAt: lesson.startedAt,
          };
        }),
      );

      allLessons.push(...enrichedLessons);
    }

    allLessons.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });

    return allLessons;
  },
});

// Query to get attendance statistics for a student
export const getStudentAttendanceStats = query({
  args: {
    studentId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get all schedules
    const allSchedules = await ctx.db.query("schedules").collect();

    let totalLessons = 0;
    let attended = 0;
    let missedByStudent = 0;
    let missedByTeacher = 0;
    const cancelled = 0;
    let teacherLate = 0;

    for (const schedule of allSchedules) {
      const studentLessons = schedule.lessons.filter(
        (lesson) => lesson.studentId === args.studentId,
      );

      // Filter only past lessons
      const pastLessons = studentLessons.filter((lesson) => {
        const lessonDate = new Date(schedule.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return lessonDate < today || lesson.state !== "scheduled";
      });

      totalLessons += pastLessons.length;

      for (const lesson of pastLessons) {
        if (lesson.state === "completed") {
          attended++;
          if (lesson.status === "teacher_late") {
            teacherLate++;
          }
        } else if (lesson.state === "missed_student") {
          missedByStudent++;
        } else if (lesson.state === "missed_teacher") {
          missedByTeacher++;
        }
        // If there's a "cancelled" state, add case here
      }
    }

    const attendanceRate =
      totalLessons > 0 ? Math.round((attended / totalLessons) * 100) : 0;

    return {
      totalLessons,
      attended,
      missedByStudent,
      missedByTeacher,
      cancelled,
      teacherLate,
      attendanceRate,
      makeupNeeded: missedByStudent,
    };
  },
});

// Query to get lessons for a specific date range (useful for filtering)
export const getStudentLessonsByDateRange = query({
  args: {
    studentId: v.id("users"),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get all schedules
    const allSchedules = await ctx.db.query("schedules").collect();

    const allLessons = [];
    const startDateObj = new Date(args.startDate);
    const endDateObj = new Date(args.endDate);

    for (const schedule of allSchedules) {
      const scheduleDate = new Date(schedule.date);
      if (scheduleDate < startDateObj || scheduleDate > endDateObj) continue;

      const teacher = await ctx.db.get(schedule.teacherId);

      const studentLessons = schedule.lessons.filter(
        (lesson) => lesson.studentId === args.studentId,
      );

      const enrichedLessons = studentLessons.map((lesson) => ({
        _id: lesson.lessonId,
        scheduleId: schedule._id,
        date: schedule.date,
        time: lesson.time,
        duration: lesson.duration,
        instrument: schedule.instrument || "Unknown",
        teacherName: teacher?.name || "Unknown",
        teacherId: schedule.teacherId,
        studentId: args.studentId,
        status: lesson.status || "scheduled",
        state: lesson.state || "pending",
        // Removed markedBy, markedAt as they are not in schema
        notes: lesson.notes,
      }));

      allLessons.push(...enrichedLessons);
    }

    return allLessons;
  },
});
