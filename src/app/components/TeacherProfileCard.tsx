// components/TeacherProfileCard.tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Music } from "lucide-react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Id, Doc } from "../../../convex/_generated/dataModel";

interface TeacherProfileCardProps {
  teacherId: Id<"users"> | null | undefined;
}

// Inject once — covers all light + dark overrides with !important on both sides
const STYLES = `
  /* ── LIGHT MODE (default) ── */
  .tpc-shell         { background: #ffffff !important; border-color: hsl(var(--border)) !important; }
  .tpc-header        { background: #ffffff !important; border-bottom-color: hsl(var(--border)) !important; }
  .tpc-body          { background: #ffffff !important; }
  .tpc-avatar        { background: linear-gradient(to bottom right, hsl(var(--primary)), hsl(var(--primary))) !important; box-shadow: none !important; }
  .tpc-name          { color: hsl(var(--foreground)) !important; }
  .tpc-instrument    { color: hsl(var(--primary)) !important; }
  .tpc-degree        { color: hsl(var(--foreground)) !important; }
  .tpc-degree-icon   { color: hsl(var(--primary)) !important; }
  .tpc-bio           { background: hsl(var(--muted)) !important; border-left-color: hsl(var(--primary)) !important; color: hsl(var(--foreground)) !important; }
  .tpc-spec-label    { color: hsl(var(--foreground)) !important; }
  .tpc-badge         { background: hsl(var(--primary) / 0.1) !important; color: hsl(var(--primary)) !important; border-color: hsl(var(--primary) / 0.3) !important; }

  /* ── DARK MODE ── */
  .dark .tpc-shell        { background: linear-gradient(to bottom right, hsl(270 90% 5%), hsl(270 80% 4%)) !important; border-color: rgba(109,40,217,0.3) !important; box-shadow: 0 20px 50px -12px rgba(108,40,255,0.2) !important; }
  .dark .tpc-header       { background: linear-gradient(to right, rgba(76,29,149,0.25), rgba(109,40,217,0.12), transparent) !important; border-bottom-color: rgba(109,40,217,0.3) !important; }
  .dark .tpc-body         { background: transparent !important; }
  .dark .tpc-avatar       { background: linear-gradient(to bottom right, #7c3aed, #5b21b6) !important; box-shadow: 0 0 30px rgba(139,92,246,0.45) !important; }
  .dark .tpc-name         { color: #ede9fe !important; }
  .dark .tpc-instrument   { color: #c4b5fd !important; }
  .dark .tpc-degree       { color: #ddd6fe !important; }
  .dark .tpc-degree-icon  { color: #a78bfa !important; }
  .dark .tpc-bio          { background: rgba(46,16,101,0.55) !important; border-left-color: #7c3aed !important; color: #ddd6fe !important; }
  .dark .tpc-spec-label   { color: #c4b5fd !important; }
  .dark .tpc-badge        { background: rgba(91,33,182,0.7) !important; color: #ede9fe !important; border-color: #7c3aed !important; }
`;

export function TeacherProfileCard({ teacherId }: TeacherProfileCardProps) {
  const teacher = useQuery(
    api.users.getById,
    teacherId ? { id: teacherId } : "skip",
  ) as Doc<"users"> | undefined;

  // 1. No teacher assigned
  if (!teacherId) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="tpc-shell mb-8 sm:mb-12 rounded-xl border-2 overflow-hidden shadow-lg">
          <div className="tpc-body py-12 sm:py-16 text-center px-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center mb-4 tpc-avatar">
              <Music className="h-8 w-8 sm:h-12 sm:w-12 text-white opacity-70" />
            </div>
            <p className="tpc-name text-xl sm:text-2xl font-bold font-serif">
              No teacher assigned yet
            </p>
            <p className="tpc-instrument text-base sm:text-lg mt-3 font-serif italic opacity-80">
              HR will assign you a teacher soon, or choose one below
            </p>
          </div>
        </div>
      </>
    );
  }

  // 2. Still loading
  if (teacher === undefined) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="tpc-shell mb-8 sm:mb-12 rounded-xl border-2 overflow-hidden shadow-lg">
          <div className="tpc-body py-16 sm:py-20 text-center">
            <Loader2 className="tpc-degree-icon h-10 w-10 sm:h-12 sm:w-12 animate-spin mx-auto" />
            <p className="tpc-degree mt-4 text-base sm:text-lg font-serif">
              Loading your teacher...
            </p>
          </div>
        </div>
      </>
    );
  }

  // 3. Teacher loaded
  return (
    <>
      <style>{STYLES}</style>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-8 sm:mb-12"
      >
        <div className="tpc-shell rounded-xl overflow-hidden border-2 shadow-lg">
          {/* ── Header ── */}
          <div className="tpc-header p-5 sm:p-8 border-b">
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Avatar */}
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 8, repeat: Infinity }}
                className="tpc-avatar w-16 h-16 sm:w-24 sm:h-24 lg:w-28 lg:h-28 shrink-0 rounded-full flex items-center justify-center text-3xl sm:text-4xl lg:text-5xl font-bold text-white ring-2 sm:ring-4 ring-white/20"
              >
                {teacher.name?.[0]?.toUpperCase() ?? "T"}
              </motion.div>

              {/* Name + instrument */}
              <div className="min-w-0">
                <h2 className="tpc-name text-2xl sm:text-3xl lg:text-4xl font-bold font-serif leading-tight truncate">
                  {teacher.name ?? "Your Teacher"}
                </h2>
                <p className="tpc-instrument text-base sm:text-xl lg:text-2xl flex items-center gap-2 sm:gap-3 mt-1 sm:mt-2">
                  <Music className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 shrink-0" />
                  <span className="truncate">
                    {teacher.instrument ?? "Music"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* ── Content ── */}
          <div className="tpc-body p-5 sm:p-8 space-y-5 sm:space-y-6">
            {/* Degree */}
            {(teacher.degree || teacher.institution) && (
              <div className="flex items-start gap-3 text-base sm:text-lg">
                <GraduationCap className="tpc-degree-icon h-5 w-5 sm:h-7 sm:w-7 mt-0.5 shrink-0" />
                <span className="tpc-degree font-medium">
                  {teacher.degree}
                  {teacher.institution && ` — ${teacher.institution}`}
                </span>
              </div>
            )}

            {/* Bio */}
            {teacher.bio && (
              <motion.blockquote
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="tpc-bio text-base sm:text-xl italic leading-relaxed pl-4 sm:pl-6 pr-4 sm:pr-6 py-3 sm:py-4 rounded-r-lg border-l-4"
              >
                {teacher.bio}
              </motion.blockquote>
            )}

            {/* Specialties */}
            {teacher.specialties && teacher.specialties.length > 0 && (
              <div>
                <p className="tpc-spec-label text-base sm:text-lg font-semibold mb-2 sm:mb-3">
                  Specialties
                </p>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {teacher.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="tpc-badge text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4 rounded-full border font-medium"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
