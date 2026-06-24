# WebAR Hijaiyah — Spawning 3D & Touch Interaction WebAR

> **Stack**: Three.js (v0.149.0) · MindAR · TypeScript · Vite  
> **Key Feature**: Interactive Multi-Model Spawning & Direct Touch Control  

---

## 🌟 Tentang Proyek

Aplikasi pembelajaran Hijaiyah berbasis **WebAR (Web Augmented Reality)** yang interaktif dan dirancang khusus untuk mobile-first (Android Chrome / iOS Safari). Saat penanda (*marker*) huruf Hijaiyah berhasil dipindai oleh kamera, aplikasi akan langsung memunculkan hingga **3 objek 3D berdampingan** dengan rotasi lurus (menghadap tegak lurus agar seluruh objek kelihatan jelas). 

Pengguna dapat memberikan interaksi langsung (sentuh, geser, perbesar, perkecil) pada model 3D tersebut secara intuitif langsung di layar tanpa memerlukan UI atau tombol tambahan.

---

## 🚀 Fitur Utama

1. **Spawning 3 Objek Berdampingan**  
   Ketika marker dipindai, 3 objek 3D akan langsung muncul di atas marker:
   - **Objek Kiri**: Model 3D Huruf Hijaiyah (misalnya huruf `Ba`).
   - **Objek Tengah**: Model 3D kata benda terkait (misalnya model Pintu untuk kata `Bab`). Jika huruf tidak memiliki kosakata terkait, objek tengah tidak dimunculkan.
   - **Objek Kanan**: Bintang Emas 3D sebagai penanda prestasi.

2. **Rotasi Lurus (Clear Visibility)**  
   Model muncul dengan rotasi lurus `(0, 0, 0)` dan tanpa swaying/bobbing otomatis agar seluruh permukaan objek terlihat jelas dan mudah dipahami oleh anak-anak.

3. **Interaksi Layar Sentuh Langsung (Direct Gestures)**  
   - **Geser (Drag)**: Menyeret objek menggunakan satu jari. Perpindahan dibatasi pada permukaan 2D kartu penanda agar objek tetap stabil dan tidak melayang tak terkendali.
   - **Pinch-to-Scale**: Mencubit layar dengan dua jari untuk memperbesar atau memperkecil ukuran model 3D secara bebas.
   - **Mouse Wheel (Desktop Dev Mode)**: Mendukung scroll wheel mouse untuk mempermudah developer melakukan pengujian ukuran model di PC/Laptop.

4. **Umpan Balik Suara (Tap Audio)**  
   - Mengetuk model **Huruf** akan memutar suara pelafalan huruf Hijaiyah tersebut (misalnya "Ba").
   - Mengetuk model **Benda** akan memutar suara pelafalan kata Arab benda tersebut (misalnya "Pintu").
   - Mengetuk model **Bintang** akan memainkan dentingan keberhasilan (*success chime*) yang disintesis langsung menggunakan Web Audio API.

5. **Kinerja Tinggi (Object Pool)**  
   Instansiasi model 3D huruf di-preload sejak awal startup untuk mencegah terjadinya lag akibat garbage collection spike saat pelacakan AR berjalan.

---

## 📁 Struktur Folder Proyek

```text
ar-hijaiyah/
│
├── app/
│   ├── core/                  # MindAR engine, renderer, ARInteractionManager & EventBus
│   ├── tracking/              # Pengelola jangkar (anchors) dan event pelacakan
│   ├── persistence/           # Mekanisme rendering persisten & komposisi kata
│   ├── objects/               # Model 3D Hijaiyah (GLTF) & penanganan animasi
│   ├── ui/                    # HUD Overlay & WordStrip RTL
│   ├── audio/                 # Web Audio API, AudioManager, & Pemutar pelafalan
│   ├── data/                  # Registri data huruf & kosa kata Arab
│   ├── utils/                 # Logger dan utilitas perangkat
│   └── main.ts                # Entry point aplikasi
│
├── public/                    # File static
│   └── assets/
│       ├── markers/           # File kompilasi target MindAR (hijaiyah.mind)
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
* Pastikan Anda sudah menginstal **Node.js** (versi 20.x atau terbaru) pada komputer Anda.

### 1. Install Dependensi
```bash
# Masuk ke direktori proyek
cd ar-hijaiyah

# Install dependensi proyek
npm install
```

### 2. Menjalankan Server Pengembangan
```bash
npm run dev
```
Secara default, Vite akan berjalan di port `5173`.

### 3. Akses via Handphone (Membutuhkan HTTPS)
Browser membatasi akses kamera (`getUserMedia`) hanya pada **Secure Context (HTTPS)**. Untuk menguji pada HP, gunakan tunneling aman:
```bash
ssh -o StrictHostKeyChecking=no -R 80:localhost:5173 nokey@localhost.run
```
Buka link HTTPS yang diberikan oleh terminal di browser Google Chrome ponsel Anda.

---

## 📖 Cara Penggunaan & Pengujian

1. Buka aplikasi di HP melalui link HTTPS.
2. Izinkan akses **Kamera** saat diminta browser.
3. Arahkan kamera HP ke gambar marker huruf Hijaiyah (misalnya marker **Ba**).
4. Tiga objek 3D (Huruf Ba, Model Pintu, dan Bintang Emas) akan langsung muncul secara berdampingan.
5. **Sentuh & Geser**: Gunakan satu jari untuk menggeser objek di atas permukaan kartu.
6. **Perbesar & Perkecil**: Cubit objek dengan dua jari untuk mengubah ukurannya.
7. **Ketuk untuk Bersuara**: Ketuk huruf untuk mendengar pelafalan huruf, ketuk benda untuk pelafalan kata, dan ketuk bintang untuk mendengar suara chime.

---

## 📋 Daftar Kosakata & Model Benda yang Didukung

Aplikasi mendukung pemuatan otomatis untuk kosakata berikut:

* **أب** (Ayah) ➔ `ab.glb` / `ab.mp3`
* **أم** (Ibu) ➔ `um.glb` / `um.mp3`
* **عم** (Paman) ➔ `am.glb` / `am.mp3`
* **أخ** (Saudara) ➔ `akh.glb` / `akh.mp3`
* **دم** (Darah) ➔ `dam.glb` / `dam.mp3`
* **يد** (Tangan) ➔ `yad.glb` / `yad.mp3`
* **باب** (Pintu) ➔ `bab.glb` / `bab.mp3`
* **كتب** (Buku) ➔ `kitab.glb` / `kitab.mp3`
* **قلم** (Pena) ➔ `qalam.glb` / `qalam.mp3`
* **نor** (Cahaya) ➔ `nur.glb` / `nur.mp3`
* **بيت** (Rumah) ➔ `bait.glb` / `bait.mp3`
* **عسل** (Madu) ➔ `asal.glb` / `asal.mp3`
* **سمك** (Ikan) ➔ `samak.glb` / `samak.mp3`
* **قمر** (Bulan) ➔ `qamar.glb` / `qamar.mp3`
* **شمس** (Matahari) ➔ `syams.glb` / `syams.mp3`
* **رجل** (Kaki) ➔ `rijl.glb` / `rijl.mp3`
* **ولد** (Anak Laki-Laki) ➔ `walad.glb` / `walad.mp3`
* **بنت** (Anak Perempuan) ➔ `bint.glb` / `bint.mp3`
* **عين** (Mata) ➔ `ain.glb` / `ain.mp3`
* **فرس** (Kuda) ➔ `faras.glb` / `faras.mp3`
* **نهر** (Sungai) ➔ `nahr.glb` / `nahr.mp3`
* **كلb** (Anjing) ➔ `kalb.glb` / `kalb.mp3`
* **جبل** (Gunung) ➔ `jabal.glb` / `jabal.mp3`
* **أرنب** (Kelinci) ➔ `arnab.glb` / `arnab.mp3`
* **مسجد** (Masjid) ➔ `masjid.glb` / `masjid.mp3`
* **تفاح** (Apel) ➔ `tuffah.glb` / `tuffah.mp3`
* **حليب** (Susu) ➔ `halib.glb` / `halib.mp3`

---

## 📄 Lisensi

Proyek ini didistribusikan di bawah **Lisensi MIT**. Lihat file `LICENSE` untuk informasi lebih lanjut.
