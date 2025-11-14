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
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

import { Music, GraduationCap, Users } from "lucide-react";
import { api } from "../../convex/_generated/api";

export default function Home() {
  return (
    <>
      <AuthLoading>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
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
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <motion.div
        className="container mx-auto px-4 py-16"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Hero Section */}
        <div className="text-center mb-16" role="banner">
          <motion.h1
            className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            🎵 Music Rabbit
          </motion.h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Learn music from expert teachers via live Zoom lessons. Choose your
            instrument, schedule your lessons, and start your musical journey
            today!
          </p>
        </div>
        {/* Role Selection Cards */}

        <div className="grid md:grid-cols-1 gap-8 max-w-5xl mx-auto mb-12">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Music className="h-12 w-12 text-purple-600 mb-2 mx-auto" />
                <CardTitle className="text-center">Join Music Rabbit</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="mb-4">
                  Sign up with an invite code from HR (for teachers/students) or
                  as the first admin.
                </CardDescription>
                <Button asChild className="w-full">
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        {/* Already have account */}
        <div className="text-center mb-12">
          <p className="text-muted-foreground mb-4">Already have an account?</p>
          <Button variant="outline" asChild size="lg">
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </div>
        {/* Features Section */}
        <motion.div
          className="mt-20 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          role="region"
          aria-label="Features"
        >
          <div className="text-center p-4 rounded-lg hover:bg-blue-50 transition-colors">
            <div className="text-4xl mb-3">🎹</div>
            <h3 className="font-semibold mb-2">All Instruments</h3>
            <p className="text-sm text-muted-foreground">
              Piano, Guitar, Violin, Drums, and more
            </p>
          </div>
          <div className="text-center p-4 rounded-lg hover:bg-blue-50 transition-colors">
            <div className="text-4xl mb-3">💻</div>
            <h3 className="font-semibold mb-2">Live Zoom Lessons</h3>
            <p className="text-sm text-muted-foreground">
              Face-to-face instruction from anywhere
            </p>
          </div>
          <div className="text-center p-4 rounded-lg hover:bg-blue-50 transition-colors">
            <div className="text-4xl mb-3">📚</div>
            <h3 className="font-semibold mb-2">Structured Curriculum</h3>
            <p className="text-sm text-muted-foreground">
              From basics to advanced techniques
            </p>
          </div>
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
      // Redirect to onboarding instead of creating user here
      router.push("/onboarding");
    } else if (convexUser) {
      const role = convexUser.role;
      if (role === "teacher") router.push("/dashboard/teacher");
      else if (role === "student") router.push("/dashboard/student");
      else if (role === "admin") router.push("/dashboard/admin");
      else router.push("/"); // Fallback
    }
  }, [convexUser, router]);

  if (convexUser === undefined || convexUser === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Syncing your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-muted-foreground">
          Redirecting to your dashboard...
        </p>
      </div>
    </div>
  );
}
