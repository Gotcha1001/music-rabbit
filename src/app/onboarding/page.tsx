// "use client";
// import { useUser } from "@clerk/nextjs";
// import { useMutation, useQuery } from "convex/react";
// import { useRouter } from "next/navigation";
// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Loader2 } from "lucide-react";
// import { api } from "../../../convex/_generated/api";
// import type { Id } from "../../../convex/_generated/dataModel";

// interface NewUser {
//   _id: Id<"users">;
//   _creationTime: number;
//   instrument?: string;
//   clerkId: string;
//   role: "admin" | "teacher" | "student";
//   email: string;
//   tokenIdentifier: string;
// }

// export default function Onboarding() {
//   const { user } = useUser();
//   const router = useRouter();
//   const convexUser = useQuery(api.users.get);
//   const userCount = useQuery(api.users.getCount);
//   const createUser = useMutation(api.users.createOrGet);
//   const [inviteCode, setInviteCode] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");

//   if (convexUser === undefined || userCount === undefined) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         Loading...
//       </div>
//     );
//   }

//   if (convexUser) {
//     // Already created, redirect to dashboard
//     router.push(`/dashboard/${convexUser.role}`);
//     return null;
//   }

//   const isFirstUser = userCount === 0;

//   const handleComplete = async () => {
//     setError("");
//     setIsLoading(true);
//     try {
//       const newUser = await createUser({
//         inviteCode: isFirstUser ? undefined : inviteCode,
//       });
//       if (!newUser) {
//         throw new Error("User creation failed");
//       }

//       await user?.update({
//         unsafeMetadata: {
//           role: newUser.role,
//         },
//       });
//       if (newUser.role === "admin") {
//         router.push("/dashboard/admin");
//       } else {
//         // Redirect to instrument selection
//         router.push(`/onboarding/${newUser.role}`);
//       }
//     } catch (err: unknown) {
//       const errorMessage =
//         err instanceof Error
//           ? err.message
//           : "Error during onboarding. Try again.";
//       setError(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white">
//       <Card className="w-full max-w-md">
//         <CardHeader>
//           <CardTitle className="text-2xl">Welcome to Music Rabbit!</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-6">
//           {isFirstUser ? (
//             <div>
//               <p className="text-muted-foreground mb-4">
//                 You&apos;re the first user—setting up as Admin (HR).
//               </p>
//               <Button
//                 onClick={handleComplete}
//                 disabled={isLoading}
//                 className="w-full"
//               >
//                 {isLoading ? (
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 ) : null}
//                 Setup as Admin
//               </Button>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               <Label htmlFor="inviteCode">
//                 Enter your invite code (from HR)
//               </Label>
//               <Input
//                 id="inviteCode"
//                 value={inviteCode}
//                 onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
//                 placeholder="e.g., ABC12345"
//               />
//               {error && <p className="text-sm text-destructive">{error}</p>}
//               <Button
//                 onClick={handleComplete}
//                 disabled={isLoading || !inviteCode}
//                 className="w-full"
//               >
//                 {isLoading ? (
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 ) : null}
//                 Submit Code & Complete Setup
//               </Button>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, GraduationCap, Music } from "lucide-react";
import { api } from "../../../convex/_generated/api";

export default function Onboarding() {
  const { user } = useUser();
  const router = useRouter();

  const convexUser = useQuery(api.users.get);
  const userCount = useQuery(api.users.getCount);
  const createUser = useMutation(api.users.createOrGet);

  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTeacherDialog, setShowTeacherDialog] = useState(false);

  // Redirect if already fully onboarded
  useEffect(() => {
    if (!convexUser) return;

    if (convexUser.role === "admin") {
      router.replace("/dashboard/admin");
      return;
    }

    if (convexUser.instrument?.trim()) {
      router.replace(`/dashboard/${convexUser.role}`);
    }
  }, [convexUser, router]);

  if (convexUser === undefined || userCount === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const isFirstUser = userCount === 0;

  const handleAdminSetup = async () => {
    setError("");
    setIsLoading(true);
    try {
      await createUser({ role: "admin" });
      await user?.update({ unsafeMetadata: { role: "admin" } });
      router.replace("/dashboard/admin");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentSignup = async () => {
    setError("");
    setIsLoading(true);
    try {
      await createUser({ role: "student" });
      await user?.update({ unsafeMetadata: { role: "student" } });
      router.push("/onboarding/student");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeacherSignup = async () => {
    if (!inviteCode.trim()) {
      setError("Please enter your invite code");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      await createUser({ inviteCode: inviteCode.trim() });
      await user?.update({ unsafeMetadata: { role: "teacher" } });
      setShowTeacherDialog(false);
      router.replace("/onboarding/teacher");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Invalid invite code";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // First user = Admin
  if (isFirstUser) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              Welcome! You are the first user 👋
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              You will be set up as <strong>Admin (HR)</strong>.
            </p>
            <Button
              onClick={handleAdminSetup}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Setup as Admin
            </Button>
            {error && <p className="text-center text-destructive">{error}</p>}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-4xl">
        <h1 className="text-center text-4xl font-bold mb-8">
          Welcome to Music Rabbit! 🎵
        </h1>
        <p className="text-center text-muted-foreground mb-12">
          What would you like to do?
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Student */}
          <Button
            variant="outline"
            className="h-auto p-8 flex flex-col items-center justify-center gap-4 hover:shadow-xl transition-shadow"
            onClick={handleStudentSignup}
            disabled={isLoading}
          >
            <GraduationCap className="h-16 w-16 text-blue-600" />
            <div className="text-2xl font-semibold">Join as Student</div>
            <div className="text-muted-foreground text-lg">
              Learn music from expert teachers
            </div>
          </Button>

          {/* Teacher */}
          <Button
            variant="outline"
            className="h-auto p-8 flex flex-col items-center justify-center gap-4 hover:shadow-xl transition-shadow"
            onClick={() => setShowTeacherDialog(true)}
            disabled={isLoading}
          >
            <Music className="h-16 w-16 text-purple-600" />
            <div className="text-2xl font-semibold">Join as Teacher</div>
            <div className="text-muted-foreground text-lg">
              Teach music lessons (requires invite code)
            </div>
          </Button>
        </div>

        {error && !showTeacherDialog && (
          <p className="text-center text-destructive mt-6">{error}</p>
        )}
      </div>

      {/* Teacher Invite Code Dialog */}
      <Dialog open={showTeacherDialog} onOpenChange={setShowTeacherDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Teacher Invite Code</DialogTitle>
            <DialogDescription>
              Enter the invite code provided by HR.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="code">Invite Code</Label>
              <Input
                id="code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="ABCD1234"
                className="uppercase"
                onKeyDown={(e) => e.key === "Enter" && handleTeacherSignup()}
              />
            </div>
            {error && <p className="text-destructive">{error}</p>}
            <Button
              onClick={handleTeacherSignup}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
// "use client";

// import { useUser } from "@clerk/nextjs";
// import { useMutation, useQuery } from "convex/react";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Loader2, GraduationCap, Music } from "lucide-react";
// import { api } from "../../../convex/_generated/api";
// import { toast } from "sonner";

// export default function Onboarding() {
//   const { user, isLoaded: clerkLoaded } = useUser();
//   const router = useRouter();

//   const convexUser = useQuery(api.users.get);
//   const userCount = useQuery(api.users.getCount);
//   const createUser = useMutation(api.users.createOrGet);

//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState("");

//   // Auto-create Convex user as soon as Clerk user loads
//   useEffect(() => {
//     if (!clerkLoaded || !user) return;
//     if (convexUser !== undefined) return; // Already handled

//     const setupUser = async () => {
//       setIsSubmitting(true);
//       try {
//         const result = await createUser({});

//         // result is guaranteed to exist here because createOrGet always returns a user
//         if (!result) {
//           throw new Error("Failed to create user");
//         }

//         // Safe access — result is not null
//         if (result.role === "admin") {
//           router.replace("/dashboard/admin");
//         } else if (result.role === "teacher") {
//           router.replace("/onboarding/teacher");
//         } else {
//           router.replace("/onboarding/student");
//         }
//       } catch (err) {
//         console.error("Auto user creation failed:", err);
//         setError(
//           "Failed to set up your account. Please refresh and try again."
//         );
//       } finally {
//         setIsSubmitting(false);
//       }
//     };

//     setupUser();
//   }, [clerkLoaded, user, convexUser, createUser, router]);

//   // Redirect if already fully onboarded
//   useEffect(() => {
//     if (!convexUser) return;

//     const isFullyOnboarded =
//       convexUser.instrument &&
//       convexUser.timezone &&
//       (convexUser.role !== "teacher" || convexUser.zoomLink);

//     if (isFullyOnboarded) {
//       router.replace(`/dashboard/${convexUser.role}`);
//       return;
//     }

//     // Partial onboarding → send to correct step
//     if (convexUser.role === "teacher" && !convexUser.instrument) {
//       router.replace("/onboarding/teacher");
//     } else if (convexUser.role === "student" && !convexUser.instrument) {
//       router.replace("/onboarding/student");
//     }
//   }, [convexUser, router]);

//   // Still loading
//   if (!clerkLoaded || convexUser === undefined) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
//         <div className="text-center">
//           <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
//           <p className="text-lg text-purple-700">Setting up your account...</p>
//         </div>
//       </div>
//     );
//   }

//   // First user = Admin
//   const isFirstUser = userCount === 0;

//   if (isFirstUser) {
//     return (
//       <div className="flex min-h-screen items-center justify-center p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
//         <Card className="w-full max-w-md shadow-2xl">
//           <CardHeader className="text-center">
//             <CardTitle className="text-3xl">
//               Welcome! You&apos;re the Admin
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             <p className="text-center text-muted-foreground">
//               As the first user, you&apos;re now the Admin (HR).
//             </p>
//             <Button
//               onClick={() => router.replace("/dashboard/admin")}
//               className="w-full h-12 text-lg"
//               disabled={isSubmitting}
//             >
//               {isSubmitting ? (
//                 <Loader2 className="mr-2 h-5 w-5 animate-spin" />
//               ) : (
//                 "Go to Admin Dashboard"
//               )}
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   // Normal user: Choose role
//   return (
//     <div className="flex min-h-screen items-center justify-center p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
//       <div className="w-full max-w-4xl">
//         <h1 className="text-center text-5xl font-bold mb-4 text-purple-800">
//           Welcome to Music Rabbit!
//         </h1>
//         <p className="text-center text-xl text-muted-foreground mb-12">
//           Choose how you&apos;d like to join
//         </p>

//         <div className="grid md:grid-cols-2 gap-10 max-w-3xl mx-auto">
//           {/* Student */}
//           <Card
//             className="cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-purple-400"
//             onClick={() => router.replace("/onboarding/student")}
//           >
//             <CardContent className="p-10 text-center space-y-6">
//               <GraduationCap className="h-20 w-20 mx-auto text-blue-600" />
//               <h3 className="text-2xl font-bold">I&apos;m a Student</h3>
//               <p className="text-muted-foreground">
//                 Learn any instrument from world-class teachers
//               </p>
//             </CardContent>
//           </Card>

//           {/* Teacher */}
//           <Card
//             className="cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-purple-400"
//             onClick={() => {
//               toast.info("Teacher signup requires an invite code from HR");
//               router.replace("/onboarding/teacher");
//             }}
//           >
//             <CardContent className="p-10 text-center space-y-6">
//               <Music className="h-20 w-20 mx-auto text-purple-600" />
//               <h3 className="text-2xl font-bold">I&apos;m a Teacher</h3>
//               <p className="text-muted-foreground">
//                 Teach music online • Earn $10/hour • Work from anywhere
//               </p>
//               <p className="text-sm text-purple-600 font-medium">
//                 Invite code required
//               </p>
//             </CardContent>
//           </Card>
//         </div>

//         {error && (
//           <p className="text-center text-destructive mt-8 text-lg">{error}</p>
//         )}
//       </div>
//     </div>
//   );
// }
