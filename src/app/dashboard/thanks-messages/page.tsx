// "use client";

// import { useState } from "react";
// import { useQuery, useMutation } from "convex/react";
// import { api } from "../../../../convex/_generated/api";
// import { Id } from "../../../../convex/_generated/dataModel";
// import { useUserDetail } from "@/context/UserDetailContext";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Heart, Send, Smile, ArrowLeft } from "lucide-react";
// import { format } from "date-fns";
// import { toast } from "sonner";
// import { useRouter } from "next/navigation";

// const EMOJI_OPTIONS = ["❤️", "🙏", "😊", "⭐", "🎵", "💯", "👏", "🌟"];

// export default function ThanksMessagesPage() {
//   const { userDetail } = useUserDetail();
//   const router = useRouter();
//   const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
//   const [responseEmoji, setResponseEmoji] = useState<string>("");
//   const [responseText, setResponseText] = useState<string>("");
//   const [isResponding, setIsResponding] = useState(false);

//   const messages = useQuery(
//     api.thankYouMessages.getForTeacher,
//     userDetail?.role === "teacher" && userDetail?._id
//       ? { teacherId: userDetail._id, limit: 50 }
//       : "skip",
//   );

//   const respond = useMutation(api.thankYouMessages.respond);
//   const markAsRead = useMutation(api.thankYouMessages.markAsRead);

//   if (!userDetail) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
//           <p className="text-muted-foreground">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   if (userDetail.role !== "teacher") {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
//           <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
//           <p className="text-muted-foreground">
//             Only teachers can view thank you messages
//           </p>
//         </div>
//       </div>
//     );
//   }

//   const handleQuickEmoji = async (
//     messageId: Id<"thankYouMessages">,
//     emoji: string,
//   ) => {
//     try {
//       await respond({ messageId, emoji });
//       toast.success("Response sent! " + emoji);
//     } catch (error) {
//       console.error("Error sending emoji:", error);
//       toast.error("Failed to send response");
//     }
//   };

//   const handleOpenResponse = async (messageId: Id<"thankYouMessages">) => {
//     setSelectedMessage(messageId);
//     setResponseEmoji("");
//     setResponseText("");
//     try {
//       await markAsRead({ messageId });
//     } catch (error) {
//       console.error("Error marking as read:", error);
//     }
//   };

//   const handleSendResponse = async () => {
//     if (!selectedMessage || (!responseEmoji && !responseText.trim())) {
//       toast.error("Please select an emoji or write a message");
//       return;
//     }

//     setIsResponding(true);
//     try {
//       await respond({
//         messageId: selectedMessage as Id<"thankYouMessages">,
//         emoji: responseEmoji || undefined,
//         message: responseText.trim() || undefined,
//       });

//       toast.success("Response sent! 💝");
//       setSelectedMessage(null);
//       setResponseEmoji("");
//       setResponseText("");
//     } catch (error) {
//       console.error("Error sending response:", error);
//       toast.error("Failed to send response");
//     } finally {
//       setIsResponding(false);
//     }
//   };

//   const pageContent = (
//     <>
//       {/* Back button — matches pattern used across other dashboard pages */}
//       <div className="container mx-auto px-4 pt-6 relative z-10">
//         <Button
//           variant="ghost"
//           onClick={() => router.back()}
//           className="text-purple-300 hover:text-purple-100 hover:bg-purple-900/30 -ml-2 mb-2"
//         >
//           <ArrowLeft className="mr-2 h-4 w-4" />
//           Back
//         </Button>
//       </div>

//       <div className="container mx-auto px-4 pb-12 relative z-10">
//         <div className="max-w-4xl mx-auto">
//           {/* Header */}
//           <div className="text-center mb-8">
//             <h1 className="text-4xl font-bold mb-2">Thanks Messages</h1>
//           </div>

//           {!messages || messages.length === 0 ? (
//             <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 border-2 border-gray-100 dark:border-gray-700 text-center">
//               <Heart className="h-16 w-16 mx-auto mb-4 text-pink-300 animate-pulse" />
//               <p className="text-xl text-muted-foreground mb-2">
//                 No thank you messages yet
//               </p>
//               <p className="text-sm text-muted-foreground">
//                 Your students will be able to send you thank you messages after
//                 lessons
//               </p>
//             </div>
//           ) : (
//             <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 border-gray-100 dark:border-gray-700">
//               <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
//                 {messages.map((msg) => (
//                   <div
//                     key={msg._id}
//                     className={`border-2 rounded-xl p-6 transition-all ${
//                       !msg.isRead
//                         ? "bg-pink-50 dark:bg-pink-900/10 border-pink-200 dark:border-pink-700"
//                         : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
//                     }`}
//                   >
//                     <div className="flex items-start gap-4 mb-4">
//                       <Avatar className="h-14 w-14 border-2 border-white shadow-md">
//                         <AvatarImage src={msg.studentImage} />
//                         <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white text-lg font-bold">
//                           {msg.studentName?.charAt(0) || "S"}
//                         </AvatarFallback>
//                       </Avatar>
//                       <div className="flex-1">
//                         <div className="flex items-center justify-between mb-2">
//                           <div>
//                             <h3 className="font-bold text-lg">
//                               {msg.studentName}
//                             </h3>
//                             <p className="text-sm text-muted-foreground">
//                               {msg.studentName?.split(" ")[1] || "Student"}@
//                             </p>
//                           </div>
//                           <div className="text-right">
//                             <p className="text-sm font-medium">
//                               {msg.lessonDate
//                                 ? format(new Date(msg.lessonDate), "yyyy.MM.dd")
//                                 : ""}
//                             </p>
//                             {!msg.isRead && (
//                               <Badge className="bg-pink-500 text-white mt-1">
//                                 New
//                               </Badge>
//                             )}
//                           </div>
//                         </div>

//                         <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-3">
//                           <p className="text-gray-700 dark:text-gray-300">
//                             {msg.message}
//                           </p>
//                         </div>

//                         {msg.teacherResponse ? (
//                           <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border-2 border-purple-200 dark:border-purple-700">
//                             <div className="flex items-start gap-3">
//                               <Avatar className="h-10 w-10 border-2 border-white">
//                                 <AvatarImage src={userDetail.imageUrl} />
//                                 <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white font-bold">
//                                   {userDetail.name?.charAt(0) || "T"}
//                                 </AvatarFallback>
//                               </Avatar>
//                               <div className="flex-1">
//                                 <div className="flex items-center gap-2 mb-1">
//                                   <p className="font-medium text-sm">
//                                     {userDetail.name || "Teacher"}
//                                   </p>
//                                   <Badge
//                                     variant="secondary"
//                                     className="text-xs bg-green-100 text-green-700 dark:bg-green-900/20"
//                                   >
//                                     ✓{" "}
//                                     {format(
//                                       new Date(msg.teacherResponse.timestamp),
//                                       "yyyy-MM-dd HH:mm:ss",
//                                     )}
//                                   </Badge>
//                                 </div>
//                                 <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
//                                   {msg.teacherResponse.emoji && (
//                                     <div className="text-3xl mb-2">
//                                       {msg.teacherResponse.emoji}
//                                     </div>
//                                   )}
//                                   {msg.teacherResponse.message && (
//                                     <p className="text-sm text-gray-700 dark:text-gray-300">
//                                       {msg.teacherResponse.message}
//                                     </p>
//                                   )}
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         ) : (
//                           <div className="flex flex-wrap gap-2">
//                             {EMOJI_OPTIONS.map((emoji) => (
//                               <Button
//                                 key={emoji}
//                                 variant="outline"
//                                 size="sm"
//                                 onClick={() => handleQuickEmoji(msg._id, emoji)}
//                                 className="text-2xl hover:scale-110 transition-transform hover:bg-pink-50 dark:hover:bg-pink-900/20"
//                               >
//                                 {emoji}
//                               </Button>
//                             ))}
//                             <Button
//                               variant="default"
//                               size="sm"
//                               onClick={() => handleOpenResponse(msg._id)}
//                               className="ml-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
//                             >
//                               <Send className="h-4 w-4 mr-2" />
//                               Write Response
//                             </Button>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );

//   return (
//     <>
//       <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
//         {/* Decorative balloons background */}
//         <div className="fixed inset-0 overflow-hidden pointer-events-none">
//           <div className="absolute top-20 left-10 w-16 h-20 bg-green-400 rounded-full opacity-30 animate-float"></div>
//           <div className="absolute top-40 left-32 w-20 h-24 bg-yellow-400 rounded-full opacity-30 animate-float-delay-1"></div>
//           <div className="absolute top-32 right-20 w-18 h-22 bg-red-400 rounded-full opacity-30 animate-float-delay-2"></div>
//           <div className="absolute top-60 right-40 w-14 h-18 bg-blue-400 rounded-full opacity-30 animate-float"></div>
//           <div className="absolute top-10 right-60 w-12 h-16 bg-purple-400 rounded-full opacity-30 animate-float-delay-1"></div>
//           <div className="absolute top-80 left-1/4 w-10 h-14 bg-orange-400 rounded-full opacity-30 animate-float-delay-2"></div>
//           <div className="absolute top-40 left-1/3 w-2 h-2 bg-red-400 rounded-full opacity-40"></div>
//           <div className="absolute top-32 right-1/3 w-2 h-2 bg-blue-400 rounded-full opacity-40"></div>
//           <div className="absolute top-60 left-1/2 w-2 h-2 bg-green-400 rounded-full opacity-40"></div>
//           <div className="absolute top-20 right-1/4 w-2 h-2 bg-yellow-400 rounded-full opacity-40"></div>
//           <div className="absolute top-50 left-2/3 w-2 h-2 bg-purple-400 rounded-full opacity-40"></div>
//         </div>

//         {pageContent}
//       </div>

//       {/* Response Dialog */}
//       <Dialog
//         open={!!selectedMessage}
//         onOpenChange={() => setSelectedMessage(null)}
//       >
//         <DialogContent className="sm:max-w-[500px]">
//           <DialogHeader>
//             <DialogTitle className="flex items-center gap-2">
//               <Smile className="h-5 w-5 text-purple-500" />
//               Respond to Thank You
//             </DialogTitle>
//             <DialogDescription>
//               Send an emoji or write a message back to your student
//             </DialogDescription>
//           </DialogHeader>

//           <div className="space-y-4 py-4">
//             <div>
//               <label className="text-sm font-medium mb-2 block">
//                 Choose an emoji
//               </label>
//               <div className="flex flex-wrap gap-2">
//                 {EMOJI_OPTIONS.map((emoji) => (
//                   <Button
//                     key={emoji}
//                     variant={responseEmoji === emoji ? "default" : "outline"}
//                     size="lg"
//                     onClick={() =>
//                       setResponseEmoji(responseEmoji === emoji ? "" : emoji)
//                     }
//                     className="text-2xl"
//                   >
//                     {emoji}
//                   </Button>
//                 ))}
//               </div>
//             </div>

//             <div>
//               <label className="text-sm font-medium mb-2 block">
//                 Add a message (optional)
//               </label>
//               <Textarea
//                 placeholder="No worries, thanks for letting me know, have a beautiful rest of the week!"
//                 value={responseText}
//                 onChange={(e) => setResponseText(e.target.value)}
//                 className="min-h-[120px] resize-none"
//                 maxLength={300}
//               />
//               <p className="text-xs text-muted-foreground mt-1 text-right">
//                 {responseText.length}/300 characters
//               </p>
//             </div>
//           </div>

//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => setSelectedMessage(null)}
//               disabled={isResponding}
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={handleSendResponse}
//               disabled={
//                 (!responseEmoji && !responseText.trim()) || isResponding
//               }
//               className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
//             >
//               {isResponding ? (
//                 <>
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
//                   Sending...
//                 </>
//               ) : (
//                 <>
//                   <Send className="h-4 w-4 mr-2" />
//                   Send Response
//                 </>
//               )}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       <style jsx global>{`
//         @keyframes float {
//           0%,
//           100% {
//             transform: translateY(0px) rotate(0deg);
//           }
//           50% {
//             transform: translateY(-20px) rotate(5deg);
//           }
//         }

//         .animate-float {
//           animation: float 6s ease-in-out infinite;
//         }

//         .animate-float-delay-1 {
//           animation: float 7s ease-in-out infinite;
//           animation-delay: -2s;
//         }

//         .animate-float-delay-2 {
//           animation: float 8s ease-in-out infinite;
//           animation-delay: -4s;
//         }
//       `}</style>
//     </>
//   );
// }
// app/dashboard/thanks-messages/page.tsx
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

// ── Types ─────────────────────────────────────────────────────────────────────
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

// ── Confetti burst ────────────────────────────────────────────────────────────
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

// ── Floating background particles ─────────────────────────────────────────────
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

function FloatingParticles() {
  const [particles] = useState<Particle[]>(makeParticles);

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
            opacity: p.opacity,
            color:
              p.type === "heart"
                ? "#ff6b9d"
                : p.type === "star"
                  ? "#ffd166"
                  : "#c44dff",
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

// ── Main Page ─────────────────────────────────────────────────────────────────
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
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: "#0a0014" }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        >
          <Heart className="h-8 w-8 text-pink-400" />
        </motion.div>
      </div>
    );
  }

  if (userDetail.role !== "teacher") {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: "#0a0014" }}
      >
        <div className="text-center text-white">
          <Heart className="h-16 w-16 mx-auto mb-4 text-pink-300" />
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
      <AnimatePresence>{showConfetti && <ConfettiBurst />}</AnimatePresence>

      <div
        className="min-h-screen relative overflow-hidden"
        style={{
          background:
            "linear-gradient(140deg, #0a0014 0%, #190028 45%, #0d001f 75%, #130020 100%)",
        }}
      >
        {/* Glow blobs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
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

        {/* Floating hearts/stars/notes */}
        <FloatingParticles />

        {/* Page content */}
        <div className="relative z-10 container mx-auto px-4 pt-6 pb-16 max-w-4xl">
          {/* Back */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-pink-300 hover:text-white hover:bg-white/10 -ml-2 mb-6 group"
            >
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back
            </Button>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <motion.span
                animate={{ scale: [1, 1.22, 1], rotate: [0, -12, 12, 0] }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="text-4xl select-none"
              >
                💝
              </motion.span>

              <h1
                className="text-5xl font-black tracking-tight"
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
                className="text-4xl select-none"
              >
                ✨
              </motion.span>
            </div>
            {!isEmpty && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-pink-300/60 text-sm mt-1"
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
              className="text-center py-20"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,107,157,0.07) 0%, rgba(196,77,255,0.07) 100%)",
                border: "1px solid rgba(255,107,157,0.18)",
                borderRadius: "24px",
                backdropFilter: "blur(20px)",
              }}
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
                className="text-7xl mb-6 select-none"
              >
                💌
              </motion.div>
              <p className="text-xl font-semibold text-white/70 mb-2">
                No messages yet
              </p>
              <p className="text-sm text-white/35">
                Your students will send you love after lessons
              </p>
              <div className="flex justify-center gap-4 mt-8">
                {["❤️", "💜", "💛", "💚", "💙"].map((h, i) => (
                  <motion.span
                    key={i}
                    animate={{ y: [0, -9, 0] }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.22,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="text-xl opacity-40 select-none"
                  >
                    {h}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="space-y-5">
              {messages.map((msg, index) => (
                <motion.div
                  key={msg._id}
                  initial={{ opacity: 0, y: 28, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  style={{
                    background: !msg.isRead
                      ? "linear-gradient(135deg, rgba(255,107,157,0.11) 0%, rgba(196,77,255,0.07) 100%)"
                      : "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
                    border: !msg.isRead
                      ? "1px solid rgba(255,107,157,0.32)"
                      : "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "20px",
                    backdropFilter: "blur(16px)",
                    boxShadow: !msg.isRead
                      ? "0 4px 28px rgba(255,107,157,0.1)"
                      : "0 4px 20px rgba(0,0,0,0.28)",
                  }}
                  className="p-6"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <Avatar className="h-14 w-14 ring-2 ring-pink-500/35 ring-offset-2 ring-offset-transparent">
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
                          className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full border-2"
                          style={{ borderColor: "#0a0014" }}
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Name + date */}
                      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                        <div>
                          <h3 className="font-bold text-white">
                            {msg.studentName}
                          </h3>
                          <p className="text-xs text-white/35 mt-0.5">
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
                      <div
                        className="rounded-2xl p-4 mb-4"
                        style={{
                          background: "rgba(255,255,255,0.055)",
                          border: "1px solid rgba(255,255,255,0.09)",
                        }}
                      >
                        <p className="text-white/82 leading-relaxed">
                          {msg.message}
                        </p>
                      </div>

                      {/* Response or actions */}
                      {msg.teacherResponse ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(196,77,255,0.13), rgba(255,107,157,0.09))",
                            border: "1px solid rgba(196,77,255,0.28)",
                            borderRadius: "16px",
                          }}
                          className="p-4"
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-9 w-9 shrink-0">
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
                                <span className="text-xs font-semibold text-purple-300">
                                  {userDetail.name || "You"}
                                </span>
                                <span className="text-xs text-white/28">
                                  ✓{" "}
                                  {format(
                                    new Date(msg.teacherResponse.timestamp),
                                    "MMM d, HH:mm",
                                  )}
                                </span>
                              </div>
                              {msg.teacherResponse.emoji && (
                                <div className="text-2xl mb-1">
                                  {msg.teacherResponse.emoji}
                                </div>
                              )}
                              {msg.teacherResponse.message && (
                                <p className="text-sm text-white/72">
                                  {msg.teacherResponse.message}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="flex flex-wrap gap-2 items-center">
                          {EMOJI_OPTIONS.map((emoji, ei) => (
                            <motion.button
                              key={emoji}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: ei * 0.04 }}
                              whileHover={{ scale: 1.28, y: -4 }}
                              whileTap={{ scale: 0.88 }}
                              onClick={() => handleQuickEmoji(msg._id, emoji)}
                              className="text-xl w-10 h-10 flex items-center justify-center rounded-xl cursor-pointer"
                              style={{
                                background: "rgba(255,255,255,0.055)",
                                border: "1px solid rgba(255,255,255,0.1)",
                              }}
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
                              className="text-white font-semibold shadow-lg shadow-pink-500/25"
                            >
                              <Send className="h-3.5 w-3.5 mr-2" />
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
        <DialogContent
          className="sm:max-w-[500px]"
          style={{
            background: "linear-gradient(140deg, #1a0030 0%, #0d001f 100%)",
            border: "1px solid rgba(196,77,255,0.28)",
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Smile className="h-5 w-5 text-pink-400" />
              Respond to Thank You
            </DialogTitle>
            <DialogDescription className="text-white/45">
              Send an emoji or write a message back to your student
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div>
              <label className="text-sm font-medium mb-3 block text-white/65">
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
                    className="text-2xl w-12 h-12 flex items-center justify-center rounded-xl cursor-pointer transition-all"
                    style={{
                      background:
                        responseEmoji === emoji
                          ? "linear-gradient(135deg, rgba(196,77,255,0.4), rgba(255,107,157,0.4))"
                          : "rgba(255,255,255,0.055)",
                      border:
                        responseEmoji === emoji
                          ? "2px solid #ff6b9d"
                          : "1px solid rgba(255,255,255,0.1)",
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
              <label className="text-sm font-medium mb-2 block text-white/65">
                Add a message (optional)
              </label>
              <Textarea
                placeholder="No worries, thanks for letting me know — have a beautiful week! 🌟"
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                className="min-h-[110px] resize-none text-white placeholder:text-white/28"
                style={{
                  background: "rgba(255,255,255,0.055)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
                maxLength={300}
              />
              <p className="text-xs text-white/28 mt-1 text-right">
                {responseText.length}/300
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setSelectedMessage(null)}
              disabled={isResponding}
              className="text-white/55 hover:text-white hover:bg-white/10"
            >
              Cancel
            </Button>
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
