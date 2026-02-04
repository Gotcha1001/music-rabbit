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

"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useUserDetail } from "@/context/UserDetailContext";
import { BookOpen, Eye } from "lucide-react";
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
import { Id } from "../../../../../convex/_generated/dataModel";

// Fixed list of supported instruments — add more as needed
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

interface BookCategory {
  _id: Id<"bookCategories">;
  _creationTime: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  hasLevels: boolean;
  maxLevel?: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: number;
  createdBy: Id<"users">;
}

export default function StudentBooksPage() {
  const { userDetail } = useUserDetail();
  const studentInstrument = userDetail?.instrument;

  const allBooks = useQuery(api.books.getAllActive);
  const categories = useQuery(api.bookCategories.getAll) as
    | BookCategory[]
    | undefined;

  const [selectedInstrument, setSelectedInstrument] = useState<
    string | undefined
  >(studentInstrument);
  const [search, setSearch] = useState("");

  // Use fixed list + any extra instruments from books
  const uniqueInstruments = useMemo(() => {
    const fromBooks = allBooks
      ? [...new Set(allBooks.map((book) => book.instrument))]
      : [];
    return Array.from(new Set([...SUPPORTED_INSTRUMENTS, ...fromBooks])).sort();
  }, [allBooks]);

  const filteredBooks = useMemo(() => {
    if (!allBooks) return [];

    const lowerSearch = search.trim().toLowerCase();

    return allBooks.filter((book) => {
      // Instrument filter (from dropdown)
      const matchesInstrument = selectedInstrument
        ? book.instrument === selectedInstrument
        : true;

      // Search filter (includes instrument!)
      const matchesSearch =
        lowerSearch === "" || // empty search = show all that match instrument
        book.title.toLowerCase().includes(lowerSearch) ||
        book.instrument.toLowerCase().includes(lowerSearch) || // ← important fix
        (book.description?.toLowerCase().includes(lowerSearch) ?? false) ||
        (book.subcategory?.toLowerCase().includes(lowerSearch) ?? false) ||
        (book.tags?.some((tag: string) =>
          tag.toLowerCase().includes(lowerSearch),
        ) ??
          false);

      return matchesInstrument && matchesSearch;
    });
  }, [allBooks, selectedInstrument, search]);

  const booksByCategory = useMemo(() => {
    const grouped = new Map<Id<"bookCategories">, typeof filteredBooks>();
    filteredBooks.forEach((book) => {
      if (book.categoryId) {
        const group = grouped.get(book.categoryId) ?? [];
        group.push(book);
        grouped.set(book.categoryId, group);
      }
    });
    return grouped;
  }, [filteredBooks]);

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
        <Skeleton className="h-10 w-48 mb-6" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  console.log("allBooks from Convex:", allBooks);
  console.log("Number of books:", allBooks?.length ?? 0);
  console.log("Categories:", categories);
  console.log("Selected instrument:", selectedInstrument);
  console.log("Search term:", search);
  console.log("Filtered books count:", filteredBooks.length);
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Available Books</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search books by title, instrument, description, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>
        <Select
          value={selectedInstrument ?? "all"}
          onValueChange={(val) =>
            setSelectedInstrument(val === "all" ? undefined : val)
          }
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Select instrument" />
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

      {filteredBooks.length === 0 ? (
        <Alert variant="default">
          <BookOpen className="h-4 w-4" />
          <AlertTitle>No Books Found</AlertTitle>
          <AlertDescription>
            No books match your search or selected instrument.{" "}
            {search.trim()
              ? "Try a different search term."
              : "Try selecting a different instrument or clearing the search."}
          </AlertDescription>
        </Alert>
      ) : (
        <Accordion type="single" collapsible className="w-full">
          {categories
            .filter(
              (cat) =>
                cat.isActive &&
                booksByCategory.has(cat._id) &&
                (booksByCategory.get(cat._id)?.length ?? 0) > 0,
            )
            .map((category) => (
              <AccordionItem key={category._id} value={category.slug}>
                <AccordionTrigger>{category.name}</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(booksByCategory.get(category._id) ?? []).map(
                      (book, index) => (
                        <motion.div
                          key={book._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="h-full flex flex-col">
                            <CardHeader>
                              <CardTitle>{book.title}</CardTitle>
                              <CardDescription>
                                Level: {book.levelNumber || "N/A"} | Instrument:{" "}
                                {book.instrument} | Subcategory:{" "}
                                {book.subcategory || "General"}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                              <p className="text-sm text-muted-foreground">
                                {book.description ||
                                  "No description available."}
                              </p>
                              {book.tags && book.tags.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {book.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="text-xs bg-secondary px-2 py-1 rounded"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                            <CardFooter>
                              <Button
                                variant="outline"
                                asChild
                                className="w-full"
                              >
                                <a
                                  href={book.driveViewLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Book
                                </a>
                              </Button>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      ),
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
        </Accordion>
      )}
    </div>
  );
}
