"use client";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface NewUser {
  _id: Id<"users">;
  _creationTime: number;
  instrument?: string;
  clerkId: string;
  role: "admin" | "teacher" | "student";
  email: string;
  tokenIdentifier: string;
}

export default function Onboarding() {
  const { user } = useUser();
  const router = useRouter();
  const convexUser = useQuery(api.users.get);
  const userCount = useQuery(api.users.getCount);
  const createUser = useMutation(api.users.createOrGet);
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (convexUser === undefined || userCount === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (convexUser) {
    // Already created, redirect to dashboard
    router.push(`/dashboard/${convexUser.role}`);
    return null;
  }

  const isFirstUser = userCount === 0;

  const handleComplete = async () => {
    setError("");
    setIsLoading(true);
    try {
      const newUser = await createUser({
        inviteCode: isFirstUser ? undefined : inviteCode,
      });
      if (!newUser) {
        throw new Error("User creation failed");
      }

      await user?.update({
        unsafeMetadata: {
          role: newUser.role,
        },
      });
      if (newUser.role === "admin") {
        router.push("/dashboard/admin");
      } else {
        // Redirect to instrument selection
        router.push(`/onboarding/${newUser.role}`);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error during onboarding. Try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to Music Rabbit!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isFirstUser ? (
            <div>
              <p className="text-muted-foreground mb-4">
                You&apos;re the first user—setting up as Admin (HR).
              </p>
              <Button
                onClick={handleComplete}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Setup as Admin
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Label htmlFor="inviteCode">
                Enter your invite code (from HR)
              </Label>
              <Input
                id="inviteCode"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="e.g., ABC12345"
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                onClick={handleComplete}
                disabled={isLoading || !inviteCode}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Submit Code & Complete Setup
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
