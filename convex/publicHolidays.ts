import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ── Admin-only: blank out all lessons on a given date ──
export const blankOutDay = mutation({
  args: {
    date: v.string(), // YYYY-MM-DD
    reason: v.optional(v.string()), // e.g. "Public Holiday"
  },
  handler: async (ctx, { date, reason }) => {
    // 1. Admin check
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (admin?.role !== "admin") throw new Error("Admin only");

    // 2. Find ALL schedule docs that have this date
    const schedulesOnDay = await ctx.db
      .query("schedules")
      .withIndex("by_date", (q) => q.eq("date", date))
      .collect();

    let totalLessonsAffected = 0;

    // 3. For each schedule, mark all lessons as cancelled
    for (const schedule of schedulesOnDay) {
      const updatedLessons = schedule.lessons.map((lesson) => ({
        ...lesson,
        state: "missed_teacher" as const,
        notes: reason ?? "Public Holiday — lesson cancelled by admin",
        markedBy: admin._id,
        markedAt: Date.now(),
      }));

      await ctx.db.patch(schedule._id, { lessons: updatedLessons });
      totalLessonsAffected += schedule.lessons.length;
    }

    // 4. Record the holiday
    await ctx.db.insert("publicHolidays", {
      date,
      reason: reason ?? "Public Holiday",
      createdBy: admin._id,
      createdAt: Date.now(),
      lessonsAffected: totalLessonsAffected,
    });

    return { success: true, totalLessonsAffected };
  },
});

// ── Query: list all public holidays (for admin dashboard) ──
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("publicHolidays").order("desc").collect();
  },
});

// ── Query: check if a specific date is a public holiday ──
export const isHoliday = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    const holiday = await ctx.db
      .query("publicHolidays")
      .withIndex("by_date", (q) => q.eq("date", date))
      .first();
    return holiday ?? null;
  },
});
