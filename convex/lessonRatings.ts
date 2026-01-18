// convex/lessonRatings.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Submit rating (student only, post-completion, 1-5 only)
export const submit = mutation({
  args: {
    scheduleId: v.id("schedules"),
    lessonId: v.string(),
    rating: v.number(),
  },
  handler: async (ctx, { scheduleId, lessonId, rating }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const student = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!student || student.role !== "student")
      throw new Error("Only students can rate lessons");

    // Validate rating
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      throw new Error("Rating must be an integer between 1 and 5");
    }

    const schedule = await ctx.db.get(scheduleId);
    if (!schedule) throw new Error("Schedule not found");
    const lesson = schedule.lessons.find((l) => l.lessonId === lessonId);
    if (!lesson || lesson.studentId !== student._id)
      throw new Error("Not your lesson");
    if (lesson.state !== "completed")
      throw new Error("Can only rate completed lessons");

    // Check if already rated
    const existing = await ctx.db
      .query("lessonRatings")
      .withIndex("by_student_lesson", (q) =>
        q
          .eq("studentId", student._id)
          .eq("scheduleId", scheduleId)
          .eq("lessonId", lessonId),
      )
      .first();
    if (existing) throw new Error("Lesson already rated");

    // Insert rating
    await ctx.db.insert("lessonRatings", {
      scheduleId,
      lessonId,
      studentId: student._id,
      teacherId: schedule.teacherId,
      rating,
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

// Check if lesson is rated by student
export const getForLesson = query({
  args: { scheduleId: v.id("schedules"), lessonId: v.string() },
  handler: async (ctx, { scheduleId, lessonId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const student = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (!student || student.role !== "student") return null;

    return await ctx.db
      .query("lessonRatings")
      .withIndex("by_student_lesson", (q) =>
        q
          .eq("studentId", student._id)
          .eq("scheduleId", scheduleId)
          .eq("lessonId", lessonId),
      )
      .first();
  },
});

// Get aggregated ratings for a teacher (admin/teacher stats only)
export const getTeacherStats = query({
  args: { teacherId: v.id("users") },
  handler: async (ctx, { teacherId }) => {
    const ratings = await ctx.db
      .query("lessonRatings")
      .withIndex("by_teacher", (q) => q.eq("teacherId", teacherId))
      .collect();

    if (ratings.length === 0) return { average: 0, total: 0, count: 0 };

    const total = ratings.reduce((sum, r) => sum + r.rating, 0);
    const average = total / ratings.length;

    return {
      average: Number(average.toFixed(2)), // e.g., 4.3
      total, // Sum of all ratings
      count: ratings.length, // Number of ratings received
    };
  },
});
