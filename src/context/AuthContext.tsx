import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export type UserRole = 
  | 'SuperAdmin' 
  | 'Captain' 
  | 'Secretary' 
  | 'Treasurer' 
  | 'Kagawad' 
  | 'Lupon' 
  | 'Tanod' 
  | 'BHW' 
  | 'SKOfficial' 
  | 'DRRMOfficer' 
  | 'Resident';

export type Department = 'Administration' | 'Justice' | 'Health' | 'Youth' | 'Resident';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  department: Department;
  isApproved: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (docSnapshot) => {
      console.log(`[AUTH_CONTEXT] Profile snapshot received for ${user.uid}`);
      if (docSnapshot.exists()) {
        setProfile(docSnapshot.data() as UserProfile);
      } else {
        console.warn(`[AUTH_CONTEXT] Profile document not found for active user ${user.uid}. Waiting for registration...`);
      }
      setLoading(false);
    }, (error) => {
      console.error("[AUTH_CONTEXT] Sync Failure:", error.code, error.message);
      // In long-polling mode, we might get transient errors
      if (error.code === 'permission-denied') {
        console.error("[AUTH_CONTEXT] SECURITY_BLOCK: Self-profile access denied.");
      }
      // Don't keep loading forever if we error out
      setLoading(false);
    });

    return () => unsubscribeProfile();
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
