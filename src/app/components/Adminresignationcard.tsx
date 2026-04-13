"use client";

// components/leave/AdminResignationCard.tsx
import { useState } from "react";
import { Resignation, ResignationStatus } from "../../../convex/resignations";

const ARC_STYLES = `
  .arc-card                   { background: #ffffff !important; border-color: hsl(var(--border)) !important; box-shadow: 0 2px 10px rgba(0,0,0,0.06) !important; }
  .arc-card-warn              { background: #ffffff !important; border-color: rgba(239,68,68,0.4) !important; }
  .dark .arc-card             { background: #151828 !important; border-color: #1E2438 !important; }
  .dark .arc-card-warn        { background: #151828 !important; border-color: rgba(255,92,106,0.5) !important; }

  /* Short-notice warning banner */
  .arc-warn-banner            { background: rgba(239,68,68,0.08) !important; border-color: rgba(239,68,68,0.3) !important; color: #dc2626 !important; }
  .dark .arc-warn-banner      { background: rgba(255,92,106,0.1) !important; border-color: rgba(255,92,106,0.35) !important; color: #FF5C6A !important; }

  /* Teacher name */
  .arc-name                   { color: hsl(var(--foreground)) !important; }
  .dark .arc-name             { color: #E8EAF6 !important; }

  /* "Resignation" tag */
  .arc-tag-resign             { background: rgba(239,68,68,0.08) !important; color: #dc2626 !important; }
  .dark .arc-tag-resign       { background: rgba(255,92,106,0.1) !important; color: #FF5C6A !important; }

  /* "SHORT NOTICE" tag */
  .arc-tag-short              { background: rgba(239,68,68,0.12) !important; border-color: rgba(239,68,68,0.35) !important; color: #dc2626 !important; }
  .dark .arc-tag-short        { background: rgba(255,92,106,0.15) !important; border-color: rgba(255,92,106,0.4) !important; color: #FF5C6A !important; }

  /* Meta line */
  .arc-meta                   { color: hsl(var(--muted-foreground)) !important; }
  .dark .arc-meta             { color: #6B7280 !important; }
  .arc-meta-date              { color: #dc2626 !important; }
  .dark .arc-meta-date        { color: #FF5C6A !important; }

  /* Reason / handover boxes */
  .arc-box                    { background: hsl(var(--muted)) !important; }
  .dark .arc-box              { background: #1C2035 !important; }
  .arc-box-text               { color: hsl(var(--foreground)) !important; }
  .arc-box-muted              { color: hsl(var(--muted-foreground)) !important; }
  .dark .arc-box-text         { color: rgba(232,234,246,0.82) !important; }
  .dark .arc-box-muted        { color: #6B7280 !important; }
  .arc-box-label              { color: hsl(var(--foreground)) !important; font-weight: 600 !important; }
  .dark .arc-box-label        { color: #E8EAF6 !important; }

  /* Admin note (read-only) */
  .arc-admin-note             { color: hsl(var(--muted-foreground)) !important; }
  .dark .arc-admin-note       { color: #6B7280 !important; }

  /* Action area label */
  .arc-action-label           { color: hsl(var(--muted-foreground)) !important; }
  .dark .arc-action-label     { color: #6B7280 !important; }

  /* Note input */
  .arc-input                  { background: #ffffff !important; border-color: hsl(var(--border)) !important; color: hsl(var(--foreground)) !important; }
  .arc-input:focus            { border-color: hsl(var(--primary)) !important; box-shadow: 0 0 0 2px hsl(var(--primary)/0.2) !important; }
  .arc-input::placeholder     { color: hsl(var(--muted-foreground)) !important; }
  .dark .arc-input            { background: #1C2035 !important; border-color: #1E2438 !important; color: #E8EAF6 !important; }
  .dark .arc-input::placeholder { color: #6B7280 !important; }

  /* Acknowledge button */
  .arc-ack-btn                { background: #16a34a !important; color: #ffffff !important; border: none !important; }
  .arc-ack-btn:hover          { background: #15803d !important; }
  .dark .arc-ack-btn          { background: linear-gradient(135deg, #3DD68C, #2aad72) !important; color: #0D0F1A !important; }

  /* Reject button */
  .arc-rej-btn                { background: transparent !important; color: #dc2626 !important; border-color: #dc2626 !important; }
  .arc-rej-btn:hover          { background: rgba(220,38,38,0.08) !important; }
  .dark .arc-rej-btn          { color: #FF5C6A !important; border-color: #FF5C6A !important; }
  .dark .arc-rej-btn:hover    { background: rgba(255,92,106,0.1) !important; }
`;

// Status badge colours — light & dark handled via inline styles keyed per mode
function getStatusStyle(status: ResignationStatus, isDark: boolean) {
  const map = {
    pending: {
      bg: isDark ? "rgba(245,200,66,0.12)" : "rgba(234,179,8,0.1)",
      border: isDark ? "rgba(245,200,66,0.35)" : "rgba(234,179,8,0.3)",
      color: isDark ? "#F5C842" : "#a16207",
    },
    acknowledged: {
      bg: isDark ? "rgba(61,214,140,0.12)" : "rgba(22,163,74,0.08)",
      border: isDark ? "rgba(61,214,140,0.35)" : "rgba(22,163,74,0.3)",
      color: isDark ? "#3DD68C" : "#15803d",
    },
    rejected: {
      bg: isDark ? "rgba(255,92,106,0.12)" : "rgba(220,38,38,0.08)",
      border: isDark ? "rgba(255,92,106,0.35)" : "rgba(220,38,38,0.3)",
      color: isDark ? "#FF5C6A" : "#dc2626",
    },
  };
  return map[status];
}

function fmtDate(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface AdminResignationCardProps {
  resignation: Resignation;
  onDecide: (
    id: string,
    status: "acknowledged" | "rejected",
    adminNote: string,
  ) => void;
}

export default function AdminResignationCard({
  resignation: r,
  onDecide,
}: AdminResignationCardProps) {
  const [note, setNote] = useState("");
  // Detect dark mode at render time
  const isDark =
    typeof window !== "undefined" &&
    document.documentElement.classList.contains("dark");
  const s = getStatusStyle(r.status, isDark);

  function handleDecide(status: "acknowledged" | "rejected") {
    onDecide(r._id, status, note.trim());
    setNote("");
  }

  return (
    <div
      className={`${r.shortNotice ? "arc-card-warn" : "arc-card"} rounded-2xl border p-4 sm:p-6 mb-4 shadow-sm`}
    >
      <style>{ARC_STYLES}</style>

      {/* Short-notice warning banner */}
      {r.shortNotice && (
        <div className="arc-warn-banner flex items-center gap-2 rounded-lg border px-3 sm:px-4 py-2.5 mb-3 sm:mb-4 text-xs sm:text-sm font-semibold">
          <span className="text-base shrink-0">⚠️</span>
          Short notice — less than 1 month given.{" "}
          <strong>Final month pay should be withheld</strong> per policy.
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-2 sm:gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
            <span className="arc-name font-bold text-sm sm:text-base">
              {r.teacherName}
            </span>
            <span className="arc-tag-resign text-xs font-semibold rounded-md px-2 py-0.5">
              Resignation
            </span>
            {r.shortNotice && (
              <span className="arc-tag-short text-xs font-black rounded-md px-2 py-0.5 border">
                SHORT NOTICE · NO PAY
              </span>
            )}
          </div>
          <div className="arc-meta text-xs sm:text-sm">
            Last working day:{" "}
            <strong className="arc-meta-date">
              {fmtDate(r.lastWorkingDay)}
            </strong>
            {"  ·  "}
            Submitted{" "}
            {fmtDate(new Date(r.submittedAt).toISOString().split("T")[0])}
          </div>
        </div>

        {/* Status badge */}
        <span
          className="text-xs font-bold uppercase tracking-widest rounded-full px-3 py-1 shrink-0"
          style={{
            background: s.bg,
            border: `1px solid ${s.border}`,
            color: s.color,
          }}
        >
          {r.status === "acknowledged"
            ? "Acknowledged"
            : r.status === "rejected"
              ? "Rejected"
              : "Pending"}
        </span>
      </div>

      {/* Reason */}
      <div
        className={`arc-box arc-box-text rounded-lg px-3 sm:px-4 py-3 text-xs sm:text-sm leading-relaxed mb-3 ${r.handoverNotes || r.status === "pending" ? "" : ""}`}
      >
        {r.reason}
      </div>

      {/* Handover notes */}
      {r.handoverNotes && (
        <div className="arc-box arc-box-muted rounded-lg px-3 sm:px-4 py-3 text-xs sm:text-sm leading-relaxed mb-3">
          <span className="arc-box-label">Handover notes: </span>
          {r.handoverNotes}
        </div>
      )}

      {/* Admin note (read-only after decision) */}
      {r.adminNote && r.status !== "pending" && (
        <p className="arc-admin-note text-xs italic mt-2">
          Your note: {r.adminNote}
        </p>
      )}

      {/* Action area — pending only */}
      {r.status === "pending" && (
        <>
          <div className="mb-3">
            <label className="arc-action-label block text-xs font-semibold uppercase tracking-wider mb-1.5">
              Admin Note{" "}
              <span className="font-normal normal-case">
                (shown to teacher)
              </span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                r.shortNotice
                  ? "e.g. Acknowledged — final month pay withheld due to short notice..."
                  : "e.g. Acknowledged — best of luck, or reason for rejection..."
              }
              className="arc-input w-full px-3 sm:px-4 py-2.5 rounded-xl border text-xs sm:text-sm outline-none transition-all"
            />
          </div>

          <div className="flex gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={() => handleDecide("acknowledged")}
              className="arc-ack-btn px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all"
            >
              ✓ Acknowledge
            </button>
            <button
              onClick={() => handleDecide("rejected")}
              className="arc-rej-btn px-4 sm:px-6 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all"
            >
              ✕ Reject
            </button>
          </div>
        </>
      )}
    </div>
  );
}
