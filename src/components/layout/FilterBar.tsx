"use client";

import { useState } from "react";
import { LinkSimple, ArrowCounterClockwise } from "@phosphor-icons/react";
import Select from "@/components/ui/Select";
import { ISLANDS, type Filters } from "@/lib/filters";

export default function FilterBar({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div
      className="sticky top-0 z-30 -mx-4 flex flex-wrap items-end gap-3 border-b border-[var(--line)] bg-[var(--bg)]/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8"
      role="group"
      aria-label="Filter global"
    >
      <Select label="Pulau" value={filters.island} onChange={(e) => onChange({ island: e.target.value })}>
        <option value="Semua">Semua pulau</option>
        {ISLANDS.map((i) => (
          <option key={i} value={i}>{i}</option>
        ))}
      </Select>
      <Select label="Tahun" value={filters.year} onChange={(e) => onChange({ year: e.target.value })}>
        <option value="Semua">2024 – 2026</option>
        {["2024", "2025", "2026"].map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </Select>
      <Select label="Kontrol kualitas" value={filters.qc} onChange={(e) => onChange({ qc: e.target.value as Filters["qc"] })}>
        <option value="main">QC utama (VALID + SUSPECT)</option>
        <option value="valid">Hanya VALID (uji sensitivitas)</option>
      </Select>
      <div className="ml-auto flex gap-2">
        <button
          type="button"
          onClick={() => onChange({ island: "Semua", year: "Semua", qc: "main" })}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-[8px] border border-[var(--line-strong)] bg-white px-3 text-[12px] font-medium"
        >
          <ArrowCounterClockwise size={14} /> Reset
        </button>
        <button
          type="button"
          onClick={copy}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-[8px] bg-[var(--ink)] px-3 text-[12px] font-medium text-white"
        >
          <LinkSimple size={14} /> {copied ? "Tertaut ✓" : "Salin tautan"}
        </button>
      </div>
    </div>
  );
}
