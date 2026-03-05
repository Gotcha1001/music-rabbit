"use client";

// app/dashboard/admin/leave-applications/page.tsx

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";

import type { LeaveStatus } from "../../../types/leave";
import { api } from "../../../../../convex/_generated/api";
import AdminLeaveCard from "@/app/components/Adminleavecard";
import { Id } from "../../../../../convex/_generated/dataModel";

const C = {
  bg: "#0D0F1A",
  card: "#151828",
  border: "#1E2438",
  gold: "#F5C842",
  green: "#3DD68C",
  red: "#FF5C6A",
  text: "#E8EAF6",
  muted: "#6B7280",
};

type FilterOption = LeaveStatus | "all";

export default function AdminLeaveApplicationsPage() {
  const [filter, setFilter] = useState<FilterOption>("pending");

  // Pass undefined for "all" so the query returns everything
  const leaves =
    useQuery(
      api.leave.getAllLeave,
      filter === "all" ? {} : { status: filter },
    ) ?? [];

  // Always fetch all so stats are accurate regardless of active filter
  const allLeaves = useQuery(api.leave.getAllLeave, {}) ?? [];
  const decideLeave = useMutation(api.leave.decideLeave);

  const counts: Record<LeaveStatus, number> = {
    pending: allLeaves.filter((l) => l.status === "pending").length,
    approved: allLeaves.filter((l) => l.status === "approved").length,
    rejected: allLeaves.filter((l) => l.status === "rejected").length,
  };

  async function handleDecide(
    id: string,
    status: LeaveStatus,
    adminNote: string,
  ): Promise<void> {
    await decideLeave({
      leaveId: id as Id<"leaveApplications">,
      status: status as "approved" | "rejected",
      adminNote: adminNote || undefined,
    });
  }

  return (
    <div
      style={{
        background: C.bg,
        minHeight: "100vh",
        color: C.text,
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{ maxWidth: "760px", margin: "0 auto", padding: "36px 24px" }}
      >
        {/* Heading */}
        <div style={{ marginBottom: "30px" }}>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: 800,
              color: C.gold,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Leave Applications
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: C.muted,
              marginTop: "4px",
              marginBottom: 0,
            }}
          >
            Review, approve or reject teacher leave requests
          </p>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "12px",
            marginBottom: "26px",
          }}
        >
          {(
            [
              { label: "Pending", count: counts.pending, color: C.gold },
              { label: "Approved", count: counts.approved, color: C.green },
              { label: "Rejected", count: counts.rejected, color: C.red },
            ] as const
          ).map((s) => (
            <div
              key={s.label}
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: "12px",
                padding: "18px 20px",
              }}
            >
              <div
                style={{ fontSize: "28px", fontWeight: 800, color: s.color }}
              >
                {s.count}
              </div>
              <div
                style={{ fontSize: "12px", color: C.muted, marginTop: "2px" }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Filter buttons */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "22px",
            flexWrap: "wrap",
          }}
        >
          {[
            { val: "pending" as FilterOption, label: "Pending" },
            { val: "approved" as FilterOption, label: "Approved" },
            { val: "rejected" as FilterOption, label: "Rejected" },
            { val: "all" as FilterOption, label: "All" },
          ].map(({ val, label }) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              style={{
                background: filter === val ? C.gold : "transparent",
                color: filter === val ? "#0D0F1A" : C.muted,
                border: `1px solid ${filter === val ? C.gold : C.border}`,
                borderRadius: "8px",
                padding: "7px 16px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: "0.04em",
                transition: "all 0.15s",
              }}
            >
              {label}
              {val === "pending" && counts.pending > 0
                ? ` (${counts.pending})`
                : ""}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {leaves.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "64px 24px",
              color: C.muted,
              fontSize: "14px",
            }}
          >
            No {filter === "all" ? "" : filter} applications.
          </div>
        ) : (
          leaves.map((l) => (
            <AdminLeaveCard key={l._id} leave={l} onDecide={handleDecide} />
          ))
        )}
      </div>
    </div>
  );
}
