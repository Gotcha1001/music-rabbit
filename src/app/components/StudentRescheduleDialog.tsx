// import { useState } from "react";
// import { useQuery, useMutation } from "convex/react";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Calendar } from "@/components/ui/calendar";
// import { toast } from "sonner";
// import { format, addWeeks } from "date-fns";
// import { Clock } from "lucide-react";
// import { api } from "../../../convex/_generated/api";
// import { Id } from "../../../convex/_generated/dataModel";

// interface StudentRescheduleDialogProps {
//   scheduleId: Id<"schedules">;
//   lessonId: string;
//   teacherId: Id<"users">;
//   duration: number;
//   currentDate: string;
//   currentTime: string;
// }

// export function StudentRescheduleDialog({
//   scheduleId,
//   lessonId,
//   teacherId,
//   duration,
//   currentDate,
//   currentTime,
// }: StudentRescheduleDialogProps) {
//   const [open, setOpen] = useState(false);
//   const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
//   const [selectedTime, setSelectedTime] = useState<string | undefined>();

//   // Get available slots for the selected date
//   const availableSlots = useQuery(
//     api.schedules.getAvailableSlots,
//     selectedDate
//       ? { teacherId, date: format(selectedDate, "yyyy-MM-dd"), duration }
//       : "skip",
//   );

//   const createRequest = useMutation(api.schedules.studentRequestReschedule);

//   const handleSubmit = async () => {
//     if (!selectedDate || !selectedTime) {
//       toast.error("Please select both date and time");
//       return;
//     }

//     try {
//       await createRequest({
//         scheduleId,
//         lessonId,
//         newDate: format(selectedDate, "yyyy-MM-dd"),
//         newTime: selectedTime,
//         reason: "Student requested time change",
//       });

//       toast.success("Reschedule request sent to teacher!");
//       setOpen(false);
//       setSelectedDate(undefined);
//       setSelectedTime(undefined);
//     } catch (err) {
//       toast.error("Failed to send request");
//       console.error(err);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <Button variant="outline" size="sm">
//           <Clock className="h-4 w-4 mr-2" />
//           Reschedule
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="max-w-2xl">
//         <DialogHeader>
//           <DialogTitle>Request Reschedule</DialogTitle>
//           <DialogDescription>
//             Currently scheduled for {format(new Date(currentDate), "PPP")} at{" "}
//             {currentTime}. Select a new date and available time slot.
//           </DialogDescription>
//         </DialogHeader>

//         <div className="grid gap-6">
//           {/* Calendar */}
//           <div className="flex justify-center">
//             <Calendar
//               mode="single"
//               selected={selectedDate}
//               onSelect={setSelectedDate}
//               disabled={(date) =>
//                 date < new Date() || date > addWeeks(new Date(), 4)
//               }
//               className="rounded-md border"
//             />
//           </div>

//           {/* Available Times */}
//           {selectedDate && (
//             <div>
//               <h3 className="font-semibold mb-3 text-purple-200">
//                 Available Times for {format(selectedDate, "PPP")}
//               </h3>
//               {availableSlots && availableSlots.length > 0 ? (
//                 <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
//                   {availableSlots.map((time) => (
//                     <Button
//                       key={time}
//                       variant={selectedTime === time ? "default" : "outline"}
//                       onClick={() => setSelectedTime(time)}
//                       className="w-full"
//                       size="sm"
//                     >
//                       {time}
//                     </Button>
//                   ))}
//                 </div>
//               ) : (
//                 <p className="text-muted-foreground text-center py-8">
//                   No available slots on this date
//                 </p>
//               )}
//             </div>
//           )}
//         </div>

//         <DialogFooter>
//           <Button variant="outline" onClick={() => setOpen(false)}>
//             Cancel
//           </Button>
//           <Button
//             disabled={!selectedDate || !selectedTime}
//             onClick={handleSubmit}
//           >
//             Send Request
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

// app/components/StudentRescheduleDialog.tsx
// app/components/StudentRescheduleDialog.tsx
// "use client";

// import { useState } from "react";
// import { useMutation, useQuery } from "convex/react";
// import { api } from "../../../convex/_generated/api";
// import { Id } from "../../../convex/_generated/dataModel";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import { toast } from "sonner";
// import { format } from "date-fns";

// interface StudentRescheduleDialogProps {
//   scheduleId: Id<"schedules">;
//   lessonId: string;
//   teacherId: Id<"users">;
//   currentDate: string; // yyyy-MM-dd
//   currentTime: string; // HH:mm
//   duration: number;
//   children: React.ReactNode; // For the trigger button
// }

// export function StudentRescheduleDialog({
//   scheduleId,
//   lessonId,
//   teacherId,
//   currentDate,
//   currentTime,
//   duration,
//   children,
// }: StudentRescheduleDialogProps) {
//   const [open, setOpen] = useState(false);
//   const [newTime, setNewTime] = useState("");
//   const [reason, setReason] = useState("");

//   const availableSlots =
//     useQuery(api.schedules.getAvailableSlots, {
//       teacherId,
//       date: currentDate,
//       duration,
//     }) ?? [];

//   const reschedule = useMutation(api.schedules.studentSelfRescheduleSameDay);

//   const handleSubmit = async () => {
//     if (!newTime) {
//       toast.error("Please select a new time");
//       return;
//     }

//     try {
//       await reschedule({
//         scheduleId,
//         lessonId,
//         newTime,
//         reason: reason.trim() || undefined,
//       });
//       toast.success("Lesson rescheduled! Teacher notified.");
//       setOpen(false);
//       setNewTime("");
//       setReason("");
//     } catch (error) {
//       toast.error((error as Error).message || "Failed to reschedule");
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>{children}</DialogTrigger>
//       <DialogContent className="sm:max-w-md">
//         <DialogHeader>
//           <DialogTitle>Reschedule Lesson</DialogTitle>
//         </DialogHeader>
//         <div className="space-y-4">
//           <p className="text-sm text-muted-foreground">
//             Current: {currentTime} on {format(new Date(currentDate), "PPP")}
//             <br />
//             Available same-day slots (teacher&apos;s time):
//           </p>
//           <div>
//             <Label>New Time</Label>
//             <Select value={newTime} onValueChange={setNewTime}>
//               <SelectTrigger>
//                 <SelectValue placeholder="Select a slot" />
//               </SelectTrigger>
//               <SelectContent>
//                 {availableSlots.map((slot) => (
//                   <SelectItem key={slot} value={slot}>
//                     {slot}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//           <div>
//             <Label>Reason (optional)</Label>
//             <Textarea
//               value={reason}
//               onChange={(e) => setReason(e.target.value)}
//               placeholder="Why are you rescheduling?"
//             />
//           </div>
//           <Button onClick={handleSubmit} className="w-full">
//             Confirm Reschedule
//           </Button>
//           <p className="text-xs text-muted-foreground">
//             Note: Must be at least 2 hours in advance. Teacher will see the
//             change on refresh.
//           </p>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
// "use client";

// import { useState } from "react";
// import { useQuery, useMutation } from "convex/react";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { toast } from "sonner";
// import { format } from "date-fns";
// import { Clock, AlertCircle, Calendar, Loader2 } from "lucide-react";
// import { api } from "../../../convex/_generated/api";
// import { Id } from "../../../convex/_generated/dataModel";
// import { Badge } from "@/components/ui/badge";

// interface StudentRescheduleDialogProps {
//   scheduleId: Id<"schedules">;
//   lessonId: string;
//   teacherId: Id<"users">;
//   duration: number;
//   currentDate: string;
//   currentTime: string;
//   children?: React.ReactNode;
// }

// export function StudentRescheduleDialog({
//   scheduleId,
//   lessonId,
//   teacherId,
//   duration,
//   currentDate,
//   currentTime,
//   children,
// }: StudentRescheduleDialogProps) {
//   const [open, setOpen] = useState(false);
//   const [selectedTime, setSelectedTime] = useState<string | undefined>();
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // Get available slots for today only
//   const availableSlots = useQuery(
//     api.schedules.getAvailableSlots,
//     open
//       ? {
//           teacherId,
//           date: currentDate,
//           duration,
//         }
//       : "skip",
//   );

//   const reschedule = useMutation(api.schedules.studentSelfRescheduleSameDay);

//   // Calculate if can reschedule (2+ hours advance)
//   const lessonDateTime = new Date(`${currentDate}T${currentTime}:00`);
//   const now = new Date();
//   const hoursToLesson =
//     (lessonDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

//   const canReschedule = hoursToLesson >= 2;

//   const handleSubmit = async () => {
//     if (!selectedTime) {
//       toast.error("Please select a time");
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       await reschedule({
//         scheduleId,
//         lessonId,
//         newTime: selectedTime,
//         reason: "Student requested same-day reschedule",
//       });
//       toast.success("Lesson rescheduled successfully!");
//       setOpen(false);
//       setSelectedTime(undefined);
//     } catch (err) {
//       const errorMessage =
//         err instanceof Error ? err.message : "Failed to reschedule";
//       toast.error(errorMessage);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         {children || (
//           <Button
//             variant="outline"
//             size="sm"
//             disabled={!canReschedule}
//             className="border-purple-600/50 text-purple-300 hover:bg-purple-900/30"
//           >
//             <Clock className="h-4 w-4 mr-2" />
//             Change Time
//           </Button>
//         )}
//       </DialogTrigger>
//       <DialogContent className="max-w-2xl bg-gradient-to-br from-purple-950 to-black border-purple-800/30">
//         <DialogHeader>
//           <DialogTitle className="text-purple-200 flex items-center gap-2 text-2xl">
//             <Calendar className="h-6 w-6" />
//             Change Lesson Time for Today
//           </DialogTitle>
//           <DialogDescription className="text-purple-300 text-base">
//             Currently scheduled for {format(lessonDateTime, "PPP")} at{" "}
//             {currentTime}
//           </DialogDescription>
//         </DialogHeader>

//         {!canReschedule ? (
//           <div className="flex items-start gap-3 p-6 bg-red-900/30 border border-red-700/50 rounded-lg">
//             <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
//             <div>
//               <p className="text-red-300 font-semibold mb-2 text-lg">
//                 Cannot Reschedule
//               </p>
//               <p className="text-red-200/80">
//                 Must be at least 2 hours in advance. Your lesson starts in{" "}
//                 {hoursToLesson.toFixed(1)} hours.
//               </p>
//             </div>
//           </div>
//         ) : (
//           <div className="space-y-6">
//             {/* Current Time Info */}
//             <div className="p-4 bg-purple-900/30 border border-purple-700/50 rounded-lg">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-purple-400">Current Time</p>
//                   <p className="text-2xl font-bold text-purple-200">
//                     {currentTime}
//                   </p>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-sm text-purple-400">Lesson Length</p>
//                   <p className="text-2xl font-bold text-purple-200">
//                     {duration} min
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Available Times */}
//             <div>
//               <h3 className="font-semibold mb-4 text-purple-200 flex items-center gap-2 text-lg">
//                 <Clock className="h-5 w-5" />
//                 Available Times Today
//               </h3>

//               {availableSlots === undefined ? (
//                 <div className="flex items-center justify-center py-12">
//                   <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
//                 </div>
//               ) : availableSlots && availableSlots.length > 0 ? (
//                 <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto p-2 bg-purple-950/20 rounded-lg border border-purple-800/30">
//                   {availableSlots.map((timeSlot) => (
//                     <Button
//                       key={timeSlot}
//                       variant={
//                         selectedTime === timeSlot ? "default" : "outline"
//                       }
//                       onClick={() => setSelectedTime(timeSlot)}
//                       className={
//                         selectedTime === timeSlot
//                           ? "bg-purple-700 hover:bg-purple-600 text-white border-purple-600 h-14 text-lg"
//                           : "border-purple-700/50 text-purple-300 hover:bg-purple-900/50 h-14 text-lg"
//                       }
//                     >
//                       {timeSlot}
//                     </Button>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="text-center py-16 text-purple-400/70 border border-purple-800/30 rounded-lg bg-purple-950/20">
//                   <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
//                   <p className="text-lg">No available slots today</p>
//                   <p className="text-sm mt-2">
//                     Teacher&apos;s schedule is full for the rest of the day
//                   </p>
//                 </div>
//               )}
//             </div>

//             {selectedTime && (
//               <div className="p-5 bg-green-900/20 border border-green-700/50 rounded-lg">
//                 <div className="flex items-center gap-3">
//                   <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
//                     <Clock className="h-5 w-5 text-green-400" />
//                   </div>
//                   <div>
//                     <p className="text-green-300 text-sm">New time selected</p>
//                     <p className="text-2xl font-bold text-green-200">
//                       {selectedTime}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         <DialogFooter className="gap-2">
//           <Button
//             variant="outline"
//             onClick={() => {
//               setOpen(false);
//               setSelectedTime(undefined);
//             }}
//             className="border-purple-700/50 text-purple-300 hover:bg-purple-900/30"
//           >
//             Cancel
//           </Button>
//           <Button
//             disabled={!canReschedule || !selectedTime || isSubmitting}
//             onClick={handleSubmit}
//             className="bg-purple-700 hover:bg-purple-600 text-white"
//           >
//             {isSubmitting ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Rescheduling...
//               </>
//             ) : (
//               <>
//                 <Clock className="mr-2 h-4 w-4" />
//                 Confirm Time Change
//               </>
//             )}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

// Save this as: app/components/StudentRescheduleDialog.tsx
// (Note: NOT "StudentResearchDialog" - that's a typo!)

"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { Clock, AlertCircle, Calendar, Loader2 } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface StudentRescheduleDialogProps {
  scheduleId: Id<"schedules">;
  lessonId: string;
  teacherId: Id<"users">;
  duration: number;
  currentDate: string;
  currentTime: string;
  children?: React.ReactNode;
}

export function StudentRescheduleDialog({
  scheduleId,
  lessonId,
  teacherId,
  duration,
  currentDate,
  currentTime,
  children,
}: StudentRescheduleDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get available slots for today only
  const availableSlots = useQuery(
    api.schedules.getAvailableSlots,
    open
      ? {
          teacherId,
          date: currentDate,
          duration,
        }
      : "skip",
  );

  const reschedule = useMutation(api.schedules.studentSelfRescheduleSameDay);

  // Calculate if can reschedule (2+ hours advance)
  const lessonDateTime = new Date(`${currentDate}T${currentTime}:00`);
  const now = new Date();
  const hoursToLesson =
    (lessonDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  const canReschedule = hoursToLesson >= 2;

  const handleSubmit = async () => {
    if (!selectedTime) {
      toast.error("Please select a time");
      return;
    }

    setIsSubmitting(true);
    try {
      await reschedule({
        scheduleId,
        lessonId,
        newTime: selectedTime,
        reason: "Student requested same-day reschedule",
      });
      toast.success("Lesson rescheduled successfully!");
      setOpen(false);
      setSelectedTime(undefined);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to reschedule";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="outline"
            size="sm"
            disabled={!canReschedule}
            className="border-purple-600/50 text-purple-300 hover:bg-purple-900/30"
          >
            <Clock className="h-4 w-4 mr-2" />
            Change Time
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-purple-950 to-black border-purple-800/30">
        <DialogHeader>
          <DialogTitle className="text-purple-200 flex items-center gap-2 text-2xl">
            <Calendar className="h-6 w-6" />
            Change Lesson Time for Today
          </DialogTitle>
          <DialogDescription className="text-purple-300 text-base">
            Currently scheduled for {format(lessonDateTime, "PPP")} at{" "}
            {currentTime}
          </DialogDescription>
        </DialogHeader>

        {!canReschedule ? (
          <div className="flex items-start gap-3 p-6 bg-red-900/30 border border-red-700/50 rounded-lg">
            <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 font-semibold mb-2 text-lg">
                Cannot Reschedule
              </p>
              <p className="text-red-200/80">
                Must be at least 2 hours in advance. Your lesson starts in{" "}
                {hoursToLesson.toFixed(1)} hours.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-purple-900/30 border border-purple-700/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-400">Current Time</p>
                  <p className="text-2xl font-bold text-purple-200">
                    {currentTime}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-purple-400">Lesson Length</p>
                  <p className="text-2xl font-bold text-purple-200">
                    {duration} min
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-purple-200 flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5" />
                Available Times Today
              </h3>

              {availableSlots === undefined ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
                </div>
              ) : availableSlots && availableSlots.length > 0 ? (
                <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto p-2 bg-purple-950/20 rounded-lg border border-purple-800/30">
                  {availableSlots.map((timeSlot) => (
                    <Button
                      key={timeSlot}
                      variant={
                        selectedTime === timeSlot ? "default" : "outline"
                      }
                      onClick={() => setSelectedTime(timeSlot)}
                      className={
                        selectedTime === timeSlot
                          ? "bg-purple-700 hover:bg-purple-600 text-white border-purple-600"
                          : "border-purple-700/50 text-purple-300 hover:bg-purple-900/50"
                      }
                    >
                      {timeSlot}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-purple-400/70 border border-purple-800/30 rounded-lg bg-purple-950/20">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg">No available slots today</p>
                </div>
              )}
            </div>

            {selectedTime && (
              <div className="p-5 bg-green-900/20 border border-green-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-green-300 text-sm">New time selected</p>
                    <p className="text-2xl font-bold text-green-200">
                      {selectedTime}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              setSelectedTime(undefined);
            }}
            className="border-purple-700/50 text-purple-300 hover:bg-purple-900/30"
          >
            Cancel
          </Button>
          <Button
            disabled={!canReschedule || !selectedTime || isSubmitting}
            onClick={handleSubmit}
            className="bg-purple-700 hover:bg-purple-600 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Rescheduling...
              </>
            ) : (
              <>
                <Clock className="mr-2 h-4 w-4" />
                Confirm Time Change
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
