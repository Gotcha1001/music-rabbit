// app/dashboard/teacher/profile/page.tsx
"use client";

import { useUserDetail } from "@/context/UserDetailContext";
import { useMutation } from "convex/react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

// Extend the type safely — this way (best practice)
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

  // Show loading while userDetail loads
  if (!userDetail) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (userDetail.role !== "teacher") {
    return (
      <div className="flex min-h-screen items-center justify-center text-destructive text-xl font-semibold">
        Unauthorized – Teachers Only
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
    <div className="container mx-auto p-6 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Teacher Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Instrument */}
              <FormField
                control={form.control}
                name="instrument"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instrument You Teach</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Piano, Guitar, Violin"
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
                    <FormLabel>Personal Zoom Link (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://zoom.us/j/1234567890"
                        type="url"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Students will join using this link when you start a lesson
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
                    <FormLabel>Your Timezone</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
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

              <Button type="submit" size="lg" className="w-full">
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
