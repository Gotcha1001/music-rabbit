import { format } from "date-fns";
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
        // Only count lessons that have started (past or ongoing)
        const lessonStart = new Date(`${sched.date}T${lesson.time}:00`);
        const isPast = lessonStart < new Date();

        if (!isPast) continue; // Skip future lessons

        const durationHours = lesson.duration / 60; // e.g. 45 min → 0.75

        const stats = teacherStats.get(sched.teacherId) || {
          earnings: 0,
          deductions: 0,
          hours: 0,
        };

        if (lesson.status === "completed") {
          stats.earnings += durationHours * 10; // $10 per hour
          stats.hours += durationHours;
        } else if (lesson.status === "finished_early") {
          const paidHours = durationHours * 0.7; // 70% pay
          stats.earnings += paidHours * 10;
          stats.hours += durationHours; // still count full time worked
        } else if (lesson.status === "no_answer") {
          stats.deductions += 5;
          // no hours added — student didn't show
        } else if (lesson.status === "teacher_late") {
          stats.deductions += 5;
          stats.earnings += durationHours * 10; // still paid full (or adjust policy)
          stats.hours += durationHours;
        }
        // "scheduled", "calling", "in_progress", "cancelled" → ignored

        teacherStats.set(sched.teacherId, stats);
      }
    }

    // Save to payments table
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

    return { success: true, processedTeachers: teacherStats.size };
  },
});

// convex/payments.ts  ← add this function

export const getEarningsSummary = query({
  args: { teacherId: v.id("users") },
  handler: async (ctx, { teacherId }) => {
    const allSchedules = await ctx.db
      .query("schedules")
      .withIndex("by_teacher_date", (q) => q.eq("teacherId", teacherId))
      .collect();

    let todayEarnings = 0;
    let monthEarnings = 0;
    let todayHours = 0;
    let monthHours = 0;
    let deductions = 0;

    const now = new Date();
    const todayStr = format(now, "yyyy-MM-dd");
    const thisMonthStr = format(now, "yyyy-MM");

    for (const sched of allSchedules) {
      if (!sched.date.startsWith(thisMonthStr)) continue;

      for (const lesson of sched.lessons) {
        const lessonDate = sched.date;
        const hours = lesson.duration / 60;

        // Only count lessons that have started
        const lessonStart = new Date(`${sched.date}T${lesson.time}:00`);
        if (lessonStart > now) continue;

        if (lesson.status === "completed") {
          const pay = hours * 10;
          if (lessonDate === todayStr) {
            todayEarnings += pay;
            todayHours += hours;
          }
          monthEarnings += pay;
          monthHours += hours;
        } else if (lesson.status === "finished_early") {
          const pay = hours * 10 * 0.7;
          if (lessonDate === todayStr) {
            todayEarnings += pay;
            todayHours += hours;
          }
          monthEarnings += pay;
          monthHours += hours;
        } else if (
          lesson.status === "no_answer" ||
          lesson.status === "teacher_late"
        ) {
          deductions += 5;
          if (lesson.status === "teacher_late" && lessonDate === todayStr) {
            todayHours += hours;
            monthHours += hours;
          }
        }
      }
    }

    const finalToday = Math.max(
      0,
      todayEarnings - (deductions > todayEarnings ? todayEarnings : 0)
    );
    const finalMonth = Math.max(0, monthEarnings - deductions);

    return {
      today: {
        earnings: Number(finalToday.toFixed(2)),
        hours: Number(todayHours.toFixed(2)),
      },
      month: {
        earnings: Number(finalMonth.toFixed(2)),
        hours: Number(monthHours.toFixed(2)),
        deductions,
      },
    };
  },
});
