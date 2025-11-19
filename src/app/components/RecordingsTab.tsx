import { useState } from "react";
import { useQuery, useMutation } from "convex/react";

import { format } from "date-fns";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  FileText,
  ExternalLink,
  Plus,
  Edit,
  Trash,
  Video,
  Calendar,
  Clock,
  User,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";

// Component for the Recordings Tab
export function RecordingsTab() {
  const currentUser = useQuery(api.users.get);
  const recordings = useQuery(api.recordings.getByTeacher) ?? [];
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRecording, setEditingRecording] =
    useState<Doc<"recordings"> | null>(null);

  // Group recordings by month
  const recordingsByMonth = recordings.reduce(
    (acc, rec) => {
      const date = new Date(rec.timestamp);
      const monthKey = format(date, "MMMM yyyy");
      if (!acc[monthKey]) acc[monthKey] = [];
      acc[monthKey].push(rec);
      return acc;
    },
    {} as Record<string, typeof recordings>
  );

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Video className="h-6 w-6" />
            Lesson Recordings
          </h2>
          <p className="text-muted-foreground mt-1">
            View and manage your recorded lessons
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Recording
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <AddRecordingForm onSuccess={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Recordings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{recordings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {
                recordings.filter((r) => {
                  const recDate = new Date(r.timestamp);
                  const now = new Date();
                  return (
                    recDate.getMonth() === now.getMonth() &&
                    recDate.getFullYear() === now.getFullYear()
                  );
                }).length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              With Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {recordings.filter((r) => r.notes).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recordings List */}
      {recordings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Video className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No recordings yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add your first lesson recording to keep track of your teaching
              sessions
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Recording
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(recordingsByMonth)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([month, recs]) => (
              <Card key={month}>
                <CardHeader>
                  <CardTitle className="text-lg">{month}</CardTitle>
                  <CardDescription>
                    {recs.length} recording{recs.length !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Lesson</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recs.map((rec) => (
                        <RecordingRow
                          key={rec._id}
                          recording={rec}
                          onEdit={setEditingRecording}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={!!editingRecording}
        onOpenChange={(open) => !open && setEditingRecording(null)}
      >
        <DialogContent className="max-w-2xl">
          {editingRecording && (
            <EditRecordingForm
              recording={editingRecording}
              onSuccess={() => setEditingRecording(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Recording Row Component
function RecordingRow({
  recording,
  onEdit,
}: {
  recording: Doc<"recordings">;
  onEdit: (rec: Doc<"recordings">) => void;
}) {
  const lesson = useQuery(api.schedules.getLesson, {
    scheduleId: recording.scheduleId,
    lessonId: recording.lessonStringId,
  });

  const student = useQuery(
    api.users.getById,
    lesson?.studentId ? { id: lesson.studentId } : "skip"
  );

  const deleteRecording = useMutation(api.recordings.remove);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this recording?")) return;

    setIsDeleting(true);
    try {
      await deleteRecording({ recordingId: recording._id });
      toast.success("Recording deleted");
    } catch (error) {
      toast.error("Failed to delete recording");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {lesson ? format(new Date(lesson.date), "MMM d, yyyy") : "Loading..."}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{recording.lessonStringId}</Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          {student?.email ?? "Loading..."}
        </div>
      </TableCell>
      <TableCell className="max-w-xs">
        {recording.notes ? (
          <p className="text-sm truncate">{recording.notes}</p>
        ) : (
          <span className="text-muted-foreground text-sm">No notes</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(recording.recordingUrl, "_blank")}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(recording)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash className="h-4 w-4" />
            )}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

// Add Recording Form
function AddRecordingForm({ onSuccess }: { onSuccess: () => void }) {
  const currentUser = useQuery(api.users.get);
  const schedules =
    useQuery(
      api.schedules.getByTeacher,
      currentUser ? { teacherId: currentUser._id } : "skip"
    ) ?? [];

  const addRecording = useMutation(api.recordings.addRecording);

  const [scheduleId, setScheduleId] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [recordingUrl, setRecordingUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get all lessons from schedules
  const allLessons = schedules
    .flatMap((schedule) =>
      schedule.lessons.map((lesson) => ({
        scheduleId: schedule._id,
        lessonId: lesson.lessonId,
        date: schedule.date,
        time: lesson.time,
        studentId: lesson.studentId,
      }))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleId || !lessonId || !recordingUrl) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await addRecording({
        scheduleId: scheduleId as Id<"schedules">,
        lessonStringId: lessonId,
        recordingUrl,
        notes: notes || undefined,
      });
      toast.success("Recording added successfully!");
      onSuccess();
    } catch (error) {
      toast.error("Failed to add recording");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Add Lesson Recording</DialogTitle>
        <DialogDescription>
          Add a new Zoom recording for one of your lessons
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div>
          <Label htmlFor="lesson">Select Lesson *</Label>
          <select
            id="lesson"
            className="w-full mt-1 px-3 py-2 border rounded-md"
            value={`${scheduleId}|${lessonId}`}
            onChange={(e) => {
              const [sid, lid] = e.target.value.split("|");
              setScheduleId(sid);
              setLessonId(lid);
            }}
            required
          >
            <option value="">Choose a lesson...</option>
            {allLessons.map((lesson) => (
              <option
                key={`${lesson.scheduleId}-${lesson.lessonId}`}
                value={`${lesson.scheduleId}|${lesson.lessonId}`}
              >
                {format(new Date(lesson.date), "MMM d, yyyy")} - {lesson.time} -{" "}
                {lesson.lessonId}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="recordingUrl">Zoom Recording URL *</Label>
          <Input
            id="recordingUrl"
            type="url"
            placeholder="https://zoom.us/rec/share/..."
            value={recordingUrl}
            onChange={(e) => setRecordingUrl(e.target.value)}
            required
          />
          <p className="text-sm text-muted-foreground mt-1">
            Copy the recording link from your Zoom account
          </p>
        </div>

        <div>
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Add any notes about this recording..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add Recording
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

// Edit Recording Form
function EditRecordingForm({
  recording,
  onSuccess,
}: {
  recording: Doc<"recordings">;
  onSuccess: () => void;
}) {
  const updateRecording = useMutation(api.recordings.update);
  const [notes, setNotes] = useState(recording.notes || "");
  const [recordingUrl, setRecordingUrl] = useState(recording.recordingUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateRecording({
        recordingId: recording._id,
        recordingUrl,
        notes: notes || undefined,
      });
      toast.success("Recording updated!");
      onSuccess();
    } catch (error) {
      toast.error("Failed to update recording");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Edit Recording</DialogTitle>
        <DialogDescription>Update the recording URL or notes</DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div>
          <Label htmlFor="edit-url">Recording URL</Label>
          <Input
            id="edit-url"
            type="url"
            value={recordingUrl}
            onChange={(e) => setRecordingUrl(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="edit-notes">Notes</Label>
          <Textarea
            id="edit-notes"
            placeholder="Add notes about this recording..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}
