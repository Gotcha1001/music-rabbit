"use client";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { UserDetailContext } from "@/context/UserDetailContext";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  BookOpen,
  Calendar,
  DollarSign,
  MessageSquare,
  Music,
  User,
  Users,
  Video,
  Heart,
  Music2,
  ClipboardList,
  Hotel,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useContext, useEffect } from "react";

/* ─────────────────────────────────────────────────────────────
   !important overrides
   Light = default  |  Dark = .dark prefix
───────────────────────────────────────────────────────────── */
const TSB_STYLES = `
  /* Shell */
  .tsb-shell,
  .tsb-shell [data-sidebar="sidebar"]         { background: #ffffff !important; border-right-color: hsl(var(--border)) !important; }
  .dark .tsb-shell,
  .dark .tsb-shell [data-sidebar="sidebar"]   { background: #0a0014 !important; border-right-color: rgba(109,40,217,0.3) !important; }

  /* Header */
  .tsb-header                                 { background: #ffffff !important; border-bottom-color: hsl(var(--border)) !important; }
  .dark .tsb-header                           { background: linear-gradient(to bottom right, hsl(270 90% 5%), #000000) !important; border-bottom-color: rgba(109,40,217,0.5) !important; }

  /* Logo text */
  .tsb-logo                                   { color: hsl(var(--primary)) !important; }
  .dark .tsb-logo                             { color: #c4b5fd !important; }

  /* Logo icon */
  .tsb-logo-icon                              { color: hsl(var(--primary)) !important; }
  .dark .tsb-logo-icon                        { color: #a78bfa !important; }

  /* Content area */
  .tsb-content,
  .tsb-content [data-sidebar="content"]       { background: #ffffff !important; overflow-y: auto !important; -webkit-overflow-scrolling: touch !important; }
  .dark .tsb-content,
  .dark .tsb-content [data-sidebar="content"] { background: linear-gradient(to bottom right, hsl(270 90% 5%), #000000) !important; }

  /* Group label */
  .tsb-group-label                            { color: hsl(var(--muted-foreground)) !important; }
  .dark .tsb-group-label                      { color: #c4b5fd !important; }

  /* Nav items */
  .tsb-item                                   { color: hsl(var(--foreground)) !important; }
  .tsb-item:hover                             { background: hsl(var(--muted)) !important; color: hsl(var(--foreground)) !important; }
  .dark .tsb-item                             { color: #c4b5fd !important; }
  .dark .tsb-item:hover                       { background: rgba(76,29,149,0.5) !important; color: #ffffff !important; }

  /* Active item */
  .tsb-item[data-active="true"]               { background: hsl(var(--primary)) !important; color: #ffffff !important; box-shadow: 0 4px 12px hsl(var(--primary)/0.3) !important; }
  .dark .tsb-item[data-active="true"]         { background: rgba(109,40,217,0.5) !important; color: #ffffff !important; box-shadow: 0 4px 12px rgba(139,92,246,0.3) !important; }

  /* Footer */
  .tsb-footer                                 { background: #ffffff !important; border-top-color: hsl(var(--border)) !important; }
  .dark .tsb-footer                           { background: linear-gradient(to bottom right, hsl(270 90% 5%), #000000) !important; border-top-color: rgba(109,40,217,0.5) !important; }

  /* Earnings row */
  .tsb-earnings-icon                          { color: hsl(var(--primary)) !important; }
  .tsb-earnings-text                          { color: hsl(var(--foreground)) !important; }
  .tsb-earnings-value                         { color: hsl(var(--primary)) !important; }
  .dark .tsb-earnings-icon                    { color: #c4b5fd !important; }
  .dark .tsb-earnings-text                    { color: #c4b5fd !important; }
  .dark .tsb-earnings-value                   { color: #ede9fe !important; }

  /* View details button */
  .tsb-details-btn                            { border-color: hsl(var(--primary)/0.4) !important; color: hsl(var(--primary)) !important; background: transparent !important; }
  .tsb-details-btn:hover                      { background: hsl(var(--primary)/0.08) !important; }
  .dark .tsb-details-btn                      { border-color: rgba(124,58,237,0.6) !important; color: #c4b5fd !important; }
  .dark .tsb-details-btn:hover                { background: rgba(76,29,149,0.5) !important; }
`;

const MenuOptions = [
  { title: "Schedule", url: "/dashboard/teacher/schedule", icon: Calendar },
  { title: "Students", url: "/dashboard/teacher/students", icon: Users },
  { title: "Books", url: "/dashboard/teacher/books", icon: BookOpen },
  { title: "Recordings", url: "/dashboard/teacher/recordings", icon: Video },
  { title: "Payments", url: "/dashboard/teacher/payments", icon: DollarSign },
  {
    title: "Messages",
    url: "/dashboard/teacher/messages",
    icon: MessageSquare,
  },
  { title: "Thanks Messages", url: "/dashboard/thanks-messages", icon: Heart },
  { title: "Profile", url: "/dashboard/teacher/profile", icon: User },
  {
    title: "Daily Music Piece",
    url: "/dashboard/teacher/daily-piece",
    icon: Music2,
  },
  {
    title: "Evaluations",
    url: "/dashboard/teacher/evaluations",
    icon: ClipboardList,
  },
  { title: "Leave", url: "/dashboard/teacher/leave", icon: Hotel },
];

function TeacherSidebar() {
  const { open } = useSidebar();
  const path = usePathname();
  const router = useRouter();

  const context = useContext(UserDetailContext);
  if (!context)
    throw new Error(
      "TeacherSidebar must be used within UserDetailContext.Provider",
    );
  const { userDetail } = context;

  useEffect(() => {
    if (userDetail && userDetail.role !== "teacher") router.replace("/");
  }, [userDetail, router]);

  const earnings = useQuery(
    api.payments.getEarningsSummary,
    userDetail?._id && userDetail.role === "teacher"
      ? { teacherId: userDetail._id }
      : "skip",
  );

  if (!userDetail || userDetail.role !== "teacher") return null;

  return (
    <>
      <style>{TSB_STYLES}</style>
      <Sidebar collapsible="icon" className="tsb-shell border-r">
        {/* ── Header ── */}
        <SidebarHeader className="tsb-header border-b">
          <div className="flex justify-center items-center py-3 sm:py-4">
            {open ? (
              <h1 className="tsb-logo text-lg sm:text-xl font-bold">
                Music Rabbit
              </h1>
            ) : (
              <Music className="tsb-logo-icon h-5 w-5 sm:h-6 sm:w-6" />
            )}
          </div>
        </SidebarHeader>

        {/* ── Nav ── */}
        <SidebarContent className="tsb-content flex-1 min-h-0">
          <SidebarGroup>
            <SidebarGroupLabel className="tsb-group-label text-xs font-semibold uppercase tracking-wider">
              Teacher Portal
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {MenuOptions.map((menu) => (
                  <SidebarMenuItem key={menu.url}>
                    <SidebarMenuButton
                      isActive={path === menu.url}
                      asChild
                      size={open ? "default" : "sm"}
                      className="tsb-item transition-all duration-200"
                    >
                      <Link href={menu.url}>
                        <menu.icon className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                        {open && <span className="text-sm">{menu.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* ── Footer ── */}
        <SidebarFooter className="tsb-footer border-t">
          <div className="p-3 sm:p-4 text-center space-y-2 sm:space-y-3">
            <div className="flex items-center justify-center gap-2">
              <DollarSign className="tsb-earnings-icon h-4 w-4 shrink-0" />
              {open && (
                <p className="tsb-earnings-text text-xs sm:text-sm">
                  Monthly:{" "}
                  <span className="tsb-earnings-value font-bold">
                    $
                    {earnings
                      ? Number(earnings.month.earnings).toFixed(2)
                      : "0.00"}
                  </span>
                </p>
              )}
            </div>

            {open && (
              <Link
                href="/dashboard/teacher/payments"
                className="tsb-details-btn w-full flex items-center justify-center px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-medium transition-all duration-200"
              >
                View Details
              </Link>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}

export default TeacherSidebar;
