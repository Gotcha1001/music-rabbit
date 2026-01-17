// app/dashboard/teacher/books/page.tsx
"use client";

import { useUserDetail } from "@/context/UserDetailContext";
import { useQuery } from "convex/react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { api } from "../../../../../convex/_generated/api";

export default function TeacherBooks() {
  const { userDetail } = useUserDetail();

  const books = useQuery(
    api.books.getByInstrument,
    userDetail?.role === "teacher" && userDetail.instrument
      ? { instrument: userDetail.instrument }
      : "skip"
  );

  if (!userDetail) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading profile...
      </div>
    );
  }

  if (userDetail.role !== "teacher") {
    return (
      <div className="flex min-h-screen items-center justify-center text-destructive">
        Unauthorized
      </div>
    );
  }

  if (books === undefined) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">Available Books</h1>
      {books.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No books available for {userDetail.instrument}.
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <Card key={book._id}>
              <CardHeader>
                <CardTitle>{book.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Level:{" "}
                  {book.levelNumber != null
                    ? `Level ${book.levelNumber}`
                    : "No level"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Instrument: {book.instrument}
                </p>
                <Button asChild variant="outline">
                  <a
                    href={book.driveViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Book
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
