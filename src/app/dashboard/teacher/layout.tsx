// app/dashboard/teacher/layout.tsx
"use client";

import GlobalMessageModal from "@/app/components/GlobalMessageModal";
import TeacherSidebar from "@/app/components/TeacherSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"; // ← ADD SidebarTrigger
import { ReactNode } from "react";

export default function TeacherLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-black overflow-hidden">
        <TeacherSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <GlobalMessageModal />
          {/* ← ADD THIS: Trigger button at top */}
          <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-purple-800/30 bg-gradient-to-br from-purple-950/20 to-black/80 backdrop-blur-sm px-4 py-2">
            <SidebarTrigger className="text-purple-300 hover:text-purple-100" />
            <h2 className="text-sm font-semibold text-purple-200">
              Teacher Dashboard
            </h2>
          </div>

          {/* Main content area */}
          <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-purple-950/20 to-black/80">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
