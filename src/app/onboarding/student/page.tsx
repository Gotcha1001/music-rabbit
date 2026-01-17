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
import { toast } from "sonner";
import { TimezoneSelector } from "@/app/components/TimezoneSelector";

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
  "Other",
].sort();

export default function StudentInstrumentOnboarding() {
  const { user } = useUser();
  const router = useRouter();

  const convexUser = useQuery(api.users.get);
  const setInstrument = useMutation(api.users.setInstrument);
  const setTimezone = useMutation(api.users.setTimezone);

  const [instrumentValue, setInstrumentValue] = useState("");
  const [customInstrument, setCustomInstrument] = useState("");
  const [selectedTimezone, setSelectedTimezone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already onboarded
  useEffect(() => {
    if (!convexUser) return;
    if (convexUser.role !== "student") {
      router.replace("/");
      return;
    }
    if (convexUser.instrument && convexUser.timezone) {
      router.replace("/dashboard/student");
    }
  }, [convexUser, router]);

  if (!convexUser || convexUser.instrument) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
      </div>
    );
  }

  const finalInstrument =
    instrumentValue === "Other"
      ? customInstrument.trim() || "Other"
      : instrumentValue;

  const handleContinue = async () => {
    if (!finalInstrument) {
      toast.error("Please select your instrument");
      return;
    }
    if (!selectedTimezone) {
      toast.error("Please select your timezone");
      return;
    }

    setIsSubmitting(true);

    try {
      // Save both in parallel
      await Promise.all([
        setInstrument({ instrument: finalInstrument }),
        setTimezone({
          timezone: selectedTimezone,
          country: selectedCountry || undefined,
          state: selectedState || undefined,
        }),
      ]);

      // Optional: Sync to Clerk
      await user?.update({
        unsafeMetadata: {
          ...(user?.unsafeMetadata || {}),
          instrument: finalInstrument,
          timezone: selectedTimezone,
        },
      });

      toast.success("Welcome to Music Rabbit! Let's make music!");
      router.replace("/dashboard/student");
    } catch (err) {
      console.error("Onboarding failed:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Card className="w-full max-w-2xl shadow-2xl border-purple-200">
        <CardHeader className="text-center pb-8">
          <div className="text-6xl mb-4">Welcome to Music Rabbit!</div>
          <CardTitle className="text-3xl font-bold text-purple-800">
            Hi {user?.firstName || "Musician"}!
          </CardTitle>
          <p className="text-lg text-muted-foreground mt-3">
            Just two quick steps and you&apos;re ready to start learning
          </p>
        </CardHeader>

        <CardContent className="space-y-8 px-8 pb-10">
          {/* Instrument Selection */}
          <div className="space-y-4">
            <Label htmlFor="instrument" className="text-lg font-semibold">
              What instrument would you like to learn?
            </Label>

            <Select value={instrumentValue} onValueChange={setInstrumentValue}>
              <SelectTrigger id="instrument" className="text-lg h-14">
                <SelectValue placeholder="Choose your instrument..." />
              </SelectTrigger>
              <SelectContent>
                {instruments.map((inst) => (
                  <SelectItem key={inst} value={inst} className="text-base">
                    {inst}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {instrumentValue === "Other" && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <Label htmlFor="custom-instrument">Your instrument</Label>
                <Input
                  id="custom-instrument"
                  placeholder="e.g., Bagpipes, Harp, Didgeridoo..."
                  value={customInstrument}
                  onChange={(e) => setCustomInstrument(e.target.value)}
                  className="mt-2 text-lg"
                />
              </div>
            )}
          </div>

          {/* Timezone Selection */}
          <div className="space-y-4 pt-6 border-t border-purple-200">
            <Label className="text-lg font-semibold">
              Where in the world are you?
            </Label>
            <p className="text-sm text-muted-foreground -mt-2">
              This helps us schedule lessons at the perfect time for you
            </p>

            <TimezoneSelector
              value={selectedTimezone}
              onTimezoneChange={setSelectedTimezone}
              onCountryChange={setSelectedCountry}
              onStateChange={setSelectedState}
              showCountryState={true}
            />
          </div>

          {/* Continue Button */}
          <Button
            onClick={handleContinue}
            disabled={isSubmitting || !finalInstrument || !selectedTimezone}
            className="w-full text-lg h-14 font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                Setting up your account...
              </>
            ) : (
              <>Start Learning Music!</>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            You can change these anytime in your profile
          </p>
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
