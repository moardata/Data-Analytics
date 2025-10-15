"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

// -----------------------------
// Types
// -----------------------------
export type FieldType =
  | "short_text"
  | "long_text"
  | "number"
  | "rating"
  | "radio"
  | "checkbox"
  | "select"
  | "multiselect"
  | "date";

export type FormField = {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  // for select-like controls
  options?: string[];
  // for rating controls
  max?: number; // default 5
};

export type FormDraft = {
  name: string;
  description?: string;
  fields: FormField[];
};

// -----------------------------
// Helpers
// -----------------------------
const newId = () => Math.random().toString(36).slice(2, 9);

const DEFAULT_RATING_MAX = 5;

const TYPE_OPTIONS: { value: FieldType; label: string }[] = [
  { value: "short_text", label: "Short text" },
  { value: "long_text", label: "Long text" },
  { value: "number", label: "Number" },
  { value: "rating", label: "Rating" },
  { value: "radio", label: "Radio" },
  { value: "checkbox", label: "Checkbox" },
  { value: "select", label: "Select" },
  { value: "multiselect", label: "Multi‑select" },
  { value: "date", label: "Date" },
];

// -----------------------------
// Component
// -----------------------------
export default function FormBuilderEnhanced() {
  const [draft, setDraft] = React.useState<FormDraft>({
    name: "",
    description: "",
    fields: [],
  });

  // Add-field composer state
  const [label, setLabel] = React.useState("");
  const [placeholder, setPlaceholder] = React.useState("");
  const [required, setRequired] = React.useState(false);
  const [type, setType] = React.useState<FieldType>("short_text");
  const [options, setOptions] = React.useState<string[]>([]);
  const [newOption, setNewOption] = React.useState("");
  const [ratingMax, setRatingMax] = React.useState<number>(DEFAULT_RATING_MAX);

  // Derived UI flags
  const needsOptions = type === "radio" || type === "checkbox" || type === "select" || type === "multiselect";
  const needsRating = type === "rating";

  function resetComposer() {
    setLabel("");
    setPlaceholder("");
    setRequired(false);
    setType("short_text");
    setOptions([]);
    setNewOption("");
    setRatingMax(DEFAULT_RATING_MAX);
  }

  function addOption() {
    if (!newOption.trim()) return;
    setOptions((prev) => [...prev, newOption.trim()]);
    setNewOption("");
  }

  function removeOption(i: number) {
    setOptions((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addField() {
    if (!label.trim()) return;
    const field: FormField = {
      id: newId(),
      label: label.trim(),
      type,
      placeholder: placeholder.trim() || undefined,
      required,
      options: needsOptions ? options : undefined,
      max: needsRating ? ratingMax : undefined,
    };
    setDraft((d) => ({ ...d, fields: [...d.fields, field] }));
    resetComposer();
  }

  function moveField(index: number, dir: -1 | 1) {
    setDraft((d) => {
      const next = [...d.fields];
      const target = index + dir;
      if (target < 0 || target >= next.length) return d;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...d, fields: next };
    });
  }

  function duplicateField(index: number) {
    setDraft((d) => {
      const f = d.fields[index];
      const copy: FormField = { ...f, id: newId() };
      const next = [...d.fields];
      next.splice(index + 1, 0, copy);
      return { ...d, fields: next };
    });
  }

  function deleteField(index: number) {
    setDraft((d) => ({ ...d, fields: d.fields.filter((_, i) => i !== index) }));
  }

  function updateField(index: number, patch: Partial<FormField>) {
    setDraft((d) => {
      const next = [...d.fields];
      next[index] = { ...next[index], ...patch };
      return { ...d, fields: next };
    });
  }

  // Save handler with Supabase integration
  async function handleSave() {
    try {
      const response = await fetch('/api/forms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          clientId: '550e8400-e29b-41d4-a716-446655440000',
          formData: draft 
        }),
      });
      
      if (response.ok) {
        alert('Form saved successfully!');
        // Reset form
        setDraft({
          name: "",
          description: "",
          fields: [],
        });
      } else {
        alert('Failed to save form. Please try again.');
      }
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Failed to save form. Please try again.');
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Card
        className={cn(
          "relative overflow-hidden rounded-xl border border-[#2A2F36] bg-[#16191F]",
          "shadow-[0_0_0_1px_rgba(42,47,54,0.6),0_24px_60px_-20px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.04)]"
        )}
      >
        {/* metallic sheen */}
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute inset-0 bg-gradient-to-b from-white/2 via-transparent to-transparent" />
          <div className="absolute -top-1/2 left-1/2 h-[120%] w-[140%] -translate-x-1/2 rotate-12 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_60%)]" />
        </div>

        <CardContent className="relative p-6 sm:p-8 space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-white">Form Builder</h1>
            <p className="mt-1 text-sm text-zinc-400">Create custom forms to collect student feedback</p>
          </div>

          {/* Form meta */}
          <section className="space-y-3">
            <div className="grid gap-3">
              <label className="text-sm text-zinc-300">Form Name <span className="text-emerald-400">*</span></label>
              <input
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="e.g., Course Feedback Survey"
                className={cn(
                  "h-11 w-full rounded-xl bg-[#0F1319] px-3 text-sm text-zinc-200 placeholder:text-zinc-500",
                  "border border-[#2A2F36] focus:border-emerald-600 focus:outline-none"
                )}
              />
            </div>
            <div className="grid gap-3">
              <label className="text-sm text-zinc-300">Description</label>
              <textarea
                value={draft.description}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                placeholder="Brief description of the form..."
                rows={3}
                className={cn(
                  "w-full resize-y rounded-xl bg-[#0F1319] p-3 text-sm text-zinc-200 placeholder:text-zinc-500",
                  "border border-[#2A2F36] focus:border-emerald-600 focus:outline-none"
                )}
              />
            </div>
          </section>

          {/* Existing fields */}
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-zinc-200">Form Fields</h2>
            {draft.fields.length === 0 ? (
              <p className="text-sm text-zinc-500">No fields added yet. Add your first field below.</p>
            ) : (
              <ul className="space-y-3">
                {draft.fields.map((f, i) => (
                  <li key={f.id} className="rounded-xl border border-[#2A2F36] bg-[#0F1319] p-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <div className="text-sm text-zinc-300">
                          <span className="font-medium text-white">{f.label}</span>
                          <span className="ml-2 rounded bg-emerald-900/30 px-2 py-0.5 text-[11px] text-emerald-300 border border-emerald-700/40">
                            {TYPE_OPTIONS.find((t) => t.value === f.type)?.label}
                          </span>
                          {f.required && <span className="ml-2 text-emerald-400">• required</span>}
                        </div>
                        {f.placeholder && (
                          <div className="text-xs text-zinc-500">Placeholder: {f.placeholder}</div>
                        )}
                        {f.options && f.options.length > 0 && (
                          <div className="text-xs text-zinc-500">
                            Options: {f.options.join(", ")}
                          </div>
                        )}
                        {f.type === "rating" && (
                          <div className="text-xs text-zinc-500">Max: {f.max ?? DEFAULT_RATING_MAX}</div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button className="border border-[#2A2F36] bg-[#0B2C24]/40 hover:bg-[#0B2C24]/60" onClick={() => moveField(i, -1)}>Up</Button>
                        <Button className="border border-[#2A2F36] bg-[#0B2C24]/40 hover:bg-[#0B2C24]/60" onClick={() => moveField(i, 1)}>Down</Button>
                        <Button className="border border-[#2A2F36] bg-[#0B2C24]/40 hover:bg-[#0B2C24]/60" onClick={() => duplicateField(i)}>Duplicate</Button>
                        <Button className="border border-red-900/40 bg-red-900/20 hover:bg-red-900/40" onClick={() => deleteField(i)}>Delete</Button>
                      </div>
                    </div>

                    {/* inline editor for quick tweaks */}
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <input
                        value={f.label}
                        onChange={(e) => updateField(i, { label: e.target.value })}
                        className={cn(
                          "h-10 w-full rounded-xl bg-[#11161C] px-3 text-sm text-zinc-200",
                          "border border-[#2A2F36] focus:border-emerald-600 focus:outline-none"
                        )}
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!f.required}
                          onChange={(e) => updateField(i, { required: e.target.checked })}
                          className="h-4 w-4 accent-emerald-600"
                        />
                        <span className="text-sm text-zinc-300">Required</span>
                      </div>
                      <input
                        value={f.placeholder || ""}
                        onChange={(e) => updateField(i, { placeholder: e.target.value })}
                        placeholder="Placeholder"
                        className={cn(
                          "h-10 w-full rounded-xl bg-[#11161C] px-3 text-sm text-zinc-200",
                          "border border-[#2A2F36] focus:border-emerald-600 focus:outline-none"
                        )}
                      />
                      {f.type === "rating" && (
                        <input
                          type="number"
                          min={2}
                          max={10}
                          value={f.max ?? DEFAULT_RATING_MAX}
                          onChange={(e) => updateField(i, { max: Number(e.target.value) })}
                          className={cn(
                            "h-10 w-full rounded-xl bg-[#11161C] px-3 text-sm text-zinc-200",
                            "border border-[#2A2F36] focus:border-emerald-600 focus:outline-none"
                          )}
                        />
                      )}
                      {(f.type === "radio" || f.type === "checkbox" || f.type === "select" || f.type === "multiselect") && (
                        <textarea
                          rows={2}
                          value={(f.options || []).join("\n")}
                          onChange={(e) => updateField(i, { options: e.target.value.split(/\n+/).map((s) => s.trim()).filter(Boolean) })}
                          placeholder="Enter options (one per line)"
                          className={cn(
                            "w-full rounded-xl bg-[#11161C] p-3 text-sm text-zinc-200",
                            "border border-[#2A2F36] focus:border-emerald-600 focus:outline-none"
                          )}
                        />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Add field composer */}
          <section className="space-y-4">
            <h2 className="text-sm font-medium text-zinc-200">Add New Field</h2>
            <div className="grid gap-3 sm:grid-cols-[1fr,240px]">
              <div className="grid gap-2">
                <label className="text-xs text-zinc-400">Field Label</label>
                <input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g., How would you rate this course?"
                  className={cn(
                    "h-11 w-full rounded-xl bg-[#0F1319] px-3 text-sm text-zinc-200 placeholder:text-zinc-500",
                    "border border-[#2A2F36] focus:border-emerald-600 focus:outline-none"
                  )}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs text-zinc-400">Field Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as FieldType)}
                  className={cn(
                    "h-11 w-full rounded-xl bg-[#0F1319] px-3 text-sm text-zinc-200",
                    "border border-[#2A2F36] focus:border-emerald-600 focus:outline-none"
                  )}
                >
                  {TYPE_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-xs text-zinc-400">Placeholder (optional)</label>
                <input
                  value={placeholder}
                  onChange={(e) => setPlaceholder(e.target.value)}
                  placeholder="Placeholder text..."
                  className={cn(
                    "h-11 w-full rounded-xl bg-[#0F1319] px-3 text-sm text-zinc-200 placeholder:text-zinc-500",
                    "border border-[#2A2F36] focus:border-emerald-600 focus:outline-none"
                  )}
                />
              </div>
              <label className="mt-7 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={required}
                  onChange={(e) => setRequired(e.target.checked)}
                  className="h-4 w-4 accent-emerald-600"
                />
                <span className="text-sm text-zinc-300">Required field</span>
              </label>
            </div>

            {/* Options builder */}
            {needsOptions && (
              <div className="grid gap-2 rounded-xl border border-[#2A2F36] bg-[#0F1319] p-3">
                <div className="text-xs font-medium text-zinc-300">Options</div>
                <div className="flex gap-2">
                  <input
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder="Add an option and press +"
                    className={cn(
                      "h-10 flex-1 rounded-xl bg-[#11161C] px-3 text-sm text-zinc-200",
                      "border border-[#2A2F36] focus:border-emerald-600 focus:outline-none"
                    )}
                  />
                  <Button className="border border-emerald-700/50 bg-emerald-900/30 hover:bg-emerald-900/50" onClick={addOption}>+</Button>
                </div>
                {options.length > 0 && (
                  <ul className="flex flex-wrap gap-2">
                    {options.map((opt, i) => (
                      <li key={i} className="flex items-center gap-2 rounded-lg border border-[#2A2F36] bg-[#11161C] px-2 py-1 text-xs text-zinc-300">
                        {opt}
                        <button
                          onClick={() => removeOption(i)}
                          className="rounded bg-red-900/30 px-1.5 py-0.5 text-[11px] text-red-200 hover:bg-red-900/50"
                        >
                          remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Rating builder */}
            {needsRating && (
              <div className="grid gap-2 sm:max-w-xs">
                <label className="text-xs text-zinc-400">Max rating</label>
                <input
                  type="number"
                  min={2}
                  max={10}
                  value={ratingMax}
                  onChange={(e) => setRatingMax(Number(e.target.value))}
                  className={cn(
                    "h-11 w-full rounded-xl bg-[#0F1319] px-3 text-sm text-zinc-200",
                    "border border-[#2A2F36] focus:border-emerald-600 focus:outline-none"
                  )}
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                onClick={addField}
                className="border border-emerald-700/60 bg-emerald-900/40 hover:bg-emerald-900/60"
              >
                Add Field
              </Button>
              <Button
                onClick={resetComposer}
                className="border border-[#2A2F36] bg-[#0B2C24]/30 hover:bg-[#0B2C24]/50"
              >
                Reset
              </Button>
            </div>
          </section>

          {/* Footer actions */}
          <section className="flex flex-col-reverse items-stretch gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Schema preview */}
            <pre className="max-h-56 w-full overflow-auto rounded-xl border border-[#2A2F36] bg-[#0F1319] p-3 text-xs text-zinc-300 sm:w-1/2">
{JSON.stringify(draft, null, 2)}
            </pre>

            <div className="flex gap-3 sm:self-start">
              <Button className="border border-[#2A2F36] bg-[#0B2C24]/40 hover:bg-[#0B2C24]/60" onClick={() => navigator.clipboard.writeText(JSON.stringify(draft))}>
                Copy schema
              </Button>
              <Button 
                className="border border-emerald-700/60 bg-emerald-900/40 hover:bg-emerald-900/60" 
                onClick={handleSave}
                disabled={!draft.name.trim()}
              >
                Save form
              </Button>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
