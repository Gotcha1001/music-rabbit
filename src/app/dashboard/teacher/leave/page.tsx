"use client";

// app/dashboard/teacher/leave/page.tsx

import { useQuery, useMutation } from "convex/react";
import type { LeaveFormValues } from "../../../types/leave";
import { api } from "../../../../../convex/_generated/api";
import LeaveApplicationForm from "@/app/components/Leaveapplicationform.tsx";
import TeacherLeaveList from "@/app/components/TeacherLeaveList";

const C = {
  bg: "#0D0F1A",
  gold: "#F5C842",
  muted: "#6B7280",
};

export default function TeacherLeavePage() {
  const leaves = useQuery(api.leave.getMyLeave) ?? [];
  const daysInfo = useQuery(api.leave.getMyUsedDays);
  const submitLeave = useMutation(api.leave.submitLeave);

  const usedDays = daysInfo?.used ?? 0;

  async function handleSubmit(
    values: LeaveFormValues,
    days: number,
  ): Promise<void> {
    if (!values.type) return;
    await submitLeave({
      type: values.type,
      from: values.from,
      to: values.to,
      days,
      reason: values.reason,
      substitute: values.substitute || undefined,
    });
  }

  return (
    <div
      style={{
        background: C.bg,
        minHeight: "100vh",
        color: "#E8EAF6",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{ maxWidth: "760px", margin: "0 auto", padding: "36px 24px" }}
      >
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
            Apply for Leave
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: C.muted,
              marginTop: "4px",
              marginBottom: 0,
            }}
          >
            2025/26 Academic Year
          </p>
        </div>

        <LeaveApplicationForm usedDays={usedDays} onSubmit={handleSubmit} />

        <TeacherLeaveList leaves={leaves} />
      </div>
    </div>
  );
}
