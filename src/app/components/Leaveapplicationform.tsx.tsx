"use client";

// components/leave/LeaveApplicationForm.tsx

import { useState } from "react";
import type { LeaveFormValues, LeaveType } from "../../app/types/leave";
import {
  LEAVE_TYPES,
  calcDays,
  TOTAL_ANNUAL_LEAVE_DAYS,
} from "@/lib/leaveUtils";

const C = {
  card: "#151828",
  border: "#1E2438",
  gold: "#F5C842",
  red: "#FF5C6A",
  green: "#3DD68C",
  text: "#E8EAF6",
  muted: "#6B7280",
  surface: "#1C2035",
};

interface LeaveApplicationFormProps {
  usedDays: number;
  onSubmit: (values: LeaveFormValues, days: number) => void;
  isSubmitting?: boolean;
}

const EMPTY_FORM: LeaveFormValues = {
  type: "",
  from: "",
  to: "",
  reason: "",
  substitute: "",
};

export default function LeaveApplicationForm({
  usedDays,
  onSubmit,
  isSubmitting = false,
}: LeaveApplicationFormProps) {
  const [form, setForm] = useState<LeaveFormValues>(EMPTY_FORM);
  const [error, setError] = useState<string>("");

  const remaining = TOTAL_ANNUAL_LEAVE_DAYS - usedDays;
  const days = calcDays(form.from, form.to);
  const pct = Math.min(
    Math.round((usedDays / TOTAL_ANNUAL_LEAVE_DAYS) * 100),
    100,
  );

  function setField<K extends keyof LeaveFormValues>(
    key: K,
    value: LeaveFormValues[K],
  ): void {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  }

  function handleSubmit(): void {
    if (!form.type || !form.from || !form.to || !form.reason.trim()) {
      setError("Please complete all required fields.");
      return;
    }
    if (days <= 0) {
      setError("End date must be after start date.");
      return;
    }
    if (days > remaining) {
      setError(
        `Only ${remaining} day${remaining !== 1 ? "s" : ""} remaining this year.`,
      );
      return;
    }
    onSubmit(form, days);
    setForm(EMPTY_FORM);
    setError("");
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
      {/* Days tracker */}
      <div
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: "14px",
          padding: "20px 24px",
          marginBottom: "26px",
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}
      >
        {/* Circular progress ring */}
        <div
          style={{
            position: "relative",
            width: "58px",
            height: "58px",
            flexShrink: 0,
          }}
        >
          <svg width="58" height="58" viewBox="0 0 58 58">
            <circle
              cx="29"
              cy="29"
              r="23"
              fill="none"
              stroke={C.border}
              strokeWidth="6"
            />
            <circle
              cx="29"
              cy="29"
              r="23"
              fill="none"
              stroke={C.gold}
              strokeWidth="6"
              strokeDasharray={`${pct * 1.445} 144.5`}
              strokeLinecap="round"
              transform="rotate(-90 29 29)"
              style={{ transition: "stroke-dasharray 0.5s" }}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: 800,
              color: C.gold,
            }}
          >
            {remaining}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{ fontWeight: 700, fontSize: "15px", marginBottom: "3px" }}
          >
            {remaining} of {TOTAL_ANNUAL_LEAVE_DAYS} days remaining
          </div>
          <div
            style={{ fontSize: "12px", color: C.muted, marginBottom: "10px" }}
          >
            {usedDays} used this year (pending + approved)
          </div>
          <div
            style={{
              height: "5px",
              background: C.border,
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                background: `linear-gradient(90deg, ${C.gold}, #e6a800)`,
                borderRadius: "4px",
                transition: "width 0.5s",
              }}
            />
          </div>
        </div>

        {days > 0 && (
          <div
            style={{
              background:
                days > remaining
                  ? "rgba(255,92,106,0.1)"
                  : "rgba(61,214,140,0.08)",
              border: `1px solid ${days > remaining ? "rgba(255,92,106,0.3)" : "rgba(61,214,140,0.25)"}`,
              borderRadius: "10px",
              padding: "10px 16px",
              textAlign: "center",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontSize: "22px",
                fontWeight: 800,
                color: days > remaining ? C.red : C.green,
              }}
            >
              {days}
            </div>
            <div style={{ fontSize: "11px", color: C.muted }}>
              days selected
            </div>
          </div>
        )}
      </div>

      {/* Form */}
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
          New Leave Application
        </div>

        <div style={{ marginBottom: "18px" }}>
          <label style={lbl}>Leave Type *</label>
          <select
            value={form.type}
            onChange={(e) => setField("type", e.target.value as LeaveType | "")}
            style={{ ...inp, appearance: "none", cursor: "pointer" }}
          >
            <option value="">Select type…</option>
            {LEAVE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginBottom: "18px",
          }}
        >
          <div>
            <label style={lbl}>From *</label>
            <input
              type="date"
              value={form.from}
              onChange={(e) => setField("from", e.target.value)}
              style={inp}
            />
          </div>
          <div>
            <label style={lbl}>To *</label>
            <input
              type="date"
              value={form.to}
              min={form.from}
              onChange={(e) => setField("to", e.target.value)}
              style={inp}
            />
          </div>
        </div>

        <div style={{ marginBottom: "18px" }}>
          <label style={lbl}>Reason *</label>
          <textarea
            value={form.reason}
            onChange={(e) => setField("reason", e.target.value)}
            placeholder="Briefly describe your reason for leave…"
            style={{ ...inp, minHeight: "85px", resize: "vertical" }}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={lbl}>
            Suggested Substitute{" "}
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
          <input
            type="text"
            value={form.substitute}
            onChange={(e) => setField("substitute", e.target.value)}
            placeholder="Suggest a substitute teacher if you have one in mind…"
            style={inp}
          />
        </div>

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
            background: `linear-gradient(135deg, ${C.gold}, #e6a800)`,
            color: "#0D0F1A",
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
          {isSubmitting ? "Submitting…" : "Submit to Admin →"}
        </button>
      </div>
    </div>
  );
}
