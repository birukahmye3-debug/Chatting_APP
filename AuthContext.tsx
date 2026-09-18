import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, testConnection } from '../firebase/config';
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  updateUserPresence,
} from '../firebase/firestoreService';
import { UserProfile } from '../types/chat';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  setError: (err: string | null) => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (
    name: string,
    username: string,
    email: string,
    pass: string,
    photoURL?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateProfileData: (updates: Partial<UserProfile>) => Promise<void>;
  quickLoginDemoUser: (demoUser: 'alice' | 'bob' | 'charlie') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Test connection to Firestore on initialization as requested by Firebase skill
  useEffect(() => {
    testConnection();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          let profile = await getUserProfile(user.uid);
          if (!profile) {
            // First time Google or Demo user without profile yet
            const defaultUsername = (user.email?.split('@')[0] || `user_${user.uid.slice(0, 5)}`)
              .toLowerCase()
              .replace(/[^a-z0-9_]/g, '');

            profile = {
              id: user.uid,
              name: user.displayName || defaultUsername || 'User',
              username: defaultUsername,
              email: user.email || `${defaultUsername}@chatflow.app`,
              photoURL:
                user.photoURL ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${defaultUsername}`,
              bio: 'Hey there! I am using ChatFlow.',
              createdAt: new Date().toISOString(),
              lastSeen: new Date().toISOString(),
              isOnline: true,
            };
            await createUserProfile(profile);
          } else {
            // Update presence to online
            await updateUserPresence(user.uid, true);
          }
          setUserProfile(profile);
        } catch (err) {
          console.error('Failed to load user profile:', err);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Track online/offline visibility and unload
  useEffect(() => {
    if (!currentUser) return;

    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      updateUserPresence(currentUser.uid, isVisible).catch(() => {});
    };

    const handleBeforeUnload = () => {
      updateUserPresence(currentUser.uid, false).catch(() => {});
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentUser]);

  const loginWithGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to sign in with Google';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: unknown) {
      let msg = 'Failed to login with email.';
      if (err instanceof Error) {
        if (err.message.includes('auth/invalid-credential') || err.message.includes('auth/wrong-password')) {
          msg = 'Invalid email or password.';
        } else if (err.message.includes('auth/user-not-found')) {
          msg = 'No account found with this email.';
        } else if (err.message.includes('auth/operation-not-allowed')) {
          msg = 'Email/Password auth is not enabled in this Firebase project. You can use Google Sign-In or Demo accounts.';
        } else {
          msg = err.message;
        }
      }
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (
    name: string,
    username: string,
    email: string,
    pass: string,
    photoURL?: string
  ) => {
    setError(null);
    setLoading(true);
    try {
      const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      const userCred = await createUserWithEmailAndPassword(auth, email, pass);
      const uid = userCred.user.uid;

      const profile: UserProfile = {
        id: uid,
        name: name.trim(),
        username: cleanUsername,
        email: email.trim(),
        photoURL:
          photoURL ||
          `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername || uid}`,
        bio: 'Hey there! I am using ChatFlow.',
        createdAt: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        isOnline: true,
      };

      await createUserProfile(profile);
      setUserProfile(profile);
    } catch (err: unknown) {
      let msg = 'Failed to register account.';
      if (err instanceof Error) {
        if (err.message.includes('auth/email-already-in-use')) {
          msg = 'This email address is already registered.';
        } else if (err.message.includes('auth/weak-password')) {
          msg = 'Password should be at least 6 characters.';
        } else if (err.message.includes('auth/operation-not-allowed')) {
          msg = 'Email/Password registration is not enabled in this Firebase project. Use Google Sign-In or Demo accounts.';
        } else {
          msg = err.message;
        }
      }
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (currentUser) {
      try {
        await updateUserPresence(currentUser.uid, false);
      } catch {
        // ignore
      }
    }
    await signOut(auth);
    setUserProfile(null);
    setCurrentUser(null);
  };

  const updateProfileData = async (updates: Partial<UserProfile>) => {
    if (!currentUser || !userProfile) return;
    await updateUserProfile(currentUser.uid, updates);
    setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));
  };

  // Demo user helper: lets users test multi-client chatting seamlessly
  const quickLoginDemoUser = async (demoKey: 'alice' | 'bob' | 'charlie') => {
    setError(null);
    setLoading(true);
    const demoConfigs = {
      alice: {
        email: 'alice.chatflow@example.com',
        pass: 'ChatFlowPass123!',
        name: 'Alice Walker',
        username: 'alice',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
        bio: 'Design enthusiast & Telegram lover ✨',
      },
      bob: {
        email: 'bob.chatflow@example.com',
        pass: 'ChatFlowPass123!',
        name: 'Bob Martinez',
        username: 'bob',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        bio: 'Building real-time web applications 🚀',
      },
      charlie: {
        email: 'charlie.chatflow@example.com',
        pass: 'ChatFlowPass123!',
        name: 'Charlie Chen',
        username: 'charlie',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
        bio: 'Product manager & tech explorer 💡',
      },
    };

    const target = demoConfigs[demoKey];
    try {
      try {
        // Try sign in first
        await signInWithEmailAndPassword(auth, target.email, target.pass);
      } catch (signInErr: unknown) {
        const errCode = (signInErr as { code?: string })?.code || '';
        const errMsg = signInErr instanceof Error ? signInErr.message : '';
        // If not found or invalid credential (user doesn't exist yet), try create
        if (
          errCode === 'auth/user-not-found' ||
          errCode === 'auth/invalid-credential' ||
          errCode === 'auth/invalid-login-credentials' ||
          errMsg.includes('auth/user-not-found') ||
          errMsg.includes('auth/invalid-credential') ||
          errMsg.includes('INVALID_LOGIN_CREDENTIALS')
        ) {
          await registerWithEmail(
            target.name,
            target.username,
            target.email,
            target.pass,
            target.avatar
          );
        } else {
          throw signInErr;
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Demo switch failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        error,
        setError,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        updateProfileData,
        quickLoginDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
