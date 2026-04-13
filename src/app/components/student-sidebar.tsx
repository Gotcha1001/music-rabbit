"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Home,
  Package,
  BarChart3,
  Music,
  LogOut,
  Heart,
  BookOpen,
  Music2,
  ClipboardList,
  Gamepad2,
} from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PushNotificationToggle } from "./PushNotificationToggle";

/* ─────────────────────────────────────────────────────────────
   !important overrides
   Light = default  |  Dark = .dark prefix
───────────────────────────────────────────────────────────── */
const SIDEBAR_STYLES = `
  /* Shell */
  .sb-shell,
  .sb-shell [data-sidebar="sidebar"]          { background: #ffffff !important; border-right-color: hsl(var(--border)) !important; }
  .dark .sb-shell,
  .dark .sb-shell [data-sidebar="sidebar"]    { background: #0a0014 !important; border-right-color: rgba(109,40,217,0.3) !important; }

  /* Header */
  .sb-header                                  { background: #ffffff !important; border-bottom-color: hsl(var(--border)) !important; }
  .dark .sb-header                            { background: linear-gradient(to bottom right, hsl(270 90% 5%), #000000) !important; border-bottom-color: rgba(109,40,217,0.3) !important; }

  /* Logo text */
  .sb-logo-title                              { color: hsl(var(--foreground)) !important; }
  .sb-logo-sub                                { color: hsl(var(--muted-foreground)) !important; }
  .dark .sb-logo-title                        { color: #ddd6fe !important; }
  .dark .sb-logo-sub                          { color: #a78bfa !important; }

  /* Logo icon */
  .sb-logo-icon                               { background: linear-gradient(to bottom right, hsl(var(--primary)), hsl(var(--primary)/0.7)) !important; }
  .dark .sb-logo-icon                         { background: linear-gradient(to bottom right, #7c3aed, #ec4899) !important; }

  /* Nav content area */
  .sb-content,
  .sb-content [data-sidebar="content"]        { background: #ffffff !important; }
  .dark .sb-content,
  .dark .sb-content [data-sidebar="content"]  { background: linear-gradient(to bottom right, hsl(270 90% 5%), #000000) !important; }

  /* Nav items — default */
  .sb-item                                    { color: hsl(var(--foreground)) !important; }
  .sb-item:hover                              { background: hsl(var(--muted)) !important; color: hsl(var(--foreground)) !important; }
  .dark .sb-item                              { color: #c4b5fd !important; }
  .dark .sb-item:hover                        { background: rgba(76,29,149,0.5) !important; color: #ffffff !important; }

  /* Nav items — active */
  .sb-item[data-active="true"]                { background: hsl(var(--primary)) !important; color: #ffffff !important; box-shadow: 0 4px 12px hsl(var(--primary)/0.3) !important; }
  .dark .sb-item[data-active="true"]          { background: rgba(109,40,217,0.7) !important; color: #ffffff !important; box-shadow: 0 4px 12px rgba(139,92,246,0.3) !important; }

  /* External badge */
  .sb-ext-badge                               { color: hsl(var(--muted-foreground)) !important; }
  .dark .sb-ext-badge                         { color: #a78bfa !important; }

  /* Footer */
  .sb-footer                                  { background: #ffffff !important; border-top-color: hsl(var(--border)) !important; }
  .dark .sb-footer                            { background: linear-gradient(to bottom right, hsl(270 90% 5%), #000000) !important; border-top-color: rgba(109,40,217,0.3) !important; }

  /* User name */
  .sb-username                                { color: hsl(var(--foreground)) !important; }
  .dark .sb-username                          { color: #c4b5fd !important; }

  /* Sign out button */
  .sb-signout                                 { background: rgba(239,68,68,0.08) !important; color: #dc2626 !important; }
  .sb-signout:hover                           { background: rgba(239,68,68,0.15) !important; color: #b91c1c !important; }
  .dark .sb-signout                           { background: rgba(127,29,29,0.3) !important; color: #fca5a5 !important; }
  .dark .sb-signout:hover                     { background: rgba(127,29,29,0.5) !important; color: #fecaca !important; }

  /* Push notification toggle — force visible in light mode */
  .sb-content [role="switch"],
  .sb-footer [role="switch"]                  { background: hsl(var(--muted)) !important; border: 1.5px solid hsl(var(--border)) !important; }
  .sb-content [role="switch"][data-state="checked"],
  .sb-footer [role="switch"][data-state="checked"] { background: hsl(var(--primary)) !important; border-color: hsl(var(--primary)) !important; }
  .sb-content [role="switch"] span,
  .sb-footer [role="switch"] span             { background: #ffffff !important; box-shadow: 0 1px 4px rgba(0,0,0,0.2) !important; }
  .dark .sb-content [role="switch"],
  .dark .sb-footer [role="switch"]            { background: rgba(76,29,149,0.4) !important; border-color: rgba(109,40,217,0.4) !important; }
  .dark .sb-content [role="switch"][data-state="checked"],
  .dark .sb-footer [role="switch"][data-state="checked"] { background: #7c3aed !important; border-color: #7c3aed !important; }

  /* Toggle label text */
  .sb-footer label, .sb-footer span.text-sm   { color: hsl(var(--foreground)) !important; }
  .dark .sb-footer label,
  .dark .sb-footer span.text-sm               { color: #c4b5fd !important; }

  /* Mobile scroll */
  .sb-content                                 { overflow-y: auto !important; -webkit-overflow-scrolling: touch !important; }
`;

const links = [
  { name: "Dashboard", href: "/dashboard/student", icon: Home },
  { name: "My Package", href: "/dashboard/student/packages", icon: Package },
  { name: "Books", href: "/dashboard/student/books", icon: BookOpen },
  { name: "My Stats", href: "/dashboard/student/stats", icon: BarChart3 },
  { name: "My Thank Yous", href: "/dashboard/student/thank-yous", icon: Heart },
  {
    name: "Daily Music Piece",
    href: "/dashboard/student/daily-piece",
    icon: Music2,
  },
  {
    name: "Evaluations",
    href: "/dashboard/student/evaluations",
    icon: ClipboardList,
  },
  {
    name: "Self-Testing Game",
    href: "https://music-course-xi.vercel.app/",
    icon: Gamepad2,
    external: true,
  },
];

export function StudentSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { openMobile, setOpenMobile, isMobile } = useSidebar();

  return (
    <>
      <style>{SIDEBAR_STYLES}</style>

      {/* Mobile backdrop */}
      {isMobile && openMobile && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setOpenMobile(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar
        className="sb-shell border-r"
        style={{ zIndex: isMobile ? 50 : undefined }}
      >
        {/* ── Header ── */}
        <SidebarHeader className="sb-header p-5 sm:p-6 border-b">
          <Link href="/" className="flex items-center gap-3">
            <div className="sb-logo-icon w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg shrink-0">
              <Music className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="sb-logo-title text-lg sm:text-xl font-bold">
                Music Rabbit
              </h1>
              <p className="sb-logo-sub text-xs">Student Portal</p>
            </div>
          </Link>
        </SidebarHeader>

        {/* ── Nav ── */}
        <SidebarContent className="sb-content flex-1 min-h-0">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {links.map((link) => {
                  const isActive = !link.external && pathname === link.href;

                  const buttonContent = (
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="sb-item w-full justify-start gap-3 rounded-lg px-4 py-3 text-left font-medium transition-all duration-200 ease-out hover:translate-x-1"
                      onClick={() => isMobile && setOpenMobile(false)}
                    >
                      <Link
                        href={link.href}
                        {...(link.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        <link.icon className="h-5 w-5 flex-shrink-0" />
                        <span>{link.name}</span>
                        {link.external && (
                          <span className="sb-ext-badge ml-auto text-xs">
                            ↗
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  );

                  if (link.external) {
                    return (
                      <TooltipProvider key={link.href}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SidebarMenuItem>{buttonContent}</SidebarMenuItem>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="text-sm">
                            Practice & test yourself in a fun game format!
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  }

                  return (
                    <SidebarMenuItem key={link.href}>
                      {buttonContent}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* ── Footer ── */}
        <SidebarFooter className="sb-footer p-4 border-t">
          <div className="space-y-3 sm:space-y-4">
            <div className="px-2 py-1">
              <PushNotificationToggle variant="switch" />
            </div>
            <div className="text-center space-y-3">
              <p className="sb-username text-sm font-medium">
                {user?.firstName || "Student"}
              </p>
              <SignOutButton>
                <button className="sb-signout w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200">
                  <LogOut className="h-4 w-4 shrink-0" />
                  Sign Out
                </button>
              </SignOutButton>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
