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

export function TeacherProfileCard({ teacherId }: TeacherProfileCardProps) {
  const teacher = useQuery(
    api.users.getById,
    teacherId ? { id: teacherId } : "skip"
  ) as Doc<"users"> | undefined;

  // 1. No teacher assigned
  if (!teacherId) {
    return (
      <Card className="mb-12 bg-gradient-to-br from-purple-900/50 to-black/50 border-2 border-purple-700/50">
        <CardContent className="py-16 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-purple-900/50 flex items-center justify-center mb-4">
            <Music className="h-12 w-12 text-purple-500 opacity-60" />
          </div>
          <p className="text-2xl font-bold text-purple-300 font-serif">
            No teacher assigned yet
          </p>
          <p className="text-lg text-purple-400/80 mt-3 font-serif italic">
            HR will assign you a teacher soon, or choose one below
          </p>
        </CardContent>
      </Card>
    );
  }

  // 2. Still loading
  if (teacher === undefined) {
    return (
      <Card className="mb-12 text-center py-20 bg-muted/50 dark:bg-purple-950/30">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-purple-500" />
        <p className="mt-4 text-lg text-muted-foreground">
          Loading your teacher...
        </p>
      </Card>
    );
  }

  // 3. Teacher is loaded → 100% safe to access all fields
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <Card className="mb-12 overflow-hidden border-2 border-purple-800/50 bg-gradient-to-br from-purple-950/80 via-purple-900/60 to-black/80 shadow-2xl dark:shadow-purple-intense">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-800/50 via-purple-700/30 to-transparent p-8 border-b border-purple-700/50">
          <div className="flex items-center gap-6">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 8, repeat: Infinity }}
              className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-5xl font-bold text-white shadow-2xl ring-4 ring-purple-500/50"
            >
              {teacher.name?.[0] ?? "T"}
            </motion.div>
            <div>
              <h2 className="text-4xl font-bold text-purple-100 font-serif drop-shadow-lg">
                {teacher.name ?? "Your Teacher"}
              </h2>
              <p className="text-2xl text-purple-300 flex items-center gap-3 mt-2">
                <Music className="h-7 w-7" />
                {teacher.instrument ?? "Music"}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-8 space-y-6 text-purple-200">
          {(teacher.degree || teacher.institution) && (
            <div className="flex items-center gap-3 text-lg">
              <GraduationCap className="h-7 w-7 text-purple-400 drop-shadow" />
              <span className="font-medium">
                {teacher.degree}
                {teacher.institution && ` — ${teacher.institution}`}
              </span>
            </div>
          )}

          {teacher.bio && (
            <motion.blockquote
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl italic leading-relaxed pl-6 border-l-4 border-purple-500 bg-purple-950/50 py-4 px-6 rounded-r-lg"
            >
              {teacher.bio}
            </motion.blockquote>
          )}

          {teacher.specialties && teacher.specialties.length > 0 && (
            <div>
              <p className="text-lg font-semibold mb-3 text-purple-300">
                Specialties
              </p>
              <div className="flex flex-wrap gap-3">
                {teacher.specialties.map((specialty) => (
                  <Badge
                    key={specialty}
                    variant="secondary"
                    className="text-sm py-2 px-4 bg-purple-800/70 text-purple-100 border-purple-600 shadow-md"
                  >
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
