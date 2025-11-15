"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Video, ExternalLink } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { toast } from "sonner";

export default function LessonDetail() {
  const params = useParams();
  const scheduleId = params.scheduleId as Id<"schedules">;
  const lessonId = params.lessonId as string;
  const router = useRouter();
  const { user } = useUser();

  const lesson = useQuery(api.schedules.getLesson, { scheduleId, lessonId });
  const teacher = useQuery(
    api.users.getById,
    lesson?.teacherId ? { id: lesson.teacherId } : "skip"
  );
  const student = useQuery(
    api.users.getById,
    lesson?.studentId ? { id: lesson.studentId } : "skip"
  );
  const updateLesson = useMutation(api.schedules.updateLesson);

  const [notes, setNotes] = useState(lesson?.notes || "");
  const [isSaving, setIsSaving] = useState(false);

  if (!lesson || !teacher || !student) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const isTeacher = user?.unsafeMetadata?.role === "teacher";
  const isStudent = user?.unsafeMetadata?.role === "student";

  // Use teacher's personal Zoom link as primary, fallback to lesson-specific link
  const zoomLink = teacher.zoomLink || lesson.zoomLink;

  const handleStartMeeting = async () => {
    if (!zoomLink) {
      toast.error("No Zoom link configured. Please contact admin.");
      return;
    }

    // Save the Zoom link to the lesson if not already set
    if (!lesson.zoomLink && teacher.zoomLink) {
      await updateLesson({
        scheduleId,
        lessonId,
        updates: { zoomLink: teacher.zoomLink },
      });
    }

    // Open Zoom link - this will trigger Zoom client
    window.open(zoomLink, "_blank");
    toast.success("Opening Zoom meeting...");
  };

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      await updateLesson({ scheduleId, lessonId, updates: { notes } });
      toast.success("Notes saved successfully!");
    } catch (error) {
      toast.error("Failed to save notes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkComplete = async () => {
    try {
      await updateLesson({
        scheduleId,
        lessonId,
        updates: { completed: true },
      });
      toast.success("Lesson marked as completed!");
      router.back();
    } catch (error) {
      toast.error("Failed to mark lesson as complete");
    }
  };

  const lessonDateTime = new Date(`${lesson.date}T${lesson.time}`);
  const isLessonTime = Date.now() >= lessonDateTime.getTime() - 5 * 60 * 1000; // 5 min before

  return (
    <div className="container mx-auto p-4">
      <Button variant="ghost" onClick={() => router.back()}>
        ← Back to Schedule
      </Button>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-6 w-6" />
            Lesson with {student.email}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Lesson Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Date & Time</Label>
              <p className="text-lg font-medium">
                {format(lessonDateTime, "PPP p")}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Duration</Label>
              <p className="text-lg font-medium">{lesson.duration} minutes</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Instrument</Label>
              <p className="text-lg font-medium">
                {student.instrument || "Not specified"}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Status</Label>
              <p className="text-lg font-medium">
                {lesson.completed ? "✅ Completed" : "📅 Scheduled"}
              </p>
            </div>
          </div>

          {/* Zoom Meeting Section */}
          <div className="border-t pt-4">
            <Label className="text-muted-foreground mb-2 block">
              Zoom Meeting
            </Label>

            {zoomLink ? (
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleStartMeeting}
                  className="flex-1"
                  size="lg"
                  disabled={!isLessonTime && isTeacher}
                >
                  <Video className="mr-2 h-5 w-5" />
                  {isTeacher ? "Start Zoom Meeting" : "Join Zoom Meeting"}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(zoomLink);
                    toast.success("Zoom link copied to clipboard!");
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  ⚠️ No Zoom link configured. Please contact admin.
                </p>
              </div>
            )}

            {isTeacher && !isLessonTime && (
              <p className="text-sm text-muted-foreground mt-2">
                Meeting will be available 5 minutes before scheduled time
              </p>
            )}
          </div>

          {/* Notes Section - Teacher Only */}
          {isTeacher && (
            <div className="border-t pt-4">
              <Label htmlFor="notes">Lesson Notes</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Record what was covered, homework, and encouragement for the
                student
              </p>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What did you cover in this lesson? What should the student practice?"
                rows={6}
                className="mb-2"
              />
              <Button onClick={handleSaveNotes} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Notes"
                )}
              </Button>
            </div>
          )}

          {/* Student View - Show teacher's notes */}
          {isStudent && lesson.notes && (
            <div className="border-t pt-4">
              <Label>Teacher&apos;s Notes</Label>
              <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="whitespace-pre-wrap">{lesson.notes}</p>
              </div>
            </div>
          )}

          {/* Teacher Actions */}
          {isTeacher && !lesson.completed && (
            <div className="border-t pt-4">
              <Button
                variant="default"
                onClick={handleMarkComplete}
                className="w-full"
              >
                ✓ Mark Lesson as Completed
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
