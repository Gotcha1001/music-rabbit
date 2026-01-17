// app/dashboard/teacher/recordings/page.tsx
"use client";

import { useUserDetail } from "@/context/UserDetailContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";

export default function TeacherRecordings() {
  const { userDetail } = useUserDetail();

  const recordings = useQuery(
    api.recordings.getByTeacher,
    userDetail?.role === "teacher" ? undefined : "skip"
  );

  // These match your actual backend
  const updateRecording = useMutation(api.recordings.update);
  const deleteRecording = useMutation(api.recordings.remove);

  const [notes, setNotes] = useState<Record<string, string>>({});

  // Early returns
  if (!userDetail) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (userDetail.role !== "teacher") {
    return (
      <div className="flex min-h-screen items-center justify-center text-destructive">
        Unauthorized – Teachers only
      </div>
    );
  }

  if (recordings === undefined) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (recordings.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">My Recordings</h1>
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No recordings yet.
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleUpdateNotes = async (
    recordingId: Id<"recordings">,
    currentNotes: string | undefined
  ) => {
    const newNote = notes[recordingId] ?? "";

    if (newNote === (currentNotes ?? "")) {
      toast.info("No changes to save");
      return;
    }

    try {
      await updateRecording({
        recordingId,
        notes: newNote,
        // recordingUrl is required by your current mutation — so we pass the existing one
        recordingUrl: recordings.find((r) => r._id === recordingId)!
          .recordingUrl,
      });

      toast.success("Notes saved");
      setNotes((prev) => {
        const copy = { ...prev };
        delete copy[recordingId];
        return copy;
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to save notes");
    }
  };

  const handleDelete = async (recordingId: Id<"recordings">) => {
    if (!confirm("Delete this recording permanently? This cannot be undone."))
      return;

    try {
      await deleteRecording({ recordingId });
      toast.success("Recording deleted");
    } catch {
      toast.error("Failed to delete recording");
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">My Recordings</h1>

      <div className="space-y-8">
        {recordings.map((rec) => (
          <Card key={rec._id} className="overflow-hidden">
            <CardHeader>
              <CardTitle>
                {new Date(rec.timestamp).toLocaleString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <video
                src={rec.recordingUrl}
                controls
                className="w-full rounded-lg bg-black border"
                preload="metadata"
              />

              <div>
                <label className="text-sm font-medium block mb-1">
                  Private Notes
                </label>
                <Input
                  placeholder="Add notes only you can see..."
                  value={notes[rec._id] ?? rec.notes ?? ""}
                  onChange={(e) =>
                    setNotes((prev) => ({ ...prev, [rec._id]: e.target.value }))
                  }
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => handleUpdateNotes(rec._id, rec.notes)}
                  disabled={
                    (notes[rec._id] ?? rec.notes ?? "") === (rec.notes ?? "")
                  }
                >
                  Save Notes
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(rec._id)}
                >
                  Delete Recording
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
