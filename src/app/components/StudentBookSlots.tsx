"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, X, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { BookSelector } from "./BookSelector"; // re-use existing selector

type Slot = "main" | "subA" | "subB";

interface StudentBookSlotsProps {
  studentId: Id<"users">;
  scheduleId: Id<"schedules">;
  lessonId: string;
}

const SLOT_LABELS: Record<Slot, string> = {
  main: "Main Book",
  subA: "Sub Book A",
  subB: "Sub Book B",
};

export function StudentBookSlots({
  studentId,
  scheduleId,
  lessonId,
}: StudentBookSlotsProps) {
  const student = useQuery(api.users.getById, { id: studentId });
  const setStudentBooks = useMutation(api.users.setStudentBooks);
  const [expandedSlot, setExpandedSlot] = useState<Slot | null>(null);

  // Resolve book titles
  const mainBook = useQuery(
    api.books.getById,
    student?.currentBookId ? { id: student.currentBookId } : "skip",
  );
  const subBookA = useQuery(
    api.books.getById,
    student?.subBookAId ? { id: student.subBookAId } : "skip",
  );
  const subBookB = useQuery(
    api.books.getById,
    student?.subBookBId ? { id: student.subBookBId } : "skip",
  );

  const slotBooks = {
    main: mainBook,
    subA: subBookA,
    subB: subBookB,
  };

  const slotIds: Record<Slot, Id<"books"> | null> = {
    main: student?.currentBookId ?? null,
    subA: student?.subBookAId ?? null,
    subB: student?.subBookBId ?? null,
  };

  const handleClear = async (slot: Slot) => {
    try {
      await setStudentBooks({
        studentId,
        ...(slot === "main" && { currentBookId: null }),
        ...(slot === "subA" && { subBookAId: null }),
        ...(slot === "subB" && { subBookBId: null }),
      });
      toast.success(`${SLOT_LABELS[slot]} cleared`);
    } catch {
      toast.error("Failed to update");
    }
  };

  // BookSelector currently handles per-lesson assignment.
  // For student profile books, we use a small inline picker instead.
  // Clicking "Choose" on a slot expands an inline BookSelector-style picker.
  // For simplicity, we render a BookSelector and intercept its selection
  // to write to the student profile instead of the lesson.

  if (!student) return null;

  return (
    <div className="space-y-3 p-4 bg-purple-950/40 rounded-xl border border-purple-700/40">
      <h4 className="text-sm font-semibold text-purple-300 mb-2">
        Student Books
      </h4>

      {(["main", "subA", "subB"] as Slot[]).map((slot) => {
        const book = slotBooks[slot];
        const isExpanded = expandedSlot === slot;

        return (
          <div key={slot} className="space-y-2">
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="text-xs bg-purple-900/50 text-purple-300 border-purple-600/40 shrink-0 w-20 justify-center"
              >
                {SLOT_LABELS[slot]}
              </Badge>

              {book ? (
                <div className="flex flex-1 items-center gap-2 min-w-0">
                  <BookOpen className="h-4 w-4 text-purple-400 shrink-0" />
                  <span className="text-sm text-purple-100 truncate flex-1">
                    {book.title}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20 shrink-0"
                    onClick={() => handleClear(slot)}
                    title="Clear this slot"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <span className="text-sm text-purple-500 italic flex-1">
                  Not assigned
                </span>
              )}

              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-purple-400 hover:text-purple-200 hover:bg-purple-800/40 shrink-0 text-xs"
                onClick={() => setExpandedSlot(isExpanded ? null : slot)}
              >
                {isExpanded ? (
                  <>
                    Cancel <ChevronUp className="ml-1 h-3 w-3" />
                  </>
                ) : (
                  <>
                    {book ? "Change" : "Choose"}{" "}
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </>
                )}
              </Button>
            </div>

            {/* Inline book picker for this slot */}
            {isExpanded && (
              <ProfileBookPicker
                studentId={studentId}
                slot={slot}
                currentBookId={slotIds[slot]}
                onPicked={() => setExpandedSlot(null)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Inline picker that saves to student profile (not lesson) ────────────
function ProfileBookPicker({
  studentId,
  slot,
  currentBookId,
  onPicked,
}: {
  studentId: Id<"users">;
  slot: Slot;
  currentBookId: Id<"books"> | null;
  onPicked: () => void;
}) {
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [search, setSearch] = useState("");

  const categories = useQuery(api.bookCategories.getActive) ?? [];
  const setStudentBooks = useMutation(api.users.setStudentBooks);

  const isGlobalSearch = search.trim() !== "" && !selectedCategoryId;

  const allBooks =
    useQuery(api.books.getAllActive, isGlobalSearch ? {} : "skip") ?? [];

  const categorisedBooks =
    useQuery(
      api.books.getByCategory,
      selectedCategoryId
        ? {
            categoryId: selectedCategoryId as Id<"bookCategories">,
            search: search || undefined,
          }
        : "skip",
    ) ?? [];

  const globalSearchResults = isGlobalSearch
    ? allBooks.filter(
        (b) =>
          b.title.toLowerCase().includes(search.toLowerCase()) ||
          b.instrument.toLowerCase().includes(search.toLowerCase()),
      )
    : [];

  const books = isGlobalSearch ? globalSearchResults : categorisedBooks;

  const handleSelect = async (bookId: Id<"books">) => {
    try {
      await setStudentBooks({
        studentId,
        ...(slot === "main" && { currentBookId: bookId }),
        ...(slot === "subA" && { subBookAId: bookId }),
        ...(slot === "subB" && { subBookBId: bookId }),
      });
      toast.success(`${SLOT_LABELS[slot]} updated!`);
      onPicked();
    } catch {
      toast.error("Failed to assign book");
    }
  };

  return (
    <div className="ml-24 space-y-2 p-3 bg-purple-900/30 rounded-lg border border-purple-700/30">
      {/* Search */}
      <input
        className="w-full px-3 py-1.5 text-sm bg-purple-900/50 border border-purple-600/50 rounded text-purple-100 placeholder:text-purple-500 focus:outline-none focus:border-purple-400"
        placeholder="Search books..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          if (e.target.value.trim()) setSelectedCategoryId("");
        }}
      />

      {/* Category selector */}
      {!isGlobalSearch && (
        <select
          className="w-full px-3 py-1.5 text-sm bg-purple-900/50 border border-purple-600/50 rounded text-purple-100 focus:outline-none focus:border-purple-400"
          value={selectedCategoryId}
          onChange={(e) => {
            setSelectedCategoryId(e.target.value);
            setSearch("");
          }}
        >
          <option value="">Browse by category...</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      )}

      {/* Book list */}
      {(isGlobalSearch || selectedCategoryId) && (
        <div className="max-h-48 overflow-y-auto space-y-1">
          {books.length === 0 ? (
            <p className="text-xs text-purple-500 text-center py-4">
              No books found
            </p>
          ) : (
            books.map((book) => (
              <button
                key={book._id}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  book._id === currentBookId
                    ? "bg-purple-600/50 text-purple-100"
                    : "hover:bg-purple-800/50 text-purple-200"
                }`}
                onClick={() => handleSelect(book._id)}
              >
                <span className="font-medium">{book.title}</span>
                <span className="text-xs text-purple-400 ml-2">
                  {book.instrument}
                </span>
                {book._id === currentBookId && (
                  <span className="text-xs text-emerald-400 ml-2">
                    ✓ current
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
