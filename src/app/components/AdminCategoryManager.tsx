// app/admin/categories/AdminCategoryManager.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
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
  Music,
  Drum,
  Mic2,
  Star,
  Sparkles,
  BookOpen,
  Link2,
  Paintbrush,
  Ruler,
  type LucideIcon,
} from "lucide-react";

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

function CatIcon({ icon, color }: { icon?: string; color?: string }) {
  const LIcon = icon ? ICON_MAP[icon] : null;
  const bg = `${color ?? "#3b82f6"}20`;
  const fg = color ?? "#3b82f6";
  return (
    <div
      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center shrink-0"
      style={{ background: bg }}
    >
      {LIcon ? (
        <LIcon className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: fg }} />
      ) : (
        <span className="text-lg leading-none" style={{ color: fg }}>
          {icon?.slice(0, 1) ?? "🎵"}
        </span>
      )}
    </div>
  );
}
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

/* ─────────────────────────────────────────────────────────────
   !important overrides
   Light = default  |  Dark = .dark prefix
───────────────────────────────────────────────────────────── */
const ACAT_STYLES = `
  .acat-page                    { background: #ffffff !important; }
  .dark .acat-page              { background: linear-gradient(to bottom, #000000, #1a0030, #000000) !important; }

  .acat-title                   { color: hsl(var(--foreground)) !important; }
  .acat-subtitle                { color: hsl(var(--muted-foreground)) !important; }
  .dark .acat-title             { color: #ede9fe !important; }
  .dark .acat-subtitle          { color: #a78bfa !important; }

  /* New category button */
  .acat-new-btn                 { background: hsl(var(--primary)) !important; color: #ffffff !important; }
  .acat-new-btn:hover           { background: hsl(var(--primary)/0.9) !important; }
  .dark .acat-new-btn           { background: #7c3aed !important; }

  /* Category cards */
  .acat-card                    { background: #ffffff !important; border-color: hsl(var(--border)) !important; box-shadow: 0 2px 10px rgba(0,0,0,0.06) !important; }
  .acat-card-inactive           { background: hsl(var(--muted)/0.3) !important; border-color: hsl(var(--border)) !important; opacity: 0.65 !important; }
  .dark .acat-card              { background: hsl(270 90% 5%) !important; border-color: rgba(109,40,217,0.3) !important; }
  .dark .acat-card-inactive     { background: hsl(270 80% 4%) !important; border-color: rgba(109,40,217,0.2) !important; }

  .acat-cat-name                { color: hsl(var(--foreground)) !important; }
  .acat-cat-desc                { color: hsl(var(--muted-foreground)) !important; }
  .dark .acat-cat-name          { color: #ede9fe !important; }
  .dark .acat-cat-desc          { color: #a78bfa !important; }

  /* Icon action buttons */
  .acat-icon-btn                { color: hsl(var(--muted-foreground)) !important; background: transparent !important; }
  .acat-icon-btn:hover          { color: hsl(var(--foreground)) !important; background: hsl(var(--muted)) !important; }
  .dark .acat-icon-btn          { color: #a78bfa !important; }
  .dark .acat-icon-btn:hover    { color: #ede9fe !important; background: rgba(76,29,149,0.4) !important; }

  /* Dialog */
  .acat-dialog                  { background: #ffffff !important; border-color: hsl(var(--border)) !important; }
  .dark .acat-dialog            { background: hsl(270 90% 5%) !important; border-color: rgba(109,40,217,0.4) !important; }
  .acat-dialog-title            { color: hsl(var(--foreground)) !important; }
  .dark .acat-dialog-title      { color: #ede9fe !important; }

  /* Form labels */
  .acat-label                   { color: hsl(var(--foreground)) !important; }
  .dark .acat-label             { color: #c4b5fd !important; }

  /* Form inputs */
  .acat-input                   { background: #ffffff !important; border-color: hsl(var(--border)) !important; color: hsl(var(--foreground)) !important; }
  .acat-input:focus             { border-color: hsl(var(--primary)) !important; box-shadow: 0 0 0 2px hsl(var(--primary)/0.2) !important; }
  .dark .acat-input             { background: hsl(270 80% 6%) !important; border-color: rgba(109,40,217,0.4) !important; color: #ede9fe !important; }

  /* Emoji picker buttons */
  .acat-emoji-btn               { border-color: hsl(var(--border)) !important; color: hsl(var(--foreground)) !important; background: transparent !important; }
  .acat-emoji-btn:hover         { background: hsl(var(--muted)) !important; }
  .acat-emoji-btn-active        { border-color: hsl(var(--primary)) !important; background: hsl(var(--primary)/0.1) !important; }
  .dark .acat-emoji-btn         { border-color: rgba(109,40,217,0.4) !important; color: #ede9fe !important; }
  .dark .acat-emoji-btn:hover   { background: rgba(76,29,149,0.3) !important; }
  .dark .acat-emoji-btn-active  { border-color: #7c3aed !important; background: rgba(124,58,237,0.2) !important; }

  /* Submit buttons */
  .acat-submit-btn              { background: hsl(var(--primary)) !important; color: #ffffff !important; width: 100% !important; }
  .acat-submit-btn:hover        { background: hsl(var(--primary)/0.9) !important; }
  .dark .acat-submit-btn        { background: #7c3aed !important; }
  .dark .acat-submit-btn:hover  { background: #6d28d9 !important; }

  /* Has-levels label row */
  .acat-levels-label            { color: hsl(var(--foreground)) !important; }
  .dark .acat-levels-label      { color: #c4b5fd !important; }
`;

/* ── Sub-components ── */
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
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-4 transition-all ${value === c ? "border-gray-900 dark:border-white scale-110" : "border-gray-300 dark:border-gray-600"}`}
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
          className={`text-xs sm:text-sm px-2 py-1.5 rounded-lg border transition-all ${value === e ? "acat-emoji-btn-active acat-emoji-btn" : "acat-emoji-btn"}`}
          onClick={() => onChange(e)}
        >
          {e}
        </button>
      ))}
    </div>
  );
};

function FormFields({
  form,
  setForm,
  onSubmit,
  submitLabel,
}: {
  form: {
    name: string;
    description: string;
    icon: string;
    color: string;
    hasLevels: boolean;
    maxLevel: number;
  };
  setForm: React.Dispatch<React.SetStateAction<typeof form>>;
  onSubmit: () => void;
  submitLabel: string;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="acat-label text-sm font-medium block mb-1.5">
          Name
        </label>
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="acat-input w-full px-3 py-2 rounded-lg border text-sm outline-none transition-all"
        />
      </div>
      <div>
        <label className="acat-label text-sm font-medium block mb-1.5">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          rows={3}
          className="acat-input w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none transition-all"
        />
      </div>
      <div>
        <label className="acat-label text-sm font-medium block mb-1.5">
          Icon
        </label>
        <EmojiPicker
          value={form.icon}
          onChange={(i) => setForm((f) => ({ ...f, icon: i }))}
        />
      </div>
      <div>
        <label className="acat-label text-sm font-medium block mb-1.5">
          Color
        </label>
        <ColorPicker
          value={form.color}
          onChange={(c) => setForm((f) => ({ ...f, color: c }))}
        />
      </div>
      <div className="flex items-center justify-between">
        <label className="acat-levels-label text-sm font-medium">
          Has Levels
        </label>
        <Switch
          checked={form.hasLevels}
          onCheckedChange={(v) => setForm((f) => ({ ...f, hasLevels: v }))}
        />
      </div>
      {form.hasLevels && (
        <div>
          <label className="acat-label text-sm font-medium block mb-1.5">
            Max Level
          </label>
          <input
            type="number"
            value={form.maxLevel}
            onChange={(e) =>
              setForm((f) => ({ ...f, maxLevel: +e.target.value }))
            }
            className="acat-input w-full px-3 py-2 rounded-lg border text-sm outline-none transition-all"
          />
        </div>
      )}
      <button
        onClick={onSubmit}
        className="acat-submit-btn flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
      >
        <Save className="h-4 w-4" />
        {submitLabel}
      </button>
    </div>
  );
}

const DEFAULT_FORM = {
  name: "",
  description: "",
  icon: "MusicalNote",
  color: "#3b82f6",
  hasLevels: true,
  maxLevel: 10,
};

export function AdminCategoryManager() {
  const categories = useQuery(api.bookCategories.getAllForAdmin) ?? [];
  const categoriesWithCounts =
    useQuery(api.bookCategories.getCategoriesWithBookCounts) ?? [];

  const create = useMutation(api.bookCategories.create);
  const update = useMutation(api.bookCategories.update);
  const softDelete = useMutation(api.bookCategories.softDelete);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<"bookCategories"> | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const resetForm = () => setForm(DEFAULT_FORM);

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
      description: cat.description ?? "",
      icon: cat.icon ?? "MusicalNote",
      color: cat.color ?? "#3b82f6",
      hasLevels: cat.hasLevels,
      maxLevel: cat.maxLevel ?? 10,
    });
    setEditingId(cat._id);
  };

  return (
    <div className="acat-page min-h-screen">
      <style>{ACAT_STYLES}</style>
      <div className="space-y-5 sm:space-y-6 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h1 className="acat-title text-2xl sm:text-3xl font-bold font-serif">
              Book Categories
            </h1>
            <p className="acat-subtitle text-sm sm:text-base mt-1">
              Manage categories and their appearance
            </p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <button className="acat-new-btn flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 w-full sm:w-auto justify-center">
                <Plus className="h-4 w-4" />
                New Category
              </button>
            </DialogTrigger>
            <DialogContent className="acat-dialog max-w-2xl">
              <DialogHeader>
                <DialogTitle className="acat-dialog-title">
                  Create Category
                </DialogTitle>
              </DialogHeader>
              <FormFields
                form={form}
                setForm={setForm}
                onSubmit={handleCreate}
                submitLabel="Create"
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Category list */}
        <div className="space-y-3 sm:space-y-4">
          {categories.map((cat) => {
            const count =
              categoriesWithCounts.find((c) => c._id === cat._id)?.bookCount ??
              0;
            return (
              <div
                key={cat._id}
                className={`${cat.isActive ? "acat-card" : "acat-card-inactive"} rounded-xl border overflow-hidden`}
              >
                <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4">
                  {/* Drag handle */}
                  <GripVertical className="acat-icon-btn cursor-move shrink-0 h-5 w-5 mt-2.5" />

                  {/* Icon */}
                  <CatIcon icon={cat.icon} color={cat.color} />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="acat-cat-name font-semibold text-sm sm:text-base truncate">
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p className="acat-cat-desc text-xs sm:text-sm truncate">
                        {cat.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      <Badge variant="secondary" className="text-xs">
                        {count} books
                      </Badge>
                      {cat.hasLevels && (
                        <Badge className="text-xs">
                          Levels 1–{cat.maxLevel ?? 10}
                        </Badge>
                      )}
                      {!cat.isActive && (
                        <Badge variant="destructive" className="text-xs">
                          Hidden
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() =>
                        update({ categoryId: cat._id, isActive: !cat.isActive })
                      }
                      className="acat-icon-btn p-1.5 sm:p-2 rounded-lg transition-all"
                    >
                      {cat.isActive ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => openEdit(cat)}
                      className="acat-icon-btn p-1.5 sm:p-2 rounded-lg transition-all"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => softDelete({ categoryId: cat._id })}
                      className="acat-icon-btn p-1.5 sm:p-2 rounded-lg transition-all hover:!text-red-500 hover:!bg-red-50 dark:hover:!bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Edit dialog */}
        <Dialog
          open={!!editingId}
          onOpenChange={(o) => !o && setEditingId(null)}
        >
          <DialogContent className="acat-dialog max-w-2xl">
            <DialogHeader>
              <DialogTitle className="acat-dialog-title">
                Edit Category
              </DialogTitle>
            </DialogHeader>
            <FormFields
              form={form}
              setForm={setForm}
              onSubmit={handleUpdate}
              submitLabel="Save Changes"
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
