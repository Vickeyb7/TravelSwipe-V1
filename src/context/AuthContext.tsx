import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile } from '../types';
import { initialProfile } from '../utils/data';
import { DEFAULT_HUMAN_AVATAR, getEmailVectorAvatar, generateSvgDataUriForEmail } from '../utils/avatars';
import { sanitizeForFirestore } from '../utils/sanitize';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithInstagram: (handle?: string, pass?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfilePreferences: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_STORAGE_KEY = 'tripswipe_guest_profile';

const loadGuestProfile = (): UserProfile => {
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...initialProfile,
        ...parsed,
        // Default to human vector avatar if not set
        avatarUrl: parsed.avatarUrl || DEFAULT_HUMAN_AVATAR,
        name: parsed.name && parsed.name !== 'Aarav Sharma' ? parsed.name : 'Traveller',
        isGuest: true,
      };
    }
  } catch (e) {
    console.warn('Failed to load guest profile from localStorage:', e);
  }
  return { ...initialProfile, avatarUrl: DEFAULT_HUMAN_AVATAR, name: 'Traveller', isGuest: true };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => loadGuestProfile());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Load or create Firestore user profile
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);
          const guestData = loadGuestProfile();
          const userEmail = user.email || '';
          const emailBasedAvatar = generateSvgDataUriForEmail(userEmail, user.displayName || undefined);

          if (snap.exists()) {
            const data = snap.data();
            // If user hasn't explicitly set up their profile pic, make it same as their email id
            const finalAvatar =
              data.avatarUrl && data.avatarUrl.trim() !== ''
                ? data.avatarUrl
                : emailBasedAvatar;

            setUserProfile({
              ...initialProfile,
              name: user.displayName || data.name || user.email?.split('@')[0] || 'Traveller',
              email: user.email || '',
              ...data,
              avatarUrl: finalAvatar,
              isGuest: false,
            });
          } else {
            // When somebody signs in using Gmail or Instagram without prior pic, make profile pic same as email ID
            const initialAvatar = emailBasedAvatar;

            const newProf: UserProfile = {
              ...initialProfile,
              ...guestData,
              name: user.displayName || user.email?.split('@')[0] || 'Traveller',
              email: user.email || '',
              tripsCount: 0,
              level: 1,
              badge: 'Explorer',
              avatarUrl: initialAvatar,
              isGuest: false,
            };
            await setDoc(
              userDocRef,
              sanitizeForFirestore({
                uid: user.uid,
                name: newProf.name || 'Traveller',
                email: newProf.email || '',
                level: newProf.level || 1,
                badge: newProf.badge || 'Explorer',
                packingStyle: newProf.packingStyle || 'Balanced',
                packingTags: newProf.packingTags || [],
                luggageDefault: newProf.luggageDefault || '',
                defaultBudget: newProf.defaultBudget || '',
                avatarUrl: newProf.avatarUrl || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              })
            );
            setUserProfile(newProf);
          }
        } catch (err) {
          console.error('Error fetching user profile from Firestore:', err);
          const userEmail = user.email || '';
          setUserProfile((prev) => ({
            ...(prev || initialProfile),
            name: user.displayName || user.email?.split('@')[0] || 'Traveller',
            email: user.email || '',
            avatarUrl: getEmailVectorAvatar(userEmail, user.displayName || undefined),
            isGuest: false,
          }));
        }
      } else {
        // Reset to guest profile
        setUserProfile(loadGuestProfile());
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signupWithEmail = async (email: string, pass: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (name && cred.user) {
      await updateProfile(cred.user, { displayName: name });
    }
    try {
      const guestData = loadGuestProfile();
      const userDocRef = doc(db, 'users', cred.user.uid);
      await setDoc(
        userDocRef,
        sanitizeForFirestore({
          uid: cred.user.uid,
          name: name || email.split('@')[0] || 'Traveller',
          email: email,
          level: 1,
          badge: 'Explorer',
          packingStyle: guestData.packingStyle || 'Balanced',
          packingTags: guestData.packingTags || [],
          luggageDefault: guestData.luggageDefault || '',
          defaultBudget: guestData.defaultBudget || '',
          avatarUrl: guestData.avatarUrl || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${cred.user.uid}`);
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const loginWithInstagram = async (handle?: string, pass?: string) => {
    if (handle && pass) {
      const clean = handle.replace(/[^a-zA-Z0-9._]/g, '').toLowerCase() || 'traveler';
      const instaEmail = `${clean}@instagram.tripswipe.app`;
      try {
        await signInWithEmailAndPassword(auth, instaEmail, pass);
      } catch (err: any) {
        if (
          err.code === 'auth/user-not-found' ||
          err.code === 'auth/invalid-credential' ||
          err.message?.includes('user-not-found')
        ) {
          // Auto create linked instagram account
          await signupWithEmail(instaEmail, pass, `@${clean}`);
        } else {
          throw err;
        }
      }
      return;
    }

    // Popup OAuth flow
    try {
      const res = await fetch('/api/auth/instagram/url');
      const data = await res.json();
      if (data.url) {
        window.open(data.url, 'instagram_oauth', 'width=600,height=700');
      }
    } catch (e) {
      console.warn('Instagram popup launch error:', e);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(loadGuestProfile());
  };

  const updateUserProfilePreferences = async (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const updated = { ...(prev || initialProfile), ...updates };
      // Save locally for guest users
      try {
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save to localStorage:', e);
      }
      return updated;
    });

    if (currentUser) {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const payload = sanitizeForFirestore({
          ...updates,
          updatedAt: new Date().toISOString(),
        });
        await setDoc(userDocRef, payload, { merge: true });
      } catch (err) {
        console.warn('Failed to sync profile update to Firestore:', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        loginWithInstagram,
        logout,
        updateUserProfilePreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
