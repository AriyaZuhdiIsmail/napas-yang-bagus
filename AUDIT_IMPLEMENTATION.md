# NAPAS Gelar Rasa 2026 — Implementation Audit

## Implemented

### P0 — Data/QC
- QC utama: VALID + SUSPECT yang lolos physical range.
- JMB-02 dan MER-01: VALID-only.
- Daily PM2.5: minimum 18 valid hours.
- BJB-01: run-length stuck detection; 336.7 dan 3.5 dikeluarkan.
- SM2-01: 999 dipertahankan sebagai censored/lower-bound dan tidak dianggap stuck.
- PLB-01: 15-minute data diagregasi hourly.
- Tidak ada imputasi PM2.5.
- JMB-02 dikeluarkan dari tren PM dan PM-health link.
- MER-01 dikeluarkan dari ranking dan analisis spasial.
- Lag diperluas sampai 14 hari.
- Estimasi excess health burden ditambahkan dengan baseline Jan-Jun dan jendela 1 Aug-14 Oct.

### P1 — Dashboard
- Navigasi diselaraskan menjadi 7 konsep halaman: Ringkasan, Wilayah, Waktu, Sumber, Kesehatan, Jaringan, Metodologi.
- Route lama tetap tersedia.
- Halaman Metodologi baru ditambahkan.
- Halaman Kesehatan menampilkan estimasi kelebihan kasus.
- Footer menjelaskan QC utama dan batas interpretasi.
- `health_excess.json` dan metadata kualitas ditambahkan ke pipeline.

## Pipeline checkpoints

- Raw AQMS: 667,981 rows (source report checkpoint).
- Pipeline output daily station rows: 27,486.
- Primary national PM2.5 mean: 39.50 µg/m³.
- Episode station-days >75: 1,783 after excluding JMB-02 and MER-01 from primary PM analysis.
- 2026 excess respiratory burden: 37,268.63 ≈ 37,269, matching the report's rounded result.
- Quality status counts: 22 Baik, 1 Perhatian, 2 Terbatas, 1 Tidak memadai, 1 Gagal.

## Not fully implemented in this pass

- Global synchronized filters with full cross-page recalculation.
- URL state for all filters.
- Three-station comparison.
- Time-series brush.
- CSV/PNG export.
- Story Mode.
- Full production build verification.

These items were intentionally not faked as complete. They require additional frontend integration and/or a working dependency installation environment.

## Verification limitation

`npm run build` could not be completed because dependency installation (`npm ci`) did not finish within the available execution window, and the resulting environment did not contain the `next` executable. ETL itself completed successfully from the supplied dataset.
