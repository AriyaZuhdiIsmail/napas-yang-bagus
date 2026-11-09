# NAPAS — Dashboard Gelar Rasa 2026

Dashboard interaktif kualitas udara dan kesehatan respirasi dari 27 kota di Indonesia. Dibangun untuk menjawab enam objektif studi kasus Gelar Rasa 2026 dengan bahasa yang bisa dibaca oleh juri umum.

## Halaman

| Rute | Isi |
| --- | --- |
| `/` | Ringkasan dengan filter global (pulau, tahun, QC) tersimpan di URL |
| `/peta` | Peta sebaran PM2.5, profil stasiun, skor prioritas pemantauan |
| `/waktu` | Kalender panas, pola jam dan hari, musim asap, episode bulanan |
| `/pendorong` | Scatter lokasi, wind rose, matriks korelasi polutan, korelasi meteorologi |
| `/kesehatan` | Tren kunjungan respirasi, analisis lag, kelompok rentan, hotspot |
| `/kualitas-data` | Komposisi QC, kelengkapan per stasiun, eksklusi, konversi satuan |

## Menjalankan

```powershell
cd dashboard
npm install
python scripts/etl.py
npm run dev
```

Buka `http://localhost:3000`.

Build statis:

```powershell
npm run build
python -m http.server 4173 --directory out
```

Hasil build ada di `out/`. Aplikasi memakai `output: "export"` sehingga tidak memerlukan server Node saat disajikan.

## Deploy ke Vercel

Folder `dashboard/` adalah root repository dan sudah dilengkapi `vercel.json` untuk static export:

```json
{
  "framework": null,
  "installCommand": "npm install",
  "buildCommand": "npm run build",
  "outputDirectory": "out"
}
```

Langkah deploy:

1. Import repository ke Vercel. Tidak perlu mengatur Root Directory karena `package.json` berada di root repo.
2. Biarkan pengaturan dari `vercel.json`; Vercel akan menjalankan `npm run build` dan menyajikan folder `out/`.
3. Deploy.

Vercel **tidak menjalankan ETL Python**. Karena itu, `public/data/` wajib ikut di-commit. Jika dataset mentah berubah, jalankan `python scripts/etl.py` secara lokal, lalu commit ulang hasilnya sebelum push.

## Sumber data

Dataset mentah berada di direktori induk (`../`) dan **tidak diubah** oleh dashboard. Semua pembersihan dilakukan di `scripts/etl.py`, lalu hasil turunannya ditulis ke `public/data/`.

Berkas utama:

- `daily_air.csv` — 27.486 baris harian stasiun, 11 kolom
- `daily_health.csv` — 27.491 baris harian rumah sakit, 10 kolom
- `summary.json`, `monthly.json`, `stations.json`
- `temporal.json`, `correlations.json`, `windrose.json`
- `lag.json`, `priority.json`, `dq.json`
- `indonesia.geojson` — batas provinsi untuk peta

### Aturan pembersihan (v2)

- QC utama: VALID + SUSPECT yang lolos rentang fisik; JMB-02 dan MER-01 hanya VALID. Toggle "Hanya VALID" tersedia sebagai uji sensitivitas.
- Rata-rata harian PM2.5 membutuhkan minimal **18 jam valid** (dihitung dari jam yang benar-benar dipakai, bukan jam VALID saja).
- Nilai identik 6 jam berturut-turut dianggap sensor macet (BJB-01: 7.329 jam: 336,7 dan 3,5). Nilai 999 di SM2-01 dipertahankan sebagai batas bawah.
- JMB-02 dan MER-01 dikeluarkan dari analisis PM2.5. PLB-01 (15 menit) dirata-ratakan ke jam sebelum agregasi harian.
- Kategori ISPU: Permen LHK 14/2020 (PM2.5 24 jam: 15,5 / 55,4 / 150,4 / 250,4). Baku mutu 55 µg/m³ (PP 22/2021).
- Kelebihan kasus: 1 Agu–14 Okt setiap tahun (jendela sama) vs baseline Jan–Jun tahun itu; pembanding musiman 2024–2025.

### Konversi satuan

Tiga berkas (`BJB-01`, `MDN-01`, `PSW-01`) memakai satuan ppm untuk gas dan mg/m³ untuk partikel:

| Parameter | Faktor |
| --- | --- |
| PM2.5, PM10 | × 1000 |
| SO₂ | × 2620 |
| CO | × 1145 |
| O₃ | × 1960 |
| NO₂ | × 1880 |

## Catatan GeoJSON

`public/data/indonesia.geojson` berasal dari batas provinsi Indonesia. Geometri Papua dan Papua Barat pada sumber awal memiliki winding order yang membuat `d3-geo` membaca polygon sebagai komplemen bola, sehingga peta membesar menutupi seluruh area. Semua ring sudah di-rewind: ring luar searah jarum jam dan lubang berlawanan arah jarum jam.

Jika mengganti berkas GeoJSON, periksa kembali bahwa `path.bounds` hasil proyeksi tidak mencakup hampir seluruh bola. Kesalahan winding biasanya membuat satu provinsi menggambar kotak besar yang menutupi peta.

## Skor prioritas

Skor 0 sampai 100 menggabungkan:

- 30% rata-rata PM2.5 teramati
- 25% frekuensi hari melampaui 55 µg/m³
- 25% tekanan kunjungan respirasi rumah sakit pasangan
- 10% kekurangan kelengkapan data
- 10% penalti redundansi untuk pasangan KTG-01/KTG-02

Ambang rekomendasi: skor ≥ 55 masuk prioritas tinggi, skor ≥ 40 perlu dipantau dan diperkuat, sisanya cukup memadai. Skor adalah alat bantu prioritas jaringan pemantauan, bukan vonis kualitas udara suatu kota.

## Teknologi

Next.js 16 (App Router, static export), React 19, TypeScript, Tailwind CSS 4, Recharts, D3 Geo, PapaParse, Phosphor Icons, Geist.

## Dokumen perencanaan

- `01-KONTEKS-DATA.md` — temuan awal dan konteks dataset
- `02-RENCANA-IMPLEMENTASI.md` — rencana teknis dan keputusan desain
