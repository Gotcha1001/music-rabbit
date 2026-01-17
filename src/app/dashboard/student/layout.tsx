// app/dashboard/student/layout.tsx

import { StudentSidebar } from "@/app/components/student-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gradient-to-br from-black via-purple-950 to-black">
        <StudentSidebar />

        <div className="flex-1 flex flex-col overflow-hidden w-full">
          <header className="flex items-center gap-4 p-4 border-b border-purple-800/30 bg-black/50 backdrop-blur-sm">
            <SidebarTrigger className="text-purple-300 hover:text-white hover:bg-purple-900/50 p-2 rounded-lg transition" />
            <h1 className="text-xl font-bold text-purple-200">
              Music Rabbit • Student Portal
            </h1>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full">
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
