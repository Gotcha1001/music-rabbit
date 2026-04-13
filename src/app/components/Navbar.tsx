"use client";

import { useUser, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { motion } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";

export default function Navbar() {
  const { user } = useUser();
  const role = user?.publicMetadata?.role as string | undefined;

  return (
    <motion.nav
      className="flex items-center justify-between py-2.5 sm:py-3 pr-3 sm:pr-6 text-white dark:bg-radial from-purple-500 to-indigo-900"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo — padding-left shifts it clear of the collapsed sidebar icon column */}
      <Link
        href="/"
        className="text-xl font-bold"
        style={{
          paddingLeft: "calc(var(--sidebar-width-icon, 3rem) + 0.75rem)",
          transition: "padding-left 0.2s ease",
          whiteSpace: "nowrap",
        }}
      >
        Music Rabbit
      </Link>

      <div className="flex items-center space-x-4 flex-shrink-0">
        <SignedOut>
          <Link href="/sign-in">
            <button className="text-white hover:bg-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
              Sign In
            </button>
          </Link>
          <Link href="/sign-up">
            <button className="bg-white text-blue-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
              Sign Up
            </button>
          </Link>
        </SignedOut>
        <SignedIn>
          {role === "teacher" && (
            <Link
              href="/dashboard/teacher"
              className="text-white hover:opacity-80"
            >
              Schedule
            </Link>
          )}
          {role === "student" && (
            <Link
              href="/dashboard/student"
              className="text-white hover:opacity-80"
            >
              My Lessons
            </Link>
          )}
          {role === "admin" && (
            <Link
              href="/dashboard/admin"
              className="text-white hover:opacity-80"
            >
              Admin Panel
            </Link>
          )}
          <ThemeToggle />
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </motion.nav>
  );
}

// WHITE MODE IF NEEDED FOR LATER

// "use client";

// import { useUser, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
// import Link from "next/link";
// import { motion } from "framer-motion";
// import { ThemeToggle } from "./ThemeToggle";

// const NAV_STYLES = `
//   .nav-shell                    { background: #ffffff !important; border-bottom: 1px solid hsl(var(--border)) !important; }
//   .dark .nav-shell              { background: radial-gradient(ellipse at top, #3b0764 0%, #1e1b4b 100%) !important; border-bottom-color: rgba(109,40,217,0.3) !important; }

//   .nav-logo                     { color: hsl(var(--primary)) !important; }
//   .dark .nav-logo               { color: #ffffff !important; }

//   .nav-link                     { color: hsl(var(--foreground)) !important; }
//   .nav-link:hover               { color: hsl(var(--primary)) !important; }
//   .dark .nav-link               { color: #ffffff !important; }
//   .dark .nav-link:hover         { opacity: 0.8 !important; }

//   .nav-signin-btn               { color: hsl(var(--foreground)) !important; }
//   .nav-signin-btn:hover         { background: hsl(var(--muted)) !important; }
//   .dark .nav-signin-btn         { color: #ffffff !important; }
//   .dark .nav-signin-btn:hover   { background: rgba(59,7,100,0.5) !important; }

//   .nav-signup-btn               { background: hsl(var(--primary)) !important; color: #ffffff !important; }
//   .nav-signup-btn:hover         { background: hsl(var(--primary)/0.9) !important; }
//   .dark .nav-signup-btn         { background: #ffffff !important; color: #2563eb !important; }
//   .dark .nav-signup-btn:hover   { background: #f1f5f9 !important; }
// `;

// export default function Navbar() {
//   const { user } = useUser();
//   const role = user?.publicMetadata?.role as string | undefined;

//   return (
//     <>
//       <style>{NAV_STYLES}</style>
//       <motion.nav
//         className="nav-shell flex items-center justify-between py-2.5 sm:py-3 pr-3 sm:pr-6"
//         initial={{ y: -50, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         transition={{ duration: 0.5 }}
//       >
//         {/* Logo — padding-left shifts it clear of the collapsed sidebar icon column */}
//         <Link
//           href="/"
//           className="nav-logo text-xl font-bold font-serif"
//           style={{
//             paddingLeft: "calc(var(--sidebar-width-icon, 3rem) + 0.75rem)",
//             transition: "padding-left 0.2s ease",
//             whiteSpace: "nowrap",
//           }}
//         >
//           Music Rabbit
//         </Link>

//         <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
//           <SignedOut>
//             <Link href="/sign-in">
//               <button className="nav-signin-btn px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200">
//                 Sign In
//               </button>
//             </Link>
//             <Link href="/sign-up">
//               <button className="nav-signup-btn px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200">
//                 Sign Up
//               </button>
//             </Link>
//           </SignedOut>
//           <SignedIn>
//             {role === "teacher" && (
//               <Link
//                 href="/dashboard/teacher"
//                 className="nav-link text-sm font-medium transition-all duration-200"
//               >
//                 Schedule
//               </Link>
//             )}
//             {role === "student" && (
//               <Link
//                 href="/dashboard/student"
//                 className="nav-link text-sm font-medium transition-all duration-200"
//               >
//                 My Lessons
//               </Link>
//             )}
//             {role === "admin" && (
//               <Link
//                 href="/dashboard/admin"
//                 className="nav-link text-sm font-medium transition-all duration-200"
//               >
//                 Admin Panel
//               </Link>
//             )}
//             <ThemeToggle />
//             <UserButton afterSignOutUrl="/" />
//           </SignedIn>
//         </div>
//       </motion.nav>
//     </>
//   );
// }
