"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useUserDetail } from "@/context/UserDetailContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Send, Smile, ArrowLeft, Heart } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────────────────────
   !important overrides
   Light = default  |  Dark = .dark prefix
───────────────────────────────────────────────────────────── */
const THANKS_STYLES = `
  /* Page background */
  .ty-page                        { background: #ffffff !important; }
  .dark .ty-page                  { background: linear-gradient(140deg, #0a0014 0%, #190028 45%, #0d001f 75%, #130020 100%) !important; }

  /* Back button */
  .ty-back-btn                    { color: hsl(var(--primary)) !important; }
  .ty-back-btn:hover              { color: hsl(var(--primary)/0.8) !important; background: hsl(var(--primary)/0.08) !important; }
  .dark .ty-back-btn              { color: #f9a8d4 !important; }
  .dark .ty-back-btn:hover        { color: #ffffff !important; background: rgba(255,255,255,0.1) !important; }

  /* Subtitle count */
  .ty-count                       { color: hsl(var(--muted-foreground)) !important; }
  .dark .ty-count                 { color: rgba(249,168,212,0.6) !important; }

  /* Message cards — unread */
  .ty-card-unread                 { background: linear-gradient(135deg, rgba(236,72,153,0.06) 0%, rgba(168,85,247,0.04) 100%) !important; border-color: rgba(236,72,153,0.25) !important; box-shadow: 0 4px 20px rgba(236,72,153,0.08) !important; }
  .dark .ty-card-unread           { background: linear-gradient(135deg, rgba(255,107,157,0.11) 0%, rgba(196,77,255,0.07) 100%) !important; border-color: rgba(255,107,157,0.32) !important; box-shadow: 0 4px 28px rgba(255,107,157,0.1) !important; }

  /* Message cards — read */
  .ty-card-read                   { background: #ffffff !important; border-color: hsl(var(--border)) !important; box-shadow: 0 2px 12px rgba(0,0,0,0.07) !important; }
  .dark .ty-card-read             { background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%) !important; border-color: rgba(255,255,255,0.07) !important; box-shadow: 0 4px 20px rgba(0,0,0,0.28) !important; }

  /* Student name */
  .ty-student-name                { color: hsl(var(--foreground)) !important; }
  .dark .ty-student-name          { color: #ffffff !important; }

  /* Lesson date */
  .ty-lesson-date                 { color: hsl(var(--muted-foreground)) !important; }
  .dark .ty-lesson-date           { color: rgba(255,255,255,0.35) !important; }

  /* Message bubble */
  .ty-msg-bubble                  { background: hsl(var(--muted)) !important; border-color: hsl(var(--border)) !important; }
  .dark .ty-msg-bubble            { background: rgba(255,255,255,0.055) !important; border-color: rgba(255,255,255,0.09) !important; }

  .ty-msg-text                    { color: hsl(var(--foreground)) !important; }
  .dark .ty-msg-text              { color: rgba(255,255,255,0.82) !important; }

  /* Response box */
  .ty-response-box                { background: linear-gradient(135deg, rgba(168,85,247,0.08), rgba(236,72,153,0.06)) !important; border-color: rgba(168,85,247,0.2) !important; }
  .dark .ty-response-box          { background: linear-gradient(135deg, rgba(196,77,255,0.13), rgba(255,107,157,0.09)) !important; border-color: rgba(196,77,255,0.28) !important; }

  .ty-response-name               { color: hsl(var(--primary)) !important; }
  .dark .ty-response-name         { color: #c084fc !important; }

  .ty-response-time               { color: hsl(var(--muted-foreground)) !important; }
  .dark .ty-response-time         { color: rgba(255,255,255,0.28) !important; }

  .ty-response-text               { color: hsl(var(--foreground)) !important; }
  .dark .ty-response-text         { color: rgba(255,255,255,0.72) !important; }

  /* Quick emoji buttons */
  .ty-emoji-btn                   { background: hsl(var(--muted)) !important; border-color: hsl(var(--border)) !important; }
  .ty-emoji-btn:hover             { background: hsl(var(--muted)/0.7) !important; }
  .dark .ty-emoji-btn             { background: rgba(255,255,255,0.055) !important; border-color: rgba(255,255,255,0.1) !important; }

  /* Empty state */
  .ty-empty                       { background: linear-gradient(135deg, rgba(236,72,153,0.05) 0%, rgba(168,85,247,0.05) 100%) !important; border-color: rgba(236,72,153,0.15) !important; }
  .dark .ty-empty                 { background: linear-gradient(135deg, rgba(255,107,157,0.07) 0%, rgba(196,77,255,0.07) 100%) !important; border-color: rgba(255,107,157,0.18) !important; }

  .ty-empty-title                 { color: hsl(var(--foreground)) !important; }
  .ty-empty-sub                   { color: hsl(var(--muted-foreground)) !important; }
  .dark .ty-empty-title           { color: rgba(255,255,255,0.7) !important; }
  .dark .ty-empty-sub             { color: rgba(255,255,255,0.35) !important; }

  /* Dialog */
  .ty-dialog                      { background: #ffffff !important; border-color: hsl(var(--border)) !important; }
  .dark .ty-dialog                { background: linear-gradient(140deg, #1a0030 0%, #0d001f 100%) !important; border-color: rgba(196,77,255,0.28) !important; }

  .ty-dialog-title                { color: hsl(var(--foreground)) !important; }
  .dark .ty-dialog-title          { color: #ffffff !important; }

  .ty-dialog-desc                 { color: hsl(var(--muted-foreground)) !important; }
  .dark .ty-dialog-desc           { color: rgba(255,255,255,0.45) !important; }

  .ty-dialog-label                { color: hsl(var(--muted-foreground)) !important; }
  .dark .ty-dialog-label          { color: rgba(255,255,255,0.65) !important; }

  .ty-dialog-textarea             { background: hsl(var(--muted)) !important; border-color: hsl(var(--border)) !important; color: hsl(var(--foreground)) !important; }
  .dark .ty-dialog-textarea       { background: rgba(255,255,255,0.055) !important; border-color: rgba(255,255,255,0.1) !important; color: #ffffff !important; }

  .ty-dialog-count                { color: hsl(var(--muted-foreground)) !important; }
  .dark .ty-dialog-count          { color: rgba(255,255,255,0.28) !important; }

  .ty-dialog-cancel               { color: hsl(var(--muted-foreground)) !important; }
  .ty-dialog-cancel:hover         { color: hsl(var(--foreground)) !important; background: hsl(var(--muted)) !important; }
  .dark .ty-dialog-cancel         { color: rgba(255,255,255,0.55) !important; }
  .dark .ty-dialog-cancel:hover   { color: #ffffff !important; background: rgba(255,255,255,0.1) !important; }

  /* Unread dot border */
  .ty-unread-dot                  { border-color: #ffffff !important; }
  .dark .ty-unread-dot            { border-color: #0a0014 !important; }
`;

const EMOJI_OPTIONS = ["❤️", "🙏", "😊", "⭐", "🎵", "💯", "👏", "🌟"];
const CONFETTI_COLORS = [
  "#ff6b9d",
  "#c44dff",
  "#4dffb4",
  "#ffd166",
  "#ff6b6b",
  "#4ecdc4",
  "#ffe66d",
  "#fed6e3",
];

type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  type: "heart" | "star" | "note";
  opacity: number;
  drift: number;
};
type Confetto = {
  id: number;
  x: number;
  color: string;
  size: number;
  duration: number;
  delay: number;
  rotate: number;
  drift: number;
  shape: "rect" | "circle";
};

function makeConfetti(): Confetto[] {
  return Array.from({ length: 55 }, (_, i) => ({
    id: i,
    x: 15 + Math.random() * 70,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 6 + Math.random() * 9,
    duration: 2.2 + Math.random() * 2.2,
    delay: Math.random() * 1.4,
    rotate: Math.random() * 720 - 360,
    drift: (Math.random() - 0.5) * 280,
    shape: (Math.random() > 0.5 ? "rect" : "circle") as "rect" | "circle",
  }));
}

function ConfettiBurst() {
  const [pieces] = useState<Confetto[]>(makeConfetti);
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: `${p.x}vw`, y: -30, opacity: 1, rotate: 0, scale: 1 }}
          animate={{
            y: "110vh",
            x: `calc(${p.x}vw + ${p.drift}px)`,
            rotate: p.rotate,
            opacity: [1, 1, 0.7, 0],
          }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.shape === "rect" ? p.size * 0.45 : p.size,
            background: p.color,
            borderRadius: p.shape === "circle" ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
}

function makeParticles(): Particle[] {
  return Array.from({ length: 26 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 10 + Math.random() * 18,
    duration: 7 + Math.random() * 11,
    delay: Math.random() * -18,
    type: (["heart", "star", "note"] as const)[Math.floor(Math.random() * 3)],
    opacity: 0.07 + Math.random() * 0.15,
    drift: (Math.random() - 0.5) * 50,
  }));
}

/* Light mode: vivid saturated colors at higher opacity.
   Dark mode: same colors but dimmer (original feel). */
const PARTICLE_COLORS_LIGHT = {
  heart: "#e11d74",
  star: "#d97706",
  note: "#7c3aed",
};
const PARTICLE_COLORS_DARK = {
  heart: "#ff6b9d",
  star: "#ffd166",
  note: "#c44dff",
};

function FloatingParticles() {
  const [particles] = useState<Particle[]>(makeParticles);
  // Detect dark mode at render time
  const isDark =
    typeof window !== "undefined" &&
    document.documentElement.classList.contains("dark");
  const colors = isDark ? PARTICLE_COLORS_DARK : PARTICLE_COLORS_LIGHT;
  // Light mode uses higher opacity so they show against white
  const opacityMultiplier = isDark ? 1 : 3.5;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: p.size,
            opacity: Math.min(p.opacity * opacityMultiplier, 0.55),
            color: colors[p.type],
            userSelect: "none",
            lineHeight: 1,
          }}
          animate={{
            y: [0, -38, 0],
            x: [0, p.drift * 0.4, 0],
            rotate: p.type === "star" ? [0, 180, 360] : [0, 12, -12, 0],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {p.type === "heart" ? "♥" : p.type === "star" ? "★" : "♪"}
        </motion.div>
      ))}
    </div>
  );
}

export default function ThanksMessagesPage() {
  const { userDetail } = useUserDetail();
  const router = useRouter();
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [responseEmoji, setResponseEmoji] = useState("");
  const [responseText, setResponseText] = useState("");
  const [isResponding, setIsResponding] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(t);
  }, []);

  const messages = useQuery(
    api.thankYouMessages.getForTeacher,
    userDetail?.role === "teacher" && userDetail?._id
      ? { teacherId: userDetail._id, limit: 50 }
      : "skip",
  );
  const respond = useMutation(api.thankYouMessages.respond);
  const markAsRead = useMutation(api.thankYouMessages.markAsRead);

  if (!userDetail) {
    return (
      <div className="ty-page flex items-center justify-center min-h-screen">
        <style>{THANKS_STYLES}</style>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        >
          <Heart className="h-8 w-8 text-pink-500" />
        </motion.div>
      </div>
    );
  }

  if (userDetail.role !== "teacher") {
    return (
      <div className="ty-page flex items-center justify-center min-h-screen">
        <style>{THANKS_STYLES}</style>
        <div className="text-center">
          <Heart className="h-16 w-16 mx-auto mb-4 text-pink-400" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        </div>
      </div>
    );
  }

  const handleQuickEmoji = async (
    messageId: Id<"thankYouMessages">,
    emoji: string,
  ) => {
    try {
      await respond({ messageId, emoji });
      toast.success("Response sent! " + emoji);
    } catch {
      toast.error("Failed to send response");
    }
  };

  const handleOpenResponse = async (messageId: Id<"thankYouMessages">) => {
    setSelectedMessage(messageId);
    setResponseEmoji("");
    setResponseText("");
    try {
      await markAsRead({ messageId });
    } catch {}
  };

  const handleSendResponse = async () => {
    if (!selectedMessage || (!responseEmoji && !responseText.trim())) {
      toast.error("Please select an emoji or write a message");
      return;
    }
    setIsResponding(true);
    try {
      await respond({
        messageId: selectedMessage as Id<"thankYouMessages">,
        emoji: responseEmoji || undefined,
        message: responseText.trim() || undefined,
      });
      toast.success("Response sent! 💝");
      setSelectedMessage(null);
      setResponseEmoji("");
      setResponseText("");
    } catch {
      toast.error("Failed to send response");
    } finally {
      setIsResponding(false);
    }
  };

  const isEmpty = !messages || messages.length === 0;

  return (
    <>
      <style>{THANKS_STYLES}</style>
      <AnimatePresence>{showConfetti && <ConfettiBurst />}</AnimatePresence>

      <div className="ty-page min-h-screen relative overflow-hidden">
        {/* Dark mode glow blobs — hidden in light mode via opacity */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden dark:block hidden">
          <motion.div
            animate={{ scale: [1, 1.18, 1], opacity: [0.12, 0.22, 0.12] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              top: "-15%",
              left: "-15%",
              width: "55vw",
              height: "55vw",
              background:
                "radial-gradient(circle, #ff6b9d50 0%, transparent 68%)",
              borderRadius: "50%",
            }}
          />
          <motion.div
            animate={{ scale: [1, 1.22, 1], opacity: [0.08, 0.18, 0.08] }}
            transition={{
              duration: 11,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4,
            }}
            style={{
              position: "absolute",
              bottom: "-20%",
              right: "-10%",
              width: "60vw",
              height: "60vw",
              background:
                "radial-gradient(circle, #c44dff40 0%, transparent 68%)",
              borderRadius: "50%",
            }}
          />
        </div>

        <FloatingParticles />

        <div className="relative z-10 container mx-auto px-4 pt-6 pb-16 max-w-4xl">
          {/* Back */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <button
              onClick={() => router.back()}
              className="ty-back-btn flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 -ml-2 mb-6 group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back
            </button>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="text-center mb-10 sm:mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-2 flex-wrap">
              <motion.span
                animate={{ scale: [1, 1.22, 1], rotate: [0, -12, 12, 0] }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="text-3xl sm:text-4xl select-none"
              >
                💝
              </motion.span>
              <h1
                className="text-4xl sm:text-5xl font-black tracking-tight"
                style={{
                  background:
                    "linear-gradient(125deg, #ff6b9d 0%, #c44dff 55%, #ffd166 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Thanks Messages
              </h1>
              <motion.span
                animate={{ scale: [1, 1.22, 1], rotate: [0, 12, -12, 0] }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.6,
                }}
                className="text-3xl sm:text-4xl select-none"
              >
                ✨
              </motion.span>
            </div>
            {!isEmpty && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="ty-count text-xs sm:text-sm mt-1"
              >
                {messages.length} message{messages.length !== 1 ? "s" : ""} from
                your students
              </motion.p>
            )}
          </motion.div>

          {/* Empty state */}
          {isEmpty ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.93 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="ty-empty text-center py-16 sm:py-20 border rounded-3xl backdrop-blur-xl"
            >
              <motion.div
                animate={{
                  scale: [1, 1.12, 1],
                  filter: [
                    "drop-shadow(0 0 6px #ff6b9d33)",
                    "drop-shadow(0 0 22px #ff6b9d88)",
                    "drop-shadow(0 0 6px #ff6b9d33)",
                  ],
                }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="text-6xl sm:text-7xl mb-6 select-none"
              >
                💌
              </motion.div>
              <p className="ty-empty-title text-lg sm:text-xl font-semibold mb-2">
                No messages yet
              </p>
              <p className="ty-empty-sub text-sm">
                Your students will send you love after lessons
              </p>
              <div className="flex justify-center gap-3 sm:gap-4 mt-8">
                {[
                  { symbol: "♥", color: "#e11d74" },
                  { symbol: "♥", color: "#7c3aed" },
                  { symbol: "♥", color: "#d97706" },
                  { symbol: "♥", color: "#16a34a" },
                  { symbol: "♥", color: "#2563eb" },
                ].map((h, i) => (
                  <motion.span
                    key={i}
                    animate={{ y: [0, -9, 0] }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.22,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="text-xl select-none"
                    style={{ color: h.color, opacity: 0.85 }}
                  >
                    {h.symbol}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4 sm:space-y-5">
              {messages.map((msg, index) => (
                <motion.div
                  key={msg._id}
                  initial={{ opacity: 0, y: 28, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className={`${!msg.isRead ? "ty-card-unread" : "ty-card-read"} border rounded-2xl sm:rounded-[20px] p-4 sm:p-6 backdrop-blur-sm`}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <Avatar className="h-12 w-12 sm:h-14 sm:w-14 ring-2 ring-pink-500/35 ring-offset-2 ring-offset-transparent">
                        <AvatarImage src={msg.studentImage} />
                        <AvatarFallback
                          style={{
                            background:
                              "linear-gradient(135deg, #ff6b9d, #c44dff)",
                          }}
                          className="text-white text-lg font-bold"
                        >
                          {msg.studentName?.charAt(0) || "S"}
                        </AvatarFallback>
                      </Avatar>
                      {!msg.isRead && (
                        <motion.div
                          animate={{ scale: [1, 1.35, 1] }}
                          transition={{ duration: 1.6, repeat: Infinity }}
                          className="ty-unread-dot absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full border-2"
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Name + date */}
                      <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2 flex-wrap">
                        <div>
                          <h3 className="ty-student-name font-bold text-sm sm:text-base">
                            {msg.studentName}
                          </h3>
                          <p className="ty-lesson-date text-xs mt-0.5">
                            {msg.lessonDate
                              ? format(new Date(msg.lessonDate), "MMMM d, yyyy")
                              : ""}
                          </p>
                        </div>
                        {!msg.isRead && (
                          <Badge
                            style={{
                              background:
                                "linear-gradient(135deg, #ff6b9d, #c44dff)",
                            }}
                            className="text-white text-xs border-0 shrink-0"
                          >
                            ✨ New
                          </Badge>
                        )}
                      </div>

                      {/* Message bubble */}
                      <div className="ty-msg-bubble rounded-2xl p-3 sm:p-4 mb-3 sm:mb-4 border">
                        <p className="ty-msg-text leading-relaxed text-sm sm:text-base">
                          {msg.message}
                        </p>
                      </div>

                      {/* Response or emoji actions */}
                      {msg.teacherResponse ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="ty-response-box p-3 sm:p-4 rounded-2xl border"
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-8 w-8 sm:h-9 sm:w-9 shrink-0">
                              <AvatarImage src={userDetail.imageUrl} />
                              <AvatarFallback
                                style={{
                                  background:
                                    "linear-gradient(135deg, #4dffb4, #c44dff)",
                                }}
                                className="text-white font-bold text-sm"
                              >
                                {userDetail.name?.charAt(0) || "T"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className="ty-response-name text-xs font-semibold">
                                  {userDetail.name || "You"}
                                </span>
                                <span className="ty-response-time text-xs">
                                  ✓{" "}
                                  {format(
                                    new Date(msg.teacherResponse.timestamp),
                                    "MMM d, HH:mm",
                                  )}
                                </span>
                              </div>
                              {msg.teacherResponse.emoji && (
                                <div className="text-xl sm:text-2xl mb-1">
                                  {msg.teacherResponse.emoji}
                                </div>
                              )}
                              {msg.teacherResponse.message && (
                                <p className="ty-response-text text-sm">
                                  {msg.teacherResponse.message}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center">
                          {EMOJI_OPTIONS.map((emoji, ei) => (
                            <motion.button
                              key={emoji}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: ei * 0.04 }}
                              whileHover={{ scale: 1.28, y: -4 }}
                              whileTap={{ scale: 0.88 }}
                              onClick={() => handleQuickEmoji(msg._id, emoji)}
                              className="ty-emoji-btn text-lg sm:text-xl w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl cursor-pointer border transition-all"
                            >
                              {emoji}
                            </motion.button>
                          ))}
                          <motion.div
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            className="ml-auto"
                          >
                            <Button
                              size="sm"
                              onClick={() => handleOpenResponse(msg._id)}
                              style={{
                                background:
                                  "linear-gradient(135deg, #c44dff, #ff6b9d)",
                                border: "none",
                              }}
                              className="text-white font-semibold shadow-lg shadow-pink-500/25 text-xs sm:text-sm"
                            >
                              <Send className="h-3.5 w-3.5 mr-1.5" />
                              Write Response
                            </Button>
                          </motion.div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Response Dialog */}
      <Dialog
        open={!!selectedMessage}
        onOpenChange={() => setSelectedMessage(null)}
      >
        <DialogContent className="ty-dialog sm:max-w-[500px] border-2">
          <DialogHeader>
            <DialogTitle className="ty-dialog-title flex items-center gap-2">
              <Smile className="h-5 w-5 text-pink-500" />
              Respond to Thank You
            </DialogTitle>
            <DialogDescription className="ty-dialog-desc">
              Send an emoji or write a message back to your student
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-5 py-4">
            <div>
              <label className="ty-dialog-label text-sm font-medium mb-3 block">
                Choose an emoji
              </label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map((emoji) => (
                  <motion.button
                    key={emoji}
                    whileHover={{ scale: 1.22, y: -3 }}
                    whileTap={{ scale: 0.88 }}
                    onClick={() =>
                      setResponseEmoji(responseEmoji === emoji ? "" : emoji)
                    }
                    className="text-xl sm:text-2xl w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl cursor-pointer transition-all"
                    style={{
                      background:
                        responseEmoji === emoji
                          ? "linear-gradient(135deg, rgba(196,77,255,0.3), rgba(255,107,157,0.3))"
                          : undefined,
                      border:
                        responseEmoji === emoji
                          ? "2px solid #ff6b9d"
                          : "1px solid rgba(0,0,0,0.1)",
                      boxShadow:
                        responseEmoji === emoji ? "0 0 14px #ff6b9d40" : "none",
                    }}
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label className="ty-dialog-label text-sm font-medium mb-2 block">
                Add a message (optional)
              </label>
              <Textarea
                placeholder="No worries, thanks for letting me know — have a beautiful week! 🌟"
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                className="ty-dialog-textarea min-h-[100px] sm:min-h-[110px] resize-none"
                maxLength={300}
              />
              <p className="ty-dialog-count text-xs mt-1 text-right">
                {responseText.length}/300
              </p>
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={() => setSelectedMessage(null)}
              disabled={isResponding}
              className="ty-dialog-cancel px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            >
              Cancel
            </button>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Button
                onClick={handleSendResponse}
                disabled={
                  (!responseEmoji && !responseText.trim()) || isResponding
                }
                style={{
                  background: "linear-gradient(135deg, #c44dff, #ff6b9d)",
                  border: "none",
                }}
                className="text-white font-semibold shadow-lg shadow-pink-500/28"
              >
                {isResponding ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="mr-2"
                    >
                      <Heart className="h-4 w-4" />
                    </motion.div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Response
                  </>
                )}
              </Button>
            </motion.div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
