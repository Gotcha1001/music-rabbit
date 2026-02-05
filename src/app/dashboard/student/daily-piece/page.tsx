"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Sparkles } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { useDebounce } from "use-debounce";
import { Id } from "../../../../../convex/_generated/dataModel";

/* -------------------------------------------
   Child component: owns the books query
-------------------------------------------- */
function BooksGrid({
  categoryId,
  search,
}: {
  categoryId: Id<"bookCategories">;
  search: string;
}) {
  const books = useQuery(api.books.getByCategory, {
    categoryId,
    search,
  });

  if (!books) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {books.map((book, index) => (
        <motion.div
          key={book._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08 }}
        >
          <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="line-clamp-2">{book.title}</CardTitle>
              <CardDescription className="flex flex-wrap gap-1.5 items-center mt-1">
                <span>
                  Uploaded{" "}
                  {formatDistanceToNow(new Date(book.uploadedAt), {
                    addSuffix: true,
                  })}
                </span>
                <Badge variant="outline">{book.instrument}</Badge>
                {book.levelNumber && (
                  <Badge variant="secondary">Level {book.levelNumber}</Badge>
                )}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {book.description || "No description provided."}
              </p>
            </CardContent>

            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <a
                  href={book.driveViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Eye className="mr-2 h-4 w-4" /> View Piece
                </a>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

/* -------------------------------------------
   Parent page: owns input & category logic
-------------------------------------------- */
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
      <div className="container mx-auto p-6">
        <Skeleton className="h-12 w-64 mb-6" />
      </div>
    );
  }

  if (!dailyCategory) {
    return (
      <div className="container mx-auto p-6">
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
    <div className="container mx-auto p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">Daily Music Pieces</h1>
        <Input
          placeholder="Search by title, description, level, tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      {todaysPiece && !hasSearch && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-10"
        >
          <Card className="border-2 border-primary/30 bg-primary/5">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>Today&apos;s Featured Piece</CardTitle>
              </div>
              <CardDescription>
                Added{" "}
                {formatDistanceToNow(new Date(todaysPiece.uploadedAt), {
                  addSuffix: true,
                })}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <p className="font-medium">{todaysPiece.title}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {todaysPiece.description || "No description available."}
              </p>
            </CardContent>

            <CardFooter>
              <Button variant="default" asChild>
                <a
                  href={todaysPiece.driveViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Today&apos;s Piece
                </a>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}

      <BooksGrid categoryId={dailyCategory._id} search={debouncedSearch} />
    </div>
  );
}
