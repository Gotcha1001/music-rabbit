// import { useState } from "react";
// import { useQuery, useMutation } from "convex/react";

// import { format } from "date-fns";
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
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import {
//   ExternalLink,
//   Plus,
//   Edit,
//   Trash,
//   Video,
//   Calendar,
//   User,
//   Loader2,
// } from "lucide-react";
// import { toast } from "sonner";
// import { Doc, Id } from "../../../convex/_generated/dataModel";
// import { api } from "../../../convex/_generated/api";

// // Component for the Recordings Tab
// export function RecordingsTab() {
//   const recordings = useQuery(api.recordings.getByTeacher) ?? [];
//   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
//   const [editingRecording, setEditingRecording] =
//     useState<Doc<"recordings"> | null>(null);

//   // Group recordings by month
//   const recordingsByMonth = recordings.reduce(
//     (acc, rec) => {
//       const date = new Date(rec.timestamp);
//       const monthKey = format(date, "MMMM yyyy");
//       if (!acc[monthKey]) acc[monthKey] = [];
//       acc[monthKey].push(rec);
//       return acc;
//     },
//     {} as Record<string, typeof recordings>
//   );

//   return (
//     <div className="space-y-6">
//       {/* Header with Add Button */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-2xl font-bold flex items-center gap-2">
//             <Video className="h-6 w-6" />
//             Lesson Recordings
//           </h2>
//           <p className="text-muted-foreground mt-1">
//             View and manage your recorded lessons
//           </p>
//         </div>
//         <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
//           <DialogTrigger asChild>
//             <Button>
//               <Plus className="mr-2 h-4 w-4" />
//               Add Recording
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="max-w-2xl">
//             <AddRecordingForm onSuccess={() => setIsAddDialogOpen(false)} />
//           </DialogContent>
//         </Dialog>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium text-muted-foreground">
//               Total Recordings
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-3xl font-bold">{recordings.length}</div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium text-muted-foreground">
//               This Month
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-3xl font-bold">
//               {
//                 recordings.filter((r) => {
//                   const recDate = new Date(r.timestamp);
//                   const now = new Date();
//                   return (
//                     recDate.getMonth() === now.getMonth() &&
//                     recDate.getFullYear() === now.getFullYear()
//                   );
//                 }).length
//               }
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader className="pb-2">
//             <CardTitle className="text-sm font-medium text-muted-foreground">
//               With Notes
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-3xl font-bold">
//               {recordings.filter((r) => r.notes).length}
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Recordings List */}
//       {recordings.length === 0 ? (
//         <Card>
//           <CardContent className="flex flex-col items-center justify-center py-12">
//             <Video className="h-12 w-12 text-muted-foreground mb-4" />
//             <h3 className="text-lg font-semibold mb-2">No recordings yet</h3>
//             <p className="text-muted-foreground text-center mb-4">
//               Add your first lesson recording to keep track of your teaching
//               sessions
//             </p>
//             <Button onClick={() => setIsAddDialogOpen(true)}>
//               <Plus className="mr-2 h-4 w-4" />
//               Add First Recording
//             </Button>
//           </CardContent>
//         </Card>
//       ) : (
//         <div className="space-y-6">
//           {Object.entries(recordingsByMonth)
//             .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
//             .map(([month, recs]) => (
//               <Card key={month}>
//                 <CardHeader>
//                   <CardTitle className="text-lg">{month}</CardTitle>
//                   <CardDescription>
//                     {recs.length} recording{recs.length !== 1 ? "s" : ""}
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>Date</TableHead>
//                         <TableHead>Lesson</TableHead>
//                         <TableHead>Student</TableHead>
//                         <TableHead>Notes</TableHead>
//                         <TableHead>Actions</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {recs.map((rec) => (
//                         <RecordingRow
//                           key={rec._id}
//                           recording={rec}
//                           onEdit={setEditingRecording}
//                         />
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </CardContent>
//               </Card>
//             ))}
//         </div>
//       )}

//       {/* Edit Dialog */}
//       <Dialog
//         open={!!editingRecording}
//         onOpenChange={(open) => !open && setEditingRecording(null)}
//       >
//         <DialogContent className="max-w-2xl">
//           {editingRecording && (
//             <EditRecordingForm
//               recording={editingRecording}
//               onSuccess={() => setEditingRecording(null)}
//             />
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// // Recording Row Component
// function RecordingRow({
//   recording,
//   onEdit,
// }: {
//   recording: Doc<"recordings">;
//   onEdit: (rec: Doc<"recordings">) => void;
// }) {
//   const lesson = useQuery(api.schedules.getLesson, {
//     scheduleId: recording.scheduleId,
//     lessonId: recording.lessonStringId,
//   });

//   const student = useQuery(
//     api.users.getById,
//     lesson?.studentId ? { id: lesson.studentId } : "skip"
//   );

//   const deleteRecording = useMutation(api.recordings.remove);
//   const [isDeleting, setIsDeleting] = useState(false);

//   const handleDelete = async () => {
//     if (!confirm("Are you sure you want to delete this recording?")) return;

//     setIsDeleting(true);
//     try {
//       await deleteRecording({ recordingId: recording._id });
//       toast.success("Recording deleted");
//     } catch {
//       toast.error("Failed to delete recording");
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   return (
//     <TableRow>
//       <TableCell>
//         <div className="flex items-center gap-2">
//           <Calendar className="h-4 w-4 text-muted-foreground" />
//           {lesson ? format(new Date(lesson.date), "MMM d, yyyy") : "Loading..."}
//         </div>
//       </TableCell>
//       <TableCell>
//         <Badge variant="outline">{recording.lessonStringId}</Badge>
//       </TableCell>
//       <TableCell>
//         <div className="flex items-center gap-2">
//           <User className="h-4 w-4 text-muted-foreground" />
//           {student?.email ?? "Loading..."}
//         </div>
//       </TableCell>
//       <TableCell className="max-w-xs">
//         {recording.notes ? (
//           <p className="text-sm truncate">{recording.notes}</p>
//         ) : (
//           <span className="text-muted-foreground text-sm">No notes</span>
//         )}
//       </TableCell>
//       <TableCell>
//         <div className="flex items-center gap-2">
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => window.open(recording.recordingUrl, "_blank")}
//           >
//             <ExternalLink className="h-4 w-4" />
//           </Button>
//           <Button variant="ghost" size="sm" onClick={() => onEdit(recording)}>
//             <Edit className="h-4 w-4" />
//           </Button>
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={handleDelete}
//             disabled={isDeleting}
//           >
//             {isDeleting ? (
//               <Loader2 className="h-4 w-4 animate-spin" />
//             ) : (
//               <Trash className="h-4 w-4" />
//             )}
//           </Button>
//         </div>
//       </TableCell>
//     </TableRow>
//   );
// }

// // Add Recording Form
// function AddRecordingForm({ onSuccess }: { onSuccess: () => void }) {
//   const currentUser = useQuery(api.users.get);
//   const schedules =
//     useQuery(
//       api.schedules.getByTeacher,
//       currentUser ? { teacherId: currentUser._id } : "skip"
//     ) ?? [];

//   const addRecording = useMutation(api.recordings.addRecording);

//   const [scheduleId, setScheduleId] = useState("");
//   const [lessonId, setLessonId] = useState("");
//   const [recordingUrl, setRecordingUrl] = useState("");
//   const [notes, setNotes] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // Get all lessons from schedules
//   const allLessons = schedules
//     .flatMap((schedule) =>
//       schedule.lessons.map((lesson) => ({
//         scheduleId: schedule._id,
//         lessonId: lesson.lessonId,
//         date: schedule.date,
//         time: lesson.time,
//         studentId: lesson.studentId,
//       }))
//     )
//     .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!scheduleId || !lessonId || !recordingUrl) {
//       toast.error("Please fill in all required fields");
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       await addRecording({
//         scheduleId: scheduleId as Id<"schedules">,
//         lessonStringId: lessonId,
//         recordingUrl,
//         notes: notes || undefined,
//       });
//       toast.success("Recording added successfully!");
//       onSuccess();
//     } catch {
//       toast.error("Failed to add recording");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <DialogHeader>
//         <DialogTitle>Add Lesson Recording</DialogTitle>
//         <DialogDescription>
//           Add a new Zoom recording for one of your lessons
//         </DialogDescription>
//       </DialogHeader>

//       <div className="space-y-4">
//         <div>
//           <Label htmlFor="lesson">Select Lesson *</Label>
//           <select
//             id="lesson"
//             className="w-full mt-1 px-3 py-2 border rounded-md"
//             value={`${scheduleId}|${lessonId}`}
//             onChange={(e) => {
//               const [sid, lid] = e.target.value.split("|");
//               setScheduleId(sid);
//               setLessonId(lid);
//             }}
//             required
//           >
//             <option value="">Choose a lesson...</option>
//             {allLessons.map((lesson) => (
//               <option
//                 key={`${lesson.scheduleId}-${lesson.lessonId}`}
//                 value={`${lesson.scheduleId}|${lesson.lessonId}`}
//               >
//                 {format(new Date(lesson.date), "MMM d, yyyy")} - {lesson.time} -{" "}
//                 {lesson.lessonId}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <Label htmlFor="recordingUrl">Zoom Recording URL *</Label>
//           <Input
//             id="recordingUrl"
//             type="url"
//             placeholder="https://zoom.us/rec/share/..."
//             value={recordingUrl}
//             onChange={(e) => setRecordingUrl(e.target.value)}
//             required
//           />
//           <p className="text-sm text-muted-foreground mt-1">
//             Copy the recording link from your Zoom account
//           </p>
//         </div>

//         <div>
//           <Label htmlFor="notes">Notes (Optional)</Label>
//           <Textarea
//             id="notes"
//             placeholder="Add any notes about this recording..."
//             value={notes}
//             onChange={(e) => setNotes(e.target.value)}
//             rows={4}
//           />
//         </div>
//       </div>

//       <div className="flex justify-end gap-2 pt-4">
//         <Button
//           type="button"
//           variant="outline"
//           onClick={onSuccess}
//           disabled={isSubmitting}
//         >
//           Cancel
//         </Button>
//         <Button type="submit" disabled={isSubmitting}>
//           {isSubmitting ? (
//             <>
//               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//               Adding...
//             </>
//           ) : (
//             <>
//               <Plus className="mr-2 h-4 w-4" />
//               Add Recording
//             </>
//           )}
//         </Button>
//       </div>
//     </form>
//   );
// }

// // Edit Recording Form
// function EditRecordingForm({
//   recording,
//   onSuccess,
// }: {
//   recording: Doc<"recordings">;
//   onSuccess: () => void;
// }) {
//   const updateRecording = useMutation(api.recordings.update);
//   const [notes, setNotes] = useState(recording.notes || "");
//   const [recordingUrl, setRecordingUrl] = useState(recording.recordingUrl);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     try {
//       await updateRecording({
//         recordingId: recording._id,
//         recordingUrl,
//         notes: notes || undefined,
//       });
//       toast.success("Recording updated!");
//       onSuccess();
//     } catch {
//       toast.error("Failed to update recording");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <DialogHeader>
//         <DialogTitle>Edit Recording</DialogTitle>
//         <DialogDescription>Update the recording URL or notes</DialogDescription>
//       </DialogHeader>

//       <div className="space-y-4">
//         <div>
//           <Label htmlFor="edit-url">Recording URL</Label>
//           <Input
//             id="edit-url"
//             type="url"
//             value={recordingUrl}
//             onChange={(e) => setRecordingUrl(e.target.value)}
//             required
//           />
//         </div>

//         <div>
//           <Label htmlFor="edit-notes">Notes</Label>
//           <Textarea
//             id="edit-notes"
//             placeholder="Add notes about this recording..."
//             value={notes}
//             onChange={(e) => setNotes(e.target.value)}
//             rows={4}
//           />
//         </div>
//       </div>

//       <div className="flex justify-end gap-2 pt-4">
//         <Button
//           type="button"
//           variant="outline"
//           onClick={onSuccess}
//           disabled={isSubmitting}
//         >
//           Cancel
//         </Button>
//         <Button type="submit" disabled={isSubmitting}>
//           {isSubmitting ? (
//             <>
//               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//               Saving...
//             </>
//           ) : (
//             "Save Changes"
//           )}
//         </Button>
//       </div>
//     </form>
//   );
// }
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Video,
  Calendar,
  Clock,
  User,
  FileText,
  Play,
  Download,
  Edit,
  Trash2,
  Search,
  Filter,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";

type Recording = {
  id: string;
  date: string;
  time: string;
  duration: number;
  studentName: string;
  studentEmail: string;
  recordingUrl: string;
  notes: string;
  lessonId: string;
  hasNotes: boolean;
  createdAt: number;
};

const mockRecordings: Recording[] = [
  {
    id: "1",
    date: "2025-01-08",
    time: "10:00",
    duration: 30,
    studentName: "Sarah Johnson",
    studentEmail: "sarah@example.com",
    recordingUrl: "https://zoom.us/rec/play/example1",
    notes: "Great progress on scales. Focus on tempo control next lesson.",
    lessonId: "lesson_123",
    hasNotes: true,
    createdAt: new Date("2025-01-08T10:30:00").getTime(),
  },
  {
    id: "2",
    date: "2025-01-07",
    time: "14:00",
    duration: 20,
    studentName: "Mike Chen",
    studentEmail: "mike@example.com",
    recordingUrl: "https://zoom.us/rec/play/example2",
    notes: "",
    lessonId: "lesson_124",
    hasNotes: false,
    createdAt: new Date("2025-01-07T14:20:00").getTime(),
  },
  {
    id: "3",
    date: "2025-01-06",
    time: "11:30",
    duration: 30,
    studentName: "Emma Davis",
    studentEmail: "emma@example.com",
    recordingUrl: "https://zoom.us/rec/play/example3",
    notes:
      "Excellent technique on arpeggios. Student is ready to move to next level.",
    lessonId: "lesson_125",
    hasNotes: true,
    createdAt: new Date("2025-01-06T12:00:00").getTime(),
  },
  {
    id: "4",
    date: "2025-01-05",
    time: "16:00",
    duration: 20,
    studentName: "Alex Kumar",
    studentEmail: "alex@example.com",
    recordingUrl: "https://zoom.us/rec/play/example4",
    notes: "Need to work on rhythm in bars 8-12. Practice with metronome.",
    lessonId: "lesson_126",
    hasNotes: true,
    createdAt: new Date("2025-01-05T16:20:00").getTime(),
  },
];

export default function RecordingsTab() {
  const [recordings, setRecordings] = useState<Recording[]>(mockRecordings);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<
    "all" | "with-notes" | "without-notes"
  >("all");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "student">(
    "date-desc"
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState<string>("");
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(
    null
  );

  const filteredRecordings = recordings
    .filter((rec) => {
      const matchesSearch =
        rec.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.date.includes(searchTerm);

      const matchesFilter =
        filterType === "all"
          ? true
          : filterType === "with-notes"
            ? rec.hasNotes
            : !rec.hasNotes;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === "date-desc") return b.createdAt - a.createdAt;
      if (sortBy === "date-asc") return a.createdAt - b.createdAt;
      return a.studentName.localeCompare(b.studentName);
    });

  const handleEditNotes = (recording: Recording) => {
    setEditingId(recording.id);
    setEditNotes(recording.notes);
    setSelectedRecording(recording);
  };

  const handleSaveNotes = (id: string) => {
    setRecordings((prev) =>
      prev.map((rec) =>
        rec.id === id
          ? {
              ...rec,
              notes: editNotes,
              hasNotes: editNotes.trim().length > 0,
            }
          : rec
      )
    );
    setEditingId(null);
    setEditNotes("");
    setSelectedRecording(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditNotes("");
    setSelectedRecording(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this recording?")) {
      setRecordings((prev) => prev.filter((rec) => rec.id !== id));
    }
  };

  const stats = {
    total: recordings.length,
    withNotes: recordings.filter((r) => r.hasNotes).length,
    withoutNotes: recordings.filter((r) => !r.hasNotes).length,
    thisWeek: recordings.filter((r) => {
      const recordingDate = new Date(r.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return recordingDate >= weekAgo;
    }).length,
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-purple-200 flex items-center gap-3">
            <Video className="h-10 w-10" />
            Lesson Recordings
          </h1>
          <p className="text-purple-400 mt-2">
            View, annotate, and manage your recorded lessons
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-100">
                {stats.total}
              </div>
              <div className="text-sm text-purple-300 mt-1">
                Total Recordings
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-100">
                {stats.thisWeek}
              </div>
              <div className="text-sm text-blue-300 mt-1">This Week</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-700/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-100">
                {stats.withNotes}
              </div>
              <div className="text-sm text-green-300 mt-1">With Notes</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 border-orange-700/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-100">
                {stats.withoutNotes}
              </div>
              <div className="text-sm text-orange-300 mt-1">Need Notes</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="bg-gradient-to-br from-purple-950/50 to-black/50 border-purple-800/30">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
              <Input
                placeholder="Search by student name, email, or date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-purple-900/30 border-purple-700 text-purple-100"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                onClick={() => setFilterType("all")}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                All
              </Button>
              <Button
                variant={filterType === "with-notes" ? "default" : "outline"}
                onClick={() => setFilterType("with-notes")}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                With Notes
              </Button>
              <Button
                variant={filterType === "without-notes" ? "default" : "outline"}
                onClick={() => setFilterType("without-notes")}
                className="flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                Need Notes
              </Button>
            </div>

            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as "date-desc" | "date-asc" | "student"
                )
              }
              className="px-4 py-2 bg-purple-900/30 border border-purple-700 rounded-md text-purple-100"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="student">Student A-Z</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Recordings List */}
      <div className="space-y-4">
        {filteredRecordings.length === 0 ? (
          <Card className="bg-gradient-to-br from-purple-950/50 to-black/50 border-purple-800/30">
            <CardContent className="py-16 text-center">
              <Video className="h-16 w-16 text-purple-400/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-purple-200 mb-2">
                No recordings found
              </h3>
              <p className="text-purple-400">
                Try adjusting your search or filters
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRecordings.map((recording) => (
            <Card
              key={recording.id}
              className="bg-gradient-to-br from-purple-950/50 to-black/50 border-purple-800/30 hover:border-purple-600/50 transition-all"
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left: Video Thumbnail and Actions */}
                  <div className="lg:w-80 shrink-0">
                    <div className="aspect-video bg-black rounded-lg mb-4 flex items-center justify-center border border-purple-700/50 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-transparent"></div>
                      <Play className="h-16 w-16 text-purple-300 group-hover:scale-110 transition-transform cursor-pointer" />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-purple-700 hover:bg-purple-600"
                        onClick={() =>
                          window.open(recording.recordingUrl, "_blank")
                        }
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in Zoom
                      </Button>
                      <Button
                        variant="outline"
                        className="border-purple-600"
                        onClick={() =>
                          window.open(recording.recordingUrl, "_blank")
                        }
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Right: Details and Notes */}
                  <div className="flex-1 space-y-4">
                    {/* Header Info */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-2 text-purple-200">
                            <Calendar className="h-4 w-4" />
                            <span className="font-semibold">
                              {new Date(recording.date).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-purple-300">
                            <Clock className="h-4 w-4" />
                            <span>{recording.time}</span>
                          </div>
                          <Badge
                            variant="secondary"
                            className="bg-purple-800/50"
                          >
                            {recording.duration} min
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-purple-100">
                          <User className="h-5 w-5" />
                          <span className="text-lg font-medium">
                            {recording.studentName}
                          </span>
                          <span className="text-purple-400 text-sm">
                            ({recording.studentEmail})
                          </span>
                        </div>
                      </div>

                      {recording.hasNotes && (
                        <Badge className="bg-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Has Notes
                        </Badge>
                      )}
                    </div>

                    {/* Notes Section */}
                    <div className="border-t border-purple-800/50 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-purple-300 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Lesson Notes
                        </h4>
                        {editingId !== recording.id && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditNotes(recording)}
                            className="text-purple-400 hover:text-purple-300"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        )}
                      </div>

                      {editingId === recording.id ? (
                        <div className="space-y-3">
                          <Textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            rows={4}
                            className="bg-purple-900/30 border-purple-700 text-purple-100"
                            placeholder="Add notes about this lesson: what was covered, homework assigned, areas for improvement..."
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveNotes(recording.id)}
                              className="bg-green-700 hover:bg-green-600"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Save Notes
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                              className="border-purple-600"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-800/30">
                          {recording.notes ? (
                            <p className="text-purple-200 whitespace-pre-wrap">
                              {recording.notes}
                            </p>
                          ) : (
                            <p className="text-purple-400 italic flex items-center gap-2">
                              <Info className="h-4 w-4" />
                              No notes added yet. Click Edit to add lesson
                              notes.
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end pt-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(recording.id)}
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Recording
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Helpful Tips */}
      <Card className="bg-gradient-to-br from-blue-950/30 to-purple-950/30 border-blue-800/30">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <Info className="h-6 w-6 text-blue-400 shrink-0 mt-1" />
            <div>
              <h4 className="text-lg font-semibold text-blue-200 mb-2">
                Tips for Better Recording Management
              </h4>
              <ul className="space-y-1 text-blue-300 text-sm">
                <li>
                  • Add notes immediately after lessons while details are fresh
                </li>
                <li>
                  • Include specific practice instructions and homework for
                  students
                </li>
                <li>
                  • Note any technical issues or areas needing extra focus
                </li>
                <li>
                  • Recordings are kept for your reference and can be shared
                  with students
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
