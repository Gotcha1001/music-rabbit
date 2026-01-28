"use client";

import { motion } from "framer-motion";
import { AdminCategoryManager } from "@/app/components/AdminCategoryManager";

export default function AdminCategoriesPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <AdminCategoryManager />
    </motion.div>
  );
}
