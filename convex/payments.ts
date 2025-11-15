import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByTeacher = query({
  args: { teacherId: v.id("users") },
  handler: async (ctx, { teacherId }) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_teacher", (q) => q.eq("teacherId", teacherId))
      .collect();
  },
});

export const calculateMonth = mutation({
  args: { month: v.string() }, // "2025-11"
  handler: async (ctx, { month }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    if (caller?.role !== "admin") throw new Error("Admin only");

    const allSchedules = await ctx.db.query("schedules").collect();
    const monthSchedules = allSchedules.filter((s) => s.date.startsWith(month));

    const teacherStats = new Map<
      Id<"users">,
      { earnings: number; deductions: number; hours: number }
    >();

    for (const sched of monthSchedules) {
      for (const lesson of sched.lessons) {
        const lessonStart = new Date(`${sched.date}T${lesson.time}:00`);
        const isPast = lessonStart < new Date();

        const stats = teacherStats.get(sched.teacherId) || {
          earnings: 0,
          deductions: 0,
          hours: 0,
        };

        if (lesson.completed) {
          const hours = lesson.duration / 60;
          stats.earnings += hours * 10;
          stats.hours += hours;
        } else if (isPast) {
          stats.deductions += 5;
        }

        teacherStats.set(sched.teacherId, stats);
      }
    }

    for (const [teacherId, stats] of teacherStats) {
      const existing = await ctx.db
        .query("payments")
        .withIndex("by_teacher", (q) => q.eq("teacherId", teacherId))
        .filter((q) => q.eq(q.field("month"), month))
        .first();

      const finalEarnings = Math.max(0, stats.earnings - stats.deductions);

      if (existing) {
        await ctx.db.patch(existing._id, {
          totalHours: stats.hours,
          earnings: finalEarnings,
          deductions: stats.deductions,
        });
      } else {
        await ctx.db.insert("payments", {
          teacherId,
          month,
          totalHours: stats.hours,
          earnings: finalEarnings,
          deductions: stats.deductions,
        });
      }
    }
  },
});
