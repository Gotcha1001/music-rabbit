import { v } from "convex/values";
import { mutation, query } from ".//_generated/server";
import type { Id } from ".//_generated/dataModel";

// Calculate hours notice given for cancellation
function calculateHoursNotice(
  lessonDateTime: number,
  cancelTime: number,
): number {
  return (lessonDateTime - cancelTime) / (1000 * 60 * 60);
}

// ============================================================================
// STUDENT CANCEL LESSON
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

    const lesson = schedule.lessons[lessonIndex];
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
    const hoursNotice = calculateHoursNotice(lessonDateTime, now);

    // Determine penalty
    const penaltyApplied = hoursNotice < 24;
    let refundAmount = 0;

    // If less than 24hr notice, deduct from package
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
    } else {
      // 24+ hours notice - credit back to package
      const activePackage = await ctx.db
        .query("studentPackages")
        .withIndex("by_student", (q) => q.eq("studentId", student._id))
        .filter((q) => q.eq(q.field("status"), "active"))
        .first();

      if (activePackage) {
        refundAmount = lesson.duration;
        await ctx.db.patch(activePackage._id, {
          remainingMinutes: activePackage.remainingMinutes + lesson.duration,
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
      refundAmount: refundAmount > 0 ? refundAmount : undefined,
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
      refundAmount,
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

    const lesson = schedule.lessons.find((l) => l.lessonId === lessonId);
    if (!lesson) throw new Error("Lesson not found");

    if (lesson.state !== "scheduled") {
      throw new Error("Can only reschedule scheduled lessons");
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

    const lesson = schedule.lessons[lessonIndex];
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
        const updatedLesson = {
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
      // Teachers see... actually teachers don't need to see pending (they created them)
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
// GET TEACHER AVAILABILITY (for reschedule calendar)
// ============================================================================
export const getTeacherAvailability = query({
  args: {
    teacherId: v.id("users"),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, { teacherId, startDate, endDate }) => {
    // Get all schedules in date range
    const allSchedules = await ctx.db
      .query("schedules")
      .withIndex("by_teacher_date", (q) => q.eq("teacherId", teacherId))
      .collect();

    const schedulesInRange = allSchedules.filter(
      (s) => s.date >= startDate && s.date <= endDate,
    );

    // Build availability map
    const availability: Record<string, { time: string; available: boolean }[]> =
      {};

    // For each day in range, show booked slots
    for (const schedule of schedulesInRange) {
      availability[schedule.date] = schedule.lessons.map((l) => ({
        time: l.time,
        available: false,
      }));
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

    // Students see their own, admins see all, teachers see none (for now)
    let targetId = studentId;
    if (user.role === "student") {
      targetId = user._id;
    } else if (user.role !== "admin" && studentId) {
      throw new Error("Unauthorized");
    }

    if (!targetId) return [];

    return await ctx.db
      .query("lessonCancellations")
      .withIndex("by_cancelled_by", (q) => q.eq("cancelledBy", targetId))
      .collect();
  },
});
