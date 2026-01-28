// "use client";

// import { AdminSidebar } from "@/app/components/AdminSidebar";
// import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

// import { Toaster } from "@/components/ui/sonner";

// export default function AdminLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <SidebarProvider>
//       <div className="min-h-screen flex w-full bg-gradient-to-b from-black via-purple-950 to-black">
//         <AdminSidebar />
//         <main className="flex-1 overflow-auto">
//           <div className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
//             <SidebarTrigger />
//             <h1 className="text-lg font-semibold">
//               Music Rabbit • Admin Portal
//             </h1>
//           </div>
//           <div className="p-6">{children}</div>
//         </main>
//       </div>
//       <Toaster />
//     </SidebarProvider>
//   );
// }
// app/dashboard/admin/layout.tsx
// app/dashboard/admin/layout.tsx
"use client";

import { AdminSidebar } from "@/app/components/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import { Toaster } from "@/components/ui/sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-black overflow-hidden">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-purple-800/30 bg-gradient-to-br from-purple-950/20 to-black/80 backdrop-blur-sm px-4 py-2">
            <SidebarTrigger className="text-purple-300 hover:text-purple-100" />
            <h2 className="text-sm font-semibold text-purple-200">
              Music Rabbit • Admin Portal
            </h2>
          </div>
          <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-purple-950/20 to-black/80">
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
