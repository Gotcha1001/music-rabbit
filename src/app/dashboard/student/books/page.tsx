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

  // Default to student's own instrument — but "all" is selectable
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

  // Build a lowercase category name lookup by id
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
      // When searching, ignore the instrument filter so results aren't hidden
      const matchesInstrument =
        term !== "" || // search overrides instrument filter
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

  // ── Build category groups — NO mutation of arrays, compute fresh each time ─
  const { visibleCategories, categorisedIds, uncategorisedBooks } =
    useMemo(() => {
      if (!categories)
        return {
          visibleCategories: [],
          categorisedIds: new Set<string>(),
          uncategorisedBooks: [],
        };

      const activeCatMap = new Map(categories.map((c) => [c._id, c]));

      // Group filtered books by categoryId
      const grouped = new Map<Id<"bookCategories">, typeof filteredBooks>();
      const noCat: typeof filteredBooks = [];
      const orphans: typeof filteredBooks = []; // categoryId set but category is inactive/deleted

      filteredBooks.forEach((book) => {
        if (!book.categoryId) {
          noCat.push(book);
        } else if (activeCatMap.has(book.categoryId)) {
          const group = grouped.get(book.categoryId) ?? [];
          group.push(book);
          grouped.set(book.categoryId, group);
        } else {
          // categoryId exists but not in active categories → treat as uncategorised
          orphans.push(book);
        }
      });

      // Only show categories that have at least 1 book
      const visible = categories.filter(
        (cat) => cat.isActive && (grouped.get(cat._id)?.length ?? 0) > 0,
      );

      // Attach book lists to visible categories for rendering
      const visibleWithBooks = visible.map((cat) => ({
        ...cat,
        books: grouped.get(cat._id) ?? [],
      }));

      return {
        visibleCategories: visibleWithBooks,
        categorisedIds: new Set(visible.map((c) => c._id as string)),
        uncategorisedBooks: [...noCat, ...orphans],
      };
    }, [categories, filteredBooks]);

  // Loading states
  if (!userDetail) {
    return (
      <div className="container mx-auto p-6">
        <Skeleton className="h-12 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!allBooks || categories === undefined) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Available Books</h1>
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
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-1">Available Books</h1>
      <p className="text-muted-foreground mb-6">
        {allBooks.length} books across {activeCategories.length} categories
      </p>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, instrument, category, description, tags…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-full"
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
          <SelectTrigger className="w-full md:w-[200px]">
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
        <p className="text-sm text-muted-foreground mb-4">
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
              className="border rounded-xl overflow-hidden"
            >
              <AccordionTrigger className="px-5 py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <CategoryIcon icon={category.icon} color={category.color} />
                  <div className="text-left">
                    <div className="font-semibold">{category.name}</div>
                    {category.description && (
                      <div className="text-xs text-muted-foreground font-normal">
                        {category.description}
                      </div>
                    )}
                  </div>
                  <Badge variant="secondary" className="ml-2 shrink-0">
                    {category.books.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5">
                <BookGrid books={category.books} />
              </AccordionContent>
            </AccordionItem>
          ))}

          {uncategorisedBooks.length > 0 && (
            <AccordionItem
              value="uncategorised"
              className="border rounded-xl overflow-hidden"
            >
              <AccordionTrigger className="px-5 py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <span className="text-2xl w-10 h-10 flex items-center justify-center rounded-lg shrink-0 bg-muted">
                    📄
                  </span>
                  <div className="text-left">
                    <div className="font-semibold">Other Books</div>
                    <div className="text-xs text-muted-foreground font-normal">
                      Books not assigned to a category
                    </div>
                  </div>
                  <Badge variant="secondary" className="ml-2 shrink-0">
                    {uncategorisedBooks.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5">
                <BookGrid books={uncategorisedBooks} />
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      )}
    </div>
  );
}

function BookGrid({ books }: { books: Doc<"books">[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {books.map((book, index) => (
        <motion.div
          key={book._id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04 }}
        >
          <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base leading-snug">
                  {book.title}
                </CardTitle>
                <Badge variant="outline" className="shrink-0 text-xs">
                  {book.instrument}
                </Badge>
              </div>
              <CardDescription className="text-xs">
                {book.levelNumber && <span>Level {book.levelNumber}</span>}
                {book.levelNumber && book.subcategory && <span> · </span>}
                {book.subcategory && <span>{book.subcategory}</span>}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 py-0">
              {book.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {book.description}
                </p>
              )}
              {book.tags && book.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {book.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="text-xs bg-secondary px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {book.seriesGroup && (
                <p className="text-xs text-muted-foreground mt-2">
                  Series: {book.seriesGroup}
                  {book.seriesOrder && ` #${book.seriesOrder}`}
                </p>
              )}
            </CardContent>
            <CardFooter className="pt-4">
              <Button variant="outline" asChild className="w-full">
                <a
                  href={book.driveViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Eye className="mr-2 h-4 w-4" /> View Book
                </a>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
