"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, Heartbeat, MapPin, Warning, Wind } from "@phosphor-icons/react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import PageHeader from "@/components/layout/PageHeader";
import FilterBar from "@/components/layout/FilterBar";
import Kpi from "@/components/ui/Kpi";
import ChartCard from "@/components/ui/ChartCard";
import Methodology from "@/components/ui/Methodology";
import TrendChart from "@/components/charts/TrendChart";
import RankingBars from "@/components/charts/RankingBars";
import { ErrorBlock, LoadingPage } from "@/components/ui/Loading";
import { useDailyAir, useJson } from "@/lib/data";
import { useFilters } from "@/lib/filters";
import { AQI, categoryFromPm, fmtInt, fmtNum, type AqiKey } from "@/lib/metrics";
import type { Station } from "@/types/data";

type Excess = { stationAll2026: { station_id: string; excess: number }[]; window: { start: string; end: string } };
const EXCLUDED = new Set(["JMB-02", "MER-01"]);
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const YEAR_COLOR: Record<string, string> = { "2024": "#6fa3b8", "2025": "#1f6f5c", "2026": "#c15b3f" };
const CAT_ORDER: AqiKey[] = ["good", "moderate", "unhealthy", "very", "hazard"];
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

export default function HomePage() {
  const air = useDailyAir();
  const stations = useJson<Station[]>("/data/stations.json");
  const excess = useJson<Excess>("/data/health_excess.json");
  const [f, setF] = useFilters();

  const calc = useMemo(() => {
    if (!air.data || !stations.data || !excess.data) return null;
    const meta = new Map(stations.data.map((s) => [s.station_id, s]));
    const pm = (r: (typeof air.data)[number]) => (f.qc === "valid" ? r.pm25_valid_only : r.pm25);
    const base = air.data.filter(
      (r) => !EXCLUDED.has(r.station_id) && pm(r) != null && (f.island === "Semua" || r.island === f.island),
    );
    const sel = base.filter((r) => f.year === "Semua" || r.date.startsWith(f.year));
    const vals = sel.map((r) => pm(r) as number);

    // tren bulanan per tahun (mengabaikan filter tahun agar perbandingan tetap terlihat)
    const acc: Record<string, number[]> = {};
    for (const r of base) (acc[`${r.date.slice(0, 4)}-${r.date.slice(5, 7)}`] ??= []).push(pm(r) as number);
    const trend = MONTHS.map((m, i) => {
      const row: Record<string, unknown> = { m };
      for (const y of ["2024", "2025", "2026"]) row[y] = avg(acc[`${y}-${String(i + 1).padStart(2, "0")}`] ?? []);
      return row;
    });

    // jendela sebanding 1 Sep – 14 Okt, berbobot hari-stasiun
    const win = ["2024", "2025", "2026"].map((y) => ({
      y,
      v: avg(base.filter((r) => r.date >= `${y}-09-01` && r.date <= `${y}-10-14`).map((r) => pm(r) as number)),
    }));

    // komposisi kategori ISPU
    const byGroup = new Map<string, number[]>();
    for (const r of sel) {
      const key = f.island === "Semua" ? r.island : r.station_id;
      (byGroup.get(key) ?? byGroup.set(key, []).get(key)!).push(pm(r) as number);
    }
    const comp = [...byGroup.entries()].map(([name, xs]) => {
      const row: Record<string, unknown> = { name };
      for (const k of CAT_ORDER) row[k] = (xs.filter((x) => categoryFromPm(x) === k).length / xs.length) * 100;
      return row;
    });

    // peringkat stasiun
    const byStation = new Map<string, number[]>();
    for (const r of sel) (byStation.get(r.station_id) ?? byStation.set(r.station_id, []).get(r.station_id)!).push(pm(r) as number);
    const rank = [...byStation.entries()]
      .map(([id, xs]) => ({ id, mean: avg(xs) as number, n: xs.length, st: meta.get(id)?.status }))
      .sort((a, b) => b.mean - a.mean);

    const exc = excess.data.stationAll2026
      .filter((r) => f.island === "Semua" || meta.get(r.station_id)?.island === f.island)
      .reduce((a, r) => a + r.excess, 0);

    return {
      n: vals.length,
      stationsN: byStation.size,
      mean: avg(vals),
      above55: vals.length ? (vals.filter((x) => x > 55).length / vals.length) * 100 : null,
      severe: vals.filter((x) => x > 150.4).length,
      trend, win, comp, rank, exc,
    };
  }, [air.data, stations.data, excess.data, f]);

  if (air.loading || stations.loading || excess.loading) return <LoadingPage />;
  if (air.error || stations.error || excess.error || !calc) return <ErrorBlock message={air.error ?? stations.error ?? excess.error ?? "Data tidak tersedia"} />;

  const w = calc.win;
  const ratio = (a?: number | null, b?: number | null) => (a && b ? fmtNum(a / b, 1) : "n/a");
  const excessApplies = f.year === "Semua" || f.year === "2026";

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Ringkasan · 1 Jan 2024 – 14 Okt 2026"
        title="Seberapa buruk udara kita, di mana, dan siapa yang menanggungnya?"
        lead="Jawaban dulu, filter kemudian. Semua angka dihitung dari hari-stasiun yang layak (≥18 jam data valid), memakai kategori ISPU resmi Permen LHK 14/2020 dan baku mutu 55 µg/m³ PP 22/2021."
      />
      <FilterBar filters={f} onChange={setF} />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Rata-rata PM2.5" value={fmtNum(calc.mean, 1)} unit="µg/m³" tone="accent" icon={<Wind size={15} />}
          note={`n = ${fmtInt(calc.n)} hari-stasiun, ${calc.stationsN} stasiun. Rata-rata hari-stasiun, bukan paparan penduduk.`} />
        <Kpi label="Hari melampaui 55 µg/m³" value={calc.above55 == null ? "n/a" : fmtNum(calc.above55, 1)} unit="%" tone="warn" icon={<Warning size={15} />}
          note={`${fmtInt(calc.severe)} hari-stasiun masuk Sangat Tidak Sehat atau Berbahaya (>150,4).`} />
        <Kpi label="Stasiun terberat" value={calc.rank[0]?.id ?? "n/a"} tone="warn" icon={<MapPin size={15} />}
          note={`${fmtNum(calc.rank[0]?.mean, 1)} µg/m³ pada ${fmtInt(calc.rank[0]?.n)} hari${calc.rank[0]?.id === "SM2-01" ? "; batas bawah karena sensor tersaturasi 999" : ""}.`} />
        <Kpi label="Estimasi kelebihan rawat inap respirasi" value={excessApplies ? fmtInt(calc.exc) : "n/a"} icon={<Heartbeat size={15} />}
          note={excessApplies ? "1 Agu–14 Okt 2026 vs baseline Jan–Jun 2026. Estimasi asosiasi, bukan kausal." : "Hanya tersedia untuk 2026."} />
      </section>

      <div className="card px-4 py-3 text-[12.5px] leading-6 text-[var(--ink-soft)]">
        <strong>Jendela sebanding 1 Sep – 14 Okt:</strong>{" "}
        {w.map((x) => `${x.y}: ${fmtNum(x.v, 1)}`).join(" · ")} µg/m³. Tahun 2026 sekitar{" "}
        <strong className="num">{ratio(w[2].v, w[0].v)}×</strong> 2024 dan <strong className="num">{ratio(w[2].v, w[1].v)}×</strong> 2025.
        {f.qc === "valid" ? " Mode HANYA VALID aktif: angka bisa lebih rendah karena jam SUSPECT dikeluarkan." : ""}
      </div>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <ChartCard className="xl:col-span-7" title="Gelombang PM2.5 per bulan, tiga tahun berdampingan"
          subtitle="Garis putus-putus: baku mutu 24 jam 55 µg/m³. Oktober 2026 hanya sampai tanggal 14."
          footer="Rata-rata hari-stasiun layak; mengikuti filter pulau dan QC.">
          <TrendChart data={trend(calc.trend)} xKey="m" height={300} reference={55} referenceLabel="Baku mutu 55"
            series={["2024", "2025", "2026"].map((y) => ({ key: y, label: y, color: YEAR_COLOR[y], width: y === "2026" ? 2.8 : 1.8 }))} />
        </ChartCard>
        <ChartCard className="xl:col-span-5" title={f.island === "Semua" ? "Komposisi kategori ISPU per pulau" : `Komposisi kategori ISPU, stasiun di ${f.island}`}
          subtitle="Persentase hari-stasiun layak per kategori (ISPU Permen LHK 14/2020)." footer="Wilayah tanpa stasiun tidak muncul. Ketiadaan data bukan berarti udara bersih.">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={calc.comp} layout="vertical" margin={{ left: 8, right: 12 }}>
              <CartesianGrid horizontal={false} stroke="#e6dcc7" />
              <XAxis type="number" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => `${Math.round(Number(v))}%`} tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10.5 }} />
              <Tooltip formatter={(v) => `${fmtNum(Number(v), 1)}%`} />
              {CAT_ORDER.map((k) => (
                <Bar key={k} dataKey={k} stackId="a" fill={AQI[k].color} isAnimationActive={false} />
              ))}
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[var(--muted)]">
            {CAT_ORDER.map((k) => (
              <span key={k} className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: AQI[k].color }} />
                {AQI[k].label}
              </span>
            ))}
          </div>
        </ChartCard>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <ChartCard className="xl:col-span-6" title="Sepuluh stasiun dengan rata-rata tertinggi"
          subtitle="Warna = kategori ISPU rata-rata. JMB-02 (rusak) dan MER-01 (tidak memadai) tidak diperingkat."
          footer="⚑ = stasiun dengan catatan kualitas data (BJB-01, MDN-01, PLB-01). Lihat halaman Jaringan.">
          <RankingBars labelWidth={92} height={300} unit="µg/m³"
            data={calc.rank.slice(0, 10).map((r) => ({
              name: r.st === "flagged" ? `${r.id} ⚑` : r.id,
              value: r.mean,
              color: AQI[categoryFromPm(r.mean)].color,
              meta: `${r.n} hari`,
            }))} />
        </ChartCard>
        <div className="card xl:col-span-6">
          <div className="border-b border-[var(--line)] px-4 py-3.5">
            <h2 className="text-[13.5px] font-semibold">Apa artinya, dan apa yang bisa dilakukan</h2>
          </div>
          <div className="divide-y divide-[var(--line)] text-[12px] leading-5 text-[var(--ink-soft)]">
            {[
              ["Episode akut (Kalimantan, Sumatra)", "Respons berbasis episode: peringatan dini per jam, manajemen kebakaran gambut, siaga rumah sakit.", "/wilayah"],
              ["Beban kronis (Jawa urban/lalu lintas)", "Pengendalian lalu lintas dan industri jangka panjang; satu angka tahunan tidak cukup untuk dua masalah berbeda.", "/waktu"],
              ["Kelompok rentan dan data", "Balita dan lansia perlu protokol sehari-sama (asosiasi terkuat lag 0–1); perbaiki sensor JMB-02, MER-01, MDN-01, PLB-01, BJB-01.", "/kesehatan"],
            ].map(([t, d, href]) => (
              <Link key={t} href={href} prefetch={false} className="flex items-start gap-3 px-4 py-3.5 hover:bg-[var(--panel-soft)]">
                <div className="flex-1"><div className="font-semibold text-[var(--ink)]">{t}</div><p className="mt-0.5">{d}</p></div>
                <ArrowRight size={14} className="mt-1 text-[var(--accent)]" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Methodology title="Cara membaca angka di halaman ini">
        <p>Rata-rata dihitung per hari-stasiun layak dengan bobot sama, sehingga stasiun dengan hari layak lebih banyak berkontribusi lebih besar. Estimasi kelebihan kasus memakai baseline Jan–Jun 2026 dan berasosiasi, bukan kausal; rumah sakit dipasangkan ke stasiun berdasarkan urutan resmi booklet dan hospitals.csv.</p>
      </Methodology>
    </div>
  );
}

// TrendChart menerima Record<string, unknown>[]
function trend(rows: Record<string, unknown>[]) {
  return rows;
}
