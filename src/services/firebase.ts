import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

export const firebaseConfig = {
  apiKey: "AIzaSyBeFBuLe2_z4Ws7wV2osBvNiZbYbcgltzo",
  authDomain: "woikerja.firebaseapp.com",
  projectId: "woikerja",
  storageBucket: "woikerja.firebasestorage.app",
  messagingSenderId: "92213075877",
  appId: "1:92213075877:web:3ee3fa4a96f90da5ac924c",
  measurementId: "G-TTVL43SXSY"
};

// Initialize Firebase App safely (singleton pattern)
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth, Firestore & Storage
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

// Safe browser-only Analytics instance
let analyticsInstance: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        analyticsInstance = getAnalytics(app);
      }
    })
    .catch((err) => {
      console.warn('[Firebase Analytics] Not supported in current environment:', err);
    });
}

export const getAnalyticsInstance = (): Analytics | null => analyticsInstance;
export { analyticsInstance as analytics };
