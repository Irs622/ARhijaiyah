# WebAR Hijaiyah — Persistent Multi-Marker WebAR for Hijaiyah Learning

> **Stack**: Three.js (v0.149.0) · MindAR · TypeScript · Vite  
> **Key Feature**: Persistent Multi-Marker Tracking

---

## 🌟 Tentang Proyek

Aplikasi pembelajaran Hijaiyah berbasis **WebAR (Web Augmented Reality)** yang interaktif dan dirancang khusus untuk mobile‑first (terutama Android Chrome). Berbeda dengan aplikasi AR konvensional yang menyembunyikan objek 3D ketika penanda (*marker*) keluar dari kamera, **WebAR Hijaiyah** mengimplementasikan mekanisme **Persistent Canvas** (kontribusi riset utama). Pengguna dapat menyusun rangkaian huruf Hijaiyah secara bertahap untuk membentuk kata, **tanpa** fitur pengenalan suara karena keputusan desain untuk tidak menggunakan Web Speech API.

## 🚀 Fitur Utama

1. **Persistent AR Canvas (autoClear=false)**  
   Huruf 3D yang sudah dipindai (*scanned*) akan tetap berada di layar (beku di posisi koordinat dunia terakhir) bahkan setelah marker fisik dipindahkan dari pandangan kamera.
2. **Multi-Marker Tracking (28 Huruf)**  
   Mendukung deteksi ke‑28 huruf Hijaiyah secara independen menggunakan satu buah bundel target `hijaiyah.mind` demi efisiensi performa pada perangkat mobile.
3. **Penyusunan Kata & Validasi (Word Composition)**  
   Mendeteksi runtutan huruf yang dipindai secara Right‑to‑Left (kanan‑ke‑kiri). Sistem memvalidasi secara real‑time apakah rangkaian huruf tersebut membentuk kosakata Arab yang valid (misal: "باب", "كتب").
4. **Object Pool**  
   Mengalokasikan instansiasi objek 3D GLTF di memori sejak awal startup demi mencegah lag (*garbage collection spikes*) pada perangkat mobile menengah.

> **Catatan:** Fitur **Speech Recognition** yang pernah direncanakan telah dihilangkan sesuai keputusan proyek.

## 🛠️ Teknologi yang Digunakan

- **Three.js (v0.149.0)**: Pustaka grafis 3D WebGL.
- **MindAR**: Library pelacakan gambar (*Image Tracking*) berbasis web berkinerja tinggi.
- **Vite**: Build tool modern untuk frontend yang super cepat.
- **TypeScript**: Menjamin keamanan tipe data (*type‑safety*) di seluruh modul arsitektur.

## 📁 Struktur Folder Proyek

```text
ar-hijaiyah/
│
├── app/
│   ├── core/                  # Inisialisasi MindAR, renderer, kamera & EventBus
│   ├── tracking/              # Pengelola jangkar (anchors) dan event pelacakan
│   ├── persistence/           # Mekanisme rendering persisten & komposisi kata (Riset Utama)
│   ├── objects/               # Model 3D Hijaiyah (GLTF) & manajemen animasi
│   ├── ui/                    # HUD Overlay, WordStrip RTL, & efek getaran (haptics)
│   ├── audio/                 # Web Audio API & pemutar pelafalan audio (.mp3)
│   ├── data/                  # Registri data huruf & kosa kata Arab
│   ├── utils/                 # Logger dan utilitas matematika/perangkat
│   └── main.ts                # Entry point aplikasi
│
├── docs/                      # Dokumen proposal, riset gap, dan arsitektur
├── public/                    # File static (index.html)
│   └── assets/
│       ├── markers/           # File kompilasi MindAR (hijaiyah.mind)
│       ├── models/            # Model 3D huruf (alif.glb, dll.)
│       └── audio/             # File pelafalan audio (.mp3)
│
├── vite.config.ts             # Konfigurasi server & build Vite
├── tsconfig.json              # Konfigurasi compiler TypeScript
└── package.json               # Dependensi & script proyek
```

---

## ⚙️ Panduan Instalasi & Menjalankan Lokal

### Prerequisites
* Pastikan Anda sudah menginstal **Node.js** (versi 20.x) pada laptop Anda.

### 1. Kloning dan Install Dependensi
```bash
# Masuk ke direktori proyek
cd ar-hijaiyah

# Install dependensi (stubs digunakan untuk menghindari native build pada canvas)
npm install --omit=optional --ignore-scripts
```

### 2. Menjalankan Server Pengembangan (Dev Server)
```bash
npm run dev
```
Secara default, Vite akan berjalan di port `5173`.

### 3. Akses via Handphone (Membutuhkan HTTPS)
Browser modern membatasi akses kamera (`getUserMedia`) hanya pada **Secure Context (HTTPS)** atau `localhost`. Untuk menguji pada HP Android, gunakan tunneling aman seperti `localhost.run` atau `localtunnel`:

* **Opsi A: localhost.run (Direkomendasikan & Stabil)**
```bash
ssh -o StrictHostKeyChecking=no -R 80:localhost:5173 nokey@localhost.run
```
Buka link HTTPS yang diberikan di terminal pada browser Google Chrome HP Anda.

* **Opsi B: Localtunnel**
```bash
npx localtunnel --port 5173
```
Buka link `.loca.lt` HTTPS yang muncul.

---

## 📖 Cara Penggunaan & Pengujian

1. Buka aplikasi di HP melalui link HTTPS di atas.
2. Izinkan akses **Kamera** saat diminta browser.
3. Arahkan kamera HP ke gambar marker huruf Hijaiyah (misalnya marker **Alif**).
4. Model 3D huruf Alif (atau huruf lainnya) yang **penuh warna, mengilap, melayang, dan bergoyang secara 3D** akan muncul di atas marker, disertai suara pelafalan huruf tersebut.
5. Pindahkan marker/kamera Anda. Model 3D huruf tersebut akan tetap membeku di posisi terakhir (Persisten).
6. Susun huruf‑huruf tersebut secara berturut‑turut dari **kanan‑ke‑kiri** untuk membentuk kosakata Arab (lihat daftar kata di bawah).
7. Setelah kata terbentuk secara valid:
   - Sistem akan memicu animasi sukses dan suara pelafalan kata utuh akan berbunyi.
   - **Objek 3D representasi benda** (atau Bintang Emas 3D sebagai fallback sementara) akan muncul mengambang dan berputar secara dinamis di atas kumpulan huruf 3D tersebut!

---

## 📋 Daftar Kosakata yang Didukung (23 Kata)

Aplikasi mendukung pendeteksian otomatis dan penyusunan 23 kosakata berikut:

### 🟩 Tingkat 1 (2 Huruf)
* **يد** (ي - د) → Tangan
* **أب** (ا - ب) → Ayah
* **أم** (ا - م) → Ibu
* **عم** (ع - م) → Paman
* **أخ** (ا - خ) → Saudara
* **دم** (د - م) → Darah

### 🟨 Tingkat 2 (3 Huruf)
* **باب** (ب - ا - ب) → Pintu
* **كتب** (ك - ت - ب) → Buku
* **قلم** (ق - ل - م) → Pena
* **نور** (ن - و - ر) → Cahaya
* **بيت** (ب - ي - ت) → Rumah
* **عسل** (ع - س - ل) → Madu
* **سمك** (س - م - ك) → Ikan
* **قمر** (ق - م - ر) → Bulan
* **شمس** (ش - م - س) → Matahari
* **رجل** (ر - ج - ل) → Kaki
* **ولد** (و - ل - د) → Anak Laki‑Laki
* **بنت** (ب - ن - ت) → Anak Perempuan
* **عين** (ع - ي - ن) → Mata

### 🟥 Tingkat 3 (4 Huruf)
* **فرس** (ف - ر - س) → Kuda
* **نهر** (ن - ه - ر) → Sungai
* **كلب** (ك - ل - ب) → Anjing
* **جبل** (ج - ب - ل) → Gunung
* **أرنب** (ا - ر - ن - ب) → Kelinci
* **مسجد** (م - س - ج - د) → Masjid
* **تفاح** (ت - ف - ا - ح) → Apel
* **حليب** (ح - ل - ي - ب) → Susu

---

## 📦 Mengimpor Model 3D Kustom untuk Benda

Jika Anda ingin mengganti Bintang Emas 3D bawaan dengan model 3D benda asli (misalnya Pena, Rumah, atau Buku):
1. Siapkan file 3D dalam format **`.glb`** bergaya kartun/mainan.
2. Beri nama file sesuai dengan daftar registri kata (misal: `qalam.glb` untuk pena, `bait.glb` untuk rumah, `kitab.glb` untuk buku).
3. Salin file tersebut ke dalam folder:
   📂 **`/public/assets/models/words/`**
4. Aplikasi akan mendeteksinya secara otomatis saat kata tersebut berhasil disusun di AR canvas dan menampilkan model 3D benda kustom Anda tanpa perlu mengubah kode!

---

## 📄 Lisensi

Proyek ini didistribusikan di bawah **Lisensi MIT**. Lihat file `LICENSE` untuk informasi lebih lanjut.


> **Stack**: Three.js (v0.149.0) · MindAR · TypeScript · Vite  
> **Key Feature**: Persistent Multi-Marker Tracking & Speech Pronunciation Feedback

---

## 🌟 Tentang Proyek

Aplikasi pembelajaran Hijaiyah berbasis **WebAR (Web Augmented Reality)** yang interaktif dan dirancang khusus untuk mobile-first (terutama Android Chrome). Berbeda dengan aplikasi AR konvensional yang menyembunyikan objek 3D ketika penanda (*marker*) keluar dari kamera, **WebAR Hijaiyah** mengimplementasikan mekanisme **Persistent Canvas** (kontribusi riset utama). Pengguna dapat menyusun rangkaian huruf Hijaiyah secara bertahap untuk membentuk kata, mendengarkan pelafalan audio, dan mendapatkan umpan balik pengucapan berbasis suara secara interaktif.

## 🚀 Fitur Utama

1. **Persistent AR Canvas (autoClear=false)**
   Huruf 3D yang sudah dipindai (*scanned*) akan tetap berada di layar (beku di posisi koordinat dunia terakhir) bahkan setelah marker fisik dipindahkan dari pandangan kamera.
2. **Multi-Marker Tracking (28 Huruf)**
   Mendukung deteksi ke-28 huruf Hijaiyah secara independen menggunakan satu buah bundel target compiler `hijaiyah.mind` demi efisiensi performa pada perangkat mobile.
3. **Penyusunan Kata & Validasi (Word Composition)**
   Mendeteksi runtutan huruf yang dipindai secara Right-to-Left (kanan-ke-kiri). Sistem akan memvalidasi secara real-time apakah rangkaian huruf tersebut membentuk kosa kata bahasa Arab yang valid (misal: "باب", "كتب").
4. **Evaluasi Pengucapan Suara (Web Speech API ASR)**
   Mengevaluasi pelafalan suara pengguna secara langsung menggunakan mikrofon HP dengan algoritma pencocokan fonetik untuk menentukan kelulusan lafal.
5. **Aset Berkinerja Tinggi (Object Pool)**
   Mengalokasikan instansiasi objek 3D GLTF di memori sejak awal startup demi mencegah terjadinya lag (*garbage collection spikes*) di perangkat mobile berspesifikasi menengah.

---

## 🛠️ Teknologi yang Digunakan

* **Three.js (v0.149.0)**: Pustaka grafis 3D WebGL.
* **MindAR**: Library pelacakan gambar (*Image Tracking*) berbasis web berkinerja tinggi.
* **Vite**: Build tool modern untuk frontend yang super cepat.
* **TypeScript**: Menjamin keamanan tipe data (*type-safety*) di seluruh modul arsitektur.
* **Web Speech API**: Pengenalan ucapan (*Automatic Speech Recognition*) langsung di browser tanpa server tambahan.

---

## 📁 Struktur Folder Proyek

```text
ar-hijaiyah/
│
├── app/
│   ├── core/                  # Inisialisasi MindAR, renderer, kamera, & EventBus
│   ├── tracking/              # Pengelola jangkar (anchors) dan event pelacakan
│   ├── persistence/           # Mekanisme rendering persisten & komposisi kata (Riset Utama)
│   ├── objects/               # Model 3D Hijaiyah (GLTF) & manajemen animasi
│   ├── ui/                    # HUD Overlay, WordStrip RTL, & efek getaran (haptics)
│   ├── audio/                 # Web Audio API & pemutar pelafalan audio (.mp3)
│   ├── speech/                # Kontroler ASR & Evaluator kemiripan pelafalan
│   ├── data/                  # Registri data huruf & kosa kata Arab
│   ├── utils/                 # Logger dan utilitas matematika/perangkat
│   └── main.ts                # Entry point aplikasi
│
├── docs/                      # Dokumen proposal, riset gap, dan arsitektur
├── public/                    # File static (index.html)
│   └── assets/
│       ├── markers/           # File kompilasi MindAR (hijaiyah.mind)
│       ├── models/            # Model 3D huruf (alif.glb, dll.)
│       └── audio/             # File pelafalan audio (.mp3)
│
├── vite.config.ts             # Konfigurasi server & build Vite
├── tsconfig.json              # Konfigurasi compiler TypeScript
└── package.json               # Dependensi & script proyek
```

---

## ⚙️ Panduan Instalasi & Menjalankan Lokal

### Prerequisites
* Pastikan Anda sudah menginstal **Node.js** di laptop Anda.

### 1. Kloning dan Install Dependensi
```bash
# Masuk ke direktori proyek
cd ar-hijaiyah

# Install dependensi yang dibutuhkan
npm install
```

### 2. Menjalankan Server Pengembangan (Dev Server)
```bash
npm run dev
```
Secara default, Vite akan berjalan di port `5173`.

### 3. Akses via Handphone (Membutuhkan HTTPS)
Browser modern membatasi akses kamera (`getUserMedia`) hanya pada **Secure Context (HTTPS)** atau `localhost`. Agar bisa mengetesnya langsung di HP menggunakan kamera fisik, gunakan alternatif terowongan (tunneling) aman seperti `localhost.run` atau `localtunnel`:

* **Opsi A: Menggunakan localhost.run (Direkomendasikan & Stabil)**
  Jalankan perintah ini di terminal baru Anda:
  ```bash
  ssh -o StrictHostKeyChecking=no -R 80:localhost:5173 nokey@localhost.run
  ```
  Buka link HTTPS yang diberikan di terminal tersebut pada browser Google Chrome HP Anda.

* **Opsi B: Menggunakan Localtunnel**
  Jalankan perintah ini di terminal baru Anda:
  ```bash
  npx localtunnel --port 5173
  ```
  Buka link `.loca.lt` HTTPS yang muncul.

---

## 📖 Cara Penggunaan & Pengujian

1. Buka aplikasi di HP melalui link HTTPS di atas.
2. Izinkan akses **Kamera** dan **Mikrofon** saat diminta browser.
3. Arahkan kamera HP ke gambar marker huruf Hijaiyah (misalnya marker **Alif**).
4. Model 3D huruf Alif (atau huruf lainnya) yang **penuh warna, mengilap, melayang, dan bergoyang secara 3D** akan muncul di atas marker, disertai suara pelafalan huruf tersebut.
5. Pindahkan marker/kamera Anda. Model 3D huruf tersebut akan tetap membeku di posisi terakhir (Persisten).
6. Susun huruf-huruf tersebut secara berturut-turut dari **kanan-ke-kiri** untuk membentuk kosakata Arab (lihat daftar kata di bawah).
7. Setelah kata terbentuk secara valid:
   - Sistem akan memicu animasi sukses dan suara pelafalan kata utuh akan berbunyi.
   - **Objek 3D representasi benda** (atau Bintang Emas 3D sebagai fallback sementara) akan muncul mengambang dan berputar secara dinamis di atas kumpulan huruf 3D tersebut!
8. Ucapkan pelafalan kata/huruf ke mikrofon untuk mengevaluasi kelancaran lafal Anda secara interaktif.

---

## 📋 Daftar Kosakata yang Didukung (23 Kata)

Aplikasi mendukung pendeteksian otomatis dan penyusunan 23 kosakata berikut:

### 🟩 Tingkat 1 (2 Huruf)
* **يد** (ي - د) ➔ **Tangan**
* **أب** (ا - ب) ➔ **Ayah**
* **أم** (ا - م) ➔ **Ibu**
* **عم** (ع - m) ➔ **Paman**
* **أخ** (ا - خ) ➔ **Saudara**
* **دم** (د - م) ➔ **Darah**

### 🟨 Tingkat 2 (3 Huruf)
* **باب** (ب - ا - ب) ➔ **Pintu**
* **كتب** (ك - ت - ب) ➔ **Buku**
* **قلم** (ق - ل - م) ➔ **Pena**
* **نور** (ن - و - ر) ➔ **Cahaya**
* **بيت** (ب - ي - ت) ➔ **Rumah**
* **عسل** (ع - س - ل) ➔ **Madu**
* **سمك** (س - م - ك) ➔ **Ikan**
* **قmr** (ق - م - ر) ➔ **Bulan**
* **شمس** (ش - م - س) ➔ **Matahari**
* **رجل** (ر - ج - ل) ➔ **Kaki**
* **ولد** (و - ل - د) ➔ **Anak Laki-Laki**
* **بنت** (ب - ن - ت) ➔ **Anak Perempuan**
* **عين** (ع - ي - n) ➔ **Mata**

### 🟥 Tingkat 3 (4 Huruf)
* **فرس** (ف - ر - س) ➔ **Kuda**
* **نهر** (ن - ه - ر) ➔ **Sungai**
* **كلب** (ك - ل - ب) ➔ **Anjing**
* **جبل** (ج - ب - ل) ➔ **Gunung**
* **أرنب** (ا - ر - n - ب) ➔ **Kelinci**
* **مسجد** (م - س - ج - د) ➔ **Masjid**
* **تفاح** (ت - ف - ا - ح) ➔ **Apel**
* **حليب** (ح - ل - ي - ب) ➔ **Susu**

---

## 📦 Mengimpor Model 3D Kustom untuk Benda

Jika Anda ingin mengganti Bintang Emas 3D bawaan dengan model 3D benda asli (misalnya Pena, Rumah, atau Buku):
1. Siapkan file 3D dalam format **`.glb`** bergaya kartun/mainan.
2. Beri nama file sesuai dengan daftar registri kata (misal: `qalam.glb` untuk pena, `bait.glb` untuk rumah, `kitab.glb` untuk buku).
3. Salin file tersebut ke dalam folder:  
   📂 **`/public/assets/models/words/`**
4. Aplikasi akan mendeteksinya secara otomatis saat kata tersebut berhasil disusun di AR canvas dan menampilkan model 3D benda kustom Anda tanpa perlu mengubah kode!

---

## 📄 Lisensi

Proyek ini didistribusikan di bawah **Lisensi MIT**. Lihat file `LICENSE` untuk informasi lebih lanjut.

