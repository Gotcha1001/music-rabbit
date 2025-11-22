// // app/dashboard/admin/page.tsx
// "use client";

// import { useQuery, useMutation } from "convex/react";
// import { api } from "../../../../convex/_generated/api";
// import { Doc, Id } from "../../../../convex/_generated/dataModel";
// import { useState } from "react";
// import { motion } from "framer-motion";
// import { format } from "date-fns";
// import { toast } from "sonner";
// import Link from "next/link";

// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";

// import {
//   Plus,
//   Send,
//   FileText,
//   Users as UsersIcon,
//   Calendar,
//   MessageSquare,
//   Edit,
//   Trash2,
//   ExternalLink,
//   Download,
// } from "lucide-react";

// import LiveClock from "@/app/components/LiveClock";
// import dynamic from "next/dynamic";
// const LiveClocks = dynamic(() => import("@/app/components/LiveClock"), {
//   ssr: false,
// });

// export default function AdminDashboard() {
//   const teachers = (useQuery(api.users.getAllTeachers) as Doc<"users">[]) || [];
//   const students = (useQuery(api.users.getAllStudents) as Doc<"users">[]) || [];
//   const schedules =
//     (useQuery(api.schedules.getAll) as Doc<"schedules">[]) || [];
//   const books = (useQuery(api.books.getAll) as Doc<"books">[]) || [];

//   const addLesson = useMutation(api.schedules.addLesson);
//   const sendMessage = useMutation(api.messages.send);
//   const updateUserRole = useMutation(api.users.updateRole);
//   const deleteUser = useMutation(api.users.remove);
//   const calculateMonth = useMutation(api.payments.calculateMonth);
//   const deleteLesson = useMutation(api.schedules.deleteLesson);

//   const [selectedTeacher, setSelectedTeacher] = useState<string>("");
//   const [selectedStudent, setSelectedStudent] = useState<string>("");
//   const [date, setDate] = useState("");
//   const [time, setTime] = useState("");
//   const [duration, setDuration] = useState(30);
//   const [bookId, setBookId] = useState<string>("");
//   const [messageContent, setMessageContent] = useState("");
//   const [bookTitle, setBookTitle] = useState("");
//   const [bookLevel, setBookLevel] = useState("basic");
//   const [bookInstrument, setBookInstrument] = useState("");
//   const [bookFile, setBookFile] = useState<File | null>(null);
//   const [zoomLink, setZoomLink] = useState("");
//   const [calcMonth, setCalcMonth] = useState("");

//   const instruments = [
//     "Piano",
//     "Guitar",
//     "Violin",
//     "Drums",
//     "Flute",
//     "Saxophone",
//     "Trumpet",
//     "Cello",
//     "Bass Guitar",
//     "Voice",
//     "Ukulele",
//     "Clarinet",
//     "Other",
//   ];

//   const handleAddLesson = async () => {
//     if (!selectedTeacher || !selectedStudent || !date || !time) {
//       toast.error("Please fill all required fields");
//       return;
//     }
//     await addLesson({
//       teacherId: selectedTeacher as Id<"users">,
//       date,
//       lesson: {
//         studentId: selectedStudent as Id<"users">,
//         time,
//         duration,
//         bookId: bookId ? (bookId as Id<"books">) : undefined,
//         zoomLink: zoomLink || undefined,
//         completed: false,
//         notes: "",
//       },
//     });
//     toast.success("Lesson added");
//     setSelectedTeacher("");
//     setSelectedStudent("");
//     setDate("");
//     setTime("");
//     setZoomLink("");
//     setDuration(30);
//     setBookId("");
//   };

//   const handleSendMessage = async () => {
//     if (!selectedTeacher || !messageContent) return;
//     await sendMessage({
//       toId: selectedTeacher as Id<"users">,
//       content: messageContent,
//     });
//     setMessageContent("");
//     toast.success("Message sent");
//   };

//   const handleUploadBook = async () => {
//     if (!bookFile || !bookTitle || !bookInstrument) {
//       toast.error("Title, instrument and file are required");
//       return;
//     }
//     const formData = new FormData();
//     formData.append("file", bookFile);
//     formData.append("title", bookTitle);
//     formData.append("level", bookLevel);
//     formData.append("instrument", bookInstrument);

//     const res = await fetch("/api/upload-book", {
//       method: "POST",
//       body: formData,
//     });
//     if (res.ok) {
//       toast.success("Book uploaded!");
//       setBookTitle("");
//       setBookLevel("basic");
//       setBookInstrument("");
//       setBookFile(null);
//     } else toast.error("Upload failed");
//   };

//   const handleDeleteBook = async (bookId: Id<"books">, driveFileId: string) => {
//     if (!confirm("Permanently delete this book?")) return;
//     const res = await fetch("/api/books/delete", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ bookId, driveFileId }),
//     });
//     res.ok ? toast.success("Book deleted") : toast.error("Failed to delete");
//   };

//   const handleUpdateRole = async (
//     userId: Id<"users">,
//     newRole: "admin" | "teacher" | "student"
//   ) => {
//     await updateUserRole({ userId, role: newRole });
//     toast.success("Role updated");
//   };

//   const handleDeleteUser = async (userId: Id<"users">) => {
//     if (!confirm("Delete this user?")) return;
//     await deleteUser({ userId });
//     toast.success("User deleted");
//   };

//   return (
//     <div className="min-h-screen bg-background text-foreground">
//       <div className="container mx-auto p-6 max-w-7xl">
//         {/* Clock */}
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="mb-8"
//         >
//           <LiveClock />
//         </motion.div>

//         {/* Title */}
//         <motion.h1
//           initial={{ opacity: 0, x: -30 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.8 }}
//           className="text-5xl font-bold mb-12 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80 font-serif"
//         >
//           Admin (HR) Dashboard
//         </motion.h1>

//         <Tabs defaultValue="schedules" className="space-y-8">
//           <TabsList className="grid w-full grid-cols-5 bg-muted/70 backdrop-blur-sm border border-border">
//             <TabsTrigger value="schedules">Schedules</TabsTrigger>
//             <TabsTrigger value="messages">Messages</TabsTrigger>
//             <TabsTrigger value="books">Books</TabsTrigger>
//             <TabsTrigger value="users">Users</TabsTrigger>
//             <TabsTrigger value="invites">Invites</TabsTrigger>
//           </TabsList>

//           {/* ==================== SCHEDULES ==================== */}
//           <TabsContent value="schedules" className="space-y-8">
//             <Card className="bg-card border-border shadow-lg">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-3 text-2xl">
//                   <Calendar className="h-7 w-7" />
//                   Add Lesson to Schedule
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <Label>Teacher</Label>
//                     <Select
//                       value={selectedTeacher}
//                       onValueChange={setSelectedTeacher}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select teacher" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {teachers.map((t) => (
//                           <SelectItem key={t._id} value={t._id}>
//                             {t.email} ({t.instrument || "N/A"})
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div>
//                     <Label>Student</Label>
//                     <Select
//                       value={selectedStudent}
//                       onValueChange={setSelectedStudent}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select student" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {students.map((s) => (
//                           <SelectItem key={s._id} value={s._id}>
//                             {s.email} ({s.instrument || "N/A"})
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div>
//                     <Label>Book (Optional)</Label>
//                     <Select value={bookId} onValueChange={setBookId}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select book" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {books.map((b) => (
//                           <SelectItem key={b._id} value={b._id}>
//                             {b.title}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div>
//                     <Label>Zoom Link (optional)</Label>
//                     <Input
//                       placeholder="https://zoom.us/j/..."
//                       value={zoomLink}
//                       onChange={(e) => setZoomLink(e.target.value)}
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-3 gap-4">
//                   <div>
//                     <Label>Date</Label>
//                     <Input
//                       type="date"
//                       value={date}
//                       onChange={(e) => setDate(e.target.value)}
//                     />
//                   </div>
//                   <div>
//                     <Label>Time</Label>
//                     <Input
//                       type="time"
//                       value={time}
//                       onChange={(e) => setTime(e.target.value)}
//                     />
//                   </div>
//                   <div>
//                     <Label>Duration (min)</Label>
//                     <Input
//                       type="number"
//                       value={duration}
//                       onChange={(e) => setDuration(+e.target.value)}
//                     />
//                   </div>
//                 </div>

//                 <Button
//                   onClick={handleAddLesson}
//                   className="bg-primary hover:bg-primary/90 text-primary-foreground"
//                 >
//                   <Plus className="mr-2 h-4 w-4" /> Add Lesson
//                 </Button>
//               </CardContent>
//             </Card>

//             {/* Current Schedules */}
//             <Card className="bg-card border-border shadow-lg">
//               <CardHeader>
//                 <CardTitle className="text-2xl">
//                   Current Schedules & Lessons
//                 </CardTitle>
//                 <CardDescription>
//                   Click “Cancel” to remove a lesson
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 {schedules.length === 0 ? (
//                   <p className="text-center text-muted-foreground py-12">
//                     No scheduled lessons yet
//                   </p>
//                 ) : (
//                   schedules.map((sched) => {
//                     const teacher = teachers.find(
//                       (t) => t._id === sched.teacherId
//                     );
//                     const teacherName =
//                       teacher?.email.split("@")[0] || "Unknown";
//                     return (
//                       <div
//                         key={sched._id}
//                         className="mb-8 border rounded-lg overflow-hidden"
//                       >
//                         <div className="bg-muted/50 p-4 flex justify-between items-center">
//                           <div>
//                             <p className="font-semibold">
//                               {teacherName} •{" "}
//                               {format(
//                                 new Date(sched.date),
//                                 "EEEE, MMMM d, yyyy"
//                               )}
//                             </p>
//                             <p className="text-sm text-muted-foreground">
//                               {sched.lessons.length} lesson(s)
//                             </p>
//                           </div>
//                         </div>
//                         <Table>
//                           <TableHeader>
//                             <TableRow>
//                               <TableHead>Student</TableHead>
//                               <TableHead>Time</TableHead>
//                               <TableHead>Duration</TableHead>
//                               <TableHead>Book</TableHead>
//                               <TableHead className="text-right">
//                                 Actions
//                               </TableHead>
//                             </TableRow>
//                           </TableHeader>
//                           <TableBody>
//                             {sched.lessons.map((lesson, idx) => {
//                               const student = students.find(
//                                 (s) => s._id === lesson.studentId
//                               );
//                               const book = lesson.bookId
//                                 ? books.find((b) => b._id === lesson.bookId)
//                                 : null;
//                               return (
//                                 <TableRow key={idx}>
//                                   <TableCell>
//                                     {student?.email.split("@")[0] || "Unknown"}
//                                   </TableCell>
//                                   <TableCell>{lesson.time}</TableCell>
//                                   <TableCell>{lesson.duration} min</TableCell>
//                                   <TableCell>{book?.title || "—"}</TableCell>
//                                   <TableCell className="text-right">
//                                     <Button
//                                       size="sm"
//                                       variant="destructive"
//                                       onClick={async () => {
//                                         if (!confirm("Cancel this lesson?"))
//                                           return;
//                                         await deleteLesson({
//                                           scheduleId: sched._id,
//                                           lessonIndex: idx,
//                                         });
//                                         toast.success("Lesson cancelled");
//                                       }}
//                                     >
//                                       <Trash2 className="h-4 w-4 mr-1" /> Cancel
//                                     </Button>
//                                   </TableCell>
//                                 </TableRow>
//                               );
//                             })}
//                           </TableBody>
//                         </Table>
//                       </div>
//                     );
//                   })
//                 )}
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* ==================== MESSAGES ==================== */}
//           <TabsContent value="messages">
//             <Card className="bg-card border-border shadow-lg">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-3 text-2xl">
//                   <MessageSquare className="h-7 w-7" /> Send Message to Teacher
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div>
//                   <Label>Teacher</Label>
//                   <Select
//                     value={selectedTeacher}
//                     onValueChange={setSelectedTeacher}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select teacher" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {teachers.map((t) => (
//                         <SelectItem key={t._id} value={t._id}>
//                           {t.email}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div>
//                   <Label>Message</Label>
//                   <Textarea
//                     value={messageContent}
//                     onChange={(e) => setMessageContent(e.target.value)}
//                     className="min-h-32"
//                   />
//                 </div>
//                 <Button
//                   onClick={handleSendMessage}
//                   className="bg-primary hover:bg-primary/90 text-primary-foreground"
//                 >
//                   <Send className="mr-2 h-4 w-4" /> Send
//                 </Button>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* ==================== BOOKS ==================== */}
//           <TabsContent value="books" className="space-y-8">
//             {/* Upload */}
//             <Card className="bg-card border-border shadow-lg">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-3 text-2xl">
//                   <FileText className="h-7 w-7" /> Upload New PDF Book
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <Label>Title</Label>
//                     <Input
//                       value={bookTitle}
//                       onChange={(e) => setBookTitle(e.target.value)}
//                       placeholder="Alfred's Basic Piano Level 1"
//                     />
//                   </div>
//                   <div>
//                     <Label>Level</Label>
//                     <Select value={bookLevel} onValueChange={setBookLevel}>
//                       <SelectTrigger>
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="basic">Basic</SelectItem>
//                         <SelectItem value="intermediate">
//                           Intermediate
//                         </SelectItem>
//                         <SelectItem value="advanced">Advanced</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div>
//                     <Label>Instrument</Label>
//                     <Select
//                       value={bookInstrument}
//                       onValueChange={setBookInstrument}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select instrument" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {instruments.map((i) => (
//                           <SelectItem key={i} value={i}>
//                             {i}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div>
//                     <Label>PDF File</Label>
//                     <Input
//                       type="file"
//                       accept=".pdf"
//                       onChange={(e) => setBookFile(e.target.files?.[0] || null)}
//                     />
//                   </div>
//                 </div>
//                 <Button
//                   onClick={handleUploadBook}
//                   disabled={!bookFile || !bookTitle || !bookInstrument}
//                   className="bg-primary hover:bg-primary/90 text-primary-foreground"
//                 >
//                   <Plus className="mr-2 h-4 w-4" /> Upload Book
//                 </Button>
//               </CardContent>
//             </Card>

//             {/* Library Grid */}
//             <div>
//               <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80 font-serif">
//                 Library ({books.length} books)
//               </h2>
//               {books.length === 0 ? (
//                 <Card className="bg-card border-border">
//                   <CardContent className="text-center py-16 text-muted-foreground">
//                     No books uploaded yet
//                   </CardContent>
//                 </Card>
//               ) : (
//                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
//                   {books.map((book, i) => (
//                     <motion.div
//                       key={book._id}
//                       initial={{ opacity: 0, scale: 0.9 }}
//                       animate={{ opacity: 1, scale: 1 }}
//                       transition={{ delay: i * 0.05 }}
//                       className="relative group"
//                     >
//                       <Button
//                         size="icon"
//                         variant="destructive"
//                         className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
//                         onClick={() =>
//                           handleDeleteBook(book._id, book.driveFileId)
//                         }
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                       <Card className="h-full bg-card border-border shadow-lg hover:shadow-xl transition-shadow group-hover:scale-105 transition-transform">
//                         <CardHeader>
//                           <div className="flex items-start justify-between">
//                             <FileText className="h-8 w-8 text-primary" />
//                             <div className="flex gap-2">
//                               <Badge variant="secondary">{book.level}</Badge>
//                               <Badge variant="outline">{book.instrument}</Badge>
//                             </div>
//                           </div>
//                           <CardTitle className="text-lg mt-2 pr-8">
//                             {book.title}
//                           </CardTitle>
//                         </CardHeader>
//                         <CardContent>
//                           <div className="flex gap-2">
//                             <Button
//                               variant="default"
//                               size="sm"
//                               className="flex-1"
//                               onClick={() =>
//                                 window.open(book.driveViewLink, "_blank")
//                               }
//                             >
//                               <ExternalLink className="mr-2 h-4 w-4" /> View
//                             </Button>
//                             {book.driveDownloadLink && (
//                               <Button
//                                 variant="outline"
//                                 size="sm"
//                                 onClick={() =>
//                                   window.open(book.driveDownloadLink, "_blank")
//                                 }
//                               >
//                                 <Download className="h-4 w-4" />
//                               </Button>
//                             )}
//                           </div>
//                           <p className="text-xs text-muted-foreground mt-3">
//                             Uploaded {format(book.uploadedAt, "PP")}
//                           </p>
//                         </CardContent>
//                       </Card>
//                     </motion.div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </TabsContent>

//           {/* ==================== USERS ==================== */}
//           <TabsContent value="users">
//             <Card className="bg-card border-border shadow-lg">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-3 text-2xl">
//                   <UsersIcon className="h-7 w-7" /> Manage Users
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <Tabs defaultValue="teachers">
//                   <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/70">
//                     <TabsTrigger value="teachers">Teachers</TabsTrigger>
//                     <TabsTrigger value="students">Students</TabsTrigger>
//                     <TabsTrigger value="payments">Payments</TabsTrigger>
//                   </TabsList>

//                   <TabsContent value="teachers">
//                     <Table>
//                       <TableHeader>
//                         <TableRow>
//                           <TableHead>Email</TableHead>
//                           <TableHead>Instrument</TableHead>
//                           <TableHead>Role</TableHead>
//                           <TableHead>Actions</TableHead>
//                         </TableRow>
//                       </TableHeader>
//                       <TableBody>
//                         {teachers.map((t) => (
//                           <TableRow key={t._id}>
//                             <TableCell>{t.email}</TableCell>
//                             <TableCell>{t.instrument || "N/A"}</TableCell>
//                             <TableCell>{t.role}</TableCell>
//                             <TableCell className="flex gap-2">
//                               <Button
//                                 variant="outline"
//                                 size="sm"
//                                 onClick={() => handleUpdateRole(t._id, "admin")}
//                               >
//                                 Promote
//                               </Button>
//                               <Button
//                                 variant="destructive"
//                                 size="sm"
//                                 onClick={() => handleDeleteUser(t._id)}
//                               >
//                                 Delete
//                               </Button>
//                             </TableCell>
//                           </TableRow>
//                         ))}
//                       </TableBody>
//                     </Table>
//                   </TabsContent>

//                   <TabsContent value="students">
//                     <Table>
//                       <TableHeader>
//                         <TableRow>
//                           <TableHead>Email</TableHead>
//                           <TableHead>Instrument</TableHead>
//                           <TableHead>Role</TableHead>
//                           <TableHead>Actions</TableHead>
//                         </TableRow>
//                       </TableHeader>
//                       <TableBody>
//                         {students.map((s) => (
//                           <TableRow key={s._id}>
//                             <TableCell>{s.email}</TableCell>
//                             <TableCell>{s.instrument || "N/A"}</TableCell>
//                             <TableCell>{s.role}</TableCell>
//                             <TableCell className="flex gap-2">
//                               <Button
//                                 variant="outline"
//                                 size="sm"
//                                 onClick={() =>
//                                   handleUpdateRole(s._id, "teacher")
//                                 }
//                               >
//                                 Promote
//                               </Button>
//                               <Button
//                                 variant="destructive"
//                                 size="sm"
//                                 onClick={() => handleDeleteUser(s._id)}
//                               >
//                                 Delete
//                               </Button>
//                             </TableCell>
//                           </TableRow>
//                         ))}
//                       </TableBody>
//                     </Table>
//                   </TabsContent>

//                   <TabsContent value="payments">
//                     <Card className="bg-muted/50 border-border">
//                       <CardHeader>
//                         <CardTitle>Calculate Monthly Payments</CardTitle>
//                       </CardHeader>
//                       <CardContent>
//                         <div className="flex gap-2">
//                           <Input
//                             placeholder="2025-11"
//                             value={calcMonth}
//                             onChange={(e) => setCalcMonth(e.target.value)}
//                           />
//                           <Button
//                             onClick={async () => {
//                               await calculateMonth({ month: calcMonth });
//                               toast.success("Payments calculated!");
//                             }}
//                             className="bg-primary hover:bg-primary/90 text-primary-foreground"
//                           >
//                             Calculate
//                           </Button>
//                         </div>
//                       </CardContent>
//                     </Card>
//                   </TabsContent>
//                 </Tabs>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* ==================== INVITES ==================== */}
//           <TabsContent value="invites">
//             <Card className="bg-card border-border shadow-lg">
//               <CardContent className="pt-6">
//                 <Link href="/dashboard/admin/invite-codes" className="block">
//                   <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
//                     Go to Invite Codes Management
//                   </Button>
//                 </Link>
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </Tabs>
//       </div>
//     </div>
//   );
// }

// app/dashboard/admin/page.tsx
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Doc, Id } from "../../../../convex/_generated/dataModel";

import { useState } from "react";
import { motion } from "framer-motion";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";

import {
  Plus,
  Send,
  FileText,
  Users as UsersIcon,
  Calendar,
  MessageSquare,
  Edit,
  Trash,
  ExternalLink,
  Download,
  Trash2,
  Loader2,
  Users,
} from "lucide-react";

import Link from "next/link";
import LiveClock from "@/app/components/LiveClock";

export default function AdminDashboard() {
  const teachers = (useQuery(api.users.getAllTeachers) as Doc<"users">[]) || [];
  const students = (useQuery(api.users.getAllStudents) as Doc<"users">[]) || [];
  const schedules =
    (useQuery(api.schedules.getAll) as Doc<"schedules">[]) || [];
  const books = (useQuery(api.books.getAll) as Doc<"books">[]) || [];

  const addLesson = useMutation(api.schedules.addLesson);
  const sendMessage = useMutation(api.messages.send);
  const updateUserRole = useMutation(api.users.updateRole);
  const deleteUser = useMutation(api.users.remove);
  const calculateMonth = useMutation(api.payments.calculateMonth);

  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(30);
  const [bookId, setBookId] = useState<string>("");
  const [messageContent, setMessageContent] = useState("");
  const [bookTitle, setBookTitle] = useState("");
  const [bookLevel, setBookLevel] = useState("basic");
  const [bookInstrument, setBookInstrument] = useState("");
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [zoomLink, setZoomLink] = useState("");
  const [calcMonth, setCalcMonth] = useState("");

  const deleteLesson = useMutation(api.schedules.deleteLesson);

  const instruments = [
    "Piano",
    "Guitar",
    "Violin",
    "Drums",
    "Flute",
    "Saxophone",
    "Trumpet",
    "Cello",
    "Bass Guitar",
    "Voice",
    "Ukulele",
    "Clarinet",
    "Other",
  ];

  const handleAddLesson = async () => {
    if (!selectedTeacher || !selectedStudent || !date || !time) {
      toast.error("Please fill all required fields");
      return;
    }
    await addLesson({
      teacherId: selectedTeacher as Id<"users">,
      date,
      lesson: {
        studentId: selectedStudent as Id<"users">,
        time,
        duration,
        bookId: bookId ? (bookId as Id<"books">) : undefined,
        zoomLink: zoomLink || undefined,
        completed: false,
        notes: "",
      },
    });
    toast.success("Lesson added");
    setSelectedTeacher("");
    setSelectedStudent("");
    setDate("");
    setTime("");
    setZoomLink("");
    setDuration(30);
    setBookId("");
  };

  const handleSendMessage = async () => {
    if (!selectedTeacher || !messageContent) return;
    await sendMessage({
      toId: selectedTeacher as Id<"users">,
      content: messageContent,
    });
    setMessageContent("");
    toast.success("Message sent");
  };

  const handleUploadBook = async () => {
    if (!bookFile || !bookTitle || !bookInstrument) {
      toast.error("Title, instrument and file are required");
      return;
    }
    const formData = new FormData();
    formData.append("file", bookFile);
    formData.append("title", bookTitle);
    formData.append("level", bookLevel);
    formData.append("instrument", bookInstrument);

    const res = await fetch("/api/upload-book", {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      toast.success("Book uploaded!");
      setBookTitle("");
      setBookLevel("basic");
      setBookInstrument("");
      setBookFile(null);
    } else {
      toast.error("Upload failed");
    }
  };

  const handleDeleteBook = async (bookId: Id<"books">, driveFileId: string) => {
    if (!confirm("Permanently delete this book?")) return;
    const res = await fetch("/api/books/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId, driveFileId }),
    });
    if (res.ok) toast.success("Book deleted");
    else toast.error("Failed to delete");
  };

  const handleUpdateRole = async (
    userId: Id<"users">,
    newRole: "admin" | "teacher" | "student"
  ) => {
    await updateUserRole({ userId, role: newRole });
    toast.success("Role updated");
  };

  const handleDeleteUser = async (userId: Id<"users">) => {
    if (!confirm("Delete this user?")) return;
    await deleteUser({ userId });
    toast.success("User deleted");
  };

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
          Admin (HR) Dashboard
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs defaultValue="schedules" className="space-y-4">
            {/* Styled tab list */}
            <TabsList className="bg-card border border-border p-1">
              <TabsTrigger value="schedules">Manage Schedules</TabsTrigger>
              <TabsTrigger value="messages">Send Messages</TabsTrigger>
              <TabsTrigger value="books">Books / Library</TabsTrigger>
              <TabsTrigger value="users">Manage Users</TabsTrigger>
              <TabsTrigger value="invites">Invite Codes</TabsTrigger>
            </TabsList>

            {/* ====================== SCHEDULES TAB ====================== */}
            <TabsContent value="schedules">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <Card className="bg-card border-2 border-border shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-card-foreground font-serif text-2xl">
                      <Calendar className="h-7 w-7 text-primary" />
                      Add Lesson to Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-foreground font-serif">
                        Teacher
                      </Label>
                      <Select
                        value={selectedTeacher}
                        onValueChange={setSelectedTeacher}
                      >
                        <SelectTrigger className="bg-input border-border text-foreground">
                          <SelectValue placeholder="Select teacher" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          {teachers.map((t) => (
                            <SelectItem key={t._id} value={t._id}>
                              {t.email} ({t.instrument || "N/A"})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-foreground font-serif">
                        Student
                      </Label>
                      <Select
                        value={selectedStudent}
                        onValueChange={setSelectedStudent}
                      >
                        <SelectTrigger className="bg-input border-border text-foreground">
                          <SelectValue placeholder="Select student" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          {students.map((s) => (
                            <SelectItem key={s._id} value={s._id}>
                              {s.email} ({s.instrument || "N/A"})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-foreground font-serif">
                        Book (Optional)
                      </Label>
                      <Select value={bookId} onValueChange={setBookId}>
                        <SelectTrigger className="bg-input border-border text-foreground">
                          <SelectValue placeholder="Select book" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          {books.map((b) => (
                            <SelectItem key={b._id} value={b._id}>
                              {b.title} ({b.level}, {b.instrument})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-foreground font-serif">
                        Zoom Link (optional)
                      </Label>
                      <Input
                        placeholder="https://zoom.us/j/..."
                        value={zoomLink}
                        onChange={(e) => setZoomLink(e.target.value)}
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-foreground font-serif">
                          Date (YYYY-MM-DD)
                        </Label>
                        <Input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="bg-input border-border text-foreground"
                        />
                      </div>
                      <div>
                        <Label className="text-foreground font-serif">
                          Time (HH:MM)
                        </Label>
                        <Input
                          type="time"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          className="bg-input border-border text-foreground"
                        />
                      </div>
                      <div>
                        <Label className="text-foreground font-serif">
                          Duration (min)
                        </Label>
                        <Input
                          type="number"
                          value={duration}
                          onChange={(e) => setDuration(Number(e.target.value))}
                          className="bg-input border-border text-foreground"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleAddLesson}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Lesson
                    </Button>
                  </CardContent>
                </Card>

                {/* ====================== CURRENT SCHEDULES WITH DELETE ====================== */}
                <Card className="bg-card border-2 border-border shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-card-foreground font-serif text-2xl">
                      Current Schedules & Lessons
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Click delete to cancel a lesson and free the slot
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {schedules.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No scheduled lessons yet
                      </p>
                    ) : (
                      schedules.map((sched) => {
                        const teacher = teachers.find(
                          (t) => t._id === sched.teacherId
                        );
                        const teacherName =
                          teacher?.email.split("@")[0] || sched.teacherId;

                        return (
                          <div
                            key={sched._id}
                            className="border border-border rounded-lg overflow-hidden"
                          >
                            <div className="bg-muted/50 p-4 flex justify-between items-center">
                              <div>
                                <p className="text-foreground font-serif font-bold">
                                  {teacherName} •{" "}
                                  {format(
                                    new Date(sched.date),
                                    "EEEE, MMMM d, yyyy"
                                  )}
                                </p>
                                <p className="text-muted-foreground text-sm">
                                  {sched.lessons.length} lesson(s)
                                </p>
                              </div>
                            </div>

                            <Table>
                              <TableHeader>
                                <TableRow className="bg-muted/30">
                                  <TableHead className="text-foreground">
                                    Student
                                  </TableHead>
                                  <TableHead className="text-foreground">
                                    Time
                                  </TableHead>
                                  <TableHead className="text-foreground">
                                    Duration
                                  </TableHead>
                                  <TableHead className="text-foreground">
                                    Book
                                  </TableHead>
                                  <TableHead className="text-foreground text-right">
                                    Actions
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {sched.lessons.map((lesson, idx) => {
                                  const student = students.find(
                                    (s) => s._id === lesson.studentId
                                  );
                                  const book = lesson.bookId
                                    ? books.find((b) => b._id === lesson.bookId)
                                    : null;

                                  return (
                                    <TableRow
                                      key={idx}
                                      className="hover:bg-muted/30"
                                    >
                                      <TableCell className="text-foreground">
                                        {student?.email.split("@")[0] ||
                                          "Unknown"}
                                      </TableCell>
                                      <TableCell className="text-foreground">
                                        {lesson.time}
                                      </TableCell>
                                      <TableCell className="text-foreground">
                                        {lesson.duration} min
                                      </TableCell>
                                      <TableCell className="text-foreground">
                                        {book ? book.title : "—"}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={async () => {
                                            if (
                                              !confirm(
                                                "Cancel this lesson? This cannot be undone."
                                              )
                                            )
                                              return;

                                            await deleteLesson({
                                              scheduleId: sched._id,
                                              lessonIndex: idx,
                                            });
                                            toast.success("Lesson cancelled");
                                          }}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          <Trash2 className="h-4 w-4 mr-1" />
                                          Cancel
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        );
                      })
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* ====================== MESSAGES TAB ====================== */}
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
                      Send Message to Teacher
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-foreground font-serif">
                        Teacher
                      </Label>
                      <Select
                        value={selectedTeacher}
                        onValueChange={setSelectedTeacher}
                      >
                        <SelectTrigger className="bg-input border-border text-foreground">
                          <SelectValue placeholder="Select teacher" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          {teachers.map((t) => (
                            <SelectItem key={t._id} value={t._id}>
                              {t.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-foreground font-serif">
                        Message
                      </Label>
                      <Textarea
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-32 font-serif"
                      />
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary"
                    >
                      <Send className="mr-2 h-4 w-4" /> Send
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* ====================== BOOKS / LIBRARY TAB ====================== */}
            <TabsContent value="books" className="space-y-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-card border-2 border-border shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-card-foreground font-serif text-2xl">
                      <FileText className="h-7 w-7 text-primary" />
                      Upload New PDF Book
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-foreground font-serif">
                          Title
                        </Label>
                        <Input
                          value={bookTitle}
                          onChange={(e) => setBookTitle(e.target.value)}
                          placeholder="e.g. Alfred's Basic Piano Level 1"
                          className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                      <div>
                        <Label className="text-foreground font-serif">
                          Level
                        </Label>
                        <Select value={bookLevel} onValueChange={setBookLevel}>
                          <SelectTrigger className="bg-input border-border text-foreground">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="intermediate">
                              Intermediate
                            </SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-foreground font-serif">
                          Instrument
                        </Label>
                        <Select
                          value={bookInstrument}
                          onValueChange={setBookInstrument}
                        >
                          <SelectTrigger className="bg-input border-border text-foreground">
                            <SelectValue placeholder="Select instrument" />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            {instruments.map((i) => (
                              <SelectItem key={i} value={i}>
                                {i}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-foreground font-serif">
                          PDF File
                        </Label>
                        <Input
                          type="file"
                          accept=".pdf"
                          onChange={(e) =>
                            setBookFile(e.target.files?.[0] || null)
                          }
                          className="bg-input border-border text-foreground"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleUploadBook}
                      disabled={!bookFile || !bookTitle || !bookInstrument}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary disabled:opacity-50"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Upload Book
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Library Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2 className="text-3xl font-bold mb-6 text-primary font-serif">
                  Library ({books.length} books)
                </h2>

                {books.length === 0 ? (
                  <Card className="bg-card border-2 border-border">
                    <CardContent className="text-center py-16">
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <FileText className="h-16 w-16 mx-auto mb-4 opacity-40 text-primary" />
                      </motion.div>
                      <p className="text-lg text-muted-foreground font-serif">
                        No books uploaded yet
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {books.map((book, index) => (
                      <motion.div
                        key={book._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative group"
                      >
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-red-700 hover:bg-red-600"
                          onClick={() =>
                            handleDeleteBook(book._id, book.driveFileId)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                        <Card className="h-full bg-card border border-border shadow-lg hover:shadow-xl transition-shadow group-hover:scale-105 transition-transform">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <FileText className="h-8 w-8 text-primary" />
                              <div className="flex gap-2">
                                <Badge
                                  variant="outline"
                                  className="bg-muted border-border text-foreground"
                                >
                                  {book.level}
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className="bg-primary/20 text-primary border-primary/30"
                                >
                                  {book.instrument}
                                </Badge>
                              </div>
                            </div>
                            <CardTitle className="text-lg mt-2 pr-8 text-card-foreground font-serif">
                              {book.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex gap-2">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() =>
                                  window.open(book.driveViewLink, "_blank")
                                }
                                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground border border-primary"
                              >
                                <ExternalLink className="mr-2 h-4 w-4" /> View
                              </Button>
                              {book.driveDownloadLink && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    window.open(
                                      book.driveDownloadLink,
                                      "_blank"
                                    )
                                  }
                                  className="border-border text-foreground hover:bg-muted"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-3 font-serif">
                              Uploaded {format(book.uploadedAt, "PP")}
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </TabsContent>

            {/* ====================== USERS TAB ====================== */}
            <TabsContent value="users">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-card border-2 border-border shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-card-foreground font-serif text-2xl">
                      <Users className="h-7 w-7 text-primary" />
                      Manage Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="teachers">
                      <TabsList className="bg-muted border border-border mb-6">
                        <TabsTrigger
                          value="teachers"
                          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                          Teachers
                        </TabsTrigger>
                        <TabsTrigger
                          value="students"
                          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                          Students
                        </TabsTrigger>
                        <TabsTrigger
                          value="payments"
                          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                          Payments
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="teachers">
                        <div className="rounded-lg border border-border overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/50 border-b border-border">
                                <TableHead className="text-foreground font-serif">
                                  Email
                                </TableHead>
                                <TableHead className="text-foreground font-serif">
                                  Instrument
                                </TableHead>
                                <TableHead className="text-foreground font-serif">
                                  Role
                                </TableHead>
                                <TableHead className="text-foreground font-serif">
                                  Actions
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {teachers.map((t, index) => (
                                <motion.tr
                                  key={t._id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="border-b border-border hover:bg-muted/30 transition-colors"
                                >
                                  <TableCell className="text-foreground font-serif">
                                    {t.email}
                                  </TableCell>
                                  <TableCell className="text-foreground font-serif">
                                    {t.instrument || "N/A"}
                                  </TableCell>
                                  <TableCell className="text-foreground font-serif">
                                    {t.role}
                                  </TableCell>
                                  <TableCell className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleUpdateRole(t._id, "admin")
                                      }
                                      className="text-primary hover:text-primary hover:bg-primary/10"
                                    >
                                      <Edit className="h-4 w-4 mr-1" /> Promote
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteUser(t._id)}
                                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                    >
                                      <Trash className="h-4 w-4 mr-1" /> Delete
                                    </Button>
                                  </TableCell>
                                </motion.tr>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </TabsContent>

                      <TabsContent value="students">
                        <div className="rounded-lg border border-border overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/50 border-b border-border">
                                <TableHead className="text-foreground font-serif">
                                  Email
                                </TableHead>
                                <TableHead className="text-foreground font-serif">
                                  Instrument
                                </TableHead>
                                <TableHead className="text-foreground font-serif">
                                  Role
                                </TableHead>
                                <TableHead className="text-foreground font-serif">
                                  Actions
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {students.map((s, index) => (
                                <motion.tr
                                  key={s._id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  className="border-b border-border hover:bg-muted/30 transition-colors"
                                >
                                  <TableCell className="text-foreground font-serif">
                                    {s.email}
                                  </TableCell>
                                  <TableCell className="text-foreground font-serif">
                                    {s.instrument || "N/A"}
                                  </TableCell>
                                  <TableCell className="text-foreground font-serif">
                                    {s.role}
                                  </TableCell>
                                  <TableCell className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleUpdateRole(s._id, "teacher")
                                      }
                                      className="text-primary hover:text-primary hover:bg-primary/10"
                                    >
                                      <Edit className="h-4 w-4 mr-1" /> Promote
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteUser(s._id)}
                                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                    >
                                      <Trash className="h-4 w-4 mr-1" /> Delete
                                    </Button>
                                  </TableCell>
                                </motion.tr>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </TabsContent>

                      <TabsContent value="payments">
                        <Card className="bg-muted/50 border border-border">
                          <CardHeader>
                            <CardTitle className="text-card-foreground font-serif">
                              Calculate Monthly Payments
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex gap-2">
                              <Input
                                placeholder="2025-11"
                                value={calcMonth}
                                onChange={(e) => setCalcMonth(e.target.value)}
                                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                              />
                              <Button
                                onClick={async () => {
                                  await calculateMonth({ month: calcMonth });
                                  toast.success("Payments calculated!");
                                }}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary"
                              >
                                Calculate
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* ====================== INVITES TAB ====================== */}
            <TabsContent value="invites">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-card border-2 border-border shadow-lg">
                  <CardContent className="pt-6">
                    <Link href="/dashboard/admin/invite-codes">
                      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary w-full">
                        Go to Invite Codes Management
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
