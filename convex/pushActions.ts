// // convex/pushActions.ts
// import { internalAction } from "./_generated/server";
// import { internal } from "./_generated/api";
// import { Id } from "./_generated/dataModel";
// import { formatInTimeZone } from "date-fns-tz";

// export const sendLessonReminders = internalAction({
//   args: {},
//   handler: async (
//     ctx,
//   ): Promise<{
//     sent: number;
//     skipped: number;
//     totalLessonsChecked: number;
//   }> => {
//     const now = Date.now();

//     // ✅ FIX 1: Look for lessons starting in the next 13-17 minutes
//     // This gives a 4-minute buffer for the cron that runs every 5 minutes
//     // So students will get notified 10-15 minutes before (depending on when cron runs)
//     const windowStart = now + 13 * 60 * 1000; // 13 minutes from now
//     const windowEnd = now + 17 * 60 * 1000; // 17 minutes from now

//     console.log("════════════════════════════════════════════════════════");
//     console.log(`🔔 CRON JOB STARTED - ${new Date(now).toISOString()}`);
//     console.log(
//       `   Window: ${new Date(windowStart).toISOString()} to ${new Date(windowEnd).toISOString()}`,
//     );
//     console.log("════════════════════════════════════════════════════════");

//     const upcomingLessons = await ctx.runQuery(
//       internal.schedules.getLessonsInTimeWindow,
//       { windowStart, windowEnd },
//     );

//     if (upcomingLessons.length === 0) {
//       console.log("✅ No upcoming lessons in the 13-17 minute window");
//       console.log("════════════════════════════════════════════════════════\n");
//       return { sent: 0, skipped: 0, totalLessonsChecked: 0 };
//     }

//     console.log(
//       `📋 Found ${upcomingLessons.length} upcoming lessons to notify`,
//     );

//     let sentCount = 0;
//     let skippedCount = 0;

//     for (const lesson of upcomingLessons) {
//       const {
//         _id: lessonId,
//         studentId,
//         teacherName,
//         zoomLink,
//         scheduledTime,
//       } = lesson;

//       if (!studentId) {
//         console.log(`⏭️  Skipping lesson ${lessonId} - no studentId`);
//         skippedCount++;
//         continue;
//       }

//       // Get student details including their timezone
//       const student = await ctx.runQuery(internal.users.getForNotification, {
//         id: studentId as Id<"users">,
//       });

//       if (!student) {
//         console.error(`❌ Student ${studentId} not found`);
//         skippedCount++;
//         continue;
//       }

//       // Get push subscription for this student
//       const subscriptionDoc = await ctx.runQuery(
//         internal.pushSubscriptions.getForUser,
//         { userId: studentId as Id<"users"> },
//       );

//       if (!subscriptionDoc) {
//         console.log(
//           `⏭️  Student ${student.name || studentId} - no push subscription`,
//         );
//         skippedCount++;
//         continue;
//       }

//       // ✅ FIX 2: Calculate minutes until lesson in student's actual experience
//       const minutesUntilLesson = Math.round(
//         (scheduledTime - now) / (60 * 1000),
//       );

//       // Format the lesson time in the STUDENT's timezone
//       const studentTimezone = student.timezone || "UTC";
//       const studentLocalTime = formatInTimeZone(
//         new Date(scheduledTime),
//         studentTimezone,
//         "HH:mm",
//       );

//       const teacher = teacherName || "your teacher";
//       const url = zoomLink || "/dashboard";

//       // ✅ FIX 3: Dynamic title showing actual minutes
//       const title = `🎵 Lesson in ${minutesUntilLesson} minutes!`;
//       const body = `Lesson with ${teacher} at ${studentLocalTime}. Get ready!`;

//       console.log(`\n📤 Sending notification to ${student.name || "student"}`);
//       console.log(`   Lesson at: ${studentLocalTime} (${studentTimezone})`);
//       console.log(`   In ${minutesUntilLesson} minutes`);
//       console.log(`   Student timezone: ${studentTimezone}`);

//       try {
//         const response = await fetch(
//           `${process.env.NEXT_PUBLIC_APP_URL}/api/push/send`,
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${process.env.CRON_SECRET}`,
//             },
//             body: JSON.stringify({
//               subscription: subscriptionDoc.subscription,
//               title,
//               body,
//               url,
//               tag: `lesson-${lessonId}`,
//             }),
//           },
//         );

//         if (response.ok) {
//           sentCount++;
//           console.log(`   ✅ SUCCESS - Notification sent`);
//         } else {
//           const responseText = await response.text();
//           console.error(`   ❌ Failed with status ${response.status}`);
//           console.error(`   Response: ${responseText}`);

//           if (response.status === 410 || response.status === 404) {
//             // Subscription expired — clean it up
//             await ctx.runMutation(internal.pushSubscriptions.removeExpired, {
//               subscriptionId: subscriptionDoc._id,
//             });
//             console.log(`   🗑️  Removed expired subscription`);
//           }
//           skippedCount++;
//         }
//       } catch (err) {
//         console.error(`   ❌ Error sending push notification:`, err);
//         skippedCount++;
//       }
//     }

//     console.log("\n════════════════════════════════════════════════════════");
//     console.log(
//       `📊 SUMMARY: ${sentCount} sent, ${skippedCount} skipped, ${upcomingLessons.length} total`,
//     );
//     console.log("════════════════════════════════════════════════════════\n");

//     return {
//       sent: sentCount,
//       skipped: skippedCount,
//       totalLessonsChecked: upcomingLessons.length,
//     };
//   },
// });

// convex/pushActions.ts
import { internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api"; // ← add api here
import { formatInTimeZone } from "date-fns-tz";

export const sendLessonReminders = internalAction({
  args: {},
  handler: async (
    ctx,
  ): Promise<{
    sent: number;
    skipped: number;
    totalLessonsChecked: number;
  }> => {
    const now = Date.now();
    const windowStart = now + 3 * 60 * 1000; // 3 min from now
    const windowEnd = now + 7 * 60 * 10000; // 7 min from now (~5 min mark)

    const upcomingLessons = await ctx.runQuery(
      internal.schedules.getLessonsInTimeWindow,
      { windowStart, windowEnd },
    );

    if (upcomingLessons.length === 0) {
      console.log("No upcoming lessons in the 5-minute window");
      return { sent: 0, skipped: 0, totalLessonsChecked: 0 };
    }

    console.log(`Found ${upcomingLessons.length} upcoming lessons`);
    let sentCount = 0;
    let skippedCount = 0;

    for (const lesson of upcomingLessons) {
      const {
        _id: lessonId,
        studentId,
        teacherName,
        zoomLink,
        scheduledTime,
      } = lesson;

      if (!studentId) {
        skippedCount++;
        continue;
      }

      // ────────────────────────────────────────────────
      // Use the EXISTING public query (from users.ts)
      const student = await ctx.runQuery(api.users.getById, { id: studentId });
      const studentTimezone = student?.timezone || "UTC";

      // We cannot access lesson.teacherId → skip teacher fetch for now
      // (you already have teacherName, which is enough for the notification)
      const teacherTimezone = "UTC"; // fallback – only used in log
      // ────────────────────────────────────────────────

      // Logging – focused on what we actually have
      console.log(`[REMINDER] Processing lesson ${lessonId}`);
      console.log(
        `  UTC scheduledTime: ${new Date(scheduledTime).toISOString()}`,
      );
      console.log(
        `  Student tz (${studentTimezone}): ${formatInTimeZone(
          new Date(scheduledTime),
          studentTimezone,
          "yyyy-MM-dd HH:mm z",
        )} (Student: ${student?.name || student?.email || studentId})`,
      );
      console.log(
        `  Sending window (UTC now ${now}): ${windowStart} – ${windowEnd}`,
      );

      // Get push subscription
      const sub = await ctx.runQuery(internal.pushSubscriptions.getForUser, {
        userId: studentId,
      });

      if (!sub || !sub.subscription) {
        console.log(`❌ No subscription for student ${studentId}`);
        skippedCount++;
        continue;
      }

      const studentLocalTime = formatInTimeZone(
        new Date(scheduledTime),
        studentTimezone,
        "HH:mm",
      );

      const title = "🎵 Your lesson starts in 5 minutes!";
      const body = `Lesson with ${teacherName} at ${studentLocalTime}. Get ready! ${
        zoomLink ? `Join: ${zoomLink}` : ""
      }`;

      // Send push
      const payload = {
        subscription: sub.subscription,
        title,
        body,
        url: "/dashboard/student",
        tag: `lesson-${lessonId}`,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/push/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.CRON_SECRET}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.error(
          `❌ Push failed for ${studentId}: ${err.error || "Unknown error"} (status: ${response.status})`,
        );

        if (response.status === 410 || response.status === 404) {
          await ctx.runMutation(internal.pushSubscriptions.removeExpired, {
            subscriptionId: sub._id,
          });
        }

        skippedCount++;
        continue;
      }

      console.log(`✅ Reminder sent to student ${studentId}`);
      sentCount++;
    }

    return {
      sent: sentCount,
      skipped: skippedCount,
      totalLessonsChecked: upcomingLessons.length,
    };
  },
});
