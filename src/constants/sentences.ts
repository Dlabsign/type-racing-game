import { DifficultyLevel, SentenceTheme } from '@/types/game';

export const SENTENCE_THEMES: Record<SentenceTheme, Record<DifficultyLevel, string[]>> = {
  motivasi: {
    easy: [
      "Kopi udah dingin, tapi jari masih panas buat ngebut.",
      "Jangan kasih kendor, garis finis udah di depan mata.",
      "Fokus ke ritme, bukan cuma adu cepat tanpa arah.",
      "Tarik napas santai, lemaskan jari sebelum mulai balapan.",
      "Kecepatan itu bonus, ketepatan ketikan yang utama.",
      "Gerakan jari yang luwes bikin ketikan makin mengalir.",
      "Satu putaran lagi buat buktiin siapa paling kencang.",
      "Tenang, jangan panik pas lawan mulai ngejar dari samping."
    ],
    medium: [
      "Mengetik cepat itu mirip main musik, kuncinya ada di ketukan jari yang stabil tanpa ragu.",
      "Begitu nemu ritme yang pas, kata-kata bakal meluncur sendiri tanpa perlu dipikir panjang.",
      "Gak usah buru-buru menekan tombol, yang penting mata tetap dua kata di depan kursor.",
      "Latihan tiap hari bikin jari refleks bergerak otomatis tanpa mikir susunan huruf lagi.",
      "Pembalap sejati tahu kapan harus tancap gas dan kapan menjaga akurasi tetap bersih.",
      "Satu kesalahan kecil bisa bikin laju tersendat, jadi utamakan ketepatan di tiap kata.",
      "Layar monitor menyala terang, musik ketukan keyboard jadi irama balapan malam ini."
    ],
    hard: [
      "Menjaga fokus di kecepatan tinggi butuh ketenangan pikiran, karena panik sedikit saja bisa bikin jari salah pencet dan kehilangan momentum berharga.",
      "Bukan soal seberapa cepat kamu mulai menekan tuts pertama, tapi bagaimana kamu menjaga konsistensi ritme sampai kata terakhir menyentuh garis finis.",
      "Sensasi saat semua kata terketik sempurna tanpa satu pun tombol backspace adalah kepuasan murni yang dicari setiap pembalap ketik.",
      "Di lintasan ini hanya ada kamu dan deretan kalimat, buktikan kecepatan jarimu sanggup melesat meninggalkan bayangan lawan."
    ]
  },
  fakta: {
    easy: [
      "Madu asli gak bakal basi walau disimpan ratusan tahun.",
      "Jantung paus biru gedenya hampir sama kayak mobil mini.",
      "Cahaya matahari butuh delapan menit buat nyampe ke bumi.",
      "Bunglon ganti warna kulit buat atur suhu tubuh dan ngobrol.",
      "Bintang laut gak punya otak dan gak punya setetes pun darah.",
      "Batang bambu tertentu bisa tumbuh puluhan sentimeter sehari."
    ],
    medium: [
      "Sidik jari koala ternyata mirip banget sama manusia sampai susah dibedakan lewat mikroskop.",
      "Gunung Everest makin tinggi beberapa milimeter tiap tahun karena lempeng bumi yang terus bergeser.",
      "Burung kolibri sanggup mengepakkan sayap puluhan kali per detik sampai bisa melayang diam di udara.",
      "Di dasar palung laut yang gelap gulita, banyak ikan unik yang bisa bikin cahaya sendiri dari tubuhnya.",
      "Pohon di hutan saling kirim sinyal nutrisi lewat jaringan jamur bawah tanah yang rumit."
    ],
    hard: [
      "Bumi berputar di garis khatulistiwa dengan kecepatan seribu kilometer per jam, membawa kita mengarungi ruang angkasa tanpa terasa sedikit pun guncangan.",
      "Teleskop luar angkasa sanggup menangkap sisa cahaya purba dari galaksi terjauh yang sudah menempuh perjalanan miliaran tahun melintasi kosmos.",
      "Kalau seluruh pembuluh darah di tubuh manusia dibentangkan lurus, panjangnya bisa mengelilingi bola dunia lebih dari dua kali putaran.",
      "Bunga matahari muda memutar mahkotanya mengikuti langkah matahari dari fajar hingga senja sebelum beristirahat di malam hari."
    ]
  },
  produktivitas: {
    easy: [
      "Dua puluh menit fokus penuh jauh lebih ampuh dari seharian bengong.",
      "Bereskan meja kerja biar pikiran gak gampang buyar pas ngetik.",
      "Catat ide liar sebelum hilang kebawa lamunan sore.",
      "Istirahatkan mata sejenak, regangkan jemari biar gak kaku.",
      "Mulai dari tugas paling kecil buat mancing rasa semangat."
    ],
    medium: [
      "Menutup tab peramban yang gak penting bikin beban laptop enteng dan pikiran jauh lebih tenang.",
      "Satu jam kerja tanpa distraksi notifikasi bisa menyelesaikan tugas yang tertunda berhari-hari.",
      "Membiasakan diri mengetik sepuluh jari membuka jalan pintas buat menyelesaikan pekerjaan dua kali lebih cepat.",
      "Jalan kaki sebentar sambil menghirup udara segar sering kali jadi obat paling ampuh saat pikiran mulai buntu.",
      "Trik rahasia produktif bukan memaksakan diri, melainkan menjaga ritme kerja tetap asyik dinikmati."
    ],
    hard: [
      "Membuat rencana kerja harian yang ringkas menyelamatkan kita dari kepanikan tugas menumpuk di penghujung hari yang melelahkan.",
      "Fokus penuh adalah aset paling langka di era serba cepat ini, siapa yang sanggup menjaga konsentrasi dialah yang keluar sebagai pemenang.",
      "Disiplin kecil yang diulang setiap hari jauh lebih berdampak daripada ledakan semangat sesaat yang cepat padam kehabisan tenaga.",
      "Saat aliran fokus sudah tercipta, ketukan demi ketukan pada papan ketik terasa seperti melodi yang mengalir tanpa hambatan."
    ]
  },
  english: {
    easy: [
      "Cold coffee on the desk, but the fingers are ready to sprint.",
      "Keep the rhythm smooth and let the words flow naturally.",
      "Do not rush the keys, accuracy always wins the long race.",
      "A quick deep breath before the green light flashes on screen.",
      "Feel the click of every key and stay locked on the target."
    ],
    medium: [
      "Typing fast is like playing the drums, find the steady groove and never lose your tempo.",
      "Once you enter the flow state, every sentence feels effortless from start to finish.",
      "Keep your eyes two words ahead of the cursor to maintain flawless momentum on the track.",
      "True speed comes from relaxed muscles and laser focus, not frantic tapping.",
      "The finish line is right around the corner, push the pedal and take the victory."
    ],
    hard: [
      "Sustaining top speed under pressure requires total composure, where a single mistyped character can disrupt your entire sprint rhythm.",
      "Great typists do not just hit keys rapidly, they read ahead and glide across sentences with effortless grace and precision.",
      "There is nothing quite like the rush of typing a complex paragraph flawlessly while rivals trail closely in your rearview mirror.",
      "Mastering the mechanical keyboard turns raw thoughts into instant speed, leaving every opponent far behind in the dust."
    ]
  }
};

export const DIFFICULTY_PRESETS: Record<DifficultyLevel, { r1: number; r2: number; r3: number }> = {
  easy:   { r1: 44, r2: 38, r3: 32 },
  medium: { r1: 75, r2: 67, r3: 58 },
  hard:   { r1: 104, r2: 96, r3: 88 }
};
