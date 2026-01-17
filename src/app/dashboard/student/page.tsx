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
// import { Loader2, Video, FileText, Trash2 } from "lucide-react";
// import LiveClock from "@/app/components/LiveClock";
// import { CurrentBookViewerPretty } from "@/app/components/CurrentBookViewerPretty";
// import { toast } from "sonner";
// import { TeacherProfileCard } from "@/app/components/TeacherProfileCard";

// // FINAL FIXED TYPE — This is the only one you need
// type LessonRow = {
//   scheduleId: Id<"schedules">;
//   lessonId: string;
//   date: string;
//   time: string;
//   duration: number;
//   teacherId: Id<"users">;
//   bookId?: Id<"books"> | null; // Optional + allows null
//   zoomLink?: string | undefined;
//   completed: boolean;
//   notes?: string | undefined;
//   actualStartTime?: number | undefined;
//   status:
//     | "completed"
//     | "finished_early"
//     | "na"
//     | "teacher_late"
//     | "technical_difficulty";
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
//       currentUser ? { studentId: currentUser._id } : "skip"
//     ) ?? [];

//   const teachers =
//     useQuery(
//       api.users.getTeachersByInstrument,
//       currentUser?.instrument ? { instrument: currentUser.instrument } : "skip"
//     ) ?? [];

//   const setMyTeacher = useMutation(api.users.setMyTeacher);

//   const handleSetTeacher = async (teacherId?: Id<"users">) => {
//     await setMyTeacher(teacherId ? { teacherId } : {});
//   };

//   const [now] = useState<number>(() => Date.now());

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
//           <p className="text-xl font-serif">Access denied — students only</p>
//         </motion.div>
//       </div>
//     );
//   }

//   // These now work perfectly — no more TS errors
//   const upcomingLessons = lessons.filter(
//     (l: LessonRow) =>
//       new Date(`${l.date}T${l.time}:00`).getTime() >= now - 5 * 60 * 1000
//   );

//   const pastLessons = lessons.filter(
//     (l: LessonRow) => new Date(`${l.date}T${l.time}:00`).getTime() < now
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

//         {/* Profile Card */}
//         {/* Beautiful Full Teacher Profile Card */}
//         <TeacherProfileCard teacherId={currentUser.currentTeacher} />
//         {/* Upcoming Lessons */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6, delay: 0.4 }}
//         >
//           <Card className="mb-8 bg-card dark:bg-gradient-purple-to-black border-2 border-border dark:border-purple-800/30 shadow-lg dark:shadow-purple-card">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-3 text-card-foreground dark:text-purple-200 font-serif text-2xl">
//                 <Video className="h-7 w-7 text-primary dark:text-purple-400" />
//                 Upcoming Lessons
//               </CardTitle>
//               {upcomingLessons.length === 0 && (
//                 <CardDescription className="text-muted-foreground dark:text-purple-400/70 font-serif italic">
//                   No lessons scheduled yet.
//                 </CardDescription>
//               )}
//             </CardHeader>
//             <CardContent>
//               <LessonsTable lessons={upcomingLessons} now={now} />
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
//                 <LessonsTable lessons={pastLessons} now={now} />
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

// // Fixed helper components
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

// function LessonsTable({ lessons, now }: { lessons: LessonRow[]; now: number }) {
//   const deleteLesson = useMutation(api.schedules.deleteLesson);

//   const handleCancel = async (
//     scheduleId: Id<"schedules">,
//     lessonIndex: number
//   ) => {
//     if (!confirm("Are you sure you want to cancel this lesson?")) return;

//     try {
//       await deleteLesson({ scheduleId, lessonIndex });
//       toast.success("Lesson cancelled successfully");
//     } catch {
//       toast.error("Failed to cancel lesson");
//     }
//   };

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
//             const isUpcoming = startMs >= now - 5 * 60 * 1000;
//             const isPast = startMs < now - 60 * 60 * 1000;

//             const lessonIndex = lessons.findIndex(
//               (lesson) =>
//                 lesson.scheduleId === l.scheduleId && lesson.time === l.time
//             );

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
//                   <Badge
//                     variant={isUpcoming ? "default" : "secondary"}
//                     className={
//                       isUpcoming
//                         ? "bg-primary dark:bg-purple-700 text-primary-foreground dark:text-purple-100"
//                         : "bg-muted dark:bg-purple-800/50 text-foreground dark:text-purple-300"
//                     }
//                   >
//                     {isPast ? "Past" : isUpcoming ? "Upcoming" : "Soon"}
//                   </Badge>
//                 </TableCell>
//                 <TableCell className="flex gap-2">
//                   <Button
//                     variant="link"
//                     size="sm"
//                     className="text-primary hover:text-primary/80 dark:text-purple-400 dark:hover:text-purple-300"
//                     asChild
//                   >
//                     <Link
//                       href={`/dashboard/lesson/${l.scheduleId}/${l.lessonId}`}
//                     >
//                       Join / View
//                     </Link>
//                   </Button>

//                   {isUpcoming && !isPast && (
//                     <Button
//                       size="sm"
//                       variant="destructive"
//                       onClick={() => handleCancel(l.scheduleId, lessonIndex)}
//                       className="text-xs"
//                     >
//                       <Trash2 className="h-3 w-3 mr-1" />
//                       Cancel
//                     </Button>
//                   )}
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
// import { Loader2, Video, FileText, Trash2 } from "lucide-react";
// import LiveClock from "@/app/components/LiveClock";
// import { CurrentBookViewerPretty } from "@/app/components/CurrentBookViewerPretty";
// import { toast } from "sonner";
// import { TeacherProfileCard } from "@/app/components/TeacherProfileCard";

// // FINAL FIXED TYPE — This is the only one you need
// type LessonRow = {
//   scheduleId: Id<"schedules">;
//   lessonId: string;
//   date: string;
//   time: string;
//   duration: number;
//   teacherId: Id<"users">;
//   bookId?: Id<"books"> | null; // Optional + allows null
//   zoomLink?: string | undefined;
//   completed: boolean;
//   notes?: string | undefined;
//   actualStartTime?: number | undefined;
//   status:
//     | "completed"
//     | "finished_early"
//     | "na"
//     | "teacher_late"
//     | "technical_difficulty";
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
//       currentUser ? { studentId: currentUser._id } : "skip"
//     ) ?? [];

//   const teachers =
//     useQuery(
//       api.users.getTeachersByInstrument,
//       currentUser?.instrument ? { instrument: currentUser.instrument } : "skip"
//     ) ?? [];

//   const setMyTeacher = useMutation(api.users.setMyTeacher);

//   const handleSetTeacher = async (teacherId?: Id<"users">) => {
//     await setMyTeacher(teacherId ? { teacherId } : {});
//   };

//   const [now] = useState<number>(() => Date.now());

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
//           <p className="text-xl font-serif">Access denied — students only</p>
//         </motion.div>
//       </div>
//     );
//   }

//   // These now work perfectly — no more TS errors
//   const upcomingLessons = lessons.filter(
//     (l: LessonRow) =>
//       new Date(`${l.date}T${l.time}:00`).getTime() >= now - 5 * 60 * 1000
//   );

//   const pastLessons = lessons.filter(
//     (l: LessonRow) => new Date(`${l.date}T${l.time}:00`).getTime() < now
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

//         {/* Profile Card */}
//         {/* Beautiful Full Teacher Profile Card */}
//         <TeacherProfileCard teacherId={currentUser.currentTeacher} />
//         {/* Upcoming Lessons */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6, delay: 0.4 }}
//         >
//           <Card className="mb-8 bg-card dark:bg-gradient-purple-to-black border-2 border-border dark:border-purple-800/30 shadow-lg dark:shadow-purple-card">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-3 text-card-foreground dark:text-purple-200 font-serif text-2xl">
//                 <Video className="h-7 w-7 text-primary dark:text-purple-400" />
//                 Upcoming Lessons
//               </CardTitle>
//               {upcomingLessons.length === 0 && (
//                 <CardDescription className="text-muted-foreground dark:text-purple-400/70 font-serif italic">
//                   No lessons scheduled yet.
//                 </CardDescription>
//               )}
//             </CardHeader>
//             <CardContent>
//               <LessonsTable lessons={upcomingLessons} now={now} />
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
//                 <LessonsTable lessons={pastLessons} now={now} />
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

// // Fixed helper components
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

// function LessonsTable({ lessons, now }: { lessons: LessonRow[]; now: number }) {
//   const deleteLesson = useMutation(api.schedules.deleteLesson);

//   const handleCancel = async (
//     scheduleId: Id<"schedules">,
//     lessonIndex: number
//   ) => {
//     if (!confirm("Are you sure you want to cancel this lesson?")) return;

//     try {
//       await deleteLesson({ scheduleId, lessonIndex });
//       toast.success("Lesson cancelled successfully");
//     } catch {
//       toast.error("Failed to cancel lesson");
//     }
//   };

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
//             const isUpcoming = startMs >= now - 5 * 60 * 1000;
//             const isPast = startMs < now;

//             const lessonIndex = lessons.findIndex(
//               (lesson) =>
//                 lesson.scheduleId === l.scheduleId && lesson.time === l.time
//             );

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
//                   {isPast ? (
//                     <div className="flex items-center gap-2">
//                       <div
//                         className={`h-3 w-3 rounded-full ${
//                           l.status === "completed"
//                             ? "bg-emerald-500"
//                             : l.status === "finished_early"
//                               ? "bg-yellow-500"
//                               : l.status === "na"
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
//                             : l.status === "na"
//                               ? "No Answer"
//                               : l.status === "teacher_late"
//                                 ? "Teacher Late"
//                                 : "Technical Issue"}
//                       </span>
//                     </div>
//                   ) : (
//                     <Badge
//                       variant={isUpcoming ? "default" : "secondary"}
//                       className={
//                         isUpcoming
//                           ? "bg-primary dark:bg-purple-700 text-primary-foreground dark:text-purple-100"
//                           : "bg-muted dark:bg-purple-800/50 text-foreground dark:text-purple-300"
//                       }
//                     >
//                       {isUpcoming ? "Upcoming" : "Soon"}
//                     </Badge>
//                   )}
//                 </TableCell>
//                 <TableCell className="flex gap-2">
//                   <Button
//                     variant="link"
//                     size="sm"
//                     className="text-primary hover:text-primary/80 dark:text-purple-400 dark:hover:text-purple-300"
//                     asChild
//                   >
//                     <Link
//                       href={`/dashboard/lesson/${l.scheduleId}/${l.lessonId}`}
//                     >
//                       Join / View
//                     </Link>
//                   </Button>

//                   {isUpcoming && !isPast && (
//                     <Button
//                       size="sm"
//                       variant="destructive"
//                       onClick={() => handleCancel(l.scheduleId, lessonIndex)}
//                       className="text-xs"
//                     >
//                       <Trash2 className="h-3 w-3 mr-1" />
//                       Cancel
//                     </Button>
//                   )}
//                 </TableCell>
//               </motion.tr>
//             );
//           })}
//         </TableBody>
//       </Table>
//     </div>
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Video, FileText, Trash2 } from "lucide-react";
import LiveClock from "@/app/components/LiveClock";
import { CurrentBookViewerPretty } from "@/app/components/CurrentBookViewerPretty";
import { toast } from "sonner";
import { TeacherProfileCard } from "@/app/components/TeacherProfileCard";

// FINAL FIXED TYPE — This is the only one you need
type LessonRow = {
  scheduleId: Id<"schedules">;
  lessonId: string;
  date: string;
  time: string;
  duration: number;
  teacherId: Id<"users">;
  bookId?: Id<"books"> | null; // Optional + allows null
  zoomLink?: string | undefined;
  completed: boolean;
  notes?: string | undefined;
  startedAt?: number | undefined;
  status:
    | "completed"
    | "finished_early"
    | "no_answer_on_time" // ← Changed from "na"
    | "teacher_late"
    | "technical_difficulty"
    | "teacher_never_called";
  state:
    | "scheduled"
    | "in_progress"
    | "completed"
    | "missed_teacher"
    | "missed_student";
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

  const setMyTeacher = useMutation(api.users.setMyTeacher);

  const handleSetTeacher = async (teacherId?: Id<"users">) => {
    await setMyTeacher(teacherId ? { teacherId } : {});
  };

  const [now] = useState<number>(() => Date.now());

  if (!clerkLoaded || currentUser === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-12 w-12 text-purple-400" />
        </motion.div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "student") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 text-center text-red-400 bg-red-950/30 border-2 border-red-800/50 rounded-lg"
        >
          <p className="text-xl font-serif">Access denied — students only</p>
        </motion.div>
      </div>
    );
  }

  // These now work perfectly — no more TS errors
  const upcomingLessons = lessons.filter(
    (l: LessonRow) => l.state === "scheduled" || l.state === "in_progress",
  );

  const pastLessons = lessons.filter(
    (l: LessonRow) =>
      l.state === "completed" ||
      l.state === "missed_teacher" ||
      l.state === "missed_student",
  );

  return (
    <div className="min-h-screen bg-background dark:bg-gradient-to-b dark:from-black dark:via-purple-950 dark:to-black">
      <div className="container mx-auto p-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <LiveClock />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl font-bold mb-12 text-foreground dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-purple-200 dark:via-purple-400 dark:to-purple-200 font-serif"
        >
          Welcome back, {clerkUser?.firstName || "Student"}!
        </motion.h1>

        {/* Current Book Section */}
        {currentUser.currentBookId ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="mb-12 overflow-hidden shadow-lg border-2 border-border dark:border-purple-800/30 bg-card dark:bg-gradient-purple-to-black dark:shadow-purple-original">
              <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent dark:bg-gradient-purple-header p-8 border-b border-border dark:border-purple-700/30 relative overflow-hidden">
                <motion.div
                  animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.1, 1] }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent"
                />
                <div className="flex items-center gap-6 relative z-10">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="bg-primary/10 dark:bg-purple-800/30 backdrop-blur-sm rounded-2xl p-6 border-2 border-primary/30 dark:border-purple-700/50 shadow-lg dark:shadow-purple-card"
                  >
                    <FileText className="h-16 w-16 text-primary dark:text-purple-300 dark:drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                  </motion.div>
                  <div>
                    <h2 className="text-4xl font-bold text-card-foreground dark:text-purple-100 font-serif">
                      Your Current Book
                    </h2>
                    <p className="text-xl text-muted-foreground dark:text-purple-300/90 mt-2 font-serif italic">
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
            <Card className="mb-12 border-dashed border-4 border-muted dark:border-purple-700/50 bg-muted/30 dark:bg-purple-950/30 backdrop-blur-sm">
              <CardContent className="pt-24 pb-24 text-center">
                <motion.div
                  animate={{ y: [0, -10, 0], rotateY: [0, 5, -5, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="mx-auto w-32 h-40 bg-muted dark:bg-purple-900/50 rounded-2xl flex items-center justify-center mb-8 shadow-lg dark:shadow-purple-card border-2 border-border dark:border-purple-700/30"
                >
                  <FileText className="h-20 w-20 text-muted-foreground dark:text-purple-400 opacity-60" />
                </motion.div>
                <p className="text-3xl font-bold text-foreground dark:text-purple-300 font-serif">
                  No book assigned yet
                </p>
                <p className="text-xl text-muted-foreground dark:text-purple-400/80 mt-4 font-serif italic">
                  Your teacher will choose your perfect book soon
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Profile Card */}
        {/* Beautiful Full Teacher Profile Card */}
        <TeacherProfileCard teacherId={currentUser.currentTeacher} />
        {/* Upcoming Lessons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="mb-8 bg-card dark:bg-gradient-purple-to-black border-2 border-border dark:border-purple-800/30 shadow-lg dark:shadow-purple-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-card-foreground dark:text-purple-200 font-serif text-2xl">
                <Video className="h-7 w-7 text-primary dark:text-purple-400" />
                Upcoming Lessons
              </CardTitle>
              {upcomingLessons.length === 0 && (
                <CardDescription className="text-muted-foreground dark:text-purple-400/70 font-serif italic">
                  No lessons scheduled yet.
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <LessonsTable lessons={upcomingLessons} now={now} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Past Lessons */}
        {pastLessons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="mb-8 bg-card dark:bg-gradient-purple-to-black border-2 border-border dark:border-purple-800/30 shadow-lg dark:shadow-purple-card">
              <CardHeader>
                <CardTitle className="text-card-foreground dark:text-purple-200 font-serif text-2xl">
                  Past Lessons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LessonsTable lessons={pastLessons} now={now} />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Teacher Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="bg-card dark:bg-gradient-purple-to-black border-2 border-border dark:border-purple-800/30 shadow-lg dark:shadow-purple-card">
            <CardHeader>
              <CardTitle className="text-card-foreground dark:text-purple-200 font-serif text-2xl">
                Choose / Change Preferred Teacher
              </CardTitle>
              <CardDescription className="text-muted-foreground dark:text-purple-400/70 font-serif">
                Pick any teacher who who teaches {currentUser.instrument}.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {teachers.map((teacher: Doc<"users">, index: number) => (
                <motion.div
                  key={teacher._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.03, y: -3 }}
                >
                  <Card className="p-4 bg-muted/50 dark:bg-purple-900/40 border border-border dark:border-purple-700/40 shadow dark:shadow-[0_0_20px_rgba(168,85,247,0.15)]">
                    <div className="font-medium text-foreground dark:text-purple-200 font-serif">
                      {teacher.email}
                    </div>
                    {currentUser.currentTeacher === teacher._id && (
                      <Badge className="mt-2 bg-primary dark:bg-purple-700 text-primary-foreground dark:text-purple-100 border-primary dark:border-purple-600">
                        Current teacher
                      </Badge>
                    )}
                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-primary hover:bg-primary/90 dark:bg-purple-700 dark:hover:bg-purple-600 text-primary-foreground dark:text-purple-50 border border-primary/50 dark:border-purple-600/50 shadow-lg dark:shadow-[0_0_15px_rgba(168,85,247,0.3)]"
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
                          className="border-border dark:border-purple-600/50 text-foreground dark:text-purple-300 hover:bg-muted dark:hover:bg-purple-800/30"
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
                <p className="col-span-full text-center text-muted-foreground dark:text-purple-400/70 font-serif italic">
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

// Fixed helper components
function TeacherName({ id }: { id: Id<"users"> }) {
  const teacher = useQuery(api.users.getById, { id });
  return (
    <span className="text-foreground dark:text-purple-300">
      {teacher?.email ?? "Loading..."}
    </span>
  );
}

function BookTitle({ id }: { id: Id<"books"> | null | undefined }) {
  const book = useQuery(api.books.getById, id ? { id } : "skip");

  if (!id || !book) {
    return (
      <span className="text-muted-foreground dark:text-purple-400/50">---</span>
    );
  }

  return (
    <span className="text-foreground dark:text-purple-300">{book.title}</span>
  );
}

function LessonsTable({ lessons, now }: { lessons: LessonRow[]; now: number }) {
  const deleteLesson = useMutation(api.schedules.deleteLesson);

  const handleCancel = async (
    scheduleId: Id<"schedules">,
    lessonId: string,
  ) => {
    if (!confirm("Are you sure you want to cancel this lesson?")) return;

    try {
      await deleteLesson({ scheduleId, lessonId });
      toast.success("Lesson cancelled successfully");
    } catch {
      toast.error("Failed to cancel lesson");
    }
  };

  return (
    <div className="rounded-lg border border-purple-800/30 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-purple-900/20 border-b border-purple-800/30">
            <TableHead className="text-purple-300 font-serif">Date</TableHead>
            <TableHead className="text-purple-300 font-serif">Time</TableHead>
            <TableHead className="text-purple-300 font-serif">
              Duration
            </TableHead>
            <TableHead className="text-purple-300 font-serif">
              Teacher
            </TableHead>
            <TableHead className="text-purple-300 font-serif">Book</TableHead>
            <TableHead className="text-purple-300 font-serif">Status</TableHead>
            <TableHead className="text-purple-300 font-serif">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lessons.map((l, index) => {
            const startMs = new Date(`${l.date}T${l.time}:00`).getTime();
            const isUpcoming =
              l.state === "scheduled" || l.state === "in_progress";

            return (
              <motion.tr
                key={`${l.scheduleId}-${l.time}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-border dark:border-purple-800/20 hover:bg-muted/30 dark:hover:bg-purple-900/20"
              >
                <TableCell className="text-foreground dark:text-purple-200 font-serif">
                  {format(startMs, "PPP")}
                </TableCell>
                <TableCell className="text-foreground dark:text-purple-200 font-serif">
                  {l.time}
                </TableCell>
                <TableCell className="text-foreground dark:text-purple-200 font-serif">
                  {l.duration} min
                </TableCell>
                <TableCell>
                  <TeacherName id={l.teacherId} />
                </TableCell>
                <TableCell>
                  <BookTitle id={l.bookId} />
                </TableCell>
                <TableCell>
                  {isUpcoming ? (
                    <Badge
                      variant="default"
                      className="bg-primary dark:bg-purple-700 text-primary-foreground dark:text-purple-100"
                    >
                      {l.state === "scheduled" ? "Scheduled" : "In Progress"}
                    </Badge>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          l.status === "completed"
                            ? "bg-emerald-500"
                            : l.status === "finished_early"
                              ? "bg-yellow-500"
                              : l.status === "no_answer_on_time"
                                ? "bg-red-500"
                                : l.status === "teacher_late"
                                  ? "bg-orange-500"
                                  : "bg-purple-500"
                        }`}
                      />
                      <span className="text-purple-200 text-sm">
                        {l.status === "completed"
                          ? "Completed"
                          : l.status === "finished_early"
                            ? "Finished Early"
                            : l.status === "no_answer_on_time"
                              ? "No Answer"
                              : l.status === "teacher_late"
                                ? "Teacher Late"
                                : "Technical Issue"}
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    variant="link"
                    size="sm"
                    className="text-primary hover:text-primary/80 dark:text-purple-400 dark:hover:text-purple-300"
                    asChild
                  >
                    <Link
                      href={`/dashboard/lesson/${l.scheduleId}/${l.lessonId}`}
                    >
                      {isUpcoming && l.state === "in_progress"
                        ? "Join"
                        : "View"}
                    </Link>
                  </Button>

                  {l.state === "scheduled" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleCancel(l.scheduleId, l.lessonId)}
                      className="text-xs"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  )}
                </TableCell>
              </motion.tr>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
