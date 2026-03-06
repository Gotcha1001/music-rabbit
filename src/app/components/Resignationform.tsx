"use client";

// components/leave/ResignationForm.tsx

import { useState } from "react";
import { ResignationFormValues } from "../../../convex/resignations";

const C = {
  card: "#151828",
  border: "#1E2438",
  gold: "#F5C842",
  red: "#FF5C6A",
  orange: "#FF8C42",
  text: "#E8EAF6",
  muted: "#6B7280",
  surface: "#1C2035",
};

interface ResignationFormProps {
  onSubmit: (values: ResignationFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

const EMPTY_FORM: ResignationFormValues = {
  lastWorkingDay: "",
  reason: "",
  handoverNotes: "",
};

/** Today as YYYY-MM-DD (local date) */
function todayStr(): string {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

/** Returns true if the chosen date is at least 1 full calendar month from today */
function hasFullMonthNotice(lastWorkingDay: string): boolean {
  if (!lastWorkingDay) return false;
  const today = new Date();
  const minDate = new Date(today);
  minDate.setMonth(minDate.getMonth() + 1);
  minDate.setHours(0, 0, 0, 0);
  const lwd = new Date(lastWorkingDay);
  lwd.setHours(0, 0, 0, 0);
  return lwd >= minDate;
}

function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function ResignationForm({
  onSubmit,
  isSubmitting = false,
}: ResignationFormProps) {
  const [form, setForm] = useState<ResignationFormValues>(EMPTY_FORM);
  const [error, setError] = useState<string>("");
  const [confirmed, setConfirmed] = useState(false);

  const today = todayStr();
  const isShortNotice = form.lastWorkingDay
    ? !hasFullMonthNotice(form.lastWorkingDay)
    : false;

  function setField<K extends keyof ResignationFormValues>(
    key: K,
    value: ResignationFormValues[K],
  ): void {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
    if (key === "lastWorkingDay") setConfirmed(false);
  }

  async function handleSubmit(): Promise<void> {
    if (!form.lastWorkingDay) {
      setError("Please select your last working day.");
      return;
    }
    if (form.lastWorkingDay <= today) {
      setError("Last working day must be a future date.");
      return;
    }
    if (!form.reason.trim()) {
      setError("Please provide a reason for resignation.");
      return;
    }
    // If short notice, require the teacher to explicitly confirm they understand
    if (isShortNotice && !confirmed) {
      setError(
        "Please confirm you understand the no-pay consequence before submitting.",
      );
      return;
    }

    try {
      await onSubmit(form);
      setForm(EMPTY_FORM);
      setError("");
      setConfirmed(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed.");
    }
  }

  const inp: React.CSSProperties = {
    width: "100%",
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: "10px",
    padding: "11px 14px",
    color: C.text,
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  const lbl: React.CSSProperties = {
    display: "block",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: C.muted,
    marginBottom: "7px",
  };

  return (
    <div>
      {/* Static info banner */}
      <div
        style={{
          background: "rgba(255,92,106,0.07)",
          border: "1px solid rgba(255,92,106,0.25)",
          borderRadius: "12px",
          padding: "16px 20px",
          marginBottom: "22px",
          display: "flex",
          gap: "12px",
          alignItems: "flex-start",
        }}
      >
        <span style={{ fontSize: "20px", flexShrink: 0 }}>⚠️</span>
        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: "13px",
              color: C.red,
              marginBottom: "4px",
            }}
          >
            1-Month Notice Required
          </div>
          <div style={{ fontSize: "12px", color: C.muted, lineHeight: "1.6" }}>
            Your last working day must be{" "}
            <strong style={{ color: C.text }}>
              at least 1 full month from today
            </strong>
            . If you do not give sufficient notice,{" "}
            <strong style={{ color: C.red }}>
              you will forfeit your pay for the final month
            </strong>
            .
          </div>
        </div>
      </div>

      {/* Form card */}
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: "16px",
          padding: "28px",
        }}
      >
        <div
          style={{ fontSize: "14px", fontWeight: 700, marginBottom: "22px" }}
        >
          Submit Resignation Notice
        </div>

        {/* Last working day */}
        <div style={{ marginBottom: "18px" }}>
          <label style={lbl}>Last Working Day *</label>
          <input
            type="date"
            value={form.lastWorkingDay}
            min={today}
            onChange={(e) => setField("lastWorkingDay", e.target.value)}
            style={inp}
          />

          {/* Dynamic feedback once a date is picked */}
          {form.lastWorkingDay && (
            <div
              style={{
                marginTop: "8px",
                padding: "10px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                lineHeight: "1.5",
                background: isShortNotice
                  ? "rgba(255,92,106,0.08)"
                  : "rgba(61,214,140,0.08)",
                border: `1px solid ${isShortNotice ? "rgba(255,92,106,0.3)" : "rgba(61,214,140,0.25)"}`,
                color: isShortNotice ? C.red : "#3DD68C",
              }}
            >
              {isShortNotice ? (
                <>
                  ⚠ <strong>Short notice:</strong> Your last working day (
                  {fmtDate(form.lastWorkingDay)}) is less than 1 month away.{" "}
                  <strong>
                    You will not receive pay for your final month.
                  </strong>
                </>
              ) : (
                <>
                  ✓ <strong>Valid notice period.</strong> Your last working day
                  is {fmtDate(form.lastWorkingDay)}.
                </>
              )}
            </div>
          )}
        </div>

        {/* Reason */}
        <div style={{ marginBottom: "18px" }}>
          <label style={lbl}>Reason for Resignation *</label>
          <textarea
            value={form.reason}
            onChange={(e) => setField("reason", e.target.value)}
            placeholder="Please share your reason for leaving..."
            style={{ ...inp, minHeight: "90px", resize: "vertical" }}
          />
        </div>

        {/* Handover notes */}
        <div style={{ marginBottom: "24px" }}>
          <label style={lbl}>
            Handover Notes{" "}
            <span
              style={{
                fontWeight: 400,
                textTransform: "none",
                fontSize: "11px",
              }}
            >
              (optional)
            </span>
          </label>
          <textarea
            value={form.handoverNotes}
            onChange={(e) => setField("handoverNotes", e.target.value)}
            placeholder="Student lists, ongoing tasks, important notes for your replacement..."
            style={{ ...inp, minHeight: "75px", resize: "vertical" }}
          />
        </div>

        {/* Short-notice confirmation checkbox */}
        {isShortNotice && (
          <div
            style={{
              background: "rgba(255,92,106,0.07)",
              border: "1px solid rgba(255,92,106,0.3)",
              borderRadius: "10px",
              padding: "14px 16px",
              marginBottom: "20px",
              display: "flex",
              gap: "12px",
              alignItems: "flex-start",
            }}
          >
            <input
              type="checkbox"
              id="shortNoticeConfirm"
              checked={confirmed}
              onChange={(e) => {
                setConfirmed(e.target.checked);
                setError("");
              }}
              style={{
                marginTop: "2px",
                cursor: "pointer",
                width: "16px",
                height: "16px",
                flexShrink: 0,
              }}
            />
            <label
              htmlFor="shortNoticeConfirm"
              style={{
                fontSize: "12px",
                color: C.red,
                lineHeight: "1.6",
                cursor: "pointer",
              }}
            >
              I understand that I am giving less than 1 month&apos;s notice and{" "}
              <strong>I will forfeit my pay for the final month</strong> of
              employment.
            </label>
          </div>
        )}

        {error && (
          <div
            style={{
              background: "rgba(255,92,106,0.09)",
              border: "1px solid rgba(255,92,106,0.3)",
              borderRadius: "8px",
              padding: "11px 15px",
              fontSize: "13px",
              color: C.red,
              marginBottom: "18px",
            }}
          >
            ⚠ {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={{
            background: `linear-gradient(135deg, ${C.red}, #cc2d3a)`,
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "13px 28px",
            fontSize: "14px",
            fontWeight: 700,
            cursor: isSubmitting ? "not-allowed" : "pointer",
            letterSpacing: "0.04em",
            opacity: isSubmitting ? 0.7 : 1,
          }}
        >
          {isSubmitting ? "Submitting..." : "Submit Resignation →"}
        </button>
      </div>
    </div>
  );
}
