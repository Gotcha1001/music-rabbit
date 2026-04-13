// "use client";

// import { useState, useMemo } from "react";
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
// import { Id, Doc } from "../../../convex/_generated/dataModel";
// import { api } from "../../../convex/_generated/api";

// const UNCATEGORISED_VALUE = "uncategorised";

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

//   // Global search mode: typing without a category selected searches ALL books
//   const isGlobalSearch = search.trim() !== "" && !selectedCategoryId;

//   // All books — fetched for global search OR for uncategorised view
//   const allBooks =
//     useQuery(
//       api.books.getAllActive,
//       selectedCategoryId === UNCATEGORISED_VALUE || isGlobalSearch
//         ? {}
//         : "skip",
//     ) ?? [];

//   // Categorised books — only fetched when a specific category is selected
//   const categorisedBooks =
//     useQuery(
//       api.books.getByCategory,
//       selectedCategoryId && selectedCategoryId !== UNCATEGORISED_VALUE
//         ? {
//             categoryId: selectedCategoryId as Id<"bookCategories">,
//             search: search || undefined,
//           }
//         : "skip",
//     ) ?? [];

//   // Build lowercase category name map for cross-category search
//   const catNameMap = useMemo(() => {
//     return new Map(
//       categories.map((c) => [c._id as string, c.name.toLowerCase()]),
//     );
//   }, [categories]);

//   // Global search across all books including by category name
//   const globalSearchResults = useMemo<Doc<"books">[]>(() => {
//     const term = search.trim().toLowerCase();
//     if (!isGlobalSearch) return [];
//     return allBooks.filter(
//       (book) =>
//         book.title.toLowerCase().includes(term) ||
//         book.instrument.toLowerCase().includes(term) ||
//         (book.description?.toLowerCase().includes(term) ?? false) ||
//         (book.subcategory?.toLowerCase().includes(term) ?? false) ||
//         (book.levelNumber?.toString().includes(term) ?? false) ||
//         (book.seriesGroup?.toLowerCase().includes(term) ?? false) ||
//         (book.tags?.some((t) => t.toLowerCase().includes(term)) ?? false) ||
//         (book.categoryId
//           ? (catNameMap.get(book.categoryId as string) ?? "").includes(term)
//           : false),
//     );
//   }, [allBooks, search, isGlobalSearch, catNameMap]);

//   // Uncategorised books (with orphan detection)
//   const uncategorisedBooks = useMemo<Doc<"books">[]>(() => {
//     if (selectedCategoryId !== UNCATEGORISED_VALUE) return [];
//     const activeCatIds = new Set(categories.map((c) => c._id));
//     const term = search.trim().toLowerCase();
//     return allBooks.filter((book) => {
//       const isUncategorised =
//         !book.categoryId || !activeCatIds.has(book.categoryId);
//       if (!isUncategorised) return false;
//       if (!term) return true;
//       return (
//         book.title.toLowerCase().includes(term) ||
//         book.instrument.toLowerCase().includes(term) ||
//         (book.description?.toLowerCase().includes(term) ?? false) ||
//         (book.subcategory?.toLowerCase().includes(term) ?? false) ||
//         (book.levelNumber?.toString().includes(term) ?? false) ||
//         (book.seriesGroup?.toLowerCase().includes(term) ?? false) ||
//         (book.tags?.some((t) => t.toLowerCase().includes(term)) ?? false)
//       );
//     });
//   }, [allBooks, categories, search, selectedCategoryId]);

//   // Final list of books to display
//   const books: Doc<"books">[] = isGlobalSearch
//     ? globalSearchResults
//     : selectedCategoryId === UNCATEGORISED_VALUE
//       ? uncategorisedBooks
//       : categorisedBooks;

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

//   const showBookList = isGlobalSearch || !!selectedCategoryId;

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

//         {/* Continue Series Suggestion */}
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
//               onClick={() => toast.info("Auto-assign next lesson coming soon!")}
//             >
//               Continue Series <ArrowRight className="ml-2 h-4 w-4" />
//             </Button>
//           </motion.div>
//         )}

//         {/* Search — always visible, searches all books by title/instrument/category/series */}
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.15 }}
//           className="relative"
//         >
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
//           <Input
//             placeholder="Search by title, instrument, category, series…"
//             value={search}
//             onChange={(e) => {
//               setSearch(e.target.value);
//               // Typing clears category so we go into global search mode
//               if (e.target.value.trim() !== "") setSelectedCategoryId("");
//             }}
//             className="pl-10 bg-purple-900/60 border-purple-500/50 focus:border-purple-400 transition-all duration-200 backdrop-blur-sm shadow-lg"
//           />
//           {search && (
//             <button
//               onClick={() => setSearch("")}
//               className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-200 transition-colors"
//             >
//               <X className="h-4 w-4" />
//             </button>
//           )}
//         </motion.div>

//         {/* Category selector — hidden while doing a global search */}
//         <AnimatePresence>
//           {!isGlobalSearch && (
//             <motion.div
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: "auto" }}
//               exit={{ opacity: 0, height: 0 }}
//               transition={{ duration: 0.2 }}
//             >
//               <Select
//                 value={selectedCategoryId}
//                 onValueChange={(val) => {
//                   setSelectedCategoryId(val);
//                   setSearch("");
//                 }}
//               >
//                 <SelectTrigger className="bg-purple-900/60 border-purple-500/50 hover:border-purple-400/70 transition-all duration-200 backdrop-blur-sm shadow-lg">
//                   <SelectValue placeholder="Or browse by category…" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {categories.map((cat) => (
//                     <SelectItem key={cat._id} value={cat._id}>
//                       <span className="flex items-center gap-2">
//                         {cat.icon && <span>{cat.icon}</span>}
//                         {cat.name}
//                         {cat.hasLevels && (
//                           <span className="text-xs text-purple-400 ml-2">
//                             (Levels 1–{cat.maxLevel ?? 10})
//                           </span>
//                         )}
//                       </span>
//                     </SelectItem>
//                   ))}
//                   <SelectItem value={UNCATEGORISED_VALUE}>
//                     <span className="flex items-center gap-2">
//                       <span>📄</span>
//                       Other Books
//                       <span className="text-xs text-purple-400 ml-2">
//                         (uncategorised)
//                       </span>
//                     </span>
//                   </SelectItem>
//                 </SelectContent>
//               </Select>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* Global search hint */}
//         <AnimatePresence>
//           {isGlobalSearch && (
//             <motion.p
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="text-xs text-purple-400/80 -mt-3"
//             >
//               Searching across all categories
//             </motion.p>
//           )}
//         </AnimatePresence>

//         {/* Books list */}
//         <AnimatePresence mode="wait">
//           {showBookList && (
//             <motion.div
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: "auto" }}
//               exit={{ opacity: 0, height: 0 }}
//               transition={{ duration: 0.3 }}
//             >
//               <div className="max-h-96 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-purple-900/20">
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
//                       // Show which category a book belongs to in global search results
//                       const catName =
//                         isGlobalSearch && book.categoryId
//                           ? categories.find((c) => c._id === book.categoryId)
//                               ?.name
//                           : null;

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

//                                     {/* Category badge — only shown in global search results */}
//                                     {catName && (
//                                       <Badge
//                                         variant="outline"
//                                         className="bg-indigo-900/40 text-indigo-300 border-indigo-500/40 text-xs"
//                                       >
//                                         {catName}
//                                       </Badge>
//                                     )}

//                                     {/* Series badge */}
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

//                                     {/* Instrument badge */}
//                                     <Badge
//                                       variant="outline"
//                                       className="ml-1 bg-purple-900/30 text-purple-300 border-purple-600/40 text-xs"
//                                     >
//                                       {book.instrument}
//                                     </Badge>
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
//               </div>
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
import { BookOpen, Search, Sparkles, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Id, Doc } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";

const UNCATEGORISED_VALUE = "uncategorised";

type BookSlot = "main" | "subA" | "subB";

type BookSelectorProps = {
  // Main slot — per-lesson, stored on schedules.lessons[].bookId
  currentBookId: Id<"books"> | null;
  // Sub slots — per-student, stored on users.subBookAId / subBookBId
  subBookAId: Id<"books"> | null;
  subBookBId: Id<"books"> | null;
  scheduleId: Id<"schedules">;
  lessonId: string;
  studentId: Id<"users">;
};

const SLOT_CONFIG: Record<
  BookSlot,
  { label: string; color: string; desc: string }
> = {
  main: {
    label: "Main",
    color: "from-purple-500 to-indigo-600",
    desc: "Primary lesson book (per-lesson)",
  },
  subA: {
    label: "Sub A",
    color: "from-emerald-500 to-teal-600",
    desc: "Supplementary book A (per-student)",
  },
  subB: {
    label: "Sub B",
    color: "from-rose-500 to-pink-600",
    desc: "Supplementary book B (per-student)",
  },
};

export function BookSelector({
  currentBookId,
  subBookAId,
  subBookBId,
  scheduleId,
  lessonId,
  studentId,
}: BookSelectorProps) {
  const [selectedSlot, setSelectedSlot] = useState<BookSlot>("main");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [search, setSearch] = useState("");

  const categories = useQuery(api.bookCategories.getActive) ?? [];

  const isGlobalSearch = search.trim() !== "" && !selectedCategoryId;

  const allBooks =
    useQuery(
      api.books.getAllActive,
      selectedCategoryId === UNCATEGORISED_VALUE || isGlobalSearch
        ? {}
        : "skip",
    ) ?? [];

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

  const catNameMap = useMemo(
    () =>
      new Map(categories.map((c) => [c._id as string, c.name.toLowerCase()])),
    [categories],
  );

  const globalSearchResults = useMemo<Doc<"books">[]>(() => {
    const term = search.trim().toLowerCase();
    if (!isGlobalSearch) return [];
    return allBooks.filter(
      (book) =>
        book.title.toLowerCase().includes(term) ||
        book.instrument.toLowerCase().includes(term) ||
        (book.description?.toLowerCase().includes(term) ?? false) ||
        (book.subcategory?.toLowerCase().includes(term) ?? false) ||
        (book.levelNumber?.toString().includes(term) ?? false) ||
        (book.seriesGroup?.toLowerCase().includes(term) ?? false) ||
        (book.tags?.some((t) => t.toLowerCase().includes(term)) ?? false) ||
        (book.categoryId
          ? (catNameMap.get(book.categoryId as string) ?? "").includes(term)
          : false),
    );
  }, [allBooks, search, isGlobalSearch, catNameMap]);

  const uncategorisedBooks = useMemo<Doc<"books">[]>(() => {
    if (selectedCategoryId !== UNCATEGORISED_VALUE) return [];
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

  const books: Doc<"books">[] = isGlobalSearch
    ? globalSearchResults
    : selectedCategoryId === UNCATEGORISED_VALUE
      ? uncategorisedBooks
      : categorisedBooks;

  const updateLesson = useMutation(api.schedules.updateLesson);
  const updateStudentBooks = useMutation(api.users.updateStudentBooks);

  // Which book ID is currently active for the selected slot
  const activeBookId =
    selectedSlot === "main"
      ? currentBookId
      : selectedSlot === "subA"
        ? subBookAId
        : subBookBId;

  const handleBookSelect = async (bookId: Id<"books"> | null) => {
    try {
      if (selectedSlot === "main") {
        await updateLesson({ scheduleId, lessonId, updates: { bookId } });
      } else {
        await updateStudentBooks({
          studentId,
          field: selectedSlot === "subA" ? "subBookAId" : "subBookBId",
          bookId,
        });
      }
      const slotLabel = SLOT_CONFIG[selectedSlot].label;
      toast.success(
        bookId ? `${slotLabel} book assigned!` : `${slotLabel} book removed`,
      );
      setSelectedCategoryId("");
      setSearch("");
    } catch {
      toast.error("Failed to update book");
    }
  };

  const handleSlotChange = (slot: BookSlot) => {
    setSelectedSlot(slot);
    setSelectedCategoryId("");
    setSearch("");
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

  const showBookList = isGlobalSearch || !!selectedCategoryId;
  const slots: BookSlot[] = ["main", "subA", "subB"];
  const slotIds: Record<BookSlot, Id<"books"> | null> = {
    main: currentBookId,
    subA: subBookAId,
    subB: subBookBId,
  };

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
          className="flex items-center gap-3"
        >
          <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-lg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-200 via-purple-100 to-indigo-200 bg-clip-text text-transparent">
            Assign Books to Lesson
          </h3>
        </motion.div>

        {/* ── Slot selector tabs ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="grid grid-cols-3 gap-2"
        >
          {slots.map((slot) => {
            const cfg = SLOT_CONFIG[slot];
            const bookId = slotIds[slot];
            const isActive = selectedSlot === slot;
            return (
              <button
                key={slot}
                onClick={() => handleSlotChange(slot)}
                className={`relative flex flex-col items-center gap-1 p-3 rounded-xl border transition-all duration-200 text-left ${
                  isActive
                    ? "border-purple-400/70 bg-purple-800/60 shadow-lg shadow-purple-900/40"
                    : "border-purple-700/30 bg-purple-900/20 hover:border-purple-600/50 hover:bg-purple-900/40"
                }`}
              >
                {/* Coloured dot indicator */}
                <div
                  className={`w-full h-1 rounded-full bg-gradient-to-r ${cfg.color} mb-1 opacity-${bookId ? "100" : "30"}`}
                />
                <span
                  className={`text-sm font-semibold ${isActive ? "text-purple-100" : "text-purple-300"}`}
                >
                  {cfg.label}
                </span>
                <span className="text-[10px] text-purple-400/70 text-center leading-tight">
                  {bookId ? "✓ assigned" : "empty"}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="slot-indicator"
                    className="absolute inset-0 rounded-xl ring-2 ring-purple-400/50"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
              </button>
            );
          })}
        </motion.div>

        {/* Slot description */}
        <p className="text-xs text-purple-400/70 -mt-2">
          {SLOT_CONFIG[selectedSlot].desc}
        </p>

        {/* Remove current button for active slot */}
        <AnimatePresence>
          {activeBookId && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBookSelect(null)}
                className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/30 border border-red-800/30 hover:border-red-700/50 transition-all duration-200"
              >
                <X className="h-4 w-4 mr-2" />
                Remove {SLOT_CONFIG[selectedSlot].label} book assignment
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
          <Input
            placeholder="Search by title, instrument, category, series…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (e.target.value.trim() !== "") setSelectedCategoryId("");
            }}
            className="pl-10 bg-purple-900/60 border-purple-500/50 focus:border-purple-400 transition-all duration-200 backdrop-blur-sm shadow-lg"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </motion.div>

        {/* Category selector — hidden while doing a global search */}
        <AnimatePresence>
          {!isGlobalSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Select
                value={selectedCategoryId}
                onValueChange={(val) => {
                  setSelectedCategoryId(val);
                  setSearch("");
                }}
              >
                <SelectTrigger className="bg-purple-900/60 border-purple-500/50 hover:border-purple-400/70 transition-all duration-200 backdrop-blur-sm shadow-lg">
                  <SelectValue placeholder="Or browse by category…" />
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
          )}
        </AnimatePresence>

        {/* Global search hint */}
        <AnimatePresence>
          {isGlobalSearch && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-purple-400/80 -mt-3"
            >
              Searching across all categories
            </motion.p>
          )}
        </AnimatePresence>

        {/* Books list */}
        <AnimatePresence mode="wait">
          {showBookList && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="max-h-96 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-purple-900/20">
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
                  books.map((book, index) => {
                    const isSelected = book._id === activeBookId;
                    const catName =
                      isGlobalSearch && book.categoryId
                        ? categories.find((c) => c._id === book.categoryId)
                            ?.name
                        : null;

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
                                    ? `bg-gradient-to-br ${SLOT_CONFIG[selectedSlot].color}`
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

                                  {catName && (
                                    <Badge
                                      variant="outline"
                                      className="bg-indigo-900/40 text-indigo-300 border-indigo-500/40 text-xs"
                                    >
                                      {catName}
                                    </Badge>
                                  )}

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
                                  {SLOT_CONFIG[selectedSlot].label}
                                </span>
                              </motion.div>
                            )}
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
