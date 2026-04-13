// app/components/AdminGlobalMessages.tsx
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Send,
  Trash2,
  EyeOff,
  AlertTriangle,
  Bell,
  Info,
  Users,
  CheckCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

const AGM_STYLES = `
  .agm-page { background: #ffffff !important; }
  .dark .agm-page { background: linear-gradient(to bottom, #000000, #1a0030, #000000) !important; }
  .agm-title { color: hsl(var(--primary)) !important; background: none !important; -webkit-text-fill-color: hsl(var(--primary)) !important; }
  .dark .agm-title { color: transparent !important; -webkit-text-fill-color: transparent !important; background: linear-gradient(to right, #ddd6fe, #a78bfa, #ddd6fe) !important; -webkit-background-clip: text !important; background-clip: text !important; }
  .agm-subtitle { color: hsl(var(--muted-foreground)) !important; }
  .dark .agm-subtitle { color: #c4b5fd !important; }
  .agm-card { background: #ffffff !important; border-color: hsl(var(--border)) !important; box-shadow: 0 2px 12px rgba(0,0,0,0.07) !important; }
  .dark .agm-card { background: linear-gradient(to bottom right, hsl(270 90% 5%), #000000) !important; border-color: rgba(109,40,217,0.3) !important; box-shadow: 0 0 40px rgba(168,85,247,0.2) !important; }
  .agm-card-title { color: hsl(var(--foreground)) !important; }
  .dark .agm-card-title { color: #ddd6fe !important; }
  .agm-label { color: hsl(var(--foreground)) !important; }
  .dark .agm-label { color: #c4b5fd !important; }
  .agm-select { background: #ffffff !important; border-color: hsl(var(--border)) !important; color: hsl(var(--foreground)) !important; }
  .dark .agm-select { background: rgba(76,29,149,0.3) !important; border-color: rgba(109,40,217,0.5) !important; color: #ddd6fe !important; }
  .agm-textarea { background: #ffffff !important; border-color: hsl(var(--border)) !important; color: hsl(var(--foreground)) !important; }
  .agm-textarea:focus { border-color: hsl(var(--primary)) !important; box-shadow: 0 0 0 2px hsl(var(--primary)/0.2) !important; }
  .agm-textarea::placeholder { color: hsl(var(--muted-foreground)) !important; }
  .dark .agm-textarea { background: rgba(76,29,149,0.2) !important; border-color: rgba(109,40,217,0.3) !important; color: #ddd6fe !important; }
  .dark .agm-textarea::placeholder { color: rgba(167,139,250,0.5) !important; }
  .agm-send-btn { background: hsl(var(--primary)) !important; color: #ffffff !important; }
  .agm-send-btn:hover:not(:disabled) { background: hsl(var(--primary)/0.9) !important; }
  .agm-send-btn:disabled { opacity: 0.5 !important; cursor: not-allowed !important; }
  .dark .agm-send-btn { background: linear-gradient(to right, #7c3aed, #6d28d9) !important; }
  .agm-msg-active { background: hsl(var(--primary)/0.04) !important; border-color: hsl(var(--primary)/0.2) !important; }
  .dark .agm-msg-active { background: rgba(76,29,149,0.3) !important; border-color: rgba(109,40,217,0.5) !important; }
  .agm-msg-inactive { background: hsl(var(--muted)/0.3) !important; border-color: hsl(var(--border)) !important; opacity: 0.65 !important; }
  .dark .agm-msg-inactive { background: rgba(46,16,101,0.2) !important; border-color: rgba(109,40,217,0.3) !important; }
  .agm-msg-time { color: hsl(var(--muted-foreground)) !important; }
  .agm-msg-content { color: hsl(var(--foreground)) !important; }
  .dark .agm-msg-time { color: #c4b5fd !important; }
  .dark .agm-msg-content { color: #ddd6fe !important; }
  .agm-stats-divider { border-color: hsl(var(--border)) !important; }
  .agm-stats-text { color: hsl(var(--muted-foreground)) !important; }
  .dark .agm-stats-divider { border-color: rgba(109,40,217,0.3) !important; }
  .dark .agm-stats-text { color: #c4b5fd !important; }
  .agm-action-btn { color: hsl(var(--muted-foreground)) !important; background: transparent !important; }
  .agm-action-btn:hover { background: hsl(var(--muted)) !important; }
  .dark .agm-action-btn { color: #a78bfa !important; }
  .dark .agm-action-btn:hover { background: rgba(76,29,149,0.3) !important; }
  .agm-empty { color: hsl(var(--muted-foreground)) !important; }
  .dark .agm-empty { color: #a78bfa !important; }
`;

type MessageWithStats = {
  _id: Id<"globalMessages">;
  _creationTime: number;
  isActive: boolean;
  createdAt: number;
  createdBy: Id<"users">;
  content: string;
  priority: "normal" | "important" | "urgent";
  readBy: Id<"users">[];
  totalTeachers: number;
  readCount: number;
  percentageRead: number;
};
type BasicMessage = {
  _id: Id<"globalMessages">;
  _creationTime: number;
  isActive: boolean;
  createdAt: number;
  createdBy: Id<"users">;
  content: string;
  priority: "normal" | "important" | "urgent";
  readBy: Id<"users">[];
};
const hasStats = (
  msg: BasicMessage | MessageWithStats,
): msg is MessageWithStats => "totalTeachers" in msg;

export default function AdminGlobalMessages() {
  const currentUser = useQuery(api.users.getMe);
  const isAdmin = currentUser?.role === "admin";
  const adminMessages = useQuery(
    api.globalMessages.getAllWithStats,
    isAdmin ? {} : "skip",
  );
  const teacherMessages = useQuery(
    api.globalMessages.getActiveMessages,
    !isAdmin ? {} : "skip",
  );
  const messages = (isAdmin ? adminMessages : teacherMessages) ?? [];
  const createMessage = useMutation(api.globalMessages.create);
  const deactivateMessage = useMutation(api.globalMessages.deactivate);
  const deleteMessage = useMutation(api.globalMessages.remove);
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<"normal" | "important" | "urgent">(
    "normal",
  );
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!content.trim()) return toast.error("Message content is required");
    setIsCreating(true);
    try {
      await createMessage({ content: content.trim(), priority });
      toast.success("Global message sent to all teachers!");
      setContent("");
      setPriority("normal");
    } catch {
      toast.error("Failed to send message");
    } finally {
      setIsCreating(false);
    }
  };
  const handleDeactivate = async (messageId: Id<"globalMessages">) => {
    try {
      await deactivateMessage({ messageId });
      toast.success("Message deactivated");
    } catch {
      toast.error("Failed to deactivate");
    }
  };
  const handleDelete = async (messageId: Id<"globalMessages">) => {
    try {
      await deleteMessage({ messageId });
      toast.success("Message deleted permanently");
    } catch {
      toast.error("Failed to delete");
    }
  };
  const getPriorityIcon = (p: string) => {
    if (p === "urgent")
      return (
        <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 shrink-0" />
      );
    if (p === "important")
      return (
        <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 shrink-0" />
      );
    return <Info className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 shrink-0" />;
  };

  if (!isAdmin && messages?.length === 0) return null;

  return (
    <div className="agm-page min-h-screen p-4 sm:p-6">
      <style>{AGM_STYLES}</style>
      <div className="container mx-auto max-w-6xl space-y-6 sm:space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="agm-title text-3xl sm:text-5xl font-bold mb-3 sm:mb-4 font-serif">
            Global Teacher Announcements
          </h1>
          <p className="agm-subtitle text-base sm:text-lg">
            Send important messages that all teachers must acknowledge
          </p>
        </motion.div>

        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="agm-card rounded-xl border-2 overflow-hidden shadow-sm">
              <div className="p-4 sm:p-6 border-b border-inherit">
                <h2 className="agm-card-title flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl font-bold font-serif">
                  <Send className="h-6 w-6 sm:h-7 sm:w-7 text-primary dark:text-purple-400 shrink-0" />
                  Create New Announcement
                </h2>
              </div>
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                <div>
                  <label className="agm-label text-sm sm:text-lg font-medium block mb-2 font-serif">
                    Priority Level
                  </label>
                  <Select
                    value={priority}
                    onValueChange={(v) => setPriority(v as typeof priority)}
                  >
                    <SelectTrigger className="agm-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">
                        <div className="flex items-center gap-2">
                          <Info className="h-4 w-4 text-blue-500" />
                          Normal
                        </div>
                      </SelectItem>
                      <SelectItem value="important">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4 text-orange-500" />
                          Important
                        </div>
                      </SelectItem>
                      <SelectItem value="urgent">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          Urgent
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="agm-label text-sm sm:text-lg font-medium block mb-2 font-serif">
                    Message Content
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter your announcement..."
                    rows={6}
                    className="agm-textarea w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none transition-all"
                  />
                </div>
                <button
                  onClick={handleCreate}
                  disabled={isCreating || !content.trim()}
                  className="agm-send-btn w-full flex items-center justify-center gap-2 py-3 rounded-xl text-base font-semibold transition-all duration-200"
                >
                  {isCreating ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Send to All Teachers
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="agm-card rounded-xl border-2 overflow-hidden shadow-sm">
            <div className="p-4 sm:p-6 border-b border-inherit">
              <h2 className="agm-card-title flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl font-bold font-serif">
                <Clock className="h-6 w-6 sm:h-7 sm:w-7 text-primary dark:text-purple-400 shrink-0" />
                Message History
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              {!messages || messages.length === 0 ? (
                <p className="agm-empty text-center py-10 sm:py-12 font-serif text-sm sm:text-base">
                  No messages sent yet
                </p>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {messages.map((msg, index) => (
                    <motion.div
                      key={msg._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`${msg.isActive ? "agm-msg-active" : "agm-msg-inactive"} p-4 sm:p-6 rounded-lg border-2`}
                    >
                      <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                          {getPriorityIcon(msg.priority)}
                          <span className="agm-msg-time text-xs sm:text-sm font-serif">
                            {new Date(msg.createdAt).toLocaleString()}
                          </span>
                          {!msg.isActive && (
                            <Badge variant="secondary" className="text-xs">
                              Deactivated
                            </Badge>
                          )}
                        </div>
                        {isAdmin && (
                          <div className="flex gap-1 shrink-0">
                            {msg.isActive && (
                              <button
                                onClick={() => handleDeactivate(msg._id)}
                                className="agm-action-btn p-1.5 rounded-lg text-orange-500 transition-all"
                              >
                                <EyeOff className="h-4 w-4" />
                              </button>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button className="agm-action-btn p-1.5 rounded-lg text-red-500 transition-all">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Message?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(msg._id)}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                      <p className="agm-msg-content whitespace-pre-wrap text-sm sm:text-base mb-3 sm:mb-4 font-serif">
                        {msg.content}
                      </p>
                      {isAdmin && hasStats(msg) && (
                        <div className="agm-stats-divider flex items-center gap-4 sm:gap-6 pt-3 sm:pt-4 border-t flex-wrap">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary dark:text-purple-400 shrink-0" />
                            <span className="agm-stats-text text-xs sm:text-sm">
                              {msg.totalTeachers} teachers
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                            <span className="agm-stats-text text-xs sm:text-sm">
                              {msg.readCount || 0} read (
                              {msg.percentageRead || 0}%)
                            </span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
