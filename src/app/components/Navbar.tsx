"use client";

import { useUser, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Navbar() {
  const { user } = useUser();
  const role = user?.publicMetadata?.role as string | undefined; // From Clerk metadata

  return (
    <motion.nav
      className="flex items-center justify-between p-4 bg-blue-600 text-white"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Link href="/" className="text-xl font-bold">
        Music Rabbit
      </Link>
      <div className="flex items-center space-x-4">
        <SignedOut>
          <Link href="/sign-in">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button>Sign Up</Button>
          </Link>
        </SignedOut>
        <SignedIn>
          {role === "teacher" && (
            <Link href="/dashboard/teacher">Schedule</Link>
          )}
          {role === "student" && (
            <Link href="/dashboard/student">My Lessons</Link>
          )}
          {role === "admin" && <Link href="/dashboard/admin">Admin Panel</Link>}
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </motion.nav>
  );
}
