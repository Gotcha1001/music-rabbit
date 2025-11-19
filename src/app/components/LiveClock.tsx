// components/LiveClock.tsx
"use client";

import { useState, useEffect } from "react";
import { Clock, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function LiveClock() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg shadow-sm">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-blue-600" />
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground font-medium">
            Current Time
          </span>
          <span className="text-lg font-bold text-blue-900">
            {format(currentTime, "HH:mm:ss")}
          </span>
        </div>
      </div>

      <div className="h-8 w-px bg-blue-200" />

      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-purple-600" />
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground font-medium">
            Today&apos;s Date
          </span>
          <span className="text-lg font-bold text-purple-900">
            {format(currentTime, "MMM dd, yyyy")}
          </span>
        </div>
      </div>
    </div>
  );
}
