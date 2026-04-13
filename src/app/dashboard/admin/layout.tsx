"use client";

import { AdminSidebar } from "@/app/components/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

const ADMIN_LAYOUT_STYLES = `
  .al-shell                   { background: #ffffff !important; }
  .dark .al-shell             { background: #000000 !important; }

  .al-topbar                  { background: hsl(var(--muted)/0.5) !important; border-bottom-color: hsl(var(--border)) !important; backdrop-filter: blur(8px) !important; }
  .dark .al-topbar            { background: linear-gradient(to bottom right, rgba(59,7,100,0.2), rgba(0,0,0,0.8)) !important; border-bottom-color: rgba(109,40,217,0.3) !important; }

  .al-topbar-title            { color: hsl(var(--foreground)) !important; }
  .dark .al-topbar-title      { color: #ddd6fe !important; }

  .al-trigger                 { color: hsl(var(--muted-foreground)) !important; }
  .al-trigger:hover           { color: hsl(var(--foreground)) !important; }
  .dark .al-trigger           { color: #c4b5fd !important; }
  .dark .al-trigger:hover     { color: #ffffff !important; }

  .al-main                    { background: #f8f7ff !important; }
  .dark .al-main              { background: linear-gradient(to bottom right, rgba(59,7,100,0.2), rgba(0,0,0,0.8)) !important; }
`;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <style>{ADMIN_LAYOUT_STYLES}</style>
      <div className="al-shell flex h-screen w-full overflow-hidden">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <div className="al-topbar sticky top-0 z-10 flex items-center gap-2 border-b px-3 sm:px-4 py-2">
            <SidebarTrigger className="al-trigger transition-colors" />
            <h2 className="al-topbar-title text-xs sm:text-sm font-semibold">
              Music Rabbit • Admin Portal
            </h2>
          </div>
          {/* Main content */}
          <main className="al-main flex-1 overflow-y-auto p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
