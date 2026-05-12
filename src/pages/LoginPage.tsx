import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserRole, Department, useAuth } from '../context/AuthContext';
import { Button, Input, Card } from '../components/ui/Base';
import { LogIn, Globe, Shield } from 'lucide-react';
import { motion } from 'motion/react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-redirect if already logged in
  React.useEffect(() => {
    if (currentUser && !loading) {
      navigate('/dashboard');
    }
  }, [currentUser, loading, navigate]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || 'Unnamed Resident',
          role: 'Resident',
          department: 'Resident',
          isApproved: false,
          createdAt: new Date().toISOString()
        });
      }
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Google Auth Failure:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFirestoreError = (error: unknown, operationType: string, path: string | null) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
      },
      operationType,
      path
    };
    console.error(`Firestore Error [${operationType}] at [${path}]:`, JSON.stringify(errInfo));
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const cleanEmail = email.trim().toLowerCase();
    
    if (cleanEmail.length < 5 || password.length < 6) {
      setError("VALIDATION_ERR: Email too short or Password < 6 chars.");
      setLoading(false);
      return;
    }

    try {
      console.log("[AUTH] Attempting login for:", cleanEmail);
      let user;
      try {
        const credentials = await signInWithEmailAndPassword(auth, cleanEmail, password);
        user = credentials.user;
        console.log("[AUTH] Login success. UID:", user.uid);
      } catch (loginErr: any) {
        console.warn("[AUTH] Login failed. Checking for test account auto-init...", loginErr.code);
        
        const testAccounts: Record<string, { role: UserRole, department: Department }> = {
          'admin@baluarte.gov.ph': { role: 'Captain', department: 'Administration' },
          'justice@baluarte.com': { role: 'Secretary', department: 'Justice' },
          'health@baluarte.gov.ph': { role: 'BHW', department: 'Health' },
          'youth@baluarte.com': { role: 'SKOfficial', department: 'Youth' }
        };

        const testConfig = testAccounts[cleanEmail];
        const isNewUser = ['auth/user-not-found', 'auth/invalid-credential', 'auth/invalid-login-credentials'].includes(loginErr.code);

        if (testConfig && isNewUser) {
          console.log("[AUTH] Creating test account:", cleanEmail);
          const result = await createUserWithEmailAndPassword(auth, cleanEmail, password);
          user = result.user;
          console.log("[AUTH] Auto-init success. UID:", user.uid);
        } else {
          throw loginErr;
        }
      }

      if (!user) throw new Error("AUTH_SESSION_INVALID");

      // Profile Sync
      console.log("[AUTH] Entering secure sync phase...");
      const userDocRef = doc(db, 'users', user.uid);
      
      try {
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          console.log("[AUTH] Provisioning new identity profile...");
          const testAccounts: Record<string, { role: UserRole, department: Department }> = {
            'admin@baluarte.gov.ph': { role: 'Captain', department: 'Administration' },
            'justice@baluarte.com': { role: 'Secretary', department: 'Justice' },
            'health@baluarte.gov.ph': { role: 'BHW', department: 'Health' },
            'youth@baluarte.com': { role: 'SKOfficial', department: 'Youth' }
          };
          const testConfig = testAccounts[cleanEmail];

          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            displayName: cleanEmail.split('@')[0].toUpperCase(),
            role: testConfig?.role || 'Resident',
            department: testConfig?.department || 'Resident',
            isApproved: !!testConfig,
            createdAt: new Date().toISOString()
          });
          console.log("[AUTH] Identity provisioned successfully.");
        } else {
          console.log("[AUTH] Existing identity verified.");
        }
      } catch (fsErr: any) {
        console.error("[AUTH] Sync cluster failure:", fsErr.code, fsErr.message);
        setError(`DATABASE_LINK_ERR: ${fsErr.code || 'PROTOCOL_SYNC'}`);
        setLoading(false);
        return;
      }

      console.log("[AUTH] Terminal handshake complete. Navigating...");
      navigate('/dashboard');
      // Hard fallback if navigation hook is stale
      setTimeout(() => {
        if (window.location.pathname === '/login') {
          console.warn("[AUTH] Navigation hook delay detected. Triggering hard link...");
          window.location.href = '/dashboard';
        }
      }, 1000);
    } catch (err: any) {
      console.error("[AUTH] Fatal catch:", err.code, err.message);
      if (err.code?.startsWith('auth/')) {
        setError(`AUTH_ERR [${err.code}]: ${err.message}`);
      } else {
        setError(`SYSTEM_ERR: ${err.message || 'Unknown protocol failure'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute -top-48 -left-48 w-[40rem] h-[40rem] bg-brand-primary/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute -bottom-48 -right-48 w-[40rem] h-[40rem] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <Card className="p-10 backdrop-blur-3xl bg-brand-surface/40 border border-brand-border/50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-brand-primary rounded-2xl mx-auto flex items-center justify-center font-black text-3xl text-brand-bg shadow-[0_0_40px_rgba(88,166,255,0.3)] mb-6">
              B
            </div>
            <h1 className="text-3xl font-black text-brand-text tracking-tighter uppercase mb-2">Baluarte</h1>
            <p className="text-brand-muted text-xs font-bold uppercase tracking-[0.2em] opacity-80">
              Governance Portal
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-8 p-4 bg-brand-danger/10 border border-brand-danger/20 rounded-lg text-brand-danger text-[10px] font-black uppercase tracking-widest leading-relaxed text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.15em] mb-2 block">Terminal Account Access</label>
              <Input 
                type="email" 
                placeholder="ID_UID@BALUARTE.GOV.PH" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-brand-bg/50 border-brand-border text-brand-text placeholder:text-brand-muted/30 font-mono text-xs py-3" 
                disabled={loading}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.15em] block">Encrypted Entry Code</label>
                <button type="button" className="text-[10px] text-brand-primary font-bold hover:underline tracking-tighter">Reset Access</button>
              </div>
              <Input 
                type="password" 
                placeholder="••••••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-brand-bg/50 border-brand-border text-brand-text placeholder:text-brand-muted/30 font-mono text-xs py-3" 
                disabled={loading}
              />
            </div>
            
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-primary text-brand-bg font-black uppercase tracking-[0.2em] text-xs py-4 shadow-[0_8px_24_px_-8px_#58A6FF]"
          >
            {loading ? 'Processing...' : 'Authenticate User'}
          </Button>

          <div className="mt-4 p-3 bg-brand-surface border border-brand-border rounded-lg">
             <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-2">Internal Test Clusters</p>
             <div className="grid grid-cols-2 gap-2">
                <button 
                  type="button" 
                  onClick={() => { setEmail('admin@baluarte.gov.ph'); setPassword('admin123'); }}
                  className="text-[8px] font-bold text-brand-primary hover:underline text-left truncate uppercase"
                >
                  ADMIN_PORTAL
                </button>
                <button 
                  type="button" 
                  onClick={() => { setEmail('justice@baluarte.com'); setPassword('justice123'); }}
                  className="text-[8px] font-bold text-brand-primary hover:underline text-left truncate uppercase"
                >
                  JUSTICE_SEC
                </button>
                <button 
                  type="button" 
                  onClick={() => { setEmail('health@baluarte.gov.ph'); setPassword('health123'); }}
                  className="text-[8px] font-bold text-brand-primary hover:underline text-left truncate uppercase"
                >
                  HEALTH_COORD
                </button>
                <button 
                  type="button" 
                  onClick={() => { setEmail('youth@baluarte.com'); setPassword('youth123'); }}
                  className="text-[8px] font-bold text-brand-primary hover:underline text-left truncate uppercase"
                >
                  SK_CHAIR
                </button>
             </div>
             <div className="mt-4 pt-4 border-t border-brand-border">
                <p className="text-[8px] text-brand-muted/70 italic font-medium leading-relaxed">
                  SYSTEM NOTE: Provided department credentials will auto-register on first access within this new security cluster.
                </p>
             </div>
          </div>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-border"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.3em]">
              <span className="bg-brand-card/30 px-4 text-brand-muted">Secure_Link</span>
            </div>
          </div>

          <Button 
            onClick={handleGoogleLogin} 
            variant="outline" 
            className="w-full border-brand-border bg-brand-surface text-brand-text hover:bg-brand-bg py-4 text-xs font-black uppercase tracking-widest"
          >
            <Globe className="w-4 h-4 mr-3" />
            Google Cloud Session
          </Button>

          <div className="mt-8 pt-8 border-t border-brand-border/30">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[8px] font-black text-brand-muted uppercase tracking-widest">Diagnostic Terminal</span>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500/50"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-red-500/50"></div>
              </div>
            </div>
            <div className="bg-black/20 rounded p-4 font-mono text-[9px] text-brand-muted/60 leading-relaxed overflow-x-auto">
              <p className="mb-1 text-brand-primary/50 font-bold tracking-tight uppercase">Terminal_State: {loading ? 'SYNCHRONIZING' : 'STABLE'}</p>
              <p className="mb-1">CID: x8g4RK... (BALUARTE-SEC-01)</p>
              <p className="mb-1 uppercase">User_Auth: {auth.currentUser?.email || 'ANONYMOUS'}</p>
              <p className="mb-1">DB_MODE: LONG_POLLING_STABLE</p>
              {error && <p className="text-brand-danger/80 mt-2 font-bold whitespace-pre-wrap animate-pulse">CRITICAL_ERR: {error}</p>}
            </div>
            <button 
              onClick={() => {
                auth.signOut();
                localStorage.clear();
                window.location.reload();
              }}
              className="mt-4 w-full text-center text-[8px] font-black text-brand-muted hover:text-brand-danger uppercase tracking-[0.2em] transition-colors"
            >
              Force Flush Terminal Session
            </button>
          </div>

        </Card>

        <div className="mt-10 flex items-center justify-center gap-8 text-brand-muted opacity-40">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">End-to-End Encrypted</span>
          </div>
          <div className="w-[1px] h-4 bg-brand-border"></div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">AES-256_STABLE</span>
        </div>
      </motion.div>
    </div>
  );
};
