// "use client";

// import { useQuery, useMutation } from "convex/react";
// import { api } from "../../../../../../convex/_generated/api";
// import { useRouter, useParams } from "next/navigation";
// import { useUser } from "@clerk/nextjs";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Loader2, Video, ExternalLink, User } from "lucide-react";
// import { useState, useEffect } from "react";
// import { format } from "date-fns";
// import { Id } from "../../../../../../convex/_generated/dataModel";
// import { toast } from "sonner";
// import LiveClock from "@/app/components/LiveClock";

// // shadcn/ui Select imports
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// type LessonStatus =
//   | "scheduled"
//   | "calling"
//   | "in_progress"
//   | "completed"
//   | "finished_early"
//   | "no_answer"
//   | "teacher_late"
//   | "cancelled";

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

//   const books = useQuery(api.books.getByInstrument, {
//     instrument: student?.instrument || "",
//   });

//   useEffect(() => {
//     if (lesson?.notes) setNotes(lesson.notes);
//   }, [lesson?.notes]);

//   if (!lesson || !teacher || !student) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         <Loader2 className="h-8 w-8 animate-spin" />
//       </div>
//     );
//   }

//   const isTeacher = user?.unsafeMetadata?.role === "teacher";
//   const isStudent = user?.unsafeMetadata?.role === "student";
//   const zoomLink = teacher.zoomLink || lesson.zoomLink;

//   const lessonDateTime = new Date(`${lesson.date}T${lesson.time}`);
//   const isLessonTime = Date.now() >= lessonDateTime.getTime() - 5 * 60 * 1000;

//   const handleStartMeeting = async () => {
//     if (!zoomLink) {
//       toast.error("No Zoom link configured. Please contact admin.");
//       return;
//     }

//     if (!lesson.zoomLink && teacher.zoomLink) {
//       await updateLesson({
//         scheduleId,
//         lessonId,
//         updates: { zoomLink: teacher.zoomLink },
//       });
//     }

//     window.open(zoomLink, "_blank");
//     toast.success("Opening Zoom meeting...");
//   };

//   const handleSaveNotes = async () => {
//     setIsSaving(true);
//     try {
//       await updateLesson({ scheduleId, lessonId, updates: { notes } });
//       toast.success("Notes saved successfully!");
//     } catch {
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
//     } catch {
//       toast.error("Failed to mark lesson as complete");
//     }
//   };

//   const getInitials = (name?: string, email?: string) => {
//     if (name) {
//       return name
//         .split(" ")
//         .map((n) => n[0])
//         .join("")
//         .substring(0, 2)
//         .toUpperCase();
//     }
//     return email?.substring(0, 2).toUpperCase() || "ST";
//   };

//   // ──────────────────────────────────────────────────────────────
//   // Helper Components
//   // ──────────────────────────────────────────────────────────────

//   const StatusBadge = ({ status }: { status: LessonStatus }) => {
//     const color = {
//       scheduled: "bg-gray-500",
//       calling: "bg-blue-500 animate-pulse",
//       in_progress: "bg-green-500",
//       completed: "bg-emerald-500",
//       finished_early: "bg-yellow-500",
//       no_answer: "bg-red-500",
//       teacher_late: "bg-orange-500",
//       cancelled: "bg-gray-400",
//     }[status];

//     return <div className={`h-3 w-3 rounded-full ${color}`} />;
//   };

//   const formatStatus = (status: string) =>
//     status
//       .split("_")
//       .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
//       .join(" ");

//   const AutoLateDetector = ({ onLate }: { onLate: () => void }) => {
//     useEffect(() => {
//       const startMs = lessonDateTime.getTime();
//       const lateMs = startMs + 2 * 60 * 1000;

//       if (Date.now() >= lateMs) {
//         onLate();
//         return;
//       }

//       const timer = setTimeout(onLate, lateMs - Date.now());
//       return () => clearTimeout(timer);
//     }, [lessonDateTime, onLate]);

//     const secondsLeft = Math.max(
//       0,
//       Math.ceil((lessonDateTime.getTime() + 120_000 - Date.now()) / 1000)
//     );

//     if (secondsLeft === 0) return null;

//     return (
//       <p className="text-xs text-orange-600 animate-pulse mt-1">
//         Auto-marking as late in {secondsLeft}s if not started...
//       </p>
//     );
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <Button variant="ghost" onClick={() => router.back()}>
//         ← Back to Schedule
//       </Button>
//       <LiveClock />

//       <Card className="mt-4">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Video className="h-6 w-6" />
//             Lesson Details
//           </CardTitle>
//         </CardHeader>

//         <CardContent className="space-y-6">
//           {/* Student Card */}
//           <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
//             <CardHeader>
//               <CardTitle className="text-lg flex items-center gap-2">
//                 <User className="h-5 w-5" />
//                 Student Information
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="flex items-center gap-4">
//                 <Avatar className="h-16 w-16 border-2 border-blue-300">
//                   <AvatarImage
//                     src={student.imageUrl}
//                     alt={student.name || student.email}
//                   />
//                   <AvatarFallback className="bg-blue-200 text-blue-900 text-lg font-semibold">
//                     {getInitials(student.name, student.email)}
//                   </AvatarFallback>
//                 </Avatar>
//                 <div className="flex-1">
//                   <p className="text-lg font-semibold text-blue-900">
//                     {student.name || student.email.split("@")[0]}
//                   </p>
//                   <p className="text-sm text-muted-foreground">
//                     {student.email}
//                   </p>
//                   {student.instrument && (
//                     <p className="text-sm text-purple-700 font-medium mt-1">
//                       Learning: {student.instrument}
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Lesson Info Grid */}
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

//             {/* STATUS SECTION */}
//             <div>
//               <Label className="text-muted-foreground">Status</Label>

//               {isTeacher ? (
//                 <div className="space-y-3 mt-2">
//                   <Select
//                     value={lesson.status || "scheduled"}
//                     onValueChange={(value) =>
//                       updateLesson({
//                         scheduleId,
//                         lessonId,
//                         updates: { status: value as LessonStatus },
//                       })
//                     }
//                   >
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="scheduled">
//                         <span className="flex items-center gap-2">
//                           <div className="h-2 w-2 rounded-full bg-gray-500" />
//                           Scheduled
//                         </span>
//                       </SelectItem>
//                       <SelectItem value="calling">
//                         <span className="flex items-center gap-2">
//                           <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
//                           Calling...
//                         </span>
//                       </SelectItem>
//                       <SelectItem value="in_progress">
//                         <span className="flex items-center gap-2">
//                           <div className="h-2 w-2 rounded-full bg-green-500" />
//                           In Progress
//                         </span>
//                       </SelectItem>
//                       <SelectItem value="completed">
//                         <span className="flex items-center gap-2">
//                           <div className="h-2 w-2 rounded-full bg-emerald-500" />
//                           Completed (Full Pay)
//                         </span>
//                       </SelectItem>
//                       <SelectItem value="finished_early">
//                         <span className="flex items-center gap-2">
//                           <div className="h-2 w-2 rounded-full bg-yellow-500" />
//                           Finished Early (70%)
//                         </span>
//                       </SelectItem>
//                       <SelectItem value="no_answer">
//                         <span className="flex items-center gap-2">
//                           <div className="h-2 w-2 rounded-full bg-red-500" />
//                           No Answer (-$5)
//                         </span>
//                       </SelectItem>
//                       <SelectItem value="teacher_late">
//                         <span className="flex items-center gap-2">
//                           <div className="h-2 w-2 rounded-full bg-orange-500" />
//                           Teacher Late (-$5)
//                         </span>
//                       </SelectItem>
//                       <SelectItem value="cancelled">
//                         <span className="flex items-center gap-2">
//                           <div className="h-2 w-2 rounded-full bg-gray-400" />
//                           Cancelled
//                         </span>
//                       </SelectItem>
//                     </SelectContent>
//                   </Select>

//                   {/* Auto late detection */}
//                   {lesson.status !== "teacher_late" &&
//                     lesson.status !== "completed" &&
//                     lesson.status !== "cancelled" &&
//                     isLessonTime && (
//                       <AutoLateDetector
//                         onLate={() =>
//                           updateLesson({
//                             scheduleId,
//                             lessonId,
//                             updates: { status: "teacher_late" },
//                           })
//                         }
//                       />
//                     )}

//                   {/* Status note for special cases */}
//                   {(lesson.status === "no_answer" ||
//                     lesson.status === "teacher_late" ||
//                     lesson.status === "finished_early") && (
//                     <Textarea
//                       placeholder="Optional note (e.g. connection issues, left early, etc.)"
//                       value={lesson.statusNote || ""}
//                       onChange={(e) =>
//                         updateLesson({
//                           scheduleId,
//                           lessonId,
//                           updates: { statusNote: e.target.value || undefined },
//                         })
//                       }
//                       rows={2}
//                       className="text-sm"
//                     />
//                   )}
//                 </div>
//               ) : (
//                 <div className="flex items-center gap-2 mt-2">
//                   <StatusBadge
//                     status={(lesson.status || "scheduled") as LessonStatus}
//                   />
//                   <span className="font-medium">
//                     {formatStatus(lesson.status || "scheduled")}
//                   </span>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Zoom Section */}
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
//                     toast.success("Zoom link copied!");
//                   }}
//                 >
//                   <ExternalLink className="h-4 w-4" />
//                 </Button>
//               </div>
//             ) : (
//               <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
//                 <p className="text-sm text-yellow-800">
//                   No Zoom link configured. Please contact admin.
//                 </p>
//               </div>
//             )}
//             {isTeacher && !isLessonTime && (
//               <p className="text-sm text-muted-foreground mt-2">
//                 Meeting available 5 minutes before start time
//               </p>
//             )}
//           </div>

//           {/* Teacher Notes */}
//           {isTeacher && (
//             <div className="border-t pt-4">
//               <Label htmlFor="notes">Lesson Notes</Label>
//               <p className="text-sm text-muted-foreground mb-2">
//                 Record what was covered, homework, and encouragement
//               </p>
//               <Textarea
//                 id="notes"
//                 value={notes}
//                 onChange={(e) => setNotes(e.target.value)}
//                 placeholder="What did you cover? What should the student practice?"
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

//           {/* Student sees teacher notes */}
//           {isStudent && lesson.notes && (
//             <div className="border-t pt-4">
//               <Label>Teacher&apos;s Notes</Label>
//               <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-md">
//                 <p className="whitespace-pre-wrap">{lesson.notes}</p>
//               </div>
//             </div>
//           )}

//           {/* Mark Complete Button */}
//           {isTeacher && !lesson.completed && (
//             <div className="border-t pt-4">
//               <Button
//                 variant="default"
//                 onClick={handleMarkComplete}
//                 className="w-full"
//               >
//                 Mark Lesson as Completed
//               </Button>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

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
import { motion } from "framer-motion";

// shadcn/ui Select imports
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type LessonStatus =
  | "scheduled"
  | "calling"
  | "in_progress"
  | "completed"
  | "finished_early"
  | "no_answer"
  | "teacher_late"
  | "cancelled";

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

  const books = useQuery(api.books.getByInstrument, {
    instrument: student?.instrument || "",
  });

  useEffect(() => {
    if (lesson?.notes) setNotes(lesson.notes);
  }, [lesson?.notes]);

  if (!lesson || !teacher || !student) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-black via-purple-950 to-black">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-8 w-8 text-purple-400" />
        </motion.div>
      </div>
    );
  }

  const isTeacher = user?.unsafeMetadata?.role === "teacher";
  const isStudent = user?.unsafeMetadata?.role === "student";
  const zoomLink = teacher.zoomLink || lesson.zoomLink;

  const lessonDateTime = new Date(`${lesson.date}T${lesson.time}`);
  const isLessonTime = Date.now() >= lessonDateTime.getTime() - 5 * 60 * 1000;

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
    } catch {
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
    } catch {
      toast.error("Failed to mark lesson as complete");
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
    }
    return email?.substring(0, 2).toUpperCase() || "ST";
  };

  // ──────────────────────────────────────────────────────────────
  // Helper Components
  // ──────────────────────────────────────────────────────────────

  const StatusBadge = ({ status }: { status: LessonStatus }) => {
    const color = {
      scheduled: "bg-purple-500",
      calling: "bg-blue-500 animate-pulse",
      in_progress: "bg-green-500",
      completed: "bg-emerald-500",
      finished_early: "bg-yellow-500",
      no_answer: "bg-red-500",
      teacher_late: "bg-orange-500",
      cancelled: "bg-gray-400",
    }[status];

    return <div className={`h-3 w-3 rounded-full ${color}`} />;
  };

  const formatStatus = (status: string) =>
    status
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const AutoLateDetector = ({ onLate }: { onLate: () => void }) => {
    useEffect(() => {
      const startMs = lessonDateTime.getTime();
      const lateMs = startMs + 2 * 60 * 1000;

      if (Date.now() >= lateMs) {
        onLate();
        return;
      }

      const timer = setTimeout(onLate, lateMs - Date.now());
      return () => clearTimeout(timer);
    }, [lessonDateTime, onLate]);

    const secondsLeft = Math.max(
      0,
      Math.ceil((lessonDateTime.getTime() + 120_000 - Date.now()) / 1000)
    );

    if (secondsLeft === 0) return null;

    return (
      <p className="text-xs text-orange-400 animate-pulse mt-1 font-serif">
        Auto-marking as late in {secondsLeft}s if not started...
      </p>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black">
      <div className="container mx-auto p-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-purple-300 hover:text-purple-100 hover:bg-purple-900/30"
          >
            ← Back to Schedule
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <LiveClock />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="mt-4 bg-gradient-to-br from-purple-950 to-black border-2 border-purple-800/30 shadow-[0_0_40px_rgba(168,85,247,0.2)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-purple-200 font-serif text-2xl">
                <Video className="h-7 w-7 text-purple-400" />
                Lesson Details
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Student Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-gradient-to-br from-purple-900/60 to-indigo-950/60 border-2 border-purple-700/40 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-purple-200 font-serif">
                      <User className="h-5 w-5 text-purple-400" />
                      Student Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 border-2 border-purple-500/50">
                        <AvatarImage
                          src={student.imageUrl}
                          alt={student.name || student.email}
                        />
                        <AvatarFallback className="bg-purple-800 text-purple-100 text-lg font-semibold">
                          {getInitials(student.name, student.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-lg font-semibold text-purple-100 font-serif">
                          {student.name || student.email.split("@")[0]}
                        </p>
                        <p className="text-sm text-purple-300/80">
                          {student.email}
                        </p>
                        {student.instrument && (
                          <p className="text-sm text-purple-300 font-medium mt-1 font-serif">
                            Learning: {student.instrument}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Lesson Info Grid */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <Label className="text-purple-400 font-serif">
                    Date & Time
                  </Label>
                  <p className="text-lg font-medium text-purple-200 font-serif">
                    {format(lessonDateTime, "PPP p")}
                  </p>
                </div>
                <div>
                  <Label className="text-purple-400 font-serif">Duration</Label>
                  <p className="text-lg font-medium text-purple-200 font-serif">
                    {lesson.duration} minutes
                  </p>
                </div>
                <div>
                  <Label className="text-purple-400 font-serif">
                    Instrument
                  </Label>
                  <p className="text-lg font-medium text-purple-200 font-serif">
                    {student.instrument || "Not specified"}
                  </p>
                </div>

                {/* STATUS SECTION */}
                <div>
                  <Label className="text-purple-400 font-serif">Status</Label>

                  {isTeacher ? (
                    <div className="space-y-3 mt-2">
                      <Select
                        value={lesson.status || "scheduled"}
                        onValueChange={(value) =>
                          updateLesson({
                            scheduleId,
                            lessonId,
                            updates: { status: value as LessonStatus },
                          })
                        }
                      >
                        <SelectTrigger className="bg-purple-900/20 border-purple-800/30 text-purple-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-purple-950 border-purple-800/30">
                          <SelectItem value="scheduled">
                            <span className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-purple-500" />
                              Scheduled
                            </span>
                          </SelectItem>
                          <SelectItem value="calling">
                            <span className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                              Calling...
                            </span>
                          </SelectItem>
                          <SelectItem value="in_progress">
                            <span className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-green-500" />
                              In Progress
                            </span>
                          </SelectItem>
                          <SelectItem value="completed">
                            <span className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-emerald-500" />
                              Completed (Full Pay)
                            </span>
                          </SelectItem>
                          <SelectItem value="finished_early">
                            <span className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-yellow-500" />
                              Finished Early (70%)
                            </span>
                          </SelectItem>
                          <SelectItem value="no_answer">
                            <span className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-red-500" />
                              No Answer (-$5)
                            </span>
                          </SelectItem>
                          <SelectItem value="teacher_late">
                            <span className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-orange-500" />
                              Teacher Late (-$5)
                            </span>
                          </SelectItem>
                          <SelectItem value="cancelled">
                            <span className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-gray-400" />
                              Cancelled
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Auto late detection */}
                      {lesson.status !== "teacher_late" &&
                        lesson.status !== "completed" &&
                        lesson.status !== "cancelled" &&
                        isLessonTime && (
                          <AutoLateDetector
                            onLate={() =>
                              updateLesson({
                                scheduleId,
                                lessonId,
                                updates: { status: "teacher_late" },
                              })
                            }
                          />
                        )}

                      {/* Status note for special cases */}
                      {(lesson.status === "no_answer" ||
                        lesson.status === "teacher_late" ||
                        lesson.status === "finished_early") && (
                        <Textarea
                          placeholder="Optional note (e.g. connection issues, left early, etc.)"
                          value={lesson.statusNote || ""}
                          onChange={(e) =>
                            updateLesson({
                              scheduleId,
                              lessonId,
                              updates: {
                                statusNote: e.target.value || undefined,
                              },
                            })
                          }
                          rows={2}
                          className="text-sm bg-purple-900/20 border-purple-800/30 text-purple-200 placeholder:text-purple-400/50"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-2">
                      <StatusBadge
                        status={(lesson.status || "scheduled") as LessonStatus}
                      />
                      <span className="font-medium text-purple-200 font-serif">
                        {formatStatus(lesson.status || "scheduled")}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Zoom Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="border-t border-purple-800/30 pt-4"
              >
                <Label className="text-purple-400 mb-2 block font-serif">
                  Zoom Meeting
                </Label>
                {zoomLink ? (
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={handleStartMeeting}
                      className="flex-1 bg-purple-700 hover:bg-purple-600 text-purple-50 border border-purple-600/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
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
                        toast.success("Zoom link copied!");
                      }}
                      className="border-purple-600/50 text-purple-300 hover:bg-purple-800/30"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 bg-orange-900/30 border border-orange-700/50 rounded-md">
                    <p className="text-sm text-orange-300 font-serif">
                      No Zoom link configured. Please contact admin.
                    </p>
                  </div>
                )}
                {isTeacher && !isLessonTime && (
                  <p className="text-sm text-purple-400/60 mt-2 font-serif">
                    Meeting available 5 minutes before start time
                  </p>
                )}
              </motion.div>

              {/* Teacher Notes */}
              {isTeacher && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="border-t border-purple-800/30 pt-4"
                >
                  <Label htmlFor="notes" className="text-purple-300 font-serif">
                    Lesson Notes
                  </Label>
                  <p className="text-sm text-purple-400/60 mb-2 font-serif">
                    Record what was covered, homework, and encouragement
                  </p>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="What did you cover? What should the student practice?"
                    rows={6}
                    className="mb-2 bg-purple-900/20 border-purple-800/30 text-purple-200 placeholder:text-purple-400/50 font-serif"
                  />
                  <Button
                    onClick={handleSaveNotes}
                    disabled={isSaving}
                    className="bg-purple-700 hover:bg-purple-600 text-purple-50 border border-purple-600/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Notes"
                    )}
                  </Button>
                </motion.div>
              )}

              {/* Student sees teacher notes */}
              {isStudent && lesson.notes && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="border-t border-purple-800/30 pt-4"
                >
                  <Label className="text-purple-300 font-serif">
                    Teacher&apos;s Notes
                  </Label>
                  <div className="mt-2 p-4 bg-purple-900/30 border border-purple-700/50 rounded-md">
                    <p className="whitespace-pre-wrap text-purple-200 font-serif">
                      {lesson.notes}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Mark Complete Button */}
              {isTeacher && !lesson.completed && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="border-t border-purple-800/30 pt-4"
                >
                  <Button
                    onClick={handleMarkComplete}
                    className="w-full bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500 text-purple-50 border border-purple-600/50 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                  >
                    Mark Lesson as Completed
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
