import PageHeader from "@/components/layout/PageHeader";
import ChartCard from "@/components/ui/ChartCard";
import Methodology from "@/components/ui/Methodology";

export default function MetodologiPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Metodologi / auditabilitas"
        title="Bagaimana angka NAPAS dibuat."
        lead="Halaman ini mendokumentasikan sumber data, aturan QC, agregasi, penanganan anomali, analisis kesehatan, dan batas interpretasi agar setiap angka dapat ditelusuri."
      />
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ChartCard title="Periode data" subtitle="Cakupan analisis utama">
          <div className="text-[24px] font-semibold tracking-[-0.03em]">1 Jan 2024 – 14 Okt 2026</div>
          <div className="mt-2 text-[11px] text-[var(--muted)]">27 AQMS · 27 rumah sakit · 21 provinsi · 5 pulau</div>
        </ChartCard>
        <ChartCard title="QC utama" subtitle="Aturan yang aktif pada pipeline">
          <div className="text-[24px] font-semibold tracking-[-0.03em]">VALID + SUSPECT</div>
          <div className="mt-2 text-[11px] text-[var(--muted)]">Lolos physical range; JMB-02 dan MER-01 hanya VALID.</div>
        </ChartCard>
        <ChartCard title="Agregasi harian" subtitle="Syarat kelayakan hari">
          <div className="text-[24px] font-semibold tracking-[-0.03em]">≥18 jam</div>
          <div className="mt-2 text-[11px] text-[var(--muted)]">Hourly tetap tersedia untuk pola 24 jam dan drill-down.</div>
        </ChartCard>
      </section>
      <Methodology title="Aturan QC dan penanganan anomali">
        <p><strong>JMB-02:</strong> hanya VALID dan dikeluarkan dari tren PM2.5 serta hubungan PM2.5–kesehatan.</p>
        <p><strong>MER-01:</strong> hanya VALID, tidak memadai untuk ranking dan analisis spasial.</p>
        <p><strong>BJB-01:</strong> run sensor stuck pada 336,7 dan 3,5 dikeluarkan meskipun flag mentah VALID.</p>
        <p><strong>MDN-01:</strong> gap 3.632 jam dipertahankan sebagai missing; tidak diinterpolasi.</p>
        <p><strong>PLB-01:</strong> data 15 menit diagregasi ke hourly sebelum analisis.</p>
        <p><strong>SM2-01:</strong> nilai 999 dipertahankan sebagai censored dan ditampilkan sebagai ≥999, bukan nilai pasti.</p>
      </Methodology>
      <ChartCard title="Interpretasi kesehatan" subtitle="Batas yang harus selalu dibaca bersama hasil">
        <div className="space-y-3 text-[12px] leading-5 text-[var(--ink-soft)]">
          <p>Estimasi kelebihan kasus menggunakan baseline Januari–Juni pada tahun yang sama dan jendela 1 Agustus–14 Oktober. Nilainya adalah estimasi kasar, bukan jumlah kasus aktual, bukan proyeksi, dan bukan bukti kausal.</p>
          <p>Korelasi PM2.5–kesehatan adalah asosiasi ekologis pada tingkat stasiun-hari, bukan efek pada individu.</p>
          <p>Rata-rata nasional adalah rata-rata tertimbang hari-stasiun layak, bukan rata-rata paparan penduduk Indonesia.</p>
        </div>
      </ChartCard>
      <ChartCard title="Reproducibility" subtitle="Sumber angka dan perubahan pipeline">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 text-[11px] text-[var(--muted)]">
          <div><div className="font-semibold text-[var(--ink)]">Sumber</div><div className="mt-1">Dataset Gelar Rasa 2026 dan pipeline ETL lokal.</div></div>
          <div><div className="font-semibold text-[var(--ink)]">Prinsip</div><div className="mt-1">Tidak ada imputasi diam-diam, dataset eksternal, atau angka statistik yang di-hardcode.</div></div>
        </div>
      </ChartCard>
    </div>
  );
}
