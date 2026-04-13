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
import { Badge } from "@/components/ui/badge";
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
import { motion } from "framer-motion";
import { format } from "date-fns";
import { api } from "../../../../../convex/_generated/api";
import { Doc, Id } from "../../../../../convex/_generated/dataModel";

/* ─────────────────────────────────────────────────────────────
   !important overrides — same pattern as student/teacher books
   Light = default  |  Dark = .dark prefix
───────────────────────────────────────────────────────────── */
const ABOOKS_STYLES = `
  .ab-page                          { background: #ffffff !important; }
  .dark .ab-page                    { background: linear-gradient(to bottom, #000000, #1a0030, #000000) !important; }

  .ab-title                         { color: hsl(var(--primary)) !important; }
  .dark .ab-title                   { color: #c4b5fd !important; }

  /* Upload card */
  .ab-upload-card                   { background: #ffffff !important; border-color: hsl(var(--border)) !important; box-shadow: 0 2px 12px rgba(0,0,0,0.07) !important; }
  .dark .ab-upload-card             { background: hsl(270 90% 5%) !important; border-color: rgba(109,40,217,0.3) !important; }
  .ab-upload-title                  { color: hsl(var(--foreground)) !important; }
  .ab-upload-text                   { color: hsl(var(--muted-foreground)) !important; }
  .dark .ab-upload-title            { color: #ddd6fe !important; }
  .dark .ab-upload-text             { color: #a78bfa !important; }
  .ab-upload-btn                    { background: hsl(var(--primary)) !important; color: #ffffff !important; }
  .ab-upload-btn:hover              { background: hsl(var(--primary)/0.9) !important; }
  .dark .ab-upload-btn              { background: #7c3aed !important; }

  /* Search input */
  .ab-search                        { background: #ffffff !important; border-color: hsl(var(--border)) !important; color: hsl(var(--foreground)) !important; }
  .dark .ab-search                  { background: hsl(270 80% 6%) !important; border-color: rgba(109,40,217,0.4) !important; color: #ede9fe !important; }

  /* Accordion items */
  .ab-accordion-item                { background: #ffffff !important; border-color: hsl(var(--border)) !important; }
  .dark .ab-accordion-item          { background: hsl(270 90% 4%) !important; border-color: rgba(109,40,217,0.3) !important; }
  .ab-cat-name                      { color: hsl(var(--foreground)) !important; }
  .ab-cat-desc                      { color: hsl(var(--muted-foreground)) !important; }
  .dark .ab-cat-name                { color: #ede9fe !important; }
  .dark .ab-cat-desc                { color: #c4b5fd !important; }

  /* Book cards */
  .ab-book-card                     { background: #ffffff !important; border-color: hsl(var(--border)) !important; }
  .ab-book-card:hover               { box-shadow: 0 4px 16px rgba(0,0,0,0.1) !important; }
  .dark .ab-book-card               { background: hsl(270 90% 5%) !important; border-color: rgba(109,40,217,0.3) !important; }

  .ab-book-title                    { color: hsl(var(--foreground)) !important; }
  .ab-book-sub                      { color: hsl(var(--muted-foreground)) !important; }
  .dark .ab-book-title              { color: #ede9fe !important; }
  .dark .ab-book-sub                { color: #a78bfa !important; }

  /* View button */
  .ab-view-btn                      { background: hsl(var(--primary)) !important; color: #ffffff !important; }
  .ab-view-btn:hover                { background: hsl(var(--primary)/0.9) !important; }
  .dark .ab-view-btn                { background: #7c3aed !important; }
  .dark .ab-view-btn:hover          { background: #6d28d9 !important; }

  /* Download button */
  .ab-dl-btn                        { border-color: hsl(var(--primary)/0.4) !important; color: hsl(var(--primary)) !important; background: transparent !important; }
  .ab-dl-btn:hover                  { background: hsl(var(--primary)/0.08) !important; }
  .dark .ab-dl-btn                  { border-color: rgba(124,58,237,0.5) !important; color: #c4b5fd !important; }

  /* Pagination */
  .ab-page-btn                      { border-color: hsl(var(--border)) !important; color: hsl(var(--foreground)) !important; background: transparent !important; }
  .ab-page-btn:hover:not(:disabled) { background: hsl(var(--muted)) !important; }
  .ab-page-btn:disabled             { opacity: 0.4 !important; }
  .dark .ab-page-btn                { border-color: rgba(109,40,217,0.4) !important; color: #c4b5fd !important; }
  .dark .ab-page-btn:hover:not(:disabled) { background: rgba(76,29,149,0.3) !important; }
  .ab-page-text                     { color: hsl(var(--muted-foreground)) !important; }
  .dark .ab-page-text               { color: #a78bfa !important; }

  /* Empty state */
  .ab-empty                         { background: #ffffff !important; border-color: hsl(var(--border)) !important; }
  .dark .ab-empty                   { background: hsl(270 90% 5%) !important; border-color: rgba(109,40,217,0.3) !important; }
  .ab-empty-text                    { color: hsl(var(--muted-foreground)) !important; }
  .dark .ab-empty-text              { color: #a78bfa !important; }
`;

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
  Seedling: Music,
  ChartIncreasing: Star,
  Piano: Music,
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
        <span className="text-xl leading-none">{icon}</span>
      )}
    </span>
  );
}

const PAGE_SIZE = 12;

export default function AdminBooksPage() {
  const books = (useQuery(api.books.getAll) as Doc<"books">[]) || [];
  const categories = useQuery(api.bookCategories.getActive) ?? [];
  const [search, setSearch] = useState("");
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

  const filteredBooks = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return books;
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
        (book.categoryId
          ? (catNameMap.get(book.categoryId) ?? "").includes(term)
          : false),
    );
  }, [books, categories, search]);

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
  const getPage = (key: string) => pages[key] ?? 0;
  const setPage = (key: string, page: number) =>
    setPages((prev) => ({ ...prev, [key]: page }));
  const paginate = (list: Doc<"books">[], key: string) => {
    const page = getPage(key);
    const total = Math.ceil(list.length / PAGE_SIZE);
    const slice = list.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    return { slice, page, total };
  };

  return (
    <div className="ab-page min-h-screen">
      <style>{ABOOKS_STYLES}</style>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 sm:space-y-8 p-4 sm:p-0"
      >
        {/* Upload card */}
        <div className="ab-upload-card rounded-xl border-2 overflow-hidden shadow-sm">
          <div className="p-4 sm:p-6 border-b border-inherit">
            <h2 className="ab-upload-title flex items-center gap-3 text-lg sm:text-xl font-bold font-serif">
              <FileText className="h-5 w-5 sm:h-7 sm:w-7 text-primary shrink-0" />
              Upload New Book
            </h2>
          </div>
          <div className="p-4 sm:p-6">
            <p className="ab-upload-text mb-4 text-sm sm:text-base">
              Use the new categorized upload system:
            </p>
            <Link href="/dashboard/books/upload">
              <button className="ab-upload-btn flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200">
                <Plus className="h-4 w-4" /> Go to Upload
              </button>
            </Link>
          </div>
        </div>

        {/* Library header + search */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 sm:mb-6">
            <h2 className="ab-title text-2xl sm:text-3xl font-bold font-serif">
              Library ({books.length})
            </h2>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search by title, instrument, tags…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPages({});
                }}
                className="ab-search w-full pl-10 pr-10 py-2 rounded-lg border text-sm outline-none transition-all"
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

          {search && (
            <p className="text-sm text-muted-foreground mb-4">
              Showing {totalVisible} book{totalVisible !== 1 ? "s" : ""}{" "}
              matching &ldquo;{search}&rdquo;
            </p>
          )}

          {totalVisible === 0 ? (
            <div className="ab-empty rounded-xl border p-10 sm:p-16 text-center">
              <p className="ab-empty-text text-sm sm:text-base">
                {search ? `No books match "${search}".` : "No books yet."}
              </p>
            </div>
          ) : (
            <Accordion
              type="multiple"
              defaultValue={[
                ...visibleCategories.map((c) => c.slug),
                "uncategorised",
              ]}
              className="w-full space-y-2"
            >
              {visibleCategories.map((category) => {
                const { slice, page, total } = paginate(
                  category.books,
                  category.slug,
                );
                return (
                  <AccordionItem
                    key={category._id}
                    value={category.slug}
                    className="ab-accordion-item border rounded-xl overflow-hidden"
                  >
                    <AccordionTrigger className="px-4 sm:px-5 py-3 sm:py-4 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <CategoryIcon
                          icon={category.icon}
                          color={category.color}
                        />
                        <div className="text-left">
                          <div className="ab-cat-name font-semibold text-sm sm:text-base">
                            {category.name}
                          </div>
                          {category.description && (
                            <div className="ab-cat-desc text-xs font-normal">
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

              {uncategorisedBooks.length > 0 &&
                (() => {
                  const { slice, page, total } = paginate(
                    uncategorisedBooks,
                    "uncategorised",
                  );
                  return (
                    <AccordionItem
                      value="uncategorised"
                      className="ab-accordion-item border rounded-xl overflow-hidden"
                    >
                      <AccordionTrigger className="px-4 sm:px-5 py-3 sm:py-4 hover:no-underline">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl w-10 h-10 flex items-center justify-center rounded-lg shrink-0 bg-muted">
                            📄
                          </span>
                          <div className="text-left">
                            <div className="ab-cat-name font-semibold text-sm sm:text-base">
                              Other Books
                            </div>
                            <div className="ab-cat-desc text-xs font-normal">
                              Books not assigned to a category
                            </div>
                          </div>
                          <Badge variant="secondary" className="ml-2 shrink-0">
                            {uncategorisedBooks.length}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 sm:px-5 pb-4 sm:pb-5">
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
    </div>
  );
}

function BookGrid({
  books,
  onDelete,
}: {
  books: Doc<"books">[];
  onDelete: (bookId: Id<"books">, driveFileId: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {books.map((book, i) => (
        <motion.div
          key={book._id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.04 }}
          className="relative group h-full"
        >
          {/* Delete button */}
          <button
            className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-lg"
            onClick={() => onDelete(book._id, book.driveFileId)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>

          <div className="ab-book-card h-full flex flex-col rounded-xl border overflow-hidden transition-all hover:scale-105">
            <div className="p-3 sm:p-4 border-b border-inherit">
              <div className="flex justify-between items-start mb-2">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
                <div className="flex gap-1.5 flex-wrap justify-end">
                  <Badge variant="secondary" className="text-xs">
                    {book.instrument}
                  </Badge>
                  {book.levelNumber && (
                    <Badge variant="outline" className="text-xs">
                      Lvl {book.levelNumber}
                    </Badge>
                  )}
                </div>
              </div>
              <h3 className="ab-book-title font-bold text-sm sm:text-base leading-snug mt-1">
                {book.title}
              </h3>
              {book.subcategory && (
                <p className="ab-book-sub text-xs mt-0.5">{book.subcategory}</p>
              )}
              {book.seriesGroup && (
                <p className="ab-book-sub text-xs mt-0.5">
                  Series: {book.seriesGroup}
                  {book.seriesOrder && ` #${book.seriesOrder}`}
                </p>
              )}
            </div>
            <div className="p-3 sm:p-4 flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => window.open(book.driveViewLink, "_blank")}
                  className="ab-view-btn flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all"
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  View
                </button>
                {book.driveDownloadLink && (
                  <button
                    onClick={() =>
                      window.open(book.driveDownloadLink, "_blank")
                    }
                    className="ab-dl-btn p-1.5 rounded-lg border transition-all"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <p className="ab-book-sub text-xs">
                Uploaded {format(book.uploadedAt, "PP")}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

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
    <div className="flex items-center justify-center gap-3 mt-5 sm:mt-6">
      <button
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
        className="ab-page-btn p-1.5 rounded-lg border transition-all"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="ab-page-text text-sm">
        Page {page + 1} of {total}
      </span>
      <button
        disabled={page >= total - 1}
        onClick={() => onPageChange(page + 1)}
        className="ab-page-btn p-1.5 rounded-lg border transition-all"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
