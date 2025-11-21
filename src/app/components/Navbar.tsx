// "use client";

// import { useUser, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
// import { Button } from "@/components/ui/button";
// import Link from "next/link";
// import { motion } from "framer-motion";

// export default function Navbar() {
//   const { user } = useUser();
//   const role = user?.publicMetadata?.role as string | undefined; // From Clerk metadata

//   return (
//     <motion.nav
//       className="flex items-center justify-between p-4 bg-blue-600 text-white"
//       initial={{ y: -50, opacity: 0 }}
//       animate={{ y: 0, opacity: 1 }}
//       transition={{ duration: 0.5 }}
//     >
//       <Link href="/" className="text-xl font-bold">
//         Music Rabbit
//       </Link>
//       <div className="flex items-center space-x-4">
//         <SignedOut>
//           <Link href="/sign-in">
//             <Button variant="ghost">Sign In</Button>
//           </Link>
//           <Link href="/sign-up">
//             <Button>Sign Up</Button>
//           </Link>
//         </SignedOut>
//         <SignedIn>
//           {role === "teacher" && (
//             <Link href="/dashboard/teacher">Schedule</Link>
//           )}
//           {role === "student" && (
//             <Link href="/dashboard/student">My Lessons</Link>
//           )}
//           {role === "admin" && <Link href="/dashboard/admin">Admin Panel</Link>}
//           <UserButton afterSignOutUrl="/" />
//         </SignedIn>
//       </div>
//     </motion.nav>
//   );
// }

"use client";

import { useUser, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Navbar() {
  const { user } = useUser();
  const role = user?.publicMetadata?.role as string | undefined;

  return (
    <motion.nav
      className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-black via-purple-950 to-black border-b-2 border-purple-800/30 shadow-[0_0_30px_rgba(168,85,247,0.2)]"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Logo */}
      <Link href="/" className="group">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-purple-400 to-purple-200 font-serif"
        >
          🎵 Music Rabbit
        </motion.div>
      </Link>

      {/* Navigation Links */}
      <div className="flex items-center space-x-6">
        <SignedOut>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/sign-in">
              <Button
                variant="ghost"
                className="text-purple-300 hover:text-purple-100 hover:bg-purple-800/30 border border-purple-800/30 transition-all"
              >
                Sign In
              </Button>
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link href="/sign-up">
              <Button className="bg-purple-700 hover:bg-purple-600 text-purple-50 border border-purple-600/50 shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all">
                Sign Up
              </Button>
            </Link>
          </motion.div>
        </SignedOut>

        <SignedIn>
          <motion.div
            className="flex items-center space-x-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {role === "teacher" && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/dashboard/teacher">
                  <Button className="bg-purple-700/50 hover:bg-purple-600 text-purple-100 border border-purple-600/30 shadow-[0_0_10px_rgba(168,85,247,0.2)] transition-all font-serif">
                    📚 Schedule
                  </Button>
                </Link>
              </motion.div>
            )}

            {role === "student" && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/dashboard/student">
                  <Button className="bg-purple-700/50 hover:bg-purple-600 text-purple-100 border border-purple-600/30 shadow-[0_0_10px_rgba(168,85,247,0.2)] transition-all font-serif">
                    🎼 My Lessons
                  </Button>
                </Link>
              </motion.div>
            )}

            {role === "admin" && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/dashboard/admin">
                  <Button className="bg-purple-700/50 hover:bg-purple-600 text-purple-100 border border-purple-600/30 shadow-[0_0_10px_rgba(168,85,247,0.2)] transition-all font-serif">
                    ⚙️ Admin Panel
                  </Button>
                </Link>
              </motion.div>
            )}

            {/* User Button with custom styling */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="ml-4"
            >
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox:
                      "w-10 h-10 rounded-full border-2 border-purple-600/50 shadow-[0_0_10px_rgba(168,85,247,0.3)]",
                  },
                }}
              />
            </motion.div>
          </motion.div>
        </SignedIn>
      </div>
    </motion.nav>
  );
}
