"use client";

import Link from "next/link";
import { useQuery } from "convex/react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, ExternalLink, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { api } from "../../../../../convex/_generated/api";
import { Doc, Id } from "../../../../../convex/_generated/dataModel";

export default function AdminBooksPage() {
  const books = (useQuery(api.books.getAll) as Doc<"books">[]) || [];

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
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

      <div>
        <h2 className="text-3xl font-bold mb-6 text-primary font-serif">
          Library ({books.length})
        </h2>
        {books.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16 text-muted-foreground">
              No books yet
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {books.map((book, i) => (
              <motion.div
                key={book._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="relative group"
              >
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100"
                  onClick={() => handleDeleteBook(book._id, book.driveFileId)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Card className="h-full hover:scale-105 transition-transform">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <FileText className="h-8 w-8 text-primary" />
                      <div className="flex gap-2 flex-wrap justify-end">
                        <Badge variant="secondary">{book.instrument}</Badge>
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-2">{book.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                          window.open(book.driveViewLink, "_blank")
                        }
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
        )}
      </div>
    </motion.div>
  );
}
