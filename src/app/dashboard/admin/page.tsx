"use client";
import { useQuery, useMutation } from "convex/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useState } from "react";
import {
  Plus,
  Send,
  FileText,
  Users as UsersIcon,
  Calendar,
  MessageSquare,
  Edit,
  Trash,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { api } from "../../../../convex/_generated/api";
import { Doc, Id } from "../../../../convex/_generated/dataModel";
import { toast } from "sonner";

export default function AdminDashboard() {
  const teachers = (useQuery(api.users.getAllTeachers) as Doc<"users">[]) || [];
  const students = (useQuery(api.users.getAllStudents) as Doc<"users">[]) || [];
  const schedules =
    (useQuery(api.schedules.getAll) as Doc<"schedules">[]) || [];
  const books = (useQuery(api.books.getAll) as Doc<"books">[]) || [];
  const addLesson = useMutation(api.schedules.addLesson);
  const sendMessage = useMutation(api.messages.send);
  const uploadBook = useMutation(api.books.upload);
  const updateUserRole = useMutation(api.users.updateRole);
  const deleteUser = useMutation(api.users.remove);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);

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
  const calculateMonth = useMutation(api.payments.calculateMonth);

  // Instruments list
  const instruments = [
    "Piano",
    "Guitar",
    "Violin",
    "Drums",
    "Flute",
    "Saxophone",
    "Trumpet",
    "Cello",
    "Bass",
    "Vocal",
  ];

  const handleAddLesson = async () => {
    if (!selectedTeacher || !selectedStudent || !date || !time) return;
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
    // Clear form
    setSelectedTeacher("");
    setSelectedStudent("");
    setDate("");
    setTime("");
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
  };

  const handleUploadBook = async () => {
    if (!bookFile || !bookTitle || !bookInstrument) return;
    const uploadUrl = await generateUploadUrl();
    const postResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": bookFile.type },
      body: bookFile,
    });
    const { storageId } = await postResponse.json();
    await uploadBook({
      title: bookTitle,
      level: bookLevel,
      instrument: bookInstrument,
      fileId: storageId as Id<"_storage">,
    });
    // Clear form
    setBookTitle("");
    setBookLevel("basic");
    setBookInstrument("");
    setBookFile(null);
  };

  const handleUpdateRole = async (
    userId: Id<"users">,
    newRole: "admin" | "teacher" | "student"
  ) => {
    await updateUserRole({ userId, role: newRole });
  };

  const handleDeleteUser = async (userId: Id<"users">) => {
    await deleteUser({ userId });
  };

  return (
    <div className="container mx-auto p-6 min-h-screen bg-gradient-to-b from-green-50 to-white">
      <h1 className="text-3xl font-bold text-green-600 mb-8">
        Admin (HR) Dashboard
      </h1>

      <Tabs defaultValue="schedules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedules">Manage Schedules</TabsTrigger>
          <TabsTrigger value="messages">Send Messages</TabsTrigger>
          <TabsTrigger value="books">Upload Books</TabsTrigger>
          <TabsTrigger value="users">Manage Users</TabsTrigger>
          <TabsTrigger value="invites">Invite Codes</TabsTrigger>
        </TabsList>

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
              <div className="col-span-3">
                <Label>Zoom Link (create in Zoom → paste here)</Label>
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

        <TabsContent value="books">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" /> Upload PDF Book
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
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
                    <SelectItem value="intermediate">Intermediate</SelectItem>
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
                    {instruments.map((inst) => (
                      <SelectItem key={inst} value={inst}>
                        {inst}
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
              <Button onClick={handleUploadBook}>
                <Plus className="mr-2 h-4 w-4" /> Upload
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

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
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invites">
          <Link href="/dashboard/admin/invite-codes">
            <Button>Go to Invite Codes Management</Button>
          </Link>
        </TabsContent>
      </Tabs>
    </div>
  );
}
