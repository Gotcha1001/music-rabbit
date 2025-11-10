"use client";

import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { SignInButton, SignUpButton } from "@clerk/nextjs"; // Optional for modals
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "convex/react";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { api } from "../../convex/_generated/api";

export default function Home() {
  return (
    <>
      <AuthLoading>
        <div>Loading...</div>{" "}
        {/* Simple spinner or placeholder to avoid flashes */}
      </AuthLoading>
      <Authenticated>
        <AuthenticatedContent />
      </Authenticated>
      <Unauthenticated>
        <motion.div
          className="container mx-auto p-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h1 className="text-4xl font-bold">
            Music Rabbit: Online Music Teaching Platform
          </h1>
          <p>
            Learn instruments with expert teachers via Zoom. Sign up as student
            or teacher.
          </p>
          <Button asChild>
            <Link href="/sign-up">Sign Up</Link>
          </Button>{" "}
          {/* Comment outside */}
          <Button variant="ghost" asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>{" "}
          {/* Or replace with <SignInButton /> */}
        </motion.div>
      </Unauthenticated>
    </>
  );
}

function AuthenticatedContent() {
  const router = useRouter();
  const convexUser = useQuery(api.users.get);
  const createUser = useMutation(api.users.createOrGet);

  useEffect(() => {
    if (convexUser === null) {
      // User signed in via Clerk but not in Convex: Create once
      createUser().catch(console.error); // Handle error (e.g., toast)
    } else if (convexUser) {
      // Redirect only if user exists
      const role = convexUser.role;
      if (role === "teacher") router.push("/dashboard/teacher");
      else if (role === "student") router.push("/dashboard/student");
      else if (role === "admin") router.push("/dashboard/admin");
    }
  }, [convexUser, createUser, router]); // Deps: Only rerun if convexUser changes

  if (convexUser === undefined || convexUser === null) {
    return <div>Syncing user...</div>; // Prevent fallback loop
  }

  return <div>Redirecting...</div>; // Placeholder while redirecting
}
