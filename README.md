# TYPE RACING — Balap Ketik Ceria di Stadion (Next.js Edition)

Proyek game balap ketik cepat, interaktif, dan penuh animasi bertema lintasan atletik stadion olahraga, dibuat ulang menggunakan framework **Next.js (App Router)**, **TypeScript**, dan **Tailwind CSS**.

---

## 🏃 Fitur Utama

1. **Stadium Sky & Real-time HUD**:
   - Ilustrasi langit biru, awan bergerak (*floating clouds*), siluet gedung kota, dan deretan pepohonan hijau stadion.
   - Logo bertema balap dengan ornamen lari miring (*slanted badge*).
   - Indikator putaran (*LAP Counter* `1/3` atau `1/1`).
   - Papan skor timer balap presisi milidetik (`00:00.00`).
   - Kartu metrik WPM (*Words Per Minute*) dan Akurasi (*Accuracy* %).
   - Tombol audio dengan efek suara sintetis (*Web Audio API*) tanpa perlu file eksternal.
   - Spanduk stadion motivasi (*"TYPE FAST"*, *"FOCUS • TYPE • WIN"*, *"SPEED UP!"*).

2. **Lintasan 4 Pelari (*Running Track*)**:
   - Garis finis bermotif catur miring (*checkered finish line*).
   - 4 Lintasan (Lane 1: Kamu / Player, Lane 2: Rival_01, Lane 3: Rival_02, Lane 4: Rival_03).
   - Pelari animasi kartun SVG dengan gerakan tangan (*arm swings*), kaki (*leg strides*), badan membal (*body bob*), dan garis kecepatan (*speed lines*).
   - Aura hijau terang (*green aura trail*) pada lintasan pemain.
   - Teks kalimat lintasan yang langsung menampilkan progres ketikan.

3. **Panel Kontrol & Arena Mengetik**:
   - **Panel Statistik**: WPM, Akurasi, Kata Benar, dan Kata Salah.
   - **White Sentence Prompt Box**: Menampilkan huruf yang sudah diketik (hijau), kursor kedip (*blinking cursor*), huruf yang salah (merah & getar), dan sisa kalimat.
   - **Virtual QWERTY Keyboard**: Keyboard virtual interaktif yang otomatis menyala hijau (*key-target*) pada tombol berikutnya yang harus ditekan, mendukung pengetikan fisik maupun klik/layar sentuh, flash animasi ketika tombol ditekan, dan indikator Shift pintar.
   - **Kartu Posisimu**: Peringkat pelari saat ini (`1/4`, dll.) beserta mini *progress bar* dengan ikon pelari yang bergerak menuju bendera finis.
   - **Tombol Keluar / Menu**: Membuka pengaturan tingkat kesulitan AI dan jumlah lap.

4. **Sistem Modal & Countdown**:
   - Countdown bersiap: `3 - 2 - 1 - MULAI!` sebelum balapan dimulai.
   - Modal Finis / Podium Juara: Ringkasan lengkap kecepatan, akurasi, waktu tempuh, klasemen akhir seluruh pelari, dan tombol balapan lagi.
   - Modal Pengaturan & Jeda: Pilihan tingkat kesulitan AI (Santai: 35–52 WPM, Kompetitif: 55–75 WPM, Stadion Pro: 65–89 WPM) dan jumlah lap (1 Lap atau 3 Lap).

---

## 🛠️ Agent Skills Terpasang

Proyek ini telah dilengkapi dengan skill pengembangan dan desain antarmuka (anti-slop & iconography):

1. **[impeccable](file:///D:/DANIEL/ANTIGRAVITY/game/typeracing/.agents/skills/impeccable/SKILL.md)** (`pbakaus/impeccable`) — Desain, audit, *polish*, ritme visual, hirarki, tipografi, dan animasi frontend berkualitas tinggi (referensi: [impeccable.style](https://impeccable.style/)).
2. **[better-icons](file:///D:/DANIEL/ANTIGRAVITY/game/typeracing/.agents/skills/better-icons/SKILL.md)** (`better-auth/better-icons`) — Integrasi dan pencarian ikon SVG dari 200+ icon library (Iconify) untuk aplikasi web.
3. **[hallmark](file:///D:/DANIEL/ANTIGRAVITY/game/typeracing/.agents/skills/hallmark/SKILL.md)** (`nutlope/hallmark`) — Panduan desain anti-AI-slop untuk halaman baru, audit, redesign, dan ekstraksi desain.
4. **[design-taste-frontend](file:///D:/DANIEL/ANTIGRAVITY/game/typeracing/.agents/skills/design-taste-frontend/SKILL.md)** (`Leonxlnx/taste-skill`) — *Art direction* frontend terkurasi dari situs-situs pemenang penghargaan, menerapkan standar tata letak, palet, dan ritme komponen modern.
5. **[stop-slop](file:///D:/DANIEL/ANTIGRAVITY/game/typeracing/.agents/skills/stop-slop/SKILL.md)** (`hardikpandya/stop-slop`) — Aturan eliminasi pola teks dan gaya penulisan generik AI agar bahasa dan pesan terasa natural.

---

## 🚀 Cara Menjalankan

### 1. Menjalankan Server Pengembangan (Dev)
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

### 2. Membangun Proyek untuk Produksi (Build)
```bash
npm run build
npm run start
```

### 3. Pengecekan Kualitas Kode (Lint)
```bash
npm run lint
```

---

## 📁 Struktur Direktori

```
typeracing/
├── .agents/
│   └── skills/
│       ├── better-icons/          # better-auth/better-icons
│       ├── design-taste-frontend/ # Leonxlnx/taste-skill
│       ├── hallmark/              # nutlope/hallmark
│       ├── impeccable/            # pbakaus/impeccable
│       └── stop-slop/             # hardikpandya/stop-slop
├── public/                 # Berkas statis
├── src/
│   ├── app/
│   │   ├── globals.css     # Gaya kustom lintasan, animasi runner, dan keyboard
│   │   ├── layout.tsx      # Font Fredoka, Plus Jakarta Sans, JetBrains Mono
│   │   └── page.tsx        # Game engine orchestrator & state balapan
│   ├── components/
│   │   ├── AvatarSvg.tsx       # Karakter avatar kartun tiap pelari
│   │   ├── RunnerSvg.tsx       # Rig animasi pelari lintasan SVG
│   │   ├── StadiumHeader.tsx   # HUD atas, timer, langit, spanduk stadion
│   │   ├── RunningTrack.tsx    # 4 Jalur lintasan dan garis finis
│   │   ├── StatistikPanel.tsx  # Panel samping kiri statistik ketikan
│   │   ├── TypingArena.tsx     # Kotak kalimat dan Virtual QWERTY Keyboard
│   │   ├── PosisimuCard.tsx    # Peringkat, mini progress bar, tombol Keluar
│   │   ├── CountdownOverlay.tsx# Animasi hitung mundur 3-2-1 Mulai
│   │   ├── FinishModal.tsx     # Modal podium juara & klasemen akhir
│   │   └── SettingsModal.tsx   # Menu tingkat kesulitan & opsi jumlah lap
│   ├── constants/
│   │   └── sentences.ts        # Kumpulan kutipan motivasi bahasa Indonesia
│   ├── types/
│   │   └── game.ts             # Definisi TypeScript untuk state game
│   └── utils/
│       └── audio.ts            # Web Audio API synthesizer (efek suara & fanfare)
├── type_racing_stadium_edition.html # Berkas HTML asli (sebagai referensi)
├── package.json
├── tsconfig.json
└── next.config.ts
```
