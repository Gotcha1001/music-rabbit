// "use client";

// import { Button } from "@/components/ui/button";
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
//   useSidebar,
// } from "@/components/ui/sidebar";
// import { UserDetailContext } from "@/context/UserDetailContext";
// import { useQuery } from "convex/react";
// import { api } from "../../../convex/_generated/api";
// import {
//   BookOpen,
//   Calendar,
//   DollarSign,
//   MessageSquare,
//   Music,
//   User,
//   Users,
//   Video,
// } from "lucide-react";
// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import { useContext, useEffect } from "react";

// // Removed Dashboard option - now Schedule is the main page
// const MenuOptions = [
//   { title: "Schedule", url: "/dashboard/teacher/schedule", icon: Calendar },
//   { title: "Students", url: "/dashboard/teacher/students", icon: Users },
//   { title: "Books", url: "/dashboard/teacher/books", icon: BookOpen },
//   { title: "Recordings", url: "/dashboard/teacher/recordings", icon: Video },
//   { title: "Payments", url: "/dashboard/teacher/payments", icon: DollarSign },
//   {
//     title: "Messages",
//     url: "/dashboard/teacher/messages",
//     icon: MessageSquare,
//   },
//   { title: "Profile", url: "/dashboard/teacher/profile", icon: User },
// ];

// function TeacherSidebar() {
//   const { open } = useSidebar();
//   const path = usePathname();
//   const router = useRouter();

//   // 1. Get context safely
//   const context = useContext(UserDetailContext);
//   if (!context) {
//     throw new Error(
//       "TeacherSidebar must be used within UserDetailContext.Provider",
//     );
//   }
//   const { userDetail } = context;

//   // 2. Redirect if not teacher
//   useEffect(() => {
//     if (userDetail && userDetail.role !== "teacher") {
//       router.replace("/");
//     }
//   }, [userDetail, router]);

//   // 3. CALL useQuery UNCONDITIONALLY — before any early return!
//   const earnings = useQuery(
//     api.payments.getEarningsSummary,
//     userDetail?._id && userDetail.role === "teacher"
//       ? { teacherId: userDetail._id }
//       : "skip",
//   );

//   if (!userDetail || userDetail.role !== "teacher") {
//     return null;
//   }

//   return (
//     <Sidebar collapsible="icon">
//       <SidebarHeader className="bg-gradient-to-br from-purple-950 to-black border-b border-purple-800/50">
//         <div className="flex justify-center items-center py-4">
//           {open ? (
//             <h1 className="text-xl font-bold text-purple-300">Music Rabbit</h1>
//           ) : (
//             <Music className="h-6 w-6 text-purple-400" />
//           )}
//         </div>
//       </SidebarHeader>

//       <SidebarContent className="bg-gradient-to-br from-purple-950 to-black">
//         <SidebarGroup>
//           <SidebarGroupLabel className="text-purple-300">
//             Teacher Portal
//           </SidebarGroupLabel>
//           <SidebarGroupContent>
//             <SidebarMenu>
//               {MenuOptions.map((menu) => (
//                 <SidebarMenuItem key={menu.url}>
//                   <SidebarMenuButton
//                     isActive={path === menu.url}
//                     asChild
//                     size={open ? "default" : "sm"}
//                     className="text-purple-200 hover:bg-purple-800/50 data-[active=true]:bg-purple-700/50"
//                   >
//                     <Link href={menu.url}>
//                       <menu.icon className="h-5 w-5" />
//                       {open && <span>{menu.title}</span>}
//                     </Link>
//                   </SidebarMenuButton>
//                 </SidebarMenuItem>
//               ))}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>
//       </SidebarContent>

//       <SidebarFooter className="bg-gradient-to-br from-purple-950 to-black border-t border-purple-800/50">
//         <div className="p-4 text-center space-y-3">
//           <div className="flex items-center justify-center gap-2 text-purple-300">
//             <DollarSign className="h-4 w-4" />
//             {open && (
//               <p className="text-sm">
//                 Monthly Earnings:{" "}
//                 <span className="font-bold text-purple-100">
//                   $
//                   {earnings
//                     ? Number(earnings.month.earnings).toFixed(2)
//                     : "0.00"}
//                 </span>
//               </p>
//             )}
//           </div>

//           {open && (
//             <Button
//               asChild
//               variant="outline"
//               size="sm"
//               className="w-full border-purple-600 text-purple-300 hover:bg-purple-900/50"
//             >
//               <Link href="/dashboard/teacher/payments">View Details</Link>
//             </Button>
//           )}
//         </div>
//       </SidebarFooter>
//     </Sidebar>
//   );
// }
// export default TeacherSidebar;
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
  Music2, // ← NEW: Import Heart icon for Thanks Messages
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useContext, useEffect } from "react";

// Removed Dashboard option - now Schedule is the main page
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
  // ← NEW: Add Thanks Messages item here
  { title: "Thanks Messages", url: "/dashboard/thanks-messages", icon: Heart },
  { title: "Profile", url: "/dashboard/teacher/profile", icon: User },
  {
    title: "Daily Music Piece",
    url: "/dashboard/teacher/daily-piece",
    icon: Music2,
  },
];

function TeacherSidebar() {
  const { open } = useSidebar();
  const path = usePathname();
  const router = useRouter();

  // 1. Get context safely
  const context = useContext(UserDetailContext);
  if (!context) {
    throw new Error(
      "TeacherSidebar must be used within UserDetailContext.Provider",
    );
  }
  const { userDetail } = context;

  // 2. Redirect if not teacher
  useEffect(() => {
    if (userDetail && userDetail.role !== "teacher") {
      router.replace("/");
    }
  }, [userDetail, router]);

  // 3. CALL useQuery UNCONDITIONALLY — before any early return!
  const earnings = useQuery(
    api.payments.getEarningsSummary,
    userDetail?._id && userDetail.role === "teacher"
      ? { teacherId: userDetail._id }
      : "skip",
  );

  if (!userDetail || userDetail.role !== "teacher") {
    return null;
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="bg-gradient-to-br from-purple-950 to-black border-b border-purple-800/50">
        <div className="flex justify-center items-center py-4">
          {open ? (
            <h1 className="text-xl font-bold text-purple-300">Music Rabbit</h1>
          ) : (
            <Music className="h-6 w-6 text-purple-400" />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-gradient-to-br from-purple-950 to-black">
        <SidebarGroup>
          <SidebarGroupLabel className="text-purple-300">
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
                    className="text-purple-200 hover:bg-purple-800/50 data-[active=true]:bg-purple-700/50"
                  >
                    <Link href={menu.url}>
                      <menu.icon className="h-5 w-5" />
                      {open && <span>{menu.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-gradient-to-br from-purple-950 to-black border-t border-purple-800/50">
        <div className="p-4 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-purple-300">
            <DollarSign className="h-4 w-4" />
            {open && (
              <p className="text-sm">
                Monthly Earnings:{" "}
                <span className="font-bold text-purple-100">
                  $
                  {earnings
                    ? Number(earnings.month.earnings).toFixed(2)
                    : "0.00"}
                </span>
              </p>
            )}
          </div>

          {open && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full border-purple-600 text-purple-300 hover:bg-purple-900/50"
            >
              <Link href="/dashboard/teacher/payments">View Details</Link>
            </Button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
export default TeacherSidebar;
