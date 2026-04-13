"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import type { LeaveStatus } from "../../../types/leave";
import { api } from "../../../../../convex/_generated/api";
import AdminLeaveCard from "@/app/components/Adminleavecard";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AdminResignationCard from "@/app/components/Adminresignationcard";

/* ─────────────────────────────────────────────────────────────
   !important overrides
   Light = default  |  Dark = .dark prefix
───────────────────────────────────────────────────────────── */
const ALEAVE_STYLES = `
  /* Page */
  .aleave-page                          { background: #ffffff !important; color: hsl(var(--foreground)) !important; }
  .dark .aleave-page                    { background: #0D0F1A !important; color: #E8EAF6 !important; }

  /* Heading */
  .aleave-title                         { color: hsl(var(--primary)) !important; }
  .dark .aleave-title                   { color: #F5C842 !important; }
  .aleave-subtitle                      { color: hsl(var(--muted-foreground)) !important; }
  .dark .aleave-subtitle                { color: #6B7280 !important; }

  /* Tab bar */
  .aleave-tablist                       { background: hsl(var(--muted)) !important; border-color: hsl(var(--border)) !important; }
  .dark .aleave-tablist                 { background: #151828 !important; border-color: #1E2438 !important; }
  .aleave-tablist [role="tab"]          { color: hsl(var(--muted-foreground)) !important; }
  .dark .aleave-tablist [role="tab"]    { color: #6B7280 !important; }

  /* Leave tab active */
  .aleave-tablist [role="tab"][data-state="active"].tab-leave {
    background: hsl(var(--primary)) !important; color: #ffffff !important; font-weight: 700 !important; box-shadow: none !important;
  }
  .dark .aleave-tablist [role="tab"][data-state="active"].tab-leave {
    background: #F5C842 !important; color: #0D0F1A !important;
  }
  /* Resignation tab active */
  .aleave-tablist [role="tab"][data-state="active"].tab-resign {
    background: #dc2626 !important; color: #ffffff !important; font-weight: 700 !important; box-shadow: none !important;
  }
  .dark .aleave-tablist [role="tab"][data-state="active"].tab-resign {
    background: #FF5C6A !important; color: #ffffff !important;
  }

  /* Stat tiles */
  .aleave-stat                          { background: hsl(var(--muted)) !important; border-color: hsl(var(--border)) !important; }
  .dark .aleave-stat                    { background: #151828 !important; border-color: #1E2438 !important; }
  .aleave-stat-label                    { color: hsl(var(--muted-foreground)) !important; }
  .dark .aleave-stat-label              { color: #6B7280 !important; }

  /* Leave filter buttons */
  .aleave-filter-btn                    { color: hsl(var(--muted-foreground)) !important; border-color: hsl(var(--border)) !important; background: transparent !important; }
  .aleave-filter-btn:hover              { background: hsl(var(--muted)) !important; }
  .aleave-filter-btn-active             { background: hsl(var(--primary)) !important; color: #ffffff !important; border-color: hsl(var(--primary)) !important; }
  .dark .aleave-filter-btn             { color: #6B7280 !important; border-color: #1E2438 !important; }
  .dark .aleave-filter-btn-active      { background: #F5C842 !important; color: #0D0F1A !important; border-color: #F5C842 !important; }

  /* Resignation filter buttons */
  .aleave-resign-btn                    { color: hsl(var(--muted-foreground)) !important; border-color: hsl(var(--border)) !important; background: transparent !important; }
  .aleave-resign-btn:hover              { background: hsl(var(--muted)) !important; }
  .aleave-resign-btn-active             { background: #dc2626 !important; color: #ffffff !important; border-color: #dc2626 !important; }
  .dark .aleave-resign-btn             { color: #6B7280 !important; border-color: #1E2438 !important; }
  .dark .aleave-resign-btn-active      { background: #FF5C6A !important; color: #ffffff !important; border-color: #FF5C6A !important; }

  /* Empty state */
  .aleave-empty                         { color: hsl(var(--muted-foreground)) !important; }
  .dark .aleave-empty                   { color: #6B7280 !important; }
`;

type FilterOption = LeaveStatus | "all";
type ResignationFilterOption = "pending" | "acknowledged" | "rejected" | "all";

export default function AdminLeaveApplicationsPage() {
  const [filter, setFilter] = useState<FilterOption>("pending");
  const leaves =
    useQuery(
      api.leave.getAllLeave,
      filter === "all" ? {} : { status: filter },
    ) ?? [];
  const allLeaves = useQuery(api.leave.getAllLeave, {}) ?? [];
  const decideLeave = useMutation(api.leave.decideLeave);

  const leaveCounts = {
    pending: allLeaves.filter((l) => l.status === "pending").length,
    approved: allLeaves.filter((l) => l.status === "approved").length,
    rejected: allLeaves.filter((l) => l.status === "rejected").length,
  } as Record<LeaveStatus, number>;

  async function handleDecideLeave(
    id: string,
    status: LeaveStatus,
    adminNote: string,
  ) {
    await decideLeave({
      leaveId: id as Id<"leaveApplications">,
      status: status as "approved" | "rejected",
      adminNote: adminNote || undefined,
    });
  }

  const [resignFilter, setResignFilter] =
    useState<ResignationFilterOption>("pending");
  const resignations =
    useQuery(
      api.resignations.getAllResignations,
      resignFilter === "all"
        ? {}
        : { status: resignFilter as "pending" | "acknowledged" | "rejected" },
    ) ?? [];
  const allResignations =
    useQuery(api.resignations.getAllResignations, {}) ?? [];
  const decideResignation = useMutation(api.resignations.decideResignation);

  const resignCounts = {
    pending: allResignations.filter((r) => r.status === "pending").length,
    acknowledged: allResignations.filter((r) => r.status === "acknowledged")
      .length,
    rejected: allResignations.filter((r) => r.status === "rejected").length,
  };

  async function handleDecideResignation(
    id: string,
    status: "acknowledged" | "rejected",
    adminNote: string,
  ) {
    await decideResignation({
      resignationId: id as Id<"resignations">,
      status,
      adminNote: adminNote || undefined,
    });
  }

  const leaveFilterBtns: { val: FilterOption; label: string }[] = [
    { val: "pending", label: "Pending" },
    { val: "approved", label: "Approved" },
    { val: "rejected", label: "Rejected" },
    { val: "all", label: "All" },
  ];
  const resignFilterBtns: { val: ResignationFilterOption; label: string }[] = [
    { val: "pending", label: "Pending" },
    { val: "acknowledged", label: "Acknowledged" },
    { val: "rejected", label: "Rejected" },
    { val: "all", label: "All" },
  ];

  return (
    <div className="aleave-page min-h-screen">
      <style>{ALEAVE_STYLES}</style>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-9">
        {/* Heading */}
        <div className="mb-6 sm:mb-7">
          <h1 className="aleave-title text-2xl sm:text-[26px] font-extrabold tracking-tight font-serif">
            Leave &amp; Resignations
          </h1>
          <p className="aleave-subtitle text-xs sm:text-[13px] mt-1">
            Review, approve or reject teacher requests
          </p>
        </div>

        <Tabs defaultValue="leave" className="w-full">
          <TabsList className="aleave-tablist mb-5 sm:mb-6 w-full border rounded-[10px] p-1 h-auto">
            <TabsTrigger
              value="leave"
              className="tab-leave flex-1 rounded-[7px] transition-all text-sm py-2"
            >
              🏖 Leave Applications
              {leaveCounts.pending > 0 && (
                <span className="ml-1.5 bg-yellow-400 dark:bg-[#F5C842] text-black rounded-full px-2 py-0.5 text-[10px] font-black">
                  {leaveCounts.pending}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="resignation"
              className="tab-resign flex-1 rounded-[7px] transition-all text-sm py-2"
            >
              📝 Resignations
              {resignCounts.pending > 0 && (
                <span className="ml-1.5 bg-red-600 dark:bg-[#FF5C6A] text-white rounded-full px-2 py-0.5 text-[10px] font-black">
                  {resignCounts.pending}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── LEAVE TAB ── */}
          <TabsContent value="leave">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5 sm:mb-6">
              {[
                {
                  label: "Pending",
                  count: leaveCounts.pending,
                  color: "text-yellow-500 dark:text-[#F5C842]",
                },
                {
                  label: "Approved",
                  count: leaveCounts.approved,
                  color: "text-green-500 dark:text-[#3DD68C]",
                },
                {
                  label: "Rejected",
                  count: leaveCounts.rejected,
                  color: "text-red-500 dark:text-[#FF5C6A]",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="aleave-stat rounded-xl border p-3 sm:p-5"
                >
                  <div className={`text-2xl sm:text-3xl font-black ${s.color}`}>
                    {s.count}
                  </div>
                  <div className="aleave-stat-label text-xs mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Filter buttons */}
            <div className="flex gap-2 mb-5 sm:mb-6 flex-wrap">
              {leaveFilterBtns.map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => setFilter(val)}
                  className={`${filter === val ? "aleave-filter-btn-active" : "aleave-filter-btn"} px-3 sm:px-4 py-1.5 rounded-lg border text-xs font-bold tracking-wide transition-all`}
                >
                  {label}
                  {val === "pending" && leaveCounts.pending > 0
                    ? ` (${leaveCounts.pending})`
                    : ""}
                </button>
              ))}
            </div>

            {leaves.length === 0 ? (
              <div className="aleave-empty text-center py-12 sm:py-16 text-sm">
                No {filter === "all" ? "" : filter} applications.
              </div>
            ) : (
              leaves.map((l) => (
                <AdminLeaveCard
                  key={l._id}
                  leave={l}
                  onDecide={handleDecideLeave}
                />
              ))
            )}
          </TabsContent>

          {/* ── RESIGNATION TAB ── */}
          <TabsContent value="resignation">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5 sm:mb-6">
              {[
                {
                  label: "Pending",
                  count: resignCounts.pending,
                  color: "text-yellow-500 dark:text-[#F5C842]",
                },
                {
                  label: "Acknowledged",
                  count: resignCounts.acknowledged,
                  color: "text-green-500 dark:text-[#3DD68C]",
                },
                {
                  label: "Rejected",
                  count: resignCounts.rejected,
                  color: "text-red-500 dark:text-[#FF5C6A]",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="aleave-stat rounded-xl border p-3 sm:p-5"
                >
                  <div className={`text-2xl sm:text-3xl font-black ${s.color}`}>
                    {s.count}
                  </div>
                  <div className="aleave-stat-label text-xs mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Filter buttons */}
            <div className="flex gap-2 mb-5 sm:mb-6 flex-wrap">
              {resignFilterBtns.map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => setResignFilter(val)}
                  className={`${resignFilter === val ? "aleave-resign-btn-active" : "aleave-resign-btn"} px-3 sm:px-4 py-1.5 rounded-lg border text-xs font-bold tracking-wide transition-all`}
                >
                  {label}
                  {val === "pending" && resignCounts.pending > 0
                    ? ` (${resignCounts.pending})`
                    : ""}
                </button>
              ))}
            </div>

            {resignations.length === 0 ? (
              <div className="aleave-empty text-center py-12 sm:py-16 text-sm">
                No {resignFilter === "all" ? "" : resignFilter} resignations.
              </div>
            ) : (
              resignations.map((r) => (
                <AdminResignationCard
                  key={r._id}
                  resignation={r}
                  onDecide={handleDecideResignation}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
