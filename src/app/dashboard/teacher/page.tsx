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
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Loader2,
//   Video,
//   MessageSquare,
//   DollarSign,
//   FileText,
// } from "lucide-react";

// type Lesson = {
//   studentId: Id<"users">;
//   time: string;
//   duration: number;
//   bookId?: Id<"books">;
//   zoomLink?: string;
//   completed: boolean;
//   notes?: string;
// };

// type Schedule = Doc<"schedules"> & { lessons: Lesson[] };

// export default function TeacherDashboard() {
//   const router = useRouter();
//   const { user: clerkUser, isLoaded: clerkLoaded } = useUser();

//   const currentUser = useQuery(api.users.get);

//   // Redirect if no instrument selected yet
//   useEffect(() => {
//     if (currentUser && !currentUser.instrument) {
//       router.replace("/onboarding/teacher");
//     }
//   }, [currentUser, router]);

//   const schedules =
//     useQuery(
//       api.schedules.getByTeacher,
//       currentUser ? { teacherId: currentUser._id } : "skip"
//     ) ?? [];

//   const messages =
//     useQuery(
//       api.messages.getByUser,
//       currentUser ? { userId: currentUser._id } : "skip"
//     ) ?? [];

//   const payments =
//     useQuery(
//       api.payments.getByTeacher,
//       currentUser ? { teacherId: currentUser._id } : "skip"
//     ) ?? [];

//   const updateLesson = useMutation(api.schedules.updateLesson);

//   const [now] = useState<number>(() => Date.now()); // Removed setNow since not used
//   const [selectedLesson, setSelectedLesson] = useState<{
//     scheduleId: Id<"schedules">;
//     lessonIndex: number;
//   } | null>(null);
//   const [notes, setNotes] = useState("");

//   if (!clerkLoaded || currentUser === undefined) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         <Loader2 className="h-8 w-8 animate-spin" />
//       </div>
//     );
//   }

//   if (!currentUser || currentUser.role !== "teacher") {
//     return (
//       <div className="p-8 text-center text-red-600">
//         Access denied – teachers only
//       </div>
//     );
//   }

//   const upcomingSchedules = schedules.filter(
//     (s: Schedule) => new Date(s.date).getTime() >= now - 24 * 60 * 60 * 1000
//   );

//   const handleStartMeeting = async (
//     scheduleId: Id<"schedules">,
//     lessonIndex: number
//   ) => {
//     // Placeholder for Zoom integration: generate link
//     const zoomLink = "https://zoom.us/j/123456789"; // Replace with actual API call
//     await updateLesson({ scheduleId, lessonIndex, updates: { zoomLink } });
//   };

//   const handleCompleteLesson = async (
//     scheduleId: Id<"schedules">,
//     lessonIndex: number
//   ) => {
//     await updateLesson({
//       scheduleId,
//       lessonIndex,
//       updates: { completed: true, notes },
//     });
//     setSelectedLesson(null);
//     setNotes("");
//   };

//   const handleOpenBook = (bookId?: Id<"books">) => {
//     if (bookId) {
//       // Placeholder: open PDF viewer or download
//       console.log(`Opening book ${bookId}`);
//     }
//   };

//   function BookTitle({ id }: { id?: Id<"books"> }) {
//     const book = useQuery(api.books.getById, id ? { id } : "skip");
//     const url = useQuery(
//       api.books.getUrl,
//       book ? { storageId: book.fileId } : "skip"
//     );

//     if (!id || !book || !url) return <span>—</span>;

//     return (
//       <Button
//         variant="link"
//         onClick={() => window.open(url, "_blank")}
//         className="p-0 h-auto"
//       >
//         {book.title}
//       </Button>
//     );
//   }

//   return (
//     <div className="container mx-auto p-6 max-w-7xl">
//       <h1 className="text-4xl font-bold mb-8">
//         Welcome back, {clerkUser?.firstName || "Teacher"}! 🎵
//       </h1>

//       <Tabs defaultValue="schedule">
//         <TabsList>
//           <TabsTrigger value="schedule">Schedule</TabsTrigger>
//           <TabsTrigger value="messages">Messages</TabsTrigger>
//           <TabsTrigger value="payments">Payments</TabsTrigger>
//           <TabsTrigger value="recordings">Recordings</TabsTrigger>
//         </TabsList>

//         <TabsContent value="schedule">
//           <Card className="mb-8">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Video className="h-6 w-6" />
//                 Today&apos;s Schedule
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <ScheduleTable
//                 schedules={upcomingSchedules}
//                 now={now}
//                 onStartMeeting={handleStartMeeting}
//                 onCompleteLesson={handleCompleteLesson}
//                 onOpenBook={handleOpenBook}
//                 selectedLesson={selectedLesson}
//                 setSelectedLesson={setSelectedLesson}
//                 notes={notes}
//                 setNotes={setNotes}
//               />
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="messages">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <MessageSquare className="h-6 w-6" />
//                 Messages from HR
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               {/* Render messages */}
//               {messages.map((msg: Doc<"messages">) => (
//                 <div key={msg._id} className="mb-4">
//                   <p>{msg.content}</p>
//                   <p className="text-sm text-muted-foreground">
//                     {format(msg.timestamp, "PPP p")}
//                   </p>
//                 </div>
//               ))}
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="payments">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <DollarSign className="h-6 w-6" />
//                 Earnings
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               {/* Render payments */}
//               {payments.map((pay: Doc<"payments">) => (
//                 <div key={pay._id}>
//                   <p>
//                     {pay.month}: ${pay.earnings}
//                   </p>
//                 </div>
//               ))}
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="recordings">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <FileText className="h-6 w-6" />
//                 Lesson Recordings
//               </CardTitle>
//               <CardDescription>Coming soon...</CardDescription>
//             </CardHeader>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }

// // Reusable components
// function StudentName({ id }: { id: Id<"users"> }) {
//   const student = useQuery(api.users.getById, { id });
//   return <span>{student?.email ?? "Loading…"}</span>;
// }

// function BookTitle({ id }: { id?: Id<"books"> }) {
//   const book = useQuery(api.books.getById, id ? { id } : "skip");
//   if (!id) return <span>—</span>;
//   return <span>{book?.title ?? "Loading…"}</span>;
// }

// function ScheduleTable({
//   schedules,
//   now,
//   onStartMeeting,
//   onCompleteLesson,
//   onOpenBook,
//   selectedLesson,
//   setSelectedLesson,
//   notes,
//   setNotes,
// }: {
//   schedules: Schedule[];
//   now: number;
//   onStartMeeting: (scheduleId: Id<"schedules">, lessonIndex: number) => void;
//   onCompleteLesson: (scheduleId: Id<"schedules">, lessonIndex: number) => void;
//   onOpenBook: (bookId?: Id<"books">) => void;
//   selectedLesson: { scheduleId: Id<"schedules">; lessonIndex: number } | null;
//   setSelectedLesson: (
//     val: { scheduleId: Id<"schedules">; lessonIndex: number } | null
//   ) => void;
//   notes: string;
//   setNotes: (val: string) => void;
// }) {
//   return (
//     <Table>
//       <TableHeader>
//         <TableRow>
//           <TableHead>Date</TableHead>
//           <TableHead>Time</TableHead>
//           <TableHead>Student</TableHead>
//           <TableHead>Duration</TableHead>
//           <TableHead>Book</TableHead>
//           <TableHead>Status</TableHead>
//           <TableHead>Actions</TableHead>
//         </TableRow>
//       </TableHeader>
//       <TableBody>
//         {schedules.flatMap((s) =>
//           s.lessons.map((l, idx) => {
//             const startMs = new Date(`${s.date}T${l.time}:00`).getTime();
//             const isActive =
//               startMs <= now && startMs + l.duration * 60 * 1000 > now;

//             return (
//               <TableRow key={`${s._id}-${idx}`}>
//                 <TableCell>{format(startMs, "PPP")}</TableCell>
//                 <TableCell>{l.time}</TableCell>
//                 <TableCell>
//                   <StudentName id={l.studentId} />
//                 </TableCell>
//                 <TableCell>{l.duration} min</TableCell>
//                 <TableCell>
//                   <Button variant="link" onClick={() => onOpenBook(l.bookId)}>
//                     <BookTitle id={l.bookId} />
//                   </Button>
//                 </TableCell>
//                 <TableCell>
//                   {l.completed ? (
//                     <Badge variant="secondary">Completed</Badge>
//                   ) : (
//                     <Badge variant={isActive ? "default" : "outline"}>
//                       {isActive ? "In Progress" : "Scheduled"}
//                     </Badge>
//                   )}
//                 </TableCell>
//                 <TableCell className="space-x-2">
//                   {!l.zoomLink && isActive && (
//                     <Button
//                       size="sm"
//                       onClick={() => onStartMeeting(s._id, idx)}
//                     >
//                       Start Meeting
//                     </Button>
//                   )}
//                   {l.zoomLink && (
//                     <Button size="sm" asChild>
//                       <a
//                         href={l.zoomLink}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                       >
//                         Join Zoom
//                       </a>
//                     </Button>
//                   )}
//                   {isActive && !l.completed && (
//                     <Button
//                       size="sm"
//                       onClick={() =>
//                         setSelectedLesson({
//                           scheduleId: s._id,
//                           lessonIndex: idx,
//                         })
//                       }
//                     >
//                       Complete
//                     </Button>
//                   )}
//                 </TableCell>
//               </TableRow>
//             );
//           })
//         )}
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
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Loader2,
//   Video,
//   MessageSquare,
//   DollarSign,
//   FileText,
//   ExternalLink,
// } from "lucide-react";
// import { RecordingsTab } from "@/app/components/RecordingsTab";

// // Import the new RecordingsTab component

// type Lesson = {
//   lessonId: string;
//   studentId: Id<"users">;
//   time: string;
//   duration: number;
//   bookId?: Id<"books">;
//   zoomLink?: string;
//   completed: boolean;
//   notes?: string;
// };

// type Schedule = Doc<"schedules"> & { lessons: Lesson[] };

// export default function TeacherDashboard() {
//   const router = useRouter();
//   const { user: clerkUser, isLoaded: clerkLoaded } = useUser();

//   const currentUser = useQuery(api.users.get);
//   // Note: recordings query is now handled inside RecordingsTab component
//   // const recordings = useQuery(api.recordings.getByTeacher) ?? [];

//   // Redirect if no instrument selected yet
//   useEffect(() => {
//     if (currentUser && !currentUser.instrument) {
//       router.replace("/onboarding/teacher");
//     }
//   }, [currentUser, router]);

//   const schedules =
//     useQuery(
//       api.schedules.getByTeacher,
//       currentUser ? { teacherId: currentUser._id } : "skip"
//     ) ?? [];

//   const messages =
//     useQuery(
//       api.messages.getByUser,
//       currentUser ? { userId: currentUser._id } : "skip"
//     ) ?? [];

//   const payments =
//     useQuery(
//       api.payments.getByTeacher,
//       currentUser ? { teacherId: currentUser._id } : "skip"
//     ) ?? [];

//   const [now] = useState<number>(() => Date.now());

//   if (!clerkLoaded || currentUser === undefined) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         <Loader2 className="h-8 w-8 animate-spin" />
//       </div>
//     );
//   }

//   if (!currentUser || currentUser.role !== "teacher") {
//     return (
//       <div className="p-8 text-center text-red-600">
//         Access denied – teachers only
//       </div>
//     );
//   }

//   const upcomingSchedules = schedules.filter(
//     (s: Schedule) => new Date(s.date).getTime() >= now - 24 * 60 * 60 * 1000
//   );

//   const handleOpenBook = (bookId?: Id<"books">) => {
//     if (bookId) {
//       // Placeholder: open PDF viewer or download
//       console.log(`Opening book ${bookId}`);
//     }
//   };

//   return (
//     <div className="container mx-auto p-6 max-w-7xl">
//       <h1 className="text-4xl font-bold mb-8">
//         Welcome back, {clerkUser?.firstName || "Teacher"}! 🎵
//       </h1>

//       <Tabs defaultValue="schedule">
//         <TabsList>
//           <TabsTrigger value="schedule">Schedule</TabsTrigger>
//           <TabsTrigger value="messages">Messages</TabsTrigger>
//           <TabsTrigger value="payments">Payments</TabsTrigger>
//           <TabsTrigger value="recordings">Recordings</TabsTrigger>
//         </TabsList>

//         <TabsContent value="schedule">
//           <Card className="mb-8">
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Video className="h-6 w-6" />
//                 Today&apos;s Schedule
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <ScheduleTable
//                 schedules={upcomingSchedules}
//                 now={now}
//                 onOpenBook={handleOpenBook}
//               />
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="messages">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <MessageSquare className="h-6 w-6" />
//                 Messages from HR
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               {messages.map((msg: Doc<"messages">) => (
//                 <div key={msg._id} className="mb-4">
//                   <div>{msg.content}</div>
//                   <div className="text-sm text-muted-foreground">
//                     {format(msg.timestamp, "PPP p")}
//                   </div>
//                 </div>
//               ))}
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="payments">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <DollarSign className="h-6 w-6" />
//                 Earnings
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               {payments.map((pay: Doc<"payments">) => (
//                 <div key={pay._id}>
//                   <p>
//                     {pay.month}: ${pay.earnings}
//                   </p>
//                 </div>
//               ))}
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* UPDATED: Use the new RecordingsTab component */}
//         <TabsContent value="recordings">
//           <RecordingsTab />
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }

// // Reusable components
// function StudentName({ id }: { id: Id<"users"> }) {
//   const student = useQuery(api.users.getById, { id });
//   return <span>{student?.email ?? "Loading…"}</span>;
// }

// function BookTitle({ id }: { id?: Id<"books"> }) {
//   const book = useQuery(api.books.getById, id ? { id } : "skip");
//   const url = useQuery(
//     api.books.getUrl,
//     book ? { storageId: book.fileId } : "skip"
//   );

//   if (!id || !book || !url) return <span>—</span>;

//   return (
//     <Button
//       variant="link"
//       onClick={() => window.open(url, "_blank")}
//       className="p-0 h-auto"
//     >
//       {book.title}
//     </Button>
//   );
// }

// function ScheduleTable({
//   schedules,
//   now,
//   onOpenBook,
// }: {
//   schedules: Schedule[];
//   now: number;
//   onOpenBook: (bookId?: Id<"books">) => void;
// }) {
//   return (
//     <Table>
//       <TableHeader>
//         <TableRow>
//           <TableHead>Date</TableHead>
//           <TableHead>Time</TableHead>
//           <TableHead>Student</TableHead>
//           <TableHead>Duration</TableHead>
//           <TableHead>Book</TableHead>
//           <TableHead>Status</TableHead>
//           <TableHead>Actions</TableHead>
//         </TableRow>
//       </TableHeader>
//       <TableBody>
//         {schedules.flatMap((s) =>
//           s.lessons.map((l) => {
//             const startMs = new Date(`${s.date}T${l.time}:00`).getTime();
//             const isActive =
//               startMs <= now && startMs + l.duration * 60 * 1000 > now;

//             return (
//               <TableRow key={`${s._id}-${l.lessonId}`}>
//                 <TableCell>{format(startMs, "PPP")}</TableCell>
//                 <TableCell>{l.time}</TableCell>
//                 <TableCell>
//                   <StudentName id={l.studentId} />
//                 </TableCell>
//                 <TableCell>{l.duration} min</TableCell>
//                 <TableCell>
//                   <Button variant="link" onClick={() => onOpenBook(l.bookId)}>
//                     <BookTitle id={l.bookId} />
//                   </Button>
//                 </TableCell>
//                 <TableCell>
//                   {l.completed ? (
//                     <Badge variant="secondary">Completed</Badge>
//                   ) : (
//                     <Badge variant={isActive ? "default" : "outline"}>
//                       {isActive ? "In Progress" : "Scheduled"}
//                     </Badge>
//                   )}
//                 </TableCell>
//                 <TableCell className="space-x-2">
//                   <Button variant="link" asChild>
//                     <Link href={`/dashboard/lesson/${s._id}/${l.lessonId}`}>
//                       View Details & Start Zoom
//                     </Link>
//                   </Button>
//                 </TableCell>
//               </TableRow>
//             );
//           })
//         )}
//       </TableBody>
//     </Table>
//   );
// }

// app/dashboard/teacher/page.tsx
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Video,
  MessageSquare,
  DollarSign,
  FileText,
  ExternalLink,
} from "lucide-react";
import { RecordingsTab } from "@/app/components/RecordingsTab";
import LiveClock from "@/app/components/LiveClock";
import { EarningsSummaryCard } from "@/app/components/EarningsSummaryCard";
import dynamic from "next/dynamic";

const LiveClocks = dynamic(() => import("@/app/components/LiveClock"), {
  ssr: false,
});

type Lesson = {
  lessonId: string;
  studentId: Id<"users">;
  time: string;
  duration: number;
  bookId?: Id<"books">;
  zoomLink?: string;
  completed: boolean;
  notes?: string;
};

type Schedule = Doc<"schedules"> & { lessons: Lesson[] };

export default function TeacherDashboard() {
  const router = useRouter();
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const currentUser = useQuery(api.users.get);

  // Redirect if no instrument selected yet
  useEffect(() => {
    if (currentUser && !currentUser.instrument) {
      router.replace("/onboarding/teacher");
    }
  }, [currentUser, router]);

  const schedules =
    useQuery(
      api.schedules.getByTeacher,
      currentUser ? { teacherId: currentUser._id } : "skip"
    ) ?? [];

  const messages =
    useQuery(
      api.messages.getByUser,
      currentUser ? { userId: currentUser._id } : "skip"
    ) ?? [];

  const payments =
    useQuery(
      api.payments.getByTeacher,
      currentUser ? { teacherId: currentUser._id } : "skip"
    ) ?? [];

  const [now] = useState<number>(() => Date.now());

  if (!clerkLoaded || currentUser === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-12 w-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "teacher") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 text-center text-red-500 bg-red-950/30 border-2 border-red-500/50 rounded-lg"
        >
          <p className="text-xl font-serif">Access denied — teachers only</p>
        </motion.div>
      </div>
    );
  }

  const upcomingSchedules = schedules.filter(
    (s: Schedule) => new Date(s.date).getTime() >= now - 24 * 60 * 60 * 1000
  );

  return (
    <div className="min-h-screen bg-background">
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
          className="text-5xl font-bold mb-12 text-primary font-serif"
        >
          Welcome back, {clerkUser?.firstName || "Teacher"}! 🎵
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs defaultValue="schedule" className="w-full">
            <TabsList className="bg-card border border-border p-1 mb-8">
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="recordings">Recordings</TabsTrigger>
            </TabsList>

            <TabsContent value="schedule">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-card border-2 border-border shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-card-foreground font-serif text-2xl">
                      <Video className="h-7 w-7 text-primary" />
                      Today&apos;s Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScheduleTable schedules={upcomingSchedules} now={now} />
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="messages">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-card border-2 border-border shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-card-foreground font-serif text-2xl">
                      <MessageSquare className="h-7 w-7 text-primary" />
                      Messages from HR
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {messages.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-muted-foreground py-12 font-serif italic"
                      >
                        No messages yet
                      </motion.div>
                    ) : (
                      messages.map((msg: Doc<"messages">, index: number) => (
                        <motion.div
                          key={msg._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="mb-4 p-4 border border-border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="text-foreground font-serif">
                            {msg.content}
                          </div>
                          <div className="text-sm text-muted-foreground mt-2 font-serif">
                            {format(msg.timestamp, "PPP p")}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="payments">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <EarningsSummaryCard teacherId={currentUser._id} />
              </motion.div>
            </TabsContent>

            <TabsContent value="recordings">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <RecordingsTab />
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

// Reusable components
function StudentName({ id }: { id: Id<"users"> }) {
  const student = useQuery(api.users.getById, { id });
  return (
    <span className="text-foreground">{student?.email ?? "Loading..."}</span>
  );
}

function BookTitle({ id }: { id?: Id<"books"> }) {
  const book = useQuery(api.books.getById, id ? { id } : "skip");

  if (!id || !book)
    return <span className="text-muted-foreground">No book</span>;

  return (
    <Button
      variant="link"
      onClick={() => window.open(book.driveViewLink, "_blank")}
      className="p-0 h-auto flex items-center gap-2 text-primary hover:text-primary/80"
    >
      <FileText className="h-4 w-4" />
      {book.title}
    </Button>
  );
}

function ScheduleTable({
  schedules,
  now,
}: {
  schedules: Schedule[];
  now: number;
}) {
  if (schedules.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Video className="h-16 w-16 mx-auto mb-4 opacity-40 text-primary" />
        </motion.div>
        <p className="text-lg text-foreground font-serif">
          No lessons scheduled
        </p>
        <p className="text-sm text-muted-foreground mt-2 font-serif">
          Check back later for your upcoming lessons
        </p>
      </motion.div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 border-b border-border hover:bg-muted/70">
            <TableHead className="text-foreground font-serif">Date</TableHead>
            <TableHead className="text-foreground font-serif">Time</TableHead>
            <TableHead className="text-foreground font-serif">
              Student
            </TableHead>
            <TableHead className="text-foreground font-serif">
              Duration
            </TableHead>
            <TableHead className="text-foreground font-serif">Book</TableHead>
            <TableHead className="text-foreground font-serif">Status</TableHead>
            <TableHead className="text-foreground font-serif">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules.flatMap((s, sIndex) =>
            s.lessons.map((l, lIndex) => {
              const startMs = new Date(`${s.date}T${l.time}:00`).getTime();
              const isActive =
                startMs <= now && startMs + l.duration * 60 * 1000 > now;
              const globalIndex = sIndex * 10 + lIndex;

              return (
                <motion.tr
                  key={`${s._id}-${l.lessonId}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: globalIndex * 0.05 }}
                  className="border-b border-border hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="text-foreground font-serif">
                    {format(startMs, "PPP")}
                  </TableCell>
                  <TableCell className="text-foreground font-serif">
                    {l.time}
                  </TableCell>
                  <TableCell>
                    <StudentName id={l.studentId} />
                  </TableCell>
                  <TableCell className="text-foreground font-serif">
                    {l.duration} min
                  </TableCell>
                  <TableCell>
                    <BookTitle id={l.bookId} />
                  </TableCell>
                  <TableCell>
                    {l.completed ? (
                      <Badge
                        variant="secondary"
                        className="bg-muted border-border text-foreground"
                      >
                        Completed
                      </Badge>
                    ) : (
                      <Badge
                        variant={isActive ? "default" : "outline"}
                        className={
                          isActive
                            ? "bg-primary text-primary-foreground border-primary shadow-lg"
                            : "border-border text-foreground"
                        }
                      >
                        {isActive ? "In Progress" : "Scheduled"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="default"
                      size="sm"
                      asChild
                      className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary shadow-lg"
                    >
                      <Link href={`/dashboard/lesson/${s._id}/${l.lessonId}`}>
                        <Video className="h-4 w-4 mr-2" />
                        View Details
                      </Link>
                    </Button>
                  </TableCell>
                </motion.tr>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
