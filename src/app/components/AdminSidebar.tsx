"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  MessageSquare,
  BookOpen,
  FolderTree,
  Users,
  Key,
  Send,
  Sparkles,
  LogOut,
  Coins,
  Hotel,
  Music,
} from "lucide-react";
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
import { SignOutButton, useUser } from "@clerk/nextjs";

/* ─────────────────────────────────────────────────────────────
   !important overrides
   Light = default  |  Dark = .dark prefix
───────────────────────────────────────────────────────────── */
const ASB_STYLES = `
  /* Shell */
  .asb-shell,
  .asb-shell [data-sidebar="sidebar"]       { background: #ffffff !important; border-right-color: hsl(var(--border)) !important; }
  .dark .asb-shell,
  .dark .asb-shell [data-sidebar="sidebar"] { background: #0a0014 !important; border-right-color: rgba(109,40,217,0.3) !important; }

  /* Header */
  .asb-header                              { background: #ffffff !important; border-bottom-color: hsl(var(--border)) !important; }
  .dark .asb-header                        { background: linear-gradient(to bottom right, hsl(270 90% 5%), #000000) !important; border-bottom-color: rgba(109,40,217,0.5) !important; }

  /* Logo text */
  .asb-logo                                { color: hsl(var(--primary)) !important; background: none !important; -webkit-text-fill-color: hsl(var(--primary)) !important; }
  .dark .asb-logo                          { color: transparent !important; -webkit-text-fill-color: transparent !important; background: linear-gradient(to right, #a78bfa, #f472b6) !important; -webkit-background-clip: text !important; background-clip: text !important; }

  /* Portal label */
  .asb-portal                              { color: hsl(var(--muted-foreground)) !important; }
  .dark .asb-portal                        { color: #a78bfa !important; }

  /* Content area */
  .asb-content,
  .asb-content [data-sidebar="content"]    { background: #ffffff !important; overflow-y: auto !important; -webkit-overflow-scrolling: touch !important; }
  .dark .asb-content,
  .dark .asb-content [data-sidebar="content"] { background: linear-gradient(to bottom right, hsl(270 90% 5%), #000000) !important; }

  /* Group label */
  .asb-group-label                         { color: hsl(var(--muted-foreground)) !important; }
  .dark .asb-group-label                   { color: #c4b5fd !important; }

  /* Nav items */
  .asb-item                                { color: hsl(var(--foreground)) !important; }
  .asb-item:hover                          { background: hsl(var(--muted)) !important; color: hsl(var(--foreground)) !important; }
  .dark .asb-item                          { color: #c4b5fd !important; }
  .dark .asb-item:hover                    { background: rgba(76,29,149,0.5) !important; color: #ffffff !important; }

  /* Active item */
  .asb-item[data-active="true"]            { background: hsl(var(--primary)) !important; color: #ffffff !important; box-shadow: 0 4px 12px hsl(var(--primary)/0.3) !important; }
  .dark .asb-item[data-active="true"]      { background: rgba(109,40,217,0.5) !important; color: #ffffff !important; box-shadow: 0 4px 12px rgba(139,92,246,0.3) !important; }

  /* Footer */
  .asb-footer                              { background: #ffffff !important; border-top-color: hsl(var(--border)) !important; }
  .dark .asb-footer                        { background: linear-gradient(to bottom right, hsl(270 90% 5%), #000000) !important; border-top-color: rgba(109,40,217,0.5) !important; }

  .asb-user-name                           { color: hsl(var(--foreground)) !important; }
  .asb-user-role                           { color: hsl(var(--muted-foreground)) !important; }
  .dark .asb-user-name                     { color: #c4b5fd !important; }
  .dark .asb-user-role                     { color: #6b7280 !important; }

  .asb-signout-btn                         { color: hsl(var(--muted-foreground)) !important; background: transparent !important; }
  .asb-signout-btn:hover                   { background: hsl(var(--muted)) !important; color: hsl(var(--foreground)) !important; }
  .dark .asb-signout-btn                   { color: #c4b5fd !important; }
  .dark .asb-signout-btn:hover             { background: rgba(76,29,149,0.4) !important; color: #ffffff !important; }
`;

const menuItems = [
  { title: "Schedules", href: "/dashboard/admin/schedules", icon: Calendar },
  { title: "Messages", href: "/dashboard/admin/messages", icon: MessageSquare },
  { title: "Library", href: "/dashboard/admin/books", icon: BookOpen },
  {
    title: "Categories",
    href: "/dashboard/admin/categories",
    icon: FolderTree,
  },
  { title: "Users", href: "/dashboard/admin/users", icon: Users },
  { title: "Invite Codes", href: "/dashboard/admin/invites", icon: Key },
  {
    title: "Announcements",
    href: "/dashboard/admin/announcements",
    icon: Send,
  },
  { title: "Monthly Draw", href: "/dashboard/admin/draw", icon: Sparkles },
  { title: "Salaries", href: "/dashboard/admin/salaries", icon: Coins },
  { title: "Leave", href: "/dashboard/admin/leave-applications", icon: Hotel },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { open } = useSidebar();

  return (
    <>
      <style>{ASB_STYLES}</style>
      <Sidebar collapsible="icon" className="asb-shell border-r">
        {/* ── Header ── */}
        <SidebarHeader className="asb-header border-b">
          <div className="flex justify-center items-center py-3 sm:py-4 gap-2">
            {open ? (
              <>
                <h2 className="asb-logo text-lg sm:text-xl font-bold font-serif">
                  Music Rabbit
                </h2>
                <p className="asb-portal text-xs mt-0.5">Admin</p>
              </>
            ) : (
              <Music className="h-5 w-5 text-primary dark:text-purple-400" />
            )}
          </div>
        </SidebarHeader>

        {/* ── Nav ── */}
        <SidebarContent className="asb-content flex-1 min-h-0">
          <SidebarGroup>
            <SidebarGroupLabel className="asb-group-label text-xs font-semibold uppercase tracking-wider">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className="asb-item transition-all duration-200"
                      >
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span className="text-sm">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* ── Footer ── */}
        <SidebarFooter className="asb-footer border-t p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            {open && (
              <div className="flex flex-col min-w-0">
                <span className="asb-user-name text-xs sm:text-sm font-medium truncate">
                  {user?.firstName || user?.emailAddresses[0].emailAddress}
                </span>
                <span className="asb-user-role text-xs">Administrator</span>
              </div>
            )}
            <SignOutButton>
              <button className="asb-signout-btn p-1.5 sm:p-2 rounded-lg transition-all duration-200 shrink-0">
                <LogOut className="h-4 w-4" />
              </button>
            </SignOutButton>
          </div>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
