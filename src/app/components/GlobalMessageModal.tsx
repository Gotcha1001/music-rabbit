import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Bell, Info, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const GlobalMessageModal = () => {
  const currentUser = useQuery(api.users.get);
  const unreadMessages = useQuery(api.globalMessages.getUnreadForTeacher);
  const markAsRead = useMutation(api.globalMessages.markAsRead);

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  if (!currentUser || currentUser.role !== "teacher") return null;
  if (!unreadMessages || unreadMessages.length === 0) return null;

  // Derive modal open state from data - if there are messages, modal is open
  const isOpen = unreadMessages.length > 0;

  // Ensure index is within bounds
  const safeIndex = Math.min(currentMessageIndex, unreadMessages.length - 1);
  const currentMessage = unreadMessages[safeIndex];
  const hasMoreMessages = safeIndex < unreadMessages.length - 1;

  const handleAcknowledge = async () => {
    try {
      await markAsRead({ messageId: currentMessage._id });

      if (hasMoreMessages) {
        // Show next message (which will be at the same index after current is removed)
        // Don't increment - the array will shift and next message will be at current index
      } else {
        // Reset index for next time modal opens
        setCurrentMessageIndex(0);
      }
      // If no more messages, modal will close automatically when unreadMessages updates
    } catch (error) {
      console.error("Failed to mark message as read:", error);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertTriangle className="h-8 w-8 text-red-500" />;
      case "important":
        return <Bell className="h-8 w-8 text-orange-500" />;
      default:
        return <Info className="h-8 w-8 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "from-red-950/90 to-red-900/80 border-red-700/50";
      case "important":
        return "from-orange-950/90 to-orange-900/80 border-orange-700/50";
      default:
        return "from-blue-950/90 to-blue-900/80 border-blue-700/50";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return (
          <Badge className="bg-red-600 text-white border-red-500">
            🚨 URGENT
          </Badge>
        );
      case "important":
        return (
          <Badge className="bg-orange-600 text-white border-orange-500">
            ⚠️ IMPORTANT
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-600 text-white border-blue-500">
            ℹ️ NOTICE
          </Badge>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className={`max-w-2xl bg-gradient-to-br ${getPriorityColor(
          currentMessage.priority
        )} border-2 backdrop-blur-md`}
        // Prevent closing by clicking outside or ESC
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMessage._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <DialogHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getPriorityIcon(currentMessage.priority)}
                  <DialogTitle className="text-3xl font-bold text-white">
                    Message from HR
                  </DialogTitle>
                </div>
                {getPriorityBadge(currentMessage.priority)}
              </div>

              {unreadMessages.length > 1 && (
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-white border-white/30"
                  >
                    Message {currentMessageIndex + 1} of {unreadMessages.length}
                  </Badge>
                </div>
              )}

              <DialogDescription className="text-white/80 text-base">
                {new Date(currentMessage.createdAt).toLocaleString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 mb-8">
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <p className="text-white text-lg leading-relaxed whitespace-pre-wrap">
                  {currentMessage.content}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleAcknowledge}
                size="lg"
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold text-lg py-6"
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                {hasMoreMessages
                  ? "Acknowledge & Continue"
                  : "Acknowledge & Close"}
              </Button>

              {hasMoreMessages && (
                <p className="text-center text-white/60 text-sm">
                  You have {unreadMessages.length - currentMessageIndex - 1}{" "}
                  more message
                  {unreadMessages.length - currentMessageIndex - 1 > 1
                    ? "s"
                    : ""}{" "}
                  to read
                </p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default GlobalMessageModal;
