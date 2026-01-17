"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Doc, Id } from "../../../../convex/_generated/dataModel";
import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TeacherStatsComponent from "../../components/TeacherStatsComponent";
import { AdminCategoryManager } from "@/app/components/AdminCategoryManager";
import {
  TrendingUp,
  X,
  Users,
  Key,
  Plus,
  Trash2,
  Edit,
  Calendar,
  Send,
  FileText,
  MessageSquare,
  ExternalLink,
  Download,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import Link from "next/link";
import LiveClock from "@/app/components/LiveClock";
import { TeacherInboxItem } from "@/app/components/TeacherInboxItem";
import AdminGlobalMessages from "@/app/components/AdminGlobalMessages";

export default function AdminDashboard() {
  const teachers = (useQuery(api.users.getAllTeachers) as Doc<"users">[]) || [];
  const students = (useQuery(api.users.getAllStudents) as Doc<"users">[]) || [];
  const schedules =
    (useQuery(api.schedules.getAll) as Doc<"schedules">[]) || [];
  const books = (useQuery(api.books.getAll) as Doc<"books">[]) || [];

  const inviteCodes = useQuery(api.inviteCodes.getAll) ?? [];
  const me = useQuery(api.users.getMe);

  const addLesson = useMutation(api.schedules.addLesson);
  const deleteLesson = useMutation(api.schedules.deleteLesson);
  const sendMessage = useMutation(api.messages.send);
  const updateUserRole = useMutation(api.users.updateRole);
  const deleteUser = useMutation(api.users.remove);
  const calculateMonth = useMutation(api.payments.calculateMonth);
  const createInviteCode = useMutation(api.inviteCodes.create);
  const deleteInviteCode = useMutation(api.inviteCodes.remove);
  // Add this line with the others
  const autoAssignTeacher = useMutation(api.users.autoAssignTeacher);

  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(30);
  const [bookId, setBookId] = useState<string>("");
  const [zoomLink, setZoomLink] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [calcMonth, setCalcMonth] = useState("");
  const [selectedTeacherForStats, setSelectedTeacherForStats] =
    useState<Id<"users"> | null>(null);

  // Invite code form - FIXED: removed maxUses
  const [newCodeRole, setNewCodeRole] = useState<"teacher" | "student">(
    "teacher",
  );
  const [newCodeDescription, setNewCodeDescription] = useState("");

  // const handleAddLesson = async () => {
  //   if (!selectedTeacher || !selectedStudent || !date || !time) {
  //     toast.error("Please fill all required fields");
  //     return;
  //   }

  //   await addLesson({
  //     teacherId: selectedTeacher as Id<"users">,
  //     date,
  //     lesson: {
  //       studentId: selectedStudent as Id<"users">,
  //       time,
  //       duration,
  //       bookId: bookId ? (bookId as Id<"books">) : undefined,
  //       zoomLink: zoomLink || undefined,
  //       notes: "",
  //       completed: false,
  //       status: "na" as const,
  //     },
  //   });

  //   toast.success("Lesson added");
  //   setSelectedTeacher("");
  //   setSelectedStudent("");
  //   setDate("");
  //   setTime("");
  //   setZoomLink("");
  //   setDuration(30);
  //   setBookId("");
  // };

  const handleAddLesson = async () => {
    if (!selectedTeacher || !selectedStudent || !date || !time) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      // 1. First add the lesson
      await addLesson({
        teacherId: selectedTeacher as Id<"users">,
        date,
        lesson: {
          studentId: selectedStudent as Id<"users">,
          time,
          duration,
          bookId: bookId ? (bookId as Id<"books">) : undefined,
          zoomLink: zoomLink || undefined,
          notes: "",
          completed: false,
          status: "no_answer_on_time" as const,
        },
      });

      // 2. THIS IS THE MAGIC LINE — auto-assign the teacher to the student
      await autoAssignTeacher({
        studentId: selectedStudent as Id<"users">,
        teacherId: selectedTeacher as Id<"users">,
      });

      toast.success("Lesson added & teacher assigned to student!");

      // Reset form
      setSelectedTeacher("");
      setSelectedStudent("");
      setDate("");
      setTime("");
      setZoomLink("");
      setDuration(30);
      setBookId("");
    } catch (error) {
      toast.error("Failed to add lesson");
      console.error(error);
    }
  };
  const handleSendMessage = async () => {
    if (!selectedTeacher || !messageContent.trim()) return;

    await sendMessage({
      toId: selectedTeacher as Id<"users">,
      content: messageContent,
    });
    setMessageContent("");
    toast.success("Message sent");
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
    newRole: "admin" | "teacher" | "student",
  ) => {
    await updateUserRole({ userId, role: newRole });
    toast.success("Role updated");
  };

  const handleDeleteUser = async (userId: Id<"users">) => {
    if (!confirm("Delete this user permanently?")) return;

    await deleteUser({ userId });
    toast.success("User deleted");
  };

  const handleCreateInviteCode = async () => {
    if (!newCodeDescription.trim()) {
      toast.error("Please add a description");
      return;
    }

    await createInviteCode({
      description: newCodeDescription.trim(),
      role: newCodeRole,
    });

    toast.success(`Invite code created!`);
    setNewCodeDescription("");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <LiveClock />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-5xl font-bold mb-12 text-primary font-serif"
        >
          Admin (HR) Dashboard
        </motion.h1>

        <Tabs defaultValue="schedules" className="space-y-8">
          <TabsList className="grid grid-cols-3 md:grid-cols-7 w-full bg-card border border-border p-1">
            <TabsTrigger value="schedules">Schedules</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="books">Library</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="invites">Invites</TabsTrigger>
            <TabsTrigger
              value="announcements"
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Announcements
            </TabsTrigger>
          </TabsList>

          {/* ==================== CATEGORIES ==================== */}
          <TabsContent value="categories">
            <AdminCategoryManager />
          </TabsContent>

          {/* ==================== SCHEDULES ==================== */}
          <TabsContent value="schedules">
            <motion.div className="space-y-8">
              {/* Add Lesson */}
              <Card className="bg-card border-2 border-border shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl font-serif">
                    <Calendar className="h-7 w-7 text-primary" />
                    Add New Lesson
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* TEACHER SELECT – NOW SHOWS FULL NAME */}
                    <div>
                      <Label>Teacher</Label>
                      <Select
                        value={selectedTeacher}
                        onValueChange={setSelectedTeacher}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select teacher" />
                        </SelectTrigger>
                        <SelectContent>
                          {teachers.map((t) => (
                            <SelectItem key={t._id} value={t._id}>
                              {t.name || t.email.split("@")[0]} (
                              {t.instrument || "No instrument"})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* STUDENT SELECT – NOW SHOWS FULL NAME */}
                    <div>
                      <Label>Student</Label>
                      <Select
                        value={selectedStudent}
                        onValueChange={setSelectedStudent}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select student" />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map((s) => (
                            <SelectItem key={s._id} value={s._id}>
                              {s.name || s.email.split("@")[0]} (
                              {s.instrument || "No instrument"})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Book & Zoom Link – unchanged */}
                    <div>
                      <Label>Book (Optional)</Label>
                      <Select value={bookId} onValueChange={setBookId}>
                        <SelectTrigger>
                          <SelectValue placeholder="No book" />
                        </SelectTrigger>
                        <SelectContent>
                          {books.map((b) => (
                            <SelectItem key={b._id} value={b._id}>
                              {b.title} ({b.instrument})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Zoom Link (Optional)</Label>
                      <Input
                        value={zoomLink}
                        onChange={(e) => setZoomLink(e.target.value)}
                        placeholder="https://zoom.us/..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Time</Label>
                      <Input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Duration (min)</Label>
                      <Input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleAddLesson}
                    className="bg-primary text-primary-foreground"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Lesson
                  </Button>
                </CardContent>
              </Card>

              {/* Current Schedules */}
              <Card className="bg-card border-2 border-border shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-serif">
                    Current Schedules
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {schedules.length === 0 ? (
                    <p className="text-center py-12 text-muted-foreground">
                      No lessons scheduled
                    </p>
                  ) : (
                    schedules.map((sched) => {
                      const teacher = teachers.find(
                        (t) => t._id === sched.teacherId,
                      );
                      const teacherDisplayName =
                        teacher?.name ||
                        teacher?.email.split("@")[0] ||
                        "Unknown";

                      return (
                        <div
                          key={sched._id}
                          className="mb-8 border rounded-lg overflow-hidden"
                        >
                          {/* Header – now shows teacher name */}
                          <div className="bg-muted/50 p-4 font-bold text-foreground">
                            {teacherDisplayName} •{" "}
                            {format(new Date(sched.date), "EEEE, MMMM d, yyyy")}{" "}
                            ({sched.lessons.length} lessons)
                          </div>

                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Book</TableHead>
                                <TableHead className="text-right">
                                  Action
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sched.lessons.map((lesson, idx) => {
                                const student = students.find(
                                  (s) => s._id === lesson.studentId,
                                );
                                const studentDisplayName =
                                  student?.name ||
                                  student?.email.split("@")[0] ||
                                  "Unknown";
                                const book = lesson.bookId
                                  ? books.find((b) => b._id === lesson.bookId)
                                  : null;

                                return (
                                  <TableRow key={idx}>
                                    {/* Student – now shows full name */}
                                    <TableCell>{studentDisplayName}</TableCell>
                                    <TableCell>{lesson.time}</TableCell>
                                    <TableCell>
                                      {book?.title || "---"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={async () => {
                                          if (confirm("Cancel this lesson?")) {
                                            await deleteLesson({
                                              scheduleId: sched._id,
                                              lessonId: lesson.lessonId,
                                            });
                                            toast.success("Lesson cancelled");
                                          }
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
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

          {/* ==================== GLOBAL ANNOUNCEMENTS ==================== */}
          <TabsContent value="announcements">
            <AdminGlobalMessages />
          </TabsContent>

          {/* ==================== MESSAGES ==================== */}
          <TabsContent value="messages">
            <motion.div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Send className="h-7 w-7 text-primary" />
                    Send Message
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select
                    value={selectedTeacher}
                    onValueChange={setSelectedTeacher}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((t) => (
                        <SelectItem key={t._id} value={t._id}>
                          {t.email.split("@")[0]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Your message..."
                    className="min-h-32"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!selectedTeacher || !messageContent.trim()}
                  >
                    <Send className="mr-2 h-4 w-4" /> Send
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <MessageSquare className="h-7 w-7 text-primary" />
                    Inbox
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {me ? (
                    <TeacherInboxItem teacher={me} />
                  ) : (
                    <Loader2 className="h-12 w-12 animate-spin mx-auto" />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ==================== BOOKS / LIBRARY ==================== */}
          <TabsContent value="books" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <FileText className="h-7 w-7 text-primary" />
                  Upload New Book
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Use the new categorized upload system:</p>
                <Link href="/dashboard/books/upload">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> Go to Upload
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <div>
              <h2 className="text-3xl font-bold mb-6 text-primary font-serif">
                Library ({books.length})
              </h2>
              {books.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-16 text-muted-foreground">
                    No books yet
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {books.map((book, i) => (
                    <motion.div
                      key={book._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="relative group"
                    >
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100"
                        onClick={() =>
                          handleDeleteBook(book._id, book.driveFileId)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Card className="h-full hover:scale-105 transition-transform">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <FileText className="h-8 w-8 text-primary" />
                            <div className="flex gap-2 flex-wrap justify-end">
                              <Badge variant="secondary">
                                {book.instrument}
                              </Badge>
                            </div>
                          </div>
                          <CardTitle className="text-lg mt-2">
                            {book.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() =>
                                window.open(book.driveViewLink, "_blank")
                              }
                            >
                              <ExternalLink className="mr-2 h-4 w-4" /> View
                            </Button>
                            {book.driveDownloadLink && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  window.open(book.driveDownloadLink, "_blank")
                                }
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-3">
                            Uploaded {format(book.uploadedAt, "PP")}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ==================== USERS ==================== */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Users className="h-8 w-8 text-primary" />
                  Manage Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="teachers">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="teachers">Teachers</TabsTrigger>
                    <TabsTrigger value="students">Students</TabsTrigger>
                    <TabsTrigger value="payments">Payments</TabsTrigger>
                  </TabsList>

                  <TabsContent value="teachers">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Instrument</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teachers.map((t) => (
                          <TableRow key={t._id}>
                            <TableCell>{t.email}</TableCell>
                            <TableCell>{t.instrument || "---"}</TableCell>
                            <TableCell className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateRole(t._id, "admin")}
                              >
                                <Edit className="h-4 w-4 mr-1" /> Admin
                              </Button>
                              <Button
                                size="sm"
                                onClick={() =>
                                  setSelectedTeacherForStats(t._id)
                                }
                              >
                                <TrendingUp className="h-4 w-4 mr-1" /> Stats
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteUser(t._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>

                  <TabsContent value="students">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Instrument</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((s) => (
                          <TableRow key={s._id}>
                            <TableCell>{s.email}</TableCell>
                            <TableCell>{s.instrument || "---"}</TableCell>
                            <TableCell className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleUpdateRole(s._id, "teacher")
                                }
                              >
                                <Edit className="h-4 w-4 mr-1" /> Promote
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteUser(s._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>

                  <TabsContent value="payments">
                    <div className="flex gap-3">
                      <Input
                        placeholder="2025-11"
                        value={calcMonth}
                        onChange={(e) => setCalcMonth(e.target.value)}
                      />
                      <Button
                        onClick={async () => {
                          await calculateMonth({ month: calcMonth });
                          toast.success("Payments calculated!");
                        }}
                      >
                        Calculate Month
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== INVITE CODES ==================== */}
          <TabsContent value="invites">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Key className="h-8 w-8 text-primary" />
                  Invite Codes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4 p-4 border rounded-lg bg-muted/30">
                  <Select
                    value={newCodeRole}
                    onValueChange={(v: "teacher" | "student") =>
                      setNewCodeRole(v)
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Description (e.g., John Smith - Piano)"
                    value={newCodeDescription}
                    onChange={(e) => setNewCodeDescription(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleCreateInviteCode}>
                    <Plus className="mr-2 h-4 w-4" />
                    Generate Code
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Uses</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inviteCodes.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No invite codes
                        </TableCell>
                      </TableRow>
                    ) : (
                      inviteCodes.map((c) => (
                        <TableRow key={c._id}>
                          <TableCell className="font-mono font-bold text-lg">
                            {c.code}
                          </TableCell>
                          <TableCell>
                            <Badge>{c.role}</Badge>
                          </TableCell>
                          <TableCell>{c.description || "---"}</TableCell>
                          <TableCell>{c.usedCount}</TableCell>
                          <TableCell>{format(c._creationTime, "PP")}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                deleteInviteCode({ inviteId: c._id })
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Teacher Stats Modal */}
      {selectedTeacherForStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <motion.div className="w-full max-w-7xl max-h-[95vh] overflow-y-auto rounded-xl bg-card border-2 border-border shadow-2xl">
            <div className="sticky top-0 z-10 flex justify-between items-center border-b bg-card p-6">
              <div>
                <h2 className="text-3xl font-bold font-serif text-primary">
                  {
                    teachers
                      .find((t) => t._id === selectedTeacherForStats)
                      ?.email.split("@")[0]
                  }{" "}
                  Stats
                </h2>
                <p className="text-muted-foreground">
                  {format(new Date(), "MMMM yyyy")}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedTeacherForStats(null)}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="p-6">
              <TeacherStatsComponent
                teacherIdOverride={selectedTeacherForStats}
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
