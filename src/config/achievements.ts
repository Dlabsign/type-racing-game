export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export type AchievementCategory = 'speed' | 'precision' | 'tournament' | 'dedication' | 'dramatic';

export interface Achievement {
  id: string;
  category: AchievementCategory;
  tier: AchievementTier;
  title: string;
  description: string;
  targetValue: number;
  unit: string;
  rewardXp: number;
  rewardTitle?: string;
  iconName: string;
}

export const TIER_CONFIG: Record<
  AchievementTier,
  {
    name: string;
    color: string;
    border: string;
    glow: string;
    badgeBg: string;
    textColor: string;
  }
> = {
  bronze: {
    name: 'Perunggu',
    color: '#CD7F32',
    border: 'border-[#CD7F32]/50',
    glow: 'shadow-[0_0_16px_rgba(205,127,50,0.35)]',
    badgeBg: 'bg-[#CD7F32]/20',
    textColor: 'text-[#E09D62]'
  },
  silver: {
    name: 'Perak',
    color: '#E2E8F0',
    border: 'border-slate-300/60',
    glow: 'shadow-[0_0_18px_rgba(226,232,240,0.4)]',
    badgeBg: 'bg-slate-300/20',
    textColor: 'text-slate-200'
  },
  gold: {
    name: 'Emas',
    color: '#F59E0B',
    border: 'border-amber-400/70',
    glow: 'shadow-[0_0_22px_rgba(245,158,11,0.45)]',
    badgeBg: 'bg-amber-400/20',
    textColor: 'text-amber-300'
  },
  diamond: {
    name: 'Berlian',
    color: '#38BDF8',
    border: 'border-cyan-400/80',
    glow: 'shadow-[0_0_28px_rgba(56,189,248,0.55)]',
    badgeBg: 'bg-cyan-400/25',
    textColor: 'text-cyan-200'
  }
};

export const ACHIEVEMENTS: Achievement[] = [
  // ==========================================================================
  // 1. KECEPATAN (RAW SPEED)
  // ==========================================================================
  {
    id: 'speed_50',
    category: 'speed',
    tier: 'bronze',
    title: 'Langkah Awal',
    description: 'Capai kecepatan 50 KBM pada mode apa pun.',
    targetValue: 50,
    unit: 'KBM',
    rewardXp: 150,
    rewardTitle: 'Pelari Cepat',
    iconName: 'zap'
  },
  {
    id: 'speed_80',
    category: 'speed',
    tier: 'silver',
    title: 'Pacuan Cepat',
    description: 'Capai kecepatan 80 KBM.',
    targetValue: 80,
    unit: 'KBM',
    rewardXp: 300,
    rewardTitle: 'Pelari Kilat',
    iconName: 'gauge'
  },
  {
    id: 'speed_100',
    category: 'speed',
    tier: 'gold',
    title: 'Jemari Gesit',
    description: 'Capai kecepatan 100 KBM pada mode Balap Cepat.',
    targetValue: 100,
    unit: 'KBM',
    rewardXp: 600,
    rewardTitle: 'Jemari Gesit',
    iconName: 'flame'
  },
  {
    id: 'speed_120',
    category: 'speed',
    tier: 'diamond',
    title: 'Puncak Kecepatan',
    description: 'Capai kecepatan minimal 120 KBM dengan akurasi minimal 95%.',
    targetValue: 120,
    unit: 'KBM',
    rewardXp: 1200,
    rewardTitle: 'Pakar Kecepatan',
    iconName: 'sparkles'
  },

  // ==========================================================================
  // 2. PRESISI & FOKUS
  // ==========================================================================
  {
    id: 'flawless_run',
    category: 'precision',
    tier: 'gold',
    title: 'Kemenangan Sempurna',
    description: 'Selesaikan balapan dengan akurasi 100% tanpa menggunakan tombol hapus.',
    targetValue: 100,
    unit: '% Akurasi',
    rewardXp: 500,
    rewardTitle: 'Jemari Emas',
    iconName: 'target'
  },
  {
    id: 'zen_focus',
    category: 'precision',
    tier: 'silver',
    title: 'Fokus Penuh',
    description: 'Raih akurasi minimal 98% dalam 3 balapan berturut-turut.',
    targetValue: 3,
    unit: 'Balapan',
    rewardXp: 400,
    rewardTitle: 'Fokus Penuh',
    iconName: 'check-circle'
  },
  {
    id: 'iron_cadence',
    category: 'precision',
    tier: 'silver',
    title: 'Irama Konsisten',
    description: 'Ketik 30 kata berturut-turut tanpa kesalahan.',
    targetValue: 30,
    unit: 'Kata',
    rewardXp: 350,
    rewardTitle: 'Irama Konsisten',
    iconName: 'keyboard'
  },
  {
    id: 'cold_fingers',
    category: 'precision',
    tier: 'gold',
    title: 'Pengetikan Presisi',
    description: 'Selesaikan balapan tingkat Mahir tanpa kesalahan.',
    targetValue: 1,
    unit: 'Balapan Mahir',
    rewardXp: 700,
    rewardTitle: 'Pengetik Presisi',
    iconName: 'shield'
  },

  // ==========================================================================
  // 3. TURNAMEN (APEX CHAMPIONSHIP)
  // ==========================================================================
  {
    id: 'circuit_debut',
    category: 'tournament',
    tier: 'bronze',
    title: 'Debut Lintasan',
    description: 'Raih kemenangan pertama pada mode Balap Cepat.',
    targetValue: 1,
    unit: 'Kemenangan',
    rewardXp: 150,
    rewardTitle: 'Juara Pemula',
    iconName: 'flag'
  },
  {
    id: 'finalist',
    category: 'tournament',
    tier: 'silver',
    title: 'Finalis Kejuaraan',
    description: 'Lolos ke babak Grand Final turnamen.',
    targetValue: 1,
    unit: 'Final',
    rewardXp: 350,
    rewardTitle: 'Finalis Utama',
    iconName: 'medal'
  },
  {
    id: 'apex_champion',
    category: 'tournament',
    tier: 'gold',
    title: 'Juara Turnamen',
    description: 'Raih juara pertama pada babak Grand Final turnamen.',
    targetValue: 1,
    unit: 'Piala Emas',
    rewardXp: 800,
    rewardTitle: 'Juara Turnamen',
    iconName: 'trophy'
  },
  {
    id: 'clean_sweep',
    category: 'tournament',
    tier: 'diamond',
    title: 'Kemenangan Mutlak',
    description: 'Raih juara pertama di seluruh babak turnamen (Perempat Final, Semifinal, dan Grand Final).',
    targetValue: 3,
    unit: 'Babak Bersih',
    rewardXp: 1500,
    rewardTitle: 'Pemenang Mutlak',
    iconName: 'grand-trophy'
  },

  // ==========================================================================
  // 4. JAM TERBANG & DEDIKASI
  // ==========================================================================
  {
    id: 'warmup_500',
    category: 'dedication',
    tier: 'bronze',
    title: 'Latihan Awal',
    description: 'Ketik total 500 kata.',
    targetValue: 500,
    unit: 'Kata',
    rewardXp: 150,
    rewardTitle: 'Jari Tangkas',
    iconName: 'keyboard'
  },
  {
    id: 'marathon_5k',
    category: 'dedication',
    tier: 'silver',
    title: 'Pelari Jarak Jauh',
    description: 'Ketik total 5.000 kata.',
    targetValue: 5000,
    unit: 'Kata',
    rewardXp: 450,
    rewardTitle: 'Pelari Jarak Jauh',
    iconName: 'gauge'
  },
  {
    id: 'veteran_50',
    category: 'dedication',
    tier: 'silver',
    title: 'Pelari Berpengalaman',
    description: 'Selesaikan 50 balapan.',
    targetValue: 50,
    unit: 'Balapan',
    rewardXp: 500,
    rewardTitle: 'Pelari Berpengalaman',
    iconName: 'award'
  },
  {
    id: 'score_100k',
    category: 'dedication',
    tier: 'gold',
    title: 'Poin Kejuaraan',
    description: 'Kumpulkan total 100.000 poin karier.',
    targetValue: 100000,
    unit: 'Poin',
    rewardXp: 1000,
    rewardTitle: 'Poin Kejuaraan',
    iconName: 'trophy'
  },

  // ==========================================================================
  // 5. MOMEN DRAMATIS (CLUTCH & WILDCARDS)
  // ==========================================================================
  {
    id: 'clutch_comeback',
    category: 'dramatic',
    tier: 'diamond',
    title: 'Pembalikan Posisi',
    description: 'Menangkan balapan setelah berada di posisi ke-4 pada paruh pertama.',
    targetValue: 1,
    unit: 'Pembalikan',
    rewardXp: 1000,
    rewardTitle: 'Pelari Tangguh',
    iconName: 'zap'
  },
  {
    id: 'photo_finish',
    category: 'dramatic',
    tier: 'diamond',
    title: 'Kemenangan Tipis',
    description: 'Menangkan balapan dengan selisih waktu kurang dari 0,20 detik dari lawan terdekat.',
    targetValue: 1,
    unit: 'Finis Tipis',
    rewardXp: 1000,
    rewardTitle: 'Pelari Presisi',
    iconName: 'timer'
  },
  {
    id: 'night_crawler',
    category: 'dramatic',
    tier: 'bronze',
    title: 'Pengetik Dini Hari',
    description: 'Selesaikan balapan antara pukul 00.00 dan 04.00.',
    targetValue: 1,
    unit: 'Sesi Malam',
    rewardXp: 200,
    rewardTitle: 'Pengetik Dini Hari',
    iconName: 'sparkles'
  }
];

export const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  speed: 'Kecepatan',
  precision: 'Ketepatan',
  tournament: 'Turnamen',
  dedication: 'Dedikasi',
  dramatic: 'Momen Penentu'
};
