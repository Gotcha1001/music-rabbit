// app/dashboard/teacher/recordings/page.tsx
"use client";

import { useUserDetail } from "@/context/UserDetailContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useState } from "react";

/* ─────────────────────────────────────────────────────────────
   !important overrides
   Light = default  |  Dark = .dark prefix
───────────────────────────────────────────────────────────── */
const REC_STYLES = `
  .rec-page                   { background: #ffffff !important; }
  .dark .rec-page             { background: linear-gradient(to bottom, #000000, #1a0030, #000000) !important; }

  .rec-title                  { color: hsl(var(--foreground)) !important; }
  .dark .rec-title            { color: #ede9fe !important; }

  /* Recording card */
  .rec-card                   { background: #ffffff !important; border-color: hsl(var(--border)) !important; box-shadow: 0 2px 12px rgba(0,0,0,0.07) !important; }
  .dark .rec-card             { background: hsl(270 90% 5%) !important; border-color: rgba(109,40,217,0.3) !important; box-shadow: 0 0 24px rgba(139,92,246,0.1) !important; }

  .rec-card-title             { color: hsl(var(--foreground)) !important; }
  .dark .rec-card-title       { color: #ddd6fe !important; }

  /* Notes label + input */
  .rec-label                  { color: hsl(var(--foreground)) !important; }
  .dark .rec-label            { color: #c4b5fd !important; }

  .rec-input                  { background: #ffffff !important; border-color: hsl(var(--border)) !important; color: hsl(var(--foreground)) !important; }
  .rec-input:focus            { border-color: hsl(var(--primary)) !important; box-shadow: 0 0 0 2px hsl(var(--primary)/0.2) !important; }
  .dark .rec-input            { background: hsl(270 80% 6%) !important; border-color: rgba(109,40,217,0.4) !important; color: #ede9fe !important; }
  .dark .rec-input::placeholder { color: rgba(196,181,253,0.5) !important; }

  /* Save button */
  .rec-save-btn               { background: hsl(var(--primary)) !important; color: #ffffff !important; border: none !important; }
  .rec-save-btn:hover:not(:disabled) { background: hsl(var(--primary)/0.9) !important; }
  .rec-save-btn:disabled      { opacity: 0.5 !important; cursor: not-allowed !important; }
  .dark .rec-save-btn         { background: #7c3aed !important; }
  .dark .rec-save-btn:hover:not(:disabled) { background: #6d28d9 !important; }

  /* Empty state */
  .rec-empty                  { color: hsl(var(--muted-foreground)) !important; }
  .dark .rec-empty            { color: #c4b5fd !important; }
`;

export default function TeacherRecordings() {
  const { userDetail } = useUserDetail();
  const recordings = useQuery(
    api.recordings.getByTeacher,
    userDetail?.role === "teacher" ? undefined : "skip",
  );
  const updateRecording = useMutation(api.recordings.update);
  const deleteRecording = useMutation(api.recordings.remove);
  const [notes, setNotes] = useState<Record<string, string>>({});

  if (!userDetail) {
    return (
      <div className="rec-page min-h-screen flex items-center justify-center">
        <style>{REC_STYLES}</style>
        <p className="rec-empty">Loading…</p>
      </div>
    );
  }

  if (userDetail.role !== "teacher") {
    return (
      <div className="rec-page min-h-screen flex items-center justify-center">
        <style>{REC_STYLES}</style>
        <p className="text-destructive">Unauthorized – Teachers only</p>
      </div>
    );
  }

  if (recordings === undefined) {
    return (
      <div className="rec-page min-h-screen container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        <style>{REC_STYLES}</style>
        <Skeleton className="h-9 w-48 sm:w-64" />
        <Skeleton className="h-48 sm:h-64 w-full rounded-xl" />
        <Skeleton className="h-48 sm:h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (recordings.length === 0) {
    return (
      <div className="rec-page min-h-screen container mx-auto p-4 sm:p-6">
        <style>{REC_STYLES}</style>
        <h1 className="rec-title text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 font-serif">
          My Recordings
        </h1>
        <div className="rec-card rounded-xl border-2 p-10 sm:p-16 text-center shadow-sm">
          <p className="rec-empty text-base sm:text-lg">No recordings yet.</p>
        </div>
      </div>
    );
  }

  const handleUpdateNotes = async (
    recordingId: Id<"recordings">,
    currentNotes: string | undefined,
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
    <div className="rec-page min-h-screen">
      <style>{REC_STYLES}</style>
      <div className="container mx-auto p-4 sm:p-6 max-w-5xl">
        <h1 className="rec-title text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 font-serif">
          My Recordings
        </h1>

        <div className="space-y-6 sm:space-y-8">
          {recordings.map((rec) => (
            <div
              key={rec._id}
              className="rec-card rounded-xl border-2 overflow-hidden shadow-sm"
            >
              {/* Card header */}
              <div className="p-4 sm:p-6 border-b border-inherit">
                <h2 className="rec-card-title text-base sm:text-lg font-bold font-serif">
                  {new Date(rec.timestamp).toLocaleString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </h2>
              </div>

              {/* Card body */}
              <div className="p-4 sm:p-6 space-y-4">
                {/* Video player */}
                <video
                  src={rec.recordingUrl}
                  controls
                  className="w-full rounded-lg bg-black border border-inherit"
                  preload="metadata"
                />

                {/* Notes */}
                <div>
                  <label className="rec-label text-sm font-medium block mb-1.5">
                    Private Notes
                  </label>
                  <input
                    placeholder="Add notes only you can see..."
                    value={notes[rec._id] ?? rec.notes ?? ""}
                    onChange={(e) =>
                      setNotes((prev) => ({
                        ...prev,
                        [rec._id]: e.target.value,
                      }))
                    }
                    className="rec-input w-full px-3 py-2 rounded-lg border text-sm outline-none transition-all duration-200"
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={() => handleUpdateNotes(rec._id, rec.notes)}
                    disabled={
                      (notes[rec._id] ?? rec.notes ?? "") === (rec.notes ?? "")
                    }
                    className="rec-save-btn px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                  >
                    Save Notes
                  </button>
                  <button
                    onClick={() => handleDelete(rec._id)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition-all duration-200"
                  >
                    Delete Recording
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
