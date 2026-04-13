"use client";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion, Variants } from "framer-motion";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Music } from "lucide-react";
import { api } from "../../convex/_generated/api";

export default function Home() {
  return (
    <>
      <AuthLoading>
        <div className="flex min-h-screen items-center justify-center bg-black">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-purple-300">Loading...</p>
          </div>
        </div>
      </AuthLoading>

      <Authenticated>
        <AuthenticatedContent />
      </Authenticated>

      <Unauthenticated>
        <UnauthenticatedContent />
      </Unauthenticated>
    </>
  );
}

function UnauthenticatedContent() {
  // ────────────────────────────────────────────────
  // Your existing beautiful landing page for non-logged-in users
  // (kept unchanged – hero, features, sign up / sign in buttons)
  // ────────────────────────────────────────────────

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const floatVariants: Variants = {
    initial: { y: 0 },
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: [0.42, 0, 0.58, 1],
      },
    },
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Radial Gradient Backgrounds */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.15)_0%,transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(168,85,247,0.15)_0%,transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_80%,rgba(126,34,206,0.1)_0%,transparent_50%)]"></div>

      {/* Animated particles */}
      <motion.div
        className="absolute top-20 left-20 w-2 h-2 bg-purple-500 rounded-full blur-sm"
        animate={{
          y: [0, -100, 0],
          x: [0, 50, 0],
          opacity: [0.3, 1, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {/* ... other particles ... */}

      <motion.div
        className="container mx-auto px-4 pt-32 pb-16 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.div
          className="text-center mb-16"
          role="banner"
          variants={itemVariants}
        >
          <motion.div
            variants={floatVariants}
            initial="initial"
            animate="animate"
          >
            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-purple-600 to-purple-900 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(168,85,247,0.5)] px-4 leading-tight py-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.8,
                type: "spring" as const,
                stiffness: 100,
              }}
            >
              🎵 Music Rabbit
            </motion.h1>
          </motion.div>
          <motion.p
            className="text-xl text-purple-200 max-w-2xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            Learn music from expert teachers via live Zoom lessons. Choose your
            instrument, schedule your lessons, and start your musical journey
            today!
          </motion.p>
        </motion.div>

        {/* Role Selection Card */}
        <motion.div
          className="grid md:grid-cols-1 gap-8 max-w-5xl mx-auto mb-12"
          variants={itemVariants}
        >
          {/* ... your join card ... */}
        </motion.div>

        {/* Already have account */}
        <motion.div className="text-center mb-16" variants={itemVariants}>
          {/* ... sign in button ... */}
        </motion.div>

        {/* Features Section */}
        <motion.div
          className="mt-20 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          variants={containerVariants}
          role="region"
          aria-label="Features"
        >
          {/* ... features cards ... */}
        </motion.div>
      </motion.div>
    </div>
  );
}

function AuthenticatedContent() {
  const router = useRouter();
  const convexUser = useQuery(api.users.get);

  useEffect(() => {
    if (convexUser === null) {
      // New user or no role → onboarding
      router.push("/onboarding");
      return;
    }

    if (convexUser) {
      const role = convexUser.role;

      if (role === "teacher") {
        router.push("/welcome/teacher");
      } else if (role === "student") {
        router.push("/welcome/student");
      } else if (role === "admin") {
        router.push("/dashboard/admin");
      } else {
        // Fallback – unknown role
        router.push("/");
      }
    }
  }, [convexUser, router]);

  // Loading / syncing state
  if (convexUser === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.15)_0%,transparent_50%)]"></div>
        <div className="text-center relative z-10">
          <motion.div
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"
            animate={{
              boxShadow: [
                "0 0 20px rgba(168,85,247,0.5)",
                "0 0 40px rgba(168,85,247,0.8)",
                "0 0 20px rgba(168,85,247,0.5)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <p className="mt-4 text-purple-300">Syncing your account...</p>
        </div>
      </div>
    );
  }

  // Brief redirecting screen (shows only for a split second usually)
  return (
    <div className="flex min-h-screen items-center justify-center bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.15)_0%,transparent_50%)]"></div>
      <div className="text-center relative z-10">
        <motion.div
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"
          animate={{
            boxShadow: [
              "0 0 20px rgba(168,85,247,0.5)",
              "0 0 40px rgba(168,85,247,0.8)",
              "0 0 20px rgba(168,85,247,0.5)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <p className="mt-4 text-purple-300">Redirecting you...</p>
      </div>
    </div>
  );
}
