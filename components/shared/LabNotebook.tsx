// LabNotebook — autosave-style notebook with structured fields
"use client";

import { useState, useEffect } from "react";

interface NotebookField {
  id: string;
  label: string;
  type: "text" | "number" | "textarea" | "select";
  unit?: string;
  options?: string[];
  placeholder?: string;
}

interface LabNotebookProps {
  title: string;
  fields: NotebookField[];
  storageKey?: string;
  headingLevel?: 2 | 3;
}

export function LabNotebook({ title, fields, storageKey, headingLevel = 3 }: LabNotebookProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const key = storageKey || `notebook-${title}`;
  const Heading = headingLevel === 2 ? "h2" : "h3";

  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setValues(JSON.parse(stored));
      } catch { /* ignore */ }
    }
  }, [key]);

  useEffect(() => {
    if (Object.keys(values).length > 0) {
      localStorage.setItem(key, JSON.stringify(values));
      setSavedAt(new Date().toLocaleTimeString("id-ID"));
    }
  }, [values, key]);

  const handleChange = (id: string, val: string) => {
    setValues((prev) => ({ ...prev, [id]: val }));
  };

  return (
    <section className="rounded-xl border border-[var(--border)] bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <Heading className="text-lg font-bold"><span aria-hidden="true">📓</span> {title}</Heading>
        {savedAt && (
          <span className="text-xs text-[var(--success)]">Tersimpan otomatis: {savedAt}</span>
        )}
      </div>
      <div className="space-y-3">
        {fields.map((field) => (
          <div key={field.id} className="grid grid-cols-1 gap-1 sm:grid-cols-[200px_1fr]">
            <label htmlFor={field.id} className="text-sm font-medium text-slate-700">
              {field.label}
              {field.unit && <span className="ml-1 text-xs text-[var(--muted)]">({field.unit})</span>}
            </label>
            {field.type === "textarea" ? (
              <textarea
                id={field.id}
                value={values[field.id] || ""}
                onChange={(e) => handleChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className="rounded-md border border-[var(--border)] p-2 text-sm"
                rows={3}
              />
            ) : field.type === "select" ? (
              <select
                id={field.id}
                value={values[field.id] || ""}
                onChange={(e) => handleChange(field.id, e.target.value)}
                className="rounded-md border border-[var(--border)] p-2 text-sm"
              >
                <option value="">— Pilih —</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                id={field.id}
                type={field.type}
                value={values[field.id] || ""}
                onChange={(e) => handleChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className="rounded-md border border-[var(--border)] p-2 text-sm"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
