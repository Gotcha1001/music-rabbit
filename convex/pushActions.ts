// convex/pushActions.ts
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

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
    const windowStart = now + 8 * 60 * 1000; // 8 min from now
    const windowEnd = now + 12 * 60 * 1000; // 12 min from now (catches ~10 min mark)

    const upcomingLessons = await ctx.runQuery(
      internal.schedules.getLessonsInTimeWindow,
      { windowStart, windowEnd },
    );

    if (upcomingLessons.length === 0) {
      console.log("No upcoming lessons in the 10-minute window");
      return { sent: 0, skipped: 0, totalLessonsChecked: 0 };
    }

    console.log(`Found ${upcomingLessons.length} upcoming lessons`);

    let sentCount = 0;
    let skippedCount = 0;

    for (const lesson of upcomingLessons) {
      // getLessonsInTimeWindow returns: _id, studentId, teacherName, time, zoomLink
      const { _id: lessonId, studentId, time, teacherName, zoomLink } = lesson;

      if (!studentId) {
        skippedCount++;
        continue;
      }

      // getForUser must be internalQuery — see pushSubscriptions.ts fix below
      const subscriptionDoc = await ctx.runQuery(
        internal.pushSubscriptions.getForUser,
        { userId: studentId as Id<"users"> },
      );

      if (!subscriptionDoc) {
        skippedCount++;
        continue;
      }

      const teacher = teacherName || "your teacher";
      const url = zoomLink || "/dashboard";
      const title = "🎵 Your lesson starts in 10 minutes!";
      const body = `Lesson with ${teacher} at ${time}. Get ready!`;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/push/send`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.CRON_SECRET}`,
            },
            body: JSON.stringify({
              subscription: subscriptionDoc.subscription,
              title,
              body,
              url,
              tag: `lesson-${lessonId}`,
            }),
          },
        );

        if (response.ok) {
          sentCount++;
          console.log(`Reminder sent to student ${studentId}`);
        } else {
          if (response.status === 410 || response.status === 404) {
            // Subscription expired — clean it up
            await ctx.runMutation(internal.pushSubscriptions.removeExpired, {
              subscriptionId: subscriptionDoc._id,
            });
            console.log(
              `Removed expired subscription for student ${studentId}`,
            );
          } else {
            console.error(`Push failed with status ${response.status}`);
          }
          skippedCount++;
        }
      } catch (err) {
        console.error("Error sending push notification:", err);
        skippedCount++;
      }
    }

    return {
      sent: sentCount,
      skipped: skippedCount,
      totalLessonsChecked: upcomingLessons.length,
    };
  },
});
