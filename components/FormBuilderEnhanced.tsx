"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { Eye, Save, FileText, Copy, Download, Settings, Star, Plus } from "lucide-react";
import { DataForm } from "./DataForm";

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
  required: boolean;
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

export type SurveyPreset = {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: FormField[];
  isTemplate?: boolean;
};

// -----------------------------
// Helpers
// -----------------------------
const newId = () => Math.random().toString(36).slice(2, 9);

const DEFAULT_RATING_MAX = 5;

// Survey Presets and Templates
const SURVEY_PRESETS: SurveyPreset[] = [
  {
    id: "customer-satisfaction",
    name: "Customer Satisfaction Survey",
    description: "Measure customer satisfaction and experience",
    category: "Customer Feedback",
    isTemplate: true,
    fields: [
      { id: "rating", label: "How satisfied are you with our service?", type: "rating", required: true, max: 5 },
      { id: "recommend", label: "Would you recommend us to others?", type: "radio", required: true, options: ["Yes", "No", "Maybe"] },
      { id: "improvements", label: "What can we improve?", type: "long_text", required: false, placeholder: "Please share your suggestions..." }
    ]
  },
  {
    id: "course-feedback",
    name: "Course Feedback Form",
    description: "Collect feedback from students about course content",
    category: "Education",
    isTemplate: true,
    fields: [
      { id: "course-rating", label: "Rate this course", type: "rating", required: true, max: 5 },
      { id: "instructor", label: "How was the instructor?", type: "radio", required: true, options: ["Excellent", "Good", "Average", "Poor"] },
      { id: "content", label: "Was the content helpful?", type: "radio", required: true, options: ["Very helpful", "Somewhat helpful", "Not helpful"] },
      { id: "suggestions", label: "Any suggestions for improvement?", type: "long_text", required: false, placeholder: "Your feedback helps us improve..." }
    ]
  },
  {
    id: "event-feedback",
    name: "Event Feedback Survey",
    description: "Gather feedback after events and workshops",
    category: "Events",
    isTemplate: true,
    fields: [
      { id: "overall", label: "Overall event rating", type: "rating", required: true, max: 5 },
      { id: "organization", label: "How well was the event organized?", type: "radio", required: true, options: ["Excellent", "Good", "Average", "Poor"] },
      { id: "speakers", label: "Rate the speakers", type: "rating", required: true, max: 5 },
      { id: "venue", label: "How was the venue?", type: "radio", required: true, options: ["Excellent", "Good", "Average", "Poor"] },
      { id: "feedback", label: "Additional comments", type: "long_text", required: false, placeholder: "Share your thoughts about the event..." }
    ]
  }
];

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

  // Preview and preset state
  const [showPreview, setShowPreview] = React.useState(false);
  const [showPresets, setShowPresets] = React.useState(false);
  const [savedPresets, setSavedPresets] = React.useState<SurveyPreset[]>([]);

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
      required: required || false,
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

  // Preset management functions
  function loadPreset(preset: SurveyPreset) {
    setDraft({
      name: preset.name,
      description: preset.description,
      fields: preset.fields.map(field => ({ ...field, id: newId() }))
    });
    setShowPresets(false);
  }

  function saveAsPreset() {
    if (!draft.name.trim() || draft.fields.length === 0) return;
    
    const preset: SurveyPreset = {
      id: newId(),
      name: draft.name,
      description: draft.description || "",
      category: "Custom",
      fields: draft.fields,
      isTemplate: false
    };
    
    setSavedPresets(prev => [...prev, preset]);
    alert('Survey saved as preset!');
  }

  function loadTemplate(template: SurveyPreset) {
    loadPreset(template);
  }

  // Save handler with Supabase integration
  async function handleSave() {
    try {
      // Get companyId from URL params or use default
      const urlParams = new URLSearchParams(window.location.search);
      const companyId = urlParams.get('companyId') || process.env.NEXT_PUBLIC_WHOP_COMPANY_ID;
      
      const response = await fetch('/api/forms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          companyId: companyId,
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-white">Survey Customization</h1>
              <p className="mt-1 text-sm text-zinc-400">Create, customize, and preview surveys with presets</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowPresets(!showPresets)}
                className="gap-2 bg-[#0B2C24] hover:bg-[#0E3A2F] text-white border border-[#17493A]"
                size="sm"
              >
                <Star className="h-4 w-4" />
                Templates
              </Button>
              <Button
                onClick={() => setShowPreview(!showPreview)}
                className="gap-2 bg-[#0B2C24] hover:bg-[#0E3A2F] text-white border border-[#17493A]"
                size="sm"
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              <Button
                onClick={saveAsPreset}
                disabled={!draft.name.trim() || draft.fields.length === 0}
                className="gap-2 bg-[#0B2C24] hover:bg-[#0E3A2F] text-white border border-[#17493A] disabled:opacity-50"
                size="sm"
              >
                <Save className="h-4 w-4" />
                Save Preset
              </Button>
            </div>
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

          {/* Preset Templates */}
          {showPresets && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Survey Templates</h3>
                <Button
                  onClick={() => setShowPresets(false)}
                  className="text-zinc-400 hover:text-white"
                  variant="ghost"
                  size="sm"
                >
                  Close
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SURVEY_PRESETS.map((preset) => (
                  <Card key={preset.id} className="border border-[#2A2F36] bg-[#171A1F] hover:border-[#10B981]/30 transition-colors">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-[#E1E4EA] text-sm flex items-center gap-2">
                        <Star className="h-4 w-4 text-[#10B981]" />
                        {preset.name}
                      </CardTitle>
                      <p className="text-xs text-[#9AA4B2]">{preset.description}</p>
                      <div className="flex items-center gap-2 text-xs text-[#9AA4B2]">
                        <FileText className="h-3 w-3" />
                        {preset.fields.length} questions
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Button
                        onClick={() => loadTemplate(preset)}
                        className="w-full gap-2 bg-[#0B2C24] hover:bg-[#0E3A2F] text-white border border-[#17493A]"
                        size="sm"
                      >
                        <Plus className="h-4 w-4" />
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Saved Presets */}
              {savedPresets.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-white">Your Saved Presets</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedPresets.map((preset) => (
                      <Card key={preset.id} className="border border-[#2A2F36] bg-[#171A1F] hover:border-[#10B981]/30 transition-colors">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-[#E1E4EA] text-sm flex items-center gap-2">
                            <Save className="h-4 w-4 text-[#10B981]" />
                            {preset.name}
                          </CardTitle>
                          <p className="text-xs text-[#9AA4B2]">{preset.description}</p>
                          <div className="flex items-center gap-2 text-xs text-[#9AA4B2]">
                            <FileText className="h-3 w-3" />
                            {preset.fields.length} questions
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <Button
                            onClick={() => loadPreset(preset)}
                            className="w-full gap-2 bg-[#0B2C24] hover:bg-[#0E3A2F] text-white border border-[#17493A]"
                            size="sm"
                          >
                            <Copy className="h-4 w-4" />
                            Load Preset
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Live Preview */}
          {showPreview && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Live Preview</h3>
                <Button
                  onClick={() => setShowPreview(false)}
                  className="text-zinc-400 hover:text-white"
                  variant="ghost"
                  size="sm"
                >
                  Close
                </Button>
              </div>
              
              <Card className="border border-[#2A2F36] bg-[#171A1F]">
                <CardContent className="p-6">
                  {draft.fields.length > 0 ? (
                    <DataForm
                      formId="preview"
                      fields={draft.fields}
                      onSubmit={() => alert('Preview mode - form not submitted')}
                      title={draft.name || "Preview Survey"}
                      description={draft.description}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-[#2A2F36]" />
                      <h3 className="text-lg font-semibold text-[#E1E4EA] mb-2">
                        No fields yet
                      </h3>
                      <p className="text-[#9AA4B2]">
                        Add some fields to see the preview
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          )}

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
