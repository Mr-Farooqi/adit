import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDb, getFirebaseAuth } from "@/lib/firebase";
import type { AppUser } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  profile: AppUser | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(getDb(), "users", uid));
  if (!snap.exists()) return null;
  return snap.data() as AppUser;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isFirebaseConfiguredSafe();

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(getFirebaseAuth(), async (u) => {
      setUser(u);
      setProfile(u ? await fetchProfile(u.uid) : null);
      setLoading(false);
    });
    return unsub;
  }, [configured]);

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
    await updateProfile(cred.user, { displayName: name });
    const profileData: AppUser = {
      uid: cred.user.uid,
      name,
      email,
      createdAt: Date.now(),
    };
    await setDoc(doc(getDb(), "users", cred.user.uid), profileData);
    setProfile(profileData);
  }, []);

  const logout = useCallback(async () => {
    await signOut(getFirebaseAuth());
  }, []);

  const refreshProfile = useCallback(async () => {
    const current = getFirebaseAuth().currentUser;
    setProfile(current ? await fetchProfile(current.uid) : null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, configured, signIn, signUp, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function isFirebaseConfiguredSafe() {
  try {
    // Avoid throwing during SSR when env vars are placeholders.
    return (
      !!import.meta.env.VITE_FIREBASE_API_KEY &&
      !!import.meta.env.VITE_FIREBASE_PROJECT_ID &&
      !import.meta.env.VITE_FIREBASE_API_KEY!.startsWith("your-") &&
      !import.meta.env.VITE_FIREBASE_PROJECT_ID!.startsWith("your-")
    );
  } catch {
    return false;
  }
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
