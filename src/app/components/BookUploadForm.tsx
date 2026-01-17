"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Upload, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { Doc, Id } from "../../../convex/_generated/dataModel";

const instruments = [
  "Piano",
  "Guitar",
  "Violin",
  "Drums",
  "Voice",
  "Flute",
  "Saxophone",
  "Trumpet",
  "Cello",
  "Bass Guitar",
  "Ukulele",
  "Clarinet",
  "Other",
].sort();

export function BookUploadForm() {
  const categories = useQuery(api.bookCategories.getActive) ?? [];

  const [title, setTitle] = useState("");
  const [instrument, setInstrument] = useState("");
  const [categoryId, setCategoryId] = useState<Id<"bookCategories"> | "">("");
  const [levelNumber, setLevelNumber] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const selectedCategory = categories.find(
    (c: Doc<"bookCategories">) => c._id === categoryId
  );

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleSubmit = async () => {
    // Frontend validation
    if (!title || !instrument || !categoryId || !file) {
      toast.error("Title, Instrument, Category, and PDF file are required");
      return;
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Only PDF files allowed");
      return;
    }

    setUploading(true);

    try {
      // Create FormData and append ALL fields
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("instrument", instrument);
      formData.append("categoryId", categoryId); // This is the key field!

      // Optional fields - only append if they have values
      if (levelNumber) {
        formData.append("levelNumber", levelNumber);
      }
      if (subcategory) {
        formData.append("subcategory", subcategory);
      }
      if (description) {
        formData.append("description", description);
      }
      if (tags.length > 0) {
        formData.append("tags", JSON.stringify(tags));
      }

      // Upload to your API route
      const response = await fetch("/api/upload-book", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      toast.success("Book uploaded successfully!");

      // Reset form
      setTitle("");
      setInstrument("");
      setCategoryId("");
      setLevelNumber("");
      setSubcategory("");
      setDescription("");
      setTags([]);
      setTagInput("");
      setFile(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      console.error("Upload error:", errorMessage);
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl font-serif">Upload New Book</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Hanon Virtuoso Pianist"
              className="mt-2"
            />
          </div>

          <div>
            <Label>Instrument *</Label>
            <Select value={instrument} onValueChange={setInstrument}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select instrument" />
              </SelectTrigger>
              <SelectContent>
                {instruments.map((i) => (
                  <SelectItem key={i} value={i}>
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Category *</Label>
          <Select
            value={categoryId}
            onValueChange={(value) =>
              setCategoryId(value as Id<"bookCategories"> | "")
            }
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Choose category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat: Doc<"bookCategories">) => (
                <SelectItem key={cat._id} value={cat._id}>
                  <span className="text-xl mr-2">{cat.icon}</span>
                  {cat.name}{" "}
                  {cat.hasLevels && `(Levels 1-${cat.maxLevel ?? 10})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCategory?.hasLevels && (
          <div>
            <Label>Level Number</Label>
            <Input
              type="number"
              min="1"
              max={selectedCategory.maxLevel ?? 10}
              value={levelNumber}
              onChange={(e) => setLevelNumber(e.target.value)}
              className="w-32 mt-2"
            />
          </div>
        )}

        {selectedCategory && (
          <div
            className="p-6 rounded-xl border-2"
            style={{
              backgroundColor: `${selectedCategory.color}20`,
              borderColor: `${selectedCategory.color}40`,
            }}
          >
            <div className="flex items-center gap-4">
              <span className="text-5xl">{selectedCategory.icon}</span>
              <div>
                <h3 className="text-xl font-bold">{selectedCategory.name}</h3>
                <p className="text-muted-foreground">
                  {selectedCategory.description}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Subcategory (optional)</Label>
            <Input
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              placeholder="e.g. Arpeggios, Blues"
              className="mt-2"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>
        </div>

        <div>
          <Label>Tags</Label>
          <div className="flex gap-2 mt-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), handleAddTag())
              }
              placeholder="Add tag..."
            />
            <Button type="button" onClick={handleAddTag} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map((t) => (
              <Badge key={t} variant="secondary" className="pl-3 pr-2 py-1">
                {t}{" "}
                <X
                  className="h-3 w-3 ml-1 cursor-pointer"
                  onClick={() => setTags(tags.filter((x) => x !== t))}
                />
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label>PDF File *</Label>
          <div className="mt-2">
            {file ? (
              <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
                <FileText className="h-8 w-8" />
                <span className="font-medium">{file.name}</span>
                <Button size="sm" variant="ghost" onClick={() => setFile(null)}>
                  Change
                </Button>
              </div>
            ) : (
              <Input
                type="file"
                accept=".pdf"
                onChange={(e) =>
                  e.target.files?.[0] && setFile(e.target.files[0])
                }
              />
            )}
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={uploading || !file || !title || !instrument || !categoryId}
          size="lg"
          className="w-full text-lg"
        >
          {uploading ? (
            <>
              Uploading... <Loader2 className="ml-2 h-5 w-5 animate-spin" />
            </>
          ) : (
            <>
              Upload Book <Upload className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
