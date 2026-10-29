import { DifficultyLevel, SentenceTheme } from '@/types/game';

export const SENTENCE_THEMES: Record<SentenceTheme, Record<DifficultyLevel, string[]>> = {
  motivasi: {
    easy: [
      "Secangkir kopi telah siap menemani jari-jemari yang bersemangat.",
      "Pertahankan konsentrasi karena garis finis sudah berada di depan mata.",
      "Utamakan keselarasan irama daripada sekadar terburu-buru tanpa arah.",
      "Tarik napas perlahan dan lemaskan otot tangan sebelum memulai balapan.",
      "Kecepatan merupakan hasil dari latihan dan ketepatan yang konsisten.",
      "Gerakan tangan yang luwes membuat alur pengetikan mengalir tenang.",
      "Satu putaran lagi untuk membuktikan kemahiran mengetik terbaik Anda.",
      "Tetaplah tenang saat melihat laju lawan mulai mendekat dari samping."
    ],
    medium: [
      "Mengetik cepat menyerupai bermain musik, kuncinya terletak pada ketukan jari yang stabil dan teratur.",
      "Ketika menemukan irama yang selaras, setiap kata akan tersusun dengan lancar dan penuh percaya diri.",
      "Fokuskan pandangan dua kata di depan kursor agar pengetikan berjalan berkesinambungan tanpa henti.",
      "Latihan teratur setiap hari melatih memori otot bergerak secara tepat tanpa perlu melihat papan tombol.",
      "Pengetik andal memahami saat yang tepat untuk memacu kecepatan dan menjaga ketepatan tetap sempurna.",
      "Satu kesalahan kecil dapat mengurangi momentum laju, oleh karena itu utamakan ketelitian pada setiap huruf.",
      "Cahaya layar dan suara ketukan papan tombol menjadi irama penyemangat dalam latihan hari ini."
    ],
    hard: [
      "Menjaga fokus pada kecepatan tinggi membutuhkan ketenangan pikiran karena kepanikan dapat menyebabkan kesalahan ketik dan membuang waktu berharga.",
      "Keberhasilan bukan diukur dari seberapa tergesa Anda menekan tombol pertama, melainkan bagaimana Anda mempertahankan konsistensi hingga kata terakhir.",
      "Menyelesaikan seluruh kalimat secara sempurna tanpa menekan tombol hapus memberikan kepuasan tersendiri bagi pengetik.",
      "Di lintasan ini Anda berhadapan dengan susunan kata pilihan; buktikan bahwa ketangkasan jemari Anda mampu melaju dengan sangat baik."
    ]
  },
  fakta: {
    easy: [
      "Madu murni tidak akan pernah basi meskipun disimpan selama ratusan tahun.",
      "Jantung paus biru memiliki ukuran yang hampir setara dengan mobil kecil.",
      "Cahaya matahari membutuhkan waktu sekitar delapan menit untuk sampai ke bumi.",
      "Bunglon mengubah warna kulit untuk mengatur suhu tubuh dan berkomunikasi.",
      "Bintang laut tidak memiliki organ otak serta tidak memiliki darah di tubuhnya.",
      "Tanaman bambu tertentu mampu tumbuh puluhan sentimeter hanya dalam satu hari."
    ],
    medium: [
      "Pola sidik jari koala memiliki kemiripan luar biasa dengan sidik jari manusia saat diamati lewat mikroskop.",
      "Puncak Gunung Everest bertambah tinggi beberapa milimeter setiap tahun akibat pergeseran lempeng tektonik bumi.",
      "Burung kolibri mengepakkan sayap hingga puluhan kali per detik sehingga mampu melayang diam di udara.",
      "Di dasar palung laut yang sangat dalam, beberapa jenis ikan menghasilkan cahaya alami sendiri dari tubuh mereka.",
      "Pohon di dalam hutan lebat saling berbagi nutrisi melalui jaringan jamur bawah tanah yang saling terhubung."
    ],
    hard: [
      "Bumi berotasi pada garis khatulistiwa dengan kecepatan lebih dari seribu kilometer per jam tanpa menimbulkan guncangan yang terasa oleh kita.",
      "Teleskop luar angkasa canggih berhasil menangkap sisa cahaya purba dari galaksi terjauh yang telah menempuh perjalanan miliaran tahun.",
      "Apabila seluruh pembuluh darah dalam tubuh manusia direntangkan lurus, panjangnya sanggup mengelilingi permukaan bumi lebih dari dua putaran.",
      "Bunga matahari muda memutar mahkotanya mengikuti arah sinar matahari sejak fajar hingga senja sebelum beristirahat pada malam hari."
    ]
  },
  produktivitas: {
    easy: [
      "Dua puluh menit fokus penuh jauh lebih bernilai daripada seharian tanpa arah.",
      "Rapikan meja kerja agar pikiran tetap jernih saat menyelesaikan tugas penting.",
      "Segera catat gagasan cemerlang sebelum terlewatkan oleh kesibukan berikutnya.",
      "Istirahatkan mata sejenak dan regangkan jemari agar otot kembali rileks.",
      "Mulailah dari langkah sederhana untuk menumbuhkan semangat berkarya hari ini."
    ],
    medium: [
      "Menutup jendela peramban yang tidak diperlukan meringankan beban perangkat dan menenangkan pikiran Anda.",
      "Satu jam bekerja tanpa gangguan pemberitahuan gawai dapat menuntaskan tugas besar yang tertunda.",
      "Membiasakan mengetik menggunakan sepuluh jari membantu Anda menyelesaikan pekerjaan dengan efisien.",
      "Berjalan kaki sejenak sambil menghirup udara segar dapat menjernihkan pikiran yang sedang penat.",
      "Kunci produktivitas sejati bukanlah memaksakan tenaga, melainkan menjaga ritme kerja yang teratur dan nyaman."
    ],
    hard: [
      "Menyusun rencana kerja harian yang tertata rapi menyelamatkan kita dari kepanikan tugas yang menumpuk di penghujung hari.",
      "Kemampuan fokus penuh merupakan keahlian berharga di era modern; siapa yang mampu menjaga konsentrasi akan menghasilkan karya terbaik.",
      "Kebiasaan baik yang dipraktikkan secara konsisten setiap hari membawa dampak besar melampaui antusiasme sesaat.",
      "Ketika konsentrasi mendalam telah tercapai, alunan ketukan pada papan tombol mengalir selaras menghasilkan paragraf bermakna."
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
  },
  malay: {
    easy: [
      "Secawan kopi panas sudah tersedia menemani jari yang bersedia memecut.",
      "Kekalkan tumpuan kerana garisan penamat sudah berada di hadapan mata.",
      "Utamakan rentak dan ketepatan sebelum mengejar kelajuan pantas.",
      "Tarik nafas perlahan dan rehatkan jari sebelum memulakan perlumbaan.",
      "Kelajuan sebenar lahir daripada latihan dan ketepatan yang konsisten.",
      "Satu pusingan lagi untuk membuktikan kemahiran menaip terpantas anda.",
      "Bertenang apabila melihat pelumba lawan mula mengejar dari belakang."
    ],
    medium: [
      "Menaip pantas menyerupai alunan muzik, rahsianya terletak pada ketukan jari yang teratur dan seragam.",
      "Apabila memasuki zon fokus, setiap perkataan terhasil dengan lancar tanpa sebarang keraguan.",
      "Arahkan pandangan dua patah perkataan ke hadapan kursor untuk mengekalkan momentum larian.",
      "Latihan harian membina ingatan otot yang kukuh tanpa perlu menjeling ke papan kekunci.",
      "Pelumba hebat mengetahui waktu terbaik untuk memecut laju sambil mengekalkan ketepatan seratus peratus.",
      "Satu kesilapan kecil boleh memperlahankan rentak, jadi utamakan ketelitian pada setiap aksara."
    ],
    hard: [
      "Mengekalkan kelajuan puncak di bawah tekanan tinggi menuntut ketenangan fikiran yang mutlak, di mana satu kesilapan boleh merencatkan rentak pecutan anda.",
      "Kehebatan menaip bukan diukur daripada seberapa gopoh anda menekan kekunci pertama, tetapi bagaimana anda mengekalkan ketekalan sehingga perkataan terakhir.",
      "Menamatkan perenggan mencabar dengan ketepatan sempurna tanpa menggunakan kekunci undur memberikan kepuasan sebenar kepada setiap pelari siber.",
      "Di litar atletik ini, gabungan fokus tajam dan ketangkasan jemari akan menentukan siapa yang layak menjulang trofi kejuaraan."
    ]
  },
  chinese: {
    easy: [
      "一杯热咖啡在手，指尖已经准备好在赛道上全力冲刺。",
      "保持平稳的呼吸节奏，终点线就在不远的正前方。",
      "不要盲目追求快速度，打字的精准度才是制胜法宝。",
      "在绿灯亮起之前，调整好坐姿与手腕的最佳发力角度。",
      "每一个按键的敲击声，都在为赛道上的选手加油呐喊。",
      "再坚持一个弯道，用指尖的速度赢得这场速度对决。"
    ],
    medium: [
      "快速打字就像演奏钢琴，关键在于手指敲击键盘时稳定而连贯的节奏律动。",
      "一旦进入深度专注的心流状态，每一个字词都会如同流水般自然顺畅地输出。",
      "视线始终保持在光标前方两个词的位置，这样才能在极速竞赛中保持不败优势。",
      "放松手腕肌肉并专注屏幕，肌肉记忆会让指尖以惊人的默契在键盘上飞速起舞。",
      "真正的键盘高手懂得在高速冲刺中保持绝对冷静，决不在微小细节上犯错。"
    ],
    hard: [
      "在高压竞争下维持极限手速需要极高的心理素质，任何一次手抖或错键都会瞬间打破行云流水的冲刺节奏。",
      "优秀的竞速键盘手不仅依靠手速取胜，更依靠对整段文字的预判与手脑合一的精准操控力。",
      "以百分之百的零误差完成一整段高难度测试文本，这是每一位键盘赛车手梦寐以求的最高成就。",
      "在这条数字化的体育场赛道上，指尖的轻快击打将化作无限动力，助你勇夺最终的总冠军荣耀。"
    ]
  }
};

export const DIFFICULTY_PRESETS: Record<DifficultyLevel, { r1: number; r2: number; r3: number }> = {
  easy:   { r1: 44, r2: 38, r3: 32 },
  medium: { r1: 75, r2: 67, r3: 58 },
  hard:   { r1: 104, r2: 96, r3: 88 }
};
