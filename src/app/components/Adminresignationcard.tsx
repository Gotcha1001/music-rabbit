"use client";

// components/leave/AdminResignationCard.tsx
// Admin card for reviewing resignation notices.
// Prominently flags shortNotice resignations so admin knows to withhold final-month pay.

import { useState } from "react";
import { Resignation, ResignationStatus } from "../../../convex/resignations";

const C = {
  card: "#151828",
  border: "#1E2438",
  red: "#FF5C6A",
  green: "#3DD68C",
  gold: "#F5C842",
  orange: "#FF8C42",
  text: "#E8EAF6",
  muted: "#6B7280",
  surface: "#1C2035",
};

const statusPalette: Record<
  ResignationStatus,
  { bg: string; border: string; color: string; label: string }
> = {
  pending: {
    bg: "rgba(245,200,66,0.12)",
    border: "rgba(245,200,66,0.35)",
    color: C.gold,
    label: "Pending",
  },
  acknowledged: {
    bg: "rgba(61,214,140,0.12)",
    border: "rgba(61,214,140,0.35)",
    color: C.green,
    label: "Acknowledged",
  },
  rejected: {
    bg: "rgba(255,92,106,0.12)",
    border: "rgba(255,92,106,0.35)",
    color: C.red,
    label: "Rejected",
  },
};

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
  const [note, setNote] = useState<string>("");
  const s = statusPalette[r.status];

  function handleDecide(status: "acknowledged" | "rejected"): void {
    onDecide(r._id, status, note.trim());
    setNote("");
  }

  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${r.shortNotice ? "rgba(255,92,106,0.5)" : C.border}`,
        borderRadius: "14px",
        padding: "22px 24px",
        marginBottom: "16px",
      }}
    >
      {/* Short-notice payroll warning — shown prominently at the top */}
      {r.shortNotice && (
        <div
          style={{
            background: "rgba(255,92,106,0.1)",
            border: "1px solid rgba(255,92,106,0.35)",
            borderRadius: "8px",
            padding: "10px 14px",
            marginBottom: "14px",
            fontSize: "12px",
            color: C.red,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "15px" }}>⚠️</span>
          Short notice — less than 1 month given.{" "}
          <strong>Final month pay should be withheld</strong> per policy.
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "12px",
        }}
      >
        <div>
          <div
            style={{ fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}
          >
            {r.teacherName}
            <span
              style={{
                background: "rgba(255,92,106,0.1)",
                color: C.red,
                fontSize: "11px",
                fontWeight: 600,
                borderRadius: "6px",
                padding: "2px 8px",
                marginLeft: "10px",
              }}
            >
              Resignation
            </span>
            {r.shortNotice && (
              <span
                style={{
                  background: "rgba(255,92,106,0.15)",
                  color: C.red,
                  fontSize: "11px",
                  fontWeight: 700,
                  borderRadius: "6px",
                  padding: "2px 8px",
                  marginLeft: "6px",
                  border: "1px solid rgba(255,92,106,0.4)",
                }}
              >
                SHORT NOTICE · NO PAY
              </span>
            )}
          </div>
          <div style={{ fontSize: "13px", color: C.muted }}>
            Last working day:{" "}
            <strong style={{ color: C.red }}>
              {fmtDate(r.lastWorkingDay)}
            </strong>
            {"  ·  "}
            Submitted{" "}
            {fmtDate(new Date(r.submittedAt).toISOString().split("T")[0])}
          </div>
        </div>

        {/* Status badge */}
        <span
          style={{
            display: "inline-block",
            padding: "3px 11px",
            borderRadius: "20px",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            background: s.bg,
            border: `1px solid ${s.border}`,
            color: s.color,
          }}
        >
          {s.label}
        </span>
      </div>

      {/* Reason */}
      <div
        style={{
          fontSize: "13px",
          color: C.text,
          opacity: 0.82,
          lineHeight: "1.6",
          background: C.surface,
          borderRadius: "8px",
          padding: "12px 14px",
          marginBottom: r.handoverNotes || r.status === "pending" ? "12px" : 0,
        }}
      >
        {r.reason}
      </div>

      {/* Handover notes */}
      {r.handoverNotes && (
        <div
          style={{
            fontSize: "12px",
            color: C.muted,
            background: C.surface,
            borderRadius: "8px",
            padding: "10px 14px",
            marginBottom: r.status === "pending" ? "12px" : 0,
            lineHeight: "1.5",
          }}
        >
          <span style={{ fontWeight: 600, color: C.text }}>
            Handover notes:{" "}
          </span>
          {r.handoverNotes}
        </div>
      )}

      {/* Admin note read-only after decision */}
      {r.adminNote && r.status !== "pending" && (
        <div
          style={{
            fontSize: "12px",
            color: C.muted,
            fontStyle: "italic",
            marginTop: "10px",
          }}
        >
          Your note: {r.adminNote}
        </div>
      )}

      {/* Action area — pending only */}
      {r.status === "pending" && (
        <>
          <div style={{ marginBottom: "12px" }}>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: C.muted,
                marginBottom: "7px",
              }}
            >
              Admin Note{" "}
              <span style={{ fontWeight: 400, textTransform: "none" }}>
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
              style={{
                width: "100%",
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: "9px",
                padding: "10px 14px",
                color: C.text,
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => handleDecide("acknowledged")}
              style={{
                background: `linear-gradient(135deg, ${C.green}, #2aad72)`,
                color: "#0D0F1A",
                border: "none",
                borderRadius: "9px",
                padding: "10px 22px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ✓ Acknowledge
            </button>
            <button
              onClick={() => handleDecide("rejected")}
              style={{
                background: "transparent",
                color: C.red,
                border: `1px solid ${C.red}`,
                borderRadius: "9px",
                padding: "10px 22px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ✕ Reject
            </button>
          </div>
        </>
      )}
    </div>
  );
}
