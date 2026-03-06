// "use client";

// // app/dashboard/teacher/leave/page.tsx

// import { useQuery, useMutation } from "convex/react";
// import type { LeaveFormValues } from "../../../types/leave";
// import { api } from "../../../../../convex/_generated/api";
// import LeaveApplicationForm from "@/app/components/Leaveapplicationform.tsx";
// import TeacherLeaveList from "@/app/components/TeacherLeaveList";

// const C = {
//   bg: "#0D0F1A",
//   gold: "#F5C842",
//   muted: "#6B7280",
// };

// export default function TeacherLeavePage() {
//   const leaves = useQuery(api.leave.getMyLeave) ?? [];
//   const daysInfo = useQuery(api.leave.getMyUsedDays);
//   const submitLeave = useMutation(api.leave.submitLeave);

//   const usedDays = daysInfo?.used ?? 0;

//   async function handleSubmit(
//     values: LeaveFormValues,
//     days: number,
//   ): Promise<void> {
//     if (!values.type) return;
//     await submitLeave({
//       type: values.type,
//       from: values.from,
//       to: values.to,
//       days,
//       reason: values.reason,
//       substitute: values.substitute || undefined,
//     });
//   }

//   return (
//     <div
//       style={{
//         background: C.bg,
//         minHeight: "100vh",
//         color: "#E8EAF6",
//         fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
//       }}
//     >
//       <div
//         style={{ maxWidth: "760px", margin: "0 auto", padding: "36px 24px" }}
//       >
//         <div style={{ marginBottom: "30px" }}>
//           <h1
//             style={{
//               fontSize: "26px",
//               fontWeight: 800,
//               color: C.gold,
//               letterSpacing: "-0.02em",
//               margin: 0,
//             }}
//           >
//             Apply for Leave
//           </h1>
//           <p
//             style={{
//               fontSize: "13px",
//               color: C.muted,
//               marginTop: "4px",
//               marginBottom: 0,
//             }}
//           >
//             2025/26 Academic Year
//           </p>
//         </div>

//         <LeaveApplicationForm usedDays={usedDays} onSubmit={handleSubmit} />

//         <TeacherLeaveList leaves={leaves} />
//       </div>
//     </div>
//   );
// }
"use client";

// app/dashboard/teacher/leave/page.tsx
// ─── UPDATED: Added shadcn Tabs to toggle between Leave Application and Resignation ───

import { useQuery, useMutation } from "convex/react";
import type { LeaveFormValues } from "../../../types/leave";

import { api } from "../../../../../convex/_generated/api";
import LeaveApplicationForm from "@/app/components/Leaveapplicationform.tsx";
import TeacherLeaveList from "@/app/components/TeacherLeaveList";

// shadcn Tabs
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ResignationFormValues } from "../../../../../convex/resignations";
import ResignationForm from "@/app/components/Resignationform";
import TeacherResignationList from "@/app/components/TeacherResignationList";

const C = {
  bg: "#0D0F1A",
  gold: "#F5C842",
  red: "#FF5C6A",
  muted: "#6B7280",
};

export default function TeacherLeavePage() {
  // ── Leave data ──────────────────────────────────────────────────────────────
  const leaves = useQuery(api.leave.getMyLeave) ?? [];
  const daysInfo = useQuery(api.leave.getMyUsedDays);
  const submitLeave = useMutation(api.leave.submitLeave);
  const usedDays = daysInfo?.used ?? 0;

  // ── Resignation data ────────────────────────────────────────────────────────
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
        {/* Page heading */}
        <div style={{ marginBottom: "28px" }}>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: 800,
              color: C.gold,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Leave & Resignation
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

        {/* ── shadcn Tabs toggle ───────────────────────────────────────────── */}
        <Tabs defaultValue="leave" className="w-full">
          <TabsList
            className="mb-6 w-full"
            style={{
              background: "#151828",
              border: "1px solid #1E2438",
              borderRadius: "10px",
              padding: "4px",
            }}
          >
            <TabsTrigger
              value="leave"
              className="flex-1 data-[state=active]:bg-[#F5C842] data-[state=active]:text-[#0D0F1A] data-[state=active]:font-bold text-[#6B7280] rounded-[7px] transition-all"
            >
              🏖 Apply for Leave
            </TabsTrigger>
            <TabsTrigger
              value="resignation"
              className="flex-1 data-[state=active]:bg-[#FF5C6A] data-[state=active]:text-white data-[state=active]:font-bold text-[#6B7280] rounded-[7px] transition-all"
            >
              📝 Submit Resignation
            </TabsTrigger>
          </TabsList>

          {/* Leave tab */}
          <TabsContent value="leave">
            <LeaveApplicationForm
              usedDays={usedDays}
              onSubmit={handleLeaveSubmit}
            />
            <TeacherLeaveList leaves={leaves} />
          </TabsContent>

          {/* Resignation tab */}
          <TabsContent value="resignation">
            <ResignationForm onSubmit={handleResignationSubmit} />
            <TeacherResignationList resignations={resignations} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
