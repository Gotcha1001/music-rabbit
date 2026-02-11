// import { cronJobs } from "convex/server";
// import { internal } from "./_generated/api";

// const crons = cronJobs();

// // For missed lessons (every 5 min)
// crons.interval(
//   "check missed lessons",
//   { minutes: 5 },
//   internal.schedules.checkMissedLessons, // ← Fix: Use schedules, not payments
//   {} // No args needed
// );

// // For monthly payments (first of month)
// crons.monthly(
//   "calculate monthly payments",
//   "calculatePayments",
//   { dayOfMonth: 1 },
//   internal.payments.calculateMonth, // Add if you create internal.payments.calculateMonth
//   { month: "" } // Dynamic month arg
// );

// import { cronJobs } from "convex/server";
// import { internal } from "./_generated/api";

// const crons = cronJobs();

// // For missed lessons (every 5 min)
// crons.interval(
//   "check missed lessons",
//   { minutes: 5 },
//   internal.schedules.checkMissedLessons, // ← Fix: Use schedules, not payments
//   {}, // No args needed
// );

// crons.monthly(
//   "calculate monthly payments",
//   { day: 1, hourUTC: 0, minuteUTC: 0 },
//   internal.payments.calculateMonthInternal,
//   {}, // No arg — compute inside
// );

// crons.monthly(
//   "update monthly teacher salaries",
//   { day: 1, hourUTC: 0, minuteUTC: 0 }, // 1st of month at midnight UTC
//   internal.payments.calculateMonthlySalaries,
// );

// // Reminder to process pending payments on the 5th of every month
// crons.monthly(
//   "remind pending salary payments",
//   { day: 5, hourUTC: 9, minuteUTC: 0 }, // 5th of month at 9 AM UTC
//   internal.payments.sendPendingPaymentReminders,
// );

// export default crons;

import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// For missed lessons (every 5 min)
crons.interval(
  "check missed lessons",
  { minutes: 5 },
  internal.schedules.checkMissedLessons,
  {}, // No args needed
);

// Monthly salary & payment calculations
crons.monthly(
  "calculate monthly payments",
  { day: 1, hourUTC: 0, minuteUTC: 0 },
  internal.payments.calculateMonthInternal,
  {},
);

crons.monthly(
  "update monthly teacher salaries",
  { day: 1, hourUTC: 0, minuteUTC: 0 },
  internal.payments.calculateMonthlySalaries,
);

// Reminder to process pending payments on the 5th of every month
crons.monthly(
  "remind pending salary payments",
  { day: 5, hourUTC: 9, minuteUTC: 0 },
  internal.payments.sendPendingPaymentReminders,
);

// ────────────────────────────────────────────────────────────────
// NEW: Lesson reminder push notifications (runs every 5 minutes)
// This will check for lessons starting in the next ~30 minutes
// and send web push notifications to students who have enabled them
// ────────────────────────────────────────────────────────────────
crons.interval(
  "send lesson reminders",
  { minutes: 5 },
  internal.pushActions.sendLessonReminders,
  {}, // No arguments — all logic inside the action
);

export default crons;
