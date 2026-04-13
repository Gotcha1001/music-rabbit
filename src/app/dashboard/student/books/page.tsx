// "use client";

// import { useQuery } from "convex/react";
// import { api } from "../../../../../convex/_generated/api"; // Adjust path as needed
// import { useUserDetail } from "@/context/UserDetailContext";
// import { BookOpen, Eye } from "lucide-react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { motion } from "framer-motion";

// export default function StudentBooksPage() {
//   const { userDetail } = useUserDetail();
//   const instrument = userDetail?.instrument;

//   const books = useQuery(
//     api.books.getByInstrument,
//     instrument ? { instrument } : "skip",
//   );

//   if (!userDetail || !instrument) {
//     return (
//       <div className="container mx-auto p-6">
//         <Skeleton className="h-12 w-48 mb-6" />
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {[...Array(6)].map((_, i) => (
//             <Skeleton key={i} className="h-48 w-full" />
//           ))}
//         </div>
//       </div>
//     );
//   }

//   if (!books || books.length === 0) {
//     return (
//       <div className="container mx-auto p-6">
//         <h1 className="text-3xl font-bold mb-6">Available Books</h1>
//         <Alert variant="default">
//           <BookOpen className="h-4 w-4" />
//           <AlertTitle>No Books Available</AlertTitle>
//           <AlertDescription>
//             There are no books available for your instrument ({instrument}).
//             Please contact your teacher or admin.
//           </AlertDescription>
//         </Alert>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-6">
//       <h1 className="text-3xl font-bold mb-6">
//         Available Books for {instrument}
//       </h1>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {books.map((book, index) => (
//           <motion.div
//             key={book._id}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: index * 0.1 }}
//           >
//             <Card className="h-full flex flex-col">
//               <CardHeader>
//                 <CardTitle>{book.title}</CardTitle>
//                 <CardDescription>
//                   Level: {book.levelNumber || "N/A"} | Category:{" "}
//                   {book.subcategory || "General"}
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="flex-1">
//                 <p className="text-sm text-muted-foreground">
//                   {book.description || "No description available."}
//                 </p>
//                 {book.tags && book.tags.length > 0 && (
//                   <div className="mt-2 flex flex-wrap gap-2">
//                     {book.tags.map((tag) => (
//                       <span
//                         key={tag}
//                         className="text-xs bg-secondary px-2 py-1 rounded"
//                       >
//                         {tag}
//                       </span>
//                     ))}
//                   </div>
//                 )}
//               </CardContent>
//               <CardFooter>
//                 <Button variant="outline" asChild className="w-full">
//                   <a
//                     href={book.driveViewLink}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                   >
//                     <Eye className="mr-2 h-4 w-4" />
//                     View Book
//                   </a>
//                 </Button>
//               </CardFooter>
//             </Card>
//           </motion.div>
//         ))}
//       </div>
//     </div>
//   );
// }

// "use client";

// import { useQuery } from "convex/react";
// import { api } from "../../../../../convex/_generated/api";
// import { useUserDetail } from "@/context/UserDetailContext";
// import { BookOpen, Eye } from "lucide-react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { motion } from "framer-motion";
// import { useState, useMemo } from "react";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "@/components/ui/accordion";
// import { Id } from "../../../../../convex/_generated/dataModel";

// // Fixed list of supported instruments — add more as needed
// const SUPPORTED_INSTRUMENTS = [
//   "Piano",
//   "Guitar",
//   "Violin",
//   "Drums",
//   "Voice",
//   "Saxophone",
//   "Flute",
//   "Trumpet",
//   "Clarinet",
//   "Ukulele",
//   "Bass Guitar",
//   "Cello",
// ] as const;

// interface BookCategory {
//   _id: Id<"bookCategories">;
//   _creationTime: number;
//   name: string;
//   slug: string;
//   description: string;
//   icon: string;
//   color: string;
//   hasLevels: boolean;
//   maxLevel?: number;
//   isActive: boolean;
//   sortOrder: number;
//   createdAt: number;
//   createdBy: Id<"users">;
// }

// export default function StudentBooksPage() {
//   const { userDetail } = useUserDetail();
//   const studentInstrument = userDetail?.instrument;

//   const allBooks = useQuery(api.books.getAllActive);
//   const categories = useQuery(api.bookCategories.getAll) as
//     | BookCategory[]
//     | undefined;

//   const [selectedInstrument, setSelectedInstrument] = useState<
//     string | undefined
//   >(studentInstrument);
//   const [search, setSearch] = useState("");

//   // Use fixed list + any extra instruments from books
//   const uniqueInstruments = useMemo(() => {
//     const fromBooks = allBooks
//       ? [...new Set(allBooks.map((book) => book.instrument))]
//       : [];
//     return Array.from(new Set([...SUPPORTED_INSTRUMENTS, ...fromBooks])).sort();
//   }, [allBooks]);

//   const filteredBooks = useMemo(() => {
//     if (!allBooks) return [];

//     const lowerSearch = search.trim().toLowerCase();

//     return allBooks.filter((book) => {
//       // Instrument filter (from dropdown)
//       const matchesInstrument = selectedInstrument
//         ? book.instrument === selectedInstrument
//         : true;

//       // Search filter (includes instrument!)
//       const matchesSearch =
//         lowerSearch === "" || // empty search = show all that match instrument
//         book.title.toLowerCase().includes(lowerSearch) ||
//         book.instrument.toLowerCase().includes(lowerSearch) || // ← important fix
//         (book.description?.toLowerCase().includes(lowerSearch) ?? false) ||
//         (book.subcategory?.toLowerCase().includes(lowerSearch) ?? false) ||
//         (book.tags?.some((tag: string) =>
//           tag.toLowerCase().includes(lowerSearch),
//         ) ??
//           false);

//       return matchesInstrument && matchesSearch;
//     });
//   }, [allBooks, selectedInstrument, search]);

//   const booksByCategory = useMemo(() => {
//     const grouped = new Map<Id<"bookCategories">, typeof filteredBooks>();
//     filteredBooks.forEach((book) => {
//       if (book.categoryId) {
//         const group = grouped.get(book.categoryId) ?? [];
//         group.push(book);
//         grouped.set(book.categoryId, group);
//       }
//     });
//     return grouped;
//   }, [filteredBooks]);

//   if (!userDetail) {
//     return (
//       <div className="container mx-auto p-6">
//         <Skeleton className="h-12 w-48 mb-6" />
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {[...Array(6)].map((_, i) => (
//             <Skeleton key={i} className="h-48 w-full" />
//           ))}
//         </div>
//       </div>
//     );
//   }

//   if (!allBooks || categories === undefined) {
//     return (
//       <div className="container mx-auto p-6">
//         <h1 className="text-3xl font-bold mb-6">Available Books</h1>
//         <Skeleton className="h-10 w-full mb-4" />
//         <Skeleton className="h-10 w-48 mb-6" />
//         <div className="space-y-4">
//           {[...Array(3)].map((_, i) => (
//             <Skeleton key={i} className="h-16 w-full" />
//           ))}
//         </div>
//       </div>
//     );
//   }

//   console.log("allBooks from Convex:", allBooks);
//   console.log("Number of books:", allBooks?.length ?? 0);
//   console.log("Categories:", categories);
//   console.log("Selected instrument:", selectedInstrument);
//   console.log("Search term:", search);
//   console.log("Filtered books count:", filteredBooks.length);
//   return (
//     <div className="container mx-auto p-6">
//       <h1 className="text-3xl font-bold mb-6">Available Books</h1>

//       <div className="flex flex-col md:flex-row gap-4 mb-6">
//         <div className="flex-1">
//           <Input
//             placeholder="Search books by title, instrument, description, or tags..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="w-full"
//           />
//         </div>
//         <Select
//           value={selectedInstrument ?? "all"}
//           onValueChange={(val) =>
//             setSelectedInstrument(val === "all" ? undefined : val)
//           }
//         >
//           <SelectTrigger className="w-full md:w-[200px]">
//             <SelectValue placeholder="Select instrument" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All Instruments</SelectItem>
//             {uniqueInstruments.map((inst) => (
//               <SelectItem key={inst} value={inst}>
//                 {inst}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>

//       {filteredBooks.length === 0 ? (
//         <Alert variant="default">
//           <BookOpen className="h-4 w-4" />
//           <AlertTitle>No Books Found</AlertTitle>
//           <AlertDescription>
//             No books match your search or selected instrument.{" "}
//             {search.trim()
//               ? "Try a different search term."
//               : "Try selecting a different instrument or clearing the search."}
//           </AlertDescription>
//         </Alert>
//       ) : (
//         <Accordion type="single" collapsible className="w-full">
//           {categories
//             .filter(
//               (cat) =>
//                 cat.isActive &&
//                 booksByCategory.has(cat._id) &&
//                 (booksByCategory.get(cat._id)?.length ?? 0) > 0,
//             )
//             .map((category) => (
//               <AccordionItem key={category._id} value={category.slug}>
//                 <AccordionTrigger>{category.name}</AccordionTrigger>
//                 <AccordionContent>
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                     {(booksByCategory.get(category._id) ?? []).map(
//                       (book, index) => (
//                         <motion.div
//                           key={book._id}
//                           initial={{ opacity: 0, y: 20 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           transition={{ delay: index * 0.1 }}
//                         >
//                           <Card className="h-full flex flex-col">
//                             <CardHeader>
//                               <CardTitle>{book.title}</CardTitle>
//                               <CardDescription>
//                                 Level: {book.levelNumber || "N/A"} | Instrument:{" "}
//                                 {book.instrument} | Subcategory:{" "}
//                                 {book.subcategory || "General"}
//                               </CardDescription>
//                             </CardHeader>
//                             <CardContent className="flex-1">
//                               <p className="text-sm text-muted-foreground">
//                                 {book.description ||
//                                   "No description available."}
//                               </p>
//                               {book.tags && book.tags.length > 0 && (
//                                 <div className="mt-2 flex flex-wrap gap-2">
//                                   {book.tags.map((tag) => (
//                                     <span
//                                       key={tag}
//                                       className="text-xs bg-secondary px-2 py-1 rounded"
//                                     >
//                                       {tag}
//                                     </span>
//                                   ))}
//                                 </div>
//                               )}
//                             </CardContent>
//                             <CardFooter>
//                               <Button
//                                 variant="outline"
//                                 asChild
//                                 className="w-full"
//                               >
//                                 <a
//                                   href={book.driveViewLink}
//                                   target="_blank"
//                                   rel="noopener noreferrer"
//                                 >
//                                   <Eye className="mr-2 h-4 w-4" />
//                                   View Book
//                                 </a>
//                               </Button>
//                             </CardFooter>
//                           </Card>
//                         </motion.div>
//                       ),
//                     )}
//                   </div>
//                 </AccordionContent>
//               </AccordionItem>
//             ))}
//         </Accordion>
//       )}
//     </div>
//   );
// }
"use client";

// app/dashboard/student/books/page.tsx

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useUserDetail } from "@/context/UserDetailContext";
import {
  BookOpen,
  Eye,
  Search,
  X,
  Music,
  Star,
  Heart,
  Guitar,
  Mic,
  Headphones,
  Piano,
  Radio,
  Drum,
} from "lucide-react";
import type { LucideProps } from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  MusicalNote: Music,
  Music,
  BookOpen,
  Star,
  Heart,
  Guitar,
  Mic,
  Headphones,
  Piano,
  Radio,
  Drum,
};

function CategoryIcon({
  icon,
  color,
}: {
  icon?: string | null;
  color?: string | null;
}) {
  if (!icon) return null;
  const LucideComponent = ICON_MAP[icon];
  const bg = color ? `${color}20` : "#88888820";
  const fg = color ?? "#888888";
  if (LucideComponent) {
    return (
      <span
        className="w-10 h-10 flex items-center justify-center rounded-lg shrink-0"
        style={{ background: bg }}
      >
        <LucideComponent size={20} color={fg} />
      </span>
    );
  }
  return (
    <span
      className="text-2xl w-10 h-10 flex items-center justify-center rounded-lg shrink-0"
      style={{ background: bg }}
    >
      {icon}
    </span>
  );
}

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Doc, Id } from "../../../../../convex/_generated/dataModel";

/* ─────────────────────────────────────────────────────────────
   !important overrides
   Light = default  |  Dark = .dark prefix
───────────────────────────────────────────────────────────── */
const BOOKS_STYLES = `
  /* Page wrapper */
  .books-page                       { background: #ffffff !important; }
  .dark .books-page                 { background: linear-gradient(to bottom, #000000, #1a0030, #000000) !important; }

  /* Headings */
  .books-title                      { color: hsl(var(--foreground)) !important; }
  .books-subtitle                   { color: hsl(var(--muted-foreground)) !important; }
  .dark .books-title                { color: #ede9fe !important; }
  .dark .books-subtitle             { color: #c4b5fd !important; }

  /* Accordion items (category rows) */
  .books-accordion-item             { background: #ffffff !important; border-color: hsl(var(--border)) !important; }
  .books-accordion-item:hover       { background: hsl(var(--muted)/0.4) !important; }
  .dark .books-accordion-item       { background: hsl(270 90% 4%) !important; border-color: rgba(109,40,217,0.3) !important; }
  .dark .books-accordion-item:hover { background: rgba(76,29,149,0.15) !important; }

  .books-cat-name                   { color: hsl(var(--foreground)) !important; }
  .books-cat-desc                   { color: hsl(var(--muted-foreground)) !important; }
  .dark .books-cat-name             { color: #ede9fe !important; }
  .dark .books-cat-desc             { color: #c4b5fd !important; }

  /* Book cards */
  .books-card                       { background: #ffffff !important; border-color: hsl(var(--border)) !important; }
  .books-card:hover                 { box-shadow: 0 4px 16px rgba(0,0,0,0.1) !important; }
  .dark .books-card                 { background: hsl(270 90% 5%) !important; border-color: rgba(109,40,217,0.3) !important; }
  .dark .books-card:hover           { box-shadow: 0 4px 24px rgba(139,92,246,0.2) !important; }

  .books-card-title                 { color: hsl(var(--foreground)) !important; }
  .books-card-desc                  { color: hsl(var(--muted-foreground)) !important; }
  .books-card-body                  { color: hsl(var(--muted-foreground)) !important; }
  .dark .books-card-title           { color: #ede9fe !important; }
  .dark .books-card-desc            { color: #a78bfa !important; }
  .dark .books-card-body            { color: #c4b5fd !important; }

  /* Tags */
  .books-tag                        { background: hsl(var(--muted)) !important; color: hsl(var(--foreground)) !important; }
  .dark .books-tag                  { background: rgba(76,29,149,0.4) !important; color: #ddd6fe !important; }

  /* View button */
  .books-view-btn                   { border-color: hsl(var(--primary)/0.4) !important; color: hsl(var(--primary)) !important; }
  .books-view-btn:hover             { background: hsl(var(--primary)/0.08) !important; }
  .dark .books-view-btn             { border-color: rgba(124,58,237,0.5) !important; color: #c4b5fd !important; }
  .dark .books-view-btn:hover       { background: rgba(76,29,149,0.3) !important; }

  /* Search input */
  .books-search                     { background: #ffffff !important; border-color: hsl(var(--border)) !important; color: hsl(var(--foreground)) !important; }
  .dark .books-search               { background: hsl(270 80% 6%) !important; border-color: rgba(109,40,217,0.4) !important; color: #ede9fe !important; }
`;

const SUPPORTED_INSTRUMENTS = [
  "Piano",
  "Guitar",
  "Violin",
  "Drums",
  "Voice",
  "Saxophone",
  "Flute",
  "Trumpet",
  "Clarinet",
  "Ukulele",
  "Bass Guitar",
  "Cello",
] as const;

export default function StudentBooksPage() {
  const { userDetail } = useUserDetail();
  const categories = useQuery(api.bookCategories.getActive);
  const allBooks = useQuery(api.books.getAllActive);

  const [selectedInstrument, setSelectedInstrument] = useState<string>(
    userDetail?.instrument ?? "all",
  );
  const [search, setSearch] = useState("");

  const uniqueInstruments = useMemo(() => {
    const fromBooks = allBooks
      ? [...new Set(allBooks.map((b) => b.instrument))]
      : [];
    return Array.from(new Set([...SUPPORTED_INSTRUMENTS, ...fromBooks])).sort();
  }, [allBooks]);

  const catNameMap = useMemo(() => {
    if (!categories) return new Map<string, string>();
    return new Map(
      categories.map((c) => [c._id as string, c.name.toLowerCase()]),
    );
  }, [categories]);

  const filteredBooks = useMemo(() => {
    if (!allBooks) return [];
    const term = search.trim().toLowerCase();
    return allBooks.filter((book) => {
      const matchesInstrument =
        term !== "" ||
        selectedInstrument === "all" ||
        book.instrument.toLowerCase() === selectedInstrument.toLowerCase();
      const matchesSearch =
        term === "" ||
        book.title.toLowerCase().includes(term) ||
        book.instrument.toLowerCase().includes(term) ||
        (book.description?.toLowerCase().includes(term) ?? false) ||
        (book.subcategory?.toLowerCase().includes(term) ?? false) ||
        (book.levelNumber?.toString().includes(term) ?? false) ||
        (book.seriesGroup?.toLowerCase().includes(term) ?? false) ||
        (book.tags?.some((t: string) => t.toLowerCase().includes(term)) ??
          false) ||
        (book.categoryId
          ? (catNameMap.get(book.categoryId as string) ?? "").includes(term)
          : false);
      return matchesInstrument && matchesSearch;
    });
  }, [allBooks, selectedInstrument, search, catNameMap]);

  const { visibleCategories, uncategorisedBooks } = useMemo(() => {
    if (!categories)
      return {
        visibleCategories: [],
        categorisedIds: new Set<string>(),
        uncategorisedBooks: [],
      };
    const activeCatMap = new Map(categories.map((c) => [c._id, c]));
    const grouped = new Map<Id<"bookCategories">, typeof filteredBooks>();
    const noCat: typeof filteredBooks = [];
    const orphans: typeof filteredBooks = [];
    filteredBooks.forEach((book) => {
      if (!book.categoryId) {
        noCat.push(book);
      } else if (activeCatMap.has(book.categoryId)) {
        const group = grouped.get(book.categoryId) ?? [];
        group.push(book);
        grouped.set(book.categoryId, group);
      } else {
        orphans.push(book);
      }
    });
    const visible = categories.filter(
      (cat) => cat.isActive && (grouped.get(cat._id)?.length ?? 0) > 0,
    );
    return {
      visibleCategories: visible.map((cat) => ({
        ...cat,
        books: grouped.get(cat._id) ?? [],
      })),
      categorisedIds: new Set(visible.map((c) => c._id as string)),
      uncategorisedBooks: [...noCat, ...orphans],
    };
  }, [categories, filteredBooks]);

  // Loading states
  if (!userDetail) {
    return (
      <div className="books-page container mx-auto p-4 sm:p-6">
        <style>{BOOKS_STYLES}</style>
        <Skeleton className="h-10 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!allBooks || categories === undefined) {
    return (
      <div className="books-page container mx-auto p-4 sm:p-6">
        <style>{BOOKS_STYLES}</style>
        <h1 className="books-title text-2xl sm:text-3xl font-bold mb-6">
          Available Books
        </h1>
        <Skeleton className="h-10 w-full mb-4" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const totalVisible = filteredBooks.length;
  const activeCategories = categories.filter((c) => c.isActive);

  return (
    <div className="books-page min-h-screen">
      <style>{BOOKS_STYLES}</style>
      <div className="container mx-auto p-4 sm:p-6">
        {/* Heading */}
        <h1 className="books-title text-2xl sm:text-3xl font-bold mb-1">
          Available Books
        </h1>
        <p className="books-subtitle mb-5 sm:mb-6 text-sm sm:text-base">
          {allBooks.length} books across {activeCategories.length} categories
        </p>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, instrument, category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="books-search pl-10 w-full"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Select
            value={selectedInstrument}
            onValueChange={setSelectedInstrument}
          >
            <SelectTrigger className="books-search w-full sm:w-[200px]">
              <SelectValue placeholder="All Instruments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Instruments</SelectItem>
              {uniqueInstruments.map((inst) => (
                <SelectItem key={inst} value={inst}>
                  {inst}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results summary */}
        {(search || selectedInstrument !== "all") && (
          <p className="books-subtitle text-sm mb-4">
            Showing {totalVisible} book{totalVisible !== 1 ? "s" : ""}
            {search && ` matching "${search}"`}
            {!search &&
              selectedInstrument !== "all" &&
              ` for ${selectedInstrument}`}
            {search && " across all instruments"}
          </p>
        )}

        {/* Empty state */}
        {totalVisible === 0 ? (
          <Alert>
            <BookOpen className="h-4 w-4" />
            <AlertTitle>No Books Found</AlertTitle>
            <AlertDescription>
              {search
                ? `No books match "${search}".`
                : selectedInstrument !== "all"
                  ? `No books for ${selectedInstrument}. Try "All Instruments".`
                  : "No books have been uploaded yet."}
            </AlertDescription>
          </Alert>
        ) : (
          <Accordion
            type="multiple"
            defaultValue={[
              ...visibleCategories.map((c) => c.slug),
              "uncategorised",
            ]}
            className="w-full space-y-2"
          >
            {visibleCategories.map((category) => (
              <AccordionItem
                key={category._id}
                value={category.slug}
                className="books-accordion-item border rounded-xl overflow-hidden"
              >
                <AccordionTrigger className="px-4 sm:px-5 py-3 sm:py-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <CategoryIcon icon={category.icon} color={category.color} />
                    <div className="text-left">
                      <div className="books-cat-name font-semibold text-sm sm:text-base">
                        {category.name}
                      </div>
                      {category.description && (
                        <div className="books-cat-desc text-xs font-normal">
                          {category.description}
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary" className="ml-2 shrink-0">
                      {category.books.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 sm:px-5 pb-4 sm:pb-5">
                  <BookGrid books={category.books} />
                </AccordionContent>
              </AccordionItem>
            ))}

            {uncategorisedBooks.length > 0 && (
              <AccordionItem
                value="uncategorised"
                className="books-accordion-item border rounded-xl overflow-hidden"
              >
                <AccordionTrigger className="px-4 sm:px-5 py-3 sm:py-4 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl w-10 h-10 flex items-center justify-center rounded-lg shrink-0 bg-muted">
                      📄
                    </span>
                    <div className="text-left">
                      <div className="books-cat-name font-semibold text-sm sm:text-base">
                        Other Books
                      </div>
                      <div className="books-cat-desc text-xs font-normal">
                        Books not assigned to a category
                      </div>
                    </div>
                    <Badge variant="secondary" className="ml-2 shrink-0">
                      {uncategorisedBooks.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 sm:px-5 pb-4 sm:pb-5">
                  <BookGrid books={uncategorisedBooks} />
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        )}
      </div>
    </div>
  );
}

function BookGrid({ books }: { books: Doc<"books">[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {books.map((book, index) => (
        <motion.div
          key={book._id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04 }}
          className="h-full"
        >
          <div className="books-card h-full flex flex-col rounded-xl border overflow-hidden transition-shadow">
            {/* Card header */}
            <div className="p-3 sm:p-4 pb-2 border-b border-inherit">
              <div className="flex items-start justify-between gap-2">
                <h3 className="books-card-title text-sm sm:text-base font-semibold leading-snug">
                  {book.title}
                </h3>
                <Badge variant="outline" className="shrink-0 text-xs">
                  {book.instrument}
                </Badge>
              </div>
              <p className="books-card-desc text-xs mt-1">
                {book.levelNumber && <span>Level {book.levelNumber}</span>}
                {book.levelNumber && book.subcategory && <span> · </span>}
                {book.subcategory && <span>{book.subcategory}</span>}
              </p>
            </div>

            {/* Card body */}
            <div className="flex-1 p-3 sm:p-4 py-2">
              {book.description && (
                <p className="books-card-body text-xs sm:text-sm line-clamp-2">
                  {book.description}
                </p>
              )}
              {book.tags && book.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {book.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="books-tag text-xs px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {book.seriesGroup && (
                <p className="books-card-desc text-xs mt-2">
                  Series: {book.seriesGroup}
                  {book.seriesOrder && ` #${book.seriesOrder}`}
                </p>
              )}
            </div>

            {/* Card footer */}
            <div className="p-3 sm:p-4 pt-2">
              <a
                href={book.driveViewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="books-view-btn w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border text-sm font-medium transition-all duration-200"
              >
                <Eye className="h-4 w-4 shrink-0" />
                View Book
              </a>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
