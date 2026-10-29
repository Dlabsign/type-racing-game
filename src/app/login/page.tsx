'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { StadiumPerspectiveBg } from '@/components/StadiumPerspectiveBg';
import {
  signInWithEmail,
  signUpWithEmail,
  signInGuest,
  resetPassword
} from '@/services/authService';
import { getAuthCookie } from '@/utils/authCookies';
import { playButtonClick, playFanfare, playWarningChime } from '@/utils/audio';
import {
  SolidUserIcon,
  SolidMailIcon,
  SolidLockIcon,
  SolidEyeIcon,
  SolidEyeClosedIcon,
  SolidUserCircleIcon,
  SolidCheckCircleIcon,
  SolidDangerIcon,
  SolidArrowLeftIcon
} from '@/components/icons/Icons';
import { I18nProvider, useI18n } from '@/i18n/I18nContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

type AuthTab = 'login' | 'register';

const ATHLETIC_JERSEY_COLORS = [
  { id: 'volt', name: 'Hijau Neon', hex: '#CCFF00' },
  { id: 'cyan', name: 'Biru Sian', hex: '#06B6D4' },
  { id: 'amber', name: 'Jingga', hex: '#F59E0B' },
  { id: 'crimson', name: 'Merah Kirmizi', hex: '#EF4444' }
];

function LoginContent() {
  const { t } = useI18n();
  const router = useRouter();
  const [tab, setTab] = useState<AuthTab>('login');

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

  // Check if already authenticated via cookie
  useEffect(() => {
    if (getAuthCookie()) {
      router.replace('/');
    }
  }, [router]);

  // Auto-focus first input field when view changes
  useEffect(() => {
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
  }, [tab, isResetMode]);

  const handleSwitchTab = (newTab: AuthTab) => {
    playButtonClick(true);
    setTab(newTab);
    setIsResetMode(false);
    setErrorMsg(null);
    setSuccessMsg(null);
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
      playWarningChime(true);
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await signInWithEmail(email, password, rememberMe);
      playFanfare(true, true);
      setSuccessMsg('Berhasil masuk. Mengalihkan...');
      setTimeout(() => {
        router.replace('/');
      }, 500);
    } catch (err: unknown) {
      playWarningChime(true);
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
      playWarningChime(true);
      return;
    }
    if (!/^[a-zA-Z0-9 _.-]+$/.test(cleanTag)) {
      setErrorMsg('Nama pengguna hanya boleh memuat huruf, angka, titik, tanda hubung, atau garis bawah.');
      playWarningChime(true);
      return;
    }
    if (!cleanEmail) {
      setErrorMsg('Email wajib diisi.');
      playWarningChime(true);
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Kata sandi minimal 6 karakter.');
      playWarningChime(true);
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      playWarningChime(true);
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await signUpWithEmail(cleanEmail, password, cleanTag, jerseyColor);
      playFanfare(true, true);
      setSuccessMsg('Akun berhasil dibuat. Mengalihkan...');
      setTimeout(() => {
        router.replace('/');
      }, 500);
    } catch (err: unknown) {
      playWarningChime(true);
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
      setLoading(false);
    }
  };

  // Anonymous Guest Play Handler
  const handleGuestPlay = async () => {
    playButtonClick(true);
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await signInGuest();
      playFanfare(true, true);
      setSuccessMsg('Berhasil masuk sebagai tamu. Mengalihkan...');
      setTimeout(() => {
        router.replace('/');
      }, 400);
    } catch {
      playWarningChime(true);
      setErrorMsg('Gagal masuk sebagai tamu. Periksa koneksi internet Anda.');
      setLoading(false);
    }
  };

  // Password Reset Handler
  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setErrorMsg('Email wajib diisi.');
      playWarningChime(true);
      return;
    }

    setResetLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await resetPassword(resetEmail);
      playFanfare(true, true);
      setSuccessMsg(`Tautan atur ulang kata sandi telah dikirim ke ${resetEmail}.`);
      setTimeout(() => {
        setIsResetMode(false);
      }, 2500);
    } catch (err: unknown) {
      playWarningChime(true);
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

  return (
    <div className="relative w-full h-[100dvh] max-h-[100dvh] overflow-y-auto overflow-x-hidden flex flex-col items-center justify-start lg:justify-center p-2.5 sm:p-4 lg:p-6 bg-transparent text-white select-none animate-apple-in overscroll-contain">
      {/* 1. Perspective Athletic Stadium Vector Background */}
      <StadiumPerspectiveBg />

      {/* Top Floating Navigation Bar */}
      <div className="fixed top-3 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B101D]/80 backdrop-blur-xl border border-white/10 text-slate-300 hover:text-white transition cursor-pointer min-h-[44px]"
        >
          <SolidArrowLeftIcon className="w-3.5 h-3.5" />
          <span className="font-sports type-footnote-semibold">{t('back', 'Back')}</span>
        </button>
        <div className="pointer-events-auto">
          <LanguageSwitcher variant="compact" />
        </div>
      </div>

      {/* 2. Responsive 2-Column Split Container */}
      <div className="relative z-20 w-full max-w-5xl my-auto py-1 sm:py-2 flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-4 lg:gap-8 shrink-0">
        
        {/* =================================================================== */}
        {/* KOLOM KIRI: Logo Brand Type Racing                                  */}
        {/* =================================================================== */}
        <div className="w-full lg:w-1/2 flex items-center justify-center shrink-0 py-1 lg:py-0">
          <div className="relative flex flex-col items-center justify-center text-center">
            {/* Ambient Radial Glow */}
            <div className="absolute -inset-10 bg-[#CCFF00]/15 rounded-full blur-3xl pointer-events-none" />

            {/* Logo Lockup: TYPE + Speed Runner Streaks */}
            <div className="relative inline-flex items-center justify-center gap-2 sm:gap-2.5">
              <span className="font-display italic font-black type-hero leading-none text-white tracking-wide">
                TYPE
              </span>

              {/* Speed Runner with Streaks */}
              <div className="relative w-8 h-5 sm:w-11 sm:h-7 lg:w-14 lg:h-9 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 80 50">
                  <line x1="8" y1="16" x2="42" y2="16" stroke="#CCFF00" strokeWidth="4" strokeLinecap="round" />
                  <line x1="2" y1="26" x2="38" y2="26" stroke="#CCFF00" strokeWidth="4.8" strokeLinecap="round" />
                  <line x1="12" y1="36" x2="46" y2="36" stroke="#CCFF00" strokeWidth="4" strokeLinecap="round" />
                </svg>
                <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 ml-1 relative z-10" viewBox="0 0 24 24" fill="#CCFF00">
                  <circle cx="13.5" cy="5.5" r="2.5" />
                  <path d="M17.5 10.5c-.8 0-1.5-.4-1.9-1l-1.3-1.8c-.4-.5-1-.8-1.7-.8-.7 0-1.3.4-1.7.9l-2.4 3.2c-.3.4-.3.9 0 1.3l2.2 3.1v4.6c0 .6.4 1 1 1s1-.4 1-1v-4.2l-1.5-2.1 1.4-1.8 1.9 2.7c.4.6 1.1 1 1.9 1h3.1c.6 0 1-.4 1-1s-.4-1-1-1h-2.9l-1.8-2.6.8-1.1c.2-.3.6-.5 1-.5h3.4c.6 0 1-.4 1-1s-.4-1-1-1h-3.4zM6 13.8l2.5-3.3-1.6-1.6-2.5 3.3c-.4.5-.3 1.2.2 1.6.4.3 1 .2 1.4-.2z" />
                </svg>
              </div>
            </div>

            {/* RACING */}
            <div className="font-display italic font-black type-hero leading-none text-[#CCFF00] tracking-wide mt-1 drop-shadow-[0_0_24px_rgba(204,255,0,0.45)]">
              RACING
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* KOLOM KANAN: Form Autentikasi (Transparent Glassmorphic Card)       */}
        {/* =================================================================== */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <div className="relative w-full max-w-[390px] bg-black/45 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.65)] p-3.5 sm:p-4.5 mb-2 sm:mb-0">
            {/* Glow Accent */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-16 bg-[#CCFF00]/15 rounded-full blur-2xl pointer-events-none" />

            {/* Header when Reset Mode */}
            {isResetMode && (
              <div className="text-center pb-1.5 mb-2.5 border-b border-white/10">
                <h2 className="font-fredoka type-title-3 font-bold text-white tracking-wide uppercase leading-none">
                  {t('reset_password', 'Reset Password')}
                </h2>
              </div>
            )}

            {/* iOS Segmented Control */}
            {!isResetMode && (
              <div className="relative bg-black/40 p-1 rounded-2xl border border-white/10 flex items-center mb-2.5 backdrop-blur-md">
                {/* Sliding Pill */}
                <div
                  className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl bg-[#CCFF00] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_2px_14px_rgba(204,255,0,0.35)] ${
                    tab === 'login' ? 'left-1' : 'left-[calc(50%)]'
                  }`}
                />

                <button
                  type="button"
                  onClick={() => handleSwitchTab('login')}
                  className={`relative z-10 flex-1 py-1.5 font-fredoka type-callout-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none min-h-[34px] ${
                    tab === 'login' ? 'text-[#050811]' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t('login', 'Sign In')}
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchTab('register')}
                  className={`relative z-10 flex-1 py-1.5 font-fredoka type-callout-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none min-h-[34px] ${
                    tab === 'register' ? 'text-[#050811]' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t('register', 'Register')}
                </button>
              </div>
            )}

            {/* Inline Feedback Alerts */}
            {errorMsg && (
              <div className="mb-2.5 p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 type-footnote font-ui flex items-start gap-2 animate-apple-in">
                <SolidDangerIcon className="w-3.5 h-3.5 shrink-0 text-rose-400 mt-0.5" />
                <span className="leading-tight">{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-2.5 p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 type-footnote font-ui flex items-start gap-2 animate-apple-in">
                <SolidCheckCircleIcon className="w-3.5 h-3.5 shrink-0 text-emerald-400 mt-0.5" />
                <span className="leading-tight">{successMsg}</span>
              </div>
            )}

            {isResetMode ? (
              /* =================================================================== */
              /* VIEW 1: ATUR ULANG KATA SANDI (PASSWORD RESET)                      */
              /* =================================================================== */
              <form onSubmit={handlePasswordResetSubmit} className="space-y-2.5">
                <div>
                  <label className="block text-slate-300 font-ui type-subhead-semibold mb-1">
                    Email
                  </label>
                  <div className="relative flex items-center">
                    <SolidMailIcon className="w-3.5 h-3.5 absolute left-3 text-slate-500" />
                    <input
                      ref={resetEmailRef}
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="nama@domain.com"
                      required
                      className="w-full bg-black/40 border border-white/15 focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] rounded-xl pl-9 pr-3 py-1.5 sm:py-2 type-callout text-white font-ui outline-none transition placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      playButtonClick(true);
                      setIsResetMode(false);
                      setErrorMsg(null);
                    }}
                    className="flex-1 py-2 min-h-[38px] rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-slate-300 font-fredoka type-callout-semibold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <SolidArrowLeftIcon className="w-3.5 h-3.5" />
                    <span>{t('back', 'Back')}</span>
                  </button>

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="flex-1 py-2 min-h-[38px] rounded-xl bg-[#CCFF00] hover:bg-[#D4FF00] text-[#050811] font-fredoka type-callout-semibold uppercase tracking-wider shadow-[0_2px_14px_rgba(204,255,0,0.35)] transition cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    {resetLoading ? '...' : t('send_link', 'Send Reset Link')}
                  </button>
                </div>
              </form>
            ) : tab === 'login' ? (
              /* =================================================================== */
              /* VIEW 2: FORM MASUK (SIGN IN)                                        */
              /* =================================================================== */
              <form onSubmit={handleLoginSubmit} className="space-y-2">
                <div>
                  <label className="block text-slate-300 font-ui type-subhead-semibold mb-1">
                    Email
                  </label>
                  <div className="relative flex items-center">
                    <SolidMailIcon className="w-3.5 h-3.5 absolute left-3 text-slate-500" />
                    <input
                      ref={loginEmailRef}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@domain.com"
                      required
                      className="w-full bg-black/40 border border-white/15 focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] rounded-xl pl-9 pr-3 py-1.5 sm:py-2 type-callout text-white font-ui outline-none transition placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-ui type-subhead-semibold">
                      {t('password', 'Password')}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        playButtonClick(true);
                        setIsResetMode(true);
                        setResetEmail(email);
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="type-caption-1 font-ui text-slate-400 hover:text-[#CCFF00] transition cursor-pointer"
                    >
                      {t('forgot_password', 'Forgot Password?')}
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <SolidLockIcon className="w-3.5 h-3.5 absolute left-3 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-black/40 border border-white/15 focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] rounded-xl pl-9 pr-9 py-1.5 sm:py-2 type-callout text-white font-ui outline-none transition placeholder:text-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 text-slate-500 hover:text-slate-300 transition"
                      title={showPassword ? 'Hide' : 'Show'}
                    >
                      {showPassword ? <SolidEyeClosedIcon className="w-3.5 h-3.5" /> : <SolidEyeIcon className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Toggle */}
                <div className="flex items-center justify-between pt-0.5">
                  <span className="font-ui type-footnote text-slate-400">{t('remember_me', 'Remember me')}</span>
                  <button
                    type="button"
                    onClick={() => {
                      playButtonClick(true);
                      setRememberMe(!rememberMe);
                    }}
                    className={`w-8 h-4 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                      rememberMe ? 'bg-[#CCFF00]' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full bg-[#050811] shadow-sm transform transition-transform ${
                        rememberMe ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Primary Button: "MASUK" */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full py-2 min-h-[40px] rounded-xl bg-[#CCFF00] hover:bg-[#D4FF00] text-[#050811] font-fredoka type-headline uppercase tracking-wider shadow-[0_2px_14px_rgba(204,255,0,0.3)] active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-3.5 h-3.5 border-2 border-[#050811] border-t-transparent rounded-full animate-spin" />
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
                    className="w-full py-1.5 min-h-[36px] rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-300 hover:text-white font-fredoka type-callout-semibold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                  >
                    <SolidUserCircleIcon className="w-3.5 h-3.5 text-[#CCFF00]" />
                    <span>{t('guest_login', 'Play as Guest')}</span>
                  </button>
                </div>
              </form>
            ) : (
              /* =================================================================== */
              /* VIEW 3: FORM DAFTAR (SIGN UP - DIRECT REGISTRATION)                 */
              /* =================================================================== */
              <form onSubmit={handleRegisterSubmit} className="space-y-1.5 sm:space-y-2">
                {/* 1. Nama Pengguna */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-slate-300 font-ui type-subhead-semibold">
                      {t('username', 'Username')}
                    </label>
                    <span className="type-caption-2 text-slate-500 font-mono">
                      {displayName.length}/16
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <SolidUserIcon className="w-3.5 h-3.5 absolute left-3 text-slate-500" />
                    <input
                      ref={runnerTagRef}
                      type="text"
                      value={displayName}
                      onChange={handleRunnerTagChange}
                      placeholder={t('username', 'Username')}
                      maxLength={16}
                      required
                      className="w-full bg-black/40 border border-white/15 focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] rounded-xl pl-9 pr-3 py-1.5 sm:py-2 type-callout text-white font-ui outline-none transition placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* 2. Email */}
                <div>
                  <label className="block text-slate-300 font-ui type-subhead-semibold mb-0.5">
                    Email
                  </label>
                  <div className="relative flex items-center">
                    <SolidMailIcon className="w-3.5 h-3.5 absolute left-3 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@domain.com"
                      required
                      className="w-full bg-black/40 border border-white/15 focus:border-[#CCFF00] focus:ring-1 focus:ring-[#CCFF00] rounded-xl pl-9 pr-3 py-1.5 sm:py-2 type-callout text-white font-ui outline-none transition placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* 3 & 4. Kata Sandi & Konfirmasi Kata Sandi */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-ui type-caption-1-semibold mb-0.5">
                      {t('password', 'Password')}
                    </label>
                    <div className="relative flex items-center">
                      <SolidLockIcon className="w-3 h-3 absolute left-2.5 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••"
                        required
                        className="w-full bg-black/40 border border-white/15 focus:border-[#CCFF00] rounded-xl pl-7 pr-6 py-1.5 type-callout text-white outline-none placeholder:text-slate-500"
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
                    <label className="block text-slate-300 font-ui type-caption-1-semibold mb-0.5">
                      {t('confirm_password', 'Confirm Password')}
                    </label>
                    <div className="relative flex items-center">
                      <SolidLockIcon className="w-3 h-3 absolute left-2.5 text-slate-500" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••"
                        required
                        className="w-full bg-black/40 border border-white/15 focus:border-[#CCFF00] rounded-xl pl-7 pr-6 py-1.5 type-callout text-white outline-none placeholder:text-slate-500"
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
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-slate-300 font-ui type-subhead-semibold">
                      {t('jersey_color', 'Jersey Color')}
                    </label>
                    <span className="type-caption-1 font-fredoka font-semibold text-slate-400">
                      {ATHLETIC_JERSEY_COLORS.find((c) => c.hex === jerseyColor)?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-black/40 p-1.5 px-2.5 rounded-xl border border-white/15">
                    {ATHLETIC_JERSEY_COLORS.map((c) => {
                      const isSelected = jerseyColor === c.hex;
                      return (
                        <button
                          type="button"
                          key={c.id}
                          onClick={() => {
                            playButtonClick(true);
                            setJerseyColor(c.hex);
                          }}
                          title={c.name}
                          className={`relative w-5.5 h-5.5 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center ${
                            isSelected
                              ? 'scale-110 ring-2 ring-white shadow-md'
                              : 'opacity-70 hover:opacity-100 hover:scale-105'
                          }`}
                          style={{ backgroundColor: c.hex }}
                        >
                          {isSelected && (
                            <SolidCheckCircleIcon className="w-3 h-3 text-[#050811]" />
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
                  className="mt-2 w-full py-2 min-h-[40px] rounded-xl bg-[#CCFF00] hover:bg-[#D4FF00] text-[#050811] font-fredoka type-headline uppercase tracking-wider shadow-[0_2px_14px_rgba(204,255,0,0.3)] active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-3.5 h-3.5 border-2 border-[#050811] border-t-transparent rounded-full animate-spin" />
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
                    className="w-full py-1.5 min-h-[36px] rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-slate-300 hover:text-white font-fredoka type-callout-semibold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                  >
                    <SolidUserCircleIcon className="w-3.5 h-3.5 text-[#CCFF00]" />
                    <span>Masuk Sebagai Tamu</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <I18nProvider>
      <LoginContent />
    </I18nProvider>
  );
}
