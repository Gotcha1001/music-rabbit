// "use client";
// import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { motion } from "framer-motion";
// import { useQuery } from "convex/react";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";
// import Link from "next/link";

// import { Music, GraduationCap, Users } from "lucide-react";
// import { api } from "../../convex/_generated/api";

// export default function Home() {
//   return (
//     <>
//       <AuthLoading>
//         <div className="flex min-h-screen items-center justify-center">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//             <p className="mt-4 text-muted-foreground">Loading...</p>
//           </div>
//         </div>
//       </AuthLoading>
//       <Authenticated>
//         <AuthenticatedContent />
//       </Authenticated>
//       <Unauthenticated>
//         <UnauthenticatedContent />
//       </Unauthenticated>
//     </>
//   );
// }

// function UnauthenticatedContent() {
//   return (
//     <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
//       <motion.div
//         className="container mx-auto px-4 py-16"
//         initial={{ y: 20, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         transition={{ duration: 0.5 }}
//       >
//         {/* Hero Section */}
//         <div className="text-center mb-16" role="banner">
//           <motion.h1
//             className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
//             initial={{ scale: 0.9 }}
//             animate={{ scale: 1 }}
//             transition={{ duration: 0.5 }}
//           >
//             🎵 Music Rabbit
//           </motion.h1>
//           <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
//             Learn music from expert teachers via live Zoom lessons. Choose your
//             instrument, schedule your lessons, and start your musical journey
//             today!
//           </p>
//         </div>
//         {/* Role Selection Cards */}

//         <div className="grid md:grid-cols-1 gap-8 max-w-5xl mx-auto mb-12">
//           <motion.div
//             initial={{ y: 20, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ delay: 0.1 }}
//           >
//             <Card className="hover:shadow-lg transition-shadow">
//               <CardHeader>
//                 <Music className="h-12 w-12 text-purple-600 mb-2 mx-auto" />
//                 <CardTitle className="text-center">Join Music Rabbit</CardTitle>
//               </CardHeader>
//               <CardContent className="text-center">
//                 <CardDescription className="mb-4">
//                   Sign up with an invite code from HR (for teachers/students) or
//                   as the first admin.
//                 </CardDescription>
//                 <Button asChild className="w-full">
//                   <Link href="/sign-up">Sign Up</Link>
//                 </Button>
//               </CardContent>
//             </Card>
//           </motion.div>
//         </div>
//         {/* Already have account */}
//         <div className="text-center mb-12">
//           <p className="text-muted-foreground mb-4">Already have an account?</p>
//           <Button variant="outline" asChild size="lg">
//             <Link href="/sign-in">Sign In</Link>
//           </Button>
//         </div>
//         {/* Features Section */}
//         <motion.div
//           className="mt-20 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.5 }}
//           role="region"
//           aria-label="Features"
//         >
//           <div className="text-center p-4 rounded-lg hover:bg-blue-50 transition-colors">
//             <div className="text-4xl mb-3">🎹</div>
//             <h3 className="font-semibold mb-2">All Instruments</h3>
//             <p className="text-sm text-muted-foreground">
//               Piano, Guitar, Violin, Drums, and more
//             </p>
//           </div>
//           <div className="text-center p-4 rounded-lg hover:bg-blue-50 transition-colors">
//             <div className="text-4xl mb-3">💻</div>
//             <h3 className="font-semibold mb-2">Live Zoom Lessons</h3>
//             <p className="text-sm text-muted-foreground">
//               Face-to-face instruction from anywhere
//             </p>
//           </div>
//           <div className="text-center p-4 rounded-lg hover:bg-blue-50 transition-colors">
//             <div className="text-4xl mb-3">📚</div>
//             <h3 className="font-semibold mb-2">Structured Curriculum</h3>
//             <p className="text-sm text-muted-foreground">
//               From basics to advanced techniques
//             </p>
//           </div>
//         </motion.div>
//       </motion.div>
//     </div>
//   );
// }

// function AuthenticatedContent() {
//   const router = useRouter();
//   const convexUser = useQuery(api.users.get);

//   useEffect(() => {
//     if (convexUser === null) {
//       // Redirect to onboarding instead of creating user here
//       router.push("/onboarding");
//     } else if (convexUser) {
//       const role = convexUser.role;
//       if (role === "teacher") router.push("/dashboard/teacher");
//       else if (role === "student") router.push("/dashboard/student");
//       else if (role === "admin") router.push("/dashboard/admin");
//       else router.push("/"); // Fallback
//     }
//   }, [convexUser, router]);

//   if (convexUser === undefined || convexUser === null) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-muted-foreground">Syncing your account...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex min-h-screen items-center justify-center">
//       <div className="text-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//         <p className="mt-4 text-muted-foreground">
//           Redirecting to your dashboard...
//         </p>
//       </div>
//     </div>
//   );
// }
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

import { Music, GraduationCap, Users } from "lucide-react";
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
        // Use a cubic bezier array instead of a string to satisfy the Easing type
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
      <motion.div
        className="absolute top-40 right-32 w-3 h-3 bg-purple-400 rounded-full blur-sm"
        animate={{
          y: [0, 80, 0],
          x: [0, -60, 0],
          opacity: [0.2, 0.8, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      <motion.div
        className="absolute bottom-40 left-1/4 w-2 h-2 bg-purple-600 rounded-full blur-sm"
        animate={{
          y: [0, -60, 0],
          x: [0, 40, 0],
          opacity: [0.4, 1, 0.4],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

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
          <motion.div
            whileHover={{
              scale: 1.02,
              boxShadow: "0 0 40px rgba(168,85,247,0.4)",
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring" as const, stiffness: 300 }}
          >
            <Card className="bg-gradient-to-br from-purple-950/80 to-black/80 border-purple-800/50 backdrop-blur-sm hover:border-purple-600/70 transition-all duration-300 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
              <CardHeader>
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Music className="h-12 w-12 text-purple-400 mb-2 mx-auto drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                </motion.div>
                <CardTitle className="text-center text-purple-100 text-2xl">
                  Join Music Rabbit
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="mb-6 text-purple-300">
                  Sign up with an invite code from HR (for teachers/students) or
                  as the first admin.
                </CardDescription>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-semibold py-6 shadow-lg shadow-purple-900/50 border border-purple-500/30"
                  >
                    <Link href="/sign-up">Sign Up</Link>
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Already have account */}
        <motion.div className="text-center mb-16" variants={itemVariants}>
          <p className="text-purple-300 mb-4 text-lg">
            Already have an account?
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              asChild
              size="lg"
              className="border-purple-600 text-purple-300 hover:bg-purple-950/50 hover:text-purple-200 hover:border-purple-500"
            >
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          className="mt-20 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          variants={containerVariants}
          role="region"
          aria-label="Features"
        >
          {[
            {
              emoji: "🎹",
              title: "All Instruments",
              desc: "Piano, Guitar, Violin, Drums, and more",
            },
            {
              emoji: "💻",
              title: "Live Zoom Lessons",
              desc: "Face-to-face instruction from anywhere",
            },
            {
              emoji: "📚",
              title: "Structured Curriculum",
              desc: "From basics to advanced techniques",
            },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(139,92,246,0.1)",
              }}
              className="text-center p-6 rounded-lg border border-purple-900/30 bg-purple-950/20 backdrop-blur-sm transition-all duration-300 shadow-lg shadow-purple-900/20"
            >
              <motion.div
                className="text-5xl mb-4"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.3,
                }}
              >
                {feature.emoji}
              </motion.div>
              <h3 className="font-semibold mb-2 text-purple-200 text-xl">
                {feature.title}
              </h3>
              <p className="text-sm text-purple-400">{feature.desc}</p>
            </motion.div>
          ))}
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
      router.push("/onboarding");
    } else if (convexUser) {
      const role = convexUser.role;
      if (role === "teacher") router.push("/dashboard/teacher");
      else if (role === "student") router.push("/dashboard/student");
      else if (role === "admin") router.push("/dashboard/admin");
      else router.push("/");
    }
  }, [convexUser, router]);

  if (convexUser === undefined || convexUser === null) {
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
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
          <p className="mt-4 text-purple-300">Syncing your account...</p>
        </div>
      </div>
    );
  }

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
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
        <p className="mt-4 text-purple-300">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
