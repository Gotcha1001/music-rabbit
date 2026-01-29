// convex/payments.ts - FIXED VERSION with proper scheduledTime handling
import { format } from "date-fns";
import { Id } from "./_generated/dataModel";
import {
  mutation,
  query,
  internalMutation,
  MutationCtx,
} from "./_generated/server";
import { v } from "convex/values";

// Updated types to match new payment rules
type LessonStatus =
  | "completed" // Full pay
  | "finished_early" // Full pay - student requested
  | "no_answer_on_time" // Full pay - teacher on time, student no-show
  | "teacher_never_called" // $20 deduction - teacher missed
  | "technical_difficulty" // No pay from either side
  | "teacher_late"; // Full pay - $5 deduction

type LessonState =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "missed_teacher"
  | "missed_student";

interface Lesson {
  lessonId: string;
  studentId: Id<"users">;
  time: string;
  duration: number;
  bookId: Id<"books"> | null;
  zoomLink?: string;
  completed: boolean;
  notes?: string;
  startedAt?: number;
  endedAt?: number;
  actualMinutes?: number;
  onTime?: boolean;
  state: LessonState;
  status: LessonStatus;
  scheduledTime?: number; // Optional - might not exist on old records
}

// Helper function to parse date/time into timestamp
function getLessonTimestamp(
  date: string,
  time: string,
  scheduledTime?: number,
): number {
  // If scheduledTime exists, use it
  if (scheduledTime) return scheduledTime;

  // Otherwise, parse from date and time strings
  // date format: "YYYY-MM-DD", time format: "HH:MM"
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute).getTime();
}

const shouldGetPaid = (status: LessonStatus, state: LessonState): boolean => {
  // Only pay if lesson is completed state
  if (state !== "completed") return false;

  // Pay for these statuses (always full pay)
  return (
    status === "completed" ||
    status === "finished_early" ||
    status === "no_answer_on_time" ||
    status === "teacher_late"
  );
};

const getDeduction = (status: LessonStatus, state: LessonState): number => {
  // $20 deduction if teacher never called
  if (state === "missed_teacher" && status === "teacher_never_called") {
    return 20;
  }
  // $5 deduction if teacher was late
  if (status === "teacher_late") {
    return 5;
  }
  return 0;
};

// Shared calculation logic
async function calculateMonthLogic(ctx: MutationCtx, targetMonth: string) {
  const allSchedules = await ctx.db.query("schedules").collect();
  const monthSchedules = allSchedules.filter((s) =>
    s.date.startsWith(targetMonth),
  );

  const teacherStats = new Map<
    Id<"users">,
    { earnings: number; deductions: number; hours: number }
  >();

  for (const sched of monthSchedules) {
    for (const lesson of sched.lessons as Lesson[]) {
      const lessonDateTime = new Date(`${sched.date}T${lesson.time}:00`);
      if (lessonDateTime >= new Date()) continue; // Skip future lessons

      const minutes = lesson.actualMinutes ?? lesson.duration;
      const hours = minutes / 60;
      const { status, state } = lesson;

      const stats = teacherStats.get(sched.teacherId) || {
        earnings: 0,
        deductions: 0,
        hours: 0,
      };

      // Calculate earnings (Full pay for completed, finished_early, no_answer_on_time, teacher_late)
      if (shouldGetPaid(status, state)) {
        stats.earnings += hours * 10; // Always full pay
        stats.hours += hours;
      }

      // Calculate deductions ($20 for teacher_never_called, $5 for teacher_late)
      const deduction = getDeduction(status, state);
      if (deduction > 0) {
        stats.deductions += deduction;
      }

      teacherStats.set(sched.teacherId, stats);
    }
  }

  // Save to database
  for (const [teacherId, stats] of teacherStats) {
    const finalEarnings = Math.max(0, stats.earnings - stats.deductions);

    const existing = await ctx.db
      .query("payments")
      .withIndex("by_teacher", (q) => q.eq("teacherId", teacherId))
      .filter((q) => q.eq(q.field("month"), targetMonth))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        totalHours: stats.hours,
        earnings: finalEarnings,
        deductions: stats.deductions,
      });
    } else {
      await ctx.db.insert("payments", {
        teacherId,
        month: targetMonth,
        totalHours: stats.hours,
        earnings: finalEarnings,
        deductions: stats.deductions,
      });
    }
  }

  return { success: true, processedTeachers: teacherStats.size };
}

// Admin-accessible mutation
export const calculateMonth = mutation({
  args: { month: v.string() },
  handler: async (ctx, { month }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const caller = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (caller?.role !== "admin") throw new Error("Admin only");

    return await calculateMonthLogic(ctx, month);
  },
});

// Internal mutation for cron jobs
export const calculateMonthInternal = internalMutation({
  args: { month: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let targetMonth = args.month;
    if (!targetMonth) {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      targetMonth = format(lastMonth, "yyyy-MM");
    }
    return await calculateMonthLogic(ctx, targetMonth);
  },
});

// Get earnings summary for teacher
export const getEarningsSummary = query({
  args: { teacherId: v.id("users") },
  handler: async (ctx, { teacherId }) => {
    const schedules = await ctx.db
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

    for (const sched of schedules) {
      if (!sched.date.startsWith(thisMonthStr)) continue;

      for (const lesson of sched.lessons as Lesson[]) {
        const lessonDateTime = new Date(`${sched.date}T${lesson.time}:00`);
        if (lessonDateTime >= now) continue;

        const minutes = lesson.actualMinutes ?? lesson.duration;
        const hours = minutes / 60;
        const { status, state } = lesson;
        const isToday = sched.date === todayStr;

        if (shouldGetPaid(status, state)) {
          const pay = hours * 10; // Always full pay
          if (isToday) {
            todayEarnings += pay;
            todayHours += hours;
          }
          monthEarnings += pay;
          monthHours += hours;
        }

        const deduction = getDeduction(status, state);
        if (deduction > 0) {
          deductions += deduction;
        }
      }
    }

    const netToday = Math.max(0, todayEarnings);
    const netMonth = Math.max(0, monthEarnings - deductions);

    return {
      today: {
        earnings: Number(netToday.toFixed(2)),
        hours: Number(todayHours.toFixed(2)),
      },
      month: {
        earnings: Number(netMonth.toFixed(2)),
        hours: Number(monthHours.toFixed(2)),
        deductions,
      },
    };
  },
});

// Get detailed earnings breakdown
export const getDetailedEarnings = query({
  args: { teacherId: v.id("users"), month: v.optional(v.string()) },
  handler: async (
    ctx,
    { teacherId, month = format(new Date(), "yyyy-MM") },
  ) => {
    const schedules = await ctx.db
      .query("schedules")
      .withIndex("by_teacher_date", (q) => q.eq("teacherId", teacherId))
      .collect();

    const lessons = schedules
      .flatMap((s) =>
        s.lessons.map((l: Lesson) => ({
          ...l,
          date: s.date,
          teacherId: s.teacherId,
        })),
      )
      .filter((l) => l.date.startsWith(month));

    return lessons.map((l) => {
      const minutes = l.actualMinutes ?? l.duration;
      const hours = minutes / 60;

      return {
        date: l.date,
        time: l.time,
        duration: minutes,
        status: l.status,
        state: l.state,
        earnings: shouldGetPaid(l.status, l.state) ? hours * 10 : 0,
        deduction: getDeduction(l.status, l.state),
      };
    });
  },
});

// Get payments by teacher
export const getByTeacher = query({
  args: { teacherId: v.id("users") },
  handler: async (ctx, { teacherId }) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_teacher", (q) => q.eq("teacherId", teacherId))
      .collect();
  },
});

// Log failed payment (for student payments)
export const logFailedPayment = mutation({
  args: {
    paymentId: v.string(),
    studentId: v.id("users"),
    status: v.string(),
    amount: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("failedPayments", {
      ...args,
      timestamp: Date.now(),
      resolved: false,
    });
  },
});

// Get all teachers
export const getAllTeachers = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (admin?.role !== "admin") {
      throw new Error("Admin access required");
    }

    // Get all users with role "teacher"
    const teachers = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "teacher"))
      .collect();

    return teachers;
  },
});

// ✅ FIXED: Get teacher salaries for a specific month
export const getTeacherSalariesForMonth = query({
  args: {
    month: v.string(), // Format: "YYYY-MM"
  },
  handler: async (ctx, { month }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (admin?.role !== "admin") {
      throw new Error("Admin access required");
    }

    // Parse month for date range
    const [year, monthNum] = month.split("-").map(Number);
    const startDate = new Date(year, monthNum - 1, 1).getTime();
    const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999).getTime();

    // Get all schedules for the month (filter by date string for efficiency)
    const allSchedules = await ctx.db.query("schedules").collect();
    const monthSchedules = allSchedules.filter((s) => s.date.startsWith(month));

    // Get all teachers
    const teachers = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "teacher"))
      .collect();

    // Calculate salary for each teacher
    const salaryData = await Promise.all(
      teachers.map(async (teacher) => {
        const teacherSchedules = monthSchedules.filter(
          (schedule) => schedule.teacherId === teacher._id,
        );

        let completedLessons = 0;
        let totalHours = 0;
        let totalEarnings = 0;
        const lessonBreakdownMap = new Map<
          string,
          { count: number; hours: number; earnings: number }
        >();

        for (const schedule of teacherSchedules) {
          // ✅ FIXED: Filter completed lessons with proper timestamp handling
          const lessons =
            schedule.lessons?.filter((lesson: Lesson) => {
              // Get the lesson timestamp (either from scheduledTime or parse from date/time)
              const lessonTimestamp = getLessonTimestamp(
                schedule.date,
                lesson.time,
                lesson.scheduledTime,
              );

              return (
                lessonTimestamp >= startDate &&
                lessonTimestamp <= endDate &&
                lesson.status === "completed"
              );
            }) || [];

          completedLessons += lessons.length;

          for (const lesson of lessons as Lesson[]) {
            const duration = lesson.duration || 30; // Default 30 min
            const hours = duration / 60;
            totalHours += hours;

            // Calculate earnings
            const hourlyRate = teacher.hourlyRate || 300; // Default R300/hour
            const earnings = hours * hourlyRate;
            totalEarnings += earnings;

            // Track by instrument
            const instrument = schedule.instrument || "Unknown";
            const existing = lessonBreakdownMap.get(instrument) || {
              count: 0,
              hours: 0,
              earnings: 0,
            };
            lessonBreakdownMap.set(instrument, {
              count: existing.count + 1,
              hours: existing.hours + hours,
              earnings: existing.earnings + earnings,
            });
          }
        }

        // Convert breakdown map to array
        const lessonBreakdown = Array.from(lessonBreakdownMap.entries()).map(
          ([instrument, data]) => ({
            instrument,
            ...data,
          }),
        );

        // Check if payment has been made
        const payments = await ctx.db.query("payments").collect();
        const teacherPayment = payments.find(
          (p) =>
            p.teacherId === teacher._id &&
            p.month === month &&
            p.type === "teacher_salary",
        );

        return {
          teacherId: teacher._id,
          completedLessons,
          totalHours,
          totalEarnings,
          lessonBreakdown,
          paymentStatus: teacherPayment?.status || "Pending",
          paymentId: teacherPayment?._id,
        };
      }),
    );

    // Filter out teachers with no lessons
    return salaryData.filter((data) => data.completedLessons > 0);
  },
});

// Mark salary as paid
export const markSalaryAsPaid = mutation({
  args: {
    teacherId: v.id("users"),
    month: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, { teacherId, month, amount }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (admin?.role !== "admin") {
      throw new Error("Admin access required");
    }

    // Check if payment record exists
    const existingPayment = await ctx.db
      .query("payments")
      .filter((q) =>
        q.and(
          q.eq(q.field("teacherId"), teacherId),
          q.eq(q.field("month"), month),
          q.eq(q.field("type"), "teacher_salary"),
        ),
      )
      .first();

    if (existingPayment) {
      // Update existing payment
      await ctx.db.patch(existingPayment._id, {
        status: "Paid",
        amount,
        paidAt: Date.now(),
        paidBy: admin._id,
      });
      return existingPayment._id;
    } else {
      // Create new payment record
      const paymentId = await ctx.db.insert("payments", {
        teacherId,
        month,
        amount,
        type: "teacher_salary",
        status: "Paid",
        paidAt: Date.now(),
        paidBy: admin._id,
        createdAt: Date.now(),
        totalHours: 0,
        earnings: amount,
        deductions: 0,
      });
      return paymentId;
    }
  },
});

// Update payment status
export const updatePaymentStatus = mutation({
  args: {
    paymentId: v.id("payments"),
    status: v.union(
      v.literal("Pending"),
      v.literal("Processing"),
      v.literal("Paid"),
    ),
  },
  handler: async (ctx, { paymentId, status }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (admin?.role !== "admin") {
      throw new Error("Admin access required");
    }

    await ctx.db.patch(paymentId, {
      status,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get payment history for a teacher
export const getTeacherPaymentHistory = query({
  args: {
    teacherId: v.id("users"),
  },
  handler: async (ctx, { teacherId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    // Allow teachers to see their own history, admins to see anyone's
    if (user?.role !== "admin" && user?._id !== teacherId) {
      throw new Error("Unauthorized");
    }

    const payments = await ctx.db
      .query("payments")
      .filter((q) =>
        q.and(
          q.eq(q.field("teacherId"), teacherId),
          q.eq(q.field("type"), "teacher_salary"),
        ),
      )
      .collect();

    return payments.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  },
});

// ✅ FIXED: Internal mutation to calculate monthly salaries (called by cron)
export const calculateMonthlySalaries = internalMutation({
  handler: async (ctx) => {
    // Get previous month
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const month = `${lastMonth.getFullYear()}-${String(
      lastMonth.getMonth() + 1,
    ).padStart(2, "0")}`;

    console.log(`Calculating salaries for ${month}`);

    const startDate = new Date(
      lastMonth.getFullYear(),
      lastMonth.getMonth(),
      1,
    ).getTime();
    const endDate = new Date(
      lastMonth.getFullYear(),
      lastMonth.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    ).getTime();

    // Get all teachers
    const teachers = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "teacher"))
      .collect();

    // Get all schedules for the month
    const allSchedules = await ctx.db.query("schedules").collect();
    const monthSchedules = allSchedules.filter((s) => s.date.startsWith(month));

    for (const teacher of teachers) {
      const teacherSchedules = monthSchedules.filter(
        (schedule) => schedule.teacherId === teacher._id,
      );

      let completedLessons = 0;
      let totalHours = 0;
      let totalEarnings = 0;

      for (const schedule of teacherSchedules) {
        // ✅ FIXED: Properly handle optional scheduledTime
        const lessons =
          schedule.lessons?.filter((lesson: Lesson) => {
            const lessonTimestamp = getLessonTimestamp(
              schedule.date,
              lesson.time,
              lesson.scheduledTime,
            );

            return (
              lessonTimestamp >= startDate &&
              lessonTimestamp <= endDate &&
              lesson.status === "completed"
            );
          }) || [];

        completedLessons += lessons.length;

        for (const lesson of lessons as Lesson[]) {
          const duration = lesson.duration || 30;
          const hours = duration / 60;
          totalHours += hours;

          const hourlyRate = teacher.hourlyRate || 300;
          totalEarnings += hours * hourlyRate;
        }
      }

      // Only create payment record if teacher had completed lessons
      if (completedLessons > 0) {
        // Check if payment record already exists
        const existingPayment = await ctx.db
          .query("payments")
          .filter((q) =>
            q.and(
              q.eq(q.field("teacherId"), teacher._id),
              q.eq(q.field("month"), month),
              q.eq(q.field("type"), "teacher_salary"),
            ),
          )
          .first();

        if (!existingPayment) {
          // Create new payment record
          await ctx.db.insert("payments", {
            teacherId: teacher._id,
            month,
            amount: totalEarnings,
            type: "teacher_salary",
            status: "Pending",
            createdAt: Date.now(),
            notes: `${completedLessons} lessons, ${totalHours.toFixed(2)} hours`,
            totalHours,
            earnings: totalEarnings,
            deductions: 0,
          });

          console.log(
            `Created salary record for ${teacher.name}: R${totalEarnings.toFixed(
              2,
            )} (${completedLessons} lessons)`,
          );
        } else {
          // Update existing record
          await ctx.db.patch(existingPayment._id, {
            amount: totalEarnings,
            updatedAt: Date.now(),
            notes: `${completedLessons} lessons, ${totalHours.toFixed(2)} hours`,
          });

          console.log(
            `Updated salary record for ${teacher.name}: R${totalEarnings.toFixed(
              2,
            )}`,
          );
        }
      }
    }

    console.log(`Salary calculation completed for ${month}`);
    return { success: true, month };
  },
});

// Internal mutation to send reminders for pending payments (called by cron)
export const sendPendingPaymentReminders = internalMutation({
  handler: async (ctx) => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(
      now.getMonth() + 1,
    ).padStart(2, "0")}`;

    // Get all pending payments for previous months
    const pendingPayments = await ctx.db
      .query("payments")
      .filter((q) =>
        q.and(
          q.eq(q.field("type"), "teacher_salary"),
          q.eq(q.field("status"), "Pending"),
          q.lt(q.field("month"), currentMonth),
        ),
      )
      .collect();

    console.log(`Found ${pendingPayments.length} pending salary payments`);

    // Get admin users to notify
    const admins = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "admin"))
      .collect();

    if (pendingPayments.length > 0 && admins.length > 0) {
      // Create reminder messages for each admin
      for (const admin of admins) {
        console.log(
          `Reminder: ${pendingPayments.length} pending teacher salary payments for admin ${admin.name}`,
        );
      }
    }

    return {
      success: true,
      pendingCount: pendingPayments.length,
      notifiedAdmins: admins.length,
    };
  },
});
