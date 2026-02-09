// "use client";

// import { useMutation, useQuery } from "convex/react";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Loader2 } from "lucide-react";
// import { toast } from "sonner";
// import { api } from "../../../../convex/_generated/api";
// import { TimezoneSelector } from "@/app/components/TimezoneSelector";

// const instruments = [
//   "Piano",
//   "Guitar",
//   "Violin",
//   "Drums",
//   "Voice",
//   "Flute",
//   "Saxophone",
//   "Trumpet",
//   "Cello",
//   "Bass Guitar",
//   "Ukulele",
//   "Clarinet",
//   "Trombone",
//   "Singing",
//   "Keyboard",
//   "Drum Kit",
//   "Recorder",
//   "Other",
// ].sort();

// export default function TeacherOnboarding() {
//   const router = useRouter();
//   const user = useQuery(api.users.get);

//   const updateInstrument = useMutation(api.users.setInstrument);
//   const updateZoomLink = useMutation(api.users.setZoomLink);
//   const updateTimezone = useMutation(api.users.setTimezone);
//   const updateTeacherProfile = useMutation(api.users.updateTeacherProfile); // NEW

//   const [instrument, setInstrument] = useState("");
//   const [customInstrument, setCustomInstrument] = useState("");
//   const [zoomLink, setZoomLink] = useState("");
//   const [timezone, setTimezone] = useState("");
//   const [country, setCountry] = useState("");
//   const [state, setState] = useState("");

//   // NEW: Teacher Profile Fields
//   const [degree, setDegree] = useState("");
//   const [institution, setInstitution] = useState("");
//   const [bio, setBio] = useState("");
//   const [specialties, setSpecialties] = useState("");

//   const [isSaving, setIsSaving] = useState(false);

//   // Auto-detect timezone
//   useEffect(() => {
//     const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
//     if (detected) setTimezone(detected);
//   }, []);

//   // Redirect when ALL required fields are filled
//   useEffect(() => {
//     if (
//       user?.instrument?.trim() &&
//       user?.zoomLink?.trim() &&
//       user?.timezone?.trim() &&
//       user?.degree?.trim() &&
//       user?.bio?.trim()
//     ) {
//       router.replace("/dashboard/teacher");
//     }
//   }, [user, router]);

//   if (!user || user.role !== "teacher") {
//     return null;
//   }

//   const finalInstrument =
//     instrument === "Other" ? customInstrument.trim() || "Other" : instrument;

//   const handleSave = async () => {
//     if (!finalInstrument) return toast.error("Please select an instrument");
//     if (!zoomLink.trim()) return toast.error("Zoom link is required");
//     if (!timezone) return toast.error("Timezone is required");
//     if (!degree.trim()) return toast.error("Degree/qualification is required");
//     if (!bio.trim()) return toast.error("Please write a short bio");

//     setIsSaving(true);

//     try {
//       await Promise.all([
//         updateInstrument({ instrument: finalInstrument }),
//         updateZoomLink({ zoomLink: zoomLink.trim() }),
//         updateTimezone({
//           timezone,
//           country: country || undefined,
//           state: state || undefined,
//         }),
//         updateTeacherProfile({
//           degree: degree.trim(),
//           institution: institution.trim() || undefined,
//           bio: bio.trim(),
//           specialties: specialties
//             .split(",")
//             .map((s) => s.trim())
//             .filter(Boolean),
//         }),
//       ]);

//       toast.success("Welcome aboard! Your profile is complete and ready.");
//       router.replace("/dashboard/teacher");
//     } catch (e) {
//       console.error(e);
//       toast.error("Something went wrong. Please try again.");
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
//       <Card className="w-full max-w-3xl shadow-2xl">
//         <CardHeader className="text-center space-y-4 pb-8">
//           <div className="text-6xl">Welcome, Teacher!</div>
//           <CardTitle className="text-3xl font-bold text-purple-800">
//             Hi {user.name?.split(" ")[0] || "Teacher"}!
//           </CardTitle>
//           <p className="text-lg text-muted-foreground">
//             Just a few quick details to start teaching
//           </p>
//         </CardHeader>

//         <CardContent className="space-y-8 px-8 pb-12">
//           {/* Instrument Selection */}
//           <div className="space-y-3">
//             <Label className="text-lg font-semibold">
//               Instrument you teach
//             </Label>
//             <Select value={instrument} onValueChange={setInstrument}>
//               <SelectTrigger className="h-12 text-lg">
//                 <SelectValue placeholder="Choose your instrument..." />
//               </SelectTrigger>
//               <SelectContent>
//                 {instruments.map((i) => (
//                   <SelectItem key={i} value={i}>
//                     {i}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             {instrument === "Other" && (
//               <Input
//                 placeholder="e.g., Harp, Banjo, Oboe..."
//                 value={customInstrument}
//                 onChange={(e) => setCustomInstrument(e.target.value)}
//                 className="mt-3"
//               />
//             )}
//           </div>

//           {/* Zoom Link */}
//           <div className="space-y-3">
//             <Label className="text-lg font-semibold">Personal Zoom link</Label>
//             <Input
//               placeholder="https://zoom.us/j/1234567890?pwd=..."
//               value={zoomLink}
//               onChange={(e) => setZoomLink(e.target.value)}
//               className="h-12 text-lg font-mono"
//             />
//             <p className="text-sm text-muted-foreground">
//               Open Zoom → Meetings → Personal Meeting Room → Copy Invite Link
//             </p>
//           </div>

//           {/* Timezone */}
//           <div className="space-y-4 pt-6 border-t border-purple-200">
//             <Label className="text-lg font-semibold">
//               Where are you in the world?
//             </Label>
//             <p className="text-sm text-muted-foreground -mt-2">
//               This helps us show your time to students in different timezones
//             </p>

//             <TimezoneSelector
//               value={timezone}
//               onTimezoneChange={setTimezone}
//               onCountryChange={setCountry}
//               onStateChange={setState}
//               showCountryState={true}
//             />

//             {timezone && (
//               <p className="text-sm text-muted-foreground">
//                 Detected: <strong>{timezone}</strong>
//               </p>
//             )}
//           </div>

//           {/* NEW: Teacher Profile Section */}
//           <div className="space-y-6 pt-8 border-t-2 border-purple-300 bg-purple-50/50 rounded-xl p-6 -mx-8">
//             <h3 className="text-2xl font-bold text-purple-800 text-center">
//               Your Teaching Profile
//             </h3>
//             <p className="text-center text-muted-foreground">
//               Students will see this on their dashboard
//             </p>

//             <div className="grid md:grid-cols-2 gap-6">
//               <div>
//                 <Label>Degree / Qualification *</Label>
//                 <Input
//                   placeholder="e.g. Bachelor of Music, Trinity Grade 8"
//                   value={degree}
//                   onChange={(e) => setDegree(e.target.value)}
//                   className="mt-2"
//                 />
//               </div>
//               <div>
//                 <Label>Institution</Label>
//                 <Input
//                   placeholder="e.g. Berklee College, Royal Academy"
//                   value={institution}
//                   onChange={(e) => setInstitution(e.target.value)}
//                   className="mt-2"
//                 />
//               </div>
//             </div>

//             <div>
//               <Label>Tell students about yourself (bio) *</Label>
//               <Textarea
//                 placeholder="I’ve been teaching for 10 years... I love helping students discover their musical voice..."
//                 rows={4}
//                 value={bio}
//                 onChange={(e) => setBio(e.target.value)}
//                 className="mt-2"
//               />
//             </div>

//             <div>
//               <Label>Specialties (comma-separated)</Label>
//               <Input
//                 placeholder="Jazz Improvisation, Classical, Pop Piano, Exam Prep, Music Theory..."
//                 value={specialties}
//                 onChange={(e) => setSpecialties(e.target.value)}
//                 className="mt-2"
//               />
//             </div>
//           </div>

//           {/* Save Button */}
//           <Button
//             onClick={handleSave}
//             disabled={
//               isSaving ||
//               !finalInstrument ||
//               !zoomLink.trim() ||
//               !timezone ||
//               !degree.trim() ||
//               !bio.trim()
//             }
//             className="w-full h-16 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
//           >
//             {isSaving ? (
//               <>
//                 <Loader2 className="mr-4 h-8 w-8 animate-spin" />
//                 Saving Your Profile...
//               </>
//             ) : (
//               "Complete Profile & Start Teaching!"
//             )}
//           </Button>

//           <p className="text-center text-xs text-muted-foreground">
//             You can update these anytime in Settings
//           </p>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
"use client";

import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import { TimezoneSelector } from "@/app/components/TimezoneSelector";

const instruments = [
  "Piano",
  "Guitar",
  "Violin",
  "Drums",
  "Voice",
  "Flute",
  "Saxophone",
  "Trumpet",
  "Cello",
  "Bass Guitar",
  "Ukulele",
  "Clarinet",
  "Trombone",
  "Singing",
  "Keyboard",
  "Drum Kit",
  "Recorder",
  "Other",
].sort();

// Common country codes (same list as student page)
const countryCodes = [
  { value: "+27", label: "+27 (South Africa)" },
  { value: "+1", label: "+1 (USA / Canada)" },
  { value: "+44", label: "+44 (United Kingdom)" },
  { value: "+91", label: "+91 (India)" },
  { value: "+61", label: "+61 (Australia)" },
  { value: "+49", label: "+49 (Germany)" },
  { value: "+33", label: "+33 (France)" },
];

export default function TeacherOnboarding() {
  const router = useRouter();
  const user = useQuery(api.users.get);

  const updateInstrument = useMutation(api.users.setInstrument);
  const updateZoomLink = useMutation(api.users.setZoomLink);
  const updateTimezone = useMutation(api.users.setTimezone);
  const updateTeacherProfile = useMutation(api.users.updateTeacherProfile);
  const setContactInfo = useMutation(api.users.setContactInfo); // ← NEW

  const [instrument, setInstrument] = useState("");
  const [customInstrument, setCustomInstrument] = useState("");
  const [zoomLink, setZoomLink] = useState("");
  const [timezone, setTimezone] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");

  // Teacher Profile Fields
  const [degree, setDegree] = useState("");
  const [institution, setInstitution] = useState("");
  const [bio, setBio] = useState("");
  const [specialties, setSpecialties] = useState("");

  // NEW: Required Contact Phone
  const [contactCountryCode, setContactCountryCode] = useState("");
  const [contactPhoneNumber, setContactPhoneNumber] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  // Auto-detect timezone
  useEffect(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (detected) setTimezone(detected);
  }, []);

  // Redirect when ALL required fields are filled
  useEffect(() => {
    if (
      user?.instrument?.trim() &&
      user?.zoomLink?.trim() &&
      user?.timezone?.trim() &&
      user?.degree?.trim() &&
      user?.bio?.trim() &&
      user?.countryCode && // ← NEW
      user?.phoneNumber // ← NEW
    ) {
      router.replace("/dashboard/teacher");
    }
  }, [user, router]);

  if (!user || user.role !== "teacher") {
    return null;
  }

  const finalInstrument =
    instrument === "Other" ? customInstrument.trim() || "Other" : instrument;

  const handleSave = async () => {
    // Validation
    if (!finalInstrument) return toast.error("Please select an instrument");
    if (!zoomLink.trim()) return toast.error("Zoom link is required");
    if (!timezone) return toast.error("Timezone is required");
    if (!degree.trim()) return toast.error("Degree/qualification is required");
    if (!bio.trim()) return toast.error("Please write a short bio");
    if (!contactCountryCode)
      return toast.error("Please select your contact country code");
    if (!contactPhoneNumber || contactPhoneNumber.length < 7) {
      return toast.error(
        "Please enter a valid contact phone number (at least 7 digits)",
      );
    }

    setIsSaving(true);

    try {
      await Promise.all([
        updateInstrument({ instrument: finalInstrument }),
        updateZoomLink({ zoomLink: zoomLink.trim() }),
        updateTimezone({
          timezone,
          country: country || undefined,
          state: state || undefined,
        }),
        updateTeacherProfile({
          degree: degree.trim(),
          institution: institution.trim() || undefined,
          bio: bio.trim(),
          specialties: specialties
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
        setContactInfo({
          countryCode: contactCountryCode,
          phoneNumber: contactPhoneNumber,
        }),
      ]);

      toast.success("Welcome aboard! Your profile is complete and ready.");
      router.replace("/dashboard/teacher");
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const isFormComplete =
    finalInstrument &&
    zoomLink.trim() &&
    timezone &&
    degree.trim() &&
    bio.trim() &&
    contactCountryCode &&
    contactPhoneNumber.length >= 7;

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Card className="w-full max-w-3xl shadow-2xl">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="text-6xl">Welcome, Teacher!</div>
          <CardTitle className="text-3xl font-bold text-purple-800">
            Hi {user.name?.split(" ")[0] || "Teacher"}!
          </CardTitle>
          <p className="text-lg text-muted-foreground">
            Just a few quick details to start teaching
          </p>
        </CardHeader>

        <CardContent className="space-y-8 px-8 pb-12">
          {/* Instrument Selection */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold">
              Instrument you teach
            </Label>
            <Select value={instrument} onValueChange={setInstrument}>
              <SelectTrigger className="h-12 text-lg">
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
            {instrument === "Other" && (
              <Input
                placeholder="e.g., Harp, Banjo, Oboe..."
                value={customInstrument}
                onChange={(e) => setCustomInstrument(e.target.value)}
                className="mt-3"
              />
            )}
          </div>

          {/* Zoom Link */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold">Personal Zoom link</Label>
            <Input
              placeholder="https://zoom.us/j/1234567890?pwd=..."
              value={zoomLink}
              onChange={(e) => setZoomLink(e.target.value)}
              className="h-12 text-lg font-mono"
            />
            <p className="text-sm text-muted-foreground">
              Open Zoom → Meetings → Personal Meeting Room → Copy Invite Link
            </p>
          </div>

          {/* NEW: Required Contact Phone */}
          <div className="space-y-4 pt-6 border-t border-purple-200">
            <Label className="text-lg font-semibold">
              Your Contact Phone Number <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-muted-foreground -mt-2">
              For admin/HR support only — not visible to students
            </p>

            <div className="grid grid-cols-[160px,1fr] gap-4">
              <div>
                <Select
                  value={contactCountryCode}
                  onValueChange={setContactCountryCode}
                >
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
                  value={contactPhoneNumber}
                  onChange={(e) =>
                    setContactPhoneNumber(e.target.value.replace(/\D/g, ""))
                  }
                  maxLength={15}
                  className={
                    contactPhoneNumber && contactPhoneNumber.length < 7
                      ? "border-red-500"
                      : ""
                  }
                />
                {contactPhoneNumber && contactPhoneNumber.length < 7 && (
                  <p className="text-xs text-red-500 mt-1">
                    At least 7 digits required
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Timezone */}
          <div className="space-y-4 pt-6 border-t border-purple-200">
            <Label className="text-lg font-semibold">
              Where are you in the world?
            </Label>
            <p className="text-sm text-muted-foreground -mt-2">
              This helps us show your time to students in different timezones
            </p>

            <TimezoneSelector
              value={timezone}
              onTimezoneChange={setTimezone}
              onCountryChange={setCountry}
              onStateChange={setState}
              showCountryState={true}
            />

            {timezone && (
              <p className="text-sm text-muted-foreground">
                Detected: <strong>{timezone}</strong>
              </p>
            )}
          </div>

          {/* Teacher Profile Section */}
          <div className="space-y-6 pt-8 border-t-2 border-purple-300 bg-purple-50/50 rounded-xl p-6 -mx-8">
            <h3 className="text-2xl font-bold text-purple-800 text-center">
              Your Teaching Profile
            </h3>
            <p className="text-center text-muted-foreground">
              Students will see this on their dashboard
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label>Degree / Qualification *</Label>
                <Input
                  placeholder="e.g. Bachelor of Music, Trinity Grade 8"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Institution</Label>
                <Input
                  placeholder="e.g. Berklee College, Royal Academy"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label>Tell students about yourself (bio) *</Label>
              <Textarea
                placeholder="I’ve been teaching for 10 years... I love helping students discover their musical voice..."
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Specialties (comma-separated)</Label>
              <Input
                placeholder="Jazz Improvisation, Classical, Pop Piano, Exam Prep, Music Theory..."
                value={specialties}
                onChange={(e) => setSpecialties(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isSaving || !isFormComplete}
            className="w-full h-16 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-4 h-8 w-8 animate-spin" />
                Saving Your Profile...
              </>
            ) : (
              "Complete Profile & Start Teaching!"
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            You can update these anytime in Settings
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
