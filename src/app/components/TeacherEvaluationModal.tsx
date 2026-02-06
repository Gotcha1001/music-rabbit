"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

type EvaluationScale =
  | "weak"
  | "ok"
  | "better"
  | "good"
  | "excellent"
  | "perfection";

const SCALE_OPTIONS: EvaluationScale[] = [
  "weak",
  "ok",
  "better",
  "good",
  "excellent",
  "perfection",
];

interface TeacherEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: Id<"users">;
  studentName: string;
  teacherId: Id<"users">;
  previousEvaluation?: {
    month: number;
    year: number;
    scales?: string;
    chords?: string;
    sightReading?: string;
    rhythm?: string;
    improvisation?: string;
    piecesWorkedOn?: string[];
  } | null;
}

export function TeacherEvaluationModal({
  isOpen,
  onClose,
  studentId,
  studentName,
  teacherId,
  previousEvaluation,
}: TeacherEvaluationModalProps) {
  const createEvaluation = useMutation(api.evaluations.createEvaluation);

  const [scales, setScales] = useState<EvaluationScale>("ok");
  const [chords, setChords] = useState<EvaluationScale>("ok");
  const [sightReading, setSightReading] = useState<EvaluationScale>("ok");
  const [rhythm, setRhythm] = useState<EvaluationScale>("ok");
  const [improvisation, setImprovisation] = useState<EvaluationScale>("ok");
  const [pieces, setPieces] = useState<string[]>([""]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddPiece = () => setPieces([...pieces, ""]);
  const handleRemovePiece = (index: number) =>
    setPieces(pieces.filter((_, i) => i !== index));
  const handlePieceChange = (index: number, value: string) => {
    const newPieces = [...pieces];
    newPieces[index] = value;
    setPieces(newPieces);
  };

  const handleSubmit = async () => {
    const validPieces = pieces.filter((p) => p.trim() !== "");
    if (validPieces.length === 0) {
      toast.error("Please add at least one piece");
      return;
    }

    setIsSubmitting(true);
    try {
      await createEvaluation({
        studentId,
        teacherId,
        scales,
        chords,
        sightReading,
        rhythm,
        improvisation,
        piecesWorkedOn: validPieces,
        notes: notes.trim() || undefined,
      });
      toast.success("Evaluation submitted successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to submit evaluation");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMonthYear = (month: number, year: number) =>
    new Date(year, month).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

  const hasFullPreviousData =
    previousEvaluation &&
    previousEvaluation.scales &&
    previousEvaluation.chords &&
    previousEvaluation.sightReading &&
    previousEvaluation.rhythm &&
    previousEvaluation.improvisation;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Monthly Evaluation for {studentName}</DialogTitle>
        </DialogHeader>

        {previousEvaluation && (
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg mb-4">
            <h3 className="font-semibold text-sm mb-2">
              Previous Evaluation (
              {getMonthYear(previousEvaluation.month, previousEvaluation.year)})
            </h3>

            {hasFullPreviousData ? (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  Scales:{" "}
                  <span className="font-medium capitalize">
                    {previousEvaluation.scales}
                  </span>
                </div>
                <div>
                  Chords:{" "}
                  <span className="font-medium capitalize">
                    {previousEvaluation.chords}
                  </span>
                </div>
                <div>
                  Sight Reading:{" "}
                  <span className="font-medium capitalize">
                    {previousEvaluation.sightReading}
                  </span>
                </div>
                <div>
                  Rhythm:{" "}
                  <span className="font-medium capitalize">
                    {previousEvaluation.rhythm}
                  </span>
                </div>
                <div>
                  Improvisation:{" "}
                  <span className="font-medium capitalize">
                    {previousEvaluation.improvisation}
                  </span>
                </div>
                {previousEvaluation.piecesWorkedOn?.length ? (
                  <div className="col-span-2 mt-2">
                    <span className="font-medium">Pieces worked on:</span>
                    <ul className="list-disc list-inside text-muted-foreground mt-1">
                      {previousEvaluation.piecesWorkedOn.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Previous evaluation exists for this month/year, but detailed
                criteria are not available in this view.
              </p>
            )}
          </div>
        )}

        {/* Rest of your form remains unchanged */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scales">Scales</Label>
              <Select
                value={scales}
                onValueChange={(v) => setScales(v as EvaluationScale)}
              >
                <SelectTrigger id="scales">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCALE_OPTIONS.map((option) => (
                    <SelectItem
                      key={option}
                      value={option}
                      className="capitalize"
                    >
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* ... same for chords, sightReading, rhythm, improvisation ... */}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Monthly Pieces Worked On</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddPiece}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Piece
              </Button>
            </div>
            <div className="space-y-2">
              {pieces.map((piece, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={piece}
                    onChange={(e) => handlePieceChange(index, e.target.value)}
                    placeholder={`Piece ${index + 1}`}
                  />
                  {pieces.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemovePiece(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional comments or observations..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Evaluation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
