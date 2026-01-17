"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "convex/react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Search, Sparkles, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";

type BookSelectorProps = {
  currentBookId: Id<"books"> | null;
  scheduleId: Id<"schedules">;
  lessonId: string;
  // These are kept in props in case you want to use them later (e.g. filtering)
  // studentId?: Id<"users">;
  // instrument?: string;
};

export function BookSelector({
  currentBookId,
  scheduleId,
  lessonId,
}: BookSelectorProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [search, setSearch] = useState("");

  const categories = useQuery(api.bookCategories.getActive) ?? [];
  const books =
    useQuery(
      api.books.getByCategory,
      selectedCategoryId
        ? {
            categoryId: selectedCategoryId as Id<"bookCategories">,
            search: search || undefined,
          }
        : "skip"
    ) ?? [];

  const updateLesson = useMutation(api.schedules.updateLesson);

  const handleBookSelect = async (bookId: Id<"books"> | null) => {
    try {
      await updateLesson({
        scheduleId,
        lessonId,
        updates: { bookId },
      });
      toast.success(bookId ? "Book assigned!" : "Book removed");
      setSelectedCategoryId("");
      setSearch("");
    } catch {
      // No need for the error parameter if we're not using it
      toast.error("Failed to update book");
    }
  };

  if (!categories.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-purple-400 text-center py-8"
      >
        No categories available
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="relative mt-6"
    >
      {/* Radial gradient background */}
      <div className="absolute inset-0 bg-gradient-radial from-purple-500/20 via-purple-900/10 to-transparent blur-3xl -z-10" />

      <div className="relative space-y-5 p-6 bg-gradient-to-br from-purple-950/60 via-purple-900/40 to-indigo-950/60 rounded-2xl border border-purple-500/30 shadow-2xl backdrop-blur-sm">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3"
        >
          <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-lg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-200 via-purple-100 to-indigo-200 bg-clip-text text-transparent">
            Change Assigned Book
          </h3>
        </motion.div>

        {/* Category selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Select
            value={selectedCategoryId}
            onValueChange={setSelectedCategoryId}
          >
            <SelectTrigger className="bg-purple-900/60 border-purple-500/50 hover:border-purple-400/70 transition-all duration-200 backdrop-blur-sm shadow-lg">
              <SelectValue placeholder="Choose a category..." />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat._id} value={cat._id}>
                  <span className="flex items-center gap-2">
                    {cat.icon && <span>{cat.icon}</span>}
                    {cat.name}
                    {cat.hasLevels && (
                      <span className="text-xs text-purple-400 ml-2">
                        (Levels 1–{cat.maxLevel ?? 10})
                      </span>
                    )}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        <AnimatePresence mode="wait">
          {selectedCategoryId && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Search */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="relative"
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
                <Input
                  placeholder="Search by title, level, volume..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-purple-900/60 border-purple-500/50 focus:border-purple-400 transition-all duration-200 backdrop-blur-sm shadow-lg"
                />
              </motion.div>

              {/* Books list */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="max-h-96 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-purple-900/20"
              >
                {books.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <BookOpen className="h-12 w-12 text-purple-400/40 mx-auto mb-3" />
                    <p className="text-purple-400/70">
                      {search
                        ? "No books match your search"
                        : "No books in this category"}
                    </p>
                  </motion.div>
                ) : (
                  <>
                    {currentBookId && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleBookSelect(null)}
                          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/30 border border-red-800/30 hover:border-red-700/50 transition-all duration-200"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remove current book
                        </Button>
                      </motion.div>
                    )}

                    {books.map((book, index) => {
                      const isSelected = book._id === currentBookId;
                      return (
                        <motion.div
                          key={book._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Card
                            className={`relative p-5 cursor-pointer transition-all duration-300 overflow-hidden group ${
                              isSelected
                                ? "border-purple-400 bg-gradient-to-br from-purple-900/70 to-indigo-900/70 shadow-xl shadow-purple-500/20"
                                : "border-purple-700/40 bg-purple-900/30 hover:border-purple-500/60 hover:bg-purple-900/50"
                            }`}
                            onClick={() => handleBookSelect(book._id)}
                          >
                            {/* Hover gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-400/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            <div className="relative flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <motion.div
                                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                                  transition={{ duration: 0.5 }}
                                  className={`p-2.5 rounded-xl ${
                                    isSelected
                                      ? "bg-gradient-to-br from-purple-500 to-indigo-600"
                                      : "bg-purple-800/50 group-hover:bg-purple-700/60"
                                  } transition-all duration-300`}
                                >
                                  <BookOpen className="h-5 w-5 text-purple-100" />
                                </motion.div>
                                <div>
                                  <p
                                    className={`font-semibold ${
                                      isSelected
                                        ? "text-purple-100"
                                        : "text-purple-200 group-hover:text-purple-100"
                                    } transition-colors duration-200`}
                                  >
                                    {book.title}
                                  </p>
                                  <p className="text-sm text-purple-400/90 mt-0.5">
                                    {book.levelNumber && (
                                      <span className="font-medium">
                                        Level {book.levelNumber}
                                      </span>
                                    )}
                                    {book.levelNumber &&
                                      book.subcategory &&
                                      " • "}
                                    {book.subcategory || "General"}
                                  </p>
                                </div>
                              </div>

                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-400/30 rounded-full"
                                >
                                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                                  <span className="text-xs text-emerald-400 font-semibold">
                                    Current
                                  </span>
                                </motion.div>
                              )}
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
