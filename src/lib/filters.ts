"use client";

import { useCallback, useEffect, useState } from "react";

export type Filters = { island: string; year: string; qc: "main" | "valid" };
export const ISLANDS = ["Sumatra", "Jawa", "Kalimantan", "Sulawesi", "Papua"] as const;
const DEFAULT: Filters = { island: "Semua", year: "Semua", qc: "main" };

/** Filter global; disimpan di query string agar tautan dapat dibagikan. */
export function useFilters() {
  const [filters, setFilters] = useState<Filters>(DEFAULT);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setFilters({
      island: q.get("pulau") ?? "Semua",
      year: q.get("tahun") ?? "Semua",
      qc: q.get("qc") === "valid" ? "valid" : "main",
    });
  }, []);

  const update = useCallback(
    (patch: Partial<Filters>) => {
      const next = { ...filters, ...patch };
      const q = new URLSearchParams();
      if (next.island !== "Semua") q.set("pulau", next.island);
      if (next.year !== "Semua") q.set("tahun", next.year);
      if (next.qc === "valid") q.set("qc", "valid");
      const qs = q.toString();
      window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
      setFilters(next);
    },
    [filters],
  );

  return [filters, update] as const;
}
