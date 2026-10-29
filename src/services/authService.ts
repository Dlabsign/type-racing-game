import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword as firebaseUpdatePassword,
  User,
  Unsubscribe
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from './firebase';
import {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  recordUserSession,
  logActivity,
  upsertLeaderboard,
  generateRandomBib,
  flushOfflineQueue
} from './firestoreService';
import { UserProfile } from '@/types/auth';
import { setAuthCookie, clearAuthCookie } from '@/utils/authCookies';

/**
 * Sign In with Email & Password (with Persistence toggle)
 */
export async function signInWithEmail(
  email: string,
  pass: string,
  rememberMe: boolean = true
): Promise<{ user: User; profile: UserProfile }> {
  if (typeof window !== 'undefined') {
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
    } catch (e) {
      console.warn('[AuthService] setPersistence notice:', e);
    }
  }

  const credential = await signInWithEmailAndPassword(auth, email.trim(), pass);
  const user = credential.user;

  // Set auth cookie
  setAuthCookie(user.uid, rememberMe);

  let profile = await getUserProfile(user.uid);
  if (!profile) {
    profile = await createUserProfile(user.uid, {
      displayName: user.displayName || email.split('@')[0],
      email: user.email,
      isAnonymous: false
    });
  }

  // Update session and log
  await recordUserSession(user.uid, 'LOGIN');
  logActivity(user.uid, 'LOGIN', 'Pengguna masuk dengan email dan kata sandi', {
    email: user.email,
    displayName: profile.displayName
  }).catch(console.warn);

  // Sync any offline items
  flushOfflineQueue().catch(console.warn);

  return { user, profile };
}

/**
 * Sends a password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Sign Up with Email, Password, and Custom Runner Details
 */
export async function signUpWithEmail(
  email: string,
  pass: string,
  displayName: string,
  jerseyColor: string = '#CCFF00'
): Promise<{ user: User; profile: UserProfile }> {
  const cleanName = displayName.trim() || email.split('@')[0];
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  const user = credential.user;

  // Set auth cookie
  setAuthCookie(user.uid, true);

  // Set Firebase Auth Display Name
  try {
    await updateProfile(user, { displayName: cleanName });
  } catch (err) {
    console.warn('[AuthService] updateProfile warning:', err);
  }

  const bibNumber = generateRandomBib();

  // Create full Firestore profile
  const profile = await createUserProfile(user.uid, {
    displayName: cleanName,
    email: user.email,
    isAnonymous: false,
    jerseyColor,
    bibNumber
  });

  // Initial leaderboard entry
  upsertLeaderboard({
    userId: user.uid,
    displayName: cleanName,
    highestWpm: 0,
    careerScore: 0,
    jerseyColor
  }).catch(console.warn);

  // Log activity
  logActivity(user.uid, 'LOGIN', 'Pendaftaran akun baru berhasil', {
    method: 'EMAIL',
    displayName: cleanName,
    bibNumber
  }).catch(console.warn);

  // Sync offline queue
  flushOfflineQueue().catch(console.warn);

  return { user, profile };
}

/**
 * Anonymous Guest Sign In for instant zero-friction play
 */
export async function signInGuest(): Promise<{ user: User; profile: UserProfile }> {
  const credential = await signInAnonymously(auth);
  const user = credential.user;

  // Set auth cookie for guest session
  setAuthCookie(user.uid, false);

  let profile = await getUserProfile(user.uid);
  if (!profile) {
    const bibNumber = generateRandomBib();
    const guestName = `Tamu #${bibNumber}`;
    try {
      await updateProfile(user, { displayName: guestName });
    } catch {}

    profile = await createUserProfile(user.uid, {
      displayName: guestName,
      email: null,
      isAnonymous: true,
      jerseyColor: '#CCFF00',
      bibNumber
    });

    upsertLeaderboard({
      userId: user.uid,
      displayName: guestName,
      highestWpm: 0,
      careerScore: 0,
      jerseyColor: '#CCFF00'
    }).catch(console.warn);
  }

  await recordUserSession(user.uid, 'LOGIN');
  logActivity(user.uid, 'LOGIN', 'Pengguna masuk sebagai tamu', {
    method: 'ANONYMOUS',
    displayName: profile.displayName
  }).catch(console.warn);

  flushOfflineQueue().catch(console.warn);

  return { user, profile };
}

/**
 * Sign Out player gracefully
 */
export async function signOutUser(): Promise<void> {
  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      await recordUserSession(currentUser.uid, 'LOGOUT');
      await logActivity(currentUser.uid, 'LOGOUT', 'Pengguna keluar dari akun', {
        displayName: currentUser.displayName || 'Pengguna'
      });
    } catch (err) {
      console.warn('[AuthService] Logout activity logging error:', err);
    }
  }

  // Clear auth cookie immediately
  clearAuthCookie();

  await firebaseSignOut(auth);
}

/**
 * Subscribes to auth state changes and hydrates player profile from Firestore
 */
export function subscribeToAuthState(
  callback: (user: User | null, profile: UserProfile | null) => void
): Unsubscribe {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Ensure cookie is in sync
      setAuthCookie(user.uid, true);

      try {
        let profile = await getUserProfile(user.uid);
        if (!profile) {
          profile = await createUserProfile(user.uid, {
            displayName: user.displayName || (user.isAnonymous ? 'Tamu' : user.email?.split('@')[0] || 'Pelari'),
            email: user.email,
            isAnonymous: user.isAnonymous
          });
        }
        callback(user, profile);
      } catch (err) {
        console.warn('[AuthService] Hydrate profile error in onAuthStateChanged:', err);
        callback(user, null);
      }
    } else {
      clearAuthCookie();
      callback(null, null);
    }
  });
}

/**
 * Uploads user profile picture to Firebase Storage and returns download URL.
 */
export async function uploadProfilePicture(userId: string, file: File): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'webp';
  const storageRef = ref(storage, `profile_pictures/${userId}.${fileExt}`);

  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type || 'image/webp'
  });

  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}

/**
 * Re-authenticates user with current password, then updates to new password.
 */
export async function updateUserSecurityPassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.email) {
    throw new Error('Sesi tidak valid atau email tidak ditemukan.');
  }

  // 1. Re-authenticate
  const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
  await reauthenticateWithCredential(currentUser, credential);

  // 2. Update to new password
  await firebaseUpdatePassword(currentUser, newPassword);

  // 3. Log security event
  logActivity(currentUser.uid, 'PROFILE_UPDATED', 'Pengguna memperbarui kata sandi', {
    method: 'PASSWORD_CHANGE'
  }).catch(console.warn);
}

/**
 * Updates full profile credentials (displayName, jerseyColor, photoURL) across
 * Firebase Auth, Firestore users collection, and leaderboards.
 */
export async function updateUserFullProfile(
  userId: string,
  params: {
    displayName?: string;
    jerseyColor?: string;
    photoURL?: string;
  }
): Promise<UserProfile> {
  const currentUser = auth.currentUser;
  const cleanName = params.displayName?.trim();

  // 1. Update Firebase Auth Profile
  if (currentUser) {
    const authUpdatePayload: { displayName?: string; photoURL?: string } = {};
    if (cleanName) authUpdatePayload.displayName = cleanName;
    if (params.photoURL) authUpdatePayload.photoURL = params.photoURL;

    if (Object.keys(authUpdatePayload).length > 0) {
      await updateProfile(currentUser, authUpdatePayload);
    }
  }

  // 2. Update Cloud Firestore users/{userId}
  const firestorePayload: Partial<UserProfile> = {};
  if (cleanName) firestorePayload.displayName = cleanName;
  if (params.jerseyColor) firestorePayload.jerseyColor = params.jerseyColor;
  if (params.photoURL) {
    firestorePayload.photoURL = params.photoURL;
    firestorePayload.avatarUrl = params.photoURL;
  }

  await updateUserProfile(userId, firestorePayload);

  // 3. Sync with leaderboards
  const existingProfile = await getUserProfile(userId);
  if (existingProfile) {
    upsertLeaderboard({
      userId,
      displayName: cleanName || existingProfile.displayName,
      highestWpm: existingProfile.careerStats?.highestWpm || 0,
      careerScore: existingProfile.careerStats?.totalScore || 0,
      jerseyColor: params.jerseyColor || existingProfile.jerseyColor || '#CCFF00',
      avatarUrl: params.photoURL || existingProfile.avatarUrl || existingProfile.photoURL
    }).catch(console.warn);
  }

  // 4. Log profile update event
  logActivity(userId, 'PROFILE_UPDATED', 'Pengguna memperbarui data profil', {
    displayName: cleanName,
    jerseyColor: params.jerseyColor,
    hasPhoto: !!params.photoURL
  }).catch(console.warn);

  const updatedProfile = await getUserProfile(userId);
  if (!updatedProfile) {
    throw new Error('Gagal memuat profil setelah diperbarui.');
  }

  return updatedProfile;
}
