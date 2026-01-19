// convex/availability.ts (new file)
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { formatInTimeZone, toZonedTime, fromZonedTime } from "date-fns-tz"; // Correct imports
import { getHours } from "date-fns"; // Already in deps

export const autoSetAvailability = mutation({
  args: { teacherId: v.id("users") },
  handler: async (ctx, { teacherId }) => {
    const teacher = await ctx.db.get(teacherId);
    if (!teacher || teacher.role !== "teacher" || !teacher.timezone) {
      throw new Error("Invalid teacher or no timezone set");
    }

    // Clear existing (if any)
    const existing = await ctx.db
      .query("teacherAvailability")
      .withIndex("by_teacher", (q) => q.eq("teacherId", teacherId))
      .collect();
    for (const entry of existing) {
      await ctx.db.delete(entry._id);
    }

    // Enforce Mon-Fri (1-5), 10:00-17:00 local
    for (let day = 1; day <= 5; day++) {
      // Mon-Fri
      await ctx.db.insert("teacherAvailability", {
        teacherId,
        dayOfWeek: day,
        startTime: "10:00",
        endTime: "17:00",
        isActive: true,
      });
    }
  },
});

export const getAvailableSlots = query({
  args: {
    teacherId: v.id("users"),
    startDate: v.string(), // yyyy-MM-dd
    endDate: v.string(),
    duration: v.number(),
    studentId: v.id("users"), // For optimal filtering
  },
  handler: async (
    ctx,
    { teacherId, startDate, endDate, duration, studentId },
  ) => {
    const teacher = await ctx.db.get(teacherId);
    const student = await ctx.db.get(studentId);
    if (!teacher?.timezone || !student?.timezone)
      throw new Error("Timezones required");

    // Get fixed availability (Mon-Fri only)
    const availability = await ctx.db
      .query("teacherAvailability")
      .withIndex("by_teacher", (q) => q.eq("teacherId", teacherId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Get booked lessons (assume times in UTC)
    const schedules = await ctx.db
      .query("schedules")
      .withIndex("by_teacher_date", (q) => q.eq("teacherId", teacherId))
      .collect();
    const bookedSlots = schedules
      .filter((s) => s.date >= startDate && s.date <= endDate)
      .flatMap((s) =>
        s.lessons.map((l) => ({
          date: s.date,
          time: l.time, // UTC time string
          duration: l.duration,
        })),
      );

    // Generate slots
    const slots: { date: string; time: string; isOptimal: boolean }[] = []; // Add isOptimal flag
    const current = new Date(startDate);
    const endDt = new Date(endDate); // Renamed to avoid conflict

    while (current <= endDt) {
      const dateStr = current.toISOString().split("T")[0];
      const dayOfWeek = current.getDay();

      const dayAvail = availability.find((a) => a.dayOfWeek === dayOfWeek);
      if (dayAvail) {
        // Convert local start/end to UTC minutes for this date
        const localStartStr = `${dateStr}T${dayAvail.startTime}:00`;
        const localEndStr = `${dateStr}T${dayAvail.endTime}:00`;
        const utcStart = fromZonedTime(
          new Date(localStartStr),
          teacher.timezone,
        );
        const utcEnd = fromZonedTime(new Date(localEndStr), teacher.timezone);
        const startMin = utcStart.getUTCHours() * 60 + utcStart.getUTCMinutes();
        const endMin = utcEnd.getUTCHours() * 60 + utcEnd.getUTCMinutes();

        for (let min = startMin; min <= endMin - duration; min += 30) {
          const utcTimeStr = minutesToTime(min); // UTC time

          // Check conflict (in UTC)
          const isBooked = bookedSlots.some((booked) => {
            if (booked.date !== dateStr) return false;
            const bookedStart = timeToMinutes(booked.time);
            const bookedEnd = bookedStart + booked.duration;
            const slotStart = min;
            const slotEnd = min + duration;
            return slotStart < bookedEnd && slotEnd > bookedStart;
          });

          if (!isBooked) {
            // Check optimal (9 AM-9 PM local for both)
            const utcDateTime = `${dateStr}T${utcTimeStr}:00Z`; // UTC
            const teacherLocal = toZonedTime(
              new Date(utcDateTime),
              teacher.timezone,
            );
            const studentLocal = toZonedTime(
              new Date(utcDateTime),
              student.timezone,
            );
            const teacherHour = getHours(teacherLocal);
            const studentHour = getHours(studentLocal);
            const isOptimal =
              teacherHour >= 9 &&
              teacherHour <= 21 &&
              studentHour >= 9 &&
              studentHour <= 21;

            slots.push({ date: dateStr, time: utcTimeStr, isOptimal });
          }
        }
      }
      current.setDate(current.getDate() + 1);
    }
    return slots;
  },
});

// Helper functions
function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}
