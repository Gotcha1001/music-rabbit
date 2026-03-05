"use client";

// components/leave/AdminLeaveCard.tsx

import { useState } from "react";
import type { LeaveApplication, LeaveStatus } from "../types/leave";
import LeaveStatusBadge from "../components/LeaveStatusBadge";
import { fmtDate } from "@/lib/leaveUtils";

const C = {
  card: "#151828",
  border: "#1E2438",
  teal: "#2ECFC4",
  green: "#3DD68C",
  red: "#FF5C6A",
  text: "#E8EAF6",
  muted: "#6B7280",
  surface: "#1C2035",
};

interface AdminLeaveCardProps {
  leave: LeaveApplication;
  onDecide: (id: string, status: LeaveStatus, adminNote: string) => void;
}

export default function AdminLeaveCard({
  leave: l,
  onDecide,
}: AdminLeaveCardProps) {
  const [note, setNote] = useState<string>("");

  function handleDecide(status: LeaveStatus): void {
    onDecide(l._id, status, note.trim());
    setNote("");
  }

  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: "14px",
        padding: "22px 24px",
        marginBottom: "16px",
      }}
    >
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
            {l.teacherName}
            <span
              style={{
                background: "rgba(46,207,196,0.1)",
                color: C.teal,
                fontSize: "11px",
                fontWeight: 600,
                borderRadius: "6px",
                padding: "2px 8px",
                marginLeft: "10px",
              }}
            >
              {l.type}
            </span>
          </div>

          <div style={{ fontSize: "13px", color: C.muted }}>
            {fmtDate(l.from)} – {fmtDate(l.to)} ·{" "}
            <strong style={{ color: C.text }}>
              {l.days} day{l.days !== 1 ? "s" : ""}
            </strong>
            {l.substitute && (
              <span>
                {" "}
                · Suggested sub:{" "}
                <span style={{ color: C.teal }}>{l.substitute}</span>
              </span>
            )}
          </div>
        </div>

        <LeaveStatusBadge status={l.status} />
      </div>

      {/* Reason block */}
      <div
        style={{
          fontSize: "13px",
          color: C.text,
          opacity: 0.82,
          lineHeight: "1.6",
          background: C.surface,
          borderRadius: "8px",
          padding: "12px 14px",
          marginBottom: l.status === "pending" ? "16px" : 0,
        }}
      >
        {l.reason}
      </div>

      {/* Admin note read-only after decision */}
      {l.adminNote && l.status !== "pending" && (
        <div
          style={{
            fontSize: "12px",
            color: C.muted,
            fontStyle: "italic",
            marginTop: "10px",
          }}
        >
          Your note: {l.adminNote}
        </div>
      )}

      {/* Action area — pending only */}
      {l.status === "pending" && (
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
              placeholder="e.g. Approved — sub assigned, or reason for rejection…"
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
              onClick={() => handleDecide("approved")}
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
              ✓ Approve
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
