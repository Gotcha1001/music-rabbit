// // components/LiveClock.tsx
// "use client";

// import { useState, useEffect } from "react";
// import { Clock, Calendar } from "lucide-react";
// import { format } from "date-fns";

// export default function LiveClock() {
//   const [currentTime, setCurrentTime] = useState(new Date());

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentTime(new Date());
//     }, 1000);

//     return () => clearInterval(timer);
//   }, []);

//   return (
//     <div className="flex items-center gap-4 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg shadow-sm">
//       <div className="flex items-center gap-2">
//         <Clock className="h-5 w-5 text-blue-600" />
//         <div className="flex flex-col">
//           <span className="text-xs text-muted-foreground font-medium">
//             Current Time
//           </span>
//           <span className="text-lg font-bold text-blue-900">
//             {format(currentTime, "HH:mm:ss")}
//           </span>
//         </div>
//       </div>

//       <div className="h-8 w-px bg-blue-200" />

//       <div className="flex items-center gap-2">
//         <Calendar className="h-5 w-5 text-purple-600" />
//         <div className="flex flex-col">
//           <span className="text-xs text-muted-foreground font-medium">
//             Today&apos;s Date
//           </span>
//           <span className="text-lg font-bold text-purple-900">
//             {format(currentTime, "MMM dd, yyyy")}
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// }
// "use client";

// import { useState, useEffect } from "react";
// import { Clock, Calendar } from "lucide-react";
// import { format } from "date-fns";

// export default function LiveClock() {
//   const [currentTime, setCurrentTime] = useState(new Date());

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentTime(new Date());
//     }, 1000);

//     return () => clearInterval(timer);
//   }, []);

//   return (
//     <div className="flex items-center gap-4 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg shadow-sm">
//       <div className="flex items-center gap-2">
//         <Clock className="h-5 w-5 text-blue-600" />
//         <div className="flex flex-col">
//           <span className="text-xs text-muted-foreground font-medium">
//             Current Time
//           </span>
//           <span className="text-lg font-bold text-blue-900">
//             {format(currentTime, "HH:mm:ss")}
//           </span>
//         </div>
//       </div>

//       <div className="h-8 w-px bg-blue-200" />

//       <div className="flex items-center gap-2">
//         <Calendar className="h-5 w-5 text-purple-600" />
//         <div className="flex flex-col">
//           <span className="text-xs text-muted-foreground font-medium">
//             Today&apos;s Date
//           </span>
//           <span className="text-lg font-bold text-purple-900">
//             {format(currentTime, "MMM dd, yyyy")}
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// }

// app/components/LiveClock.tsx   (or .tsx wherever you keep it)
"use client";

import { useState, useEffect } from "react";
import { Clock, Calendar, Globe } from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { formatTimeInTimezone, getTimezoneAbbr } from "@/lib/timezoneUtils";
import dynamic from "next/dynamic";
import type { Id } from "../../../convex/_generated/dataModel";

interface LiveClockProps {
  showOtherUserTimezone?: boolean;
  otherUserId?: string; // We'll use this instead of passing raw Id
}

function LiveClockInner({
  showOtherUserTimezone = false,
  otherUserId,
}: LiveClockProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Current logged-in user
  const currentUser = useQuery(api.users.get);

  // Other user (e.g., student when teacher is viewing)
  const otherUser = useQuery(
    api.users.getById,
    otherUserId
      ? { id: otherUserId as Id<"users"> } // Proper type assertion
      : "skip" // Skip query if no ID
  );

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const userTimezone = currentUser?.timezone || "UTC";
  const otherTimezone = otherUser?.timezone || "UTC";

  const userTimeStr = formatTimeInTimezone(
    currentTime,
    userTimezone,
    "HH:mm:ss"
  );
  const userAbbrStr = getTimezoneAbbr(userTimezone);

  const otherTimeStr =
    showOtherUserTimezone && otherUser
      ? formatTimeInTimezone(currentTime, otherTimezone, "HH:mm:ss")
      : null;

  const otherAbbrStr =
    showOtherUserTimezone && otherUser ? getTimezoneAbbr(otherTimezone) : null;

  return (
    <div className="flex flex-col gap-6 px-6 py-4 rounded-xl shadow-lg border border-purple-900/40 bg-[radial-gradient(circle_at_top_left,_#1a001f,_#000000)] backdrop-blur-sm">
      {/* YOUR TIME */}
      <div className="flex items-center gap-3">
        <Clock className="h-6 w-6 text-purple-400 drop-shadow-[0_0_6px_#6b21a8]" />
        <div className="flex flex-col">
          <span className="text-xs text-purple-300/70 tracking-wide">
            Your Time
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-purple-200 drop-shadow-[0_0_4px_#581c87]">
              {userTimeStr}
            </span>
            <span className="text-xs text-purple-400/80 font-mono">
              {userAbbrStr}
            </span>
          </div>
          {currentUser?.country && (
            <span className="text-xs text-purple-300/60 mt-1">
              Location: {currentUser.country}
              {currentUser.state && `, ${currentUser.state}`}
            </span>
          )}
        </div>
      </div>

      {/* DATE */}
      <div className="flex items-center gap-3">
        <Calendar className="h-6 w-6 text-purple-400 drop-shadow-[0_0_6px_#6b21a8]" />
        <div className="flex flex-col">
          <span className="text-xs text-purple-300/70 tracking-wide">
            Today
          </span>
          <span className="text-xl font-bold text-purple-200 drop-shadow-[0_0_4px_#581c87]">
            {format(currentTime, "MMM dd, yyyy")}
          </span>
        </div>
      </div>

      {/* OTHER USER'S TIME (Student/Teacher view) */}
      {showOtherUserTimezone && otherUser && otherTimeStr && (
        <>
          <div className="h-px bg-purple-900/60" />
          <div className="flex items-center gap-3">
            <Globe className="h-6 w-6 text-purple-400 drop-shadow-[0_0_6px_#6b21a8]" />
            <div className="flex flex-col">
              <span className="text-xs text-purple-300/70 tracking-wide">
                {otherUser.role === "student" ? "Student's Time" : "Their Time"}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-purple-200 drop-shadow-[0_0_4px_#581c87]">
                  {otherTimeStr}
                </span>
                <span className="text-xs text-purple-400/80 font-mono">
                  {otherAbbrStr}
                </span>
              </div>
              {otherUser.country && (
                <span className="text-xs text-purple-300/60 mt-1">
                  Location: {otherUser.country}
                  {otherUser.state && `, ${otherUser.state}`}
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Dynamic import to avoid SSR issues with real-time clock
const LiveClock = dynamic(() => Promise.resolve(LiveClockInner), {
  ssr: false,
  loading: () => (
    <div className="flex items-center gap-6 px-6 py-4 rounded-xl bg-purple-950/20 border border-purple-900/40">
      <Clock className="h-6 w-6 text-purple-400/50 animate-pulse" />
      <span className="text-xl font-bold text-purple-300/50">
        Loading time...
      </span>
    </div>
  ),
});

export default LiveClock;
