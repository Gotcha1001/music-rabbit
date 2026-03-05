"use client";

// components/leave/TeacherLeaveList.tsx

import type { LeaveApplication } from "../../app/types/leave";
import LeaveStatusBadge from "../components/LeaveStatusBadge";
import { fmtDate } from "@/lib/leaveUtils";

const C = {
  card: "#151828",
  border: "#1E2438",
  teal: "#2ECFC4",
  text: "#E8EAF6",
  muted: "#6B7280",
};

interface TeacherLeaveListProps {
  leaves: LeaveApplication[];
}

export default function TeacherLeaveList({ leaves }: TeacherLeaveListProps) {
  if (leaves.length === 0) return null;

  return (
    <div style={{ marginTop: "36px" }}>
      <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>
        My Applications
      </div>

      {leaves.map((l) => (
        <div
          key={l._id}
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: "12px",
            padding: "18px 22px",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "14px",
                  marginBottom: "4px",
                }}
              >
                {l.type}
                <span
                  style={{
                    color: C.muted,
                    fontWeight: 400,
                    fontSize: "13px",
                    marginLeft: "10px",
                  }}
                >
                  {fmtDate(l.from)} – {fmtDate(l.to)} · {l.days} day
                  {l.days !== 1 ? "s" : ""}
                </span>
              </div>

              <div
                style={{
                  fontSize: "13px",
                  color: C.text,
                  opacity: 0.75,
                  lineHeight: "1.5",
                }}
              >
                {l.reason}
              </div>

              {l.substitute && (
                <div
                  style={{ fontSize: "12px", color: C.teal, marginTop: "4px" }}
                >
                  Suggested sub: {l.substitute}
                </div>
              )}

              {l.adminNote && (
                <div
                  style={{
                    fontSize: "12px",
                    color: C.muted,
                    marginTop: "5px",
                    fontStyle: "italic",
                  }}
                >
                  Admin: {l.adminNote}
                </div>
              )}
            </div>

            <LeaveStatusBadge status={l.status} />
          </div>
        </div>
      ))}
    </div>
  );
}
