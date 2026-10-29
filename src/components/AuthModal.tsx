import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { UserProfile } from '@/types/auth';
import { EditProfileModal } from './EditProfileModal';
import { useI18n } from '@/i18n/I18nContext';
import {
  signInWithEmail,
  signUpWithEmail,
  signInGuest,
  signOutUser,
  resetPassword
} from '@/services/authService';
import { playButtonClick, playModalClose, playFanfare, playWarningChime } from '@/utils/audio';
import {
  SolidUserIcon,
  CloseIcon,
  SolidMailIcon,
  SolidLockIcon,
  SolidEyeIcon,
  SolidEyeClosedIcon,
  SolidUserCircleIcon,
  LogOutIcon,
  TrophyIcon,
  GaugeIcon,
  ZapIcon,
  SolidCheckCircleIcon,
  SolidDangerIcon,
  SolidArrowLeftIcon,
  AwardIcon
} from './icons/Icons';

interface AuthModalProps {
  isOpen: boolean;
  currentUser: User | null;
  userProfile: UserProfile | null;
  soundEnabled?: boolean;
  onClose: () => void;
  onAuthSuccess?: (profile: UserProfile) => void;
}

type AuthTab = 'login' | 'register';

const ATHLETIC_JERSEY_COLORS = [
  { id: 'volt', name: 'Hijau Neon', hex: '#CCFF00', ring: 'ring-[#CCFF00]' },
  { id: 'cyan', name: 'Biru Sian', hex: '#06B6D4', ring: 'ring-[#06B6D4]' },
  { id: 'amber', name: 'Jingga', hex: '#F59E0B', ring: 'ring-[#F59E0B]' },
  { id: 'crimson', name: 'Merah Kirmizi', hex: '#EF4444', ring: 'ring-[#EF4444]' }
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  currentUser,
  userProfile,
  soundEnabled = true,
  onClose,
  onAuthSuccess
}) => {
  const { t } = useI18n();
  const [tab, setTab] = useState<AuthTab>('login');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [jerseyColor, setJerseyColor] = useState<string>('#CCFF00');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password reset sub-view state
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // Status & Feedback states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auto-focus references
  const loginEmailRef = useRef<HTMLInputElement>(null);
  const runnerTagRef = useRef<HTMLInputElement>(null);
  const resetEmailRef = useRef<HTMLInputElement>(null);

  // Auto-focus the first field upon modal open or tab switch
  useEffect(() => {
    if (!isOpen || currentUser) return;
    const timer = setTimeout(() => {
      if (isResetMode) {
        resetEmailRef.current?.focus();
      } else if (tab === 'login') {
        loginEmailRef.current?.focus();
      } else {
        runnerTagRef.current?.focus();
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [isOpen, tab, isResetMode, currentUser]);

  // Keyboard ergonomics: ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        playModalClose(soundEnabled);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, soundEnabled]);

  if (!isOpen) return null;

  const handleSwitchTab = (newTab: AuthTab) => {
    playButtonClick(soundEnabled);
    setTab(newTab);
    setIsResetMode(false);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleClose = () => {
    playModalClose(soundEnabled);
    onClose();
  };

  // Validate username characters: alphanumeric, space, dot, underscore, dash
  const handleRunnerTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.length <= 16) {
      setDisplayName(val);
      const isClean = /^[a-zA-Z0-9 _.-]*$/.test(val);
      if (!isClean && val.length > 0) {
        setErrorMsg('Nama pengguna hanya boleh memuat huruf, angka, titik, tanda hubung, atau garis bawah.');
      } else if (errorMsg && errorMsg.includes('Nama pengguna')) {
        setErrorMsg(null);
      }
    }
  };

  // Sign In Handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Email dan kata sandi wajib diisi.');
      playWarningChime(soundEnabled);
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const { profile } = await signInWithEmail(email, password, rememberMe);
      playFanfare(true, soundEnabled);
      setSuccessMsg('Berhasil masuk. Mengalihkan...');
      if (onAuthSuccess) onAuthSuccess(profile);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: unknown) {
      playWarningChime(soundEnabled);
      const authErr = err as { code?: string };
      let msg = 'Email atau kata sandi salah.';
      if (authErr.code === 'auth/invalid-credential' || authErr.code === 'auth/wrong-password') {
        msg = 'Email atau kata sandi salah.';
      } else if (authErr.code === 'auth/user-not-found') {
        msg = 'Email belum terdaftar.';
      } else if (authErr.code === 'auth/invalid-email') {
        msg = 'Format email tidak valid.';
      } else if (authErr.code === 'auth/too-many-requests') {
        msg = 'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // Direct Sign Up Handler (Zero OTP)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTag = displayName.trim();
    const cleanEmail = email.trim();

    if (!cleanTag) {
      setErrorMsg('Nama pengguna wajib diisi.');
      playWarningChime(soundEnabled);
      return;
    }
    if (!/^[a-zA-Z0-9 _.-]+$/.test(cleanTag)) {
      setErrorMsg('Nama pengguna hanya boleh memuat huruf, angka, titik, tanda hubung, atau garis bawah.');
      playWarningChime(soundEnabled);
      return;
    }
    if (!cleanEmail) {
      setErrorMsg('Email wajib diisi.');
      playWarningChime(soundEnabled);
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Kata sandi minimal 6 karakter.');
      playWarningChime(soundEnabled);
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      playWarningChime(soundEnabled);
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { profile } = await signUpWithEmail(cleanEmail, password, cleanTag, jerseyColor);
      playFanfare(true, soundEnabled);
      setSuccessMsg('Akun berhasil dibuat. Mengalihkan...');
      if (onAuthSuccess) onAuthSuccess(profile);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: unknown) {
      playWarningChime(soundEnabled);
      const authErr = err as { code?: string };
      let msg = 'Pendaftaran akun gagal. Coba lagi.';
      if (authErr.code === 'auth/email-already-in-use') {
        msg = 'Email sudah terdaftar. Silakan masuk.';
      } else if (authErr.code === 'auth/invalid-email') {
        msg = 'Format email tidak valid.';
      } else if (authErr.code === 'auth/weak-password') {
        msg = 'Kata sandi minimal 6 karakter.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // Anonymous Guest Handler
  const handleGuestPlay = async () => {
    playButtonClick(soundEnabled);
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const { profile } = await signInGuest();
      playFanfare(true, soundEnabled);
      setSuccessMsg('Berhasil masuk sebagai tamu.');
      if (onAuthSuccess) onAuthSuccess(profile);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch {
      playWarningChime(soundEnabled);
      setErrorMsg('Gagal masuk sebagai tamu. Periksa koneksi internet Anda.');
    } finally {
      setLoading(false);
    }
  };

  // Password Reset Handler
  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setErrorMsg('Email wajib diisi.');
      playWarningChime(soundEnabled);
      return;
    }

    setResetLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await resetPassword(resetEmail);
      playFanfare(true, soundEnabled);
      setSuccessMsg(`Tautan atur ulang kata sandi telah dikirim ke ${resetEmail}.`);
      setTimeout(() => {
        setIsResetMode(false);
      }, 2500);
    } catch (err: unknown) {
      playWarningChime(soundEnabled);
      const authErr = err as { code?: string };
      let msg = 'Gagal mengirim tautan atur ulang kata sandi. Coba lagi.';
      if (authErr.code === 'auth/user-not-found') {
        msg = 'Email belum terdaftar.';
      } else if (authErr.code === 'auth/invalid-email') {
        msg = 'Format email tidak valid.';
      }
      setErrorMsg(msg);
    } finally {
      setResetLoading(false);
    }
  };

  // Logout Handler
  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOutUser();
      playModalClose(soundEnabled);
      onClose();
    } catch (err) {
      console.warn('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#050811]/85 backdrop-blur-md flex items-center justify-center p-3.5 sm:p-4 select-none animate-apple-in"
      onClick={handleClose}
    >
      {/* Swiss Minimalist Compact Modal Container (14px-18px padding) */}
      <div
        className="relative swiss-card w-[min(92vw,440px)] p-3.5 sm:p-4.5 shadow-[0_20px_50px_rgba(0,0,0,0.85)] text-white overflow-y-auto overscroll-contain max-h-[88dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Floating Glow Accent */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-24 bg-[#CCFF00]/15 rounded-full blur-2xl pointer-events-none" />

        {/* 1. Header with Title & Dismiss Button */}
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#CCFF00]/15 flex items-center justify-center border border-[#CCFF00]/30 text-[#CCFF00] shadow-[0_0_12px_rgba(204,255,0,0.25)]">
              <SolidUserIcon className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="type-title-2 text-white uppercase leading-none">
                {currentUser
                  ? t('public_info', 'User Profile')
                  : isResetMode
                  ? t('reset_password', 'Reset Password')
                  : t('login', 'Sign In')}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            title={t('close', 'Close')}
            className="w-7 h-7 min-w-[28px] min-h-[28px] rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
          >
            <CloseIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* =================================================================== */}
        {/* VIEW 1: AUTHENTICATED USER PROFILE OVERVIEW                         */}
        {/* =================================================================== */}
        {currentUser ? (
          <div className="space-y-2.5">
            {/* Athlete Card */}
            <div className="bg-[#060913]/90 p-3 rounded-xl border border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {userProfile?.avatarUrl || userProfile?.photoURL || currentUser.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={userProfile?.avatarUrl || userProfile?.photoURL || currentUser.photoURL || ''}
                    alt="Foto Profil"
                    className="w-11 h-11 rounded-xl object-cover shadow-md border border-white/20"
                  />
                ) : (
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center type-title-3 font-bold text-[#050811] shadow-md"
                    style={{ backgroundColor: userProfile?.jerseyColor || '#CCFF00' }}
                  >
                    #{userProfile?.bibNumber || '01'}
                  </div>
                )}
                <div>
                  <div className="type-headline text-white leading-tight">
                    {userProfile?.displayName || currentUser.displayName || t('runner', 'Runner')}
                  </div>
                  <div className="type-footnote text-slate-400 flex items-center gap-1.5 mt-0.5">
                    {currentUser.isAnonymous ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 type-caption-2-semibold border border-amber-500/30">
                        {t('guest_account', 'GUEST ACCOUNT')}
                      </span>
                    ) : (
                      <span className="text-slate-300 font-mono type-footnote truncate max-w-[170px]">
                        {currentUser.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="type-caption-2-semibold uppercase text-slate-400">{t('career_level', 'Career Level')}</div>
                <div className="type-title-2 text-[#CCFF00] leading-none mt-0.5">
                  LV {userProfile?.careerStats?.level || 1}
                </div>
              </div>
            </div>

            {/* Career Stats Grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#060913]/80 p-2 rounded-xl border border-white/10 text-center">
                <div className="flex items-center justify-center gap-1 type-caption-2-semibold text-slate-400 uppercase">
                  <GaugeIcon className="w-3 h-3 text-[#CCFF00]" />
                  {t('speed', 'Speed')}
                </div>
                <div className="type-title-3 font-mono-num text-white mt-0.5">
                  {userProfile?.careerStats?.highestWpm || 0}
                </div>
              </div>

              <div className="bg-[#060913]/80 p-2 rounded-xl border border-white/10 text-center">
                <div className="flex items-center justify-center gap-1 type-caption-2-semibold text-slate-400 uppercase">
                  <ZapIcon className="w-3 h-3 text-sky-400" />
                  {t('accuracy', 'Accuracy')}
                </div>
                <div className="type-title-3 font-mono-num text-white mt-0.5">
                  {userProfile?.careerStats?.avgAccuracy || 100}%
                </div>
              </div>

              <div className="bg-[#060913]/80 p-2 rounded-xl border border-white/10 text-center">
                <div className="flex items-center justify-center gap-1 type-caption-2-semibold text-slate-400 uppercase">
                  <TrophyIcon className="w-3 h-3 text-amber-400" />
                  {t('wins', 'Wins')}
                </div>
                <div className="type-title-3 font-mono-num text-white mt-0.5">
                  {userProfile?.careerStats?.racesWon || 0}
                </div>
              </div>
            </div>

            <div className="bg-[#060913]/60 py-2.5 px-3 rounded-xl border border-white/8 type-subhead text-slate-300 flex items-center justify-between">
              <span>{t('total_races', 'Total Races:')}</span>
              <strong className="text-white font-mono type-subhead-semibold">{userProfile?.careerStats?.totalRaces || 0}</strong>
            </div>

            <div className="bg-[#060913]/60 py-2.5 px-3 rounded-xl border border-white/8 type-subhead text-slate-300 flex items-center justify-between">
              <span>{t('total_score', 'Total Score:')}</span>
              <strong className="text-[#CCFF00] font-mono type-subhead-semibold">{userProfile?.careerStats?.totalScore || 0} pts</strong>
            </div>

            <div className="bg-[#060913]/60 py-2.5 px-3 rounded-xl border border-white/8 type-subhead text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <AwardIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('achievements', 'Achievements')}:</span>
              </span>
              <strong className="text-white font-mono type-subhead-semibold">{userProfile?.unlockedAchievements?.length || 0} / 19</strong>
            </div>

            {/* Action Buttons: Edit Profile & Logout */}
            <div className="flex gap-2 pt-1.5">
              <button
                type="button"
                onClick={() => {
                  playButtonClick(soundEnabled);
                  setIsEditProfileOpen(true);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3.5 min-h-[38px] rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/12 text-slate-200 hover:text-white type-callout-semibold uppercase tracking-wider transition cursor-pointer active:scale-98"
              >
                <span>{t('edit_profile', 'Edit Profile')}</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3.5 min-h-[38px] rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 type-callout-semibold uppercase tracking-wider transition cursor-pointer active:scale-98"
              >
                <LogOutIcon className="w-3.5 h-3.5" />
                <span>{loading ? '...' : t('logout', 'Sign Out')}</span>
              </button>
            </div>
          </div>
        ) : (
          /* =================================================================== */
          /* VIEW 2: UN-AUTHENTICATED FLOW                                       */
          /* =================================================================== */
          <div>
            {/* iOS Segmented Control */}
            {!isResetMode && (
              <div className="relative pill-dock bg-[#060913]/90 p-1 rounded-xl border border-white/[0.08] flex items-center mb-3 gap-1.5">
                <div
                  className={`absolute top-1 bottom-1 w-[calc(50%-5px)] rounded-lg bg-[#CCFF00] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_2px_14px_rgba(204,255,0,0.35)] ${
                    tab === 'login' ? 'left-1' : 'left-[calc(50%+1px)]'
                  }`}
                />

                <button
                  type="button"
                  onClick={() => handleSwitchTab('login')}
                  className={`relative z-10 flex-1 py-1.5 min-h-[34px] type-callout-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none ${
                    tab === 'login' ? 'text-[#050811]' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t('login', 'Sign In')}
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchTab('register')}
                  className={`relative z-10 flex-1 py-1.5 min-h-[34px] type-callout-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none ${
                    tab === 'register' ? 'text-[#050811]' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t('register', 'Register')}
                </button>
              </div>
            )}

            {/* Inline Error & Success Feedback Banners */}
            {errorMsg && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 type-footnote flex items-start gap-2 animate-apple-in">
                <SolidDangerIcon className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span className="leading-snug">{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 type-footnote flex items-start gap-2 animate-apple-in">
                <SolidCheckCircleIcon className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <span className="leading-snug">{successMsg}</span>
              </div>
            )}

            {isResetMode ? (
              /* SUB-VIEW 1: ATUR ULANG KATA SANDI */
              <form onSubmit={handlePasswordResetSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-slate-400 type-subhead-semibold mb-1.5">
                    Email
                  </label>
                  <div className="relative flex items-center">
                    <SolidMailIcon className="w-4 h-4 absolute left-3 text-slate-500" />
                    <input
                      ref={resetEmailRef}
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="nama@domain.com"
                      required
                      className="w-full bg-[#060913]/90 border border-white/12 focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] rounded-xl pl-9 pr-3.5 py-2 min-h-[38px] type-callout text-white outline-none transition"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      playButtonClick(soundEnabled);
                      setIsResetMode(false);
                      setErrorMsg(null);
                    }}
                    className="flex-1 py-2 px-3.5 min-h-[38px] rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-slate-300 type-callout-semibold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <SolidArrowLeftIcon className="w-3.5 h-3.5" />
                    <span>{t('back', 'Back')}</span>
                  </button>

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="flex-1 py-2 px-3.5 min-h-[38px] rounded-xl bg-[#CCFF00] hover:bg-[#D4FF00] text-[#050811] type-callout-bold uppercase tracking-wider shadow-[0_2px_14px_rgba(204,255,0,0.35)] transition cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    {resetLoading ? '...' : t('send_link', 'Send Reset Link')}
                  </button>
                </div>
              </form>
            ) : tab === 'login' ? (
              /* SUB-VIEW 2: FORM MASUK */
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-slate-300 type-subhead-semibold mb-1.5">
                    Email
                  </label>
                  <div className="relative flex items-center">
                    <SolidMailIcon className="w-4 h-4 absolute left-3 text-slate-500" />
                    <input
                      ref={loginEmailRef}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@domain.com"
                      required
                      className="w-full bg-[#060913]/90 border border-white/12 focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] rounded-xl pl-9 pr-3.5 py-2 min-h-[38px] type-callout text-white outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-slate-300 type-subhead-semibold">
                      {t('password', 'Password')}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        playButtonClick(soundEnabled);
                        setIsResetMode(true);
                        setResetEmail(email);
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="type-footnote text-slate-400 hover:text-[#CCFF00] transition cursor-pointer"
                    >
                      {t('forgot_password', 'Forgot Password?')}
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <SolidLockIcon className="w-4 h-4 absolute left-3 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-[#060913]/90 border border-white/12 focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] rounded-xl pl-9 pr-9 py-2 min-h-[38px] type-callout text-white outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 text-slate-500 hover:text-slate-300"
                      title={showPassword ? 'Hide' : 'Show'}
                    >
                      {showPassword ? <SolidEyeClosedIcon className="w-4 h-4" /> : <SolidEyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Toggle */}
                <div className="flex items-center justify-between pt-0.5">
                  <span className="type-footnote text-slate-400">{t('remember_me', 'Remember me')}</span>
                  <button
                    type="button"
                    onClick={() => {
                      playButtonClick(soundEnabled);
                      setRememberMe(!rememberMe);
                    }}
                    className={`w-8 h-4.5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                      rememberMe ? 'bg-[#CCFF00]' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full bg-[#050811] shadow-sm transform transition-transform ${
                        rememberMe ? 'translate-x-3.5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Primary Button: "MASUK" */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full py-2 px-3.5 min-h-[40px] rounded-xl bg-[#CCFF00] hover:bg-[#D4FF00] text-[#050811] type-headline uppercase tracking-wider shadow-[0_2px_14px_rgba(204,255,0,0.3)] active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-[#050811] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>{t('login', 'Sign In')}</span>
                  )}
                </button>

                {/* Alternative Button: "Masuk Sebagai Tamu" */}
                <div className="pt-0.5">
                  <button
                    type="button"
                    onClick={handleGuestPlay}
                    disabled={loading}
                    className="w-full py-2 px-3.5 min-h-[38px] rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-300 hover:text-white type-callout-semibold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                  >
                    <SolidUserCircleIcon className="w-4 h-4 text-[#CCFF00]" />
                    <span>{t('guest_login', 'Play as Guest')}</span>
                  </button>
                </div>
              </form>
            ) : (
              /* SUB-VIEW 3: FORM DAFTAR */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {/* 1. Nama Pengguna */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-slate-300 type-subhead-semibold">
                      {t('username', 'Username')}
                    </label>
                    <span className="type-caption-2 text-slate-500 font-mono">
                      {displayName.length}/16
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <SolidUserIcon className="w-4 h-4 absolute left-3 text-slate-500" />
                    <input
                      ref={runnerTagRef}
                      type="text"
                      value={displayName}
                      onChange={handleRunnerTagChange}
                      placeholder={t('username', 'Username')}
                      maxLength={16}
                      required
                      className="w-full bg-[#060913]/90 border border-white/12 focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] rounded-xl pl-9 pr-3.5 py-2 min-h-[38px] type-callout text-white outline-none transition"
                    />
                  </div>
                </div>

                {/* 2. Email */}
                <div>
                  <label className="block text-slate-300 type-subhead-semibold mb-1.5">
                    Email
                  </label>
                  <div className="relative flex items-center">
                    <SolidMailIcon className="w-4 h-4 absolute left-3 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@domain.com"
                      required
                      className="w-full bg-[#060913]/90 border border-white/12 focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] rounded-xl pl-9 pr-3.5 py-2 min-h-[38px] type-callout text-white outline-none transition"
                    />
                  </div>
                </div>

                {/* 3 & 4. Kata Sandi & Konfirmasi Kata Sandi */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 type-footnote-semibold mb-1.5">
                      {t('password', 'Password')}
                    </label>
                    <div className="relative flex items-center">
                      <SolidLockIcon className="w-3.5 h-3.5 absolute left-2.5 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••"
                        required
                        className="w-full bg-[#060913]/90 border border-white/12 focus:border-[#CCFF00] rounded-xl pl-8 pr-6 py-2 min-h-[36px] type-footnote text-white outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-1.5 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <SolidEyeClosedIcon className="w-3 h-3" /> : <SolidEyeIcon className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 type-footnote-semibold mb-1.5">
                      {t('confirm_password', 'Confirm Password')}
                    </label>
                    <div className="relative flex items-center">
                      <SolidLockIcon className="w-3.5 h-3.5 absolute left-2.5 text-slate-500" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••"
                        required
                        className="w-full bg-[#060913]/90 border border-white/12 focus:border-[#CCFF00] rounded-xl pl-8 pr-6 py-2 min-h-[36px] type-footnote text-white outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-1.5 text-slate-500 hover:text-slate-300"
                      >
                        {showConfirmPassword ? <SolidEyeClosedIcon className="w-3 h-3" /> : <SolidEyeIcon className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 5. Pemilih Warna Jersei */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-slate-300 type-subhead-semibold">
                      {t('jersey_color', 'Jersey Color')}
                    </label>
                    <span className="type-footnote-semibold text-slate-400">
                      {ATHLETIC_JERSEY_COLORS.find((c) => c.hex === jerseyColor)?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#060913]/60 p-1.5 px-2.5 rounded-xl border border-white/[0.08]">
                    {ATHLETIC_JERSEY_COLORS.map((c) => {
                      const isSelected = jerseyColor === c.hex;
                      return (
                        <button
                          type="button"
                          key={c.id}
                          onClick={() => {
                            playButtonClick(soundEnabled);
                            setJerseyColor(c.hex);
                          }}
                          title={c.name}
                          className={`relative w-6 h-6 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center ${
                            isSelected
                              ? 'scale-110 ring-2 ring-white shadow-md'
                              : 'opacity-70 hover:opacity-100 hover:scale-105'
                          }`}
                          style={{ backgroundColor: c.hex }}
                        >
                          {isSelected && (
                            <SolidCheckCircleIcon className="w-3.5 h-3.5 text-[#050811]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Primary Button: "DAFTAR" */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full py-2 px-3.5 min-h-[40px] rounded-xl bg-[#CCFF00] hover:bg-[#D4FF00] text-[#050811] type-headline uppercase tracking-wider shadow-[0_2px_14px_rgba(204,255,0,0.3)] active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-[#050811] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>{t('register', 'Register')}</span>
                  )}
                </button>

                {/* Alternative Button: "Masuk Sebagai Tamu" */}
                <div className="pt-0.5">
                  <button
                    type="button"
                    onClick={handleGuestPlay}
                    disabled={loading}
                    className="w-full py-2 px-3.5 min-h-[38px] rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-300 hover:text-white type-callout-semibold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                  >
                    <SolidUserCircleIcon className="w-4 h-4 text-[#CCFF00]" />
                    <span>{t('guest_login', 'Play as Guest')}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Modal Sheet */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        currentUser={currentUser}
        userProfile={userProfile}
        soundEnabled={soundEnabled}
        onClose={() => setIsEditProfileOpen(false)}
        onProfileUpdated={(updatedProfile) => {
          onAuthSuccess?.(updatedProfile);
        }}
      />
    </div>
  );
};
