// app/onboarding/teacher/page.tsx
"use client";

import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  "Flute",
  "Saxophone",
  "Trumpet",
  "Cello",
  "Bass",
  "Vocal",
  "Ukulele",
  "Clarinet",
  "Trombone",
  "Voice",
];

export default function TeacherInstrumentOnboarding() {
  const router = useRouter();
  const user = useQuery(api.users.get);
  const setUserInstrument = useMutation(api.users.setInstrument);
  const [instrument, setInstrument] = useState("");
  const [loading, setLoading] = useState(false);

  // If they already have an instrument → send them straight to the dashboard
  useEffect(() => {
    if (user?.instrument) {
      router.replace("/dashboard/teacher");
    }
  }, [user, router]);

  if (!user) return null; // still loading

  const handleSubmit = async () => {
    setLoading(true);
    await setUserInstrument({ instrument });
    router.push("/dashboard/teacher");
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">
            What instrument do you teach? 🎵
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="instrument">Instrument</Label>
            <Select value={instrument} onValueChange={setInstrument}>
              <SelectTrigger id="instrument">
                <SelectValue placeholder="Choose your instrument" />
              </SelectTrigger>
              <SelectContent>
                {instruments.map((i) => (
                  <SelectItem key={i} value={i}>
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!instrument || loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Continue to Dashboard"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
