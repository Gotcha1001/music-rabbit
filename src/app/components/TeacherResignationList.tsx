"use client";

// components/leave/TeacherResignationList.tsx

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Resignation, ResignationStatus } from "../../../convex/resignations";

const C = {
  card: "#151828",
  border: "#1E2438",
  red: "#FF5C6A",
  gold: "#F5C842",
  green: "#3DD68C",
  text: "#E8EAF6",
  muted: "#6B7280",
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

interface TeacherResignationListProps {
  resignations: Resignation[];
}

export default function TeacherResignationList({
  resignations,
}: TeacherResignationListProps) {
  const withdrawResignation = useMutation(api.resignations.withdrawResignation);

  if (resignations.length === 0) return null;

  async function handleWithdraw(id: string) {
    if (!confirm("Are you sure you want to withdraw this resignation?")) return;
    await withdrawResignation({ resignationId: id as Resignation["_id"] });
  }

  return (
    <div style={{ marginTop: "36px" }}>
      <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>
        My Resignation Notices
      </div>

      {resignations.map((r) => {
        const s = statusPalette[r.status];
        return (
          <div
            key={r._id}
            style={{
              background: C.card,
              border: `1px solid ${r.shortNotice ? "rgba(255,92,106,0.4)" : C.border}`,
              borderRadius: "12px",
              padding: "18px 22px",
              marginBottom: "12px",
            }}
          >
            {/* Short-notice reminder for the teacher */}
            {r.shortNotice && (
              <div
                style={{
                  background: "rgba(255,92,106,0.08)",
                  border: "1px solid rgba(255,92,106,0.25)",
                  borderRadius: "7px",
                  padding: "8px 12px",
                  marginBottom: "12px",
                  fontSize: "12px",
                  color: C.red,
                }}
              >
                ⚠ Short notice submitted —{" "}
                <strong>final month pay will be withheld</strong> per policy.
              </div>
            )}

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
                  Last Working Day:{" "}
                  <span style={{ color: C.red }}>
                    {fmtDate(r.lastWorkingDay)}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: C.text,
                    opacity: 0.75,
                    lineHeight: "1.5",
                    marginBottom: "4px",
                  }}
                >
                  {r.reason}
                </div>
                {r.handoverNotes && (
                  <div
                    style={{
                      fontSize: "12px",
                      color: C.muted,
                      marginTop: "4px",
                    }}
                  >
                    Handover: {r.handoverNotes}
                  </div>
                )}
                {r.adminNote && (
                  <div
                    style={{
                      fontSize: "12px",
                      color: C.muted,
                      marginTop: "5px",
                      fontStyle: "italic",
                    }}
                  >
                    Admin: {r.adminNote}
                  </div>
                )}
                <div
                  style={{ fontSize: "11px", color: C.muted, marginTop: "6px" }}
                >
                  Submitted{" "}
                  {fmtDate(new Date(r.submittedAt).toISOString().split("T")[0])}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: "8px",
                }}
              >
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

                {r.status === "pending" && (
                  <button
                    onClick={() => handleWithdraw(r._id)}
                    style={{
                      background: "transparent",
                      color: C.muted,
                      border: `1px solid ${C.border}`,
                      borderRadius: "7px",
                      padding: "5px 12px",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Withdraw
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
