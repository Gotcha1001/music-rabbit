// "use client";

// import Link from "next/link";
// import { useQuery } from "convex/react";

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { FileText, Plus, ExternalLink, Download, Trash2 } from "lucide-react";
// import { toast } from "sonner";
// import { motion } from "framer-motion";
// import { format } from "date-fns";
// import { api } from "../../../../../convex/_generated/api";
// import { Doc, Id } from "../../../../../convex/_generated/dataModel";

// export default function AdminBooksPage() {
//   const books = (useQuery(api.books.getAll) as Doc<"books">[]) || [];

//   const handleDeleteBook = async (bookId: Id<"books">, driveFileId: string) => {
//     if (!confirm("Permanently delete this book?")) return;

//     const res = await fetch("/api/books/delete", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ bookId, driveFileId }),
//     });

//     if (res.ok) toast.success("Book deleted");
//     else toast.error("Failed to delete");
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="space-y-8"
//     >
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-3">
//             <FileText className="h-7 w-7 text-primary" />
//             Upload New Book
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <p className="mb-4">Use the new categorized upload system:</p>
//           <Link href="/dashboard/books/upload">
//             <Button>
//               <Plus className="mr-2 h-4 w-4" /> Go to Upload
//             </Button>
//           </Link>
//         </CardContent>
//       </Card>

//       <div>
//         <h2 className="text-3xl font-bold mb-6 text-primary font-serif">
//           Library ({books.length})
//         </h2>
//         {books.length === 0 ? (
//           <Card>
//             <CardContent className="text-center py-16 text-muted-foreground">
//               No books yet
//             </CardContent>
//           </Card>
//         ) : (
//           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
//             {books.map((book, i) => (
//               <motion.div
//                 key={book._id}
//                 initial={{ opacity: 0, scale: 0.9 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 transition={{ delay: i * 0.05 }}
//                 className="relative group"
//               >
//                 <Button
//                   size="icon"
//                   variant="destructive"
//                   className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100"
//                   onClick={() => handleDeleteBook(book._id, book.driveFileId)}
//                 >
//                   <Trash2 className="h-4 w-4" />
//                 </Button>
//                 <Card className="h-full hover:scale-105 transition-transform">
//                   <CardHeader>
//                     <div className="flex justify-between items-start">
//                       <FileText className="h-8 w-8 text-primary" />
//                       <div className="flex gap-2 flex-wrap justify-end">
//                         <Badge variant="secondary">{book.instrument}</Badge>
//                       </div>
//                     </div>
//                     <CardTitle className="text-lg mt-2">{book.title}</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="flex gap-2">
//                       <Button
//                         size="sm"
//                         className="flex-1"
//                         onClick={() =>
//                           window.open(book.driveViewLink, "_blank")
//                         }
//                       >
//                         <ExternalLink className="mr-2 h-4 w-4" /> View
//                       </Button>
//                       {book.driveDownloadLink && (
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           onClick={() =>
//                             window.open(book.driveDownloadLink, "_blank")
//                           }
//                         >
//                           <Download className="h-4 w-4" />
//                         </Button>
//                       )}
//                     </div>
//                     <p className="text-xs text-muted-foreground mt-3">
//                       Uploaded {format(book.uploadedAt, "PP")}
//                     </p>
//                   </CardContent>
//                 </Card>
//               </motion.div>
//             ))}
//           </div>
//         )}
//       </div>
//     </motion.div>
//   );
// }
"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FileText,
  Plus,
  ExternalLink,
  Download,
  Trash2,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Music,
  Drum,
  Mic2,
  Star,
  Sparkles,
  BookOpen,
  Link2,
  Paintbrush,
  Ruler,
  Eye,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

// ── Map icon name strings stored in DB → Lucide components ───────────────────
const ICON_MAP: Record<string, LucideIcon> = {
  MusicalNote: Music,
  Drum,
  Ear: Mic2,
  Star,
  Sparkles,
  BookOpen,
  Link: Link2,
  Paintbrush,
  Ruler,
  Eye,
  Seedling: Music, // no Seedling in lucide — fallback to Music
  ChartIncreasing: Star, // no ChartIncreasing — fallback to Star
  Piano: Music, // no Piano in lucide core — fallback to Music
};

function CategoryIcon({ icon, color }: { icon?: string; color?: string }) {
  if (!icon) return null;
  const LIcon = ICON_MAP[icon];
  return (
    <span
      className="w-10 h-10 flex items-center justify-center rounded-lg shrink-0"
      style={{ background: `${color ?? "#3b82f6"}20` }}
    >
      {LIcon ? (
        <LIcon className="h-5 w-5" style={{ color: color ?? "#3b82f6" }} />
      ) : (
        // handles real emoji characters stored directly
        <span className="text-xl leading-none">{icon}</span>
      )}
    </span>
  );
}
import { motion } from "framer-motion";
import { format } from "date-fns";
import { api } from "../../../../../convex/_generated/api";
import { Doc, Id } from "../../../../../convex/_generated/dataModel";

const PAGE_SIZE = 12;

export default function AdminBooksPage() {
  const books = (useQuery(api.books.getAll) as Doc<"books">[]) || [];
  const categories = useQuery(api.bookCategories.getActive) ?? [];

  const [search, setSearch] = useState("");
  // Track current page per accordion section (keyed by category slug or "uncategorised")
  const [pages, setPages] = useState<Record<string, number>>({});

  const handleDeleteBook = async (bookId: Id<"books">, driveFileId: string) => {
    if (!confirm("Permanently delete this book?")) return;
    const res = await fetch("/api/books/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId, driveFileId }),
    });
    if (res.ok) toast.success("Book deleted");
    else toast.error("Failed to delete");
  };

  // ── Filter books by search term ──────────────────────────────────────────
  const filteredBooks = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return books;

    // Build a map of categoryId → category name for fast lookup
    const catNameMap = new Map(
      categories.map((c) => [c._id, c.name.toLowerCase()]),
    );

    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(term) ||
        book.instrument.toLowerCase().includes(term) ||
        (book.description?.toLowerCase().includes(term) ?? false) ||
        (book.subcategory?.toLowerCase().includes(term) ?? false) ||
        (book.levelNumber?.toString().includes(term) ?? false) ||
        (book.seriesGroup?.toLowerCase().includes(term) ?? false) ||
        (book.tags?.some((t) => t.toLowerCase().includes(term)) ?? false) ||
        // Match against the category name (e.g. "Major Scales", "Beginners")
        (book.categoryId
          ? (catNameMap.get(book.categoryId) ?? "").includes(term)
          : false),
    );
  }, [books, categories, search]);

  // ── Group filtered books by category (same orphan logic as other pages) ──
  const { visibleCategories, uncategorisedBooks } = useMemo(() => {
    const activeCatMap = new Map(categories.map((c) => [c._id, c]));
    const grouped = new Map<Id<"bookCategories">, Doc<"books">[]>();
    const noCat: Doc<"books">[] = [];
    const orphans: Doc<"books">[] = [];

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

    const visible = categories
      .filter((cat) => cat.isActive && (grouped.get(cat._id)?.length ?? 0) > 0)
      .map((cat) => ({ ...cat, books: grouped.get(cat._id) ?? [] }));

    return {
      visibleCategories: visible,
      uncategorisedBooks: [...noCat, ...orphans],
    };
  }, [categories, filteredBooks]);

  const totalVisible = filteredBooks.length;

  // Helper: get current page for a section
  const getPage = (key: string) => pages[key] ?? 0;
  const setPage = (key: string, page: number) =>
    setPages((prev) => ({ ...prev, [key]: page }));

  // Helper: paginate a book list
  const paginate = (list: Doc<"books">[], key: string) => {
    const page = getPage(key);
    const total = Math.ceil(list.length / PAGE_SIZE);
    const slice = list.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    return { slice, page, total };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Upload card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <FileText className="h-7 w-7 text-primary" />
            Upload New Book
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Use the new categorized upload system:</p>
          <Link href="/dashboard/books/upload">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Go to Upload
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Library header + search */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-3xl font-bold text-primary font-serif">
            Library ({books.length})
          </h2>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, instrument, tags…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                // Reset all pages on new search
                setPages({});
              }}
              className="pl-10"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setPages({});
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Results summary */}
        {search && (
          <p className="text-sm text-muted-foreground mb-4">
            Showing {totalVisible} book{totalVisible !== 1 ? "s" : ""} matching
            &ldquo;{search}&rdquo;
          </p>
        )}

        {/* Empty state */}
        {totalVisible === 0 ? (
          <Card>
            <CardContent className="text-center py-16 text-muted-foreground">
              {search ? `No books match "${search}".` : "No books yet."}
            </CardContent>
          </Card>
        ) : (
          <Accordion
            type="multiple"
            defaultValue={[
              ...visibleCategories.map((c) => c.slug),
              "uncategorised",
            ]}
            className="w-full space-y-2"
          >
            {/* ── Categorised sections ── */}
            {visibleCategories.map((category) => {
              const { slice, page, total } = paginate(
                category.books,
                category.slug,
              );
              return (
                <AccordionItem
                  key={category._id}
                  value={category.slug}
                  className="border rounded-xl overflow-hidden"
                >
                  <AccordionTrigger className="px-5 py-4 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <CategoryIcon
                        icon={category.icon}
                        color={category.color}
                      />
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
                    <BookGrid books={slice} onDelete={handleDeleteBook} />
                    <Pagination
                      page={page}
                      total={total}
                      onPageChange={(p) => setPage(category.slug, p)}
                    />
                  </AccordionContent>
                </AccordionItem>
              );
            })}

            {/* ── Uncategorised / orphan books ── */}
            {uncategorisedBooks.length > 0 &&
              (() => {
                const { slice, page, total } = paginate(
                  uncategorisedBooks,
                  "uncategorised",
                );
                return (
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
                      <BookGrid books={slice} onDelete={handleDeleteBook} />
                      <Pagination
                        page={page}
                        total={total}
                        onPageChange={(p) => setPage("uncategorised", p)}
                      />
                    </AccordionContent>
                  </AccordionItem>
                );
              })()}
          </Accordion>
        )}
      </div>
    </motion.div>
  );
}

// ── Book grid ────────────────────────────────────────────────────────────────

function BookGrid({
  books,
  onDelete,
}: {
  books: Doc<"books">[];
  onDelete: (bookId: Id<"books">, driveFileId: string) => void;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {books.map((book, i) => (
        <motion.div
          key={book._id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.04 }}
          className="relative group"
        >
          {/* Delete button */}
          <Button
            size="icon"
            variant="destructive"
            className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onDelete(book._id, book.driveFileId)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          <Card className="h-full hover:scale-105 transition-transform">
            <CardHeader>
              <div className="flex justify-between items-start">
                <FileText className="h-8 w-8 text-primary" />
                <div className="flex gap-2 flex-wrap justify-end">
                  <Badge variant="secondary">{book.instrument}</Badge>
                  {book.levelNumber && (
                    <Badge variant="outline">Lvl {book.levelNumber}</Badge>
                  )}
                </div>
              </div>
              <CardTitle className="text-lg mt-2">{book.title}</CardTitle>
              {book.subcategory && (
                <p className="text-xs text-muted-foreground">
                  {book.subcategory}
                </p>
              )}
              {book.seriesGroup && (
                <p className="text-xs text-muted-foreground">
                  Series: {book.seriesGroup}
                  {book.seriesOrder && ` #${book.seriesOrder}`}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => window.open(book.driveViewLink, "_blank")}
                >
                  <ExternalLink className="mr-2 h-4 w-4" /> View
                </Button>
                {book.driveDownloadLink && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      window.open(book.driveDownloadLink, "_blank")
                    }
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Uploaded {format(book.uploadedAt, "PP")}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// ── Pagination controls ───────────────────────────────────────────────────────

function Pagination({
  page,
  total,
  onPageChange,
}: {
  page: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  if (total <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3 mt-6">
      <Button
        size="sm"
        variant="outline"
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {page + 1} of {total}
      </span>
      <Button
        size="sm"
        variant="outline"
        disabled={page >= total - 1}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
