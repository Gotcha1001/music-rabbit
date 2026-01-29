// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import {
//   Calendar,
//   MessageSquare,
//   BookOpen,
//   FolderTree,
//   Users,
//   Key,
//   Send,
//   Sparkles,
//   LogOut,
// } from "lucide-react";
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
// } from "@/components/ui/sidebar";
// import { Button } from "@/components/ui/button";
// import { SignOutButton, useUser } from "@clerk/nextjs";

// const menuItems = [
//   {
//     title: "Schedules",
//     href: "/dashboard/admin/schedules",
//     icon: Calendar,
//   },
//   {
//     title: "Messages",
//     href: "/dashboard/admin/messages",
//     icon: MessageSquare,
//   },
//   {
//     title: "Library",
//     href: "/dashboard/admin/books",
//     icon: BookOpen,
//   },
//   {
//     title: "Categories",
//     href: "/dashboard/admin/categories",
//     icon: FolderTree,
//   },
//   {
//     title: "Users",
//     href: "/dashboard/admin/users",
//     icon: Users,
//   },
//   {
//     title: "Invite Codes",
//     href: "/dashboard/admin/invites",
//     icon: Key,
//   },
//   {
//     title: "Announcements",
//     href: "/dashboard/admin/announcements",
//     icon: Send,
//   },
//   {
//     title: "Monthly Draw",
//     href: "/dashboard/admin/draw",
//     icon: Sparkles,
//   },
// ];

// export function AdminSidebar() {
//   const pathname = usePathname();
//   const { user } = useUser();

//   return (
//     <Sidebar>
//       <SidebarHeader className="border-b border-border/50 pb-6">
//         <div className="px-4 py-2">
//           <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"></h2>
//           <p className="text-xs text-muted-foreground mt-1">Admin Portal</p>
//         </div>
//       </SidebarHeader>

//       <SidebarContent>
//         <SidebarGroup>
//           <SidebarGroupLabel>Navigation</SidebarGroupLabel>
//           <SidebarGroupContent>
//             <SidebarMenu>
//               {menuItems.map((item) => {
//                 const isActive = pathname === item.href;
//                 return (
//                   <SidebarMenuItem key={item.href}>
//                     <SidebarMenuButton
//                       asChild
//                       isActive={isActive}
//                       className={
//                         isActive
//                           ? "bg-purple-800/30 text-purple-200 hover:bg-purple-800/40"
//                           : ""
//                       }
//                     >
//                       <Link href={item.href}>
//                         <item.icon className="h-4 w-4" />
//                         <span>{item.title}</span>
//                       </Link>
//                     </SidebarMenuButton>
//                   </SidebarMenuItem>
//                 );
//               })}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>
//       </SidebarContent>

//       <SidebarFooter className="border-t border-border/50 p-4">
//         <div className="flex items-center justify-between">
//           <div className="flex flex-col">
//             <span className="text-sm font-medium">
//               {user?.firstName || user?.emailAddresses[0].emailAddress}
//             </span>
//             <span className="text-xs text-muted-foreground">Administrator</span>
//           </div>
//           <SignOutButton>
//             <Button variant="ghost" size="icon" className="h-8 w-8">
//               <LogOut className="h-4 w-4" />
//             </Button>
//           </SignOutButton>
//         </div>
//       </SidebarFooter>
//     </Sidebar>
//   );
// }
// components/AdminSidebar.tsx
// components/AdminSidebar.tsx
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
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { SignOutButton, useUser } from "@clerk/nextjs";

const menuItems = [
  {
    title: "Schedules",
    href: "/dashboard/admin/schedules",
    icon: Calendar,
  },
  {
    title: "Messages",
    href: "/dashboard/admin/messages",
    icon: MessageSquare,
  },
  {
    title: "Library",
    href: "/dashboard/admin/books",
    icon: BookOpen,
  },
  {
    title: "Categories",
    href: "/dashboard/admin/categories",
    icon: FolderTree,
  },
  {
    title: "Users",
    href: "/dashboard/admin/users",
    icon: Users,
  },
  {
    title: "Invite Codes",
    href: "/dashboard/admin/invites",
    icon: Key,
  },
  {
    title: "Announcements",
    href: "/dashboard/admin/announcements",
    icon: Send,
  },
  {
    title: "Monthly Draw",
    href: "/dashboard/admin/draw",
    icon: Sparkles,
  },
  {
    title: "Salaries",
    href: "/dashboard/admin/salaries",
    icon: Coins,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="bg-gradient-to-br from-purple-950 to-black border-b border-purple-800/50">
        <div className="flex justify-center items-center py-4 gap-3">
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Music Rabbit
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Admin Portal</p>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-gradient-to-br from-purple-950 to-black">
        <SidebarGroup>
          <SidebarGroupLabel className="text-purple-300">
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
                      className={
                        isActive
                          ? "bg-purple-800/30 text-purple-200 hover:bg-purple-800/40"
                          : "text-purple-200 hover:bg-purple-800/50 data-[active=true]:bg-purple-700/50"
                      }
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-4 bg-gradient-to-br from-purple-950 to-black border-t border-purple-800/50">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-purple-300">
              {user?.firstName || user?.emailAddresses[0].emailAddress}
            </span>
            <span className="text-xs text-muted-foreground">Administrator</span>
          </div>
          <SignOutButton>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-purple-300"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </SignOutButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
