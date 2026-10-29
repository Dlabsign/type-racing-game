'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { UserProfile } from '@/types/auth';
import { useI18n } from '@/i18n/I18nContext';
import {
  uploadProfilePicture,
  updateUserSecurityPassword,
  updateUserFullProfile
} from '@/services/authService';
import {
  playButtonClick,
  playModalClose,
  playAchievementChime,
  playWarningChime
} from '@/utils/audio';
import {
  SolidUserIcon,
  SolidLockIcon,
  SolidEyeIcon,
  SolidEyeClosedIcon,
  SolidCheckCircleIcon,
  SolidDangerIcon,
  CameraIcon,
  SolidArrowLeftIcon
} from './icons/Icons';

interface EditProfileModalProps {
  isOpen: boolean;
  currentUser: User | null;
  userProfile: UserProfile | null;
  soundEnabled?: boolean;
  onClose: () => void;
  onProfileUpdated: (updatedProfile: UserProfile) => void;
}

const ATHLETIC_JERSEY_COLORS = [
  { id: 'volt', name: 'Hijau Neon', hex: '#CCFF00' },
  { id: 'cyan', name: 'Biru Sian', hex: '#06B6D4' },
  { id: 'amber', name: 'Jingga', hex: '#F59E0B' },
  { id: 'crimson', name: 'Merah Kirmizi', hex: '#EF4444' }
];

const EditProfileModalContent: React.FC<Omit<EditProfileModalProps, 'isOpen'>> = ({
  currentUser,
  userProfile,
  soundEnabled = true,
  onClose,
  onProfileUpdated
}) => {
  const { t } = useI18n();
  // Public Identity States - Initialized directly from props without effect
  const [displayName, setDisplayName] = useState(
    () => userProfile?.displayName || currentUser?.displayName || ''
  );
  const [jerseyColor, setJerseyColor] = useState(
    () => userProfile?.jerseyColor || '#CCFF00'
  );

  // Photo Avatar States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    () => userProfile?.avatarUrl || userProfile?.photoURL || currentUser?.photoURL || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Security & Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Async States & Inline Feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Clean up Object URL on unmount or file change
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Keyboard Ergonomics: [ESC] dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        e.preventDefault();
        playModalClose(soundEnabled);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading, soundEnabled, onClose]);

  const handleClose = () => {
    if (loading) return;
    playModalClose(soundEnabled);
    onClose();
  };

  // Image File Selection with Instant Local Preview
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Ukuran berkas foto maksimal 5 MB.');
      playWarningChime(soundEnabled);
      return;
    }

    // Validate type
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setErrorMsg('Format berkas harus PNG, JPEG, atau WebP.');
      playWarningChime(soundEnabled);
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setErrorMsg(null);
    playButtonClick(soundEnabled);
  };

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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Validation 1: Username
    const cleanName = displayName.trim();
    if (cleanName.length < 3) {
      setErrorMsg('Nama pengguna minimal 3 karakter.');
      playWarningChime(soundEnabled);
      return;
    }

    // Validation 2: Password
    const isUpdatingPassword = newPassword.length > 0 || currentPassword.length > 0;
    if (isUpdatingPassword) {
      if (!currentPassword) {
        setErrorMsg('Masukkan kata sandi saat ini.');
        playWarningChime(soundEnabled);
        return;
      }
      if (newPassword.length < 6) {
        setErrorMsg('Kata sandi baru minimal 6 karakter.');
        playWarningChime(soundEnabled);
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('Konfirmasi kata sandi baru tidak cocok.');
        playWarningChime(soundEnabled);
        return;
      }
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Step 1: Update Password if requested
      if (isUpdatingPassword) {
        await updateUserSecurityPassword(currentPassword, newPassword);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }

      // Step 2: Upload new profile picture to Firebase Storage if selected
      let uploadedPhotoUrl = previewUrl && !previewUrl.startsWith('blob:') ? previewUrl : undefined;
      if (selectedFile) {
        uploadedPhotoUrl = await uploadProfilePicture(currentUser.uid, selectedFile);
      }

      // Step 3: Update Full User Profile in Auth, Firestore, and Leaderboard
      const updatedProfile = await updateUserFullProfile(currentUser.uid, {
        displayName: cleanName,
        jerseyColor,
        photoURL: uploadedPhotoUrl
      });

      playAchievementChime(soundEnabled);
      setSuccessMsg('Profil berhasil diperbarui.');
      onProfileUpdated(updatedProfile);

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: unknown) {
      playWarningChime(soundEnabled);
      const authErr = err as { code?: string; message?: string };
      let msg = 'Gagal memperbarui profil. Coba lagi.';

      if (
        authErr.code === 'auth/wrong-password' ||
        authErr.code === 'auth/invalid-credential'
      ) {
        msg = 'Kata sandi saat ini salah.';
      } else if (authErr.code === 'auth/weak-password') {
        msg = 'Kata sandi baru minimal 6 karakter.';
      } else if (authErr.code === 'auth/requires-recent-login') {
        msg = 'Sesi telah berakhir. Silakan masuk kembali.';
      } else if (authErr.message) {
        msg = authErr.message;
      }

      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#050811]/85 backdrop-blur-md flex items-center justify-center p-[clamp(0.75rem,3vw,1.5rem)] select-none animate-apple-in"
      onClick={handleClose}
    >
      {/* Swiss Minimalist Modal Container (14px-18px padding) */}
      <div
        className="relative swiss-card w-[min(92vw,480px)] p-3.5 sm:p-4.5 shadow-[0_20px_50px_rgba(0,0,0,0.85)] text-white overflow-y-auto overscroll-contain max-h-[88dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glow Ambient */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-24 bg-[#CCFF00]/15 rounded-full blur-2xl pointer-events-none" />

        {/* 1. Top Navigation Header */}
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/[0.08]">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition cursor-pointer type-callout-semibold py-1.5 px-2 -ml-1 disabled:opacity-50 min-h-[36px]"
          >
            <SolidArrowLeftIcon className="w-3.5 h-3.5" />
            <span>{t('cancel', 'Cancel')}</span>
          </button>

          <h2 className="type-title-2 text-white uppercase leading-none text-center">
            {t('edit_profile', 'Edit Profile')}
          </h2>

          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={loading}
            className="px-3.5 py-1.5 min-h-[36px] rounded-xl bg-[#CCFF00] hover:bg-[#D4FF00] text-[#050811] type-callout-bold uppercase tracking-wider shadow-[0_2px_14px_rgba(204,255,0,0.35)] transition cursor-pointer active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-[#050811] border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{t('save', 'Save')}</span>
            )}
          </button>
        </div>

        {/* Inline Feedback Alerts */}
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

        <form onSubmit={handleSaveProfile} className="space-y-3.5">
          {/* 2. Interactive Avatar Stage (Top Center) */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative group">
              {/* Circular Avatar Container (80px diameter) */}
              <div
                className="w-20 h-20 rounded-full border-2 border-white/20 overflow-hidden flex items-center justify-center bg-[#060913] shadow-[0_8px_24px_rgba(0,0,0,0.6)] relative"
                style={{ borderColor: jerseyColor }}
              >
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt="Foto Profil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex flex-col items-center justify-center font-fredoka font-bold text-xl text-[#050811]"
                    style={{ backgroundColor: jerseyColor }}
                  >
                    <span>#{userProfile?.bibNumber || '01'}</span>
                  </div>
                )}
              </div>

              {/* Floating Camera Badge */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Ubah Foto Profil"
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#CCFF00] hover:bg-[#D4FF00] text-[#050811] shadow-[0_2px_10px_rgba(204,255,0,0.4)] flex items-center justify-center cursor-pointer transition active:scale-95 border-2 border-[#0F172A]"
              >
                <CameraIcon className="w-3.5 h-3.5 stroke-[2.2]" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            {/* Quick-select Athletic Jersey Swatches */}
            <div className="mt-2.5 flex items-center gap-2 bg-black/30 px-2.5 py-1 rounded-xl border border-white/[0.08]">
              <span className="type-caption-2-semibold text-slate-400 mr-0.5">
                {t('jersey_color', 'Jersey')}:
              </span>
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
                    className={`w-5 h-5 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                      isSelected
                        ? 'scale-115 ring-2 ring-white shadow-md'
                        : 'opacity-70 hover:opacity-100 hover:scale-110'
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

          {/* 3. Inset Group 1: Informasi Publik (Swiss Inset Grouped List) */}
          <div>
            <div className="type-footnote-semibold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
              {t('public_info', 'Public Profile')}
            </div>

            <div className="bg-[#060913]/90 rounded-xl border border-white/[0.08] overflow-hidden">
              {/* Row 1: Runner Tag / Username */}
              <div className="py-2.5 px-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-slate-300 type-subhead-semibold shrink-0">
                  <SolidUserIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t('username', 'Username')}</span>
                </div>
                <div className="flex-1 flex items-center justify-end gap-2">
                  <input
                    type="text"
                    value={displayName}
                    onChange={handleRunnerTagChange}
                    maxLength={16}
                    placeholder={t('username', 'Username')}
                    required
                    className="w-full max-w-[200px] text-right bg-transparent text-white type-callout-semibold outline-none focus:text-[#CCFF00] placeholder:text-slate-600 transition"
                  />
                  <span className="type-caption-2 font-mono text-slate-600 shrink-0">
                    {displayName.length}/16
                  </span>
                </div>
              </div>

              {/* Hairline Divider */}
              <div className="h-[1px] bg-white/[0.08] ml-8" />

              {/* Row 2: Email (Read-Only Status) */}
              <div className="py-2.5 px-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-slate-300 type-subhead-semibold shrink-0">
                  <SolidLockIcon className="w-3 h-3 text-slate-500" />
                  <span>Email</span>
                </div>
                <div className="text-right font-mono type-footnote text-slate-400 truncate max-w-[230px]">
                  {currentUser?.email || 'Guest (No Email)'}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Inset Group 2: Keamanan Akun (Update Password) */}
          {!currentUser?.isAnonymous && (
            <div>
              <div className="type-footnote-semibold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
                {t('account_security', 'Account Security')}
              </div>

              <div className="bg-[#060913]/90 rounded-xl border border-white/[0.08] overflow-hidden">
                {/* Row 1: Sandi Saat Ini */}
                <div className="py-2.5 px-3.5 flex items-center justify-between gap-3">
                  <label className="text-slate-300 type-subhead-semibold shrink-0">
                    {t('current_password', 'Current Password')}
                  </label>
                  <div className="flex-1 flex items-center justify-end relative max-w-[220px]">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••"
                      className="w-full text-right bg-transparent text-white type-callout outline-none focus:text-[#CCFF00] placeholder:text-slate-600 pr-6 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-0 text-slate-500 hover:text-slate-300 transition"
                    >
                      {showCurrentPass ? (
                        <SolidEyeClosedIcon className="w-3 h-3" />
                      ) : (
                        <SolidEyeIcon className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Hairline Divider */}
                <div className="h-[1px] bg-white/[0.08] ml-4" />

                {/* Row 2: Sandi Baru */}
                <div className="py-2.5 px-3.5 flex items-center justify-between gap-3">
                  <label className="text-slate-300 type-subhead-semibold shrink-0">
                    {t('new_password', 'New Password')}
                  </label>
                  <div className="flex-1 flex items-center justify-end relative max-w-[220px]">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 6 chars"
                      className="w-full text-right bg-transparent text-white type-callout outline-none focus:text-[#CCFF00] placeholder:text-slate-600 pr-6 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-0 text-slate-500 hover:text-slate-300 transition"
                    >
                      {showNewPass ? (
                        <SolidEyeClosedIcon className="w-3 h-3" />
                      ) : (
                        <SolidEyeIcon className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Hairline Divider */}
                <div className="h-[1px] bg-white/[0.08] ml-4" />

                {/* Row 3: Konfirmasi Sandi Baru */}
                <div className="py-2.5 px-3.5 flex items-center justify-between gap-3">
                  <label className="text-slate-300 type-subhead-semibold shrink-0">
                    {t('confirm_new_password', 'Confirm Password')}
                  </label>
                  <div className="flex-1 flex items-center justify-end relative max-w-[220px]">
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••"
                      className="w-full text-right bg-transparent text-white type-callout outline-none focus:text-[#CCFF00] placeholder:text-slate-600 pr-6 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-0 text-slate-500 hover:text-slate-300 transition"
                    >
                      {showConfirmPass ? (
                        <SolidEyeClosedIcon className="w-3 h-3" />
                      ) : (
                        <SolidEyeIcon className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <p className="mt-1.5 px-1 type-caption-2 text-slate-500 leading-snug max-w-[65ch]">
                {t('empty_pass_hint', 'Leave password empty if only updating profile.')}
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  ...props
}) => {
  if (!isOpen) return null;
  return (
    <EditProfileModalContent
      key={`${props.userProfile?.uid || 'guest'}_open`}
      {...props}
    />
  );
};
