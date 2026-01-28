"use client";

import { motion } from "framer-motion";
import AdminGlobalMessages from "@/app/components/AdminGlobalMessages";

export default function AdminAnnouncementsPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <AdminGlobalMessages />
    </motion.div>
  );
}
