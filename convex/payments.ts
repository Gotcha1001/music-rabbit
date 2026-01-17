// // convex/payments.ts
// import { format } from "date-fns";
// import { Id } from "./_generated/dataModel";
// import { mutation, query } from "./_generated/server";
// import { v } from "convex/values";

// type LessonStatus =
//   | "completed"
//   | "finished_early"
//   | "na"
//   | "teacher_late"
//   | "technical_difficulty";

// // Helper: is lesson considered "worked" (teacher showed up)
// const isWorked = (status: LessonStatus): boolean =>
//   status === "completed" ||
//   status === "finished_early" ||
//   status === "teacher_late" ||
//   status === "technical_difficulty";

// // Helper: is deduction applied?
// const hasDeduction = (status: LessonStatus): boolean =>
//   status === "na" || status === "teacher_late";

// export const getByTeacher = query({
//   args: { teacherId: v.id("users") },
//   handler: async (ctx, { teacherId }) => {
//     return await ctx.db
//       .query("payments")
//       .withIndex("by_teacher", (q) => q.eq("teacherId", teacherId))
//       .collect();
//   },
// });

// /**
//  * Admin-only: Recalculate all teacher payments for a given month (e.g. "2025-11")
//  */
// export const calculateMonth = mutation({
//   args: { month: v.string() }, // "2025-11"
//   handler: async (ctx, { month }) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) throw new Error("Unauthorized");
//     const caller = await ctx.db
//       .query("users")
//       .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
//       .first();
//     if (caller?.role !== "admin") throw new Error("Admin only");

//     const allSchedules = await ctx.db.query("schedules").collect();
//     const monthSchedules = allSchedules.filter((s) => s.date.startsWith(month));

//     const teacherStats = new Map<
//       Id<"users">,
//       { earnings: number; deductions: number; hours: number }
//     >();

//     for (const sched of monthSchedules) {
//       for (const lesson of sched.lessons) {
//         const lessonDateTime = new Date(`${sched.date}T${lesson.time}:00`);
//         if (lessonDateTime >= new Date()) continue; // skip future

//         const hours = lesson.duration / 60;
//         const status = lesson.status;

//         const stats = teacherStats.get(sched.teacherId) || {
//           earnings: 0,
//           deductions: 0,
//           hours: 0,
//         };

//         if (status === "completed") {
//           stats.earnings += hours * 10;
//           stats.hours += hours;
//         } else if (status === "finished_early") {
//           stats.earnings += hours * 10 * 0.7; // 70% pay
//           stats.hours += hours;
//         } else if (status === "teacher_late") {
//           stats.earnings += hours * 10; // full pay (or change policy)
//           stats.deductions += 5;
//           stats.hours += hours;
//         } else if (status === "na") {
//           stats.deductions += 5;
//           // no pay, no hours counted
//         }
//         // "technical_difficulty" → full pay, no deduction (adjust as needed)
//         else if (status === "technical_difficulty") {
//           stats.earnings += hours * 10;
//           stats.hours += hours;
//         }

//         teacherStats.set(sched.teacherId, stats);
//       }
//     }

//     for (const [teacherId, stats] of teacherStats) {
//       const finalEarnings = Math.max(0, stats.earnings - stats.deductions);

//       const existing = await ctx.db
//         .query("payments")
//         .withIndex("by_teacher", (q) => q.eq("teacherId", teacherId))
//         .filter((q) => q.eq(q.field("month"), month))
//         .first();

//       if (existing) {
//         await ctx.db.patch(existing._id, {
//           totalHours: stats.hours,
//           earnings: finalEarnings,
//           deductions: stats.deductions,
//         });
//       } else {
//         await ctx.db.insert("payments", {
//           teacherId,
//           month,
//           totalHours: stats.hours,
//           earnings: finalEarnings,
//           deductions: stats.deductions,
//         });
//       }
//     }

//     return { success: true, processedTeachers: teacherStats.size };
//   },
// });

// /**
//  * Teacher dashboard summary (today + this month)
//  */
// export const getEarningsSummary = query({
//   args: { teacherId: v.id("users") },
//   handler: async (ctx, { teacherId }) => {
//     const schedules = await ctx.db
//       .query("schedules")
//       .withIndex("by_teacher_date", (q) => q.eq("teacherId", teacherId))
//       .collect();

//     let todayEarnings = 0;
//     let monthEarnings = 0;
//     let todayHours = 0;
//     let monthHours = 0;
//     let deductions = 0;

//     const now = new Date();
//     const todayStr = format(now, "yyyy-MM-dd");
//     const thisMonthStr = format(now, "yyyy-MM");

//     for (const sched of schedules) {
//       if (!sched.date.startsWith(thisMonthStr)) continue;

//       for (const lesson of sched.lessons) {
//         const lessonDateTime = new Date(`${sched.date}T${lesson.time}:00`);
//         if (lessonDateTime >= now) continue; // future lessons

//         const hours = lesson.duration / 60;
//         const status = lesson.status;
//         const isToday = sched.date === todayStr;

//         if (status === "completed") {
//           const pay = hours * 10;
//           if (isToday) {
//             todayEarnings += pay;
//             todayHours += hours;
//           }
//           monthEarnings += pay;
//           monthHours += hours;
//         } else if (status === "finished_early") {
//           const pay = hours * 10 * 0.7;
//           if (isToday) {
//             todayEarnings += pay;
//             todayHours += hours;
//           }
//           monthEarnings += pay;
//           monthHours += hours;
//         } else if (status === "teacher_late") {
//           const pay = hours * 10;
//           if (isToday) {
//             todayEarnings += pay;
//             todayHours += hours;
//           }
//           monthEarnings += pay;
//           monthHours += hours;
//           deductions += 5;
//         } else if (status === "na") {
//           deductions += 5;
//         } else if (status === "technical_difficulty") {
//           const pay = hours * 10;
//           if (isToday) {
//             todayEarnings += pay;
//             todayHours += hours;
//           }
//           monthEarnings += pay;
//           monthHours += hours;
//         }
//       }
//     }

//     const netToday = Math.max(0, todayEarnings);
//     const netMonth = Math.max(0, monthEarnings - deductions);

//     return {
//       today: {
//         earnings: Number(netToday.toFixed(2)),
//         hours: Number(todayHours.toFixed(2)),
//       },
//       month: {
//         earnings: Number(netMonth.toFixed(2)),
//         hours: Number(monthHours.toFixed(2)),
//         deductions,
//       },
//     };
//   },
// });

// export const getDetailedEarnings = query({
//   args: { teacherId: v.id("users"), month: v.optional(v.string()) },
//   handler: async (
//     ctx,
//     { teacherId, month = format(new Date(), "yyyy-MM") }
//   ) => {
//     const schedules = await ctx.db
//       .query("schedules")
//       .withIndex("by_teacher_date", (q) => q.eq("teacherId", teacherId))
//       .collect();

//     const lessons = schedules
//       .flatMap((s) =>
//         s.lessons.map((l) => ({
//           ...l,
//           date: s.date,
//           teacherId: s.teacherId,
//         }))
//       )
//       .filter((l) => l.date.startsWith(month));

//     return lessons.map((l) => ({
//       date: l.date,
//       time: l.time,
//       duration: l.duration,
//       status: l.status,
//       earnings:
//         l.status === "completed" ||
//         l.status === "teacher_late" ||
//         l.status === "technical_difficulty"
//           ? (l.duration / 60) * 10
//           : l.status === "finished_early"
//             ? (l.duration / 60) * 10 * 0.7
//             : 0,
//       deduction: l.status === "na" || l.status === "teacher_late" ? 5 : 0,
//     }));
//   },
// });
// export const logFailedPayment = mutation({
//   args: {
//     paymentId: v.string(),
//     studentId: v.id("users"),
//     status: v.string(),
//     amount: v.number(),
//     reason: v.string(),
//   },
//   handler: async (ctx, args) => {
//     // You can create a new "failedPayments" table or use existing payments table
//     await ctx.db.insert("failedPayments", {
//       ...args,
//       timestamp: Date.now(),
//       resolved: false,
//     });
//   },
// });
// import { format } from "date-fns";
// import { Id } from "./_generated/dataModel";
// import { internalMutation, mutation, query } from "./_generated/server";
// import { v } from "convex/values";

// // Assuming these types are defined in your schema.ts and regenerated
// type LessonStatus =
//   | "completed"
//   | "finished_early"
//   | "teacher_late"
//   | "technical_difficulty"
//   | "na";
// type LessonState =
//   | "scheduled"
//   | "teacher_ready"
//   | "in_progress"
//   | "completed"
//   | "missed_teacher"
//   | "missed_student";
// interface Lesson {
//   lessonId: string;
//   studentId: Id<"users">;
//   time: string;
//   duration: number;
//   bookId: Id<"books"> | null;
//   zoomLink?: string;
//   completed: boolean;
//   notes?: string;
//   startedAt?: number;
//   endedAt?: number;
//   actualMinutes?: number;
//   onTime?: boolean;
//   state: LessonState;
//   status: LessonStatus;
// }

// // Helper: is lesson considered "worked" (teacher showed up and completed)
// const isWorked = (status: LessonStatus, state: LessonState): boolean =>
//   state === "completed" && // ← Added: Only completed state counts
//   (status === "completed" ||
//     status === "finished_early" ||
//     status === "teacher_late" ||
//     status === "technical_difficulty");

// // Helper: is deduction applied? (fixed to avoid recursion; assuming previous was isStatusDeduction or similar)
// const isStatusDeduction = (status: LessonStatus): boolean =>
//   status === "teacher_late" || status === "technical_difficulty";

// const hasDeduction = (status: LessonStatus, state: LessonState): boolean =>
//   isStatusDeduction(status) || // Use new helper for status-only check
//   state === "missed_teacher" || // ← Added: Deduct for teacher misses
//   (state === "missed_student" && status === "na"); // ← Added: Optional policy for student misses

// export const getByTeacher = query({
//   args: { teacherId: v.id("users") },
//   handler: async (ctx, { teacherId }) => {
//     return await ctx.db
//       .query("payments")
//       .withIndex("by_teacher", (q) => q.eq("teacherId", teacherId))
//       .collect();
//   },
// });

// /**
//  * Admin-only: Recalculate all teacher payments for a given month (e.g. "2025-11")
//  */
// // Change to internalMutation if running via cron
// export const calculateMonth = internalMutation({
//   args: { month: v.optional(v.string()) }, // Changed to optional
//   handler: async (ctx, args) => {
//     // Use args instead of { month }
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) throw new Error("Unauthorized");
//     const caller = await ctx.db
//       .query("users")
//       .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
//       .first();
//     if (caller?.role !== "admin") throw new Error("Admin only");

//     // ADD THE SNIPPET HERE
//     let targetMonth = args.month;
//     if (!targetMonth) {
//       const now = new Date();
//       const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
//       targetMonth = format(lastMonth, "yyyy-MM"); // e.g., on Jan 1, 2026 → "2025-12"
//     }

//     const allSchedules = await ctx.db.query("schedules").collect();
//     const monthSchedules = allSchedules.filter((s) =>
//       s.date.startsWith(targetMonth)
//     ); // Use targetMonth

//     const teacherStats = new Map<
//       Id<"users">,
//       { earnings: number; deductions: number; hours: number }
//     >();

//     for (const sched of monthSchedules) {
//       // Use monthSchedules (no change needed here)
//       for (const lesson of sched.lessons as Lesson[]) {
//         // ← Typed as Lesson[]
//         const lessonDateTime = new Date(`${sched.date}T${lesson.time}:00`);
//         if (lessonDateTime >= new Date()) continue; // skip future

//         const minutes = lesson.actualMinutes ?? lesson.duration; // ← Added: Prefer actualMinutes
//         const hours = minutes / 60;
//         const { status, state } = lesson; // ← Destructure for state

//         if (state === "missed_student") continue; // ← Added: No pay/deduction for student misses (adjust policy if needed)

//         const stats = teacherStats.get(sched.teacherId) || {
//           earnings: 0,
//           deductions: 0,
//           hours: 0,
//         };

//         if (isWorked(status, state)) {
//           // ← Updated: Pass state to helper
//           let payMultiplier = 1;
//           if (status === "finished_early") payMultiplier = 0.7;
//           stats.earnings += hours * 10 * payMultiplier;
//           stats.hours += hours;
//         }

//         if (hasDeduction(status, state)) {
//           // ← Updated: Pass state to helper
//           stats.deductions += 5;
//         }

//         teacherStats.set(sched.teacherId, stats);
//       }
//     }

//     for (const [teacherId, stats] of teacherStats) {
//       const finalEarnings = Math.max(0, stats.earnings - stats.deductions);

//       const existing = await ctx.db
//         .query("payments")
//         .withIndex("by_teacher", (q) => q.eq("teacherId", teacherId))
//         .filter((q) => q.eq(q.field("month"), targetMonth)) // Use targetMonth
//         .first();

//       if (existing) {
//         await ctx.db.patch(existing._id, {
//           totalHours: stats.hours,
//           earnings: finalEarnings,
//           deductions: stats.deductions,
//         });
//       } else {
//         await ctx.db.insert("payments", {
//           teacherId,
//           month: targetMonth, // Use targetMonth
//           totalHours: stats.hours,
//           earnings: finalEarnings,
//           deductions: stats.deductions,
//         });
//       }
//     }

//     return { success: true, processedTeachers: teacherStats.size };
//   },
// });
// /**
//  * Teacher dashboard summary (today + this month)
//  */
// export const getEarningsSummary = query({
//   args: { teacherId: v.id("users") },
//   handler: async (ctx, { teacherId }) => {
//     const schedules = await ctx.db
//       .query("schedules")
//       .withIndex("by_teacher_date", (q) => q.eq("teacherId", teacherId))
//       .collect();

//     let todayEarnings = 0;
//     let monthEarnings = 0;
//     let todayHours = 0;
//     let monthHours = 0;
//     let deductions = 0;

//     const now = new Date();
//     const todayStr = format(now, "yyyy-MM-dd");
//     const thisMonthStr = format(now, "yyyy-MM");

//     for (const sched of schedules) {
//       if (!sched.date.startsWith(thisMonthStr)) continue;

//       for (const lesson of sched.lessons as Lesson[]) {
//         // ← Typed as Lesson[]
//         const lessonDateTime = new Date(`${sched.date}T${lesson.time}:00`);
//         if (lessonDateTime >= now) continue; // future lessons

//         const minutes = lesson.actualMinutes ?? lesson.duration; // ← Added: Prefer actualMinutes
//         const hours = minutes / 60;
//         const { status, state } = lesson; // ← Destructure for state
//         const isToday = sched.date === todayStr;

//         if (state === "missed_student") continue; // ← Added: No pay/deduction for student misses (adjust policy if needed)

//         if (isWorked(status, state)) {
//           // ← Updated: Pass state to helper
//           let pay = hours * 10;
//           if (status === "finished_early") pay *= 0.7;
//           if (isToday) {
//             todayEarnings += pay;
//             todayHours += hours;
//           }
//           monthEarnings += pay;
//           monthHours += hours;
//         }

//         if (hasDeduction(status, state)) {
//           // ← Updated: Pass state to helper
//           deductions += 5;
//         }
//       }
//     }

//     const netToday = Math.max(0, todayEarnings);
//     const netMonth = Math.max(0, monthEarnings - deductions);

//     return {
//       today: {
//         earnings: Number(netToday.toFixed(2)),
//         hours: Number(todayHours.toFixed(2)),
//       },
//       month: {
//         earnings: Number(netMonth.toFixed(2)),
//         hours: Number(monthHours.toFixed(2)),
//         deductions,
//       },
//     };
//   },
// });

// export const getDetailedEarnings = query({
//   args: { teacherId: v.id("users"), month: v.optional(v.string()) },
//   handler: async (
//     ctx,
//     { teacherId, month = format(new Date(), "yyyy-MM") }
//   ) => {
//     const schedules = await ctx.db
//       .query("schedules")
//       .withIndex("by_teacher_date", (q) => q.eq("teacherId", teacherId))
//       .collect();

//     const lessons = schedules
//       .flatMap((s) =>
//         s.lessons.map((l: Lesson) => ({
//           // ← Typed as Lesson
//           ...l,
//           date: s.date,
//           teacherId: s.teacherId,
//         }))
//       )
//       .filter((l) => l.date.startsWith(month));

//     return lessons.map((l) => {
//       const minutes = l.actualMinutes ?? l.duration; // ← Added: Prefer actualMinutes
//       return {
//         date: l.date,
//         time: l.time,
//         duration: minutes, // ← Updated: Show actual if available
//         status: l.status,
//         state: l.state, // ← Added: Include state for detailed view
//         earnings: isWorked(l.status, l.state) // ← Updated: Use helpers with state
//           ? (minutes / 60) * 10 * (l.status === "finished_early" ? 0.7 : 1)
//           : 0,
//         deduction: hasDeduction(l.status, l.state) ? 5 : 0, // ← Updated
//       };
//     });
//   },
// });

// // Optional: Keep if needed for PayFast failures; otherwise remove if not integrated yet
// export const logFailedPayment = mutation({
//   args: {
//     paymentId: v.string(),
//     studentId: v.id("users"),
//     status: v.string(),
//     amount: v.number(),
//     reason: v.string(),
//   },
//   handler: async (ctx, args) => {
//     // You can create a new "failedPayments" table or use existing payments table
//     await ctx.db.insert("failedPayments", {
//       ...args,
//       timestamp: Date.now(),
//       resolved: false,
//     });
//   },
// });
// import { format } from "date-fns";
// import { Id } from "./_generated/dataModel";
// import { internalMutation, mutation, query } from "./_generated/server";
// import { v } from "convex/values";

// // Assuming these types are defined in your schema.ts and regenerated
// type LessonStatus =
//   | "completed"
//   | "finished_early"
//   | "teacher_late"
//   | "technical_difficulty"
//   | "na";
// type LessonState =
//   | "scheduled"
//   | "in_progress"
//   | "completed"
//   | "missed_teacher"
//   | "missed_student";
// interface Lesson {
//   lessonId: string;
//   studentId: Id<"users">;
//   time: string;
//   duration: number;
//   bookId: Id<"books"> | null;
//   zoomLink?: string;
//   completed: boolean;
//   notes?: string;
//   startedAt?: number;
//   endedAt?: number;
//   actualMinutes?: number;
//   onTime?: boolean;
//   state: LessonState;
//   status: LessonStatus;
// }

// // Helper: is lesson considered "worked" (teacher showed up and completed)
// const isWorked = (status: LessonStatus, state: LessonState): boolean =>
//   state === "completed" && // ← Added: Only completed state counts
//   (status === "completed" ||
//     status === "finished_early" ||
//     status === "teacher_late" ||
//     status === "technical_difficulty");

// // Helper: is deduction applied? (fixed to avoid recursion; assuming previous was isStatusDeduction or similar)
// const isStatusDeduction = (status: LessonStatus): boolean =>
//   status === "teacher_late" || status === "technical_difficulty";

// const hasDeduction = (status: LessonStatus, state: LessonState): boolean =>
//   isStatusDeduction(status) || // Use new helper for status-only check
//   state === "missed_teacher" || // ← Added: Deduct for teacher misses
//   (state === "missed_student" && status === "na"); // ← Added: Optional policy for student misses

// export const getByTeacher = query({
//   args: { teacherId: v.id("users") },
//   handler: async (ctx, { teacherId }) => {
//     return await ctx.db
//       .query("payments")
//       .withIndex("by_teacher", (q) => q.eq("teacherId", teacherId))
//       .collect();
//   },
// });

// /**
//  * Admin-only: Recalculate all teacher payments for a given month (e.g. "2025-11")
//  */
// // Change to internalMutation if running via cron
// export const calculateMonth = internalMutation({
//   args: { month: v.optional(v.string()) }, // Changed to optional
//   handler: async (ctx, args) => {
//     // Use args instead of { month }
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) throw new Error("Unauthorized");
//     const caller = await ctx.db
//       .query("users")
//       .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
//       .first();
//     if (caller?.role !== "admin") throw new Error("Admin only");

//     // ADD THE SNIPPET HERE
//     let targetMonth = args.month;
//     if (!targetMonth) {
//       const now = new Date();
//       const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
//       targetMonth = format(lastMonth, "yyyy-MM"); // e.g., on Jan 1, 2026 → "2025-12"
//     }

//     const allSchedules = await ctx.db.query("schedules").collect();
//     const monthSchedules = allSchedules.filter((s) =>
//       s.date.startsWith(targetMonth)
//     ); // Use targetMonth

//     const teacherStats = new Map<
//       Id<"users">,
//       { earnings: number; deductions: number; hours: number }
//     >();

//     for (const sched of monthSchedules) {
//       // Use monthSchedules (no change needed here)
//       for (const lesson of sched.lessons as Lesson[]) {
//         // ← Typed as Lesson[]
//         const lessonDateTime = new Date(`${sched.date}T${lesson.time}:00`);
//         if (lessonDateTime >= new Date()) continue; // skip future

//         const minutes = lesson.actualMinutes ?? lesson.duration; // ← Added: Prefer actualMinutes
//         const hours = minutes / 60;
//         const { status, state } = lesson; // ← Destructure for state

//         if (state === "missed_student") continue; // ← Added: No pay/deduction for student misses (adjust policy if needed)

//         const stats = teacherStats.get(sched.teacherId) || {
//           earnings: 0,
//           deductions: 0,
//           hours: 0,
//         };

//         if (isWorked(status, state)) {
//           // ← Updated: Pass state to helper
//           let payMultiplier = 1;
//           if (status === "finished_early") payMultiplier = 0.7;
//           stats.earnings += hours * 10 * payMultiplier;
//           stats.hours += hours;
//         }

//         if (hasDeduction(status, state)) {
//           // ← Updated: Pass state to helper
//           stats.deductions += 5;
//         }

//         teacherStats.set(sched.teacherId, stats);
//       }
//     }

//     for (const [teacherId, stats] of teacherStats) {
//       const finalEarnings = Math.max(0, stats.earnings - stats.deductions);

//       const existing = await ctx.db
//         .query("payments")
//         .withIndex("by_teacher", (q) => q.eq("teacherId", teacherId))
//         .filter((q) => q.eq(q.field("month"), targetMonth)) // Use targetMonth
//         .first();

//       if (existing) {
//         await ctx.db.patch(existing._id, {
//           totalHours: stats.hours,
//           earnings: finalEarnings,
//           deductions: stats.deductions,
//         });
//       } else {
//         await ctx.db.insert("payments", {
//           teacherId,
//           month: targetMonth, // Use targetMonth
//           totalHours: stats.hours,
//           earnings: finalEarnings,
//           deductions: stats.deductions,
//         });
//       }
//     }

//     return { success: true, processedTeachers: teacherStats.size };
//   },
// });
// /**
//  * Teacher dashboard summary (today + this month)
//  */
// export const getEarningsSummary = query({
//   args: { teacherId: v.id("users") },
//   handler: async (ctx, { teacherId }) => {
//     const schedules = await ctx.db
//       .query("schedules")
//       .withIndex("by_teacher_date", (q) => q.eq("teacherId", teacherId))
//       .collect();

//     let todayEarnings = 0;
//     let monthEarnings = 0;
//     let todayHours = 0;
//     let monthHours = 0;
//     let deductions = 0;

//     const now = new Date();
//     const todayStr = format(now, "yyyy-MM-dd");
//     const thisMonthStr = format(now, "yyyy-MM");

//     for (const sched of schedules) {
//       if (!sched.date.startsWith(thisMonthStr)) continue;

//       for (const lesson of sched.lessons as Lesson[]) {
//         // ← Typed as Lesson[]
//         const lessonDateTime = new Date(`${sched.date}T${lesson.time}:00`);
//         if (lessonDateTime >= now) continue; // future lessons

//         const minutes = lesson.actualMinutes ?? lesson.duration; // ← Added: Prefer actualMinutes
//         const hours = minutes / 60;
//         const { status, state } = lesson; // ← Destructure for state
//         const isToday = sched.date === todayStr;

//         if (state === "missed_student") continue; // ← Added: No pay/deduction for student misses (adjust policy if needed)

//         if (isWorked(status, state)) {
//           // ← Updated: Pass state to helper
//           let pay = hours * 10;
//           if (status === "finished_early") pay *= 0.7;
//           if (isToday) {
//             todayEarnings += pay;
//             todayHours += hours;
//           }
//           monthEarnings += pay;
//           monthHours += hours;
//         }

//         if (hasDeduction(status, state)) {
//           // ← Updated: Pass state to helper
//           deductions += 5;
//         }
//       }
//     }

//     const netToday = Math.max(0, todayEarnings);
//     const netMonth = Math.max(0, monthEarnings - deductions);

//     return {
//       today: {
//         earnings: Number(netToday.toFixed(2)),
//         hours: Number(todayHours.toFixed(2)),
//       },
//       month: {
//         earnings: Number(netMonth.toFixed(2)),
//         hours: Number(monthHours.toFixed(2)),
//         deductions,
//       },
//     };
//   },
// });

// export const getDetailedEarnings = query({
//   args: { teacherId: v.id("users"), month: v.optional(v.string()) },
//   handler: async (
//     ctx,
//     { teacherId, month = format(new Date(), "yyyy-MM") }
//   ) => {
//     const schedules = await ctx.db
//       .query("schedules")
//       .withIndex("by_teacher_date", (q) => q.eq("teacherId", teacherId))
//       .collect();

//     const lessons = schedules
//       .flatMap((s) =>
//         s.lessons.map((l: Lesson) => ({
//           // ← Typed as Lesson
//           ...l,
//           date: s.date,
//           teacherId: s.teacherId,
//         }))
//       )
//       .filter((l) => l.date.startsWith(month));

//     return lessons.map((l) => {
//       const minutes = l.actualMinutes ?? l.duration; // ← Added: Prefer actualMinutes
//       return {
//         date: l.date,
//         time: l.time,
//         duration: minutes, // ← Updated: Show actual if available
//         status: l.status,
//         state: l.state, // ← Added: Include state for detailed view
//         earnings: isWorked(l.status, l.state) // ← Updated: Use helpers with state
//           ? (minutes / 60) * 10 * (l.status === "finished_early" ? 0.7 : 1)
//           : 0,
//         deduction: hasDeduction(l.status, l.state) ? 5 : 0, // ← Updated
//       };
//     });
//   },
// });

// // Optional: Keep if needed for PayFast failures; otherwise remove if not integrated yet
// export const logFailedPayment = mutation({
//   args: {
//     paymentId: v.string(),
//     studentId: v.id("users"),
//     status: v.string(),
//     amount: v.number(),
//     reason: v.string(),
//   },
//   handler: async (ctx, args) => {
//     // You can create a new "failedPayments" table or use existing payments table
//     await ctx.db.insert("failedPayments", {
//       ...args,
//       timestamp: Date.now(),
//       resolved: false,
//     });
//   },
// });

// import { format } from "date-fns";
// import { Id } from "./_generated/dataModel";
// import { mutation, query, internalMutation } from "./_generated/server";
// import { v } from "convex/values";

// // Assuming these types are defined in your schema.ts and regenerated
// type LessonStatus =
//   | "completed"
//   | "finished_early"
//   | "teacher_late"
//   | "technical_difficulty"
//   | "na";
// type LessonState =
//   | "scheduled"
//   | "in_progress"
//   | "completed"
//   | "missed_teacher"
//   | "missed_student";
// interface Lesson {
//   lessonId: string;
//   studentId: Id<"users">;
//   time: string;
//   duration: number;
//   bookId: Id<"books"> | null;
//   zoomLink?: string;
//   completed: boolean;
//   notes?: string;
//   startedAt?: number;
//   endedAt?: number;
//   actualMinutes?: number;
//   onTime?: boolean;
//   state: LessonState;
//   status: LessonStatus;
// }

// // Helper: is lesson considered "worked" (teacher showed up and completed)
// const isWorked = (status: LessonStatus, state: LessonState): boolean =>
//   state === "completed" && // ← Added: Only completed state counts
//   (status === "completed" ||
//     status === "finished_early" ||
//     status === "teacher_late" ||
//     status === "technical_difficulty");

// // Helper: is deduction applied? (fixed to avoid recursion; assuming previous was isStatusDeduction or similar)
// const isStatusDeduction = (status: LessonStatus): boolean =>
//   status === "teacher_late" || status === "technical_difficulty";

// const hasDeduction = (status: LessonStatus, state: LessonState): boolean =>
//   isStatusDeduction(status) || // Use new helper for status-only check
//   state === "missed_teacher" || // ← Added: Deduct for teacher misses
//   (state === "missed_student" && status === "na"); // ← Added: Optional policy for student misses

// export const getByTeacher = query({
//   args: { teacherId: v.id("users") },
//   handler: async (ctx, { teacherId }) => {
//     return await ctx.db
//       .query("payments")
//       .withIndex("by_teacher", (q) => q.eq("teacherId", teacherId))
//       .collect();
//   },
// });

// /**
//  * Admin-only: Recalculate all teacher payments for a given month (e.g. "2025-11")
//  */
// // Change to internalMutation if running via cron
// export const calculateMonth = internalMutation({
//   args: { month: v.optional(v.string()) }, // Changed to optional
//   handler: async (ctx, args) => {
//     // Use args instead of { month }
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) throw new Error("Unauthorized");
//     const caller = await ctx.db
//       .query("users")
//       .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
//       .first();
//     if (caller?.role !== "admin") throw new Error("Admin only");

//     // ADD THE SNIPPET HERE
//     let targetMonth = args.month;
//     if (!targetMonth) {
//       const now = new Date();
//       const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
//       targetMonth = format(lastMonth, "yyyy-MM"); // e.g., on Jan 1, 2026 → "2025-12"
//     }

//     const allSchedules = await ctx.db.query("schedules").collect();
//     const monthSchedules = allSchedules.filter((s) =>
//       s.date.startsWith(targetMonth)
//     ); // Use targetMonth

//     const teacherStats = new Map<
//       Id<"users">,
//       { earnings: number; deductions: number; hours: number }
//     >();

//     for (const sched of monthSchedules) {
//       // Use monthSchedules (no change needed here)
//       for (const lesson of sched.lessons as Lesson[]) {
//         // ← Typed as Lesson[]
//         const lessonDateTime = new Date(`${sched.date}T${lesson.time}:00`);
//         if (lessonDateTime >= new Date()) continue; // skip future

//         const minutes = lesson.actualMinutes ?? lesson.duration; // ← Added: Prefer actualMinutes
//         const hours = minutes / 60;
//         const { status, state } = lesson; // ← Destructure for state

//         if (state === "missed_student") continue; // ← Added: No pay/deduction for student misses (adjust policy if needed)

//         const stats = teacherStats.get(sched.teacherId) || {
//           earnings: 0,
//           deductions: 0,
//           hours: 0,
//         };

//         if (isWorked(status, state)) {
//           // ← Updated: Pass state to helper
//           let payMultiplier = 1;
//           if (status === "finished_early") payMultiplier = 0.7;
//           stats.earnings += hours * 10 * payMultiplier;
//           stats.hours += hours;
//         }

//         if (hasDeduction(status, state)) {
//           // ← Updated: Pass state to helper
//           stats.deductions += 5;
//         }

//         teacherStats.set(sched.teacherId, stats);
//       }
//     }

//     for (const [teacherId, stats] of teacherStats) {
//       const finalEarnings = Math.max(0, stats.earnings - stats.deductions);

//       const existing = await ctx.db
//         .query("payments")
//         .withIndex("by_teacher", (q) => q.eq("teacherId", teacherId))
//         .filter((q) => q.eq(q.field("month"), targetMonth)) // Use targetMonth
//         .first();

//       if (existing) {
//         await ctx.db.patch(existing._id, {
//           totalHours: stats.hours,
//           earnings: finalEarnings,
//           deductions: stats.deductions,
//         });
//       } else {
//         await ctx.db.insert("payments", {
//           teacherId,
//           month: targetMonth, // Use targetMonth
//           totalHours: stats.hours,
//           earnings: finalEarnings,
//           deductions: stats.deductions,
//         });
//       }
//     }

//     return { success: true, processedTeachers: teacherStats.size };
//   },
// });
// /**
//  * Teacher dashboard summary (today + this month)
//  */
// export const getEarningsSummary = query({
//   args: { teacherId: v.id("users") },
//   handler: async (ctx, { teacherId }) => {
//     const schedules = await ctx.db
//       .query("schedules")
//       .withIndex("by_teacher_date", (q) => q.eq("teacherId", teacherId))
//       .collect();

//     let todayEarnings = 0;
//     let monthEarnings = 0;
//     let todayHours = 0;
//     let monthHours = 0;
//     let deductions = 0;

//     const now = new Date();
//     const todayStr = format(now, "yyyy-MM-dd");
//     const thisMonthStr = format(now, "yyyy-MM");

//     for (const sched of schedules) {
//       if (!sched.date.startsWith(thisMonthStr)) continue;

//       for (const lesson of sched.lessons as Lesson[]) {
//         // ← Typed as Lesson[]
//         const lessonDateTime = new Date(`${sched.date}T${lesson.time}:00`);
//         if (lessonDateTime >= now) continue; // future lessons

//         const minutes = lesson.actualMinutes ?? lesson.duration; // ← Added: Prefer actualMinutes
//         const hours = minutes / 60;
//         const { status, state } = lesson; // ← Destructure for state
//         const isToday = sched.date === todayStr;

//         if (state === "missed_student") continue; // ← Added: No pay/deduction for student misses (adjust policy if needed)

//         if (isWorked(status, state)) {
//           // ← Updated: Pass state to helper
//           let pay = hours * 10;
//           if (status === "finished_early") pay *= 0.7;
//           if (isToday) {
//             todayEarnings += pay;
//             todayHours += hours;
//           }
//           monthEarnings += pay;
//           monthHours += hours;
//         }

//         if (hasDeduction(status, state)) {
//           // ← Updated: Pass state to helper
//           deductions += 5;
//         }
//       }
//     }

//     const netToday = Math.max(0, todayEarnings);
//     const netMonth = Math.max(0, monthEarnings - deductions);

//     return {
//       today: {
//         earnings: Number(netToday.toFixed(2)),
//         hours: Number(todayHours.toFixed(2)),
//       },
//       month: {
//         earnings: Number(netMonth.toFixed(2)),
//         hours: Number(monthHours.toFixed(2)),
//         deductions,
//       },
//     };
//   },
// });

// export const getDetailedEarnings = query({
//   args: { teacherId: v.id("users"), month: v.optional(v.string()) },
//   handler: async (
//     ctx,
//     { teacherId, month = format(new Date(), "yyyy-MM") }
//   ) => {
//     const schedules = await ctx.db
//       .query("schedules")
//       .withIndex("by_teacher_date", (q) => q.eq("teacherId", teacherId))
//       .collect();

//     const lessons = schedules
//       .flatMap((s) =>
//         s.lessons.map((l: Lesson) => ({
//           // ← Typed as Lesson
//           ...l,
//           date: s.date,
//           teacherId: s.teacherId,
//         }))
//       )
//       .filter((l) => l.date.startsWith(month));

//     return lessons.map((l) => {
//       const minutes = l.actualMinutes ?? l.duration; // ← Added: Prefer actualMinutes
//       return {
//         date: l.date,
//         time: l.time,
//         duration: minutes, // ← Updated: Show actual if available
//         status: l.status,
//         state: l.state, // ← Added: Include state for detailed view
//         earnings: isWorked(l.status, l.state) // ← Updated: Use helpers with state
//           ? (minutes / 60) * 10 * (l.status === "finished_early" ? 0.7 : 1)
//           : 0,
//         deduction: hasDeduction(l.status, l.state) ? 5 : 0, // ← Updated
//       };
//     });
//   },
// });

// // Optional: Keep if needed for PayFast failures; otherwise remove if not integrated yet
// export const logFailedPayment = mutation({
//   args: {
//     paymentId: v.string(),
//     studentId: v.id("users"),
//     status: v.string(),
//     amount: v.number(),
//     reason: v.string(),
//   },
//   handler: async (ctx, args) => {
//     // You can create a new "failedPayments" table or use existing payments table
//     await ctx.db.insert("failedPayments", {
//       ...args,
//       timestamp: Date.now(),
//       resolved: false,
//     });
//   },
// });
// import { format } from "date-fns";
// import { Id } from "./_generated/dataModel";
// import {
//   mutation,
//   query,
//   internalMutation,
//   MutationCtx,
//   QueryCtx,
// } from "./_generated/server";
// import { v } from "convex/values";

// type LessonStatus =
//   | "completed"
//   | "finished_early"
//   | "teacher_late"
//   | "technical_difficulty"
//   | "na";
// type LessonState =
//   | "scheduled"
//   | "in_progress"
//   | "completed"
//   | "missed_teacher"
//   | "missed_student";
// interface Lesson {
//   lessonId: string;
//   studentId: Id<"users">;
//   time: string;
//   duration: number;
//   bookId: Id<"books"> | null;
//   zoomLink?: string;
//   completed: boolean;
//   notes?: string;
//   startedAt?: number;
//   endedAt?: number;
//   actualMinutes?: number;
//   onTime?: boolean;
//   state: LessonState;
//   status: LessonStatus;
// }

// const isWorked = (status: LessonStatus, state: LessonState): boolean =>
//   state === "completed" &&
//   (status === "completed" ||
//     status === "finished_early" ||
//     status === "teacher_late" ||
//     status === "technical_difficulty");

// const isStatusDeduction = (status: LessonStatus): boolean =>
//   status === "teacher_late" || status === "technical_difficulty";

// const hasDeduction = (status: LessonStatus, state: LessonState): boolean =>
//   isStatusDeduction(status) ||
//   state === "missed_teacher" ||
//   (state === "missed_student" && status === "na");

// export const getByTeacher = query({
//   args: { teacherId: v.id("users") },
//   handler: async (ctx, { teacherId }) => {
//     return await ctx.db
//       .query("payments")
//       .withIndex("by_teacher", (q) => q.eq("teacherId", teacherId))
//       .collect();
//   },
// });

// // Shared calculation logic
// async function calculateMonthLogic(ctx: MutationCtx, targetMonth: string) {
//   const allSchedules = await ctx.db.query("schedules").collect();
//   const monthSchedules = allSchedules.filter((s) =>
//     s.date.startsWith(targetMonth)
//   );

//   const teacherStats = new Map<
//     Id<"users">,
//     { earnings: number; deductions: number; hours: number }
//   >();

//   for (const sched of monthSchedules) {
//     for (const lesson of sched.lessons as Lesson[]) {
//       const lessonDateTime = new Date(`${sched.date}T${lesson.time}:00`);
//       if (lessonDateTime >= new Date()) continue;

//       const minutes = lesson.actualMinutes ?? lesson.duration;
//       const hours = minutes / 60;
//       const { status, state } = lesson;

//       if (state === "missed_student") continue;

//       const stats = teacherStats.get(sched.teacherId) || {
//         earnings: 0,
//         deductions: 0,
//         hours: 0,
//       };

//       if (isWorked(status, state)) {
//         let payMultiplier = 1;
//         if (status === "finished_early") payMultiplier = 0.7;
//         stats.earnings += hours * 10 * payMultiplier;
//         stats.hours += hours;
//       }

//       if (hasDeduction(status, state)) {
//         stats.deductions += 5;
//       }

//       teacherStats.set(sched.teacherId, stats);
//     }
//   }

//   for (const [teacherId, stats] of teacherStats) {
//     const finalEarnings = Math.max(0, stats.earnings - stats.deductions);

//     const existing = await ctx.db
//       .query("payments")
//       .withIndex("by_teacher", (q) => q.eq("teacherId", teacherId))
//       .filter((q) => q.eq(q.field("month"), targetMonth))
//       .first();

//     if (existing) {
//       await ctx.db.patch(existing._id, {
//         totalHours: stats.hours,
//         earnings: finalEarnings,
//         deductions: stats.deductions,
//       });
//     } else {
//       await ctx.db.insert("payments", {
//         teacherId,
//         month: targetMonth,
//         totalHours: stats.hours,
//         earnings: finalEarnings,
//         deductions: stats.deductions,
//       });
//     }
//   }

//   return { success: true, processedTeachers: teacherStats.size };
// }

// // Admin-accessible mutation - can be called from client
// export const calculateMonth = mutation({
//   args: { month: v.string() },
//   handler: async (ctx, { month }) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) throw new Error("Unauthorized");

//     const caller = await ctx.db
//       .query("users")
//       .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
//       .first();

//     if (caller?.role !== "admin") throw new Error("Admin only");

//     return await calculateMonthLogic(ctx, month);
//   },
// });

// // Internal mutation for cron jobs - cannot be called from client
// export const calculateMonthInternal = internalMutation({
//   args: { month: v.optional(v.string()) },
//   handler: async (ctx, args) => {
//     let targetMonth = args.month;
//     if (!targetMonth) {
//       const now = new Date();
//       const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
//       targetMonth = format(lastMonth, "yyyy-MM");
//     }

//     return await calculateMonthLogic(ctx, targetMonth);
//   },
// });

// export const getEarningsSummary = query({
//   args: { teacherId: v.id("users") },
//   handler: async (ctx, { teacherId }) => {
//     const schedules = await ctx.db
//       .query("schedules")
//       .withIndex("by_teacher_date", (q) => q.eq("teacherId", teacherId))
//       .collect();

//     let todayEarnings = 0;
//     let monthEarnings = 0;
//     let todayHours = 0;
//     let monthHours = 0;
//     let deductions = 0;

//     const now = new Date();
//     const todayStr = format(now, "yyyy-MM-dd");
//     const thisMonthStr = format(now, "yyyy-MM");

//     for (const sched of schedules) {
//       if (!sched.date.startsWith(thisMonthStr)) continue;

//       for (const lesson of sched.lessons as Lesson[]) {
//         const lessonDateTime = new Date(`${sched.date}T${lesson.time}:00`);
//         if (lessonDateTime >= now) continue;

//         const minutes = lesson.actualMinutes ?? lesson.duration;
//         const hours = minutes / 60;
//         const { status, state } = lesson;
//         const isToday = sched.date === todayStr;

//         if (state === "missed_student") continue;

//         if (isWorked(status, state)) {
//           let pay = hours * 10;
//           if (status === "finished_early") pay *= 0.7;
//           if (isToday) {
//             todayEarnings += pay;
//             todayHours += hours;
//           }
//           monthEarnings += pay;
//           monthHours += hours;
//         }

//         if (hasDeduction(status, state)) {
//           deductions += 5;
//         }
//       }
//     }

//     const netToday = Math.max(0, todayEarnings);
//     const netMonth = Math.max(0, monthEarnings - deductions);

//     return {
//       today: {
//         earnings: Number(netToday.toFixed(2)),
//         hours: Number(todayHours.toFixed(2)),
//       },
//       month: {
//         earnings: Number(netMonth.toFixed(2)),
//         hours: Number(monthHours.toFixed(2)),
//         deductions,
//       },
//     };
//   },
// });

// export const getDetailedEarnings = query({
//   args: { teacherId: v.id("users"), month: v.optional(v.string()) },
//   handler: async (
//     ctx,
//     { teacherId, month = format(new Date(), "yyyy-MM") }
//   ) => {
//     const schedules = await ctx.db
//       .query("schedules")
//       .withIndex("by_teacher_date", (q) => q.eq("teacherId", teacherId))
//       .collect();

//     const lessons = schedules
//       .flatMap((s) =>
//         s.lessons.map((l: Lesson) => ({
//           ...l,
//           date: s.date,
//           teacherId: s.teacherId,
//         }))
//       )
//       .filter((l) => l.date.startsWith(month));

//     return lessons.map((l) => {
//       const minutes = l.actualMinutes ?? l.duration;
//       return {
//         date: l.date,
//         time: l.time,
//         duration: minutes,
//         status: l.status,
//         state: l.state,
//         earnings: isWorked(l.status, l.state)
//           ? (minutes / 60) * 10 * (l.status === "finished_early" ? 0.7 : 1)
//           : 0,
//         deduction: hasDeduction(l.status, l.state) ? 5 : 0,
//       };
//     });
//   },
// });

// export const logFailedPayment = mutation({
//   args: {
//     paymentId: v.string(),
//     studentId: v.id("users"),
//     status: v.string(),
//     amount: v.number(),
//     reason: v.string(),
//   },
//   handler: async (ctx, args) => {
//     await ctx.db.insert("failedPayments", {
//       ...args,
//       timestamp: Date.now(),
//       resolved: false,
//     });
//   },
// });

// convex/payments.ts - COMPLETE FILE WITH NEW PAYMENT RULES
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
}

/**
 * NEW PAYMENT RULES:
 *
 * FULL PAY ($10/hour):
 * - completed: Normal lesson completion
 * - finished_early: Student requested shorter lesson
 * - no_answer_on_time: Teacher called on time, student didn't answer
 * - teacher_late: Teacher was late (full pay but $5 deduction)
 *
 * NO PAY:
 * - technical_difficulty: Technical issues (neither side pays)
 *
 * $20 DEDUCTION:
 * - teacher_never_called: Teacher never started the lesson
 */

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
