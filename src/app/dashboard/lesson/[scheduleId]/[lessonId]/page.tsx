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
// import { Loader2, Video, User, Clock, Globe } from "lucide-react";
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

// type NewLessonStatus =
//   | "completed"
//   | "finished_early"
//   | "na"
//   | "teacher_late"
//   | "technical_difficulty";

// const statusLabels: Record<NewLessonStatus, string> = {
//   completed: "Completed (Full Pay)",
//   finished_early: "Finished Early (70%)",
//   na: "No Answer (-$5)",
//   teacher_late: "I Was Late (-$5)",
//   technical_difficulty: "Technical Issue (Full Pay)",
// };

// const statusColors: Record<NewLessonStatus, string> = {
//   completed: "bg-emerald-500",
//   finished_early: "bg-yellow-500",
//   na: "bg-red-500",
//   teacher_late: "bg-orange-500",
//   technical_difficulty: "bg-purple-500",
// };

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

//   const [notes, setNotes] = useState("");
//   const [isSaving, setIsSaving] = useState(false);
//   const [currentTime, setCurrentTime] = useState(new Date());

//   useEffect(() => {
//     const timer = setInterval(() => setCurrentTime(new Date()), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   useEffect(() => {
//     if (lesson?.notes) setNotes(lesson.notes || "");
//   }, [lesson?.notes]);

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

//   const isTeacher = user?.unsafeMetadata?.role === "teacher";
//   const zoomLink = teacher.zoomLink || lesson.zoomLink;
//   const lessonDateTime = new Date(`${lesson.date}T${lesson.time}:00`);
//   const isLessonTime = Date.now() >= lessonDateTime.getTime() - 5 * 60 * 1000;

//   // SAFE: Only teachers can save data
//   const handleStartMeeting = async () => {
//     if (!zoomLink) {
//       toast.error("No Zoom link configured.");
//       return;
//     }

//     // ONLY TEACHER: Save teacher's personal Zoom link to this lesson (first time only)
//     if (isTeacher && !lesson.zoomLink && teacher.zoomLink) {
//       try {
//         await updateLesson({
//           scheduleId,
//           lessonId,
//           updates: { zoomLink: teacher.zoomLink },
//         });
//       } catch (err) {
//         console.warn("Could not save Zoom link (non-critical)", err);
//         // Don't block joining!
//       }
//     }

//     // BOTH teacher and student can open the meeting
//     window.open(zoomLink, "_blank", "noopener,noreferrer");
//     toast.success(isTeacher ? "Meeting started!" : "Joining lesson...");
//   };

//   const handleSaveNotes = async () => {
//     if (!isTeacher) return; // Safety
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

//   const getInitials = (name?: string, email?: string) => {
//     if (name)
//       return name
//         .split(" ")
//         .map((n) => n[0])
//         .join("")
//         .substring(0, 2)
//         .toUpperCase();
//     return email?.substring(0, 2).toUpperCase() || "ST";
//   };

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

//   const currentStatus = (lesson.status || "na") as NewLessonStatus;

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black">
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
//             <CardTitle className="flex items-center gap-3 text-2xl text-purple-200">
//               <Video className="h-7 w-7 text-purple-400" />
//               Lesson with {student.name || student.email.split("@")[0]}
//             </CardTitle>
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

//             {/* Lesson Info */}
//             <div className="grid grid-cols-2 gap-4 text-purple-200">
//               <div>
//                 <Label>Date & Time</Label>
//                 <p className="font-semibold">
//                   {format(lessonDateTime, "PPP p")}
//                 </p>
//               </div>
//               <div>
//                 <Label>Duration</Label>
//                 <p className="font-semibold">{lesson.duration} min</p>
//               </div>
//             </div>

//             {/* Status Selector — ONLY TEACHER */}
//             {isTeacher && (
//               <div>
//                 <Label>Lesson Outcome</Label>
//                 <Select
//                   value={currentStatus}
//                   onValueChange={async (value) => {
//                     await updateLesson({
//                       scheduleId,
//                       lessonId,
//                       updates: { status: value as NewLessonStatus },
//                     });
//                     toast.success("Status updated");
//                   }}
//                 >
//                   <SelectTrigger className="mt-2 bg-purple-900/30 border-purple-700 text-purple-200">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {Object.entries(statusLabels).map(([value, label]) => (
//                       <SelectItem key={value} value={value}>
//                         <div className="flex items-center gap-3">
//                           <div
//                             className={`h-3 w-3 rounded-full ${statusColors[value as NewLessonStatus]}`}
//                           />
//                           {label}
//                         </div>
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>

//                 {lesson.actualStartTime && (
//                   <p className="text-xs text-purple-400 mt-2">
//                     Started at: {format(new Date(lesson.actualStartTime), "p")}
//                     {currentStatus === "teacher_late" && " (marked late)"}
//                   </p>
//                 )}
//               </div>
//             )}

//             {/* Student sees read-only status */}
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

//             {/* Zoom Button */}
//             <div className="pt-4 border-t border-purple-800/30">
//               {zoomLink ? (
//                 <Button
//                   onClick={handleStartMeeting}
//                   size="lg"
//                   className="w-full bg-purple-700 hover:bg-purple-600"
//                   disabled={!isLessonTime && isTeacher}
//                 >
//                   <Video className="mr-2" />
//                   {isTeacher ? "Start Zoom Meeting" : "Join Meeting"}
//                 </Button>
//               ) : (
//                 <p className="text-orange-400">No Zoom link set</p>
//               )}
//             </div>

//             {/* Teacher Notes */}
//             {isTeacher && (
//               <div className="space-y-3">
//                 <Label>Lesson Notes (visible to student)</Label>
//                 <Textarea
//                   value={notes}
//                   onChange={(e) => setNotes(e.target.value)}
//                   rows={5}
//                   className="bg-purple-900/20 border-purple-700 text-purple-200"
//                   placeholder="What was covered? Homework? Great job on scales today!"
//                 />
//                 <Button onClick={handleSaveNotes} disabled={isSaving}>
//                   {isSaving ? "Saving..." : "Save Notes"}
//                 </Button>
//               </div>
//             )}

//             {/* Student sees teacher notes */}
//             {lesson.notes && !isTeacher && (
//               <div>
//                 <Label>Teacher&apos;s Message</Label>
//                 <div className="mt-2 p-4 bg-purple-900/30 rounded-lg border border-purple-700">
//                   <p className="whitespace-pre-wrap text-purple-200">
//                     {lesson.notes}
//                   </p>
//                 </div>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }

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
//   CheckCircle,
//   AlertCircle,
//   PlayCircle,
//   StopCircle,
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
// import { Badge } from "@/components/ui/badge";
// // ← Make sure this path is correct!

// type NewLessonStatus =
//   | "completed"
//   | "finished_early"
//   | "na"
//   | "teacher_late"
//   | "technical_difficulty";

// type EndLessonStatus = Exclude<NewLessonStatus, "na">;

// const statusLabels: Record<NewLessonStatus, string> = {
//   completed: "Completed (Full Pay)",
//   finished_early: "Finished Early (70%)",
//   na: "No Answer (-$5)",
//   teacher_late: "I Was Late (-$5)",
//   technical_difficulty: "Technical Issue (Full Pay)",
// };

// const statusColors: Record<NewLessonStatus, string> = {
//   completed: "bg-emerald-500",
//   finished_early: "bg-yellow-500",
//   na: "bg-red-500",
//   teacher_late: "bg-orange-500",
//   technical_difficulty: "bg-purple-500",
// };

// const stateIcons = {
//   scheduled: <Clock className="h-5 w-5 text-blue-400" />,
//   teacher_ready: <CheckCircle className="h-5 w-5 text-green-400" />,
//   in_progress: <PlayCircle className="h-5 w-5 text-yellow-400" />,
//   completed: <StopCircle className="h-5 w-5 text-emerald-400" />,
//   missed_teacher: <AlertCircle className="h-5 w-5 text-red-400" />,
//   missed_student: <AlertCircle className="h-5 w-5 text-orange-400" />,
// };

// const stateLabels = {
//   scheduled: "Scheduled",
//   teacher_ready: "Ready to Start",
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
//     lesson?.teacherId ? { id: lesson.teacherId } : "skip"
//   );
//   const student = useQuery(
//     api.users.getById,
//     lesson?.studentId ? { id: lesson.studentId } : "skip"
//   );

//   const updateLesson = useMutation(api.schedules.updateLesson);
//   const prepareLessonMutation = useMutation(api.schedules.prepareLesson); // NEW: Import for prepare
//   const startLessonMutation = useMutation(api.schedules.startLesson);
//   const endLessonMutation = useMutation(api.schedules.endLesson);
//   const studentJoinMutation = useMutation(api.schedules.studentJoin); // NEW: Import for student join
//   const markMissedMutation = useMutation(api.schedules.markMissed); // NEW: Import for missed

//   const [notes, setNotes] = useState("");
//   const [isSaving, setIsSaving] = useState(false);
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const [selectedStatus, setSelectedStatus] = useState<
//     EndLessonStatus | undefined
//   >(undefined);

//   const isTeacher = user?.unsafeMetadata?.role === "teacher";
//   const isStudent = user?.unsafeMetadata?.role === "student";
//   const zoomLink = teacher?.zoomLink || lesson?.zoomLink;
//   const lessonDateTime = lesson
//     ? new Date(`${lesson.date}T${lesson.time}:00`)
//     : null;
//   const isLessonTime = lessonDateTime
//     ? Date.now() >= lessonDateTime.getTime() - 5 * 60 * 1000
//     : false;

//   useEffect(() => {
//     const timer = setInterval(() => setCurrentTime(new Date()), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   useEffect(() => {
//     if (lesson?.notes) setNotes(lesson.notes || "");
//   }, [lesson?.notes]);

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

//   const handlePrepare = async () => {
//     try {
//       await prepareLessonMutation({ scheduleId, lessonId });
//       toast.success("Lesson prepared!");
//     } catch (err) {
//       toast.error("Failed to prepare lesson");
//     }
//   };

//   const handleStart = async () => {
//     try {
//       await startLessonMutation({ scheduleId, lessonId });
//       toast.success("Lesson started!");
//       await handleStartMeeting();
//     } catch (err) {
//       toast.error("Failed to start lesson");
//     }
//   };

//   const handleEnd = async () => {
//     try {
//       await endLessonMutation({ scheduleId, lessonId, status: selectedStatus });
//       toast.success("Lesson ended!");
//     } catch (err) {
//       toast.error("Failed to end lesson");
//     }
//   };

//   const handleJoin = async () => {
//     // UPDATED: Now calls studentJoin before opening Zoom
//     try {
//       await studentJoinMutation({ scheduleId, lessonId });
//       toast.success("Joined lesson!");
//       await handleStartMeeting();
//     } catch (err) {
//       toast.error("Failed to join lesson");
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

//   const handleStartMeeting = async () => {
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
//     toast.success(isTeacher ? "Meeting started!" : "Joining lesson...");
//   };

//   const handleSaveNotes = async () => {
//     // UPDATED: Add auto-save on blur if changed
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
//     // UNCHANGED
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

//   const currentStatus = (lesson.status || "na") as NewLessonStatus;

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black">
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
//             <CardTitle className="flex items-center gap-3 text-2xl text-purple-200">
//               <Video className="h-7 w-7 text-purple-400" />
//               Lesson with {student.name || student.email.split("@")[0]}
//             </CardTitle>
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
//             {/* Current State Display */}
//             <div className="flex items-center gap-3 p-4 bg-purple-900/30 rounded-lg">
//               {stateIcons[lesson.state]}
//               <span className="text-lg font-medium text-purple-200">
//                 Status: {stateLabels[lesson.state]}
//               </span>
//               {lesson.joinedAt &&
//                 isTeacher && ( // NEW: Show if student joined (teacher view)
//                   <Badge variant="secondary">Student Joined</Badge>
//                 )}
//             </div>
//             {/* State Machine Buttons for Teacher */}
//             {isTeacher && (
//               <div className="space-y-4">
//                 {lesson.state === "scheduled" && (
//                   <Button onClick={handlePrepare} className="w-full">
//                     Prepare Lesson
//                   </Button>
//                 )}
//                 {(lesson.state === "scheduled" ||
//                   lesson.state === "teacher_ready") &&
//                   isLessonTime && (
//                     <Button
//                       onClick={handleStart}
//                       className="w-full bg-green-600"
//                     >
//                       Start Lesson
//                     </Button>
//                   )}
//                 {lesson.state === "in_progress" && (
//                   <>
//                     <Button onClick={handleEnd} className="w-full bg-red-600">
//                       End Lesson
//                     </Button>
//                     {/* Optional status for end */}
//                     <Select
//                       value={selectedStatus ?? ""}
//                       onValueChange={(value) =>
//                         setSelectedStatus(value as EndLessonStatus)
//                       }
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select end status" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {Object.entries(statusLabels)
//                           .filter(([value]) => value !== "na")
//                           .map(([value, label]) => (
//                             <SelectItem key={value} value={value}>
//                               {label}
//                             </SelectItem>
//                           ))}
//                       </SelectContent>
//                     </Select>
//                   </>
//                 )}
//                 {/* Mark Missed Buttons */}
//                 {["scheduled", "teacher_ready", "in_progress"].includes(
//                   lesson.state
//                 ) && (
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
//             {/* Join Button for Student */}
//             {isStudent &&
//               lesson.state === "in_progress" &&
//               !lesson.joinedAt && (
//                 <Button onClick={handleJoin} className="w-full bg-blue-600">
//                   Join Lesson
//                 </Button>
//               )}
//             {/* ========== BOOK SECTION — THE STAR OF THE SHOW ========== */}
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
//               {/* BOOK SELECTOR — Only for teachers */}
//               {isTeacher && (
//                 <BookSelector
//                   currentBookId={lesson.bookId}
//                   scheduleId={scheduleId}
//                   lessonId={lessonId}
//                 />
//               )}
//             </div>
//             {/* Status Selector */}
//             {isTeacher &&
//               !["completed", "missed_teacher", "missed_student"].includes(
//                 lesson.state
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
//                       toast.success("Status updated");
//                     }}
//                   >
//                     <SelectTrigger className="mt-2 bg-purple-900/30 border-purple-700 text-purple-200">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {Object.entries(statusLabels)
//                         .filter(([value]) => value !== "na")
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
//             {/* Student sees status */}
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
//             {/* Zoom Button */}
//             <div className="pt-4 border-t border-purple-800/30">
//               {zoomLink ? (
//                 <Button
//                   onClick={handleStartMeeting}
//                   size="lg"
//                   className="w-full bg-purple-700 hover:bg-purple-600"
//                   disabled={!isLessonTime && isTeacher}
//                 >
//                   <Video className="mr-2" />
//                   {isTeacher ? "Start Zoom Meeting" : "Join Meeting"}
//                 </Button>
//               ) : (
//                 <p className="text-orange-400">No Zoom link set</p>
//               )}
//             </div>
//             {/* Notes */}
//             {isTeacher && (
//               <div className="space-y-3">
//                 <Label>Lesson Notes (visible to student)</Label>
//                 <Textarea
//                   value={notes}
//                   onChange={(e) => setNotes(e.target.value)}
//                   onBlur={handleSaveNotes} // NEW: Auto-save on blur
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
//               <div>
//                 <Label>Teacher&apos;s Message</Label>
//                 <div className="mt-2 p-4 bg-purple-900/30 rounded-lg border border-purple-700">
//                   <p className="whitespace-pre-wrap text-purple-200">
//                     {lesson.notes}
//                   </p>
//                 </div>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
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
//   CheckCircle,
//   AlertCircle,
//   PlayCircle,
//   StopCircle,
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
// import { Badge } from "@/components/ui/badge";

// type NewLessonStatus =
//   | "completed"
//   | "finished_early"
//   | "na"
//   | "teacher_late"
//   | "technical_difficulty";

// type EndLessonStatus = Exclude<NewLessonStatus, "na">;

// const statusLabels: Record<NewLessonStatus, string> = {
//   completed: "Completed (Full Pay)",
//   finished_early: "Finished Early (70%)",
//   na: "No Answer (-$5)",
//   teacher_late: "I Was Late (-$5)",
//   technical_difficulty: "Technical Issue (Full Pay)",
// };

// const statusColors: Record<NewLessonStatus, string> = {
//   completed: "bg-emerald-500",
//   finished_early: "bg-yellow-500",
//   na: "bg-red-500",
//   teacher_late: "bg-orange-500",
//   technical_difficulty: "bg-purple-500",
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
//     lesson?.teacherId ? { id: lesson.teacherId } : "skip"
//   );
//   const student = useQuery(
//     api.users.getById,
//     lesson?.studentId ? { id: lesson.studentId } : "skip"
//   );

//   const updateLesson = useMutation(api.schedules.updateLesson);
//   const startLessonMutation = useMutation(api.schedules.startLesson);
//   const endLessonMutation = useMutation(api.schedules.endLesson);
//   const studentJoinMutation = useMutation(api.schedules.studentJoin);
//   const markMissedMutation = useMutation(api.schedules.markMissed);

//   const [notes, setNotes] = useState("");
//   const [isSaving, setIsSaving] = useState(false);
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const [selectedStatus, setSelectedStatus] = useState<
//     EndLessonStatus | undefined
//   >(undefined);

//   const isTeacher = user?.unsafeMetadata?.role === "teacher";
//   const isStudent = user?.unsafeMetadata?.role === "student";
//   const zoomLink = teacher?.zoomLink || lesson?.zoomLink;
//   const lessonDateTime = lesson
//     ? new Date(`${lesson.date}T${lesson.time}:00`)
//     : null;
//   const isLessonTime = lessonDateTime
//     ? Date.now() >= lessonDateTime.getTime() - 5 * 60 * 1000
//     : false;

//   useEffect(() => {
//     const timer = setInterval(() => setCurrentTime(new Date()), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   useEffect(() => {
//     if (lesson?.notes) setNotes(lesson.notes || "");
//   }, [lesson?.notes]);

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

//   const handleStart = async () => {
//     // Check if lesson is in the correct state before attempting to start
//     if (lesson.state !== "scheduled") {
//       toast.info(
//         `This lesson is already ${stateLabels[lesson.state].toLowerCase()}`,
//         {
//           description: "You can only start lessons that are scheduled.",
//         }
//       );
//       return;
//     }

//     try {
//       await startLessonMutation({ scheduleId, lessonId });
//       toast.success("Lesson started!");
//       await handleStartMeeting();
//     } catch (err: unknown) {
//       // Handle the error gracefully with a toast
//       const errorMessage =
//         err instanceof Error ? err.message : String(err);
//       if (errorMessage.includes("can only be started from scheduled state")) {
//         toast.info("This lesson has already been started or completed", {
//           description: "Please refresh the page to see the current status.",
//         });
//       } else {
//         toast.error("Failed to start lesson");
//       }
//     }
//   };

//   const handleEnd = async () => {
//     try {
//       await endLessonMutation({ scheduleId, lessonId, status: selectedStatus });
//       toast.success("Lesson ended!");
//     } catch (err) {
//       toast.error("Failed to end lesson");
//     }
//   };

//   const handleJoin = async () => {
//     try {
//       await studentJoinMutation({ scheduleId, lessonId });
//       toast.success("Joined lesson!");
//       await handleStartMeeting();
//     } catch (err) {
//       toast.error("Failed to join lesson");
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

//   const handleStartMeeting = async () => {
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
//     toast.success(isTeacher ? "Meeting started!" : "Joining lesson...");
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

//   const currentStatus = (lesson.status || "na") as NewLessonStatus;

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black">
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
//             <CardTitle className="flex items-center gap-3 text-2xl text-purple-200">
//               <Video className="h-7 w-7 text-purple-400" />
//               Lesson with {student.name || student.email.split("@")[0]}
//             </CardTitle>
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
//             {/* Current State Display */}
//             <div className="flex items-center gap-3 p-4 bg-purple-900/30 rounded-lg">
//               {stateIcons[lesson.state]}
//               <span className="text-lg font-medium text-purple-200">
//                 Status: {stateLabels[lesson.state]}
//               </span>
//               {lesson.joinedAt && isTeacher && (
//                 <Badge variant="secondary">Student Joined</Badge>
//               )}
//             </div>
//             {/* State Machine Buttons for Teacher */}
//             {isTeacher && (
//               <div className="space-y-4">
//                 {lesson.state === "scheduled" && isLessonTime && (
//                   <Button onClick={handleStart} className="w-full bg-green-600">
//                     Start Zoom Meeting
//                   </Button>
//                 )}
//                 {lesson.state === "in_progress" && (
//                   <>
//                     <Button onClick={handleEnd} className="w-full bg-red-600">
//                       End Lesson
//                     </Button>
//                     {/* Optional override status for end (e.g., for technical_difficulty) */}
//                     <Select
//                       value={selectedStatus ?? ""}
//                       onValueChange={(value) =>
//                         setSelectedStatus(value as EndLessonStatus)
//                       }
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Optional: Override end status" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {Object.entries(statusLabels)
//                           .filter(([value]) => value !== "na")
//                           .map(([value, label]) => (
//                             <SelectItem key={value} value={value}>
//                               {label}
//                             </SelectItem>
//                           ))}
//                       </SelectContent>
//                     </Select>
//                   </>
//                 )}
//                 {/* Mark Missed Buttons */}
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
//             {/* ========== BOOK SECTION ========== */}
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
//               {/* BOOK SELECTOR — Only for teachers */}
//               {isTeacher && (
//                 <BookSelector
//                   currentBookId={lesson.bookId}
//                   scheduleId={scheduleId}
//                   lessonId={lessonId}
//                 />
//               )}
//             </div>
//             {/* Status Selector */}
//             {isTeacher &&
//               !["completed", "missed_teacher", "missed_student"].includes(
//                 lesson.state
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
//                       toast.success("Status updated");
//                     }}
//                   >
//                     <SelectTrigger className="mt-2 bg-purple-900/30 border-purple-700 text-purple-200">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {Object.entries(statusLabels)
//                         .filter(([value]) => value !== "na")
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
//             {/* Student sees status */}
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
//             {/* Zoom Button - Purple button at bottom for both teacher and student */}
//             <div className="pt-4 border-t border-purple-800/30">
//               {zoomLink ? (
//                 <Button
//                   onClick={isTeacher ? handleStart : handleJoin}
//                   size="lg"
//                   className="w-full bg-purple-700 hover:bg-purple-600"
//                   disabled={!isLessonTime && isTeacher}
//                 >
//                   <Video className="mr-2" />
//                   {isTeacher ? "Start Zoom Meeting" : "Join Meeting"}
//                 </Button>
//               ) : (
//                 <p className="text-orange-400">No Zoom link set</p>
//               )}
//             </div>
//             {/* Notes */}
//             {isTeacher && (
//               <div className="space-y-3">
//                 <Label>Lesson Notes (visible to student)</Label>
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
//               <div>
//                 <Label>Teacher&apos;s Message</Label>
//                 <div className="mt-2 p-4 bg-purple-900/30 rounded-lg border border-purple-700">
//                   <p className="whitespace-pre-wrap text-purple-200">
//                     {lesson.notes}
//                   </p>
//                 </div>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
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

// type NewLessonStatus =
//   | "completed"
//   | "finished_early"
//   | "na"
//   | "teacher_late"
//   | "technical_difficulty";

// type EndLessonStatus = Exclude<NewLessonStatus, "na">;

// const statusLabels: Record<NewLessonStatus, string> = {
//   completed: "Completed (Full Pay)",
//   finished_early: "Finished Early (70%)",
//   na: "No Answer (-$5)",
//   teacher_late: "I Was Late (-$5)",
//   technical_difficulty: "Technical Issue (Full Pay)",
// };

// const statusColors: Record<NewLessonStatus, string> = {
//   completed: "bg-emerald-500",
//   finished_early: "bg-yellow-500",
//   na: "bg-red-500",
//   teacher_late: "bg-orange-500",
//   technical_difficulty: "bg-purple-500",
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
//     lesson?.teacherId ? { id: lesson.teacherId } : "skip"
//   );
//   const student = useQuery(
//     api.users.getById,
//     lesson?.studentId ? { id: lesson.studentId } : "skip"
//   );

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
//         }
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
//       await endLessonMutation({ scheduleId, lessonId, status: selectedStatus });
//       toast.success("Lesson ended!");
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

//   const currentStatus = (lesson.status || "na") as NewLessonStatus;

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black">
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
//                           .filter(([v]) => v !== "na")
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
//                 lesson.state
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
//                         .filter(([v]) => v !== "na")
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
//                 <Label>Lesson Notes (visible to student)</Label>
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
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }

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
// } from "lucide-react";
// import { useState, useEffect, useRef } from "react"; // Added useRef
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

// type NewLessonStatus =
//   | "completed"
//   | "finished_early"
//   | "na"
//   | "teacher_late"
//   | "technical_difficulty";

// type EndLessonStatus = Exclude<NewLessonStatus, "na">;

// const statusLabels: Record<NewLessonStatus, string> = {
//   completed: "Completed (Full Pay)",
//   finished_early: "Finished Early (70%)",
//   na: "No Answer (-$5)",
//   teacher_late: "I Was Late (-$5)",
//   technical_difficulty: "Technical Issue (Full Pay)",
// };

// const statusColors: Record<NewLessonStatus, string> = {
//   completed: "bg-emerald-500",
//   finished_early: "bg-yellow-500",
//   na: "bg-red-500",
//   teacher_late: "bg-orange-500",
//   technical_difficulty: "bg-purple-500",
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
//     lesson?.teacherId ? { id: lesson.teacherId } : "skip"
//   );
//   const student = useQuery(
//     api.users.getById,
//     lesson?.studentId ? { id: lesson.studentId } : "skip"
//   );

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
//         }
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

//   // In handleEnd:
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

//   // Remove the Confetti component from JSX

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

//   const currentStatus = (lesson.status || "na") as NewLessonStatus;

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black relative">
//       {/* Add Confetti component */}
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
//                           .filter(([v]) => v !== "na")
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
//                 lesson.state
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
//                         .filter(([v]) => v !== "na")
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
//                 <Label>Lesson Notes (visible to student)</Label>
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
//           </CardContent>
//         </Card>
//       </div>
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

  const updateLesson = useMutation(api.schedules.updateLesson);
  const startLessonMutation = useMutation(api.schedules.startLesson);
  const endLessonMutation = useMutation(api.schedules.endLesson);
  const markMissedMutation = useMutation(api.schedules.markMissed);

  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedStatus, setSelectedStatus] = useState<
    EndLessonStatus | undefined
  >(undefined);

  const isTeacher = user?.unsafeMetadata?.role === "teacher";
  const isStudent = user?.unsafeMetadata?.role === "student";
  const zoomLink = teacher?.zoomLink || lesson?.zoomLink;

  const lessonDateTime = lesson
    ? new Date(`${lesson.date}T${lesson.time}:00`)
    : null;

  // Allow teacher to start from exactly the scheduled time (no early starts)
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

    // Save teacher's personal Zoom link to the lesson if not already set
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black relative">
      <div className="container mx-auto p-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-purple-300"
        >
          Back
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

            {/* Tutor Memo Section */}
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
    </div>
  );
}
