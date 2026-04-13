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
// import {
//   Loader2,
//   Video,
//   Clock,
//   Globe,
//   BookOpen,
//   AlertCircle,
//   PlayCircle,
//   StopCircle,
//   MessageSquare,
//   Copy,
//   Star,
// } from "lucide-react";
// import { useState, useEffect } from "react";
// import { format } from "date-fns";
// import { Id } from "../../../../../../convex/_generated/dataModel";
// import { toast } from "sonner";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { formatTimeInTimezone, getTimezoneAbbr } from "@/lib/timezoneUtils";
// import { motion } from "framer-motion";
// import { BookSelector } from "@/app/components/BookSelector";
// import confetti from "canvas-confetti";
// import { TutorMemoSection } from "@/app/components/TutorMemoSection";
// import { CancelLessonDialog } from "@/app/components/CancelLessonDialog";
// import { RescheduleDialog } from "@/app/components/RescheduleDialog";
// import { ThankYouButton } from "@/app/components/ThankYouButton";
// import { PostLessonFeedbackDialog } from "@/app/components/PostLessonFeedbackDialog";

// /* ─────────────────────────────────────────────────────────────
//    !important overrides — light mode resets everything to white.
//    Dark mode is left completely untouched (all dark styles live
//    in the JSX classNames as before).
// ───────────────────────────────────────────────────────────── */
// const LESSON_STYLES = `
//   /* Page background */
//   .lesson-page                    { background: #ffffff !important; }

//   /* Clock / timezone widget */
//   .lesson-clock-widget            { background: #ffffff !important; border-color: hsl(var(--border)) !important; box-shadow: 0 2px 12px rgba(0,0,0,0.08) !important; }
//   .lesson-clock-label             { color: hsl(var(--muted-foreground)) !important; }
//   .lesson-clock-time              { color: hsl(var(--foreground)) !important; }
//   .lesson-clock-tz                { color: hsl(var(--primary)) !important; }
//   .lesson-clock-divider           { background: hsl(var(--border)) !important; }

//   /* Main card */
//   .lesson-main-card               { background: #ffffff !important; border-color: hsl(var(--border)) !important; }
//   .lesson-card-title              { color: hsl(var(--foreground)) !important; }
//   .lesson-time-pill               { background: hsl(var(--primary)) !important; color: #ffffff !important; box-shadow: none !important; }

//   /* Inner content sections */
//   .lesson-section-bg              { background: hsl(var(--muted)) !important; border-color: hsl(var(--border)) !important; }
//   .lesson-text-main               { color: hsl(var(--foreground)) !important; }
//   .lesson-text-sub                { color: hsl(var(--muted-foreground)) !important; }
//   .lesson-text-label              { color: hsl(var(--foreground)) !important; }
//   .lesson-border-divider          { border-color: hsl(var(--border)) !important; }

//   /* Textarea + inputs */
//   .lesson-textarea                { background: hsl(var(--muted)) !important; border-color: hsl(var(--border)) !important; color: hsl(var(--foreground)) !important; }

//   /* Book section */
//   .lesson-book-card               { background: hsl(var(--muted)) !important; border-color: hsl(var(--border)) !important; }
//   .lesson-book-empty              { background: hsl(var(--muted)/0.5) !important; border-color: hsl(var(--border)) !important; }
//   .lesson-book-icon               { color: hsl(var(--primary)) !important; }
//   .lesson-book-text               { color: hsl(var(--foreground)) !important; }
//   .lesson-book-sub                { color: hsl(var(--muted-foreground)) !important; }

//   /* Status pill */
//   .lesson-status-pill             { background: hsl(var(--muted)) !important; }

//   /* Back button */
//   .lesson-back-btn                { color: hsl(var(--primary)) !important; }

//   /* ── Dark mode: restore original styles ── */
//   .dark .lesson-page              { background: linear-gradient(to bottom, #000000, #1a0030, #000000) !important; }
//   .dark .lesson-clock-widget      { background: radial-gradient(circle at top left, #1a001f, #000000) !important; border-color: rgba(109,40,217,0.4) !important; box-shadow: 0 4px 24px rgba(139,92,246,0.15) !important; }
//   .dark .lesson-clock-label       { color: rgba(196,181,253,0.7) !important; }
//   .dark .lesson-clock-time        { color: #ddd6fe !important; }
//   .dark .lesson-clock-tz          { color: rgba(167,139,250,0.8) !important; }
//   .dark .lesson-clock-divider     { background: rgba(109,40,217,0.6) !important; }
//   .dark .lesson-main-card         { background: linear-gradient(to bottom right, hsl(270 90% 5%), #000000) !important; border-color: rgba(109,40,217,0.3) !important; }
//   .dark .lesson-card-title        { color: #ddd6fe !important; }
//   .dark .lesson-time-pill         { background: rgba(76,29,149,0.5) !important; color: #ddd6fe !important; box-shadow: 0 4px 16px rgba(139,92,246,0.3) !important; }
//   .dark .lesson-section-bg        { background: rgba(76,29,149,0.3) !important; border-color: rgba(109,40,217,0.3) !important; }
//   .dark .lesson-text-main         { color: #ede9fe !important; }
//   .dark .lesson-text-sub          { color: #c4b5fd !important; }
//   .dark .lesson-text-label        { color: #ffffff !important; }
//   .dark .lesson-border-divider    { border-color: rgba(109,40,217,0.3) !important; }
//   .dark .lesson-textarea          { background: rgba(76,29,149,0.2) !important; border-color: rgba(109,40,217,0.5) !important; color: #ddd6fe !important; }
//   .dark .lesson-book-card         { background: rgba(76,29,149,0.3) !important; border-color: rgba(109,40,217,0.5) !important; }
//   .dark .lesson-book-empty        { background: rgba(76,29,149,0.2) !important; border-color: rgba(109,40,217,0.5) !important; }
//   .dark .lesson-book-icon         { color: #a78bfa !important; }
//   .dark .lesson-book-text         { color: #ddd6fe !important; }
//   .dark .lesson-book-sub          { color: #a78bfa !important; }
//   .dark .lesson-status-pill       { background: rgba(76,29,149,0.3) !important; }
//   .dark .lesson-back-btn          { color: #c4b5fd !important; }
// `;

// type NewLessonStatus =
//   | "completed"
//   | "finished_early"
//   | "no_answer_on_time"
//   | "teacher_late"
//   | "technical_difficulty"
//   | "teacher_never_called";

// type EndLessonStatus = Exclude<
//   NewLessonStatus,
//   "no_answer_on_time" | "teacher_never_called"
// >;

// const statusLabels: Record<NewLessonStatus, string> = {
//   completed: "Completed (Full Pay)",
//   finished_early: "Finished Early (Full Pay)",
//   no_answer_on_time: "No Answer (Full Pay)",
//   teacher_late: "I Was Late (Full Pay - $5)",
//   technical_difficulty: "Technical Issue (No Pay)",
//   teacher_never_called: "Teacher Never Called ($20 Deduction)",
// };

// const statusColors: Record<NewLessonStatus, string> = {
//   completed: "bg-emerald-500",
//   finished_early: "bg-yellow-500",
//   no_answer_on_time: "bg-red-500",
//   teacher_late: "bg-orange-500",
//   technical_difficulty: "bg-purple-500",
//   teacher_never_called: "bg-red-700",
// };

// const stateIcons = {
//   scheduled: <Clock className="h-5 w-5 text-blue-400" />,
//   in_progress: <PlayCircle className="h-5 w-5 text-yellow-400" />,
//   completed: <StopCircle className="h-5 w-5 text-emerald-400" />,
//   missed_teacher: <AlertCircle className="h-5 w-5 text-red-400" />,
//   missed_student: <AlertCircle className="h-5 w-5 text-orange-400" />,
// };

// const stateLabels = {
//   scheduled: "Scheduled",
//   in_progress: "In Progress",
//   completed: "Completed",
//   missed_teacher: "Missed by Teacher",
//   missed_student: "Missed by Student",
// };

// export default function LessonDetail() {
//   const params = useParams();
//   const scheduleId = params.scheduleId as Id<"schedules">;
//   const lessonId = params.lessonId as string;
//   const router = useRouter();
//   const { user } = useUser();

//   const lesson = useQuery(api.schedules.getLessonWithBook, {
//     scheduleId,
//     lessonId,
//   });
//   const teacher = useQuery(
//     api.users.getById,
//     lesson?.teacherId ? { id: lesson.teacherId } : "skip",
//   );
//   const student = useQuery(
//     api.users.getById,
//     lesson?.studentId ? { id: lesson.studentId } : "skip",
//   );
//   const existingRating = useQuery(api.lessonRatings.getForLesson, {
//     scheduleId,
//     lessonId,
//   });
//   const lessonMemo = useQuery(api.tutorsMemos.getByLesson, {
//     scheduleId,
//     lessonId,
//   });

//   const submitRating = useMutation(api.lessonRatings.submit);
//   const updateLesson = useMutation(api.schedules.updateLesson);
//   const startLessonMutation = useMutation(api.schedules.startLesson);
//   const endLessonMutation = useMutation(api.schedules.endLesson);
//   const markMissedMutation = useMutation(api.schedules.markMissed);
//   const createLessonMemo = useMutation(api.tutorsMemos.createLessonMemo);

//   const [notes, setNotes] = useState("");
//   const [isSaving, setIsSaving] = useState(false);
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const [selectedStatus, setSelectedStatus] = useState<
//     EndLessonStatus | undefined
//   >(undefined);
//   const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);

//   const studentInfo = useQuery(
//     api.tutorsMemos.getGeneralInfoForStudent,
//     lesson?.studentId ? { studentId: lesson.studentId } : "skip",
//   );
//   const updateGeneralInfo = useMutation(
//     api.tutorsMemos.updateGeneralInfoForStudent,
//   );
//   const [studentContent, setStudentContent] = useState("");
//   const [studentInfoSaving, setStudentInfoSaving] = useState(false);

//   const isTeacher = user?.unsafeMetadata?.role === "teacher";
//   const isStudent = user?.unsafeMetadata?.role === "student";
//   const zoomLink = teacher?.zoomLink || lesson?.zoomLink;

//   const lessonDateTime = lesson
//     ? new Date(`${lesson.date}T${lesson.time}:00`)
//     : null;
//   const isLessonTimeOrLater = lessonDateTime
//     ? Date.now() >= lessonDateTime.getTime()
//     : false;

//   useEffect(() => {
//     const timer = setInterval(() => setCurrentTime(new Date()), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   useEffect(() => {
//     if (lesson?.notes) setNotes(lesson.notes || "");
//   }, [lesson?.notes]);
//   useEffect(() => {
//     setStudentContent(studentInfo?.content || "");
//   }, [studentInfo]);

//   if (!lesson || !teacher || !student) {
//     return (
//       <div className="lesson-page flex min-h-screen items-center justify-center">
//         <style>{LESSON_STYLES}</style>
//         <motion.div
//           animate={{ rotate: 360 }}
//           transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//         >
//           <Loader2 className="h-8 w-8 text-primary dark:text-purple-400" />
//         </motion.div>
//       </div>
//     );
//   }

//   function calculateEndTime(startTime: string, duration: number): string {
//     const [hours, minutes] = startTime.split(":").map(Number);
//     const startDate = new Date(0, 0, 0, hours, minutes);
//     startDate.setMinutes(startDate.getMinutes() + duration);
//     return `${startDate.getHours().toString().padStart(2, "0")}:${startDate.getMinutes().toString().padStart(2, "0")}`;
//   }

//   const endTime = calculateEndTime(lesson.time, lesson.duration);

//   const handleStart = async () => {
//     if (lesson.state !== "scheduled") {
//       toast.info(
//         `Lesson is already ${stateLabels[lesson.state].toLowerCase()}`,
//         { description: "You can only start scheduled lessons." },
//       );
//       return;
//     }
//     if (!isLessonTimeOrLater) {
//       toast.warning("Too early!", {
//         description:
//           "You can only start the lesson at or after the scheduled time.",
//       });
//       return;
//     }
//     try {
//       await startLessonMutation({ scheduleId, lessonId });
//       toast.success("Lesson started & Zoom opened!");
//       handleOpenZoom();
//     } catch (err: unknown) {
//       toast.error("Failed to start lesson", {
//         description:
//           err instanceof Error ? err.message : "Please refresh and try again.",
//       });
//     }
//   };

//   const handleEnd = async () => {
//     try {
//       const result = await endLessonMutation({
//         scheduleId,
//         lessonId,
//         status: selectedStatus,
//       });
//       if (result.status === "completed") {
//         confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
//         toast.success("Fully completed! Well done!", {
//           description: "Lesson ended on time. Great job!",
//           duration: 5000,
//         });
//       } else {
//         toast.success("Lesson ended!", {
//           description: statusLabels[result.status],
//         });
//       }
//       if (!lessonMemo) {
//         try {
//           await createLessonMemo({
//             scheduleId,
//             lessonId,
//             studentId: lesson.studentId,
//             teacherId: lesson.teacherId as Id<"users">,
//             teacherName: teacher.name || teacher.email.split("@")[0],
//             status: "OK",
//           });
//         } catch (err) {
//           console.warn("Could not create lesson memo", err);
//         }
//       }
//       setIsFeedbackDialogOpen(true);
//     } catch (err) {
//       toast.error("Failed to end lesson");
//     }
//   };

//   const handleMarkMissed = async (missedBy: "teacher" | "student") => {
//     try {
//       await markMissedMutation({ scheduleId, lessonId, missedBy });
//       toast.success(`Marked as missed by ${missedBy}`);
//     } catch (err) {
//       toast.error("Failed to mark missed");
//     }
//   };

//   const handleOpenZoom = async () => {
//     if (!zoomLink) {
//       toast.error("No Zoom link configured.");
//       return;
//     }
//     if (isTeacher && !lesson.zoomLink && teacher.zoomLink) {
//       try {
//         await updateLesson({
//           scheduleId,
//           lessonId,
//           updates: { zoomLink: teacher.zoomLink },
//         });
//       } catch (err) {
//         console.warn("Could not save Zoom link", err);
//       }
//     }
//     window.open(zoomLink, "_blank", "noopener,noreferrer");
//   };

//   const handleSaveNotes = async () => {
//     if (!isTeacher || notes === lesson.notes) return;
//     setIsSaving(true);
//     try {
//       await updateLesson({ scheduleId, lessonId, updates: { notes } });
//       toast.success("Notes saved!");
//     } catch {
//       toast.error("Failed to save notes");
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleSaveStudentInfo = async () => {
//     if (!isTeacher || studentContent === (studentInfo?.content || "")) return;
//     setStudentInfoSaving(true);
//     try {
//       await updateGeneralInfo({
//         studentId: lesson.studentId,
//         content: studentContent,
//       });
//       toast.success("Student information saved!");
//     } catch {
//       toast.error("Failed to save student information");
//     } finally {
//       setStudentInfoSaving(false);
//     }
//   };

//   const handleOpenFeedbackDialog = async () => {
//     if (!lessonMemo) {
//       await createLessonMemo({
//         scheduleId,
//         lessonId,
//         studentId: lesson.studentId,
//         status: "OK",
//         teacherId: lesson.teacherId as Id<"users">,
//         teacherName: teacher.name || teacher.email.split("@")[0],
//       });
//     }
//     setIsFeedbackDialogOpen(true);
//   };

//   const getInitials = (name?: string, email?: string) =>
//     name
//       ? name
//           .split(" ")
//           .map((n) => n[0])
//           .join("")
//           .substring(0, 2)
//           .toUpperCase()
//       : email?.substring(0, 2).toUpperCase() || "ST";

//   const DualTimezoneDisplay = () => {
//     const teacherTz = teacher?.timezone || "UTC";
//     const studentTz = student?.timezone || "UTC";
//     return (
//       <div className="lesson-clock-widget flex flex-col gap-4 sm:gap-6 px-4 sm:px-6 py-4 rounded-xl border backdrop-blur-sm">
//         <div className="flex items-center gap-3">
//           <Clock className="h-5 w-5 sm:h-6 sm:w-6 lesson-clock-tz shrink-0" />
//           <div>
//             <span className="lesson-clock-label text-xs">Your Time</span>
//             <div className="flex items-center gap-2">
//               <span className="lesson-clock-time text-lg sm:text-xl font-bold font-mono">
//                 {formatTimeInTimezone(currentTime, teacherTz, "HH:mm:ss")}
//               </span>
//               <span className="lesson-clock-tz text-xs font-mono">
//                 {getTimezoneAbbr(teacherTz)}
//               </span>
//             </div>
//           </div>
//         </div>
//         <div className="lesson-clock-divider h-px" />
//         <div className="flex items-center gap-3">
//           <Globe className="h-5 w-5 sm:h-6 sm:w-6 lesson-clock-tz shrink-0" />
//           <div>
//             <span className="lesson-clock-label text-xs">Student Time</span>
//             <div className="flex items-center gap-2">
//               <span className="lesson-clock-time text-lg sm:text-xl font-bold font-mono">
//                 {formatTimeInTimezone(currentTime, studentTz, "HH:mm:ss")}
//               </span>
//               <span className="lesson-clock-tz text-xs font-mono">
//                 {getTimezoneAbbr(studentTz)}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const currentStatus = (lesson.status ||
//     "no_answer_on_time") as NewLessonStatus;
//   const lessonDateTimeFormatted = lessonDateTime
//     ? formatTimeInTimezone(lessonDateTime, student.timezone || "UTC")
//     : "";

//   return (
//     <div className="lesson-page min-h-screen relative">
//       <style>{LESSON_STYLES}</style>
//       <div className="container mx-auto p-4 sm:p-6 max-w-4xl">
//         <Button
//           variant="ghost"
//           onClick={() => router.back()}
//           className="lesson-back-btn mb-4"
//         >
//           ← Back
//         </Button>

//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//         >
//           <DualTimezoneDisplay />
//         </motion.div>

//         {/* ── Main card ── */}
//         <div className="lesson-main-card mt-6 rounded-xl border-2 overflow-hidden shadow-lg">
//           {/* Card header */}
//           <div className="p-4 sm:p-6 border-b lesson-border-divider">
//             <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
//               <h2 className="lesson-card-title flex items-center gap-3 text-xl sm:text-2xl font-bold font-serif">
//                 <Video className="h-6 w-6 sm:h-7 sm:w-7 text-primary dark:text-purple-400 shrink-0" />
//                 Lesson with {student.name || student.email.split("@")[0]}
//               </h2>
//               <div className="flex gap-2 sm:gap-4 font-mono text-sm sm:text-base flex-wrap">
//                 <span className="lesson-time-pill px-3 py-1 rounded-full font-semibold animate-pulse">
//                   Start: {lesson.time}
//                 </span>
//                 <span className="lesson-time-pill px-3 py-1 rounded-full font-semibold animate-pulse">
//                   End: {endTime}
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Card body */}
//           <div className="p-4 sm:p-6 space-y-6">
//             {/* Student info row */}
//             <div className="flex items-center gap-4">
//               <Avatar className="h-14 w-14 sm:h-16 sm:w-16 border-2 border-primary/40 dark:border-purple-500 shrink-0">
//                 <AvatarImage src={student.imageUrl} />
//                 <AvatarFallback className="bg-primary dark:bg-purple-800 text-white">
//                   {getInitials(student.name, student.email)}
//                 </AvatarFallback>
//               </Avatar>
//               <div>
//                 <p className="lesson-text-main text-lg sm:text-xl font-semibold">
//                   {student.name || "Student"}
//                 </p>
//                 <p className="lesson-text-sub">
//                   {student.instrument && `Learning ${student.instrument}`}
//                 </p>
//               </div>
//             </div>

//             {/* Student info section */}
//             <div className="space-y-3 pt-4 border-t lesson-border-divider">
//               <Label className="lesson-text-label font-semibold">
//                 Student Information (By Teachers)
//               </Label>
//               {isTeacher ? (
//                 <>
//                   <Textarea
//                     value={studentContent}
//                     onChange={(e) => setStudentContent(e.target.value)}
//                     rows={5}
//                     className="lesson-textarea"
//                     placeholder="Write some basic knowledge of the student, e.g., preferred name, what they're interested in and any family background, etc. This is visible to all teachers."
//                   />
//                   <Button
//                     onClick={handleSaveStudentInfo}
//                     disabled={
//                       studentInfoSaving ||
//                       studentContent === (studentInfo?.content || "")
//                     }
//                     className="bg-primary hover:bg-primary/90 text-primary-foreground"
//                   >
//                     {studentInfoSaving ? "Saving..." : "Save Student Info"}
//                   </Button>
//                 </>
//               ) : (
//                 studentInfo?.content && (
//                   <div className="lesson-section-bg mt-2 p-4 rounded-lg border">
//                     <p className="lesson-text-main whitespace-pre-wrap">
//                       {studentInfo.content}
//                     </p>
//                   </div>
//                 )
//               )}
//             </div>

//             {/* Lesson info grid */}
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <Label className="lesson-text-sub text-xs uppercase tracking-wide">
//                   Date & Time
//                 </Label>
//                 <p className="lesson-text-main font-semibold mt-1">
//                   {lessonDateTime ? format(lessonDateTime, "PPP p") : "N/A"}
//                 </p>
//               </div>
//               <div>
//                 <Label className="lesson-text-sub text-xs uppercase tracking-wide">
//                   Duration
//                 </Label>
//                 <p className="lesson-text-main font-semibold mt-1">
//                   {lesson.duration} min
//                 </p>
//               </div>
//             </div>

//             {/* State pill */}
//             <div className="lesson-status-pill flex items-center gap-3 p-4 rounded-lg">
//               {stateIcons[lesson.state]}
//               <span className="lesson-text-main text-lg font-medium">
//                 Status: {stateLabels[lesson.state]}
//               </span>
//             </div>

//             {/* WhatsApp (teacher only) */}
//             {isTeacher && (
//               <div className="mt-5 p-5 bg-gradient-to-r from-green-950/40 to-emerald-950/30 rounded-2xl border border-green-800/60 shadow-md shadow-green-900/20 hover:shadow-lg hover:shadow-green-900/30 transition-shadow duration-200">
//                 {student?.countryCode && student?.phoneNumber ? (
//                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//                     <div className="flex items-start sm:items-center gap-4">
//                       <div className="bg-green-700/30 p-3.5 rounded-full flex-shrink-0">
//                         <MessageSquare className="h-6 w-6 text-green-400" />
//                       </div>
//                       <div>
//                         <div className="text-xs text-green-400/90 uppercase tracking-wide font-medium mb-0.5">
//                           Student WhatsApp (emergency contact only)
//                         </div>
//                         <div className="text-lg font-semibold text-green-100">
//                           {student.countryCode} {student.phoneNumber}
//                         </div>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-2 flex-shrink-0">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         className="border-green-600/60 text-green-300 hover:bg-green-950/50 hover:text-green-200"
//                         asChild
//                       >
//                         <a
//                           href={`https://wa.me/${student.countryCode.replace("+", "")}${student.phoneNumber}`}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                         >
//                           Message
//                         </a>
//                       </Button>
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         className="text-green-400 hover:text-green-300 hover:bg-green-950/40"
//                         onClick={() => {
//                           navigator.clipboard.writeText(
//                             `${student.countryCode}${student.phoneNumber}`,
//                           );
//                           toast.success("Copied to clipboard");
//                         }}
//                       >
//                         <Copy className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="flex items-center gap-3 text-amber-300/90 text-sm">
//                     <AlertCircle className="h-5 w-5 flex-shrink-0" />
//                     <span>
//                       This student has not provided a WhatsApp number yet.
//                     </span>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Teacher controls */}
//             {isTeacher && (
//               <div className="space-y-4">
//                 {lesson.state === "in_progress" && (
//                   <>
//                     <Button
//                       onClick={handleEnd}
//                       className="w-full bg-red-600 hover:bg-red-700 text-white"
//                     >
//                       End Lesson
//                     </Button>
//                     <Select
//                       value={selectedStatus ?? ""}
//                       onValueChange={(v) =>
//                         setSelectedStatus(v as EndLessonStatus)
//                       }
//                     >
//                       <SelectTrigger className="lesson-textarea">
//                         <SelectValue placeholder="Optional: Override outcome" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {Object.entries(statusLabels)
//                           .filter(
//                             ([v]) =>
//                               v !== "no_answer_on_time" &&
//                               v !== "completed" &&
//                               v !== "teacher_never_called",
//                           )
//                           .map(([value, label]) => (
//                             <SelectItem key={value} value={value}>
//                               {label}
//                             </SelectItem>
//                           ))}
//                       </SelectContent>
//                     </Select>
//                   </>
//                 )}

//                 {lesson.state === "completed" && (
//                   <Button
//                     onClick={handleOpenFeedbackDialog}
//                     className="w-full bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-purple-600 dark:hover:bg-purple-700"
//                   >
//                     <MessageSquare className="mr-2 h-4 w-4" />
//                     {lessonMemo?.feedbackCompleted
//                       ? "Update Feedback"
//                       : "Give Feedback"}
//                   </Button>
//                 )}

//                 {["scheduled", "in_progress"].includes(lesson.state) && (
//                   <div className="flex gap-2">
//                     <Button
//                       onClick={() => handleMarkMissed("teacher")}
//                       variant="destructive"
//                       className="flex-1"
//                     >
//                       Mark Missed (Me)
//                     </Button>
//                     <Button
//                       onClick={() => handleMarkMissed("student")}
//                       variant="outline"
//                       className="flex-1 border-border text-foreground hover:bg-muted dark:border-purple-600/50 dark:text-purple-300 dark:hover:bg-purple-800/30"
//                     >
//                       Mark Missed (Student)
//                     </Button>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Cancel + Reschedule */}
//             {lesson.state === "scheduled" && (
//               <div className="flex gap-4">
//                 <CancelLessonDialog
//                   scheduleId={scheduleId}
//                   lessonId={lessonId}
//                   date={lesson.date}
//                   time={lesson.time}
//                   duration={lesson.duration}
//                   isStudent={isStudent}
//                 />
//                 {isTeacher && (
//                   <RescheduleDialog
//                     scheduleId={scheduleId}
//                     lessonId={lessonId}
//                     teacherId={lesson.teacherId}
//                     duration={lesson.duration}
//                   />
//                 )}
//               </div>
//             )}

//             {/* Book section */}
//             <div className="space-y-4 pt-4 border-t lesson-border-divider">
//               <Label className="lesson-text-label text-lg font-semibold">
//                 Assigned Book
//               </Label>
//               {lesson.bookId ? (
//                 <div className="lesson-book-card p-4 rounded-lg border flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <BookOpen className="h-6 w-6 lesson-book-icon shrink-0" />
//                     <div>
//                       <p className="lesson-book-text font-semibold">
//                         {lesson.bookTitle || "Loading book..."}
//                       </p>
//                       {lesson.bookLevel && (
//                         <p className="lesson-book-sub text-sm">
//                           Level {lesson.bookLevel} • {lesson.bookInstrument}
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                   {lesson.bookTitle && (
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={() =>
//                         window.open(lesson.driveViewLink || "#", "_blank")
//                       }
//                       className="border-primary/40 text-primary hover:bg-primary/10 dark:border-purple-600/50 dark:text-purple-300"
//                     >
//                       Open PDF
//                     </Button>
//                   )}
//                 </div>
//               ) : (
//                 <div className="lesson-book-empty p-8 text-center rounded-lg border-2 border-dashed">
//                   <BookOpen className="h-12 w-12 mx-auto lesson-book-icon opacity-50 mb-3" />
//                   <p className="lesson-book-sub">No book assigned yet</p>
//                 </div>
//               )}
//               {isTeacher && (
//                 <BookSelector
//                   currentBookId={lesson.bookId}
//                   scheduleId={scheduleId}
//                   lessonId={lessonId}
//                 />
//               )}
//             </div>

//             {/* Outcome selector (teacher) */}
//             {isTeacher &&
//               !["completed", "missed_teacher", "missed_student"].includes(
//                 lesson.state,
//               ) && (
//                 <div>
//                   <Label className="lesson-text-label">Lesson Outcome</Label>
//                   <Select
//                     value={currentStatus}
//                     onValueChange={async (value) => {
//                       await updateLesson({
//                         scheduleId,
//                         lessonId,
//                         updates: { forceStatus: value as NewLessonStatus },
//                       });
//                       toast.success("Outcome updated");
//                     }}
//                   >
//                     <SelectTrigger className="mt-2 lesson-textarea">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {Object.entries(statusLabels)
//                         .filter(
//                           ([v]) =>
//                             v !== "no_answer_on_time" &&
//                             v !== "completed" &&
//                             v !== "teacher_never_called",
//                         )
//                         .map(([value, label]) => (
//                           <SelectItem key={value} value={value}>
//                             <div className="flex items-center gap-3">
//                               <div
//                                 className={`h-3 w-3 rounded-full ${statusColors[value as NewLessonStatus]}`}
//                               />
//                               {label}
//                             </div>
//                           </SelectItem>
//                         ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//               )}

//             {/* Student sees outcome */}
//             {!isTeacher && (
//               <div className="flex items-center gap-3">
//                 <div
//                   className={`h-4 w-4 rounded-full ${statusColors[currentStatus]}`}
//                 />
//                 <span className="lesson-text-main text-lg font-medium">
//                   {statusLabels[currentStatus]}
//                 </span>
//               </div>
//             )}

//             {/* Zoom button */}
//             <div className="pt-6">
//               {zoomLink ? (
//                 <Button
//                   onClick={isTeacher ? handleStart : handleOpenZoom}
//                   size="lg"
//                   className="w-full bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-purple-700 dark:hover:bg-purple-600 text-base sm:text-lg h-12 sm:h-14"
//                   disabled={isTeacher && lesson.state !== "scheduled"}
//                 >
//                   <Video className="mr-3 h-5 w-5 sm:h-6 sm:w-6" />
//                   {isTeacher
//                     ? lesson.state === "in_progress"
//                       ? "Zoom Meeting Active"
//                       : "Start Zoom Meeting (at scheduled time)"
//                     : "Join Zoom Meeting"}
//                 </Button>
//               ) : (
//                 <p className="text-orange-500 dark:text-orange-400 text-center font-medium">
//                   No Zoom link set by teacher
//                 </p>
//               )}
//             </div>

//             {/* Notes (teacher) */}
//             {isTeacher && (
//               <div className="space-y-3 pt-4 border-t lesson-border-divider">
//                 <Label className="lesson-text-label font-semibold">
//                   Lesson Notes (visible to student)
//                 </Label>
//                 <Textarea
//                   value={notes}
//                   onChange={(e) => setNotes(e.target.value)}
//                   onBlur={handleSaveNotes}
//                   rows={5}
//                   className="lesson-textarea"
//                   placeholder="What was covered? Homework? Great job on scales today!"
//                 />
//                 <Button
//                   onClick={handleSaveNotes}
//                   disabled={isSaving}
//                   className="bg-primary hover:bg-primary/90 text-primary-foreground"
//                 >
//                   {isSaving ? "Saving..." : "Save Notes"}
//                 </Button>
//               </div>
//             )}

//             {/* Notes (student) */}
//             {lesson.notes && !isTeacher && (
//               <div className="pt-4 border-t lesson-border-divider">
//                 <Label className="lesson-text-label font-semibold">
//                   Teacher&apos;s Message
//                 </Label>
//                 <div className="lesson-section-bg mt-2 p-4 rounded-lg border">
//                   <p className="lesson-text-main whitespace-pre-wrap">
//                     {lesson.notes}
//                   </p>
//                 </div>
//               </div>
//             )}

//             {/* Student feedback display */}
//             {isStudent &&
//               lessonMemo &&
//               (lessonMemo.nextLessonFocus ||
//                 lessonMemo.nextBookPageRef ||
//                 lessonMemo.nextPiece ||
//                 (lessonMemo.wentWell && lessonMemo.wentWell.length > 0) ||
//                 lessonMemo.skillRatings) && (
//                 <div className="lesson-section-bg rounded-xl border p-4 sm:p-6 space-y-4">
//                   <h3 className="lesson-text-main font-bold text-lg flex items-center gap-2">
//                     <MessageSquare className="h-5 w-5 text-primary dark:text-purple-400" />
//                     Teacher Feedback
//                   </h3>
//                   {lessonMemo.nextLessonFocus && (
//                     <div>
//                       <Label className="lesson-text-sub">
//                         Focus for Next Lesson
//                       </Label>
//                       <p className="lesson-text-main mt-1">
//                         {lessonMemo.nextLessonFocus}
//                       </p>
//                     </div>
//                   )}
//                   {lessonMemo.nextBookPageRef && (
//                     <div>
//                       <Label className="lesson-text-sub">
//                         Book / Page Reference
//                       </Label>
//                       <p className="lesson-text-main mt-1">
//                         {lessonMemo.nextBookPageRef}
//                       </p>
//                     </div>
//                   )}
//                   {lessonMemo.nextPiece && (
//                     <div>
//                       <Label className="lesson-text-sub">
//                         Next Piece / Exercise
//                       </Label>
//                       <p className="lesson-text-main mt-1">
//                         {lessonMemo.nextPiece}
//                       </p>
//                     </div>
//                   )}
//                   {lessonMemo.wentWell && lessonMemo.wentWell.length > 0 && (
//                     <div>
//                       <Label className="lesson-text-sub">What Went Well</Label>
//                       <div className="flex flex-wrap gap-2 mt-2">
//                         {lessonMemo.wentWell.map((item, i) => (
//                           <span
//                             key={i}
//                             className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm"
//                           >
//                             {item}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                   {lessonMemo.skillRatings && (
//                     <div>
//                       <Label className="lesson-text-sub">Skill Ratings</Label>
//                       <div className="grid grid-cols-2 gap-3 mt-2">
//                         {Object.entries(lessonMemo.skillRatings)
//                           .filter(([_, rating]) => rating)
//                           .map(([skill, rating]) => (
//                             <div
//                               key={skill}
//                               className="flex justify-between items-center"
//                             >
//                               <span className="lesson-text-main capitalize">
//                                 {skill}
//                               </span>
//                               <div className="flex gap-1">
//                                 {[1, 2, 3, 4, 5].map((star) => (
//                                   <Star
//                                     key={star}
//                                     className="h-4 w-4"
//                                     fill={
//                                       star <= rating ? "currentColor" : "none"
//                                     }
//                                     stroke={
//                                       star <= rating
//                                         ? "transparent"
//                                         : "currentColor"
//                                     }
//                                     color="gold"
//                                   />
//                                 ))}
//                               </div>
//                             </div>
//                           ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}

//             {/* Student rating */}
//             {isStudent && lesson.state === "completed" && (
//               <div className="space-y-6 pt-4 border-t lesson-border-divider">
//                 <Label className="lesson-text-label font-semibold">
//                   Rate This Lesson (Optional)
//                 </Label>
//                 {!existingRating ? (
//                   <RatingStars
//                     onRate={async (rating) => {
//                       try {
//                         await submitRating({ scheduleId, lessonId, rating });
//                         toast.success("Rating submitted!");
//                       } catch (err) {
//                         toast.error("Failed to submit rating");
//                       }
//                     }}
//                   />
//                 ) : (
//                   <p className="lesson-text-sub">
//                     You rated this {existingRating.rating} stars. Thanks!
//                   </p>
//                 )}
//                 <ThankYouButton
//                   scheduleId={scheduleId}
//                   lessonId={lessonId}
//                   teacherId={lesson.teacherId}
//                   teacherName={teacher.name || teacher.email.split("@")[0]}
//                   lessonCompleted={lesson.state === "completed"}
//                 />
//               </div>
//             )}

//             {/* Tutor memo (teacher only) */}
//             {isTeacher && (
//               <TutorMemoSection
//                 scheduleId={scheduleId}
//                 lessonId={lessonId}
//                 studentId={lesson.studentId}
//               />
//             )}
//           </div>
//         </div>
//       </div>

//       {isTeacher && lessonMemo && (
//         <PostLessonFeedbackDialog
//           open={isFeedbackDialogOpen}
//           onOpenChange={setIsFeedbackDialogOpen}
//           memoId={lessonMemo._id}
//           studentName={student.name || "Student"}
//           initialDateTime={lessonDateTimeFormatted}
//           onSuccess={() => {
//             toast.success("Feedback submitted!");
//             setIsFeedbackDialogOpen(false);
//           }}
//         />
//       )}
//     </div>
//   );
// }

// interface RatingStarsProps {
//   onRate: (rating: number) => Promise<void>;
// }

// function RatingStars({ onRate }: RatingStarsProps) {
//   const [hoverRating, setHoverRating] = useState(0);
//   return (
//     <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
//       {[1, 2, 3, 4, 5].map((star) => (
//         <Button
//           key={star}
//           variant="ghost"
//           className="p-0 hover:bg-transparent"
//           onClick={() => onRate(star)}
//           onMouseEnter={() => setHoverRating(star)}
//           aria-label={`Rate ${star} stars`}
//         >
//           <Star
//             className="h-8 w-8 transition-colors"
//             fill={star <= hoverRating ? "currentColor" : "none"}
//             stroke={star <= hoverRating ? "transparent" : "currentColor"}
//             color="gold"
//           />
//         </Button>
//       ))}
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
import {
  Loader2,
  Video,
  Clock,
  Globe,
  BookOpen,
  AlertCircle,
  PlayCircle,
  StopCircle,
  MessageSquare,
  Copy,
  Star,
} from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatTimeInTimezone, getTimezoneAbbr } from "@/lib/timezoneUtils";
import { motion } from "framer-motion";
import { BookSelector } from "@/app/components/BookSelector";
import confetti from "canvas-confetti";
import { TutorMemoSection } from "@/app/components/TutorMemoSection";
import { CancelLessonDialog } from "@/app/components/CancelLessonDialog";
import { RescheduleDialog } from "@/app/components/RescheduleDialog";
import { ThankYouButton } from "@/app/components/ThankYouButton";
import { PostLessonFeedbackDialog } from "@/app/components/PostLessonFeedbackDialog";

/* ─────────────────────────────────────────────────────────────
   !important overrides — light mode resets everything to white.
   Dark mode is left completely untouched (all dark styles live
   in the JSX classNames as before).
───────────────────────────────────────────────────────────── */
const LESSON_STYLES = `
  /* Page background */
  .lesson-page                    { background: #ffffff !important; }

  /* Clock / timezone widget */
  .lesson-clock-widget            { background: #ffffff !important; border-color: hsl(var(--border)) !important; box-shadow: 0 2px 12px rgba(0,0,0,0.08) !important; }
  .lesson-clock-label             { color: hsl(var(--muted-foreground)) !important; }
  .lesson-clock-time              { color: hsl(var(--foreground)) !important; }
  .lesson-clock-tz                { color: hsl(var(--primary)) !important; }
  .lesson-clock-divider           { background: hsl(var(--border)) !important; }

  /* Main card */
  .lesson-main-card               { background: #ffffff !important; border-color: hsl(var(--border)) !important; }
  .lesson-card-title              { color: hsl(var(--foreground)) !important; }
  .lesson-time-pill               { background: hsl(var(--primary)) !important; color: #ffffff !important; box-shadow: none !important; }

  /* Inner content sections */
  .lesson-section-bg              { background: hsl(var(--muted)) !important; border-color: hsl(var(--border)) !important; }
  .lesson-text-main               { color: hsl(var(--foreground)) !important; }
  .lesson-text-sub                { color: hsl(var(--muted-foreground)) !important; }
  .lesson-text-label              { color: hsl(var(--foreground)) !important; }
  .lesson-border-divider          { border-color: hsl(var(--border)) !important; }

  /* Textarea + inputs */
  .lesson-textarea                { background: hsl(var(--muted)) !important; border-color: hsl(var(--border)) !important; color: hsl(var(--foreground)) !important; }

  /* Book section */
  .lesson-book-card               { background: hsl(var(--muted)) !important; border-color: hsl(var(--border)) !important; }
  .lesson-book-empty              { background: hsl(var(--muted)/0.5) !important; border-color: hsl(var(--border)) !important; }
  .lesson-book-icon               { color: hsl(var(--primary)) !important; }
  .lesson-book-text               { color: hsl(var(--foreground)) !important; }
  .lesson-book-sub                { color: hsl(var(--muted-foreground)) !important; }

  /* Status pill */
  .lesson-status-pill             { background: hsl(var(--muted)) !important; }

  /* Back button */
  .lesson-back-btn                { color: hsl(var(--primary)) !important; }

  /* ── Dark mode: restore original styles ── */
  .dark .lesson-page              { background: linear-gradient(to bottom, #000000, #1a0030, #000000) !important; }
  .dark .lesson-clock-widget      { background: radial-gradient(circle at top left, #1a001f, #000000) !important; border-color: rgba(109,40,217,0.4) !important; box-shadow: 0 4px 24px rgba(139,92,246,0.15) !important; }
  .dark .lesson-clock-label       { color: rgba(196,181,253,0.7) !important; }
  .dark .lesson-clock-time        { color: #ddd6fe !important; }
  .dark .lesson-clock-tz          { color: rgba(167,139,250,0.8) !important; }
  .dark .lesson-clock-divider     { background: rgba(109,40,217,0.6) !important; }
  .dark .lesson-main-card         { background: linear-gradient(to bottom right, hsl(270 90% 5%), #000000) !important; border-color: rgba(109,40,217,0.3) !important; }
  .dark .lesson-card-title        { color: #ddd6fe !important; }
  .dark .lesson-time-pill         { background: rgba(76,29,149,0.5) !important; color: #ddd6fe !important; box-shadow: 0 4px 16px rgba(139,92,246,0.3) !important; }
  .dark .lesson-section-bg        { background: rgba(76,29,149,0.3) !important; border-color: rgba(109,40,217,0.3) !important; }
  .dark .lesson-text-main         { color: #ede9fe !important; }
  .dark .lesson-text-sub          { color: #c4b5fd !important; }
  .dark .lesson-text-label        { color: #ffffff !important; }
  .dark .lesson-border-divider    { border-color: rgba(109,40,217,0.3) !important; }
  .dark .lesson-textarea          { background: rgba(76,29,149,0.2) !important; border-color: rgba(109,40,217,0.5) !important; color: #ddd6fe !important; }
  .dark .lesson-book-card         { background: rgba(76,29,149,0.3) !important; border-color: rgba(109,40,217,0.5) !important; }
  .dark .lesson-book-empty        { background: rgba(76,29,149,0.2) !important; border-color: rgba(109,40,217,0.5) !important; }
  .dark .lesson-book-icon         { color: #a78bfa !important; }
  .dark .lesson-book-text         { color: #ddd6fe !important; }
  .dark .lesson-book-sub          { color: #a78bfa !important; }
  .dark .lesson-status-pill       { background: rgba(76,29,149,0.3) !important; }
  .dark .lesson-back-btn          { color: #c4b5fd !important; }
`;

type NewLessonStatus =
  | "completed"
  | "finished_early"
  | "no_answer_on_time"
  | "teacher_late"
  | "technical_difficulty"
  | "teacher_never_called";

type EndLessonStatus = Exclude<
  NewLessonStatus,
  "no_answer_on_time" | "teacher_never_called"
>;

const statusLabels: Record<NewLessonStatus, string> = {
  completed: "Completed (Full Pay)",
  finished_early: "Finished Early (Full Pay)",
  no_answer_on_time: "No Answer (Full Pay)",
  teacher_late: "I Was Late (Full Pay - $5)",
  technical_difficulty: "Technical Issue (No Pay)",
  teacher_never_called: "Teacher Never Called ($20 Deduction)",
};

const statusColors: Record<NewLessonStatus, string> = {
  completed: "bg-emerald-500",
  finished_early: "bg-yellow-500",
  no_answer_on_time: "bg-red-500",
  teacher_late: "bg-orange-500",
  technical_difficulty: "bg-purple-500",
  teacher_never_called: "bg-red-700",
};

const stateIcons = {
  scheduled: <Clock className="h-5 w-5 text-blue-400" />,
  in_progress: <PlayCircle className="h-5 w-5 text-yellow-400" />,
  completed: <StopCircle className="h-5 w-5 text-emerald-400" />,
  missed_teacher: <AlertCircle className="h-5 w-5 text-red-400" />,
  missed_student: <AlertCircle className="h-5 w-5 text-orange-400" />,
};

const stateLabels = {
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  missed_teacher: "Missed by Teacher",
  missed_student: "Missed by Student",
};

// ── Slot label config for the read-only book display ──────────────────────────
const SLOT_DISPLAY = {
  main: {
    label: "Main Book",
    accent: "text-purple-600 dark:text-purple-400",
    badge:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  },
  subA: {
    label: "Sub Book A",
    accent: "text-emerald-600 dark:text-emerald-400",
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  subB: {
    label: "Sub Book B",
    accent: "text-rose-600 dark:text-rose-400",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  },
} as const;

// ── Small reusable book row shown in the read-only display section ─────────────
function BookRow({
  slot,
  title,
  level,
  instrument,
  driveViewLink,
}: {
  slot: keyof typeof SLOT_DISPLAY;
  title?: string;
  level?: number;
  instrument?: string;
  driveViewLink?: string;
}) {
  const cfg = SLOT_DISPLAY[slot];
  if (!title) return null;
  return (
    <div className="lesson-book-card p-4 rounded-lg border flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <BookOpen className={`h-5 w-5 shrink-0 ${cfg.accent}`} />
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}
            >
              {cfg.label}
            </span>
          </div>
          <p className="lesson-book-text font-semibold mt-0.5 truncate">
            {title}
          </p>
          {(level || instrument) && (
            <p className="lesson-book-sub text-sm">
              {level ? `Level ${level}` : ""}
              {level && instrument ? " • " : ""}
              {instrument ?? ""}
            </p>
          )}
        </div>
      </div>
      {driveViewLink && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => window.open(driveViewLink, "_blank")}
          className="shrink-0 border-primary/40 text-primary hover:bg-primary/10 dark:border-purple-600/50 dark:text-purple-300"
        >
          Open PDF
        </Button>
      )}
    </div>
  );
}

export default function LessonDetail() {
  const params = useParams();
  const scheduleId = params.scheduleId as Id<"schedules">;
  const lessonId = params.lessonId as string;
  const router = useRouter();
  const { user } = useUser();

  const lesson = useQuery(api.schedules.getLessonWithBook, {
    scheduleId,
    lessonId,
  });
  const teacher = useQuery(
    api.users.getById,
    lesson?.teacherId ? { id: lesson.teacherId } : "skip",
  );
  const student = useQuery(
    api.users.getById,
    lesson?.studentId ? { id: lesson.studentId } : "skip",
  );
  const existingRating = useQuery(api.lessonRatings.getForLesson, {
    scheduleId,
    lessonId,
  });
  const lessonMemo = useQuery(api.tutorsMemos.getByLesson, {
    scheduleId,
    lessonId,
  });

  // ── Sub-book details (fetched from book IDs on the student doc) ──────────────
  // These queries resolve the subBookAId / subBookBId stored on the user record
  // into full book objects so we can show title / level / instrument in the UI.
  // ✅ CORRECT
  const subBookA = useQuery(
    api.books.getById,
    student?.subBookAId ? { id: student.subBookAId } : "skip",
  );

  const subBookB = useQuery(
    api.books.getById,
    student?.subBookBId ? { id: student.subBookBId } : "skip",
  );

  const submitRating = useMutation(api.lessonRatings.submit);
  const updateLesson = useMutation(api.schedules.updateLesson);
  const startLessonMutation = useMutation(api.schedules.startLesson);
  const endLessonMutation = useMutation(api.schedules.endLesson);
  const markMissedMutation = useMutation(api.schedules.markMissed);
  const createLessonMemo = useMutation(api.tutorsMemos.createLessonMemo);

  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedStatus, setSelectedStatus] = useState<
    EndLessonStatus | undefined
  >(undefined);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);

  const studentInfo = useQuery(
    api.tutorsMemos.getGeneralInfoForStudent,
    lesson?.studentId ? { studentId: lesson.studentId } : "skip",
  );
  const updateGeneralInfo = useMutation(
    api.tutorsMemos.updateGeneralInfoForStudent,
  );
  const [studentContent, setStudentContent] = useState("");
  const [studentInfoSaving, setStudentInfoSaving] = useState(false);

  const isTeacher = user?.unsafeMetadata?.role === "teacher";
  const isStudent = user?.unsafeMetadata?.role === "student";
  const zoomLink = teacher?.zoomLink || lesson?.zoomLink;

  const lessonDateTime = lesson
    ? new Date(`${lesson.date}T${lesson.time}:00`)
    : null;
  const isLessonTimeOrLater = lessonDateTime
    ? Date.now() >= lessonDateTime.getTime()
    : false;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (lesson?.notes) setNotes(lesson.notes || "");
  }, [lesson?.notes]);
  useEffect(() => {
    setStudentContent(studentInfo?.content || "");
  }, [studentInfo]);

  if (!lesson || !teacher || !student) {
    return (
      <div className="lesson-page flex min-h-screen items-center justify-center">
        <style>{LESSON_STYLES}</style>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-8 w-8 text-primary dark:text-purple-400" />
        </motion.div>
      </div>
    );
  }

  function calculateEndTime(startTime: string, duration: number): string {
    const [hours, minutes] = startTime.split(":").map(Number);
    const startDate = new Date(0, 0, 0, hours, minutes);
    startDate.setMinutes(startDate.getMinutes() + duration);
    return `${startDate.getHours().toString().padStart(2, "0")}:${startDate.getMinutes().toString().padStart(2, "0")}`;
  }

  const endTime = calculateEndTime(lesson.time, lesson.duration);

  const handleStart = async () => {
    if (lesson.state !== "scheduled") {
      toast.info(
        `Lesson is already ${stateLabels[lesson.state].toLowerCase()}`,
        {
          description: "You can only start scheduled lessons.",
        },
      );
      return;
    }
    if (!isLessonTimeOrLater) {
      toast.warning("Too early!", {
        description:
          "You can only start the lesson at or after the scheduled time.",
      });
      return;
    }
    try {
      await startLessonMutation({ scheduleId, lessonId });
      toast.success("Lesson started & Zoom opened!");
      handleOpenZoom();
    } catch (err: unknown) {
      toast.error("Failed to start lesson", {
        description:
          err instanceof Error ? err.message : "Please refresh and try again.",
      });
    }
  };

  const handleEnd = async () => {
    try {
      const result = await endLessonMutation({
        scheduleId,
        lessonId,
        status: selectedStatus,
      });
      if (result.status === "completed") {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        toast.success("Fully completed! Well done!", {
          description: "Lesson ended on time. Great job!",
          duration: 5000,
        });
      } else {
        toast.success("Lesson ended!", {
          description: statusLabels[result.status],
        });
      }
      if (!lessonMemo) {
        try {
          await createLessonMemo({
            scheduleId,
            lessonId,
            studentId: lesson.studentId,
            teacherId: lesson.teacherId as Id<"users">,
            teacherName: teacher.name || teacher.email.split("@")[0],
            status: "OK",
          });
        } catch (err) {
          console.warn("Could not create lesson memo", err);
        }
      }
      setIsFeedbackDialogOpen(true);
    } catch (err) {
      toast.error("Failed to end lesson");
    }
  };

  const handleMarkMissed = async (missedBy: "teacher" | "student") => {
    try {
      await markMissedMutation({ scheduleId, lessonId, missedBy });
      toast.success(`Marked as missed by ${missedBy}`);
    } catch (err) {
      toast.error("Failed to mark missed");
    }
  };

  const handleOpenZoom = async () => {
    if (!zoomLink) {
      toast.error("No Zoom link configured.");
      return;
    }
    if (isTeacher && !lesson.zoomLink && teacher.zoomLink) {
      try {
        await updateLesson({
          scheduleId,
          lessonId,
          updates: { zoomLink: teacher.zoomLink },
        });
      } catch (err) {
        console.warn("Could not save Zoom link", err);
      }
    }
    window.open(zoomLink, "_blank", "noopener,noreferrer");
  };

  const handleSaveNotes = async () => {
    if (!isTeacher || notes === lesson.notes) return;
    setIsSaving(true);
    try {
      await updateLesson({ scheduleId, lessonId, updates: { notes } });
      toast.success("Notes saved!");
    } catch {
      toast.error("Failed to save notes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveStudentInfo = async () => {
    if (!isTeacher || studentContent === (studentInfo?.content || "")) return;
    setStudentInfoSaving(true);
    try {
      await updateGeneralInfo({
        studentId: lesson.studentId,
        content: studentContent,
      });
      toast.success("Student information saved!");
    } catch {
      toast.error("Failed to save student information");
    } finally {
      setStudentInfoSaving(false);
    }
  };

  const handleOpenFeedbackDialog = async () => {
    if (!lessonMemo) {
      await createLessonMemo({
        scheduleId,
        lessonId,
        studentId: lesson.studentId,
        status: "OK",
        teacherId: lesson.teacherId as Id<"users">,
        teacherName: teacher.name || teacher.email.split("@")[0],
      });
    }
    setIsFeedbackDialogOpen(true);
  };

  const getInitials = (name?: string, email?: string) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase()
      : email?.substring(0, 2).toUpperCase() || "ST";

  const DualTimezoneDisplay = () => {
    const teacherTz = teacher?.timezone || "UTC";
    const studentTz = student?.timezone || "UTC";
    return (
      <div className="lesson-clock-widget flex flex-col gap-4 sm:gap-6 px-4 sm:px-6 py-4 rounded-xl border backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 sm:h-6 sm:w-6 lesson-clock-tz shrink-0" />
          <div>
            <span className="lesson-clock-label text-xs">Your Time</span>
            <div className="flex items-center gap-2">
              <span className="lesson-clock-time text-lg sm:text-xl font-bold font-mono">
                {formatTimeInTimezone(currentTime, teacherTz, "HH:mm:ss")}
              </span>
              <span className="lesson-clock-tz text-xs font-mono">
                {getTimezoneAbbr(teacherTz)}
              </span>
            </div>
          </div>
        </div>
        <div className="lesson-clock-divider h-px" />
        <div className="flex items-center gap-3">
          <Globe className="h-5 w-5 sm:h-6 sm:w-6 lesson-clock-tz shrink-0" />
          <div>
            <span className="lesson-clock-label text-xs">Student Time</span>
            <div className="flex items-center gap-2">
              <span className="lesson-clock-time text-lg sm:text-xl font-bold font-mono">
                {formatTimeInTimezone(currentTime, studentTz, "HH:mm:ss")}
              </span>
              <span className="lesson-clock-tz text-xs font-mono">
                {getTimezoneAbbr(studentTz)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const currentStatus = (lesson.status ||
    "no_answer_on_time") as NewLessonStatus;
  const lessonDateTimeFormatted = lessonDateTime
    ? formatTimeInTimezone(lessonDateTime, student.timezone || "UTC")
    : "";

  // ── Derived booleans for whether any book slot is populated ──────────────────
  const hasMainBook = !!lesson.bookId;
  const hasSubBookA = !!student.subBookAId;
  const hasSubBookB = !!student.subBookBId;
  const hasAnyBook = hasMainBook || hasSubBookA || hasSubBookB;

  return (
    <div className="lesson-page min-h-screen relative">
      <style>{LESSON_STYLES}</style>
      <div className="container mx-auto p-4 sm:p-6 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="lesson-back-btn mb-4"
        >
          ← Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <DualTimezoneDisplay />
        </motion.div>

        {/* ── Main card ── */}
        <div className="lesson-main-card mt-6 rounded-xl border-2 overflow-hidden shadow-lg">
          {/* Card header */}
          <div className="p-4 sm:p-6 border-b lesson-border-divider">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <h2 className="lesson-card-title flex items-center gap-3 text-xl sm:text-2xl font-bold font-serif">
                <Video className="h-6 w-6 sm:h-7 sm:w-7 text-primary dark:text-purple-400 shrink-0" />
                Lesson with {student.name || student.email.split("@")[0]}
              </h2>
              <div className="flex gap-2 sm:gap-4 font-mono text-sm sm:text-base flex-wrap">
                <span className="lesson-time-pill px-3 py-1 rounded-full font-semibold animate-pulse">
                  Start: {lesson.time}
                </span>
                <span className="lesson-time-pill px-3 py-1 rounded-full font-semibold animate-pulse">
                  End: {endTime}
                </span>
              </div>
            </div>
          </div>

          {/* Card body */}
          <div className="p-4 sm:p-6 space-y-6">
            {/* Student info row */}
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 sm:h-16 sm:w-16 border-2 border-primary/40 dark:border-purple-500 shrink-0">
                <AvatarImage src={student.imageUrl} />
                <AvatarFallback className="bg-primary dark:bg-purple-800 text-white">
                  {getInitials(student.name, student.email)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="lesson-text-main text-lg sm:text-xl font-semibold">
                  {student.name || "Student"}
                </p>
                <p className="lesson-text-sub">
                  {student.instrument && `Learning ${student.instrument}`}
                </p>
              </div>
            </div>

            {/* Student info section */}
            <div className="space-y-3 pt-4 border-t lesson-border-divider">
              <Label className="lesson-text-label font-semibold">
                Student Information (By Teachers)
              </Label>
              {isTeacher ? (
                <>
                  <Textarea
                    value={studentContent}
                    onChange={(e) => setStudentContent(e.target.value)}
                    rows={5}
                    className="lesson-textarea"
                    placeholder="Write some basic knowledge of the student, e.g., preferred name, what they're interested in and any family background, etc. This is visible to all teachers."
                  />
                  <Button
                    onClick={handleSaveStudentInfo}
                    disabled={
                      studentInfoSaving ||
                      studentContent === (studentInfo?.content || "")
                    }
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {studentInfoSaving ? "Saving..." : "Save Student Info"}
                  </Button>
                </>
              ) : (
                studentInfo?.content && (
                  <div className="lesson-section-bg mt-2 p-4 rounded-lg border">
                    <p className="lesson-text-main whitespace-pre-wrap">
                      {studentInfo.content}
                    </p>
                  </div>
                )
              )}
            </div>

            {/* Lesson info grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="lesson-text-sub text-xs uppercase tracking-wide">
                  Date & Time
                </Label>
                <p className="lesson-text-main font-semibold mt-1">
                  {lessonDateTime ? format(lessonDateTime, "PPP p") : "N/A"}
                </p>
              </div>
              <div>
                <Label className="lesson-text-sub text-xs uppercase tracking-wide">
                  Duration
                </Label>
                <p className="lesson-text-main font-semibold mt-1">
                  {lesson.duration} min
                </p>
              </div>
            </div>

            {/* State pill */}
            <div className="lesson-status-pill flex items-center gap-3 p-4 rounded-lg">
              {stateIcons[lesson.state]}
              <span className="lesson-text-main text-lg font-medium">
                Status: {stateLabels[lesson.state]}
              </span>
            </div>

            {/* WhatsApp (teacher only) */}
            {isTeacher && (
              <div className="mt-5 p-5 bg-gradient-to-r from-green-950/40 to-emerald-950/30 rounded-2xl border border-green-800/60 shadow-md shadow-green-900/20 hover:shadow-lg hover:shadow-green-900/30 transition-shadow duration-200">
                {student?.countryCode && student?.phoneNumber ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="bg-green-700/30 p-3.5 rounded-full flex-shrink-0">
                        <MessageSquare className="h-6 w-6 text-green-400" />
                      </div>
                      <div>
                        <div className="text-xs text-green-400/90 uppercase tracking-wide font-medium mb-0.5">
                          Student WhatsApp (emergency contact only)
                        </div>
                        <div className="text-lg font-semibold text-green-100">
                          {student.countryCode} {student.phoneNumber}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-green-600/60 text-green-300 hover:bg-green-950/50 hover:text-green-200"
                        asChild
                      >
                        <a
                          href={`https://wa.me/${student.countryCode.replace("+", "")}${student.phoneNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Message
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-green-400 hover:text-green-300 hover:bg-green-950/40"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${student.countryCode}${student.phoneNumber}`,
                          );
                          toast.success("Copied to clipboard");
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-amber-300/90 text-sm">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span>
                      This student has not provided a WhatsApp number yet.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Teacher controls */}
            {isTeacher && (
              <div className="space-y-4">
                {lesson.state === "in_progress" && (
                  <>
                    <Button
                      onClick={handleEnd}
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                    >
                      End Lesson
                    </Button>
                    <Select
                      value={selectedStatus ?? ""}
                      onValueChange={(v) =>
                        setSelectedStatus(v as EndLessonStatus)
                      }
                    >
                      <SelectTrigger className="lesson-textarea">
                        <SelectValue placeholder="Optional: Override outcome" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels)
                          .filter(
                            ([v]) =>
                              v !== "no_answer_on_time" &&
                              v !== "completed" &&
                              v !== "teacher_never_called",
                          )
                          .map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </>
                )}

                {lesson.state === "completed" && (
                  <Button
                    onClick={handleOpenFeedbackDialog}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-purple-600 dark:hover:bg-purple-700"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {lessonMemo?.feedbackCompleted
                      ? "Update Feedback"
                      : "Give Feedback"}
                  </Button>
                )}

                {["scheduled", "in_progress"].includes(lesson.state) && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleMarkMissed("teacher")}
                      variant="destructive"
                      className="flex-1"
                    >
                      Mark Missed (Me)
                    </Button>
                    <Button
                      onClick={() => handleMarkMissed("student")}
                      variant="outline"
                      className="flex-1 border-border text-foreground hover:bg-muted dark:border-purple-600/50 dark:text-purple-300 dark:hover:bg-purple-800/30"
                    >
                      Mark Missed (Student)
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Cancel + Reschedule */}
            {lesson.state === "scheduled" && (
              <div className="flex gap-4">
                <CancelLessonDialog
                  scheduleId={scheduleId}
                  lessonId={lessonId}
                  date={lesson.date}
                  time={lesson.time}
                  duration={lesson.duration}
                  isStudent={isStudent}
                />
                {isTeacher && (
                  <RescheduleDialog
                    scheduleId={scheduleId}
                    lessonId={lessonId}
                    teacherId={lesson.teacherId}
                    duration={lesson.duration}
                  />
                )}
              </div>
            )}

            {/* ── Book section ──────────────────────────────────────────────────── */}
            <div className="space-y-4 pt-4 border-t lesson-border-divider">
              <Label className="lesson-text-label text-lg font-semibold">
                Assigned Books
              </Label>

              {/* Read-only display — all three slots */}
              {hasAnyBook ? (
                <div className="space-y-2">
                  {/* Main book — sourced from lesson.bookId (per-lesson) */}
                  {hasMainBook && (
                    <BookRow
                      slot="main"
                      title={lesson.bookTitle}
                      level={lesson.bookLevel}
                      instrument={lesson.bookInstrument}
                      driveViewLink={lesson.driveViewLink}
                    />
                  )}

                  {/* Sub Book A — sourced from student.subBookAId (per-student) */}
                  {hasSubBookA && (
                    <BookRow
                      slot="subA"
                      title={subBookA?.title}
                      level={subBookA?.levelNumber}
                      instrument={subBookA?.instrument}
                      driveViewLink={subBookA?.driveViewLink}
                    />
                  )}

                  {/* Sub Book B — sourced from student.subBookBId (per-student) */}
                  {hasSubBookB && (
                    <BookRow
                      slot="subB"
                      title={subBookB?.title}
                      level={subBookB?.levelNumber}
                      instrument={subBookB?.instrument}
                      driveViewLink={subBookB?.driveViewLink}
                    />
                  )}
                </div>
              ) : (
                /* Empty state — shown when no slot is assigned */
                <div className="lesson-book-empty p-8 text-center rounded-lg border-2 border-dashed">
                  <BookOpen className="h-12 w-12 mx-auto lesson-book-icon opacity-50 mb-3" />
                  <p className="lesson-book-sub">No books assigned yet</p>
                </div>
              )}

              {/*
               * BookSelector — teacher only.
               *
               * Props:
               *   currentBookId  → lesson's main book (per-lesson, stored in schedules)
               *   subBookAId     → student's Sub A book (per-student, stored in users)
               *   subBookBId     → student's Sub B book (per-student, stored in users)
               *   studentId      → needed so BookSelector can call updateStudentBooks
               *                    mutation for the sub slots
               */}
              {isTeacher && (
                <BookSelector
                  currentBookId={lesson.bookId}
                  subBookAId={student.subBookAId ?? null}
                  subBookBId={student.subBookBId ?? null}
                  scheduleId={scheduleId}
                  lessonId={lessonId}
                  studentId={lesson.studentId}
                />
              )}
            </div>

            {/* Outcome selector (teacher) */}
            {isTeacher &&
              !["completed", "missed_teacher", "missed_student"].includes(
                lesson.state,
              ) && (
                <div>
                  <Label className="lesson-text-label">Lesson Outcome</Label>
                  <Select
                    value={currentStatus}
                    onValueChange={async (value) => {
                      await updateLesson({
                        scheduleId,
                        lessonId,
                        updates: { forceStatus: value as NewLessonStatus },
                      });
                      toast.success("Outcome updated");
                    }}
                  >
                    <SelectTrigger className="mt-2 lesson-textarea">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels)
                        .filter(
                          ([v]) =>
                            v !== "no_answer_on_time" &&
                            v !== "completed" &&
                            v !== "teacher_never_called",
                        )
                        .map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-3 w-3 rounded-full ${statusColors[value as NewLessonStatus]}`}
                              />
                              {label}
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

            {/* Student sees outcome */}
            {!isTeacher && (
              <div className="flex items-center gap-3">
                <div
                  className={`h-4 w-4 rounded-full ${statusColors[currentStatus]}`}
                />
                <span className="lesson-text-main text-lg font-medium">
                  {statusLabels[currentStatus]}
                </span>
              </div>
            )}

            {/* Zoom button */}
            <div className="pt-6">
              {zoomLink ? (
                <Button
                  onClick={isTeacher ? handleStart : handleOpenZoom}
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-purple-700 dark:hover:bg-purple-600 text-base sm:text-lg h-12 sm:h-14"
                  disabled={isTeacher && lesson.state !== "scheduled"}
                >
                  <Video className="mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                  {isTeacher
                    ? lesson.state === "in_progress"
                      ? "Zoom Meeting Active"
                      : "Start Zoom Meeting (at scheduled time)"
                    : "Join Zoom Meeting"}
                </Button>
              ) : (
                <p className="text-orange-500 dark:text-orange-400 text-center font-medium">
                  No Zoom link set by teacher
                </p>
              )}
            </div>

            {/* Notes (teacher) */}
            {isTeacher && (
              <div className="space-y-3 pt-4 border-t lesson-border-divider">
                <Label className="lesson-text-label font-semibold">
                  Lesson Notes (visible to student)
                </Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={handleSaveNotes}
                  rows={5}
                  className="lesson-textarea"
                  placeholder="What was covered? Homework? Great job on scales today!"
                />
                <Button
                  onClick={handleSaveNotes}
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isSaving ? "Saving..." : "Save Notes"}
                </Button>
              </div>
            )}

            {/* Notes (student) */}
            {lesson.notes && !isTeacher && (
              <div className="pt-4 border-t lesson-border-divider">
                <Label className="lesson-text-label font-semibold">
                  Teacher&apos;s Message
                </Label>
                <div className="lesson-section-bg mt-2 p-4 rounded-lg border">
                  <p className="lesson-text-main whitespace-pre-wrap">
                    {lesson.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Student feedback display */}
            {isStudent &&
              lessonMemo &&
              (lessonMemo.nextLessonFocus ||
                lessonMemo.nextBookPageRef ||
                lessonMemo.nextPiece ||
                (lessonMemo.wentWell && lessonMemo.wentWell.length > 0) ||
                lessonMemo.skillRatings) && (
                <div className="lesson-section-bg rounded-xl border p-4 sm:p-6 space-y-4">
                  <h3 className="lesson-text-main font-bold text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary dark:text-purple-400" />
                    Teacher Feedback
                  </h3>
                  {lessonMemo.nextLessonFocus && (
                    <div>
                      <Label className="lesson-text-sub">
                        Focus for Next Lesson
                      </Label>
                      <p className="lesson-text-main mt-1">
                        {lessonMemo.nextLessonFocus}
                      </p>
                    </div>
                  )}
                  {lessonMemo.nextBookPageRef && (
                    <div>
                      <Label className="lesson-text-sub">
                        Book / Page Reference
                      </Label>
                      <p className="lesson-text-main mt-1">
                        {lessonMemo.nextBookPageRef}
                      </p>
                    </div>
                  )}
                  {lessonMemo.nextPiece && (
                    <div>
                      <Label className="lesson-text-sub">
                        Next Piece / Exercise
                      </Label>
                      <p className="lesson-text-main mt-1">
                        {lessonMemo.nextPiece}
                      </p>
                    </div>
                  )}
                  {lessonMemo.wentWell && lessonMemo.wentWell.length > 0 && (
                    <div>
                      <Label className="lesson-text-sub">What Went Well</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {lessonMemo.wentWell.map((item, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {lessonMemo.skillRatings && (
                    <div>
                      <Label className="lesson-text-sub">Skill Ratings</Label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        {Object.entries(lessonMemo.skillRatings)
                          .filter(([_, rating]) => rating)
                          .map(([skill, rating]) => (
                            <div
                              key={skill}
                              className="flex justify-between items-center"
                            >
                              <span className="lesson-text-main capitalize">
                                {skill}
                              </span>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className="h-4 w-4"
                                    fill={
                                      star <= rating ? "currentColor" : "none"
                                    }
                                    stroke={
                                      star <= rating
                                        ? "transparent"
                                        : "currentColor"
                                    }
                                    color="gold"
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            {/* Student rating */}
            {isStudent && lesson.state === "completed" && (
              <div className="space-y-6 pt-4 border-t lesson-border-divider">
                <Label className="lesson-text-label font-semibold">
                  Rate This Lesson (Optional)
                </Label>
                {!existingRating ? (
                  <RatingStars
                    onRate={async (rating) => {
                      try {
                        await submitRating({ scheduleId, lessonId, rating });
                        toast.success("Rating submitted!");
                      } catch (err) {
                        toast.error("Failed to submit rating");
                      }
                    }}
                  />
                ) : (
                  <p className="lesson-text-sub">
                    You rated this {existingRating.rating} stars. Thanks!
                  </p>
                )}
                <ThankYouButton
                  scheduleId={scheduleId}
                  lessonId={lessonId}
                  teacherId={lesson.teacherId}
                  teacherName={teacher.name || teacher.email.split("@")[0]}
                  lessonCompleted={lesson.state === "completed"}
                />
              </div>
            )}

            {/* Tutor memo (teacher only) */}
            {isTeacher && (
              <TutorMemoSection
                scheduleId={scheduleId}
                lessonId={lessonId}
                studentId={lesson.studentId}
              />
            )}
          </div>
        </div>
      </div>

      {isTeacher && lessonMemo && (
        <PostLessonFeedbackDialog
          open={isFeedbackDialogOpen}
          onOpenChange={setIsFeedbackDialogOpen}
          memoId={lessonMemo._id}
          studentName={student.name || "Student"}
          initialDateTime={lessonDateTimeFormatted}
          onSuccess={() => {
            toast.success("Feedback submitted!");
            setIsFeedbackDialogOpen(false);
          }}
        />
      )}
    </div>
  );
}

interface RatingStarsProps {
  onRate: (rating: number) => Promise<void>;
}

function RatingStars({ onRate }: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState(0);
  return (
    <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Button
          key={star}
          variant="ghost"
          className="p-0 hover:bg-transparent"
          onClick={() => onRate(star)}
          onMouseEnter={() => setHoverRating(star)}
          aria-label={`Rate ${star} stars`}
        >
          <Star
            className="h-8 w-8 transition-colors"
            fill={star <= hoverRating ? "currentColor" : "none"}
            stroke={star <= hoverRating ? "transparent" : "currentColor"}
            color="gold"
          />
        </Button>
      ))}
    </div>
  );
}
