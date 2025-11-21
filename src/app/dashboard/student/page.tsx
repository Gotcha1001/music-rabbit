// "use client";

// import { useQuery, useMutation } from "convex/react";
// import { useUser } from "@clerk/nextjs";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { format } from "date-fns";
// import { Id, Doc } from "../../../../convex/_generated/dataModel";
// import { api } from "../../../../convex/_generated/api";

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
// import { Loader2, Video, User } from "lucide-react";

// type LessonRow = {
//   scheduleId: Id<"schedules">;
//   date: string;
//   time: string;
//   duration: number;
//   teacherId: Id<"users">;
//   bookId?: Id<"books">;
//   zoomLink?: string;
//   completed: boolean;
//   notes?: string;
// };

// export default function StudentDashboard() {
//   const router = useRouter();
//   const { user: clerkUser, isLoaded: clerkLoaded } = useUser();

//   const currentUser = useQuery(api.users.get);

//   // Redirect if no instrument selected yet
//   useEffect(() => {
//     if (currentUser && !currentUser.instrument) {
//       router.replace("/onboarding/student");
//     }
//   }, [currentUser, router]);

//   // Always call hooks unconditionally – only the args become "skip"
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

//   const [now, setNow] = useState<number>(() => Date.now());

//   if (!clerkLoaded || currentUser === undefined) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         <Loader2 className="h-8 w-8 animate-spin" />
//       </div>
//     );
//   }

//   if (!currentUser || currentUser.role !== "student") {
//     return (
//       <div className="p-8 text-center text-red-600">
//         Access denied – students only
//       </div>
//     );
//   }

//   const upcomingLessons = lessons.filter(
//     (l: LessonRow) =>
//       new Date(`${l.date}T${l.time}:00`).getTime() >= now - 5 * 60 * 1000
//   );

//   const pastLessons = lessons.filter(
//     (l: LessonRow) => new Date(`${l.date}T${l.time}:00`).getTime() < now
//   );

//   return (
//     <div className="container mx-auto p-6 max-w-7xl">
//       <h1 className="text-4xl font-bold mb-8">
//         Welcome back, {clerkUser?.firstName || "Student"}! 🎵
//       </h1>

//       {/* Profile */}
//       <Card className="mb-8">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-3">
//             <User className="h-6 w-6" />
//             My Profile
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div>
//             <strong>Learning:</strong> {currentUser.instrument}
//           </div>
//           <div>
//             <strong>Preferred teacher:</strong>{" "}
//             {currentUser.currentTeacher ? (
//               <TeacherName id={currentUser.currentTeacher} />
//             ) : (
//               <span className="text-muted-foreground">
//                 None – HR will assign you automatically
//               </span>
//             )}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Upcoming */}
//       <Card className="mb-8">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Video className="h-6 w-6" />
//             Upcoming Lessons
//           </CardTitle>
//           {upcomingLessons.length === 0 && (
//             <CardDescription>No lessons scheduled yet.</CardDescription>
//           )}
//         </CardHeader>
//         <CardContent>
//           <LessonsTable lessons={upcomingLessons} now={now} />
//         </CardContent>
//       </Card>

//       {/* Past */}
//       {pastLessons.length > 0 && (
//         <Card className="mb-8">
//           <CardHeader>
//             <CardTitle>Past Lessons</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <LessonsTable lessons={pastLessons} now={now} />
//           </CardContent>
//         </Card>
//       )}

//       {/* Teacher selection */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Choose / Change Preferred Teacher</CardTitle>
//           <CardDescription>
//             Pick any teacher who teaches {currentUser.instrument}.
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//           {teachers.map((teacher: Doc<"users">) => (
//             <Card key={teacher._id} className="p-4">
//               <div className="font-medium">{teacher.email}</div>
//               {currentUser.currentTeacher === teacher._id && (
//                 <Badge className="mt-2">Current teacher</Badge>
//               )}
//               <div className="mt-4 flex gap-2">
//                 <Button
//                   size="sm"
//                   className="flex-1"
//                   variant={
//                     currentUser.currentTeacher === teacher._id
//                       ? "secondary"
//                       : "default"
//                   }
//                   onClick={() => handleSetTeacher(teacher._id)}
//                   disabled={currentUser.currentTeacher === teacher._id}
//                 >
//                   {currentUser.currentTeacher === teacher._id
//                     ? "Selected"
//                     : "Choose"}
//                 </Button>
//                 {currentUser.currentTeacher === teacher._id && (
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     onClick={() => handleSetTeacher()}
//                   >
//                     Clear
//                   </Button>
//                 )}
//               </div>
//             </Card>
//           ))}
//           {teachers.length === 0 && (
//             <p className="col-span-full text-center text-muted-foreground">
//               No teachers available for {currentUser.instrument} yet.
//             </p>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// // ---------------------------------------------------------------------
// // Reusable components – hooks are never conditional
// // ---------------------------------------------------------------------

// function TeacherName({ id }: { id: Id<"users"> }) {
//   const teacher = useQuery(api.users.getById, { id });
//   return <span>{teacher?.email ?? "Loading…"}</span>;
// }

// function BookTitle({ id }: { id?: Id<"books"> }) {
//   const book = useQuery(api.books.getById, id ? { id } : "skip");
//   if (!id) return <span>—</span>;
//   return <span>{book?.title ?? "Loading…"}</span>;
// }

// function LessonsTable({ lessons, now }: { lessons: LessonRow[]; now: number }) {
//   return (
//     <Table>
//       <TableHeader>
//         <TableRow>
//           <TableHead>Date</TableHead>
//           <TableHead>Time</TableHead>
//           <TableHead>Duration</TableHead>
//           <TableHead>Teacher</TableHead>
//           <TableHead>Book</TableHead>
//           <TableHead>Status</TableHead>
//           <TableHead>Notes / Homework</TableHead>
//         </TableRow>
//       </TableHeader>
//       <TableBody>
//         {lessons.map((l) => {
//           const startMs = new Date(`${l.date}T${l.time}:00`).getTime();
//           const isActive = Math.abs(startMs - now) < 30 * 60 * 1000;

//           return (
//             <TableRow key={`${l.scheduleId}-${l.time}`}>
//               <TableCell>{format(startMs, "PPP")}</TableCell>
//               <TableCell>{l.time}</TableCell>
//               <TableCell>{l.duration} min</TableCell>
//               <TableCell>
//                 <TeacherName id={l.teacherId} />
//               </TableCell>
//               <TableCell>
//                 <BookTitle id={l.bookId} />
//               </TableCell>
//               <TableCell>
//                 {l.completed ? (
//                   <Badge variant="secondary">Completed</Badge>
//                 ) : (
//                   <Badge variant={isActive ? "default" : "outline"}>
//                     Scheduled
//                   </Badge>
//                 )}
//               </TableCell>
//               <TableCell>
//                 {l.zoomLink && (isActive || startMs > now) && (
//                   <Button size="sm" asChild>
//                     <a
//                       href={l.zoomLink}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                     >
//                       Join Lesson
//                     </a>
//                   </Button>
//                 )}
//               </TableCell>
//             </TableRow>
//           );
//         })}
//       </TableBody>
//     </Table>
//   );
// }
// "use client";

// import { useQuery, useMutation } from "convex/react";
// import { useUser } from "@clerk/nextjs";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { format } from "date-fns";
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
// import { Loader2, Video, User } from "lucide-react";

// type LessonRow = {
//   scheduleId: Id<"schedules">;
//   lessonId: string;
//   date: string;
//   time: string;
//   duration: number;
//   teacherId: Id<"users">;
//   bookId?: Id<"books">;
//   zoomLink?: string;
//   completed: boolean;
//   notes?: string;
// };

// export default function StudentDashboard() {
//   const router = useRouter();
//   const { user: clerkUser, isLoaded: clerkLoaded } = useUser();

//   const currentUser = useQuery(api.users.get);

//   // Redirect if no instrument selected yet
//   useEffect(() => {
//     if (currentUser && !currentUser.instrument) {
//       router.replace("/onboarding/student");
//     }
//   }, [currentUser, router]);

//   // Always call hooks unconditionally – only the args become "skip"
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

//   const [now, setNow] = useState<number>(() => Date.now());

//   if (!clerkLoaded || currentUser === undefined) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         <Loader2 className="h-8 w-8 animate-spin" />
//       </div>
//     );
//   }

//   if (!currentUser || currentUser.role !== "student") {
//     return (
//       <div className="p-8 text-center text-red-600">
//         Access denied – students only
//       </div>
//     );
//   }

//   const upcomingLessons = lessons.filter(
//     (l: LessonRow) =>
//       new Date(`${l.date}T${l.time}:00`).getTime() >= now - 5 * 60 * 1000
//   );

//   const pastLessons = lessons.filter(
//     (l: LessonRow) => new Date(`${l.date}T${l.time}:00`).getTime() < now
//   );

//   return (
//     <div className="container mx-auto p-6 max-w-7xl">
//       <h1 className="text-4xl font-bold mb-8">
//         Welcome back, {clerkUser?.firstName || "Student"}! 🎵
//       </h1>

//       {/* Profile */}
//       <Card className="mb-8">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-3">
//             <User className="h-6 w-6" />
//             My Profile
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div>
//             <strong>Learning:</strong> {currentUser.instrument}
//           </div>
//           <div>
//             <strong>Preferred teacher:</strong>{" "}
//             {currentUser.currentTeacher ? (
//               <TeacherName id={currentUser.currentTeacher} />
//             ) : (
//               <span className="text-muted-foreground">
//                 None – HR will assign you automatically
//               </span>
//             )}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Upcoming */}
//       <Card className="mb-8">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Video className="h-6 w-6" />
//             Upcoming Lessons
//           </CardTitle>
//           {upcomingLessons.length === 0 && (
//             <CardDescription>No lessons scheduled yet.</CardDescription>
//           )}
//         </CardHeader>
//         <CardContent>
//           <LessonsTable lessons={upcomingLessons} now={now} />
//         </CardContent>
//       </Card>

//       {/* Past */}
//       {pastLessons.length > 0 && (
//         <Card className="mb-8">
//           <CardHeader>
//             <CardTitle>Past Lessons</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <LessonsTable lessons={pastLessons} now={now} />
//           </CardContent>
//         </Card>
//       )}

//       {/* Teacher selection */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Choose / Change Preferred Teacher</CardTitle>
//           <CardDescription>
//             Pick any teacher who teaches {currentUser.instrument}.
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//           {teachers.map((teacher: Doc<"users">) => (
//             <Card key={teacher._id} className="p-4">
//               <div className="font-medium">{teacher.email}</div>
//               {currentUser.currentTeacher === teacher._id && (
//                 <Badge className="mt-2">Current teacher</Badge>
//               )}
//               <div className="mt-4 flex gap-2">
//                 <Button
//                   size="sm"
//                   className="flex-1"
//                   variant={
//                     currentUser.currentTeacher === teacher._id
//                       ? "secondary"
//                       : "default"
//                   }
//                   onClick={() => handleSetTeacher(teacher._id)}
//                   disabled={currentUser.currentTeacher === teacher._id}
//                 >
//                   {currentUser.currentTeacher === teacher._id
//                     ? "Selected"
//                     : "Choose"}
//                 </Button>
//                 {currentUser.currentTeacher === teacher._id && (
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     onClick={() => handleSetTeacher()}
//                   >
//                     Clear
//                   </Button>
//                 )}
//               </div>
//             </Card>
//           ))}
//           {teachers.length === 0 && (
//             <p className="col-span-full text-center text-muted-foreground">
//               No teachers available for {currentUser.instrument} yet.
//             </p>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// // ---------------------------------------------------------------------
// // Reusable components – hooks are never conditional
// // ---------------------------------------------------------------------

// function TeacherName({ id }: { id: Id<"users"> }) {
//   const teacher = useQuery(api.users.getById, { id });
//   return <span>{teacher?.email ?? "Loading…"}</span>;
// }

// function BookTitle({ id }: { id?: Id<"books"> }) {
//   const book = useQuery(api.books.getById, id ? { id } : "skip");
//   if (!id) return <span>—</span>;
//   return <span>{book?.title ?? "Loading…"}</span>;
// }

// function LessonsTable({ lessons, now }: { lessons: LessonRow[]; now: number }) {
//   return (
//     <Table>
//       <TableHeader>
//         <TableRow>
//           <TableHead>Date</TableHead>
//           <TableHead>Time</TableHead>
//           <TableHead>Duration</TableHead>
//           <TableHead>Teacher</TableHead>
//           <TableHead>Book</TableHead>
//           <TableHead>Status</TableHead>
//           <TableHead>Actions</TableHead>
//         </TableRow>
//       </TableHeader>
//       <TableBody>
//         {lessons.map((l) => {
//           const startMs = new Date(`${l.date}T${l.time}:00`).getTime();
//           const isActive = Math.abs(startMs - now) < 30 * 60 * 1000;

//           return (
//             <TableRow key={`${l.scheduleId}-${l.lessonId}`}>
//               <TableCell>{format(startMs, "PPP")}</TableCell>
//               <TableCell>{l.time}</TableCell>
//               <TableCell>{l.duration} min</TableCell>
//               <TableCell>
//                 <TeacherName id={l.teacherId} />
//               </TableCell>
//               <TableCell>
//                 <BookTitle id={l.bookId} />
//               </TableCell>
//               <TableCell>
//                 {l.completed ? (
//                   <Badge variant="secondary">Completed</Badge>
//                 ) : (
//                   <Badge variant={isActive ? "default" : "outline"}>
//                     Scheduled
//                   </Badge>
//                 )}
//               </TableCell>
//               <TableCell>
//                 <Button variant="link" asChild>
//                   <Link
//                     href={`/dashboard/lesson/${l.scheduleId}/${l.lessonId}`}
//                   >
//                     View Details & Join Zoom
//                   </Link>
//                 </Button>
//               </TableCell>
//             </TableRow>
//           );
//         })}
//       </TableBody>
//     </Table>
//   );
// }
// app/dashboard/student/page.tsx
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
import { Loader2, Video, User, FileText, Trash2 } from "lucide-react";
import LiveClock from "@/app/components/LiveClock";
import { BookViewer } from "@/app/components/BookViewer";
import { CurrentBookViewerPretty } from "@/app/components/CurrentBookViewerPretty";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const LiveClocks = dynamic(() => import("@/app/components/LiveClock"), {
  ssr: false,
});

type LessonRow = {
  scheduleId: Id<"schedules">;
  lessonId: string;
  date: string;
  time: string;
  duration: number;
  teacherId: Id<"users">;
  bookId?: Id<"books">;
  zoomLink?: string;
  completed: boolean;
  notes?: string;
};

export default function StudentDashboard() {
  const router = useRouter();
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const currentUser = useQuery(api.users.get);

  // Redirect if no instrument selected yet
  useEffect(() => {
    if (currentUser && !currentUser.instrument) {
      router.replace("/onboarding/student");
    }
  }, [currentUser, router]);

  const lessons =
    useQuery(
      api.schedules.getByStudent,
      currentUser ? { studentId: currentUser._id } : "skip"
    ) ?? [];

  const teachers =
    useQuery(
      api.users.getTeachersByInstrument,
      currentUser?.instrument ? { instrument: currentUser.instrument } : "skip"
    ) ?? [];

  const setMyTeacher = useMutation(api.users.setMyTeacher);

  const handleSetTeacher = async (teacherId?: Id<"users">) => {
    await setMyTeacher(teacherId ? { teacherId } : {});
  };

  const [now, setNow] = useState<number>(() => Date.now());

  if (!clerkLoaded || currentUser === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-black via-purple-950 to-black">
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
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black flex items-center justify-center">
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

  const upcomingLessons = lessons.filter(
    (l: LessonRow) =>
      new Date(`${l.date}T${l.time}:00`).getTime() >= now - 5 * 60 * 1000
  );

  const pastLessons = lessons.filter(
    (l: LessonRow) => new Date(`${l.date}T${l.time}:00`).getTime() < now
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Clock at the top */}
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
          className="text-5xl font-bold mb-12 text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-purple-400 to-purple-200 font-serif"
        >
          Welcome back, {clerkUser?.firstName || "Student"}!
        </motion.h1>

        {currentUser.currentBookId ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="mb-12 overflow-hidden shadow-[0_0_60px_rgba(168,85,247,0.3)] border-2 border-purple-800/30 bg-gradient-to-br from-purple-950 to-black">
              <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-black p-8 border-b border-purple-700/30 relative overflow-hidden">
                {/* Animated background */}
                <motion.div
                  animate={{
                    opacity: [0.1, 0.2, 0.1],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent"
                />

                <div className="flex items-center gap-6 relative z-10">
                  <motion.div
                    animate={{
                      y: [0, -8, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="bg-purple-800/30 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-700/50 shadow-[0_0_30px_rgba(168,85,247,0.4)]"
                  >
                    <FileText className="h-16 w-16 text-purple-300 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                  </motion.div>
                  <div>
                    <h2 className="text-4xl font-bold text-purple-100 font-serif">
                      Your Current Book
                    </h2>
                    <p className="text-xl text-purple-300/90 mt-2 font-serif italic">
                      Open and practice anytime
                    </p>
                  </div>
                </div>
              </div>

              <CardContent className="pt-0 bg-gradient-to-b from-transparent to-black/50">
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
            <Card className="mb-12 border-dashed border-4 border-purple-700/50 bg-gradient-to-br from-purple-950/30 to-black/50 backdrop-blur-sm">
              <CardContent className="pt-24 pb-24 text-center">
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotateY: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="mx-auto w-32 h-40 bg-gradient-to-br from-purple-900/50 to-purple-950/50 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(168,85,247,0.3)] border-2 border-purple-700/30"
                >
                  <FileText className="h-20 w-20 text-purple-400 opacity-60" />
                </motion.div>
                <p className="text-3xl font-bold text-purple-300 font-serif">
                  No book assigned yet
                </p>
                <p className="text-xl text-purple-400/80 mt-4 font-serif italic">
                  Your teacher will choose your perfect book soon
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="mb-8 bg-gradient-to-br from-purple-950 to-black border-2 border-purple-800/30 shadow-[0_0_40px_rgba(168,85,247,0.2)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-purple-200 font-serif text-2xl">
                <User className="h-7 w-7 text-purple-400" />
                My Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-purple-300">
              <div className="font-serif">
                <strong className="text-purple-200">Learning:</strong>{" "}
                {currentUser.instrument}
              </div>
              <div className="font-serif">
                <strong className="text-purple-200">Preferred teacher:</strong>{" "}
                {currentUser.currentTeacher ? (
                  <TeacherName id={currentUser.currentTeacher} />
                ) : (
                  <span className="text-purple-400/70 italic">
                    None — HR will assign you automatically
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="mb-8 bg-gradient-to-br from-purple-950 to-black border-2 border-purple-800/30 shadow-[0_0_40px_rgba(168,85,247,0.2)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-purple-200 font-serif text-2xl">
                <Video className="h-7 w-7 text-purple-400" />
                Upcoming Lessons
              </CardTitle>
              {upcomingLessons.length === 0 && (
                <CardDescription className="text-purple-400/70 font-serif italic">
                  No lessons scheduled yet.
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <LessonsTable lessons={upcomingLessons} now={now} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Past */}
        {pastLessons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="mb-8 bg-gradient-to-br from-purple-950 to-black border-2 border-purple-800/30 shadow-[0_0_40px_rgba(168,85,247,0.2)]">
              <CardHeader>
                <CardTitle className="text-purple-200 font-serif text-2xl">
                  Past Lessons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LessonsTable lessons={pastLessons} now={now} />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Teacher selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="bg-gradient-to-br from-purple-950 to-black border-2 border-purple-800/30 shadow-[0_0_40px_rgba(168,85,247,0.2)]">
            <CardHeader>
              <CardTitle className="text-purple-200 font-serif text-2xl">
                Choose / Change Preferred Teacher
              </CardTitle>
              <CardDescription className="text-purple-400/70 font-serif">
                Pick any teacher who teaches {currentUser.instrument}.
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
                  <Card className="p-4 bg-gradient-to-br from-purple-900/40 to-black/60 border border-purple-700/40 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
                    <div className="font-medium text-purple-200 font-serif">
                      {teacher.email}
                    </div>
                    {currentUser.currentTeacher === teacher._id && (
                      <Badge className="mt-2 bg-purple-700 text-purple-100 border-purple-600">
                        Current teacher
                      </Badge>
                    )}
                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-purple-700 hover:bg-purple-600 text-purple-50 border border-purple-600/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
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
                          className="border-purple-600/50 text-purple-300 hover:bg-purple-800/30"
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
                <p className="col-span-full text-center text-purple-400/70 font-serif italic">
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

// Reusable components
function TeacherName({ id }: { id: Id<"users"> }) {
  const teacher = useQuery(api.users.getById, { id });
  return (
    <span className="text-purple-300">{teacher?.email ?? "Loading..."}</span>
  );
}

function BookTitle({ id }: { id?: Id<"books"> }) {
  const book = useQuery(api.books.getById, id ? { id } : "skip");
  if (!id) return <span className="text-purple-400/50">---</span>;
  return <span className="text-purple-300">{book?.title ?? "Loading..."}</span>;
}

function LessonsTable({ lessons, now }: { lessons: LessonRow[]; now: number }) {
  const deleteLesson = useMutation(api.schedules.deleteLesson);

  const handleCancel = async (
    scheduleId: Id<"schedules">,
    lessonIndex: number
  ) => {
    if (!confirm("Are you sure you want to cancel this lesson?")) return;

    try {
      await deleteLesson({ scheduleId, lessonIndex });
      toast.success("Lesson cancelled successfully");
    } catch (error) {
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
            const isUpcoming = startMs >= now - 5 * 60 * 1000;
            const isPast = startMs < now - 60 * 60 * 1000; // more than 1h ago

            // Find the actual index in the schedule's lessons array
            const lessonIndex = lessons.findIndex(
              (lesson) =>
                lesson.scheduleId === l.scheduleId && lesson.time === l.time
            );

            return (
              <motion.tr
                key={`${l.scheduleId}-${l.time}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-purple-800/20 hover:bg-purple-900/20"
              >
                <TableCell className="text-purple-200 font-serif">
                  {format(startMs, "PPP")}
                </TableCell>
                <TableCell className="text-purple-200 font-serif">
                  {l.time}
                </TableCell>
                <TableCell className="text-purple-200 font-serif">
                  {l.duration} min
                </TableCell>
                <TableCell>
                  <TeacherName id={l.teacherId} />
                </TableCell>
                <TableCell>
                  <BookTitle id={l.bookId} />
                </TableCell>
                <TableCell>
                  <Badge
                    variant={isUpcoming ? "default" : "secondary"}
                    className={
                      isUpcoming
                        ? "bg-purple-700 text-purple-100"
                        : "bg-purple-800/50 text-purple-300"
                    }
                  >
                    {isPast ? "Past" : isUpcoming ? "Upcoming" : "Soon"}
                  </Badge>
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    variant="link"
                    size="sm"
                    className="text-purple-400 hover:text-purple-300"
                    asChild
                  >
                    <Link
                      href={`/dashboard/lesson/${l.scheduleId}/${l.lessonId}`}
                    >
                      Join / View
                    </Link>
                  </Button>

                  {/* Only show cancel button for upcoming lessons */}
                  {isUpcoming && !isPast && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleCancel(l.scheduleId, lessonIndex)}
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
