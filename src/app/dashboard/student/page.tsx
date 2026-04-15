// "use client";

// import { useQuery, useMutation } from "convex/react";
// import { useUser } from "@clerk/nextjs";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { format } from "date-fns";
// import { motion } from "framer-motion";
// import { Id, Doc } from "../../../../convex/_generated/dataModel";
// import { api } from "../../../../convex/_generated/api";
// import Link from "next/link";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import {
//   Loader2,
//   Video,
//   FileText,
//   ChevronLeft,
//   ChevronRight,
//   Calendar as CalendarIcon,
// } from "lucide-react";
// import LiveClock from "@/app/components/LiveClock";
// import { CurrentBookViewerPretty } from "@/app/components/CurrentBookViewerPretty";
// import { TeacherProfileCard } from "@/app/components/TeacherProfileCard";
// import { CancelLessonDialog } from "@/app/components/CancelLessonDialog";
// import { StudentRescheduleDialog } from "@/app/components/StudentRescheduleDialog";

// type LessonRow = {
//   scheduleId: Id<"schedules">;
//   lessonId: string;
//   date: string;
//   time: string;
//   duration: number;
//   teacherId: Id<"users">;
//   bookId?: Id<"books"> | null;
//   zoomLink?: string | undefined;
//   completed: boolean;
//   notes?: string | undefined;
//   startedAt?: number | undefined;
//   status:
//     | "completed"
//     | "finished_early"
//     | "no_answer_on_time"
//     | "teacher_late"
//     | "technical_difficulty"
//     | "teacher_never_called";
//   state:
//     | "scheduled"
//     | "in_progress"
//     | "completed"
//     | "missed_teacher"
//     | "missed_student";
// };

// export default function StudentDashboard() {
//   const router = useRouter();
//   const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
//   const currentUser = useQuery(api.users.get);

//   useEffect(() => {
//     if (currentUser && !currentUser.instrument) {
//       router.replace("/onboarding/student");
//     }
//   }, [currentUser, router]);

//   const lessons =
//     useQuery(
//       api.schedules.getByStudent,
//       currentUser ? { studentId: currentUser._id } : "skip",
//     ) ?? [];

//   const teachers =
//     useQuery(
//       api.users.getTeachersByInstrument,
//       currentUser?.instrument ? { instrument: currentUser.instrument } : "skip",
//     ) ?? [];

//   const setMyTeacher = useMutation(api.users.setMyTeacher);

//   const handleSetTeacher = async (teacherId?: Id<"users">) => {
//     await setMyTeacher(teacherId ? { teacherId } : {});
//   };

//   const [selectedDate, setSelectedDate] = useState<Date>(new Date());

//   // Navigate to previous/next day
//   const goToPreviousDay = () => {
//     setSelectedDate((prev) => {
//       const newDate = new Date(prev);
//       newDate.setDate(newDate.getDate() - 1);
//       return newDate;
//     });
//   };

//   const goToNextDay = () => {
//     setSelectedDate((prev) => {
//       const newDate = new Date(prev);
//       newDate.setDate(newDate.getDate() + 1);
//       return newDate;
//     });
//   };

//   const goToToday = () => {
//     setSelectedDate(new Date());
//   };

//   if (!clerkLoaded || currentUser === undefined) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-background">
//         <motion.div
//           animate={{ rotate: 360 }}
//           transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
//         >
//           <Loader2 className="h-12 w-12 text-purple-400" />
//         </motion.div>
//       </div>
//     );
//   }

//   if (!currentUser || currentUser.role !== "student") {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <motion.div
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           className="p-8 text-center text-red-400 bg-red-950/30 border-2 border-red-800/50 rounded-lg"
//         >
//           <p className="text-xl font-serif">Access denied - students only</p>
//         </motion.div>
//       </div>
//     );
//   }

//   // ✅ FIXED: Filter to show ONLY selected date's upcoming lessons
//   const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
//   const isToday = selectedDateStr === format(new Date(), "yyyy-MM-dd");
//   const upcomingLessons = lessons.filter(
//     (l: LessonRow) =>
//       l.date === selectedDateStr &&
//       (l.state === "scheduled" || l.state === "in_progress"),
//   );

//   const pastLessons = lessons.filter(
//     (l: LessonRow) =>
//       l.state === "completed" ||
//       l.state === "missed_teacher" ||
//       l.state === "missed_student",
//   );

//   return (
//     <div className="min-h-screen bg-background dark:bg-gradient-to-b dark:from-black dark:via-purple-950 dark:to-black">
//       <div className="container mx-auto p-6 max-w-7xl">
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="mb-6"
//         >
//           <LiveClock />
//         </motion.div>

//         <motion.h1
//           initial={{ opacity: 0, x: -30 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.8 }}
//           className="text-5xl font-bold mb-12 text-foreground dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-purple-200 dark:via-purple-400 dark:to-purple-200 font-serif"
//         >
//           Welcome back, {clerkUser?.firstName || "Student"}!
//         </motion.h1>

//         {/* Current Book Section */}
//         {currentUser.currentBookId ? (
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, delay: 0.2 }}
//           >
//             <Card className="mb-12 overflow-hidden shadow-lg border-2 border-border dark:border-purple-800/30 bg-card dark:bg-gradient-purple-to-black dark:shadow-purple-original">
//               <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent dark:bg-gradient-purple-header p-8 border-b border-border dark:border-purple-700/30 relative overflow-hidden">
//                 <motion.div
//                   animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.1, 1] }}
//                   transition={{
//                     duration: 6,
//                     repeat: Infinity,
//                     ease: "easeInOut",
//                   }}
//                   className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent"
//                 />
//                 <div className="flex items-center gap-6 relative z-10">
//                   <motion.div
//                     animate={{ y: [0, -8, 0] }}
//                     transition={{
//                       duration: 3,
//                       repeat: Infinity,
//                       ease: "easeInOut",
//                     }}
//                     className="bg-primary/10 dark:bg-purple-800/30 backdrop-blur-sm rounded-2xl p-6 border-2 border-primary/30 dark:border-purple-700/50 shadow-lg dark:shadow-purple-card"
//                   >
//                     <FileText className="h-16 w-16 text-primary dark:text-purple-300 dark:drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
//                   </motion.div>
//                   <div>
//                     <h2 className="text-4xl font-bold text-card-foreground dark:text-purple-100 font-serif">
//                       Your Current Book
//                     </h2>
//                     <p className="text-xl text-muted-foreground dark:text-purple-300/90 mt-2 font-serif italic">
//                       Open and practice anytime
//                     </p>
//                   </div>
//                 </div>
//               </div>
//               <CardContent className="pt-0 bg-gradient-to-b from-transparent to-muted/20 dark:to-black/50">
//                 <CurrentBookViewerPretty bookId={currentUser.currentBookId} />
//               </CardContent>
//             </Card>
//           </motion.div>
//         ) : (
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.8, delay: 0.2 }}
//           >
//             <Card className="mb-12 border-dashed border-4 border-muted dark:border-purple-700/50 bg-muted/30 dark:bg-purple-950/30 backdrop-blur-sm">
//               <CardContent className="pt-24 pb-24 text-center">
//                 <motion.div
//                   animate={{ y: [0, -10, 0], rotateY: [0, 5, -5, 0] }}
//                   transition={{
//                     duration: 4,
//                     repeat: Infinity,
//                     ease: "easeInOut",
//                   }}
//                   className="mx-auto w-32 h-40 bg-muted dark:bg-purple-900/50 rounded-2xl flex items-center justify-center mb-8 shadow-lg dark:shadow-purple-card border-2 border-border dark:border-purple-700/30"
//                 >
//                   <FileText className="h-20 w-20 text-muted-foreground dark:text-purple-400 opacity-60" />
//                 </motion.div>
//                 <p className="text-3xl font-bold text-foreground dark:text-purple-300 font-serif">
//                   No book assigned yet
//                 </p>
//                 <p className="text-xl text-muted-foreground dark:text-purple-400/80 mt-4 font-serif italic">
//                   Your teacher will choose your perfect book soon
//                 </p>
//               </CardContent>
//             </Card>
//           </motion.div>
//         )}

//         {/* Current Teacher Profile */}
//         <TeacherProfileCard teacherId={currentUser.currentTeacher} />

//         {/* Today's Upcoming Lessons */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6, delay: 0.4 }}
//         >
//           <Card className="mb-8 bg-card dark:bg-gradient-purple-to-black border-2 border-border dark:border-purple-800/30 shadow-lg dark:shadow-purple-card">
//             <CardHeader>
//               <div className="flex items-center justify-between mb-4">
//                 <CardTitle className="flex items-center gap-3 text-card-foreground dark:text-purple-200 font-serif text-2xl">
//                   <Video className="h-7 w-7 text-primary dark:text-purple-400" />
//                   Daily Schedule
//                 </CardTitle>
//                 {!isToday && (
//                   <Button
//                     onClick={goToToday}
//                     variant="outline"
//                     size="sm"
//                     className="gap-2 border-purple-600/50 text-purple-300 hover:bg-purple-900/30"
//                   >
//                     <CalendarIcon className="h-4 w-4" />
//                     Back to Today
//                   </Button>
//                 )}
//               </div>

//               {/* Date Navigation */}
//               <div className="flex items-center justify-between gap-4 p-4 bg-purple-900/20 rounded-lg border border-purple-700/50">
//                 <Button
//                   onClick={goToPreviousDay}
//                   variant="outline"
//                   size="sm"
//                   className="gap-2 border-purple-600/50 text-purple-300 hover:bg-purple-900/50"
//                 >
//                   <ChevronLeft className="h-4 w-4" />
//                   Previous Day
//                 </Button>

//                 <div className="text-center">
//                   <p className="text-2xl font-bold text-purple-100 font-serif">
//                     {format(selectedDate, "EEEE")}
//                   </p>
//                   <p className="text-lg text-purple-300">
//                     {format(selectedDate, "MMMM d, yyyy")}
//                   </p>
//                   {isToday && (
//                     <Badge className="mt-1 bg-green-500 text-white">
//                       Today
//                     </Badge>
//                   )}
//                 </div>

//                 <Button
//                   onClick={goToNextDay}
//                   variant="outline"
//                   size="sm"
//                   className="gap-2 border-purple-600/50 text-purple-300 hover:bg-purple-900/50"
//                 >
//                   Next Day
//                   <ChevronRight className="h-4 w-4" />
//                 </Button>
//               </div>

//               {upcomingLessons.length === 0 && (
//                 <CardDescription className="text-muted-foreground dark:text-purple-400/70 font-serif mt-4">
//                   No lessons scheduled for this day.
//                 </CardDescription>
//               )}
//             </CardHeader>
//             <CardContent>
//               <LessonsTable lessons={upcomingLessons} />
//             </CardContent>
//           </Card>
//         </motion.div>

//         {/* Past Lessons */}
//         {pastLessons.length > 0 && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6, delay: 0.5 }}
//           >
//             <Card className="mb-8 bg-card dark:bg-gradient-purple-to-black border-2 border-border dark:border-purple-800/30 shadow-lg dark:shadow-purple-card">
//               <CardHeader>
//                 <CardTitle className="text-card-foreground dark:text-purple-200 font-serif text-2xl">
//                   Past Lessons
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <LessonsTable lessons={pastLessons} />
//               </CardContent>
//             </Card>
//           </motion.div>
//         )}

//         {/* Teacher Selection */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6, delay: 0.6 }}
//         >
//           <Card className="bg-card dark:bg-gradient-purple-to-black border-2 border-border dark:border-purple-800/30 shadow-lg dark:shadow-purple-card">
//             <CardHeader>
//               <CardTitle className="text-card-foreground dark:text-purple-200 font-serif text-2xl">
//                 Choose / Change Preferred Teacher
//               </CardTitle>
//               <CardDescription className="text-muted-foreground dark:text-purple-400/70 font-serif">
//                 Pick any teacher who teaches {currentUser.instrument}.
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//               {teachers.map((teacher: Doc<"users">, index: number) => (
//                 <motion.div
//                   key={teacher._id}
//                   initial={{ opacity: 0, scale: 0.9 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   transition={{ delay: 0.7 + index * 0.1 }}
//                   whileHover={{ scale: 1.03, y: -3 }}
//                 >
//                   <Card className="p-4 bg-muted/50 dark:bg-purple-900/40 border border-border dark:border-purple-700/40 shadow dark:shadow-[0_0_20px_rgba(168,85,247,0.15)]">
//                     <div className="font-medium text-foreground dark:text-purple-200 font-serif">
//                       {teacher.email}
//                     </div>
//                     {currentUser.currentTeacher === teacher._id && (
//                       <Badge className="mt-2 bg-primary dark:bg-purple-700 text-primary-foreground dark:text-purple-100 border-primary dark:border-purple-600">
//                         Current teacher
//                       </Badge>
//                     )}
//                     <div className="mt-4 flex gap-2">
//                       <Button
//                         size="sm"
//                         className="flex-1 bg-primary hover:bg-primary/90 dark:bg-purple-700 dark:hover:bg-purple-600 text-primary-foreground dark:text-purple-50 border border-primary/50 dark:border-purple-600/50 shadow-lg dark:shadow-[0_0_15px_rgba(168,85,247,0.3)]"
//                         variant={
//                           currentUser.currentTeacher === teacher._id
//                             ? "secondary"
//                             : "default"
//                         }
//                         onClick={() => handleSetTeacher(teacher._id)}
//                         disabled={currentUser.currentTeacher === teacher._id}
//                       >
//                         {currentUser.currentTeacher === teacher._id
//                           ? "Selected"
//                           : "Choose"}
//                       </Button>
//                       {currentUser.currentTeacher === teacher._id && (
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           className="border-border dark:border-purple-600/50 text-foreground dark:text-purple-300 hover:bg-muted dark:hover:bg-purple-800/30"
//                           onClick={() => handleSetTeacher()}
//                         >
//                           Clear
//                         </Button>
//                       )}
//                     </div>
//                   </Card>
//                 </motion.div>
//               ))}
//               {teachers.length === 0 && (
//                 <p className="col-span-full text-center text-muted-foreground dark:text-purple-400/70 font-serif italic">
//                   No teachers available for {currentUser.instrument} yet.
//                 </p>
//               )}
//             </CardContent>
//           </Card>
//         </motion.div>
//       </div>
//     </div>
//   );
// }

// // Helper components remain the same
// function TeacherName({ id }: { id: Id<"users"> }) {
//   const teacher = useQuery(api.users.getById, { id });
//   return (
//     <span className="text-foreground dark:text-purple-300">
//       {teacher?.email ?? "Loading..."}
//     </span>
//   );
// }

// function BookTitle({ id }: { id: Id<"books"> | null | undefined }) {
//   const book = useQuery(api.books.getById, id ? { id } : "skip");
//   if (!id || !book) {
//     return (
//       <span className="text-muted-foreground dark:text-purple-400/50">---</span>
//     );
//   }
//   return (
//     <span className="text-foreground dark:text-purple-300">{book.title}</span>
//   );
// }

// function LessonsTable({ lessons }: { lessons: LessonRow[] }) {
//   const today = format(new Date(), "yyyy-MM-dd");

//   return (
//     <div className="rounded-lg border border-purple-800/30 overflow-hidden">
//       <Table>
//         <TableHeader>
//           <TableRow className="bg-purple-900/20 border-b border-purple-800/30">
//             <TableHead className="text-purple-300 font-serif">Date</TableHead>
//             <TableHead className="text-purple-300 font-serif">Time</TableHead>
//             <TableHead className="text-purple-300 font-serif">
//               Duration
//             </TableHead>
//             <TableHead className="text-purple-300 font-serif">
//               Teacher
//             </TableHead>
//             <TableHead className="text-purple-300 font-serif">Book</TableHead>
//             <TableHead className="text-purple-300 font-serif">Status</TableHead>
//             <TableHead className="text-purple-300 font-serif">
//               Actions
//             </TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {lessons.map((l, index) => {
//             const startMs = new Date(`${l.date}T${l.time}:00`).getTime();
//             const isUpcoming =
//               l.state === "scheduled" || l.state === "in_progress";

//             return (
//               <motion.tr
//                 key={`${l.scheduleId}-${l.time}`}
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: index * 0.05 }}
//                 className="border-b border-border dark:border-purple-800/20 hover:bg-muted/30 dark:hover:bg-purple-900/20"
//               >
//                 <TableCell className="text-foreground dark:text-purple-200 font-serif">
//                   {format(startMs, "PPP")}
//                 </TableCell>
//                 <TableCell className="text-foreground dark:text-purple-200 font-serif">
//                   {l.time}
//                 </TableCell>
//                 <TableCell className="text-foreground dark:text-purple-200 font-serif">
//                   {l.duration} min
//                 </TableCell>
//                 <TableCell>
//                   <TeacherName id={l.teacherId} />
//                 </TableCell>
//                 <TableCell>
//                   <BookTitle id={l.bookId} />
//                 </TableCell>
//                 <TableCell>
//                   {isUpcoming ? (
//                     <Badge
//                       variant="default"
//                       className="bg-primary dark:bg-purple-700 text-primary-foreground dark:text-purple-100"
//                     >
//                       {l.state === "scheduled" ? "Scheduled" : "In Progress"}
//                     </Badge>
//                   ) : (
//                     <div className="flex items-center gap-2">
//                       <div
//                         className={`h-3 w-3 rounded-full ${
//                           l.status === "completed"
//                             ? "bg-emerald-500"
//                             : l.status === "finished_early"
//                               ? "bg-yellow-500"
//                               : l.status === "no_answer_on_time"
//                                 ? "bg-red-500"
//                                 : l.status === "teacher_late"
//                                   ? "bg-orange-500"
//                                   : "bg-purple-500"
//                         }`}
//                       />
//                       <span className="text-purple-200 text-sm">
//                         {l.status === "completed"
//                           ? "Completed"
//                           : l.status === "finished_early"
//                             ? "Finished Early"
//                             : l.status === "no_answer_on_time"
//                               ? "No Answer"
//                               : l.status === "teacher_late"
//                                 ? "Teacher Late"
//                                 : "Technical Issue"}
//                       </span>
//                     </div>
//                   )}
//                 </TableCell>
//                 <TableCell>
//                   <div className="flex gap-2">
//                     {/* View Button */}
//                     <Button variant="link" size="sm" asChild>
//                       <Link
//                         href={`/dashboard/lesson/${l.scheduleId}/${l.lessonId}`}
//                       >
//                         {isUpcoming && l.state === "in_progress"
//                           ? "Join"
//                           : "View"}
//                       </Link>
//                     </Button>

//                     {/* Unified Reschedule Button */}
//                     {l.state === "scheduled" && (
//                       <StudentRescheduleDialog
//                         scheduleId={l.scheduleId}
//                         lessonId={l.lessonId}
//                         teacherId={l.teacherId}
//                         duration={l.duration}
//                         currentDate={l.date}
//                         currentTime={l.time}
//                       >
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           className="border-purple-600/50 text-purple-300 hover:bg-purple-900/30"
//                         >
//                           Reschedule
//                         </Button>
//                       </StudentRescheduleDialog>
//                     )}

//                     {/* Cancel Button */}
//                     {l.state === "scheduled" && (
//                       <CancelLessonDialog
//                         scheduleId={l.scheduleId}
//                         lessonId={l.lessonId}
//                         date={l.date}
//                         time={l.time}
//                         duration={l.duration}
//                         isStudent={true}
//                       />
//                     )}
//                   </div>
//                 </TableCell>
//               </motion.tr>
//             );
//           })}
//         </TableBody>
//       </Table>
//     </div>
//   );
// }

// "use client";

// import { useQuery, useMutation } from "convex/react";
// import { useUser } from "@clerk/nextjs";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { format } from "date-fns";
// import { motion } from "framer-motion";
// import { Id, Doc } from "../../../../convex/_generated/dataModel";
// import { api } from "../../../../convex/_generated/api";
// import Link from "next/link";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import {
//   Loader2,
//   Video,
//   FileText,
//   ChevronLeft,
//   ChevronRight,
//   Calendar as CalendarIcon,
//   Clock,
//   User,
//   BookOpen,
// } from "lucide-react";
// import LiveClock from "@/app/components/LiveClock";
// import { CurrentBookViewerPretty } from "@/app/components/CurrentBookViewerPretty";
// import { TeacherProfileCard } from "@/app/components/TeacherProfileCard";
// import { CancelLessonDialog } from "@/app/components/CancelLessonDialog";
// import { StudentRescheduleDialog } from "@/app/components/StudentRescheduleDialog";

// /* ─────────────────────────────────────────────
//    Global !important overrides
//    Light  = default (no prefix)
//    Dark   = .dark prefix
// ───────────────────────────────────────────── */
// const GLOBAL_STYLES = `
//   /* ── Date navigator strip ── */
//   .date-nav                   { background: hsl(270, 80%, 30%) !important; border-color: hsl(270, 70%, 40%) !important; }
//   .dark .date-nav             { background: rgba(76,29,149,0.2) !important; border-color: rgba(109,40,217,0.5) !important; }

//   /* nav buttons */
//   .date-nav-btn               { border-color: rgba(255,255,255,0.25) !important; color: #ffffff !important; background: rgba(255,255,255,0.08) !important; }
//   .date-nav-btn:hover         { background: rgba(255,255,255,0.18) !important; }
//   .dark .date-nav-btn         { border-color: rgba(124,58,237,0.5) !important; color: #c4b5fd !important; background: transparent !important; }
//   .dark .date-nav-btn:hover   { background: rgba(76,29,149,0.5) !important; }

//   /* nav text */
//   .date-nav-day               { color: #ffffff !important; }
//   .dark .date-nav-day         { color: #ede9fe !important; }
//   .date-nav-date              { color: rgba(255,255,255,0.75) !important; }
//   .dark .date-nav-date        { color: #c4b5fd !important; }

//   /* ── Teacher selection inner card ── */
//   .teacher-select-card              { background: #ffffff !important; border-color: hsl(var(--border)) !important; }
//   .dark .teacher-select-card        { background: rgba(76,29,149,0.4) !important; border-color: rgba(109,40,217,0.4) !important; }

//   /* ── Mobile lesson card header strip ── */
//   .lesson-card-header         { background: hsl(270, 80%, 30%) !important; border-bottom-color: hsl(270, 70%, 40%) !important; }
//   .dark .lesson-card-header   { background: rgba(76,29,149,0.4) !important; border-bottom-color: rgba(109,40,217,0.3) !important; }
//   .lesson-card-date           { color: #ffffff !important; }
//   .dark .lesson-card-date     { color: #ede9fe !important; }
// `;

// type LessonRow = {
//   scheduleId: Id<"schedules">;
//   lessonId: string;
//   date: string;
//   time: string;
//   duration: number;
//   teacherId: Id<"users">;
//   bookId?: Id<"books"> | null;
//   zoomLink?: string | undefined;
//   completed: boolean;
//   notes?: string | undefined;
//   startedAt?: number | undefined;
//   status:
//     | "completed"
//     | "finished_early"
//     | "no_answer_on_time"
//     | "teacher_late"
//     | "technical_difficulty"
//     | "teacher_never_called";
//   state:
//     | "scheduled"
//     | "in_progress"
//     | "completed"
//     | "missed_teacher"
//     | "missed_student";
// };

// export default function StudentDashboard() {
//   const router = useRouter();
//   const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
//   const currentUser = useQuery(api.users.get);

//   useEffect(() => {
//     if (currentUser && !currentUser.instrument) {
//       router.replace("/onboarding/student");
//     }
//   }, [currentUser, router]);

//   const lessons =
//     useQuery(
//       api.schedules.getByStudent,
//       currentUser ? { studentId: currentUser._id } : "skip",
//     ) ?? [];

//   const teachers =
//     useQuery(
//       api.users.getTeachersByInstrument,
//       currentUser?.instrument ? { instrument: currentUser.instrument } : "skip",
//     ) ?? [];

//       const allTeachers = useQuery(api.users.getAllTeachers) || [];
//   const allBooks = useQuery(api.books.getAll) || [];

//   const setMyTeacher = useMutation(api.users.setMyTeacher);

//   const handleSetTeacher = async (teacherId?: Id<"users">) => {
//     await setMyTeacher(teacherId ? { teacherId } : {});
//   };

//   const [selectedDate, setSelectedDate] = useState<Date>(new Date());

//   const goToPreviousDay = () => {
//     setSelectedDate((prev) => {
//       const d = new Date(prev);
//       d.setDate(d.getDate() - 1);
//       return d;
//     });
//   };

//   const goToNextDay = () => {
//     setSelectedDate((prev) => {
//       const d = new Date(prev);
//       d.setDate(d.getDate() + 1);
//       return d;
//     });
//   };

//   const goToToday = () => setSelectedDate(new Date());

//   if (!clerkLoaded || currentUser === undefined) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-background">
//         <motion.div
//           animate={{ rotate: 360 }}
//           transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
//         >
//           <Loader2 className="h-10 w-10 text-primary" />
//         </motion.div>
//       </div>
//     );
//   }

//   if (!currentUser || currentUser.role !== "student") {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center px-4">
//         <motion.div
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           className="p-6 text-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-2 border-red-300 dark:border-red-800/50 rounded-lg max-w-sm w-full"
//         >
//           <p className="text-lg font-serif">Access denied — students only</p>
//         </motion.div>
//       </div>
//     );
//   }

//   const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
//   const isToday = selectedDateStr === format(new Date(), "yyyy-MM-dd");

//   const upcomingLessons = lessons.filter(
//     (l: LessonRow) =>
//       l.date === selectedDateStr &&
//       (l.state === "scheduled" || l.state === "in_progress"),
//   );

//   const pastLessons = lessons.filter(
//     (l: LessonRow) =>
//       l.state === "completed" ||
//       l.state === "missed_teacher" ||
//       l.state === "missed_student",
//   );

//   return (
//     <div className="min-h-screen bg-background dark:bg-gradient-to-b dark:from-black dark:via-purple-950 dark:to-black">
//       <style>{GLOBAL_STYLES}</style>
//       <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-7xl">
//         {/* Live Clock */}
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="mb-4 sm:mb-6"
//         >
//           <LiveClock />
//         </motion.div>

//         {/* Page heading */}
//         <motion.h1
//           initial={{ opacity: 0, x: -30 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.8 }}
//           className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8 sm:mb-12 text-foreground dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-purple-200 dark:via-purple-400 dark:to-purple-200 font-serif leading-tight"
//         >
//           Welcome back,{" "}
//           <span className="block sm:inline">
//             {clerkUser?.firstName || "Student"}!
//           </span>
//         </motion.h1>

//         {/* ── Current Book ── */}
//         {currentUser.currentBookId ? (
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.8, delay: 0.2 }}
//           >
//             <Card className="mb-8 sm:mb-12 overflow-hidden shadow-lg border-2 border-border dark:border-purple-800/30 bg-card dark:bg-gradient-purple-to-black dark:shadow-purple-original">
//               <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent dark:bg-gradient-purple-header p-5 sm:p-8 border-b border-border dark:border-purple-700/30 relative overflow-hidden">
//                 <motion.div
//                   animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.1, 1] }}
//                   transition={{
//                     duration: 6,
//                     repeat: Infinity,
//                     ease: "easeInOut",
//                   }}
//                   className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent"
//                 />
//                 <div className="flex items-center gap-4 sm:gap-6 relative z-10">
//                   <motion.div
//                     animate={{ y: [0, -8, 0] }}
//                     transition={{
//                       duration: 3,
//                       repeat: Infinity,
//                       ease: "easeInOut",
//                     }}
//                     className="bg-primary/10 dark:bg-purple-800/30 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border-2 border-primary/30 dark:border-purple-700/50 shadow-lg dark:shadow-purple-card shrink-0"
//                   >
//                     <FileText className="h-10 w-10 sm:h-16 sm:w-16 text-primary dark:text-purple-300 dark:drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
//                   </motion.div>
//                   <div>
//                     <h2 className="text-2xl sm:text-4xl font-bold text-foreground dark:text-purple-100 font-serif">
//                       Your Current Book
//                     </h2>
//                     <p className="text-base sm:text-xl text-muted-foreground dark:text-purple-300/90 mt-1 sm:mt-2 font-serif italic">
//                       Open and practice anytime
//                     </p>
//                   </div>
//                 </div>
//               </div>
//               <CardContent className="pt-0 bg-gradient-to-b from-transparent to-muted/20 dark:to-black/50">
//                 <CurrentBookViewerPretty bookId={currentUser.currentBookId} />
//               </CardContent>
//             </Card>
//           </motion.div>
//         ) : (
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.8, delay: 0.2 }}
//           >
//             <Card className="mb-8 sm:mb-12 border-dashed border-4 border-border dark:border-purple-700/50 bg-muted/30 dark:bg-purple-950/30 backdrop-blur-sm">
//               <CardContent className="py-16 sm:py-24 text-center">
//                 <motion.div
//                   animate={{ y: [0, -10, 0], rotateY: [0, 5, -5, 0] }}
//                   transition={{
//                     duration: 4,
//                     repeat: Infinity,
//                     ease: "easeInOut",
//                   }}
//                   className="mx-auto w-24 h-32 sm:w-32 sm:h-40 bg-muted dark:bg-purple-900/50 rounded-2xl flex items-center justify-center mb-6 sm:mb-8 shadow-lg dark:shadow-purple-card border-2 border-border dark:border-purple-700/30"
//                 >
//                   <FileText className="h-14 w-14 sm:h-20 sm:w-20 text-muted-foreground dark:text-purple-400 opacity-60" />
//                 </motion.div>
//                 <p className="text-2xl sm:text-3xl font-bold text-foreground dark:text-purple-300 font-serif">
//                   No book assigned yet
//                 </p>
//                 <p className="text-base sm:text-xl text-muted-foreground dark:text-purple-400/80 mt-3 sm:mt-4 font-serif italic">
//                   Your teacher will choose your perfect book soon
//                 </p>
//               </CardContent>
//             </Card>
//           </motion.div>
//         )}

//         {/* Current Teacher Profile */}
//         <TeacherProfileCard teacherId={currentUser.currentTeacher} />

//         {/* ── Daily Schedule ── */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6, delay: 0.4 }}
//         >
//           <Card className="mb-6 sm:mb-8 bg-card dark:bg-gradient-purple-to-black border-2 border-border dark:border-purple-800/30 shadow-lg dark:shadow-purple-card">
//             <CardHeader className="pb-3 sm:pb-6">
//               <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2">
//                 <CardTitle className="flex items-center gap-2 sm:gap-3 text-foreground dark:text-purple-200 font-serif text-xl sm:text-2xl">
//                   <Video className="h-5 w-5 sm:h-7 sm:w-7 text-primary dark:text-purple-400 shrink-0" />
//                   Daily Schedule
//                 </CardTitle>
//                 {!isToday && (
//                   <Button
//                     onClick={goToToday}
//                     variant="outline"
//                     size="sm"
//                     className="gap-1.5 border-primary/40 text-primary hover:bg-primary/10 dark:border-purple-600/50 dark:text-purple-300 dark:hover:bg-purple-900/30 text-xs sm:text-sm"
//                   >
//                     <CalendarIcon className="h-3.5 w-3.5" />
//                     <span className="hidden xs:inline">Back to </span>Today
//                   </Button>
//                 )}
//               </div>

//               {/* Date navigator — deep purple in light, dark in dark via !important */}
//               <div className="date-nav flex items-center justify-between gap-2 p-3 sm:p-4 rounded-lg border">
//                 <Button
//                   onClick={goToPreviousDay}
//                   variant="outline"
//                   size="sm"
//                   className="date-nav-btn gap-1 sm:gap-2 px-2 sm:px-3"
//                 >
//                   <ChevronLeft className="h-4 w-4" />
//                   <span className="hidden sm:inline">Previous</span>
//                 </Button>

//                 <div className="text-center flex-1 min-w-0">
//                   <p className="date-nav-day text-lg sm:text-2xl font-bold font-serif truncate">
//                     {format(selectedDate, "EEEE")}
//                   </p>
//                   <p className="date-nav-date text-sm sm:text-lg truncate">
//                     {format(selectedDate, "MMM d, yyyy")}
//                   </p>
//                   {isToday && (
//                     <Badge className="mt-1 bg-green-600 dark:bg-green-500 text-white text-xs">
//                       Today
//                     </Badge>
//                   )}
//                 </div>

//                 <Button
//                   onClick={goToNextDay}
//                   variant="outline"
//                   size="sm"
//                   className="date-nav-btn gap-1 sm:gap-2 px-2 sm:px-3"
//                 >
//                   <span className="hidden sm:inline">Next</span>
//                   <ChevronRight className="h-4 w-4" />
//                 </Button>
//               </div>

//               {upcomingLessons.length === 0 && (
//                 <CardDescription className="text-muted-foreground dark:text-purple-400/70 font-serif mt-3 sm:mt-4 text-sm sm:text-base">
//                   No lessons scheduled for this day.
//                 </CardDescription>
//               )}
//             </CardHeader>
//             <CardContent className="px-3 sm:px-6">
//               <LessonsTable lessons={upcomingLessons} />
//             </CardContent>
//           </Card>
//         </motion.div>

//         {/* ── Past Lessons ── */}
//         {pastLessons.length > 0 && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6, delay: 0.5 }}
//           >
//             <Card className="mb-6 sm:mb-8 bg-card dark:bg-gradient-purple-to-black border-2 border-border dark:border-purple-800/30 shadow-lg dark:shadow-purple-card">
//               <CardHeader>
//                 <CardTitle className="text-foreground dark:text-purple-200 font-serif text-xl sm:text-2xl">
//                   Past Lessons
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="px-3 sm:px-6">
//                 <LessonsTable lessons={pastLessons} />
//               </CardContent>
//             </Card>
//           </motion.div>
//         )}

//         {/* ── Teacher Selection ── */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6, delay: 0.6 }}
//         >
//           <Card className="bg-card dark:bg-gradient-purple-to-black border-2 border-border dark:border-purple-800/30 shadow-lg dark:shadow-purple-card">
//             <CardHeader>
//               <CardTitle className="text-foreground dark:text-purple-200 font-serif text-xl sm:text-2xl">
//                 Choose / Change Preferred Teacher
//               </CardTitle>
//               <CardDescription className="text-muted-foreground dark:text-purple-400/70 font-serif text-sm sm:text-base">
//                 Pick any teacher who teaches {currentUser.instrument}.
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
//               {teachers.map((teacher: Doc<"users">, index: number) => (
//                 <motion.div
//                   key={teacher._id}
//                   initial={{ opacity: 0, scale: 0.9 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   transition={{ delay: 0.7 + index * 0.1 }}
//                   whileHover={{ scale: 1.02, y: -2 }}
//                 >
//                   <Card className="teacher-select-card p-4 border shadow dark:shadow-[0_0_20px_rgba(168,85,247,0.15)]">
//                     <div className="font-medium text-foreground dark:text-purple-200 font-serif text-sm sm:text-base truncate">
//                       {teacher.email}
//                     </div>
//                     {currentUser.currentTeacher === teacher._id && (
//                       <Badge className="mt-2 bg-primary text-primary-foreground dark:bg-purple-700 dark:text-purple-100 dark:border-purple-600 text-xs">
//                         Current teacher
//                       </Badge>
//                     )}
//                     <div className="mt-3 sm:mt-4 flex gap-2">
//                       <Button
//                         size="sm"
//                         className="flex-1 bg-primary hover:bg-primary/90 dark:bg-purple-700 dark:hover:bg-purple-600 text-primary-foreground dark:text-purple-50 border border-primary/50 dark:border-purple-600/50 text-xs sm:text-sm"
//                         variant={
//                           currentUser.currentTeacher === teacher._id
//                             ? "secondary"
//                             : "default"
//                         }
//                         onClick={() => handleSetTeacher(teacher._id)}
//                         disabled={currentUser.currentTeacher === teacher._id}
//                       >
//                         {currentUser.currentTeacher === teacher._id
//                           ? "Selected"
//                           : "Choose"}
//                       </Button>
//                       {currentUser.currentTeacher === teacher._id && (
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           className="border-border dark:border-purple-600/50 text-foreground dark:text-purple-300 hover:bg-muted dark:hover:bg-purple-800/30 text-xs sm:text-sm"
//                           onClick={() => handleSetTeacher()}
//                         >
//                           Clear
//                         </Button>
//                       )}
//                     </div>
//                   </Card>
//                 </motion.div>
//               ))}
//               {teachers.length === 0 && (
//                 <p className="col-span-full text-center text-muted-foreground dark:text-purple-400/70 font-serif italic text-sm sm:text-base">
//                   No teachers available for {currentUser.instrument} yet.
//                 </p>
//               )}
//             </CardContent>
//           </Card>
//         </motion.div>
//       </div>
//     </div>
//   );
// }

// // ── Helper: Teacher name ──────────────────────────────────────────────────────
// function TeacherName({ id }: { id: Id<"users"> }) {
//   const teacher = useQuery(api.users.getById, { id });
//   return (
//     <span className="text-foreground dark:text-purple-300 text-sm">
//       {teacher?.email ?? "Loading..."}
//     </span>
//   );
// }

// // ── Helper: Book title ────────────────────────────────────────────────────────
// function BookTitle({ id }: { id: Id<"books"> | null | undefined }) {
//   const book = useQuery(api.books.getById, id ? { id } : "skip");
//   if (!id || !book)
//     return (
//       <span className="text-muted-foreground dark:text-purple-400/50 text-sm">
//         ---
//       </span>
//     );
//   return (
//     <span className="text-foreground dark:text-purple-300 text-sm">
//       {book.title}
//     </span>
//   );
// }

// // ── Status metadata ───────────────────────────────────────────────────────────
// function getStatusMeta(status: LessonRow["status"]) {
//   switch (status) {
//     case "completed":
//       return { label: "Completed", color: "bg-emerald-500" };
//     case "finished_early":
//       return { label: "Finished Early", color: "bg-yellow-500" };
//     case "no_answer_on_time":
//       return { label: "No Answer", color: "bg-red-500" };
//     case "teacher_late":
//       return { label: "Teacher Late", color: "bg-orange-500" };
//     default:
//       return { label: "Technical Issue", color: "bg-purple-500" };
//   }
// }

// // ── Lessons Table — desktop table + mobile cards ──────────────────────────────
// function LessonsTable({ lessons }: { lessons: LessonRow[] }) {
//   if (lessons.length === 0) return null;

//   return (
//     <>
//       {/* ── DESKTOP table (md+) ── */}
//       <div className="hidden md:block rounded-lg border border-border dark:border-purple-800/30 overflow-hidden">
//         <table className="w-full text-sm">
//           <thead>
//             <tr className="bg-primary dark:bg-purple-900/40 border-b border-primary/20 dark:border-purple-800/30">
//               {[
//                 "Date",
//                 "Time",
//                 "Duration",
//                 "Teacher",
//                 "Book",
//                 "Status",
//                 "Actions",
//               ].map((h) => (
//                 <th
//                   key={h}
//                   className="px-4 py-3 text-left text-primary-foreground dark:text-purple-300 font-serif font-semibold whitespace-nowrap"
//                 >
//                   {h}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {lessons.map((l, index) => {
//               const startMs = new Date(`${l.date}T${l.time}:00`).getTime();
//               const isUpcoming =
//                 l.state === "scheduled" || l.state === "in_progress";
//               const { label, color } = getStatusMeta(l.status);

//               return (
//                 <motion.tr
//                   key={`${l.scheduleId}-${l.time}`}
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   transition={{ delay: index * 0.05 }}
//                   className="border-b border-border dark:border-purple-800/20 hover:bg-muted/40 dark:hover:bg-purple-900/20"
//                 >
//                   <td className="px-4 py-3 text-foreground dark:text-purple-200 font-serif whitespace-nowrap">
//                     {format(startMs, "PPP")}
//                   </td>
//                   <td className="px-4 py-3 text-foreground dark:text-purple-200 font-serif whitespace-nowrap">
//                     {l.time}
//                   </td>
//                   <td className="px-4 py-3 text-foreground dark:text-purple-200 font-serif whitespace-nowrap">
//                     {l.duration} min
//                   </td>
//                   <td className="px-4 py-3">
//                     <TeacherName id={l.teacherId} />
//                   </td>
//                   <td className="px-4 py-3">
//                     <BookTitle id={l.bookId} />
//                   </td>
//                   <td className="px-4 py-3">
//                     {isUpcoming ? (
//                       <Badge className="bg-primary text-primary-foreground dark:bg-purple-700 dark:text-purple-100 whitespace-nowrap">
//                         {l.state === "scheduled" ? "Scheduled" : "In Progress"}
//                       </Badge>
//                     ) : (
//                       <div className="flex items-center gap-2">
//                         <div
//                           className={`h-2.5 w-2.5 rounded-full shrink-0 ${color}`}
//                         />
//                         <span className="text-foreground dark:text-purple-200 font-medium whitespace-nowrap">
//                           {label}
//                         </span>
//                       </div>
//                     )}
//                   </td>
//                   <td className="px-4 py-3">
//                     <div className="flex gap-2 flex-wrap">
//                       <Button
//                         variant="link"
//                         size="sm"
//                         className="text-primary dark:text-purple-400 hover:text-primary/80 dark:hover:text-purple-300 p-0 h-auto"
//                         asChild
//                       >
//                         <Link
//                           href={`/dashboard/lesson/${l.scheduleId}/${l.lessonId}`}
//                         >
//                           {isUpcoming && l.state === "in_progress"
//                             ? "Join"
//                             : "View"}
//                         </Link>
//                       </Button>
//                       {l.state === "scheduled" && (
//                         <StudentRescheduleDialog
//                           scheduleId={l.scheduleId}
//                           lessonId={l.lessonId}
//                           teacherId={l.teacherId}
//                           duration={l.duration}
//                           currentDate={l.date}
//                           currentTime={l.time}
//                         >
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             className="border-primary/40 text-primary hover:bg-primary/10 dark:border-purple-600/50 dark:text-purple-300 dark:hover:bg-purple-900/30"
//                           >
//                             Reschedule
//                           </Button>
//                         </StudentRescheduleDialog>
//                       )}
//                       {l.state === "scheduled" && (
//                         <CancelLessonDialog
//                           scheduleId={l.scheduleId}
//                           lessonId={l.lessonId}
//                           date={l.date}
//                           time={l.time}
//                           duration={l.duration}
//                           isStudent={true}
//                         />
//                       )}
//                     </div>
//                   </td>
//                 </motion.tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>

//       {/* ── MOBILE: stacked lesson cards (below md) ── */}
//       <div className="md:hidden space-y-3">
//         {lessons.map((l, index) => {
//           const startMs = new Date(`${l.date}T${l.time}:00`).getTime();
//           const isUpcoming =
//             l.state === "scheduled" || l.state === "in_progress";
//           const { label, color } = getStatusMeta(l.status);

//           return (
//             <motion.div
//               key={`${l.scheduleId}-${l.time}-mobile`}
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: index * 0.05 }}
//               className="rounded-lg border border-border dark:border-purple-700/40 bg-card dark:bg-purple-900/20 overflow-hidden"
//             >
//               {/* Header strip — deep purple light, dark purple dark via !important */}
//               <div className="lesson-card-header flex items-center justify-between px-4 py-2.5 border-b">
//                 <span className="lesson-card-date font-serif font-semibold text-sm">
//                   {format(startMs, "EEE, MMM d yyyy")}
//                 </span>
//                 {isUpcoming ? (
//                   <Badge className="bg-primary text-primary-foreground dark:bg-purple-700 dark:text-purple-100 text-xs shrink-0">
//                     {l.state === "scheduled" ? "Scheduled" : "In Progress"}
//                   </Badge>
//                 ) : (
//                   <div className="flex items-center gap-1.5 shrink-0">
//                     <div className={`h-2 w-2 rounded-full ${color}`} />
//                     <span className="text-foreground dark:text-purple-200 text-xs font-medium">
//                       {label}
//                     </span>
//                   </div>
//                 )}
//               </div>

//               {/* Body */}
//               <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
//                 <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
//                   <Clock className="h-3.5 w-3.5 text-primary dark:text-purple-400 shrink-0" />
//                   <span className="text-foreground dark:text-purple-200 text-sm">
//                     {l.time} · {l.duration} min
//                   </span>
//                 </div>
//                 <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1 min-w-0">
//                   <User className="h-3.5 w-3.5 text-primary dark:text-purple-400 shrink-0" />
//                   <div className="min-w-0 truncate">
//                     <TeacherName id={l.teacherId} />
//                   </div>
//                 </div>
//                 {l.bookId && (
//                   <div className="flex items-center gap-1.5 col-span-2 min-w-0">
//                     <BookOpen className="h-3.5 w-3.5 text-primary dark:text-purple-400 shrink-0" />
//                     <div className="min-w-0 truncate">
//                       <BookTitle id={l.bookId} />
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Actions */}
//               <div className="px-4 pb-3 flex items-center gap-2 flex-wrap border-t border-border/50 dark:border-purple-800/20 pt-2.5">
//                 <Button
//                   variant="link"
//                   size="sm"
//                   className="text-primary dark:text-purple-400 hover:text-primary/80 dark:hover:text-purple-300 p-0 h-auto text-sm font-semibold"
//                   asChild
//                 >
//                   <Link
//                     href={`/dashboard/lesson/${l.scheduleId}/${l.lessonId}`}
//                   >
//                     {isUpcoming && l.state === "in_progress"
//                       ? "Join Now →"
//                       : "View →"}
//                   </Link>
//                 </Button>
//                 {l.state === "scheduled" && (
//                   <StudentRescheduleDialog
//                     scheduleId={l.scheduleId}
//                     lessonId={l.lessonId}
//                     teacherId={l.teacherId}
//                     duration={l.duration}
//                     currentDate={l.date}
//                     currentTime={l.time}
//                   >
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       className="border-primary/40 text-primary hover:bg-primary/10 dark:border-purple-600/50 dark:text-purple-300 dark:hover:bg-purple-900/30 text-xs h-7"
//                     >
//                       Reschedule
//                     </Button>
//                   </StudentRescheduleDialog>
//                 )}
//                 {l.state === "scheduled" && (
//                   <CancelLessonDialog
//                     scheduleId={l.scheduleId}
//                     lessonId={l.lessonId}
//                     date={l.date}
//                     time={l.time}
//                     duration={l.duration}
//                     isStudent={true}
//                   />
//                 )}
//               </div>
//             </motion.div>
//           );
//         })}
//       </div>
//     </>
//   );
// }
"use client";

import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Id, Doc } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Video,
  FileText,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  User,
  BookOpen,
} from "lucide-react";
import LiveClock from "@/app/components/LiveClock";
import { CurrentBookViewerPretty } from "@/app/components/CurrentBookViewerPretty";
import { TeacherProfileCard } from "@/app/components/TeacherProfileCard";
import { CancelLessonDialog } from "@/app/components/CancelLessonDialog";
import { StudentRescheduleDialog } from "@/app/components/StudentRescheduleDialog";
import { ScheduleDownloadButton } from "@/app/components/Scheduledownloadbutton";

const GLOBAL_STYLES = `
  .date-nav                   { background: hsl(270, 80%, 30%) !important; border-color: hsl(270, 70%, 40%) !important; }
  .dark .date-nav             { background: rgba(76,29,149,0.2) !important; border-color: rgba(109,40,217,0.5) !important; }
  .date-nav-btn               { border-color: rgba(255,255,255,0.25) !important; color: #ffffff !important; background: rgba(255,255,255,0.08) !important; }
  .date-nav-btn:hover         { background: rgba(255,255,255,0.18) !important; }
  .dark .date-nav-btn         { border-color: rgba(124,58,237,0.5) !important; color: #c4b5fd !important; background: transparent !important; }
  .dark .date-nav-btn:hover   { background: rgba(76,29,149,0.5) !important; }
  .date-nav-day               { color: #ffffff !important; }
  .dark .date-nav-day         { color: #ede9fe !important; }
  .date-nav-date              { color: rgba(255,255,255,0.75) !important; }
  .dark .date-nav-date        { color: #c4b5fd !important; }
  .teacher-select-card              { background: #ffffff !important; border-color: hsl(var(--border)) !important; }
  .dark .teacher-select-card        { background: rgba(76,29,149,0.4) !important; border-color: rgba(109,40,217,0.4) !important; }
  .lesson-card-header         { background: hsl(270, 80%, 30%) !important; border-bottom-color: hsl(270, 70%, 40%) !important; }
  .dark .lesson-card-header   { background: rgba(76,29,149,0.4) !important; border-bottom-color: rgba(109,40,217,0.3) !important; }
  .lesson-card-date           { color: #ffffff !important; }
  .dark .lesson-card-date     { color: #ede9fe !important; }
`;

type LessonRow = {
  scheduleId: Id<"schedules">;
  lessonId: string;
  date: string;
  time: string;
  duration: number;
  teacherId: Id<"users">;
  bookId?: Id<"books"> | null;
  zoomLink?: string;
  completed: boolean;
  notes?: string;
  startedAt?: number;
  status:
    | "completed"
    | "finished_early"
    | "no_answer_on_time"
    | "teacher_late"
    | "technical_difficulty"
    | "teacher_never_called";
  state:
    | "scheduled"
    | "in_progress"
    | "completed"
    | "missed_teacher"
    | "missed_student";
  scheduledTime: number;
};

export default function StudentDashboard() {
  const router = useRouter();
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const currentUser = useQuery(api.users.get);

  useEffect(() => {
    if (currentUser && !currentUser.instrument) {
      router.replace("/onboarding/student");
    }
  }, [currentUser, router]);

  const lessons =
    useQuery(
      api.schedules.getByStudent,
      currentUser ? { studentId: currentUser._id } : "skip",
    ) ?? [];

  const teachers =
    useQuery(
      api.users.getTeachersByInstrument,
      currentUser?.instrument ? { instrument: currentUser.instrument } : "skip",
    ) ?? [];

  const allTeachers = useQuery(api.users.getAllTeachers) || [];
  const allBooks = useQuery(api.books.getAll) || [];

  const studentSchedulesForDownload = lessons.reduce(
    (acc: Doc<"schedules">[], lesson: LessonRow) => {
      let schedule = acc.find((s) => s.date === lesson.date);
      if (!schedule) {
        schedule = {
          _id: lesson.scheduleId,
          _creationTime: lesson.scheduledTime,
          teacherId: lesson.teacherId,
          date: lesson.date,
          instrument: undefined,
          lessons: [],
        };
        acc.push(schedule);
      }

      schedule.lessons.push({
        lessonId: lesson.lessonId,
        studentId: currentUser!._id,
        time: lesson.time,
        duration: lesson.duration,
        bookId: lesson.bookId ?? null,
        zoomLink: lesson.zoomLink,
        completed: lesson.completed,
        notes: lesson.notes,
        scheduledTime: lesson.scheduledTime,
        status: lesson.status,
        state: lesson.state,
        startedAt: lesson.startedAt,
        endedAt: undefined,
        actualMinutes: undefined,
        onTime: undefined,
        joinedAt: undefined,
        markedBy: undefined,
        markedAt: undefined,
      });

      return acc;
    },
    [],
  );

  const setMyTeacher = useMutation(api.users.setMyTeacher);

  const handleSetTeacher = async (teacherId?: Id<"users">) => {
    await setMyTeacher(teacherId ? { teacherId } : {});
  };

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const goToPreviousDay = () => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 1);
      return d;
    });
  };

  const goToNextDay = () => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 1);
      return d;
    });
  };

  const goToToday = () => setSelectedDate(new Date());

  if (!clerkLoaded || currentUser === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-10 w-10 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "student") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 text-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-2 border-red-300 dark:border-red-800/50 rounded-lg max-w-sm w-full"
        >
          <p className="text-lg font-serif">Access denied — students only</p>
        </motion.div>
      </div>
    );
  }

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const isToday = selectedDateStr === format(new Date(), "yyyy-MM-dd");

  // FIXED: Show ALL lessons for the selected day (including missed)
  const dayLessons = lessons.filter(
    (l: LessonRow) => l.date === selectedDateStr,
  );

  const pastLessons = lessons.filter(
    (l: LessonRow) =>
      l.state === "completed" ||
      l.state === "missed_teacher" ||
      l.state === "missed_student",
  );

  return (
    <div className="min-h-screen bg-background dark:bg-gradient-to-b dark:from-black dark:via-purple-950 dark:to-black">
      <style>{GLOBAL_STYLES}</style>
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4 sm:mb-6"
        >
          <LiveClock />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8 sm:mb-12 text-foreground dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-purple-200 dark:via-purple-400 dark:to-purple-200 font-serif leading-tight"
        >
          Welcome back,{" "}
          <span className="block sm:inline">
            {clerkUser?.firstName || "Student"}!
          </span>
        </motion.h1>

        {/* Current Book Section */}
        {currentUser.currentBookId ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="mb-8 sm:mb-12 overflow-hidden shadow-lg border-2 border-border dark:border-purple-800/30 bg-card dark:bg-gradient-purple-to-black dark:shadow-purple-original">
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent dark:bg-gradient-purple-header p-5 sm:p-8 border-b border-border dark:border-purple-700/30 relative overflow-hidden">
                <motion.div
                  animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.1, 1] }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent"
                />
                <div className="flex items-center gap-4 sm:gap-6 relative z-10">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="bg-primary/10 dark:bg-purple-800/30 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border-2 border-primary/30 dark:border-purple-700/50 shadow-lg dark:shadow-purple-card shrink-0"
                  >
                    <FileText className="h-10 w-10 sm:h-16 sm:w-16 text-primary dark:text-purple-300 dark:drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl sm:text-4xl font-bold text-foreground dark:text-purple-100 font-serif">
                      Your Current Book
                    </h2>
                    <p className="text-base sm:text-xl text-muted-foreground dark:text-purple-300/90 mt-1 sm:mt-2 font-serif italic">
                      Open and practice anytime
                    </p>
                  </div>
                </div>
              </div>
              <CardContent className="pt-0 bg-gradient-to-b from-transparent to-muted/20 dark:to-black/50">
                <CurrentBookViewerPretty bookId={currentUser.currentBookId} />
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="mb-8 sm:mb-12 border-dashed border-4 border-border dark:border-purple-700/50 bg-muted/30 dark:bg-purple-950/30 backdrop-blur-sm">
              <CardContent className="py-16 sm:py-24 text-center">
                <motion.div
                  animate={{ y: [0, -10, 0], rotateY: [0, 5, -5, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="mx-auto w-24 h-32 sm:w-32 sm:h-40 bg-muted dark:bg-purple-900/50 rounded-2xl flex items-center justify-center mb-6 sm:mb-8 shadow-lg dark:shadow-purple-card border-2 border-border dark:border-purple-700/30"
                >
                  <FileText className="h-14 w-14 sm:h-20 sm:w-20 text-muted-foreground dark:text-purple-400 opacity-60" />
                </motion.div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground dark:text-purple-300 font-serif">
                  No book assigned yet
                </p>
                <p className="text-base sm:text-xl text-muted-foreground dark:text-purple-400/80 mt-3 sm:mt-4 font-serif italic">
                  Your teacher will choose your perfect book soon
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <TeacherProfileCard teacherId={currentUser.currentTeacher} />

        {/* Daily Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="mb-6 sm:mb-8 bg-card dark:bg-gradient-purple-to-black border-2 border-border dark:border-purple-800/30 shadow-lg dark:shadow-purple-card">
            <CardHeader className="pb-3 sm:pb-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-foreground dark:text-purple-200 font-serif text-xl sm:text-2xl">
                  <Video className="h-5 w-5 sm:h-7 sm:w-7 text-primary dark:text-purple-400 shrink-0" />
                  Daily Schedule
                </CardTitle>

                <div className="flex items-center gap-2 sm:gap-3">
                  <ScheduleDownloadButton
                    schedules={studentSchedulesForDownload}
                    teachers={allTeachers}
                    students={[currentUser]}
                    books={allBooks}
                    teacherId={null}
                    referenceDate={selectedDate}
                  />

                  {!isToday && (
                    <Button
                      onClick={goToToday}
                      variant="outline"
                      size="sm"
                      className="gap-1.5 border-primary/40 text-primary hover:bg-primary/10 dark:border-purple-600/50 dark:text-purple-300 dark:hover:bg-purple-900/30 text-xs sm:text-sm"
                    >
                      <CalendarIcon className="h-3.5 w-3.5" />
                      <span className="hidden xs:inline">Back to </span>Today
                    </Button>
                  )}
                </div>
              </div>

              <div className="date-nav flex items-center justify-between gap-2 p-3 sm:p-4 rounded-lg border">
                <Button
                  onClick={goToPreviousDay}
                  variant="outline"
                  size="sm"
                  className="date-nav-btn gap-1 sm:gap-2 px-2 sm:px-3"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>

                <div className="text-center flex-1 min-w-0">
                  <p className="date-nav-day text-lg sm:text-2xl font-bold font-serif truncate">
                    {format(selectedDate, "EEEE")}
                  </p>
                  <p className="date-nav-date text-sm sm:text-lg truncate">
                    {format(selectedDate, "MMM d, yyyy")}
                  </p>
                  {isToday && (
                    <Badge className="mt-1 bg-green-600 dark:bg-green-500 text-white text-xs">
                      Today
                    </Badge>
                  )}
                </div>

                <Button
                  onClick={goToNextDay}
                  variant="outline"
                  size="sm"
                  className="date-nav-btn gap-1 sm:gap-2 px-2 sm:px-3"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {dayLessons.length === 0 && (
                <CardDescription className="text-muted-foreground dark:text-purple-400/70 font-serif mt-3 sm:mt-4 text-sm sm:text-base">
                  No lessons scheduled for this day.
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <LessonsTable lessons={dayLessons} />
            </CardContent>
          </Card>
        </motion.div>

        {pastLessons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="mb-6 sm:mb-8 bg-card dark:bg-gradient-purple-to-black border-2 border-border dark:border-purple-800/30 shadow-lg dark:shadow-purple-card">
              <CardHeader>
                <CardTitle className="text-foreground dark:text-purple-200 font-serif text-xl sm:text-2xl">
                  Past Lessons
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                <LessonsTable lessons={pastLessons} />
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="bg-card dark:bg-gradient-purple-to-black border-2 border-border dark:border-purple-800/30 shadow-lg dark:shadow-purple-card">
            <CardHeader>
              <CardTitle className="text-foreground dark:text-purple-200 font-serif text-xl sm:text-2xl">
                Choose / Change Preferred Teacher
              </CardTitle>
              <CardDescription className="text-muted-foreground dark:text-purple-400/70 font-serif text-sm sm:text-base">
                Pick any teacher who teaches {currentUser.instrument}.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {teachers.map((teacher: Doc<"users">, index: number) => (
                <motion.div
                  key={teacher._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <Card className="teacher-select-card p-4 border shadow dark:shadow-[0_0_20px_rgba(168,85,247,0.15)]">
                    <div className="font-medium text-foreground dark:text-purple-200 font-serif text-sm sm:text-base truncate">
                      {teacher.email}
                    </div>
                    {currentUser.currentTeacher === teacher._id && (
                      <Badge className="mt-2 bg-primary text-primary-foreground dark:bg-purple-700 dark:text-purple-100 dark:border-purple-600 text-xs">
                        Current teacher
                      </Badge>
                    )}
                    <div className="mt-3 sm:mt-4 flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-primary hover:bg-primary/90 dark:bg-purple-700 dark:hover:bg-purple-600 text-primary-foreground dark:text-purple-50 border border-primary/50 dark:border-purple-600/50 text-xs sm:text-sm"
                        variant={
                          currentUser.currentTeacher === teacher._id
                            ? "secondary"
                            : "default"
                        }
                        onClick={() => handleSetTeacher(teacher._id)}
                        disabled={currentUser.currentTeacher === teacher._id}
                      >
                        {currentUser.currentTeacher === teacher._id
                          ? "Selected"
                          : "Choose"}
                      </Button>
                      {currentUser.currentTeacher === teacher._id && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-border dark:border-purple-600/50 text-foreground dark:text-purple-300 hover:bg-muted dark:hover:bg-purple-800/30 text-xs sm:text-sm"
                          onClick={() => handleSetTeacher()}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
              {teachers.length === 0 && (
                <p className="col-span-full text-center text-muted-foreground dark:text-purple-400/70 font-serif italic text-sm sm:text-base">
                  No teachers available for {currentUser.instrument} yet.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

/* ====================== Helper Components ====================== */

function TeacherName({ id }: { id: Id<"users"> }) {
  const teacher = useQuery(api.users.getById, { id });
  return (
    <span className="text-foreground dark:text-purple-300 text-sm">
      {teacher?.email ?? "Loading..."}
    </span>
  );
}

function BookTitle({ id }: { id: Id<"books"> | null | undefined }) {
  const book = useQuery(api.books.getById, id ? { id } : "skip");
  if (!id || !book)
    return (
      <span className="text-muted-foreground dark:text-purple-400/50 text-sm">
        ---
      </span>
    );
  return (
    <span className="text-foreground dark:text-purple-300 text-sm">
      {book.title}
    </span>
  );
}

function getStatusMeta(status: LessonRow["status"]) {
  switch (status) {
    case "completed":
      return { label: "Completed", color: "bg-emerald-500" };
    case "finished_early":
      return { label: "Finished Early", color: "bg-yellow-500" };
    case "no_answer_on_time":
      return { label: "No Answer", color: "bg-red-500" };
    case "teacher_late":
      return { label: "Teacher Late", color: "bg-orange-500" };
    default:
      return { label: "Technical Issue", color: "bg-purple-500" };
  }
}

function LessonsTable({ lessons }: { lessons: LessonRow[] }) {
  if (lessons.length === 0) return null;

  return (
    <>
      <div className="hidden md:block rounded-lg border border-border dark:border-purple-800/30 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-primary dark:bg-purple-900/40 border-b border-primary/20 dark:border-purple-800/30">
              {[
                "Date",
                "Time",
                "Duration",
                "Teacher",
                "Book",
                "Status",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-primary-foreground dark:text-purple-300 font-serif font-semibold whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lessons.map((l, index) => {
              const startMs = new Date(`${l.date}T${l.time}:00`).getTime();
              const { label, color } = getStatusMeta(l.status);

              return (
                <motion.tr
                  key={`${l.scheduleId}-${l.time}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-border dark:border-purple-800/20 hover:bg-muted/40 dark:hover:bg-purple-900/20"
                >
                  <td className="px-4 py-3 text-foreground dark:text-purple-200 font-serif whitespace-nowrap">
                    {format(startMs, "PPP")}
                  </td>
                  <td className="px-4 py-3 text-foreground dark:text-purple-200 font-serif whitespace-nowrap">
                    {l.time}
                  </td>
                  <td className="px-4 py-3 text-foreground dark:text-purple-200 font-serif whitespace-nowrap">
                    {l.duration} min
                  </td>
                  <td className="px-4 py-3">
                    <TeacherName id={l.teacherId} />
                  </td>
                  <td className="px-4 py-3">
                    <BookTitle id={l.bookId} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2.5 w-2.5 rounded-full shrink-0 ${color}`}
                      />
                      <span className="text-foreground dark:text-purple-200 font-medium whitespace-nowrap">
                        {label}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="link"
                        size="sm"
                        className="text-primary dark:text-purple-400 hover:text-primary/80 dark:hover:text-purple-300 p-0 h-auto"
                        asChild
                      >
                        <Link
                          href={`/dashboard/lesson/${l.scheduleId}/${l.lessonId}`}
                        >
                          View
                        </Link>
                      </Button>
                      {l.state === "scheduled" && (
                        <>
                          <StudentRescheduleDialog
                            scheduleId={l.scheduleId}
                            lessonId={l.lessonId}
                            teacherId={l.teacherId}
                            duration={l.duration}
                            currentDate={l.date}
                            currentTime={l.time}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-primary/40 text-primary hover:bg-primary/10 dark:border-purple-600/50 dark:text-purple-300 dark:hover:bg-purple-900/30"
                            >
                              Reschedule
                            </Button>
                          </StudentRescheduleDialog>
                          <CancelLessonDialog
                            scheduleId={l.scheduleId}
                            lessonId={l.lessonId}
                            date={l.date}
                            time={l.time}
                            duration={l.duration}
                            isStudent={true}
                          />
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {lessons.map((l, index) => {
          const startMs = new Date(`${l.date}T${l.time}:00`).getTime();
          const { label, color } = getStatusMeta(l.status);

          return (
            <motion.div
              key={`${l.scheduleId}-${l.time}-mobile`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-lg border border-border dark:border-purple-700/40 bg-card dark:bg-purple-900/20 overflow-hidden"
            >
              <div className="lesson-card-header flex items-center justify-between px-4 py-2.5 border-b">
                <span className="lesson-card-date font-serif font-semibold text-sm">
                  {format(startMs, "EEE, MMM d yyyy")}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className={`h-2 w-2 rounded-full ${color}`} />
                  <span className="text-foreground dark:text-purple-200 text-xs font-medium">
                    {label}
                  </span>
                </div>
              </div>

              <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
                <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
                  <Clock className="h-3.5 w-3.5 text-primary dark:text-purple-400 shrink-0" />
                  <span className="text-foreground dark:text-purple-200 text-sm">
                    {l.time} · {l.duration} min
                  </span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1 min-w-0">
                  <User className="h-3.5 w-3.5 text-primary dark:text-purple-400 shrink-0" />
                  <div className="min-w-0 truncate">
                    <TeacherName id={l.teacherId} />
                  </div>
                </div>
                {l.bookId && (
                  <div className="flex items-center gap-1.5 col-span-2 min-w-0">
                    <BookOpen className="h-3.5 w-3.5 text-primary dark:text-purple-400 shrink-0" />
                    <div className="min-w-0 truncate">
                      <BookTitle id={l.bookId} />
                    </div>
                  </div>
                )}
              </div>

              <div className="px-4 pb-3 flex items-center gap-2 flex-wrap border-t border-border/50 dark:border-purple-800/20 pt-2.5">
                <Button
                  variant="link"
                  size="sm"
                  className="text-primary dark:text-purple-400 hover:text-primary/80 dark:hover:text-purple-300 p-0 h-auto text-sm font-semibold"
                  asChild
                >
                  <Link
                    href={`/dashboard/lesson/${l.scheduleId}/${l.lessonId}`}
                  >
                    View Details
                  </Link>
                </Button>
                {l.state === "scheduled" && (
                  <>
                    <StudentRescheduleDialog
                      scheduleId={l.scheduleId}
                      lessonId={l.lessonId}
                      teacherId={l.teacherId}
                      duration={l.duration}
                      currentDate={l.date}
                      currentTime={l.time}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-primary/40 text-primary hover:bg-primary/10 dark:border-purple-600/50 dark:text-purple-300 dark:hover:bg-purple-900/30 text-xs h-7"
                      >
                        Reschedule
                      </Button>
                    </StudentRescheduleDialog>
                    <CancelLessonDialog
                      scheduleId={l.scheduleId}
                      lessonId={l.lessonId}
                      date={l.date}
                      time={l.time}
                      duration={l.duration}
                      isStudent={true}
                    />
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}
