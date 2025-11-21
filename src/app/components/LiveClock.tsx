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
import { Clock, Calendar } from "lucide-react";
import { format } from "date-fns";

function LiveClockInner() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-6 px-6 py-4 rounded-xl shadow-lg border border-purple-900/40 bg-[radial-gradient(circle_at_top_left,_#1a001f,_#000000)] backdrop-blur-sm">
      {/* TIME */}
      <div className="flex items-center gap-3">
        <Clock className="h-6 w-6 text-purple-400 drop-shadow-[0_0_6px_#6b21a8]" />
        <div className="flex flex-col">
          <span className="text-xs text-purple-300/70 tracking-wide">
            Current Time
          </span>
          <span className="text-xl font-bold text-purple-200 drop-shadow-[0_0_4px_#581c87]">
            {format(currentTime, "HH:mm:ss")}
          </span>
        </div>
      </div>

      <div className="h-10 w-px bg-purple-900/60" />

      {/* DATE */}
      <div className="flex items-center gap-3">
        <Calendar className="h-6 w-6 text-purple-400 drop-shadow-[0_0_6px_#6b21a8]" />
        <div className="flex flex-col">
          <span className="text-xs text-purple-300/70 tracking-wide">
            Today&apos;s Date
          </span>
          <span className="text-xl font-bold text-purple-200 drop-shadow-[0_0_4px_#581c87]">
            {format(currentTime, "MMM dd, yyyy")}
          </span>
        </div>
      </div>
    </div>
  );
}

// Export a dynamically imported version that skips SSR
import dynamic from "next/dynamic";
const LiveClock = dynamic(() => Promise.resolve(LiveClockInner), {
  ssr: false,
  loading: () => (
    <div className="flex items-center gap-6 px-6 py-4 rounded-xl bg-purple-950/20 border border-purple-900/40">
      <div className="flex items-center gap-3">
        <Clock className="h-6 w-6 text-purple-400/50" />
        <span className="text-xl font-bold text-purple-300/50">––:––:––</span>
      </div>
      <div className="h-10 w-px bg-purple-900/60" />
      <div className="flex items-center gap-3">
        <Calendar className="h-6 w-6 text-purple-400/50" />
        <span className="text-xl font-bold text-purple-300/50">Loading...</span>
      </div>
    </div>
  ),
});

export default LiveClock;
