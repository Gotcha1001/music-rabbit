"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Eye, Sparkles } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { useDebounce } from "use-debounce";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Input } from "@/components/ui/input";

/* ─────────────────────────────────────────────────────────────
   !important overrides — same pattern as student daily piece
   Light = default  |  Dark = .dark prefix
───────────────────────────────────────────────────────────── */
const TDAILY_STYLES = `
  .tdaily-page                        { background: #ffffff !important; }
  .dark .tdaily-page                  { background: linear-gradient(to bottom, #000000, #1a0030, #000000) !important; }

  .tdaily-title                       { color: hsl(var(--foreground)) !important; }
  .dark .tdaily-title                 { color: #ede9fe !important; }

  /* Featured piece card */
  .tdaily-featured-card               { background: hsl(var(--primary)/0.05) !important; border-color: hsl(var(--primary)/0.3) !important; }
  .dark .tdaily-featured-card         { background: rgba(76,29,149,0.2) !important; border-color: rgba(124,58,237,0.4) !important; }

  .tdaily-featured-title              { color: hsl(var(--foreground)) !important; }
  .tdaily-featured-desc               { color: hsl(var(--muted-foreground)) !important; }
  .tdaily-featured-body               { color: hsl(var(--foreground)) !important; }
  .tdaily-featured-sub                { color: hsl(var(--muted-foreground)) !important; }
  .dark .tdaily-featured-title        { color: #ede9fe !important; }
  .dark .tdaily-featured-desc         { color: #c4b5fd !important; }
  .dark .tdaily-featured-body         { color: #ede9fe !important; }
  .dark .tdaily-featured-sub          { color: #c4b5fd !important; }

  /* View today button */
  .tdaily-view-today-btn              { background: hsl(var(--primary)) !important; color: #ffffff !important; border: none !important; }
  .tdaily-view-today-btn:hover        { background: hsl(var(--primary)/0.9) !important; }
  .dark .tdaily-view-today-btn        { background: #7c3aed !important; }
  .dark .tdaily-view-today-btn:hover  { background: #6d28d9 !important; }

  /* Book grid cards */
  .tdaily-book-card                   { background: #ffffff !important; border-color: hsl(var(--border)) !important; }
  .tdaily-book-card:hover             { box-shadow: 0 4px 16px rgba(0,0,0,0.1) !important; }
  .dark .tdaily-book-card             { background: hsl(270 90% 5%) !important; border-color: rgba(109,40,217,0.3) !important; }
  .dark .tdaily-book-card:hover       { box-shadow: 0 4px 24px rgba(139,92,246,0.2) !important; }

  .tdaily-book-title                  { color: hsl(var(--foreground)) !important; }
  .tdaily-book-desc                   { color: hsl(var(--muted-foreground)) !important; }
  .tdaily-book-body                   { color: hsl(var(--muted-foreground)) !important; }
  .dark .tdaily-book-title            { color: #ede9fe !important; }
  .dark .tdaily-book-desc             { color: #a78bfa !important; }
  .dark .tdaily-book-body             { color: #c4b5fd !important; }

  /* View piece button */
  .tdaily-view-btn                    { border-color: hsl(var(--primary)/0.4) !important; color: hsl(var(--primary)) !important; background: transparent !important; }
  .tdaily-view-btn:hover              { background: hsl(var(--primary)/0.08) !important; }
  .dark .tdaily-view-btn              { border-color: rgba(124,58,237,0.5) !important; color: #c4b5fd !important; }
  .dark .tdaily-view-btn:hover        { background: rgba(76,29,149,0.3) !important; }

  /* Search input */
  .tdaily-search                      { background: #ffffff !important; border-color: hsl(var(--border)) !important; color: hsl(var(--foreground)) !important; }
  .dark .tdaily-search                { background: hsl(270 80% 6%) !important; border-color: rgba(109,40,217,0.4) !important; color: #ede9fe !important; }
`;

/* ── BooksGrid ─────────────────────────────────────────────── */
function BooksGrid({
  categoryId,
  search,
}: {
  categoryId: Id<"bookCategories">;
  search: string;
}) {
  const books = useQuery(api.books.getByCategory, { categoryId, search });

  if (!books) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <Alert variant="default" className="max-w-2xl mx-auto">
        <AlertTitle>No matching pieces found</AlertTitle>
        <AlertDescription>Try adjusting your search terms.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {books.map((book, index) => (
        <motion.div
          key={book._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08 }}
          className="h-full"
        >
          <div className="tdaily-book-card h-full flex flex-col rounded-xl border overflow-hidden transition-shadow">
            {/* Header */}
            <div className="p-3 sm:p-4 pb-2 border-b border-inherit">
              <h3 className="tdaily-book-title font-semibold text-sm sm:text-base line-clamp-2">
                {book.title}
              </h3>
              <div className="flex flex-wrap gap-1.5 items-center mt-2">
                <span className="tdaily-book-desc text-xs">
                  Uploaded{" "}
                  {formatDistanceToNow(new Date(book.uploadedAt), {
                    addSuffix: true,
                  })}
                </span>
                <Badge variant="outline" className="text-xs">
                  {book.instrument}
                </Badge>
                {book.levelNumber && (
                  <Badge variant="secondary" className="text-xs">
                    Level {book.levelNumber}
                  </Badge>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 p-3 sm:p-4 py-2">
              <p className="tdaily-book-body text-xs sm:text-sm line-clamp-3">
                {book.description || "No description provided."}
              </p>
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 pt-2">
              <a
                href={book.driveViewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="tdaily-view-btn w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border text-sm font-medium transition-all duration-200"
              >
                <Eye className="h-4 w-4 shrink-0" />
                View Piece
              </a>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ── DailyPiecePage ────────────────────────────────────────── */
export default function DailyPiecePage() {
  const categories = useQuery(api.bookCategories.getAll);
  const dailyCategory = categories?.find((cat) => cat.name === "Daily piece");

  const todaysPiece = useQuery(
    api.dailyPiece.getTodaysPiece,
    dailyCategory ? undefined : "skip",
  );

  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 350);

  if (!categories) {
    return (
      <div className="tdaily-page min-h-screen container mx-auto p-4 sm:p-6">
        <style>{TDAILY_STYLES}</style>
        <Skeleton className="h-10 w-64 mb-6" />
      </div>
    );
  }

  if (!dailyCategory) {
    return (
      <div className="tdaily-page min-h-screen container mx-auto p-4 sm:p-6">
        <style>{TDAILY_STYLES}</style>
        <Alert variant="destructive">
          <AlertTitle>Category Not Found</AlertTitle>
          <AlertDescription>
            The &quot;Daily piece&quot; category is missing or inactive.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const hasSearch = search.trim().length > 0;

  return (
    <div className="tdaily-page min-h-screen">
      <style>{TDAILY_STYLES}</style>
      <div className="container mx-auto p-4 sm:p-6">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <h1 className="tdaily-title text-2xl sm:text-3xl font-bold font-serif">
            Daily Music Pieces
          </h1>
          <Input
            placeholder="Search by title, description, level, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="tdaily-search w-full sm:max-w-md"
          />
        </div>

        {/* Featured piece */}
        {todaysPiece && !hasSearch && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 sm:mb-10"
          >
            <div className="tdaily-featured-card rounded-xl border-2 overflow-hidden">
              {/* Header */}
              <div className="p-4 sm:p-6 border-b border-inherit">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary dark:text-purple-400 shrink-0" />
                  <h2 className="tdaily-featured-title font-bold text-base sm:text-lg">
                    Today&apos;s Featured Piece
                  </h2>
                </div>
                <p className="tdaily-featured-desc text-xs sm:text-sm">
                  Added{" "}
                  {formatDistanceToNow(new Date(todaysPiece.uploadedAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-6">
                <p className="tdaily-featured-body font-medium text-sm sm:text-base">
                  {todaysPiece.title}
                </p>
                <p className="tdaily-featured-sub text-xs sm:text-sm mt-1">
                  {todaysPiece.description || "No description available."}
                </p>
              </div>

              {/* Footer */}
              <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                <a
                  href={todaysPiece.driveViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tdaily-view-today-btn inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-semibold transition-all duration-200"
                >
                  <Eye className="h-4 w-4 shrink-0" />
                  View Today&apos;s Piece
                </a>
              </div>
            </div>
          </motion.div>
        )}

        {/* Books grid */}
        <BooksGrid categoryId={dailyCategory._id} search={debouncedSearch} />
      </div>
    </div>
  );
}
