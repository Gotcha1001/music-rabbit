// "use client";

// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useQuery, useMutation } from "convex/react";

// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { BookOpen, Search, Sparkles, Check, X, ArrowRight } from "lucide-react";
// import { toast } from "sonner";
// import { Id } from "../../../convex/_generated/dataModel";
// import { api } from "../../../convex/_generated/api";

// type BookSelectorProps = {
//   currentBookId: Id<"books"> | null;
//   scheduleId: Id<"schedules">;
//   lessonId: string;
// };

// export function BookSelector({
//   currentBookId,
//   scheduleId,
//   lessonId,
// }: BookSelectorProps) {
//   const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
//   const [search, setSearch] = useState("");

//   const categories = useQuery(api.bookCategories.getActive) ?? [];
//   const books =
//     useQuery(
//       api.books.getByCategory,
//       selectedCategoryId
//         ? {
//             categoryId: selectedCategoryId as Id<"bookCategories">,
//             search: search || undefined,
//           }
//         : "skip",
//     ) ?? [];

//   const updateLesson = useMutation(api.schedules.updateLesson);

//   const handleBookSelect = async (bookId: Id<"books"> | null) => {
//     try {
//       await updateLesson({
//         scheduleId,
//         lessonId,
//         updates: { bookId },
//       });
//       toast.success(bookId ? "Book assigned!" : "Book removed");
//       setSelectedCategoryId("");
//       setSearch("");
//     } catch {
//       toast.error("Failed to update book");
//     }
//   };

//   if (!categories.length) {
//     return (
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="text-purple-400 text-center py-8"
//       >
//         No categories available
//       </motion.div>
//     );
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.95 }}
//       animate={{ opacity: 1, scale: 1 }}
//       transition={{ duration: 0.3 }}
//       className="relative mt-6"
//     >
//       {/* Radial gradient background */}
//       <div className="absolute inset-0 bg-gradient-radial from-purple-500/20 via-purple-900/10 to-transparent blur-3xl -z-10" />

//       <div className="relative space-y-6 p-6 bg-gradient-to-br from-purple-950/60 via-purple-900/40 to-indigo-950/60 rounded-2xl border border-purple-500/30 shadow-2xl backdrop-blur-sm">
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, x: -20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ delay: 0.1 }}
//           className="flex items-center justify-between"
//         >
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-lg">
//               <Sparkles className="h-5 w-5 text-white" />
//             </div>
//             <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-200 via-purple-100 to-indigo-200 bg-clip-text text-transparent">
//               Assign Book to Lesson
//             </h3>
//           </div>
//           {currentBookId && (
//             <Badge
//               variant="outline"
//               className="bg-purple-900/50 text-purple-200"
//             >
//               Current book assigned
//             </Badge>
//           )}
//         </motion.div>

//         {/* ─── NEW: Continue Series Suggestion ─── */}
//         {currentBookId && (
//           <motion.div
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="p-4 bg-purple-800/40 rounded-lg border border-purple-500/30 flex items-center justify-between gap-4"
//           >
//             <div className="flex-1">
//               <p className="text-sm text-purple-300 mb-1">
//                 Current series progress
//               </p>
//               <p className="font-medium text-purple-100">
//                 Continue automatically to next lesson in series?
//               </p>
//             </div>
//             <Button
//               size="sm"
//               className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
//               onClick={() => {
//                 // Placeholder — connect to real auto-next later
//                 toast.info("Auto-assign next lesson coming soon!");
//                 // Future: call getNextInSeries → updateLesson + update student currentBookId
//               }}
//             >
//               Continue Series <ArrowRight className="ml-2 h-4 w-4" />
//             </Button>
//           </motion.div>
//         )}

//         {/* Category selector */}
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//         >
//           <Select
//             value={selectedCategoryId}
//             onValueChange={setSelectedCategoryId}
//           >
//             <SelectTrigger className="bg-purple-900/60 border-purple-500/50 hover:border-purple-400/70 transition-all duration-200 backdrop-blur-sm shadow-lg">
//               <SelectValue placeholder="Choose a category..." />
//             </SelectTrigger>
//             <SelectContent>
//               {categories.map((cat) => (
//                 <SelectItem key={cat._id} value={cat._id}>
//                   <span className="flex items-center gap-2">
//                     {cat.icon && <span>{cat.icon}</span>}
//                     {cat.name}
//                     {cat.hasLevels && (
//                       <span className="text-xs text-purple-400 ml-2">
//                         (Levels 1–{cat.maxLevel ?? 10})
//                       </span>
//                     )}
//                   </span>
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </motion.div>

//         <AnimatePresence mode="wait">
//           {selectedCategoryId && (
//             <motion.div
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: "auto" }}
//               exit={{ opacity: 0, height: 0 }}
//               transition={{ duration: 0.3 }}
//               className="space-y-5"
//             >
//               {/* Search */}
//               <motion.div
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.1 }}
//                 className="relative"
//               >
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
//                 <Input
//                   placeholder="Search by title, level, series..."
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                   className="pl-10 bg-purple-900/60 border-purple-500/50 focus:border-purple-400 transition-all duration-200 backdrop-blur-sm shadow-lg"
//                 />
//               </motion.div>

//               {/* Books list */}
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ delay: 0.2 }}
//                 className="max-h-96 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-purple-900/20"
//               >
//                 {books.length === 0 ? (
//                   <motion.div
//                     initial={{ opacity: 0, scale: 0.9 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     className="text-center py-12"
//                   >
//                     <BookOpen className="h-12 w-12 text-purple-400/40 mx-auto mb-3" />
//                     <p className="text-purple-400/70">
//                       {search
//                         ? "No books match your search"
//                         : "No books in this category"}
//                     </p>
//                   </motion.div>
//                 ) : (
//                   <>
//                     {currentBookId && (
//                       <motion.div
//                         initial={{ opacity: 0, y: -10 }}
//                         animate={{ opacity: 1, y: 0 }}
//                       >
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           onClick={() => handleBookSelect(null)}
//                           className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/30 border border-red-800/30 hover:border-red-700/50 transition-all duration-200"
//                         >
//                           <X className="h-4 w-4 mr-2" />
//                           Remove current book assignment
//                         </Button>
//                       </motion.div>
//                     )}

//                     {books.map((book, index) => {
//                       const isSelected = book._id === currentBookId;
//                       return (
//                         <motion.div
//                           key={book._id}
//                           initial={{ opacity: 0, y: 20 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           transition={{ delay: index * 0.05 }}
//                           whileHover={{ scale: 1.02 }}
//                           whileTap={{ scale: 0.98 }}
//                         >
//                           <Card
//                             className={`relative p-5 cursor-pointer transition-all duration-300 overflow-hidden group ${
//                               isSelected
//                                 ? "border-purple-400 bg-gradient-to-br from-purple-900/70 to-indigo-900/70 shadow-xl shadow-purple-500/20"
//                                 : "border-purple-700/40 bg-purple-900/30 hover:border-purple-500/60 hover:bg-purple-900/50"
//                             }`}
//                             onClick={() => handleBookSelect(book._id)}
//                           >
//                             <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-400/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

//                             <div className="relative flex items-center justify-between">
//                               <div className="flex items-center gap-4 flex-1">
//                                 <motion.div
//                                   whileHover={{ rotate: [0, -10, 10, -10, 0] }}
//                                   transition={{ duration: 0.5 }}
//                                   className={`p-2.5 rounded-xl ${
//                                     isSelected
//                                       ? "bg-gradient-to-br from-purple-500 to-indigo-600"
//                                       : "bg-purple-800/50 group-hover:bg-purple-700/60"
//                                   } transition-all duration-300`}
//                                 >
//                                   <BookOpen className="h-5 w-5 text-purple-100" />
//                                 </motion.div>
//                                 <div className="flex-1">
//                                   <p
//                                     className={`font-semibold ${
//                                       isSelected
//                                         ? "text-purple-100"
//                                         : "text-purple-200 group-hover:text-purple-100"
//                                     } transition-colors duration-200`}
//                                   >
//                                     {book.title}
//                                   </p>
//                                   <p className="text-sm text-purple-400/90 mt-0.5 flex flex-wrap items-center gap-2">
//                                     {book.levelNumber && (
//                                       <span>Level {book.levelNumber}</span>
//                                     )}
//                                     {book.levelNumber &&
//                                       book.subcategory &&
//                                       " • "}
//                                     {book.subcategory || "General"}

//                                     {/* ─── SERIES BADGE ─── */}
//                                     {book.seriesGroup && (
//                                       <Badge
//                                         variant="outline"
//                                         className="ml-2 bg-purple-900/50 text-purple-200 border-purple-500/50"
//                                       >
//                                         {book.seriesGroup}
//                                         {book.seriesOrder &&
//                                           ` • #${book.seriesOrder}`}
//                                         {book.isSeriesEnd && " (End)"}
//                                       </Badge>
//                                     )}
//                                   </p>
//                                 </div>
//                               </div>

//                               {isSelected && (
//                                 <motion.div
//                                   initial={{ scale: 0 }}
//                                   animate={{ scale: 1 }}
//                                   className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-400/30 rounded-full"
//                                 >
//                                   <Check className="h-3.5 w-3.5 text-emerald-400" />
//                                   <span className="text-xs text-emerald-400 font-semibold">
//                                     Current
//                                   </span>
//                                 </motion.div>
//                               )}
//                             </div>
//                           </Card>
//                         </motion.div>
//                       );
//                     })}
//                   </>
//                 )}
//               </motion.div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </motion.div>
//   );
// }
"use client";

import { useState, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import { BookOpen, Search, Sparkles, Check, X, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Id, Doc } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";

const UNCATEGORISED_VALUE = "uncategorised";

type BookSelectorProps = {
  currentBookId: Id<"books"> | null;
  scheduleId: Id<"schedules">;
  lessonId: string;
};

export function BookSelector({
  currentBookId,
  scheduleId,
  lessonId,
}: BookSelectorProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [search, setSearch] = useState("");

  const categories = useQuery(api.bookCategories.getActive) ?? [];

  // Categorised books — only fetched when a real category is selected
  const categorisedBooks =
    useQuery(
      api.books.getByCategory,
      selectedCategoryId && selectedCategoryId !== UNCATEGORISED_VALUE
        ? {
            categoryId: selectedCategoryId as Id<"bookCategories">,
            search: search || undefined,
          }
        : "skip",
    ) ?? [];

  // All books — only fetched when "Other Books" is selected, to find uncategorised ones
  const allBooks =
    useQuery(
      api.books.getAllActive,
      selectedCategoryId === UNCATEGORISED_VALUE ? {} : "skip",
    ) ?? [];

  // Filter uncategorised books client-side:
  // includes books with no categoryId AND orphans (categoryId set but
  // pointing to an inactive/deleted category — same logic as teacher/student pages)
  const uncategorisedBooks = useMemo<Doc<"books">[]>(() => {
    if (selectedCategoryId !== UNCATEGORISED_VALUE) return [];

    // Build a set of active category IDs so we can detect orphans
    const activeCatIds = new Set(categories.map((c) => c._id));

    const term = search.trim().toLowerCase();
    return allBooks.filter((book) => {
      const isUncategorised =
        !book.categoryId || !activeCatIds.has(book.categoryId);
      if (!isUncategorised) return false;
      if (!term) return true;
      return (
        book.title.toLowerCase().includes(term) ||
        book.instrument.toLowerCase().includes(term) ||
        (book.description?.toLowerCase().includes(term) ?? false) ||
        (book.subcategory?.toLowerCase().includes(term) ?? false) ||
        (book.levelNumber?.toString().includes(term) ?? false) ||
        (book.seriesGroup?.toLowerCase().includes(term) ?? false) ||
        (book.tags?.some((t) => t.toLowerCase().includes(term)) ?? false)
      );
    });
  }, [allBooks, categories, search, selectedCategoryId]);

  // Final list of books to display
  const books: Doc<"books">[] =
    selectedCategoryId === UNCATEGORISED_VALUE
      ? uncategorisedBooks
      : categorisedBooks;

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

      <div className="relative space-y-6 p-6 bg-gradient-to-br from-purple-950/60 via-purple-900/40 to-indigo-950/60 rounded-2xl border border-purple-500/30 shadow-2xl backdrop-blur-sm">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-200 via-purple-100 to-indigo-200 bg-clip-text text-transparent">
              Assign Book to Lesson
            </h3>
          </div>
          {currentBookId && (
            <Badge
              variant="outline"
              className="bg-purple-900/50 text-purple-200"
            >
              Current book assigned
            </Badge>
          )}
        </motion.div>

        {/* Continue Series Suggestion */}
        {currentBookId && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-purple-800/40 rounded-lg border border-purple-500/30 flex items-center justify-between gap-4"
          >
            <div className="flex-1">
              <p className="text-sm text-purple-300 mb-1">
                Current series progress
              </p>
              <p className="font-medium text-purple-100">
                Continue automatically to next lesson in series?
              </p>
            </div>
            <Button
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              onClick={() => {
                toast.info("Auto-assign next lesson coming soon!");
              }}
            >
              Continue Series <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {/* Category selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Select
            value={selectedCategoryId}
            onValueChange={(val) => {
              setSelectedCategoryId(val);
              setSearch("");
            }}
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
              {/* ── Other / Uncategorised books ── */}
              <SelectItem value={UNCATEGORISED_VALUE}>
                <span className="flex items-center gap-2">
                  <span>📄</span>
                  Other Books
                  <span className="text-xs text-purple-400 ml-2">
                    (uncategorised)
                  </span>
                </span>
              </SelectItem>
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
              className="space-y-5"
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
                  placeholder="Search by title, level, series..."
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
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleBookSelect(null)}
                          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/30 border border-red-800/30 hover:border-red-700/50 transition-all duration-200"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remove current book assignment
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
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-400/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            <div className="relative flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1">
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

                                <div className="flex-1">
                                  <p
                                    className={`font-semibold ${
                                      isSelected
                                        ? "text-purple-100"
                                        : "text-purple-200 group-hover:text-purple-100"
                                    } transition-colors duration-200`}
                                  >
                                    {book.title}
                                  </p>
                                  <p className="text-sm text-purple-400/90 mt-0.5 flex flex-wrap items-center gap-2">
                                    {book.levelNumber && (
                                      <span>Level {book.levelNumber}</span>
                                    )}
                                    {book.levelNumber &&
                                      book.subcategory &&
                                      " • "}
                                    {book.subcategory || "General"}

                                    {/* Series badge */}
                                    {book.seriesGroup && (
                                      <Badge
                                        variant="outline"
                                        className="ml-2 bg-purple-900/50 text-purple-200 border-purple-500/50"
                                      >
                                        {book.seriesGroup}
                                        {book.seriesOrder &&
                                          ` • #${book.seriesOrder}`}
                                        {book.isSeriesEnd && " (End)"}
                                      </Badge>
                                    )}

                                    {/* Instrument badge */}
                                    <Badge
                                      variant="outline"
                                      className="ml-1 bg-purple-900/30 text-purple-300 border-purple-600/40 text-xs"
                                    >
                                      {book.instrument}
                                    </Badge>
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
