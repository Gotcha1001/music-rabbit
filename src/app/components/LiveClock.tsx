"use client";

import { useState, useEffect } from "react";
import { Clock, Calendar, Globe } from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { formatTimeInTimezone, getTimezoneAbbr } from "@/lib/timezoneUtils";
import dynamic from "next/dynamic";
import type { Id } from "../../../convex/_generated/dataModel";

/* ─────────────────────────────────────────────────────────────
   !important overrides
   Light = default  |  Dark = .dark prefix
───────────────────────────────────────────────────────────── */
const CLOCK_STYLES = `
  .lc-shell                 { background: #ffffff !important; border-color: hsl(var(--border)) !important; box-shadow: 0 2px 12px rgba(0,0,0,0.08) !important; }
  .dark .lc-shell           { background: radial-gradient(circle at top left, #1a001f, #000000) !important; border-color: rgba(109,40,217,0.4) !important; box-shadow: 0 4px 24px rgba(139,92,246,0.15) !important; }

  .lc-icon                  { color: hsl(var(--primary)) !important; filter: none !important; }
  .dark .lc-icon            { color: #a78bfa !important; filter: drop-shadow(0 0 6px #6b21a8) !important; }

  .lc-label                 { color: hsl(var(--muted-foreground)) !important; }
  .dark .lc-label           { color: rgba(196,181,253,0.7) !important; }

  .lc-time                  { color: hsl(var(--foreground)) !important; filter: none !important; }
  .dark .lc-time            { color: #ddd6fe !important; filter: drop-shadow(0 0 4px #581c87) !important; }

  .lc-tz                    { color: hsl(var(--primary)) !important; }
  .dark .lc-tz              { color: rgba(167,139,250,0.8) !important; }

  .lc-location              { color: hsl(var(--muted-foreground)) !important; }
  .dark .lc-location        { color: rgba(196,181,253,0.6) !important; }

  .lc-divider               { background: hsl(var(--border)) !important; }
  .dark .lc-divider         { background: rgba(109,40,217,0.6) !important; }

  /* Loading skeleton */
  .lc-loading               { background: hsl(var(--muted)) !important; border-color: hsl(var(--border)) !important; }
  .dark .lc-loading         { background: rgba(76,29,149,0.2) !important; border-color: rgba(109,40,217,0.4) !important; }
  .lc-loading-icon          { color: hsl(var(--primary)/0.4) !important; }
  .dark .lc-loading-icon    { color: rgba(167,139,250,0.5) !important; }
  .lc-loading-text          { color: hsl(var(--muted-foreground)) !important; }
  .dark .lc-loading-text    { color: rgba(196,181,253,0.5) !important; }
`;

interface LiveClockProps {
  showOtherUserTimezone?: boolean;
  otherUserId?: string;
}

function LiveClockInner({
  showOtherUserTimezone = false,
  otherUserId,
}: LiveClockProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  const currentUser = useQuery(api.users.get);
  const otherUser = useQuery(
    api.users.getById,
    otherUserId ? { id: otherUserId as Id<"users"> } : "skip",
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
    "HH:mm:ss",
  );
  const userAbbrStr = getTimezoneAbbr(userTimezone);

  const otherTimeStr =
    showOtherUserTimezone && otherUser
      ? formatTimeInTimezone(currentTime, otherTimezone, "HH:mm:ss")
      : null;
  const otherAbbrStr =
    showOtherUserTimezone && otherUser ? getTimezoneAbbr(otherTimezone) : null;

  return (
    <div className="lc-shell flex flex-col gap-4 sm:gap-6 px-4 sm:px-6 py-3 sm:py-4 rounded-xl border backdrop-blur-sm">
      <style>{CLOCK_STYLES}</style>

      {/* Your time */}
      <div className="flex items-center gap-3">
        <Clock className="lc-icon h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
        <div className="flex flex-col">
          <span className="lc-label text-xs tracking-wide">Your Time</span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="lc-time text-lg sm:text-xl font-bold font-mono">
              {userTimeStr}
            </span>
            <span className="lc-tz text-xs font-mono">{userAbbrStr}</span>
          </div>
          {currentUser?.country && (
            <span className="lc-location text-xs mt-0.5">
              Location: {currentUser.country}
              {currentUser.state && `, ${currentUser.state}`}
            </span>
          )}
        </div>
      </div>

      {/* Date */}
      <div className="flex items-center gap-3">
        <Calendar className="lc-icon h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
        <div className="flex flex-col">
          <span className="lc-label text-xs tracking-wide">Today</span>
          <span className="lc-time text-lg sm:text-xl font-bold">
            {format(currentTime, "MMM dd, yyyy")}
          </span>
        </div>
      </div>

      {/* Other user's time */}
      {showOtherUserTimezone && otherUser && otherTimeStr && (
        <>
          <div className="lc-divider h-px" />
          <div className="flex items-center gap-3">
            <Globe className="lc-icon h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
            <div className="flex flex-col">
              <span className="lc-label text-xs tracking-wide">
                {otherUser.role === "student" ? "Student's Time" : "Their Time"}
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="lc-time text-lg sm:text-xl font-bold font-mono">
                  {otherTimeStr}
                </span>
                <span className="lc-tz text-xs font-mono">{otherAbbrStr}</span>
              </div>
              {otherUser.country && (
                <span className="lc-location text-xs mt-0.5">
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

const LiveClock = dynamic(() => Promise.resolve(LiveClockInner), {
  ssr: false,
  loading: () => (
    <div className="lc-loading flex items-center gap-4 sm:gap-6 px-4 sm:px-6 py-3 sm:py-4 rounded-xl border">
      <style>{CLOCK_STYLES}</style>
      <Clock className="lc-loading-icon h-5 w-5 sm:h-6 sm:w-6 animate-pulse shrink-0" />
      <span className="lc-loading-text text-lg sm:text-xl font-bold">
        Loading time...
      </span>
    </div>
  ),
});

export default LiveClock;
