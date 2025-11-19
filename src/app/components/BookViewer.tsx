// components/BookViewer.tsx

"use client";

import { useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, FileText, Download } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Doc, Id } from "../../../convex/_generated/dataModel";

interface BookViewerProps {
  bookId?: Id<"books">;
  instrument?: string;
  showAll?: boolean;
}

export function BookViewer({ bookId, instrument, showAll }: BookViewerProps) {
  const singleBook = useQuery(
    api.books.getById,
    bookId ? { id: bookId } : "skip"
  );

  const instrumentBooks = useQuery(
    api.books.getByInstrument,
    instrument && !bookId ? { instrument } : "skip"
  );

  const allBooks = useQuery(api.books.getAll, showAll ? {} : "skip");

  const books: Doc<"books">[] = bookId
    ? singleBook
      ? [singleBook]
      : []
    : instrument
      ? instrumentBooks || []
      : allBooks || [];

  if (!books || books.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No books available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {books.map((book: Doc<"books">) => (
        <Card key={book._id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="flex gap-2">
                <Badge variant="outline">{book.level}</Badge>
                <Badge variant="secondary">{book.instrument}</Badge>
              </div>
            </div>
            <CardTitle className="text-lg mt-2">{book.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => window.open(book.driveViewLink, "_blank")}
                className="flex-1"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Book
              </Button>
              {book.driveDownloadLink && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(book.driveDownloadLink, "_blank")}
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Uploaded {new Date(book.uploadedAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Usage examples:

// In Teacher Dashboard:
// <BookViewer instrument={currentUser.instrument} />

// In Student Dashboard:
// <BookViewer instrument={currentUser.instrument} />

// In Admin Dashboard - show all books:
// <BookViewer showAll />

// In Lesson Details - show specific book:
// <BookViewer bookId={lesson.bookId} />
