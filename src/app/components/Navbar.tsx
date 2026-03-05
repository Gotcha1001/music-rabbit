"use client";

import { useUser, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";

export default function Navbar() {
  const { user } = useUser();
  const role = user?.publicMetadata?.role as string | undefined;

  return (
    <motion.nav
      className="flex items-center justify-between p-4  text-white dark:bg-radial from-purple-500 to-indigo-900"
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
            <Button variant="ghost" className="text-white hover:bg-blue-700">
              Sign In
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button className="bg-white text-blue-600 hover:bg-gray-100">
              Sign Up
            </Button>
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
