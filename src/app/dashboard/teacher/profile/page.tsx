// app/dashboard/teacher/profile/page.tsx
"use client";

import { useUserDetail } from "@/context/UserDetailContext";
import { useMutation } from "convex/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { TIMEZONE_LIST } from "@/lib/timezoneUtils";
import { Loader2 } from "lucide-react";
import { api } from "../../../../../convex/_generated/api";

/* ─────────────────────────────────────────────────────────────
   !important overrides
   Light = default  |  Dark = .dark prefix
───────────────────────────────────────────────────────────── */
const PROFILE_STYLES = `
  .prof-page                    { background: #ffffff !important; }
  .dark .prof-page              { background: linear-gradient(to bottom, #000000, #1a0030, #000000) !important; }

  .prof-title                   { color: hsl(var(--foreground)) !important; }
  .dark .prof-title             { color: #ede9fe !important; }

  /* Card */
  .prof-card                    { background: #ffffff !important; border-color: hsl(var(--border)) !important; box-shadow: 0 2px 12px rgba(0,0,0,0.07) !important; }
  .dark .prof-card              { background: hsl(270 90% 5%) !important; border-color: rgba(109,40,217,0.3) !important; box-shadow: 0 0 24px rgba(139,92,246,0.1) !important; }

  .prof-card-title              { color: hsl(var(--foreground)) !important; }
  .dark .prof-card-title        { color: #ddd6fe !important; }

  /* Form labels */
  .prof-label                   { color: hsl(var(--foreground)) !important; }
  .dark .prof-label             { color: #c4b5fd !important; }

  /* Inputs */
  .prof-input                   { background: #ffffff !important; border-color: hsl(var(--border)) !important; color: hsl(var(--foreground)) !important; }
  .prof-input:focus             { border-color: hsl(var(--primary)) !important; box-shadow: 0 0 0 2px hsl(var(--primary)/0.2) !important; }
  .prof-input::placeholder      { color: hsl(var(--muted-foreground)) !important; }
  .dark .prof-input             { background: hsl(270 80% 6%) !important; border-color: rgba(109,40,217,0.4) !important; color: #ede9fe !important; }
  .dark .prof-input::placeholder { color: rgba(196,181,253,0.5) !important; }

  /* Helper text */
  .prof-hint                    { color: hsl(var(--muted-foreground)) !important; }
  .dark .prof-hint              { color: #a78bfa !important; }

  /* Select trigger */
  .prof-select-trigger          { background: #ffffff !important; border-color: hsl(var(--border)) !important; color: hsl(var(--foreground)) !important; }
  .dark .prof-select-trigger    { background: hsl(270 80% 6%) !important; border-color: rgba(109,40,217,0.4) !important; color: #ede9fe !important; }

  /* Save button */
  .prof-save-btn                { background: hsl(var(--primary)) !important; color: #ffffff !important; }
  .prof-save-btn:hover          { background: hsl(var(--primary)/0.9) !important; }
  .dark .prof-save-btn          { background: #7c3aed !important; }
  .dark .prof-save-btn:hover    { background: #6d28d9 !important; }
`;

type UserDetailWithExtras = ReturnType<typeof useUserDetail>["userDetail"] & {
  instrument?: string;
  zoomLink?: string;
  timezone?: string;
  country?: string;
  state?: string;
};

const profileSchema = z.object({
  instrument: z.string().min(1, "Instrument is required"),
  zoomLink: z.string().url("Must be a valid URL").or(z.literal("")),
  timezone: z.string().min(1, "Timezone is required"),
});

export default function TeacherProfile() {
  const { userDetail } = useUserDetail() as {
    userDetail: UserDetailWithExtras | null;
  };

  const setInstrument = useMutation(api.users.setInstrument);
  const setZoomLink = useMutation(api.users.setZoomLink);
  const setTimezone = useMutation(api.users.setTimezone);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      instrument: userDetail?.instrument ?? "",
      zoomLink: userDetail?.zoomLink ?? "",
      timezone: userDetail?.timezone ?? "",
    },
  });

  if (!userDetail) {
    return (
      <div className="prof-page min-h-screen flex items-center justify-center">
        <style>{PROFILE_STYLES}</style>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (userDetail.role !== "teacher") {
    return (
      <div className="prof-page min-h-screen flex items-center justify-center">
        <style>{PROFILE_STYLES}</style>
        <p className="text-destructive text-xl font-semibold">
          Unauthorized – Teachers Only
        </p>
      </div>
    );
  }

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    try {
      await Promise.all([
        setInstrument({ instrument: data.instrument }),
        data.zoomLink && setZoomLink({ zoomLink: data.zoomLink }),
        setTimezone({ timezone: data.timezone }),
      ]);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="prof-page min-h-screen">
      <style>{PROFILE_STYLES}</style>
      <div className="container mx-auto p-4 sm:p-6 max-w-3xl">
        <h1 className="prof-title text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 font-serif">
          My Profile
        </h1>

        <div className="prof-card rounded-xl border-2 overflow-hidden shadow-sm">
          {/* Card header */}
          <div className="p-4 sm:p-6 border-b border-inherit">
            <h2 className="prof-card-title text-base sm:text-lg font-bold">
              Teacher Settings
            </h2>
          </div>

          {/* Card body */}
          <div className="p-4 sm:p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5 sm:space-y-6"
              >
                {/* Instrument */}
                <FormField
                  control={form.control}
                  name="instrument"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="prof-label text-sm sm:text-base">
                        Instrument You Teach
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Piano, Guitar, Violin"
                          className="prof-input"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Zoom Link */}
                <FormField
                  control={form.control}
                  name="zoomLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="prof-label text-sm sm:text-base">
                        Personal Zoom Link (optional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://zoom.us/j/1234567890"
                          type="url"
                          className="prof-input"
                          {...field}
                        />
                      </FormControl>
                      <p className="prof-hint text-xs mt-1">
                        Students will join using this link when you start a
                        lesson
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Timezone */}
                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="prof-label text-sm sm:text-base">
                        Your Timezone
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="prof-select-trigger">
                            <SelectValue placeholder="Select your timezone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-96">
                          {TIMEZONE_LIST.map((tz) => (
                            <SelectItem key={tz.value} value={tz.value}>
                              {tz.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <button
                  type="submit"
                  className="prof-save-btn w-full py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  Save Changes
                </button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
