# Audit NAPAS v2 — web vs laporan vs dataset mentah (9 Nov 2026)

Semua angka dihitung ulang dari 33 file mentah. `npm run build` lulus; semua rute diuji di browser tanpa error console.

## A. Bug di web (sudah diperbaiki di v2)
| # | Temuan | Dampak | Perbaikan |
|---|---|---|---|
| 1 | Syarat ≥18 jam dihitung dari jam VALID saja, padahal nilai memakai VALID+SUSPECT | Hari layak 23.877 (seharusnya 24.661); SM2-01 266,9 (seharusnya 336,0); rata-rata Sep-Okt 2026 113,6 | `valid_hours` dari jam QC utama |
| 2 | Breakpoint ISPU 35/75/115/150 | Kategori salah; legenda peta salah | 15,5 / 55,4 / 150,4 / 250,4 (Permen LHK 14/2020) |
| 3 | Garis "episode 75 µg/m³" | Bukan baku mutu apa pun | 55 µg/m³ (PP 22/2021) + kolom `severe` >150,4 |
| 4 | Kelebihan kasus 2024/2025 memakai Agu–Des, 2026 Agu–14 Okt | Tidak sebanding | Jendela 1 Agu–14 Okt semua tahun (13.245 / 22.945 / 37.269) |
| 5 | `pm25_valid_only` tanpa syarat ≥18 jam VALID | Uji sensitivitas menyesatkan | Syarat ditambahkan |
| 6 | README/halaman Kualitas Data masih menulis "VALID saja, ≥6 jam" | Dokumentasi bertentangan dengan kode | Diperbarui |

## B. Koreksi untuk LAPORAN (perlu Anda ubah)
1. **Headline 129,8 µg/m³ (×2,2 / ×1,7)** adalah rata-rata Sep dan Okt(1–14) dengan bobot sama. Berbobot hari-stasiun: **121,7** vs 2024 = 59,2 dan 2025 = 74,7 → **×2,1 dan ×1,6**. Ubah di Ringkasan Eksekutif, §4.1, Story Mode adegan 1.
2. **Gambar 9 dan §3.2 salah label stasiun.** Kelebihan rawat inap per RS (RS-XXX-nn ↔ stasiun ke-nn, terverifikasi kecocokan kecamatan di hospitals.csv dan korelasi harian 0,92–1,00): PKN-01 5.197; KTG-02 4.994; KTG-01 4.968; PLB-01 4.580; STG-01 3.704; PKU-01 3.110; JMB-01 3.095; BTM-01 2.542; PSW-01 1.658; KTB-01 1.191. Angka "3.110" milik **PKU-01**, bukan JMB-02; RS JMB-02 (RS-27) ≈ −84 (tanpa kelebihan). Pelajaran "JMB-02: sehat di RS, buta di udara" harus ditulis ulang.
3. **Konversi ppm**: ×1000 hanya untuk PM. Gas memakai MW/24,45: SO₂ ×2.620, CO ×1.145, O₃ ×1.960, NO₂ ×1.880 (web sudah benar). Perbaiki Lampiran B.4.
4. **Estimasi 37.269** peka terhadap baseline: dengan pembanding musiman (rata-rata 1 Agu–14 Okt 2024–2025) menjadi **18.990**. Sebut rentang 19 ribu – 37 ribu.
5. **SM2-01 sensitif QC**: dengan VALID-only SM2-01 hanya 17 hari layak di Agu–Okt dan turun dari peringkat 3. Tulis di §3.4.
6. Garis "WHO 2021 · 15" pada rata-rata bulanan adalah pedoman 24 jam; pedoman tahunan 5 µg/m³.
7. Yang SUDAH benar di laporan: kategori ISPU (Tabel 1), layak 24.661, rata-rata bulanan, rata-rata pulau, KTG/SM2/PLB/PKN, 7.329 jam stuck, 37.269, jendela 2024/2025.

## C. Belum dikerjakan di v2 (jujur)
Filter global baru aktif di Ringkasan (halaman lain masih filter lokal), Story Mode, bandingkan 3 stasiun, brush, ekspor CSV/PNG, font Fraunces/Plus Jakarta, peta MapLibre, narasi hardcoded di beberapa halaman lama.
