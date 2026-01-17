// app/admin/categories/AdminCategoryManager.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

// Reuse your ColorPicker & EmojiPicker components (same as before)
const ColorPicker = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (c: string) => void;
}) => {
  const colors = [
    "#3b82f6",
    "#f97316",
    "#22c55e",
    "#eab308",
    "#a855f7",
    "#ec4899",
    "#06b6d4",
    "#6366f1",
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((c) => (
        <button
          key={c}
          type="button"
          className={`w-10 h-10 rounded-full border-4 ${value === c ? "border-black" : "border-gray-300"}`}
          style={{ background: c }}
          onClick={() => onChange(c)}
        />
      ))}
    </div>
  );
};

const EmojiPicker = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: string) => void;
}) => {
  const emojis = [
    "Eye",
    "Drum",
    "Seedling",
    "ChartIncreasing",
    "Star",
    "Ear",
    "Ruler",
    "MusicalNote",
    "Piano",
    "Link",
    "Paintbrush",
    "Sparkles",
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {emojis.map((e) => (
        <button
          key={e}
          type="button"
          className={`text-3xl p-2 rounded-lg border ${value === e ? "border-primary bg-primary/10" : "border-border"}`}
          onClick={() => onChange(e)}
        >
          {e}
        </button>
      ))}
    </div>
  );
};

export function AdminCategoryManager() {
  const categories = useQuery(api.bookCategories.getAllForAdmin) ?? [];
  const categoriesWithCounts =
    useQuery(api.bookCategories.getCategoriesWithBookCounts) ?? [];

  const create = useMutation(api.bookCategories.create);
  const update = useMutation(api.bookCategories.update);
  const softDelete = useMutation(api.bookCategories.softDelete);
  // reorder mutation removed – not used yet (drag-and-drop not implemented)
  // const reorder = useMutation(api.bookCategories.reorder);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<"bookCategories"> | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    icon: "MusicalNote",
    color: "#3b82f6",
    hasLevels: true,
    maxLevel: 10,
  });

  const resetForm = () =>
    setForm({
      name: "",
      description: "",
      icon: "MusicalNote",
      color: "#3b82f6",
      hasLevels: true,
      maxLevel: 10,
    });

  const handleCreate = async () => {
    if (!form.name.trim()) return toast.error("Name required");
    await create(form);
    toast.success("Created!");
    setIsCreateOpen(false);
    resetForm();
  };

  const handleUpdate = async () => {
    if (!editingId || !form.name.trim()) return;
    await update({ categoryId: editingId, ...form });
    toast.success("Updated!");
    setEditingId(null);
    resetForm();
  };

  const openEdit = (cat: (typeof categories)[0]) => {
    setForm({
      name: cat.name,
      description: cat.description,
      icon: cat.icon,
      color: cat.color,
      hasLevels: cat.hasLevels,
      maxLevel: cat.maxLevel ?? 10,
    });
    setEditingId(cat._id);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Book Categories</h1>
          <p className="text-muted-foreground">
            Manage categories and their appearance
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Icon</Label>
                <EmojiPicker
                  value={form.icon}
                  onChange={(i) => setForm((f) => ({ ...f, icon: i }))}
                />
              </div>
              <div>
                <Label>Color</Label>
                <ColorPicker
                  value={form.color}
                  onChange={(c) => setForm((f) => ({ ...f, color: c }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Has Levels</Label>
                <Switch
                  checked={form.hasLevels}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, hasLevels: v }))
                  }
                />
              </div>
              {form.hasLevels && (
                <div>
                  <Label>Max Level</Label>
                  <Input
                    type="number"
                    value={form.maxLevel}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, maxLevel: +e.target.value }))
                    }
                  />
                </div>
              )}
              <Button onClick={handleCreate} className="w-full">
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {categories.map((cat) => {
          const count =
            categoriesWithCounts.find((c) => c._id === cat._id)?.bookCount ?? 0;
          return (
            <Card key={cat._id} className={!cat.isActive ? "opacity-60" : ""}>
              <CardContent className="flex flex-col items-center gap-4 py-4">
                <GripVertical className="cursor-move text-muted-foreground" />
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                  style={{ background: `${cat.color}20` }}
                >
                  {cat.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{cat.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {cat.description}
                  </p>
                  <div className="flex gap-2 mt-2 justify-center">
                    <Badge variant="secondary">{count} books</Badge>
                    {cat.hasLevels && (
                      <Badge>Levels 1–{cat.maxLevel ?? 10}</Badge>
                    )}
                    {!cat.isActive && (
                      <Badge variant="destructive">Hidden</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      update({ categoryId: cat._id, isActive: !cat.isActive })
                    }
                  >
                    {cat.isActive ? <EyeOff /> : <Eye />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEdit(cat)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => softDelete({ categoryId: cat._id })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingId} onOpenChange={(o) => !o && setEditingId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Icon</Label>
              <EmojiPicker
                value={form.icon}
                onChange={(i) => setForm((f) => ({ ...f, icon: i }))}
              />
            </div>
            <div>
              <Label>Color</Label>
              <ColorPicker
                value={form.color}
                onChange={(c) => setForm((f) => ({ ...f, color: c }))}
              />
            </div>
            <Button onClick={handleUpdate} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
