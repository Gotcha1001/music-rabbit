// app/dashboard/admin/page.tsx
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Doc, Id } from "../../../../convex/_generated/dataModel";

import { useState } from "react";

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
} from "lucide-react";

import Link from "next/link";
import MotionWrapperDelay from "@/app/components copy/FramerMotion/MotionWrapperDelay";
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
    <div className="container mx-auto p-6 min-h-screen bg-gradient-to-b from-green-50 to-white">
      <LiveClock />
      <MotionWrapperDelay
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        variants={{
          hidden: { opacity: 0, y: 100 },
          visible: { opacity: 1, y: 0 },
        }}
      >
        <h1 className="text-3xl font-bold text-green-600 mb-8 mt-3">
          Admin (HR) Dashboard
        </h1>
      </MotionWrapperDelay>

      <Tabs defaultValue="schedules" className="space-y-4">
        {/* Fixed tab bar – standard shadcn pill style with light background */}
        <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
          <TabsTrigger value="schedules">Manage Schedules</TabsTrigger>
          <TabsTrigger value="messages">Send Messages</TabsTrigger>
          <TabsTrigger value="books">Books / Library</TabsTrigger>
          <TabsTrigger value="users">Manage Users</TabsTrigger>
          <TabsTrigger value="invites">Invite Codes</TabsTrigger>
        </TabsList>

        {/* ====================== SCHEDULES TAB ====================== */}
        <TabsContent value="schedules">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" /> Add Lesson to Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                        {t.email} ({t.instrument || "N/A"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                        {s.email} ({s.instrument || "N/A"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Book (Optional)</Label>
                <Select value={bookId} onValueChange={setBookId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select book" />
                  </SelectTrigger>
                  <SelectContent>
                    {books.map((b) => (
                      <SelectItem key={b._id} value={b._id}>
                        {b.title} ({b.level}, {b.instrument})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Zoom Link (optional)</Label>
                <Input
                  placeholder="https://zoom.us/j/..."
                  value={zoomLink}
                  onChange={(e) => setZoomLink(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Date (YYYY-MM-DD)</Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Time (HH:MM)</Label>
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

              <Button onClick={handleAddLesson}>
                <Plus className="mr-2 h-4 w-4" /> Add Lesson
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Current Schedules</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Lessons Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((sched) => (
                    <TableRow key={sched._id}>
                      <TableCell>{sched.teacherId}</TableCell>
                      <TableCell>
                        {format(new Date(sched.date), "PPP")}
                      </TableCell>
                      <TableCell>{sched.lessons.length} lessons</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ====================== MESSAGES TAB ====================== */}
        <MotionWrapperDelay
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          variants={{
            hidden: { opacity: 0, y: 100 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" /> Send Message to Teacher
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                          {t.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Message</Label>
                  <Textarea
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                  />
                </div>
                <Button onClick={handleSendMessage}>
                  <Send className="mr-2 h-4 w-4" /> Send
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </MotionWrapperDelay>

        {/* ====================== BOOKS / LIBRARY TAB ====================== */}
        <MotionWrapperDelay
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          variants={{
            hidden: { opacity: 0, y: 100 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <TabsContent value="books" className="space-y-8">
            {/* Upload Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Upload New PDF Book
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={bookTitle}
                      onChange={(e) => setBookTitle(e.target.value)}
                      placeholder="e.g. Alfred's Basic Piano Level 1"
                    />
                  </div>
                  <div>
                    <Label>Level</Label>
                    <Select value={bookLevel} onValueChange={setBookLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="intermediate">
                          Intermediate
                        </SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Instrument</Label>
                    <Select
                      value={bookInstrument}
                      onValueChange={setBookInstrument}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select instrument" />
                      </SelectTrigger>
                      <SelectContent>
                        {instruments.map((i) => (
                          <SelectItem key={i} value={i}>
                            {i}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>PDF File</Label>
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setBookFile(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleUploadBook}
                  disabled={!bookFile || !bookTitle || !bookInstrument}
                >
                  <Plus className="mr-2 h-4 w-4" /> Upload Book
                </Button>
              </CardContent>
            </Card>

            {/* Library Grid */}
            <div>
              <h2 className="text-2xl font-bold mb-6">
                Library ({books.length} books)
              </h2>

              {books.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-16 text-muted-foreground">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No books uploaded yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {books.map((book) => (
                    <div key={book._id} className="relative group">
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() =>
                          handleDeleteBook(book._id, book.driveFileId)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      <Card className="h-full hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <FileText className="h-8 w-8 text-blue-600" />
                            <div className="flex gap-2">
                              <Badge variant="outline">{book.level}</Badge>
                              <Badge variant="secondary">
                                {book.instrument}
                              </Badge>
                            </div>
                          </div>
                          <CardTitle className="text-lg mt-2 pr-8">
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
                              className="flex-1"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" /> View
                              Book
                            </Button>
                            {book.driveDownloadLink && (
                              <Button
                                variant="outline"
                                size="sm"
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </MotionWrapperDelay>

        {/* ====================== USERS TAB ====================== */}

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5" /> Manage Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="teachers">
                <TabsList>
                  <TabsTrigger value="teachers">Teachers</TabsTrigger>
                  <TabsTrigger value="students">Students</TabsTrigger>
                  <TabsTrigger value="payments">Payments</TabsTrigger>
                </TabsList>

                <MotionWrapperDelay
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  variants={{
                    hidden: { opacity: 0, y: 100 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <TabsContent value="teachers">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Instrument</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teachers.map((t) => (
                          <TableRow key={t._id}>
                            <TableCell>{t.email}</TableCell>
                            <TableCell>{t.instrument || "N/A"}</TableCell>
                            <TableCell>{t.role}</TableCell>
                            <TableCell className="flex gap-2">
                              <Button
                                variant="ghost"
                                onClick={() => handleUpdateRole(t._id, "admin")}
                              >
                                <Edit className="h-4 w-4" /> Promote to Admin
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => handleDeleteUser(t._id)}
                              >
                                <Trash className="h-4 w-4" /> Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>
                </MotionWrapperDelay>

                <TabsContent value="students">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Instrument</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((s) => (
                        <TableRow key={s._id}>
                          <TableCell>{s.email}</TableCell>
                          <TableCell>{s.instrument || "N/A"}</TableCell>
                          <TableCell>{s.role}</TableCell>
                          <TableCell className="flex gap-2">
                            <Button
                              variant="ghost"
                              onClick={() => handleUpdateRole(s._id, "teacher")}
                            >
                              <Edit className="h-4 w-4" /> Promote to Teacher
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => handleDeleteUser(s._id)}
                            >
                              <Trash className="h-4 w-4" /> Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="payments">
                  <Card>
                    <CardHeader>
                      <CardTitle>Calculate Monthly Payments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Input
                          placeholder="2025-11"
                          value={calcMonth}
                          onChange={(e) => setCalcMonth(e.target.value)}
                        />
                        <Button
                          onClick={async () => {
                            await calculateMonth({ month: calcMonth });
                            toast("Payments calculated!");
                          }}
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
        </TabsContent>

        {/* ====================== INVITES TAB ====================== */}
        <MotionWrapperDelay
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          variants={{
            hidden: { opacity: 0, y: 100 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <TabsContent value="invites">
            <Link href="/dashboard/admin/invite-codes">
              <Button variant={"sex3"}>Go to Invite Codes Management</Button>
            </Link>
          </TabsContent>
        </MotionWrapperDelay>
      </Tabs>
    </div>
  );
}
