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

// Common country codes — feel free to add more
const countryCodes = [
  { value: "+27", label: "+27 (South Africa)" },
  { value: "+1", label: "+1 (USA / Canada)" },
  { value: "+44", label: "+44 (United Kingdom)" },
  { value: "+91", label: "+91 (India)" },
  { value: "+61", label: "+61 (Australia)" },
  { value: "+49", label: "+49 (Germany)" },
  { value: "+33", label: "+33 (France)" },
];

export default function StudentInstrumentOnboarding() {
  const { user } = useUser();
  const router = useRouter();

  const convexUser = useQuery(api.users.get);
  const setInstrument = useMutation(api.users.setInstrument);
  const setTimezone = useMutation(api.users.setTimezone);
  const setContactInfo = useMutation(api.users.setContactInfo); // ← NEW

  const [instrumentValue, setInstrumentValue] = useState("");
  const [customInstrument, setCustomInstrument] = useState("");
  const [selectedTimezone, setSelectedTimezone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");

  // NEW: WhatsApp fields
  const [countryCode, setCountryCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already onboarded
  useEffect(() => {
    if (!convexUser) return;
    if (convexUser.role !== "student") {
      router.replace("/");
      return;
    }
    // You can decide if you want to require phone here too
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
    // Validation
    if (!finalInstrument) {
      toast.error("Please select your instrument");
      return;
    }
    if (!selectedTimezone) {
      toast.error("Please select your timezone");
      return;
    }
    if (!countryCode) {
      toast.error("Please select your WhatsApp country code");
      return;
    }
    if (!phoneNumber || phoneNumber.length < 7) {
      toast.error("Please enter a valid WhatsApp number (at least 7 digits)");
      return;
    }

    setIsSubmitting(true);

    try {
      await Promise.all([
        setInstrument({ instrument: finalInstrument }),
        setTimezone({
          timezone: selectedTimezone,
          country: selectedCountry || undefined,
          state: selectedState || undefined,
        }),
        setContactInfo({
          countryCode,
          phoneNumber,
        }),
      ]);

      // Optional: Sync to Clerk (you can add phone here too if you want)
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

  const isFormComplete =
    finalInstrument &&
    selectedTimezone &&
    countryCode &&
    phoneNumber.length >= 7;

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Card className="w-full max-w-2xl shadow-2xl border-purple-200">
        <CardHeader className="text-center pb-8">
          <div className="text-6xl mb-4">Welcome to Music Rabbit!</div>
          <CardTitle className="text-3xl font-bold text-purple-800">
            Hi {user?.firstName || "Musician"}!
          </CardTitle>
          <p className="text-lg text-muted-foreground mt-3">
            Just a few quick steps and you&apos;re ready to start learning
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

          {/* NEW: WhatsApp Number – REQUIRED */}
          <div className="space-y-4 pt-6 border-t border-purple-200">
            <Label className="text-lg font-semibold">
              Your WhatsApp Number <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-muted-foreground -mt-2">
              Your teacher may use this to contact you if you miss a lesson
            </p>

            <div className="grid grid-cols-[160px,1fr] gap-4">
              <div>
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Code" />
                  </SelectTrigger>
                  <SelectContent>
                    {countryCodes.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Input
                  type="tel"
                  placeholder="e.g. 821234567"
                  value={phoneNumber}
                  onChange={(e) =>
                    setPhoneNumber(e.target.value.replace(/\D/g, ""))
                  }
                  maxLength={15}
                  className={
                    phoneNumber && phoneNumber.length < 7
                      ? "border-red-500"
                      : ""
                  }
                />
                {phoneNumber && phoneNumber.length < 7 && (
                  <p className="text-xs text-red-500 mt-1">
                    At least 7 digits required
                  </p>
                )}
              </div>
            </div>
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
            disabled={isSubmitting || !isFormComplete}
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
