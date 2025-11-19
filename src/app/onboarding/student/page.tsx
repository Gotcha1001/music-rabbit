"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { api } from "../../../../convex/_generated/api";

const instruments = [
  "Piano",
  "Guitar",
  "Violin",
  "Drums",
  "Voice / Singing",
  "Ukulele",
  "Bass Guitar",
  "Flute",
  "Saxophone",
  "Trumpet",
  "Clarinet",
  "Cello",
  "Keyboard",
  "Drum Kit",
  "Recorder",
  "Other", // ← important!
].sort();

export default function StudentInstrumentOnboarding() {
  const { user } = useUser();
  const router = useRouter();

  const convexUser = useQuery(api.users.get);
  const setInstrument = useMutation(api.users.setInstrument);

  const [value, setValue] = useState("");
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already done or wrong role
  useEffect(() => {
    if (!convexUser) return;

    if (convexUser.role !== "student") {
      router.replace("/");
      return;
    }
    if (convexUser.instrument) {
      router.replace("/dashboard/student");
    }
  }, [convexUser, router]);

  if (!convexUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleContinue = async () => {
    const finalInstrument =
      value === "Other" ? custom.trim() || "Other" : value;
    if (!finalInstrument) return;

    setLoading(true);
    try {
      await setInstrument({ instrument: finalInstrument });
      // Keep Clerk metadata in sync (optional but nice)
      await user?.update({
        unsafeMetadata: {
          ...(user?.unsafeMetadata || {}),
          instrument: finalInstrument,
        },
      });
      router.replace("/dashboard/student");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">
            Welcome to Music Rabbit! 🎵
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Hi {user?.firstName || "there"}! One last step...
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="instrument" className="text-lg">
              What instrument would you like to learn?
            </Label>

            <Select value={value} onValueChange={setValue}>
              <SelectTrigger id="instrument">
                <SelectValue placeholder="Choose your instrument..." />
              </SelectTrigger>
              <SelectContent>
                {instruments.map((i) => (
                  <SelectItem key={i} value={i}>
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {value === "Other" && (
              <div className="mt-4">
                <Label htmlFor="custom">Specify your instrument</Label>
                <Input
                  id="custom"
                  placeholder="e.g. Oboe, Banjo, Theremin..."
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}
          </div>

          <Button
            onClick={handleContinue}
            disabled={
              !value || loading || (value === "Other" && !custom.trim())
            }
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Continue to My Lessons →"
            )}
          </Button>
        </CardContent>
      </Card>
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
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Loader2 } from "lucide-react";
// import { api } from "../../../../convex/_generated/api";
// import { Id } from "../../../../convex/_generated/dataModel";

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
//   const [showRoleSelection, setShowRoleSelection] = useState(false);

//   // Automatic redirect when the user is already fully onboarded
//   useEffect(() => {
//     if (convexUser && (convexUser.role === "admin" || convexUser.instrument)) {
//       router.replace(`/dashboard/${convexUser.role}`);
//     }
//   }, [convexUser, router]);

//   // Still waiting for queries
//   if (convexUser === undefined || userCount === undefined) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         <Loader2 className="h-8 w-8 animate-spin" />
//       </div>
//     );
//   }

//   const isFirstUser = userCount === 0;

//   // Admin creation (first user)
//   const handleAdminSetup = async () => {
//     setError("");
//     setIsLoading(true);
//     try {
//       const newUser = await createUser({
//         role: "admin",
//       });
//       if (!newUser) throw new Error("User creation failed");

//       await user?.update({
//         unsafeMetadata: { role: newUser.role },
//       });

//       router.replace("/dashboard/admin");
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

//   // Student signup (no code required)
//   const handleStudentSignup = async () => {
//     setError("");
//     setIsLoading(true);
//     try {
//       const newUser = await createUser({
//         role: "student",
//       });
//       if (!newUser) throw new Error("User creation failed");

//       await user?.update({
//         unsafeMetadata: { role: newUser.role },
//       });

//       // Go to instrument selection
//       router.replace("/onboarding/student");
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

//   // Teacher signup (requires invite code)
//   const handleTeacherSignup = async () => {
//     if (!inviteCode.trim()) {
//       setError("Please enter your teacher invite code");
//       return;
//     }

//     setError("");
//     setIsLoading(true);
//     try {
//       const newUser = await createUser({
//         inviteCode: inviteCode.trim(),
//       });
//       if (!newUser) throw new Error("User creation failed");

//       await user?.update({
//         unsafeMetadata: { role: newUser.role },
//       });

//       // Go to instrument and Zoom link setup
//       router.replace("/onboarding/teacher");
//     } catch (err: unknown) {
//       const errorMessage =
//         err instanceof Error
//           ? err.message
//           : "Invalid invite code. Please check with HR.";
//       setError(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white">
//       <Card className="w-full max-w-md">
//         <CardHeader>
//           <CardTitle className="text-2xl text-center">
//             Welcome to Music Rabbit! 🎵
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-6">
//           {/* First User - Auto Admin */}
//           {isFirstUser ? (
//             <div className="space-y-4 text-center">
//               <p className="text-muted-foreground">
//                 You are the first user --- you will be set up as{" "}
//                 <strong>Admin (HR)</strong>.
//               </p>
//               <Button
//                 onClick={handleAdminSetup}
//                 disabled={isLoading}
//                 className="w-full"
//               >
//                 {isLoading ? (
//                   <>
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     Creating admin account...
//                   </>
//                 ) : (
//                   "Setup as Admin"
//                 )}
//               </Button>
//             </div>
//           ) : !showRoleSelection ? (
//             /* Role Selection */
//             <div className="space-y-4">
//               <p className="text-center text-muted-foreground mb-4">
//                 What would you like to do?
//               </p>

//               <Button
//                 onClick={handleStudentSignup}
//                 disabled={isLoading}
//                 className="w-full h-auto py-4 flex flex-col items-start"
//                 variant="outline"
//               >
//                 <span className="text-lg font-semibold">
//                   Join as Student 🎓
//                 </span>
//                 <span className="text-sm text-muted-foreground font-normal">
//                   Learn music from expert teachers
//                 </span>
//               </Button>

//               <Button
//                 onClick={() => setShowRoleSelection(true)}
//                 disabled={isLoading}
//                 className="w-full h-auto py-4 flex flex-col items-start"
//                 variant="outline"
//               >
//                 <span className="text-lg font-semibold">
//                   Join as Teacher 🎵
//                 </span>
//                 <span className="text-sm text-muted-foreground font-normal">
//                   Teach music lessons (requires invite code)
//                 </span>
//               </Button>

//               {error && (
//                 <p className="text-sm text-destructive text-center">{error}</p>
//               )}
//             </div>
//           ) : (
//             /* Teacher Code Entry */
//             <div className="space-y-4">
//               <Button
//                 variant="ghost"
//                 onClick={() => {
//                   setShowRoleSelection(false);
//                   setError("");
//                   setInviteCode("");
//                 }}
//                 className="mb-2"
//               >
//                 ← Back
//               </Button>

//               <div className="text-center mb-4">
//                 <p className="font-semibold text-lg">Teacher Registration</p>
//                 <p className="text-sm text-muted-foreground">
//                   Enter the invite code provided by HR
//                 </p>
//               </div>

//               <Label htmlFor="inviteCode">Teacher Invite Code</Label>
//               <Input
//                 id="inviteCode"
//                 value={inviteCode}
//                 onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
//                 placeholder="e.g. ABC12345"
//                 autoFocus
//               />
//               {error && <p className="text-sm text-destructive">{error}</p>}
//               <Button
//                 onClick={handleTeacherSignup}
//                 disabled={isLoading || !inviteCode.trim()}
//                 className="w-full"
//               >
//                 {isLoading ? (
//                   <>
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     Verifying...
//                   </>
//                 ) : (
//                   "Continue as Teacher"
//                 )}
//               </Button>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
