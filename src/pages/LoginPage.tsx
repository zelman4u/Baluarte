import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
import { LogIn, Globe, Shield, Scale, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdminLoader, setShowAdminLoader] = useState(false);
  const [loaderType, setLoaderType] = useState<'admin' | 'sk' | 'justice' | null>(null);

  // Auto-redirect if already logged in
  React.useEffect(() => {
    if (currentUser && !loading && !showAdminLoader) {
      navigate('/dashboard');
    }
  }, [currentUser, loading, showAdminLoader, navigate]);

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
          'justice@baluarte.com': { role: 'Lupon', department: 'Justice' },
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
      
      let finalRole: UserRole = 'Resident';
      let finalDept: Department = 'Resident';

      try {
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          console.log("[AUTH] Provisioning new identity profile...");
          const testAccounts: Record<string, { role: UserRole, department: Department }> = {
            'admin@baluarte.gov.ph': { role: 'Captain', department: 'Administration' },
            'justice@baluarte.com': { role: 'Lupon', department: 'Justice' },
            'health@baluarte.gov.ph': { role: 'BHW', department: 'Health' },
            'youth@baluarte.com': { role: 'SKOfficial', department: 'Youth' }
          };
          const testConfig = testAccounts[cleanEmail];
          finalRole = testConfig?.role || 'Resident';
          finalDept = testConfig?.department || 'Resident';

          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            displayName: cleanEmail.split('@')[0].toUpperCase(),
            role: finalRole,
            department: finalDept,
            isApproved: !!testConfig,
            createdAt: new Date().toISOString()
          });
          console.log("[AUTH] Identity provisioned successfully.");
        } else {
          console.log("[AUTH] Existing identity verified.");
          const data = userDoc.data();
          finalRole = data?.role || 'Resident';
          finalDept = data?.department || 'Resident';
        }
      } catch (fsErr: any) {
        console.error("[AUTH] Sync cluster failure:", fsErr.code, fsErr.message);
        setError("Database connection error. Please try again.");
        setLoading(false);
        return;
      }

      // Check for Special loading screens (Admin, SK, Justice)
      const isAdminRole = finalDept === 'Administration' && (finalRole === 'Captain' || finalRole === 'Secretary');
      const isSKRole = finalDept === 'Youth' && finalRole === 'SKOfficial';
      const isJusticeRole = finalDept === 'Justice';
      
      if (isAdminRole || isSKRole || isJusticeRole) {
        if (isSKRole) setLoaderType('sk');
        else if (isJusticeRole) setLoaderType('justice');
        else setLoaderType('admin');
        
        setShowAdminLoader(true);
        setLoading(false);
        // Wait for animation
        setTimeout(() => {
          navigate('/dashboard');
        }, 3500);
      } else {
        console.log("[AUTH] Terminal handshake complete. Navigating...");
        navigate('/dashboard');
      }

    } catch (err: any) {
      console.error("[AUTH] Fatal catch:", err.code, err.message);
      const code = err.code || "";
      
      if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-login-credentials') {
        setError('Invalid email or password. Please try again.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else if (code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection.');
      } else {
        setError('Problem signing in. Please check your credentials or connection.');
      }
    } finally {
      if (!showAdminLoader) {
        setLoading(false);
      }
    }
  };

  if (showAdminLoader) {
    const isSK = loaderType === 'sk';
    const isJustice = loaderType === 'justice';
    const isAdmin = loaderType === 'admin';

    const logoUrl = isSK 
      ? "https://lh3.googleusercontent.com/d/1x8riK__Rn53iKzwbvEUapuNuQmNUwC33=s1000"
      : "https://lh3.googleusercontent.com/d/15qEeMZnaeEI052MdJrFujHjkxcKJMHku=s1000";

    const bgColor = isSK ? 'bg-[#001a33]' : isJustice ? 'bg-[#0a1a0a]' : 'bg-brand-bg';
    const accentColor = isSK ? 'rgba(0,120,255,0.15)' : isJustice ? 'rgba(34,197,94,0.1)' : 'rgba(88,166,255,0.1)';
    const shadowColor = isSK ? 'rgba(0,120,255,0.4)' : isJustice ? 'rgba(34,197,94,0.4)' : 'rgba(88,166,255,0.4)';

    return (
      <div className={`min-h-screen ${bgColor} flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans`}>
        <div className={`absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,${accentColor}_0%,transparent_70%)] animate-pulse`} />
        
        <motion.div
           initial={{ scale: 0, rotate: -180 }}
           animate={{ scale: 1, rotate: 0 }}
           transition={{ type: "spring", damping: 12, stiffness: 60 }}
           className="relative z-10"
        >
          <motion.div 
            style={{ perspective: 1000 }}
            animate={{ 
              rotateY: [0, 360],
              y: [0, -20, 0]
            }}
            transition={{ 
              rotateY: { duration: 4, repeat: Infinity, ease: "linear" },
              y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
            className={`w-48 h-48 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-2xl rounded-full flex items-center justify-center p-4 shadow-[0_0_100px_${shadowColor}] border border-white/20`}
          >
            {isJustice ? (
              <div className="w-full h-full flex items-center justify-center">
                <Scale className="w-24 h-24 text-green-500" />
              </div>
            ) : (
              <img 
                src={logoUrl} 
                alt="Authorizing" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-full shadow-2xl"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = isSK 
                    ? "https://placehold.co/400x400/001a33/58a6ff?text=SK+Logo"
                    : "https://placehold.co/400x400/1e1e1e/58a6ff?text=Barangay+Logo";
                }}
              />
            )}
          </motion.div>
          
          <motion.div 
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`absolute -inset-8 ${isSK ? 'bg-blue-500/10' : isJustice ? 'bg-green-500/10' : 'bg-brand-primary/10'} rounded-full blur-[40px] -z-10`}
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center z-10"
        >
          <h2 className={`text-2xl font-black text-brand-text tracking-[0.3em] uppercase mb-4`}>
            {isSK ? 'SK PORTAL LOGIN' : isJustice ? 'JUSTICE PORTAL LOGIN' : 'Accessing Portal'}
          </h2>
          <div className="flex flex-col items-center gap-2">
            <div className={`w-64 h-1 ${isSK ? 'bg-blue-900' : isJustice ? 'bg-green-900' : 'bg-brand-border'} rounded-full overflow-hidden relative`}>
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className={`absolute inset-0 ${isSK ? 'bg-blue-400' : isJustice ? 'bg-green-400' : 'bg-brand-primary'}`}
              />
            </div>
            <p className="text-[10px] font-mono text-brand-primary uppercase tracking-widest mt-4">
              Access Level: <span className="font-bold text-white uppercase">{isSK ? 'SK OFFICIAL' : isJustice ? 'JUSTICE COMMISSION' : 'CAPTAIN ACCESS'}</span>
            </p>
            <div className="mt-8 bg-black/40 backdrop-blur-md rounded-lg p-4 border border-brand-border/50 max-w-xs overflow-hidden">
               <p className={`text-[8px] font-mono ${isSK ? 'text-blue-400' : isJustice ? 'text-green-500' : 'text-green-500/80'} leading-tight whitespace-pre animate-pulse text-left uppercase`}>
                 {">"} Checking Account... OK<br/>
                 {">"} Syncing {isSK ? 'SK' : isJustice ? 'Justice' : 'Secure'} Data... OK<br/>
                 {">"} Preparing Dashboard... OK<br/>
                 {">"} Opening Dashboard...
               </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen max-h-screen w-full bg-brand-bg flex items-center justify-center p-3 sm:p-6 relative overflow-hidden font-sans">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute -top-48 -left-48 w-[35rem] h-[35rem] bg-brand-primary/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute -bottom-48 -right-48 w-[35rem] h-[35rem] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm sm:max-w-md z-10 my-auto"
      >
        <Card className="p-5 sm:p-8 backdrop-blur-3xl bg-brand-surface/60 border border-brand-border/60 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)] rounded-2xl">
          <div className="text-center mb-5 sm:mb-6">
            <motion.div 
              style={{ perspective: 1000 }}
              animate={{ 
                y: [0, -6, 0],
                rotateX: [3, -3, 3],
                rotateY: [-5, 5, -5]
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              whileHover={{ 
                scale: 1.1,
                rotateX: 0,
                rotateY: 0,
                transition: { duration: 0.3 }
              }}
              className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-xl rounded-full mx-auto flex items-center justify-center p-2 shadow-[0_15px_35px_rgba(88,166,255,0.3)] mb-3 border border-white/20 overflow-hidden relative cursor-default"
            >
              <img 
                src="https://lh3.googleusercontent.com/d/15qEeMZnaeEI052MdJrFujHjkxcKJMHku=s1000" 
                alt="Barangay Logo" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)] z-10"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://placehold.co/400x400/1e1e1e/58a6ff?text=Barangay+Logo";
                }}
              />
            </motion.div>
            <h1 className="text-xl sm:text-2xl font-black text-brand-text tracking-tighter uppercase interactive-text">
              Barangay Baluarte
            </h1>
            <p className="text-[10px] font-mono text-brand-muted uppercase tracking-widest mt-0.5">
              Secure Governance Portal
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-4 p-2.5 bg-brand-danger/10 border border-brand-danger/20 rounded-lg text-brand-danger text-[10px] font-black uppercase tracking-wider leading-relaxed text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleAuth} className="space-y-3.5 sm:space-y-4">
            <div>
              <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.15em] mb-1.5 block">
                Official Email Address
              </label>
              <Input 
                type="email" 
                placeholder="admin@baluarte.gov.ph" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-brand-bg/60 border-brand-border text-brand-text placeholder:text-brand-muted/30 font-mono text-xs h-11 min-h-[44px]" 
                disabled={loading}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-black text-brand-muted uppercase tracking-[0.15em] block">
                  Password
                </label>
              </div>
              <div className="relative flex items-center">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-brand-bg/60 border-brand-border text-brand-text placeholder:text-brand-muted/30 font-mono text-xs h-11 min-h-[44px] pr-11" 
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-0 top-0 bottom-0 px-3.5 flex items-center justify-center text-brand-muted hover:text-brand-primary transition-colors interactive-click focus:outline-none min-h-[44px] min-w-[44px]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-brand-primary" />
                  ) : (
                    <Eye className="w-4 h-4 text-brand-muted hover:text-brand-text" />
                  )}
                </button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand-primary text-brand-bg font-black uppercase tracking-[0.2em] text-xs h-11 min-h-[44px] shadow-[0_8px_24px_-8px_#58A6FF] interactive-click mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In To Portal'}
            </Button>
          </form>

          <div className="mt-4 pt-3.5 border-t border-brand-border/40 text-center flex items-center justify-between">
            <Link 
              to="/" 
              className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-brand-muted hover:text-brand-primary transition-colors group min-h-[36px]"
            >
              <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
              <span>Back to home</span>
            </Link>
            <span className="text-[9px] font-mono text-brand-muted/60">
              v2.4 LTS Secure
            </span>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
