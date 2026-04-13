import React, { useState } from "react";
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

/* ─────────────────────────────────────────────────────────────
   !important overrides
   Light = default  |  Dark = .dark prefix
───────────────────────────────────────────────────────────── */
const REC_TAB_STYLES = `
  /* Page wrapper */
  .rt-page                        { background: #ffffff !important; }
  .dark .rt-page                  { background: transparent !important; }

  /* Heading */
  .rt-title                       { color: hsl(var(--foreground)) !important; }
  .rt-subtitle                    { color: hsl(var(--muted-foreground)) !important; }
  .dark .rt-title                 { color: #ddd6fe !important; }
  .dark .rt-subtitle              { color: #a78bfa !important; }

  /* Stat cards */
  .rt-stat-purple                 { background: hsl(var(--primary)/0.08) !important; border-color: hsl(var(--primary)/0.2) !important; }
  .rt-stat-blue                   { background: rgba(59,130,246,0.06) !important; border-color: rgba(59,130,246,0.2) !important; }
  .rt-stat-green                  { background: rgba(22,163,74,0.06) !important; border-color: rgba(22,163,74,0.2) !important; }
  .rt-stat-orange                 { background: rgba(234,88,12,0.06) !important; border-color: rgba(234,88,12,0.2) !important; }
  .dark .rt-stat-purple           { background: rgba(88,28,135,0.5) !important; border-color: rgba(109,40,217,0.5) !important; }
  .dark .rt-stat-blue             { background: rgba(30,58,138,0.5) !important; border-color: rgba(59,130,246,0.5) !important; }
  .dark .rt-stat-green            { background: rgba(20,83,45,0.5) !important; border-color: rgba(22,163,74,0.5) !important; }
  .dark .rt-stat-orange           { background: rgba(124,45,18,0.5) !important; border-color: rgba(234,88,12,0.5) !important; }

  .rt-stat-num-purple             { color: hsl(var(--primary)) !important; }
  .rt-stat-num-blue               { color: #2563eb !important; }
  .rt-stat-num-green              { color: #16a34a !important; }
  .rt-stat-num-orange             { color: #ea580c !important; }
  .dark .rt-stat-num-purple       { color: #ede9fe !important; }
  .dark .rt-stat-num-blue         { color: #bfdbfe !important; }
  .dark .rt-stat-num-green        { color: #bbf7d0 !important; }
  .dark .rt-stat-num-orange       { color: #fed7aa !important; }

  .rt-stat-label-purple           { color: hsl(var(--muted-foreground)) !important; }
  .rt-stat-label-blue             { color: #3b82f6 !important; }
  .rt-stat-label-green            { color: #22c55e !important; }
  .rt-stat-label-orange           { color: #f97316 !important; }
  .dark .rt-stat-label-purple     { color: #c4b5fd !important; }
  .dark .rt-stat-label-blue       { color: #93c5fd !important; }
  .dark .rt-stat-label-green      { color: #86efac !important; }
  .dark .rt-stat-label-orange     { color: #fdba74 !important; }

  /* Search/filter card */
  .rt-filter-card                 { background: #ffffff !important; border-color: hsl(var(--border)) !important; }
  .dark .rt-filter-card           { background: rgba(46,16,101,0.5) !important; border-color: rgba(109,40,217,0.3) !important; }

  .rt-search-input                { background: #ffffff !important; border-color: hsl(var(--border)) !important; color: hsl(var(--foreground)) !important; }
  .dark .rt-search-input          { background: rgba(76,29,149,0.3) !important; border-color: rgba(109,40,217,0.5) !important; color: #ede9fe !important; }

  .rt-sort-select                 { background: #ffffff !important; border-color: hsl(var(--border)) !important; color: hsl(var(--foreground)) !important; }
  .dark .rt-sort-select           { background: rgba(76,29,149,0.3) !important; border-color: rgba(109,40,217,0.5) !important; color: #ede9fe !important; }

  /* Recording cards */
  .rt-rec-card                    { background: #ffffff !important; border-color: hsl(var(--border)) !important; box-shadow: 0 2px 12px rgba(0,0,0,0.07) !important; }
  .rt-rec-card:hover              { border-color: hsl(var(--primary)/0.4) !important; box-shadow: 0 4px 20px rgba(0,0,0,0.12) !important; }
  .dark .rt-rec-card              { background: rgba(46,16,101,0.5) !important; border-color: rgba(109,40,217,0.3) !important; }
  .dark .rt-rec-card:hover        { border-color: rgba(124,58,237,0.5) !important; }

  .rt-rec-date                    { color: hsl(var(--foreground)) !important; }
  .rt-rec-time                    { color: hsl(var(--muted-foreground)) !important; }
  .rt-rec-student                 { color: hsl(var(--foreground)) !important; }
  .rt-rec-email                   { color: hsl(var(--muted-foreground)) !important; }
  .dark .rt-rec-date              { color: #ddd6fe !important; }
  .dark .rt-rec-time              { color: #c4b5fd !important; }
  .dark .rt-rec-student           { color: #ede9fe !important; }
  .dark .rt-rec-email             { color: #a78bfa !important; }

  /* Video thumbnail */
  .rt-thumb                       { background: hsl(var(--muted)) !important; border-color: hsl(var(--border)) !important; }
  .dark .rt-thumb                 { background: #000000 !important; border-color: rgba(109,40,217,0.5) !important; }
  .rt-play-icon                   { color: hsl(var(--primary)) !important; }
  .dark .rt-play-icon             { color: #c4b5fd !important; }

  /* Open in Zoom button */
  .rt-zoom-btn                    { background: hsl(var(--primary)) !important; color: #ffffff !important; }
  .rt-zoom-btn:hover              { background: hsl(var(--primary)/0.9) !important; }
  .dark .rt-zoom-btn              { background: #7c3aed !important; }
  .dark .rt-zoom-btn:hover        { background: #6d28d9 !important; }

  .rt-dl-btn                      { border-color: hsl(var(--primary)/0.4) !important; color: hsl(var(--primary)) !important; background: transparent !important; }
  .rt-dl-btn:hover                { background: hsl(var(--primary)/0.08) !important; }
  .dark .rt-dl-btn                { border-color: rgba(124,58,237,0.6) !important; color: #c4b5fd !important; }

  /* Notes section */
  .rt-notes-divider               { border-color: hsl(var(--border)) !important; }
  .dark .rt-notes-divider         { border-color: rgba(109,40,217,0.5) !important; }
  .rt-notes-label                 { color: hsl(var(--muted-foreground)) !important; }
  .dark .rt-notes-label           { color: #c4b5fd !important; }
  .rt-notes-edit-btn              { color: hsl(var(--primary)) !important; }
  .dark .rt-notes-edit-btn        { color: #a78bfa !important; }

  .rt-notes-box                   { background: hsl(var(--muted)) !important; border-color: hsl(var(--border)) !important; }
  .dark .rt-notes-box             { background: rgba(76,29,149,0.2) !important; border-color: rgba(109,40,217,0.3) !important; }
  .rt-notes-text                  { color: hsl(var(--foreground)) !important; }
  .rt-notes-empty                 { color: hsl(var(--muted-foreground)) !important; }
  .dark .rt-notes-text            { color: #ddd6fe !important; }
  .dark .rt-notes-empty           { color: #a78bfa !important; }

  .rt-notes-textarea              { background: #ffffff !important; border-color: hsl(var(--border)) !important; color: hsl(var(--foreground)) !important; }
  .dark .rt-notes-textarea        { background: rgba(76,29,149,0.3) !important; border-color: rgba(109,40,217,0.5) !important; color: #ede9fe !important; }

  /* Tips card */
  .rt-tips-card                   { background: rgba(59,130,246,0.04) !important; border-color: rgba(59,130,246,0.15) !important; }
  .dark .rt-tips-card             { background: rgba(30,58,138,0.3) !important; border-color: rgba(59,130,246,0.3) !important; }
  .rt-tips-title                  { color: #2563eb !important; }
  .rt-tips-text                   { color: #3b82f6 !important; }
  .dark .rt-tips-title            { color: #93c5fd !important; }
  .dark .rt-tips-text             { color: #60a5fa !important; }

  /* Empty state */
  .rt-empty-card                  { background: #ffffff !important; border-color: hsl(var(--border)) !important; }
  .dark .rt-empty-card            { background: rgba(46,16,101,0.5) !important; border-color: rgba(109,40,217,0.3) !important; }
  .rt-empty-title                 { color: hsl(var(--foreground)) !important; }
  .rt-empty-sub                   { color: hsl(var(--muted-foreground)) !important; }
  .dark .rt-empty-title           { color: #ddd6fe !important; }
  .dark .rt-empty-sub             { color: #a78bfa !important; }
`;

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

function StatCard({
  className,
  numClass,
  labelClass,
  value,
  label,
}: {
  className: string;
  numClass: string;
  labelClass: string;
  value: number;
  label: string;
}) {
  return (
    <div className={`${className} rounded-xl border p-4 sm:p-6 text-center`}>
      <div className={`${numClass} text-3xl sm:text-4xl font-bold`}>
        {value}
      </div>
      <div className={`${labelClass} text-xs sm:text-sm mt-1`}>{label}</div>
    </div>
  );
}

export default function RecordingsTab() {
  const [recordings, setRecordings] = useState<Recording[]>(mockRecordings);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "with-notes" | "without-notes"
  >("all");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "student">(
    "date-desc",
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");

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

  const handleEditNotes = (rec: Recording) => {
    setEditingId(rec.id);
    setEditNotes(rec.notes);
  };
  const handleSaveNotes = (id: string) => {
    setRecordings((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, notes: editNotes, hasNotes: editNotes.trim().length > 0 }
          : r,
      ),
    );
    setEditingId(null);
    setEditNotes("");
  };
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this recording?"))
      setRecordings((prev) => prev.filter((r) => r.id !== id));
  };

  const stats = {
    total: recordings.length,
    withNotes: recordings.filter((r) => r.hasNotes).length,
    withoutNotes: recordings.filter((r) => !r.hasNotes).length,
    thisWeek: recordings.filter(
      (r) =>
        new Date(r.date) >=
        (() => {
          const d = new Date();
          d.setDate(d.getDate() - 7);
          return d;
        })(),
    ).length,
  };

  return (
    <div className="rt-page max-w-7xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      <style>{REC_TAB_STYLES}</style>

      {/* ── Header ── */}
      <div>
        <h1 className="rt-title text-2xl sm:text-4xl font-bold flex items-center gap-2 sm:gap-3 font-serif">
          <Video className="h-7 w-7 sm:h-10 sm:w-10 shrink-0" />
          Lesson Recordings
        </h1>
        <p className="rt-subtitle mt-1 sm:mt-2 text-sm sm:text-base">
          View, annotate, and manage your recorded lessons
        </p>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          className="rt-stat-purple"
          numClass="rt-stat-num-purple"
          labelClass="rt-stat-label-purple"
          value={stats.total}
          label="Total Recordings"
        />
        <StatCard
          className="rt-stat-blue"
          numClass="rt-stat-num-blue"
          labelClass="rt-stat-label-blue"
          value={stats.thisWeek}
          label="This Week"
        />
        <StatCard
          className="rt-stat-green"
          numClass="rt-stat-num-green"
          labelClass="rt-stat-label-green"
          value={stats.withNotes}
          label="With Notes"
        />
        <StatCard
          className="rt-stat-orange"
          numClass="rt-stat-num-orange"
          labelClass="rt-stat-label-orange"
          value={stats.withoutNotes}
          label="Need Notes"
        />
      </div>

      {/* ── Search & Filters ── */}
      <div className="rt-filter-card rounded-xl border p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search by student name, email, or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rt-search-input w-full pl-10 pr-4 py-2 rounded-lg border text-sm outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {/* Filter buttons */}
            {(["all", "with-notes", "without-notes"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-medium transition-all ${
                  filterType === f
                    ? "bg-primary text-white border-primary dark:bg-purple-700 dark:border-purple-600"
                    : "border-border text-foreground hover:bg-muted dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-900/30"
                }`}
              >
                {f === "all" && <Filter className="h-3.5 w-3.5" />}
                {f === "with-notes" && <CheckCircle className="h-3.5 w-3.5" />}
                {f === "without-notes" && (
                  <AlertCircle className="h-3.5 w-3.5" />
                )}
                {f === "all"
                  ? "All"
                  : f === "with-notes"
                    ? "With Notes"
                    : "Need Notes"}
              </button>
            ))}

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rt-sort-select ml-auto px-3 py-1.5 rounded-lg border text-xs sm:text-sm outline-none"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="student">Student A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Recordings list ── */}
      <div className="space-y-3 sm:space-y-4">
        {filteredRecordings.length === 0 ? (
          <div className="rt-empty-card rounded-xl border p-10 sm:p-16 text-center">
            <Video className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-30 text-primary dark:text-purple-400" />
            <h3 className="rt-empty-title text-lg sm:text-xl font-semibold mb-2">
              No recordings found
            </h3>
            <p className="rt-empty-sub text-sm sm:text-base">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          filteredRecordings.map((rec) => (
            <div
              key={rec.id}
              className="rt-rec-card rounded-xl border overflow-hidden transition-all"
            >
              <div className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                  {/* ── Video thumbnail + actions ── */}
                  <div className="lg:w-72 shrink-0">
                    <div
                      className="rt-thumb aspect-video rounded-lg mb-3 flex items-center justify-center border relative overflow-hidden group cursor-pointer"
                      onClick={() => window.open(rec.recordingUrl, "_blank")}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent dark:from-purple-600/20" />
                      <Play className="rt-play-icon h-12 w-12 sm:h-16 sm:w-16 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => window.open(rec.recordingUrl, "_blank")}
                        className="rt-zoom-btn flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all"
                      >
                        <ExternalLink className="h-4 w-4 shrink-0" />
                        Open in Zoom
                      </button>
                      <button
                        onClick={() => window.open(rec.recordingUrl, "_blank")}
                        className="rt-dl-btn p-2 rounded-lg border transition-all"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* ── Details + notes ── */}
                  <div className="flex-1 space-y-3 sm:space-y-4 min-w-0">
                    {/* Meta row */}
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="space-y-1.5 sm:space-y-2 min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                          <div className="rt-rec-date flex items-center gap-1.5 font-semibold text-sm sm:text-base">
                            <Calendar className="h-3.5 w-3.5 shrink-0" />
                            {new Date(rec.date).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </div>
                          <div className="rt-rec-time flex items-center gap-1.5 text-xs sm:text-sm">
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            {rec.time}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {rec.duration} min
                          </Badge>
                        </div>
                        <div className="rt-rec-student flex items-center gap-2 flex-wrap">
                          <User className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                          <span className="text-base sm:text-lg font-medium">
                            {rec.studentName}
                          </span>
                          <span className="rt-rec-email text-xs sm:text-sm">
                            ({rec.studentEmail})
                          </span>
                        </div>
                      </div>
                      {rec.hasNotes && (
                        <Badge className="bg-green-600 dark:bg-green-700 text-white text-xs shrink-0">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Has Notes
                        </Badge>
                      )}
                    </div>

                    {/* Notes section */}
                    <div className="rt-notes-divider border-t pt-3 sm:pt-4">
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <h4 className="rt-notes-label text-xs sm:text-sm font-semibold flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          Lesson Notes
                        </h4>
                        {editingId !== rec.id && (
                          <button
                            onClick={() => handleEditNotes(rec)}
                            className="rt-notes-edit-btn flex items-center gap-1 text-xs sm:text-sm font-medium hover:opacity-80 transition-opacity"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            Edit
                          </button>
                        )}
                      </div>

                      {editingId === rec.id ? (
                        <div className="space-y-2 sm:space-y-3">
                          <textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            rows={4}
                            className="rt-notes-textarea w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none transition-all"
                            placeholder="Add notes about this lesson: what was covered, homework assigned, areas for improvement..."
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveNotes(rec.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-medium transition-all"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              Save Notes
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setEditNotes("");
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-foreground dark:border-purple-600 dark:text-purple-300 text-xs sm:text-sm font-medium transition-all hover:bg-muted dark:hover:bg-purple-900/30"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="rt-notes-box rounded-lg p-3 sm:p-4 border">
                          {rec.notes ? (
                            <p className="rt-notes-text text-xs sm:text-sm whitespace-pre-wrap">
                              {rec.notes}
                            </p>
                          ) : (
                            <p className="rt-notes-empty text-xs sm:text-sm italic flex items-center gap-2">
                              <Info className="h-3.5 w-3.5 shrink-0" />
                              No notes added yet. Click Edit to add lesson
                              notes.
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Delete */}
                    <div className="flex justify-end pt-1 sm:pt-2">
                      <button
                        onClick={() => handleDelete(rec.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-medium transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete Recording
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Tips card ── */}
      <div className="rt-tips-card rounded-xl border p-4 sm:p-6">
        <div className="flex gap-3 sm:gap-4">
          <Info className="h-5 w-5 sm:h-6 sm:w-6 rt-tips-title shrink-0 mt-0.5" />
          <div>
            <h4 className="rt-tips-title text-base sm:text-lg font-semibold mb-2">
              Tips for Better Recording Management
            </h4>
            <ul className="rt-tips-text space-y-1 text-xs sm:text-sm">
              <li>
                • Add notes immediately after lessons while details are fresh
              </li>
              <li>
                • Include specific practice instructions and homework for
                students
              </li>
              <li>• Note any technical issues or areas needing extra focus</li>
              <li>
                • Recordings are kept for your reference and can be shared with
                students
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
