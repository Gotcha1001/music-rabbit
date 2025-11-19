// "use client";

// import { useQuery, useMutation } from "convex/react";
// import { api } from "../../../../../../convex/_generated/api";
// import { useRouter, useParams } from "next/navigation";
// import { useUser } from "@clerk/nextjs";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Loader2, Video, ExternalLink } from "lucide-react";
// import { useState } from "react";
// import { format } from "date-fns";
// import { Id } from "../../../../../../convex/_generated/dataModel";
// import { toast } from "sonner";

// export default function LessonDetail() {
//   const params = useParams();
//   const scheduleId = params.scheduleId as Id<"schedules">;
//   const lessonId = params.lessonId as string;
//   const router = useRouter();
//   const { user } = useUser();

//   const lesson = useQuery(api.schedules.getLesson, { scheduleId, lessonId });
//   const teacher = useQuery(
//     api.users.getById,
//     lesson?.teacherId ? { id: lesson.teacherId } : "skip"
//   );
//   const student = useQuery(
//     api.users.getById,
//     lesson?.studentId ? { id: lesson.studentId } : "skip"
//   );
//   const updateLesson = useMutation(api.schedules.updateLesson);

//   const [notes, setNotes] = useState(lesson?.notes || "");
//   const [isSaving, setIsSaving] = useState(false);

//   if (!lesson || !teacher || !student) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         <Loader2 className="h-8 w-8 animate-spin" />
//       </div>
//     );
//   }

//   const isTeacher = user?.unsafeMetadata?.role === "teacher";
//   const isStudent = user?.unsafeMetadata?.role === "student";

//   // Use teacher's personal Zoom link as primary, fallback to lesson-specific link
//   const zoomLink = teacher.zoomLink || lesson.zoomLink;

//   const handleStartMeeting = async () => {
//     if (!zoomLink) {
//       toast.error("No Zoom link configured. Please contact admin.");
//       return;
//     }

//     // Save the Zoom link to the lesson if not already set
//     if (!lesson.zoomLink && teacher.zoomLink) {
//       await updateLesson({
//         scheduleId,
//         lessonId,
//         updates: { zoomLink: teacher.zoomLink },
//       });
//     }

//     // Open Zoom link - this will trigger Zoom client
//     window.open(zoomLink, "_blank");
//     toast.success("Opening Zoom meeting...");
//   };

//   const handleSaveNotes = async () => {
//     setIsSaving(true);
//     try {
//       await updateLesson({ scheduleId, lessonId, updates: { notes } });
//       toast.success("Notes saved successfully!");
//     } catch (error) {
//       toast.error("Failed to save notes");
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleMarkComplete = async () => {
//     try {
//       await updateLesson({
//         scheduleId,
//         lessonId,
//         updates: { completed: true },
//       });
//       toast.success("Lesson marked as completed!");
//       router.back();
//     } catch (error) {
//       toast.error("Failed to mark lesson as complete");
//     }
//   };

//   const lessonDateTime = new Date(`${lesson.date}T${lesson.time}`);
//   const isLessonTime = Date.now() >= lessonDateTime.getTime() - 5 * 60 * 1000; // 5 min before

//   return (
//     <div className="container mx-auto p-4">
//       <Button variant="ghost" onClick={() => router.back()}>
//         ← Back to Schedule
//       </Button>

//       <Card className="mt-4">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Video className="h-6 w-6" />
//             Lesson with {student.email}
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-6">
//           {/* Lesson Info */}
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <Label className="text-muted-foreground">Date & Time</Label>
//               <p className="text-lg font-medium">
//                 {format(lessonDateTime, "PPP p")}
//               </p>
//             </div>
//             <div>
//               <Label className="text-muted-foreground">Duration</Label>
//               <p className="text-lg font-medium">{lesson.duration} minutes</p>
//             </div>
//             <div>
//               <Label className="text-muted-foreground">Instrument</Label>
//               <p className="text-lg font-medium">
//                 {student.instrument || "Not specified"}
//               </p>
//             </div>
//             <div>
//               <Label className="text-muted-foreground">Status</Label>
//               <p className="text-lg font-medium">
//                 {lesson.completed ? "✅ Completed" : "📅 Scheduled"}
//               </p>
//             </div>
//           </div>

//           {/* Zoom Meeting Section */}
//           <div className="border-t pt-4">
//             <Label className="text-muted-foreground mb-2 block">
//               Zoom Meeting
//             </Label>

//             {zoomLink ? (
//               <div className="flex items-center gap-4">
//                 <Button
//                   onClick={handleStartMeeting}
//                   className="flex-1"
//                   size="lg"
//                   disabled={!isLessonTime && isTeacher}
//                 >
//                   <Video className="mr-2 h-5 w-5" />
//                   {isTeacher ? "Start Zoom Meeting" : "Join Zoom Meeting"}
//                 </Button>

//                 <Button
//                   variant="outline"
//                   onClick={() => {
//                     navigator.clipboard.writeText(zoomLink);
//                     toast.success("Zoom link copied to clipboard!");
//                   }}
//                 >
//                   <ExternalLink className="h-4 w-4" />
//                 </Button>
//               </div>
//             ) : (
//               <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
//                 <p className="text-sm text-yellow-800">
//                   ⚠️ No Zoom link configured. Please contact admin.
//                 </p>
//               </div>
//             )}

//             {isTeacher && !isLessonTime && (
//               <p className="text-sm text-muted-foreground mt-2">
//                 Meeting will be available 5 minutes before scheduled time
//               </p>
//             )}
//           </div>

//           {/* Notes Section - Teacher Only */}
//           {isTeacher && (
//             <div className="border-t pt-4">
//               <Label htmlFor="notes">Lesson Notes</Label>
//               <p className="text-sm text-muted-foreground mb-2">
//                 Record what was covered, homework, and encouragement for the
//                 student
//               </p>
//               <Textarea
//                 id="notes"
//                 value={notes}
//                 onChange={(e) => setNotes(e.target.value)}
//                 placeholder="What did you cover in this lesson? What should the student practice?"
//                 rows={6}
//                 className="mb-2"
//               />
//               <Button onClick={handleSaveNotes} disabled={isSaving}>
//                 {isSaving ? (
//                   <>
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     Saving...
//                   </>
//                 ) : (
//                   "Save Notes"
//                 )}
//               </Button>
//             </div>
//           )}

//           {/* Student View - Show teacher's notes */}
//           {isStudent && lesson.notes && (
//             <div className="border-t pt-4">
//               <Label>Teacher&apos;s Notes</Label>
//               <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-md">
//                 <p className="whitespace-pre-wrap">{lesson.notes}</p>
//               </div>
//             </div>
//           )}

//           {/* Teacher Actions */}
//           {isTeacher && !lesson.completed && (
//             <div className="border-t pt-4">
//               <Button
//                 variant="default"
//                 onClick={handleMarkComplete}
//                 className="w-full"
//               >
//                 ✓ Mark Lesson as Completed
//               </Button>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
// app/dashboard/lesson/[scheduleId]/[lessonId]/page.tsx
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { useRouter, useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Video, ExternalLink, User } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import LiveClock from "@/app/components/LiveClock";

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

  useEffect(() => {
    if (lesson?.notes) {
      setNotes(lesson.notes);
    }
  }, [lesson?.notes]);

  if (!lesson || !teacher || !student) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const isTeacher = user?.unsafeMetadata?.role === "teacher";
  const isStudent = user?.unsafeMetadata?.role === "student";
  const zoomLink = teacher.zoomLink || lesson.zoomLink;

  const handleStartMeeting = async () => {
    if (!zoomLink) {
      toast.error("No Zoom link configured. Please contact admin.");
      return;
    }

    if (!lesson.zoomLink && teacher.zoomLink) {
      await updateLesson({
        scheduleId,
        lessonId,
        updates: { zoomLink: teacher.zoomLink },
      });
    }

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
  const isLessonTime = Date.now() >= lessonDateTime.getTime() - 5 * 60 * 1000;

  // Get student initials for avatar fallback
  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return "ST";
  };

  return (
    <div className="container mx-auto p-4">
      <Button variant="ghost" onClick={() => router.back()}>
        ← Back to Schedule
      </Button>
      <LiveClock />

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-6 w-6" />
            Lesson Details
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Student Information Card */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-blue-300">
                  <AvatarImage
                    src={student.imageUrl}
                    alt={student.name || student.email}
                  />
                  <AvatarFallback className="bg-blue-200 text-blue-900 text-lg font-semibold">
                    {getInitials(student.name, student.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-blue-900">
                    {student.name || student.email.split("@")[0]}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {student.email}
                  </p>
                  {student.instrument && (
                    <p className="text-sm text-purple-700 font-medium mt-1">
                      🎵 Learning: {student.instrument}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

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
