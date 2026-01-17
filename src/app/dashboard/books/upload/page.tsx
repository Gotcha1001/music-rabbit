"use client";

import { BookUploadForm } from "@/app/components/BookUploadForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BookUploadPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-5xl">
        {/* Back button */}
        <Link href="/dashboard/admin">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin Dashboard
          </Button>
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-primary font-serif mb-4">
            Upload New Book
          </h1>
          <p className="text-xl text-muted-foreground">
            Add PDF books with categories, levels, and instruments
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <BookUploadForm />
        </div>
      </div>
    </div>
  );
}
