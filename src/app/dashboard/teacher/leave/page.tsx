"use client";

import { useQuery, useMutation } from "convex/react";
import type { LeaveFormValues } from "../../../types/leave";
import { api } from "../../../../../convex/_generated/api";
import LeaveApplicationForm from "@/app/components/Leaveapplicationform.tsx";
import TeacherLeaveList from "@/app/components/TeacherLeaveList";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ResignationFormValues } from "../../../../../convex/resignations";
import ResignationForm from "@/app/components/Resignationform";
import TeacherResignationList from "@/app/components/TeacherResignationList";

/* ─────────────────────────────────────────────────────────────
   !important overrides
   Light = default  |  Dark = .dark prefix
───────────────────────────────────────────────────────────── */
const LEAVE_STYLES = `
  /* Page */
  .leave-page                         { background: #ffffff !important; color: hsl(var(--foreground)) !important; }
  .dark .leave-page                   { background: #0D0F1A !important; color: #E8EAF6 !important; }

  /* Heading */
  .leave-title                        { color: hsl(var(--primary)) !important; }
  .dark .leave-title                  { color: #F5C842 !important; }

  .leave-subtitle                     { color: hsl(var(--muted-foreground)) !important; }
  .dark .leave-subtitle               { color: #6B7280 !important; }

  /* Tab bar background */
  .leave-tablist                      { background: hsl(var(--muted)) !important; border-color: hsl(var(--border)) !important; }
  .dark .leave-tablist                { background: #151828 !important; border-color: #1E2438 !important; }

  /* Inactive tab text */
  .leave-tablist [role="tab"]         { color: hsl(var(--muted-foreground)) !important; }
  .dark .leave-tablist [role="tab"]   { color: #6B7280 !important; }

  /* Active leave tab */
  .leave-tablist [role="tab"][data-state="active"].tab-leave {
    background: hsl(var(--primary)) !important;
    color: #ffffff !important;
    font-weight: 700 !important;
    box-shadow: none !important;
  }
  .dark .leave-tablist [role="tab"][data-state="active"].tab-leave {
    background: #F5C842 !important;
    color: #0D0F1A !important;
  }

  /* Active resignation tab */
  .leave-tablist [role="tab"][data-state="active"].tab-resign {
    background: #dc2626 !important;
    color: #ffffff !important;
    font-weight: 700 !important;
    box-shadow: none !important;
  }
  .dark .leave-tablist [role="tab"][data-state="active"].tab-resign {
    background: #FF5C6A !important;
    color: #ffffff !important;
  }
`;

export default function TeacherLeavePage() {
  const leaves = useQuery(api.leave.getMyLeave) ?? [];
  const daysInfo = useQuery(api.leave.getMyUsedDays);
  const submitLeave = useMutation(api.leave.submitLeave);
  const usedDays = daysInfo?.used ?? 0;

  const resignations = useQuery(api.resignations.getMyResignations) ?? [];
  const submitResignation = useMutation(api.resignations.submitResignation);

  async function handleLeaveSubmit(
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

  async function handleResignationSubmit(
    values: ResignationFormValues,
  ): Promise<void> {
    await submitResignation({
      lastWorkingDay: values.lastWorkingDay,
      reason: values.reason,
      handoverNotes: values.handoverNotes || undefined,
    });
  }

  return (
    <div className="leave-page min-h-screen">
      <style>{LEAVE_STYLES}</style>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-9">
        {/* Heading */}
        <div className="mb-6 sm:mb-7">
          <h1 className="leave-title text-2xl sm:text-[26px] font-extrabold tracking-tight m-0 font-serif">
            Leave &amp; Resignation
          </h1>
          <p className="leave-subtitle text-xs sm:text-[13px] mt-1 mb-0">
            2025/26 Academic Year
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="leave" className="w-full">
          <TabsList className="leave-tablist mb-5 sm:mb-6 w-full border rounded-[10px] p-1 h-auto">
            <TabsTrigger
              value="leave"
              className="tab-leave flex-1 rounded-[7px] transition-all text-sm sm:text-base py-2"
            >
              🏖 Apply for Leave
            </TabsTrigger>
            <TabsTrigger
              value="resignation"
              className="tab-resign flex-1 rounded-[7px] transition-all text-sm sm:text-base py-2"
            >
              📝 Submit Resignation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leave">
            <LeaveApplicationForm
              usedDays={usedDays}
              onSubmit={handleLeaveSubmit}
            />
            <TeacherLeaveList leaves={leaves} />
          </TabsContent>

          <TabsContent value="resignation">
            <ResignationForm onSubmit={handleResignationSubmit} />
            <TeacherResignationList resignations={resignations} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
