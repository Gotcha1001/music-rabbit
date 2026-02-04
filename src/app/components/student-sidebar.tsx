// components/student-sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Home,
  Package,
  BarChart3,
  Music,
  LogOut,
  Heart,
  BookOpen,
} from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";

const links = [
  { name: "Dashboard", href: "/dashboard/student", icon: Home },
  { name: "My Package", href: "/dashboard/student/packages", icon: Package },
  {
    title: "Books",
    href: "/dashboard/student/books",
    icon: BookOpen,
  },
  { name: "My Stats", href: "/dashboard/student/stats", icon: BarChart3 },
  { name: "My Thank Yous", href: "/dashboard/student/thank-yous", icon: Heart },
];

export function StudentSidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <Sidebar className="border-r border-purple-800/30 bg-black/70 backdrop-blur-xl">
      {/* Header */}
      <SidebarHeader className="p-6 border-b border-purple-800/30">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            <Music className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-purple-200">Music Rabbit</h1>
            <p className="text-xs text-purple-400">Student Portal</p>
          </div>
        </Link>
      </SidebarHeader>

      {/* Menu */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`
                        w-full justify-start gap-3 rounded-lg px-4 py-3 text-left font-medium
                        text-purple-200 hover:text-white hover:bg-purple-900/50
                        data-[active=true]:bg-purple-800/70 
                        data-[active=true]:text-white
                        data-[active=true]:shadow-lg 
                        data-[active=true]:shadow-purple-500/30
                        transition-all duration-200 ease-out
                        hover:translate-x-1
                      `}
                    >
                      <Link href={link.href}>
                        <link.icon className="h-5 w-5 flex-shrink-0" />
                        <span>{link.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-4 border-t border-purple-800/30">
        <div className="text-center space-y-3">
          <p className="text-sm font-medium text-purple-300">
            {user?.firstName || "Student"}
          </p>
          <SignOutButton>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-900/30 hover:bg-red-900/50 text-red-300 hover:text-red-200 text-sm font-medium transition">
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </SignOutButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
