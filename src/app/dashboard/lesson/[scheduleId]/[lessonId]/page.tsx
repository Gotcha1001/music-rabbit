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
// import { CancelLessonDialog } from "@/app/components/CancelLessonDialog"; // ← NEW: Import CancelLessonDialog
// import { RescheduleDialog } from "@/app/components/RescheduleDialog"; // ← NEW: Import RescheduleDialog
// import { Star } from "lucide-react";
// import { ThankYouButton } from "@/app/components/ThankYouButton"; // ← NEW: Import ThankYouButton

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
//   const submitRating = useMutation(api.lessonRatings.submit);

//   const updateLesson = useMutation(api.schedules.updateLesson);
//   const startLessonMutation = useMutation(api.schedules.startLesson);
//   const endLessonMutation = useMutation(api.schedules.endLesson);
//   const markMissedMutation = useMutation(api.schedules.markMissed);

//   const [notes, setNotes] = useState("");
//   const [isSaving, setIsSaving] = useState(false);
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const [selectedStatus, setSelectedStatus] = useState<
//     EndLessonStatus | undefined
//   >(undefined);

//   // NEW: Student info states
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

//   // Allow teacher to start from exactly the scheduled time (no early starts)
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
//       <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-black via-purple-950 to-black">
//         <motion.div
//           animate={{ rotate: 360 }}
//           transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//         >
//           <Loader2 className="h-8 w-8 text-purple-400" />
//         </motion.div>
//       </div>
//     );
//   }

//   function calculateEndTime(startTime: string, duration: number): string {
//     const [hours, minutes] = startTime.split(":").map(Number);
//     const startDate = new Date(0, 0, 0, hours, minutes);
//     startDate.setMinutes(startDate.getMinutes() + duration);
//     const endHours = startDate.getHours().toString().padStart(2, "0");
//     const endMinutes = startDate.getMinutes().toString().padStart(2, "0");
//     return `${endHours}:${endMinutes}`;
//   }

//   const endTime = calculateEndTime(lesson.time, lesson.duration);

//   const handleStart = async () => {
//     if (lesson.state !== "scheduled") {
//       toast.info(
//         `Lesson is already ${stateLabels[lesson.state].toLowerCase()}`,
//         {
//           description: "You can only start scheduled lessons.",
//         },
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
//       const errorMessage =
//         err instanceof Error ? err.message : "Please refresh and try again.";
//       toast.error("Failed to start lesson", {
//         description: errorMessage,
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
//         confetti({
//           particleCount: 100,
//           spread: 70,
//           origin: { y: 0.6 },
//         });
//         toast.success("Fully completed! Well done!", {
//           description: "Lesson ended on time. Great job!",
//           duration: 5000,
//         });
//       } else {
//         toast.success("Lesson ended!", {
//           description: statusLabels[result.status],
//         });
//       }
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

//     // Save teacher's personal Zoom link to the lesson if not already set
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

//   // NEW: Save student info
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
//       <div className="flex flex-col gap-6 px-6 py-4 rounded-xl shadow-lg border border-purple-900/40 bg-[radial-gradient(circle_at_top_left,#1a001f,#000000)] backdrop-blur-sm">
//         <div className="flex items-center gap-3">
//           <Clock className="h-6 w-6 text-purple-400" />
//           <div>
//             <span className="text-xs text-purple-300/70">Your Time</span>
//             <div className="flex items-center gap-2">
//               <span className="text-xl font-bold text-purple-200 font-mono">
//                 {formatTimeInTimezone(currentTime, teacherTz, "HH:mm:ss")}
//               </span>
//               <span className="text-xs text-purple-400/80 font-mono">
//                 {getTimezoneAbbr(teacherTz)}
//               </span>
//             </div>
//           </div>
//         </div>
//         <div className="h-px bg-purple-900/60" />
//         <div className="flex items-center gap-3">
//           <Globe className="h-6 w-6 text-purple-400" />
//           <div>
//             <span className="text-xs text-purple-300/70">Student Time</span>
//             <div className="flex items-center gap-2">
//               <span className="text-xl font-bold text-purple-200 font-mono">
//                 {formatTimeInTimezone(currentTime, studentTz, "HH:mm:ss")}
//               </span>
//               <span className="text-xs text-purple-400/80 font-mono">
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

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black relative">
//       <div className="container mx-auto p-4">
//         <Button
//           variant="ghost"
//           onClick={() => router.back()}
//           className="text-purple-300"
//         >
//           Back
//         </Button>

//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//         >
//           <DualTimezoneDisplay />
//         </motion.div>

//         <Card className="mt-6 bg-gradient-to-br from-purple-950 to-black border-2 border-purple-800/30">
//           <CardHeader>
//             <div className="flex justify-between items-center">
//               <CardTitle className="flex items-center gap-3 text-2xl text-purple-200">
//                 <Video className="h-7 w-7 text-purple-400" />
//                 Lesson with {student.name || student.email.split("@")[0]}
//               </CardTitle>
//               <div className="flex gap-4 text-purple-200 font-mono">
//                 <span className="px-3 py-1 rounded-full bg-purple-900/50 shadow-lg shadow-purple-500/30 animate-pulse">
//                   Start: {lesson.time}
//                 </span>
//                 <span className="px-3 py-1 rounded-full bg-purple-900/50 shadow-lg shadow-purple-500/30 animate-pulse">
//                   End: {endTime}
//                 </span>
//               </div>
//             </div>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             {/* Student Info */}
//             <div className="flex items-center gap-4">
//               <Avatar className="h-16 w-16 border-2 border-purple-500">
//                 <AvatarImage src={student.imageUrl} />
//                 <AvatarFallback className="bg-purple-800 text-purple-100">
//                   {getInitials(student.name, student.email)}
//                 </AvatarFallback>
//               </Avatar>
//               <div>
//                 <p className="text-xl font-semibold text-purple-100">
//                   {student.name || "Student"}
//                 </p>
//                 <p className="text-purple-300">
//                   {student.instrument && `Learning ${student.instrument}`}
//                 </p>
//               </div>
//             </div>

//             {/* NEW: Student Information Section */}
//             <div className="space-y-3 pt-4 border-t border-purple-800/30">
//               <Label className="text-white">
//                 Student Information (By Teachers)
//               </Label>
//               {isTeacher ? (
//                 <>
//                   <Textarea
//                     value={studentContent}
//                     onChange={(e) => setStudentContent(e.target.value)}
//                     rows={5}
//                     className="bg-purple-900/20 border-purple-700 text-purple-200"
//                     placeholder="Write some basic knowledge of the student, e.g., preferred name, what they're interested in and any family background, etc. This is visible to all teachers."
//                   />
//                   <Button
//                     onClick={handleSaveStudentInfo}
//                     disabled={
//                       studentInfoSaving ||
//                       studentContent === (studentInfo?.content || "")
//                     }
//                   >
//                     {studentInfoSaving ? "Saving..." : "Save Student Info"}
//                   </Button>
//                 </>
//               ) : (
//                 studentInfo?.content && (
//                   <div className="mt-2 p-4 bg-purple-900/30 rounded-lg border border-purple-700">
//                     <p className="whitespace-pre-wrap text-purple-200">
//                       {studentInfo.content}
//                     </p>
//                   </div>
//                 )
//               )}
//             </div>

//             {/* Lesson Info */}
//             <div className="grid grid-cols-2 gap-4 text-purple-200">
//               <div>
//                 <Label>Date & Time</Label>
//                 <p className="font-semibold">
//                   {lessonDateTime ? format(lessonDateTime, "PPP p") : "N/A"}
//                 </p>
//               </div>
//               <div>
//                 <Label>Duration</Label>
//                 <p className="font-semibold">{lesson.duration} min</p>
//               </div>
//             </div>

//             {/* Current State */}
//             <div className="flex items-center gap-3 p-4 bg-purple-900/30 rounded-lg">
//               {stateIcons[lesson.state]}
//               <span className="text-lg font-medium text-purple-200">
//                 Status: {stateLabels[lesson.state]}
//               </span>
//             </div>

//             {/* Student WhatsApp – Visible ONLY to Teacher */}
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

//             {/* Teacher-only controls */}
//             {isTeacher && (
//               <div className="space-y-4">
//                 {lesson.state === "in_progress" && (
//                   <>
//                     <Button onClick={handleEnd} className="w-full bg-red-600">
//                       End Lesson
//                     </Button>
//                     <Select
//                       value={selectedStatus ?? ""}
//                       onValueChange={(v) =>
//                         setSelectedStatus(v as EndLessonStatus)
//                       }
//                     >
//                       <SelectTrigger>
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
//                       className="flex-1"
//                     >
//                       Mark Missed (Student)
//                     </Button>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* NEW: Cancel and Reschedule Buttons */}
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

//             {/* Book Section */}
//             <div className="space-y-4 pt-4 border-t border-purple-800/30">
//               <Label className="text-purple-300 text-lg">Assigned Book</Label>
//               {lesson.bookId ? (
//                 <div className="p-4 bg-purple-900/30 rounded-lg border border-purple-700/50 flex items-center justify-between">
//                   <div className="flex items-center gap-3">
//                     <BookOpen className="h-6 w-6 text-purple-400" />
//                     <div>
//                       <p className="font-semibold text-purple-200">
//                         {lesson.bookTitle || "Loading book..."}
//                       </p>
//                       {lesson.bookLevel && (
//                         <p className="text-sm text-purple-400">
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
//                       className="border-purple-600/50 text-purple-300"
//                     >
//                       Open PDF
//                     </Button>
//                   )}
//                 </div>
//               ) : (
//                 <div className="p-8 text-center bg-purple-900/20 rounded-lg border-2 border-dashed border-purple-700/50">
//                   <BookOpen className="h-12 w-12 mx-auto text-purple-500/50 mb-3" />
//                   <p className="text-purple-300/70">No book assigned yet</p>
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

//             {/* Outcome Selector (teacher only, before completion) */}
//             {isTeacher &&
//               !["completed", "missed_teacher", "missed_student"].includes(
//                 lesson.state,
//               ) && (
//                 <div>
//                   <Label>Lesson Outcome</Label>
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
//                     <SelectTrigger className="mt-2 bg-purple-900/30 border-purple-700 text-purple-200">
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

//             {/* Student sees current outcome */}
//             {!isTeacher && (
//               <div className="flex items-center gap-3">
//                 <div
//                   className={`h-4 w-4 rounded-full ${statusColors[currentStatus]}`}
//                 />
//                 <span className="text-lg font-medium text-purple-200">
//                   {statusLabels[currentStatus]}
//                 </span>
//               </div>
//             )}

//             {/* BIG ZOOM BUTTON - ONE BUTTON FOR BOTH ROLES */}
//             <div className="pt-6">
//               {zoomLink ? (
//                 <Button
//                   onClick={isTeacher ? handleStart : handleOpenZoom}
//                   size="lg"
//                   className="w-full bg-purple-700 hover:bg-purple-600 text-lg h-14"
//                   disabled={isTeacher && lesson.state !== "scheduled"}
//                 >
//                   <Video className="mr-3 h-6 w-6" />
//                   {isTeacher
//                     ? lesson.state === "in_progress"
//                       ? "Zoom Meeting Active"
//                       : "Start Zoom Meeting (at scheduled time)"
//                     : "Join Zoom Meeting"}
//                 </Button>
//               ) : (
//                 <p className="text-orange-400 text-center">
//                   No Zoom link set by teacher
//                 </p>
//               )}
//             </div>

//             {/* Notes */}
//             {isTeacher && (
//               <div className="space-y-3 pt-4 border-t border-purple-800/30">
//                 <Label className="text-white">
//                   Lesson Notes (visible to student)
//                 </Label>
//                 <Textarea
//                   value={notes}
//                   onChange={(e) => setNotes(e.target.value)}
//                   onBlur={handleSaveNotes}
//                   rows={5}
//                   className="bg-purple-900/20 border-purple-700 text-purple-200"
//                   placeholder="What was covered? Homework? Great job on scales today!"
//                 />
//                 <Button onClick={handleSaveNotes} disabled={isSaving}>
//                   {isSaving ? "Saving..." : "Save Notes"}
//                 </Button>
//               </div>
//             )}
//             {lesson.notes && !isTeacher && (
//               <div className="pt-4 border-t border-purple-800/30">
//                 <Label>Teacher&apos;s Message</Label>
//                 <div className="mt-2 p-4 bg-purple-900/30 rounded-lg border border-purple-700">
//                   <p className="whitespace-pre-wrap text-purple-200">
//                     {lesson.notes}
//                   </p>
//                 </div>
//               </div>
//             )}
//             {isStudent && lesson.state === "completed" && (
//               <div className="space-y-6 pt-4 border-t border-purple-800/30">
//                 {" "}
//                 {/* ← UPDATED: Increased space-y for better separation */}
//                 <Label className="text-white">
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
//                   <p className="text-purple-200">
//                     You rated this {existingRating.rating} stars. Thanks!
//                   </p>
//                 )}
//                 {/* ← NEW: Add thank you button here, after rating */}
//                 <ThankYouButton
//                   scheduleId={scheduleId}
//                   lessonId={lessonId}
//                   teacherId={lesson.teacherId}
//                   teacherName={teacher.name || teacher.email.split("@")[0]}
//                   lessonCompleted={lesson.state === "completed"}
//                 />
//               </div>
//             )}

//             {/* Tutor Memo Section */}
//             {isTeacher && (
//               <TutorMemoSection
//                 scheduleId={scheduleId}
//                 lessonId={lessonId}
//                 studentId={lesson.studentId}
//               />
//             )}
//           </CardContent>
//         </Card>
//       </div>
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
//             color="yellow-400"
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

  // ✅ NEW: Get lesson-specific memo for feedback
  const lessonMemo = useQuery(api.tutorsMemos.getByLesson, {
    scheduleId,
    lessonId,
  });

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

  // ✅ NEW: Feedback dialog state
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);

  // Student info states
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

  function calculateEndTime(startTime: string, duration: number): string {
    const [hours, minutes] = startTime.split(":").map(Number);
    const startDate = new Date(0, 0, 0, hours, minutes);
    startDate.setMinutes(startDate.getMinutes() + duration);
    const endHours = startDate.getHours().toString().padStart(2, "0");
    const endMinutes = startDate.getMinutes().toString().padStart(2, "0");
    return `${endHours}:${endMinutes}`;
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
      const errorMessage =
        err instanceof Error ? err.message : "Please refresh and try again.";
      toast.error("Failed to start lesson", {
        description: errorMessage,
      });
    }
  };

  // ✅ UPDATED: Handle end lesson and create memo if needed
  const handleEnd = async () => {
    try {
      const result = await endLessonMutation({
        scheduleId,
        lessonId,
        status: selectedStatus,
      });

      if (result.status === "completed") {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        toast.success("Fully completed! Well done!", {
          description: "Lesson ended on time. Great job!",
          duration: 5000,
        });
      } else {
        toast.success("Lesson ended!", {
          description: statusLabels[result.status],
        });
      }

      // ✅ Create lesson memo if it doesn't exist, then open feedback dialog
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

      // ✅ Open feedback dialog after ending lesson
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

  // ✅ NEW: Handle opening feedback dialog (also for "Give Feedback" button)
  const handleOpenFeedbackDialog = async () => {
    // Create memo if it doesn't exist
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
      <div className="flex flex-col gap-6 px-6 py-4 rounded-xl shadow-lg border border-purple-900/40 bg-[radial-gradient(circle_at_top_left,#1a001f,#000000)] backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Clock className="h-6 w-6 text-purple-400" />
          <div>
            <span className="text-xs text-purple-300/70">Your Time</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-purple-200 font-mono">
                {formatTimeInTimezone(currentTime, teacherTz, "HH:mm:ss")}
              </span>
              <span className="text-xs text-purple-400/80 font-mono">
                {getTimezoneAbbr(teacherTz)}
              </span>
            </div>
          </div>
        </div>
        <div className="h-px bg-purple-900/60" />
        <div className="flex items-center gap-3">
          <Globe className="h-6 w-6 text-purple-400" />
          <div>
            <span className="text-xs text-purple-300/70">Student Time</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-purple-200 font-mono">
                {formatTimeInTimezone(currentTime, studentTz, "HH:mm:ss")}
              </span>
              <span className="text-xs text-purple-400/80 font-mono">
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black relative">
      <div className="container mx-auto p-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-purple-300"
        >
          ← Back
        </Button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <DualTimezoneDisplay />
        </motion.div>

        <Card className="mt-6 bg-gradient-to-br from-purple-950 to-black border-2 border-purple-800/30">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-3 text-2xl text-purple-200">
                <Video className="h-7 w-7 text-purple-400" />
                Lesson with {student.name || student.email.split("@")[0]}
              </CardTitle>
              <div className="flex gap-4 text-purple-200 font-mono">
                <span className="px-3 py-1 rounded-full bg-purple-900/50 shadow-lg shadow-purple-500/30 animate-pulse">
                  Start: {lesson.time}
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-900/50 shadow-lg shadow-purple-500/30 animate-pulse">
                  End: {endTime}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Student Info */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-purple-500">
                <AvatarImage src={student.imageUrl} />
                <AvatarFallback className="bg-purple-800 text-purple-100">
                  {getInitials(student.name, student.email)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xl font-semibold text-purple-100">
                  {student.name || "Student"}
                </p>
                <p className="text-purple-300">
                  {student.instrument && `Learning ${student.instrument}`}
                </p>
              </div>
            </div>

            {/* Student Information Section */}
            <div className="space-y-3 pt-4 border-t border-purple-800/30">
              <Label className="text-white">
                Student Information (By Teachers)
              </Label>
              {isTeacher ? (
                <>
                  <Textarea
                    value={studentContent}
                    onChange={(e) => setStudentContent(e.target.value)}
                    rows={5}
                    className="bg-purple-900/20 border-purple-700 text-purple-200"
                    placeholder="Write some basic knowledge of the student, e.g., preferred name, what they're interested in and any family background, etc. This is visible to all teachers."
                  />
                  <Button
                    onClick={handleSaveStudentInfo}
                    disabled={
                      studentInfoSaving ||
                      studentContent === (studentInfo?.content || "")
                    }
                  >
                    {studentInfoSaving ? "Saving..." : "Save Student Info"}
                  </Button>
                </>
              ) : (
                studentInfo?.content && (
                  <div className="mt-2 p-4 bg-purple-900/30 rounded-lg border border-purple-700">
                    <p className="whitespace-pre-wrap text-purple-200">
                      {studentInfo.content}
                    </p>
                  </div>
                )
              )}
            </div>

            {/* Lesson Info */}
            <div className="grid grid-cols-2 gap-4 text-purple-200">
              <div>
                <Label>Date & Time</Label>
                <p className="font-semibold">
                  {lessonDateTime ? format(lessonDateTime, "PPP p") : "N/A"}
                </p>
              </div>
              <div>
                <Label>Duration</Label>
                <p className="font-semibold">{lesson.duration} min</p>
              </div>
            </div>

            {/* Current State */}
            <div className="flex items-center gap-3 p-4 bg-purple-900/30 rounded-lg">
              {stateIcons[lesson.state]}
              <span className="text-lg font-medium text-purple-200">
                Status: {stateLabels[lesson.state]}
              </span>
            </div>

            {/* Student WhatsApp – Visible ONLY to Teacher */}
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

            {/* Teacher-only controls */}
            {isTeacher && (
              <div className="space-y-4">
                {lesson.state === "in_progress" && (
                  <>
                    <Button onClick={handleEnd} className="w-full bg-red-600">
                      End Lesson
                    </Button>
                    <Select
                      value={selectedStatus ?? ""}
                      onValueChange={(v) =>
                        setSelectedStatus(v as EndLessonStatus)
                      }
                    >
                      <SelectTrigger>
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

                {/* ✅ NEW: Give Feedback button for completed lessons */}
                {lesson.state === "completed" && (
                  <Button
                    onClick={handleOpenFeedbackDialog}
                    className="w-full bg-purple-600 hover:bg-purple-700"
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
                      className="flex-1"
                    >
                      Mark Missed (Student)
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Cancel and Reschedule Buttons */}
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

            {/* Book Section */}
            <div className="space-y-4 pt-4 border-t border-purple-800/30">
              <Label className="text-purple-300 text-lg">Assigned Book</Label>
              {lesson.bookId ? (
                <div className="p-4 bg-purple-900/30 rounded-lg border border-purple-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-6 w-6 text-purple-400" />
                    <div>
                      <p className="font-semibold text-purple-200">
                        {lesson.bookTitle || "Loading book..."}
                      </p>
                      {lesson.bookLevel && (
                        <p className="text-sm text-purple-400">
                          Level {lesson.bookLevel} • {lesson.bookInstrument}
                        </p>
                      )}
                    </div>
                  </div>
                  {lesson.bookTitle && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        window.open(lesson.driveViewLink || "#", "_blank")
                      }
                      className="border-purple-600/50 text-purple-300"
                    >
                      Open PDF
                    </Button>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center bg-purple-900/20 rounded-lg border-2 border-dashed border-purple-700/50">
                  <BookOpen className="h-12 w-12 mx-auto text-purple-500/50 mb-3" />
                  <p className="text-purple-300/70">No book assigned yet</p>
                </div>
              )}
              {isTeacher && (
                <BookSelector
                  currentBookId={lesson.bookId}
                  scheduleId={scheduleId}
                  lessonId={lessonId}
                />
              )}
            </div>

            {/* Outcome Selector (teacher only, before completion) */}
            {isTeacher &&
              !["completed", "missed_teacher", "missed_student"].includes(
                lesson.state,
              ) && (
                <div>
                  <Label>Lesson Outcome</Label>
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
                    <SelectTrigger className="mt-2 bg-purple-900/30 border-purple-700 text-purple-200">
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

            {/* Student sees current outcome */}
            {!isTeacher && (
              <div className="flex items-center gap-3">
                <div
                  className={`h-4 w-4 rounded-full ${statusColors[currentStatus]}`}
                />
                <span className="text-lg font-medium text-purple-200">
                  {statusLabels[currentStatus]}
                </span>
              </div>
            )}

            {/* BIG ZOOM BUTTON - ONE BUTTON FOR BOTH ROLES */}
            <div className="pt-6">
              {zoomLink ? (
                <Button
                  onClick={isTeacher ? handleStart : handleOpenZoom}
                  size="lg"
                  className="w-full bg-purple-700 hover:bg-purple-600 text-lg h-14"
                  disabled={isTeacher && lesson.state !== "scheduled"}
                >
                  <Video className="mr-3 h-6 w-6" />
                  {isTeacher
                    ? lesson.state === "in_progress"
                      ? "Zoom Meeting Active"
                      : "Start Zoom Meeting (at scheduled time)"
                    : "Join Zoom Meeting"}
                </Button>
              ) : (
                <p className="text-orange-400 text-center">
                  No Zoom link set by teacher
                </p>
              )}
            </div>

            {/* Notes */}
            {isTeacher && (
              <div className="space-y-3 pt-4 border-t border-purple-800/30">
                <Label className="text-white">
                  Lesson Notes (visible to student)
                </Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={handleSaveNotes}
                  rows={5}
                  className="bg-purple-900/20 border-purple-700 text-purple-200"
                  placeholder="What was covered? Homework? Great job on scales today!"
                />
                <Button onClick={handleSaveNotes} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Notes"}
                </Button>
              </div>
            )}
            {lesson.notes && !isTeacher && (
              <div className="pt-4 border-t border-purple-800/30">
                <Label>Teacher&apos;s Message</Label>
                <div className="mt-2 p-4 bg-purple-900/30 rounded-lg border border-purple-700">
                  <p className="whitespace-pre-wrap text-purple-200">
                    {lesson.notes}
                  </p>
                </div>
              </div>
            )}

            {/* ✅ NEW: Student Feedback Display */}
            {isStudent &&
              lessonMemo &&
              (lessonMemo.nextLessonFocus ||
                lessonMemo.nextBookPageRef ||
                lessonMemo.nextPiece ||
                (lessonMemo.wentWell && lessonMemo.wentWell.length > 0) ||
                lessonMemo.skillRatings) && (
                <Card className="bg-gray-900/50 border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Teacher Feedback
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-gray-300">
                    {lessonMemo.nextLessonFocus && (
                      <div>
                        <Label className="text-gray-400">
                          Focus for Next Lesson
                        </Label>
                        <p className="text-white mt-1">
                          {lessonMemo.nextLessonFocus}
                        </p>
                      </div>
                    )}

                    {lessonMemo.nextBookPageRef && (
                      <div>
                        <Label className="text-gray-400">
                          Book / Page Reference
                        </Label>
                        <p className="text-white mt-1">
                          {lessonMemo.nextBookPageRef}
                        </p>
                      </div>
                    )}

                    {lessonMemo.nextPiece && (
                      <div>
                        <Label className="text-gray-400">
                          Next Piece / Exercise
                        </Label>
                        <p className="text-white mt-1">
                          {lessonMemo.nextPiece}
                        </p>
                      </div>
                    )}

                    {lessonMemo.wentWell && lessonMemo.wentWell.length > 0 && (
                      <div>
                        <Label className="text-gray-400">What Went Well</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {lessonMemo.wentWell.map((item, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-emerald-900/30 text-emerald-300 rounded-full text-sm"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {lessonMemo.skillRatings && (
                      <div>
                        <Label className="text-gray-400">Skill Ratings</Label>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          {Object.entries(lessonMemo.skillRatings)
                            .filter(([_, rating]) => rating)
                            .map(([skill, rating]) => (
                              <div
                                key={skill}
                                className="flex justify-between items-center"
                              >
                                <span className="capitalize text-gray-300">
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
                                      color="yellow"
                                    />
                                  ))}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

            {/* Student rating and thank you */}
            {isStudent && lesson.state === "completed" && (
              <div className="space-y-6 pt-4 border-t border-purple-800/30">
                <Label className="text-white">
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
                  <p className="text-purple-200">
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

            {/* Tutor Memo Section - Teacher Only */}
            {isTeacher && (
              <TutorMemoSection
                scheduleId={scheduleId}
                lessonId={lessonId}
                studentId={lesson.studentId}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* ✅ NEW: Feedback Dialog - Opens after ending lesson */}
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
            color="yellow-400"
          />
        </Button>
      ))}
    </div>
  );
}
