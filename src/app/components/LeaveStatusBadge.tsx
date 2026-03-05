"use client";

// components/leave/LeaveStatusBadge.tsx

import type { LeaveStatus } from "../../app/types/leave";

interface LeaveStatusBadgeProps {
  status: LeaveStatus;
}

const palette: Record<
  LeaveStatus,
  { bg: string; border: string; color: string }
> = {
  pending: {
    bg: "rgba(245,200,66,0.12)",
    border: "rgba(245,200,66,0.35)",
    color: "#F5C842",
  },
  approved: {
    bg: "rgba(61,214,140,0.12)",
    border: "rgba(61,214,140,0.35)",
    color: "#3DD68C",
  },
  rejected: {
    bg: "rgba(255,92,106,0.12)",
    border: "rgba(255,92,106,0.35)",
    color: "#FF5C6A",
  },
};

export default function LeaveStatusBadge({ status }: LeaveStatusBadgeProps) {
  const s = palette[status];
  return (
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
      {status}
    </span>
  );
}
