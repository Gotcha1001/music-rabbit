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
} from "lucide-react";

import Link from "next/link";
import LiveClock from "@/app/components/LiveClock";
import dynamic from "next/dynamic";

const LiveClocks = dynamic(() => import("@/app/components/LiveClock"), {
  ssr: false,
});

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
          Admin (HR) Dashboard
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs defaultValue="schedules" className="space-y-4">
            {/* Styled tab list */}
            <TabsList className="bg-purple-900/30 border border-purple-800/30 p-1">
              <TabsTrigger
                value="schedules"
                className="data-[state=active]:bg-purple-800 data-[state=active]:text-purple-100"
              >
                Manage Schedules
              </TabsTrigger>
              <TabsTrigger
                value="messages"
                className="data-[state=active]:bg-purple-800 data-[state=active]:text-purple-100"
              >
                Send Messages
              </TabsTrigger>
              <TabsTrigger
                value="books"
                className="data-[state=active]:bg-purple-800 data-[state=active]:text-purple-100"
              >
                Books / Library
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="data-[state=active]:bg-purple-800 data-[state=active]:text-purple-100"
              >
                Manage Users
              </TabsTrigger>
              <TabsTrigger
                value="invites"
                className="data-[state=active]:bg-purple-800 data-[state=active]:text-purple-100"
              >
                Invite Codes
              </TabsTrigger>
            </TabsList>

            {/* ====================== SCHEDULES TAB ====================== */}
            <TabsContent value="schedules">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <Card className="bg-gradient-to-br from-purple-950 to-black border-2 border-purple-800/30 shadow-[0_0_40px_rgba(168,85,247,0.2)]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-purple-200 font-serif text-2xl">
                      <Calendar className="h-7 w-7 text-purple-400" />
                      Add Lesson to Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-purple-300 font-serif">
                        Teacher
                      </Label>
                      <Select
                        value={selectedTeacher}
                        onValueChange={setSelectedTeacher}
                      >
                        <SelectTrigger className="bg-purple-900/20 border-purple-800/30 text-purple-200">
                          <SelectValue placeholder="Select teacher" />
                        </SelectTrigger>
                        <SelectContent className="bg-purple-950 border-purple-800/30">
                          {teachers.map((t) => (
                            <SelectItem key={t._id} value={t._id}>
                              {t.email} ({t.instrument || "N/A"})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-purple-300 font-serif">
                        Student
                      </Label>
                      <Select
                        value={selectedStudent}
                        onValueChange={setSelectedStudent}
                      >
                        <SelectTrigger className="bg-purple-900/20 border-purple-800/30 text-purple-200">
                          <SelectValue placeholder="Select student" />
                        </SelectTrigger>
                        <SelectContent className="bg-purple-950 border-purple-800/30">
                          {students.map((s) => (
                            <SelectItem key={s._id} value={s._id}>
                              {s.email} ({s.instrument || "N/A"})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-purple-300 font-serif">
                        Book (Optional)
                      </Label>
                      <Select value={bookId} onValueChange={setBookId}>
                        <SelectTrigger className="bg-purple-900/20 border-purple-800/30 text-purple-200">
                          <SelectValue placeholder="Select book" />
                        </SelectTrigger>
                        <SelectContent className="bg-purple-950 border-purple-800/30">
                          {books.map((b) => (
                            <SelectItem key={b._id} value={b._id}>
                              {b.title} ({b.level}, {b.instrument})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-purple-300 font-serif">
                        Zoom Link (optional)
                      </Label>
                      <Input
                        placeholder="https://zoom.us/j/..."
                        value={zoomLink}
                        onChange={(e) => setZoomLink(e.target.value)}
                        className="bg-purple-900/20 border-purple-800/30 text-purple-200 placeholder:text-purple-400/50"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-purple-300 font-serif">
                          Date (YYYY-MM-DD)
                        </Label>
                        <Input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="bg-purple-900/20 border-purple-800/30 text-purple-200"
                        />
                      </div>
                      <div>
                        <Label className="text-purple-300 font-serif">
                          Time (HH:MM)
                        </Label>
                        <Input
                          type="time"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          className="bg-purple-900/20 border-purple-800/30 text-purple-200"
                        />
                      </div>
                      <div>
                        <Label className="text-purple-300 font-serif">
                          Duration (min)
                        </Label>
                        <Input
                          type="number"
                          value={duration}
                          onChange={(e) => setDuration(Number(e.target.value))}
                          className="bg-purple-900/20 border-purple-800/30 text-purple-200"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleAddLesson}
                      className="bg-purple-700 hover:bg-purple-600 text-purple-50 border border-purple-600/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Lesson
                    </Button>
                  </CardContent>
                </Card>

                {/* ====================== CURRENT SCHEDULES WITH DELETE ====================== */}
                <Card className="bg-gradient-to-br from-purple-950 to-black border-2 border-purple-800/30 shadow-[0_0_40px_rgba(168,85,247,0.2)]">
                  <CardHeader>
                    <CardTitle className="text-purple-200 font-serif text-2xl">
                      Current Schedules & Lessons
                    </CardTitle>
                    <CardDescription className="text-purple-400">
                      Click delete to cancel a lesson and free the slot
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {schedules.length === 0 ? (
                      <p className="text-center text-purple-400 py-8">
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
                            className="border border-purple-800/30 rounded-lg overflow-hidden"
                          >
                            <div className="bg-purple-900/30 p-4 flex justify-between items-center">
                              <div>
                                <p className="text-purple-200 font-serif font-bold">
                                  {teacherName} •{" "}
                                  {format(
                                    new Date(sched.date),
                                    "EEEE, MMMM d, yyyy"
                                  )}
                                </p>
                                <p className="text-purple-400 text-sm">
                                  {sched.lessons.length} lesson(s)
                                </p>
                              </div>
                            </div>

                            <Table>
                              <TableHeader>
                                <TableRow className="bg-purple-900/20">
                                  <TableHead className="text-purple-300">
                                    Student
                                  </TableHead>
                                  <TableHead className="text-purple-300">
                                    Time
                                  </TableHead>
                                  <TableHead className="text-purple-300">
                                    Duration
                                  </TableHead>
                                  <TableHead className="text-purple-300">
                                    Book
                                  </TableHead>
                                  <TableHead className="text-purple-300 text-right">
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
                                      className="hover:bg-purple-900/20"
                                    >
                                      <TableCell className="text-purple-200">
                                        {student?.email.split("@")[0] ||
                                          "Unknown"}
                                      </TableCell>
                                      <TableCell className="text-purple-200">
                                        {lesson.time}
                                      </TableCell>
                                      <TableCell className="text-purple-200">
                                        {lesson.duration} min
                                      </TableCell>
                                      <TableCell className="text-purple-200">
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
                <Card className="bg-gradient-to-br from-purple-950 to-black border-2 border-purple-800/30 shadow-[0_0_40px_rgba(168,85,247,0.2)]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-purple-200 font-serif text-2xl">
                      <MessageSquare className="h-7 w-7 text-purple-400" />
                      Send Message to Teacher
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-purple-300 font-serif">
                        Teacher
                      </Label>
                      <Select
                        value={selectedTeacher}
                        onValueChange={setSelectedTeacher}
                      >
                        <SelectTrigger className="bg-purple-900/20 border-purple-800/30 text-purple-200">
                          <SelectValue placeholder="Select teacher" />
                        </SelectTrigger>
                        <SelectContent className="bg-purple-950 border-purple-800/30">
                          {teachers.map((t) => (
                            <SelectItem key={t._id} value={t._id}>
                              {t.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-purple-300 font-serif">
                        Message
                      </Label>
                      <Textarea
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        className="bg-purple-900/20 border-purple-800/30 text-purple-200 placeholder:text-purple-400/50 min-h-32 font-serif"
                      />
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      className="bg-purple-700 hover:bg-purple-600 text-purple-50 border border-purple-600/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
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
                <Card className="bg-gradient-to-br from-purple-950 to-black border-2 border-purple-800/30 shadow-[0_0_40px_rgba(168,85,247,0.2)]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-purple-200 font-serif text-2xl">
                      <FileText className="h-7 w-7 text-purple-400" />
                      Upload New PDF Book
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-purple-300 font-serif">
                          Title
                        </Label>
                        <Input
                          value={bookTitle}
                          onChange={(e) => setBookTitle(e.target.value)}
                          placeholder="e.g. Alfred's Basic Piano Level 1"
                          className="bg-purple-900/20 border-purple-800/30 text-purple-200 placeholder:text-purple-400/50"
                        />
                      </div>
                      <div>
                        <Label className="text-purple-300 font-serif">
                          Level
                        </Label>
                        <Select value={bookLevel} onValueChange={setBookLevel}>
                          <SelectTrigger className="bg-purple-900/20 border-purple-800/30 text-purple-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-purple-950 border-purple-800/30">
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="intermediate">
                              Intermediate
                            </SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-purple-300 font-serif">
                          Instrument
                        </Label>
                        <Select
                          value={bookInstrument}
                          onValueChange={setBookInstrument}
                        >
                          <SelectTrigger className="bg-purple-900/20 border-purple-800/30 text-purple-200">
                            <SelectValue placeholder="Select instrument" />
                          </SelectTrigger>
                          <SelectContent className="bg-purple-950 border-purple-800/30">
                            {instruments.map((i) => (
                              <SelectItem key={i} value={i}>
                                {i}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-purple-300 font-serif">
                          PDF File
                        </Label>
                        <Input
                          type="file"
                          accept=".pdf"
                          onChange={(e) =>
                            setBookFile(e.target.files?.[0] || null)
                          }
                          className="bg-purple-900/20 border-purple-800/30 text-purple-200"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleUploadBook}
                      disabled={!bookFile || !bookTitle || !bookInstrument}
                      className="bg-purple-700 hover:bg-purple-600 text-purple-50 border border-purple-600/50 shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-50"
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
                <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-purple-400 to-purple-200 font-serif">
                  Library ({books.length} books)
                </h2>

                {books.length === 0 ? (
                  <Card className="bg-gradient-to-br from-purple-950 to-black border-2 border-purple-800/30">
                    <CardContent className="text-center py-16">
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <FileText className="h-16 w-16 mx-auto mb-4 opacity-40 text-purple-400" />
                      </motion.div>
                      <p className="text-lg text-purple-300 font-serif">
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

                        <Card className="h-full bg-gradient-to-br from-purple-900/40 to-black/60 border border-purple-700/40 shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-shadow group-hover:scale-105 transition-transform">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <FileText className="h-8 w-8 text-purple-400" />
                              <div className="flex gap-2">
                                <Badge
                                  variant="outline"
                                  className="bg-purple-900/30 border-purple-700/50 text-purple-300"
                                >
                                  {book.level}
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className="bg-purple-800/50 text-purple-200 border-purple-700/50"
                                >
                                  {book.instrument}
                                </Badge>
                              </div>
                            </div>
                            <CardTitle className="text-lg mt-2 pr-8 text-purple-200 font-serif">
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
                                className="flex-1 bg-purple-700 hover:bg-purple-600 text-purple-50 border border-purple-600/50"
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
                                  className="border-purple-600/50 text-purple-300 hover:bg-purple-800/30"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <p className="text-xs text-purple-400/60 mt-3 font-serif">
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
                <Card className="bg-gradient-to-br from-purple-950 to-black border-2 border-purple-800/30 shadow-[0_0_40px_rgba(168,85,247,0.2)]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-purple-200 font-serif text-2xl">
                      <UsersIcon className="h-7 w-7 text-purple-400" />
                      Manage Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="teachers">
                      <TabsList className="bg-purple-900/30 border border-purple-800/30 mb-6">
                        <TabsTrigger
                          value="teachers"
                          className="data-[state=active]:bg-purple-800 data-[state=active]:text-purple-100"
                        >
                          Teachers
                        </TabsTrigger>
                        <TabsTrigger
                          value="students"
                          className="data-[state=active]:bg-purple-800 data-[state=active]:text-purple-100"
                        >
                          Students
                        </TabsTrigger>
                        <TabsTrigger
                          value="payments"
                          className="data-[state=active]:bg-purple-800 data-[state=active]:text-purple-100"
                        >
                          Payments
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="teachers">
                        <div className="rounded-lg border border-purple-800/30 overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-purple-900/20 border-b border-purple-800/30">
                                <TableHead className="text-purple-300 font-serif">
                                  Email
                                </TableHead>
                                <TableHead className="text-purple-300 font-serif">
                                  Instrument
                                </TableHead>
                                <TableHead className="text-purple-300 font-serif">
                                  Role
                                </TableHead>
                                <TableHead className="text-purple-300 font-serif">
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
                                  className="border-b border-purple-800/20 hover:bg-purple-900/20 transition-colors"
                                >
                                  <TableCell className="text-purple-200 font-serif">
                                    {t.email}
                                  </TableCell>
                                  <TableCell className="text-purple-200 font-serif">
                                    {t.instrument || "N/A"}
                                  </TableCell>
                                  <TableCell className="text-purple-200 font-serif">
                                    {t.role}
                                  </TableCell>
                                  <TableCell className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleUpdateRole(t._id, "admin")
                                      }
                                      className="text-purple-400 hover:text-purple-300 hover:bg-purple-800/30"
                                    >
                                      <Edit className="h-4 w-4 mr-1" /> Promote
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteUser(t._id)}
                                      className="text-red-400 hover:text-red-300 hover:bg-red-900/30"
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
                        <div className="rounded-lg border border-purple-800/30 overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-purple-900/20 border-b border-purple-800/30">
                                <TableHead className="text-purple-300 font-serif">
                                  Email
                                </TableHead>
                                <TableHead className="text-purple-300 font-serif">
                                  Instrument
                                </TableHead>
                                <TableHead className="text-purple-300 font-serif">
                                  Role
                                </TableHead>
                                <TableHead className="text-purple-300 font-serif">
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
                                  className="border-b border-purple-800/20 hover:bg-purple-900/20 transition-colors"
                                >
                                  <TableCell className="text-purple-200 font-serif">
                                    {s.email}
                                  </TableCell>
                                  <TableCell className="text-purple-200 font-serif">
                                    {s.instrument || "N/A"}
                                  </TableCell>
                                  <TableCell className="text-purple-200 font-serif">
                                    {s.role}
                                  </TableCell>
                                  <TableCell className="flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleUpdateRole(s._id, "teacher")
                                      }
                                      className="text-purple-400 hover:text-purple-300 hover:bg-purple-800/30"
                                    >
                                      <Edit className="h-4 w-4 mr-1" /> Promote
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteUser(s._id)}
                                      className="text-red-400 hover:text-red-300 hover:bg-red-900/30"
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
                        <Card className="bg-gradient-to-br from-purple-900/40 to-black/60 border border-purple-700/40">
                          <CardHeader>
                            <CardTitle className="text-purple-200 font-serif">
                              Calculate Monthly Payments
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex gap-2">
                              <Input
                                placeholder="2025-11"
                                value={calcMonth}
                                onChange={(e) => setCalcMonth(e.target.value)}
                                className="bg-purple-900/20 border-purple-800/30 text-purple-200 placeholder:text-purple-400/50"
                              />
                              <Button
                                onClick={async () => {
                                  await calculateMonth({ month: calcMonth });
                                  toast.success("Payments calculated!");
                                }}
                                className="bg-purple-700 hover:bg-purple-600 text-purple-50 border border-purple-600/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
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
                <Card className="bg-gradient-to-br from-purple-950 to-black border-2 border-purple-800/30 shadow-[0_0_40px_rgba(168,85,247,0.2)]">
                  <CardContent className="pt-6">
                    <Link href="/dashboard/admin/invite-codes">
                      <Button className="bg-purple-700 hover:bg-purple-600 text-purple-50 border border-purple-600/50 shadow-[0_0_15px_rgba(168,85,247,0.3)] w-full">
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
