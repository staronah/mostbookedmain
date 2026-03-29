
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut, updatePassword, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, LogOut, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import PrimaryButton from '../components/ui/PrimaryButton';
import { useCart } from '../context/CartContext';

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const navigate = useNavigate();
  const { clearCart } = useCart();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/auth');
        return;
      }
      setUser(currentUser);
      
      const userDoc = await getDoc(doc(db, "public", currentUser.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/auth');
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: "Passwords do not match." });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: "Password must be at least 6 characters." });
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordStatus(null);
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        setPasswordStatus({ type: 'success', message: "Password updated successfully!" });
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setPasswordStatus({ type: 'error', message: err.message || "Failed to update password. You may need to re-login." });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="pt-32 pb-24 px-6 min-h-screen bg-primary relative overflow-hidden">
      {/* Decorative BG */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/30 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6"
        >
          <div>
            <span className="text-accent font-heading tracking-[0.3em] text-sm uppercase mb-2 block">Dashboard</span>
            <h1 className="text-ui font-hero text-6xl md:text-7xl leading-none">YOUR <br/><span className="text-accent">PROFILE</span></h1>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-6 py-3 bg-accent text-white hover:bg-accent/90 transition-all duration-300 rounded-xl font-subheading uppercase text-xs tracking-widest"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Details Card */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-secondary/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center text-accent">
                  <User size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-heading text-white">{userData?.fullName || user?.displayName || 'Creator'}</h2>
                  <p className="text-white/40 text-xs uppercase tracking-widest">Premium Member</p>
                </div>
              </div>

              <div className="flex gap-4 mb-8">
                <PrimaryButton 
                  onClick={() => navigate('/profile/transactions')}
                  className="!text-xs !py-3"
                >
                  Transaction Logs
                </PrimaryButton>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold flex items-center space-x-2">
                    <Mail size={12} className="text-accent" />
                    <span>Email Address</span>
                  </p>
                  <p className="text-white font-body">{user?.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold flex items-center space-x-2">
                    <Phone size={12} className="text-accent" />
                    <span>Phone Number</span>
                  </p>
                  <p className="text-white font-body">{userData?.phone || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold flex items-center space-x-2">
                    <CheckCircle size={12} className="text-accent" />
                    <span>Account Type</span>
                  </p>
                  <p className="text-white font-body capitalize">{userData?.role || 'User'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold flex items-center space-x-2">
                    <Shield size={12} className="text-accent" />
                    <span>Status</span>
                  </p>
                  <p className="text-accent font-bold uppercase tracking-widest text-xs">Active</p>
                </div>
              </div>
            </div>

            {/* Quick Stats Placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Bookings', val: '0' },
                { label: 'Courses', val: '0' },
                { label: 'Wishlist', val: '0' }
              ].map((stat, i) => (
                <div key={i} className="bg-secondary border border-white/5 p-6 rounded-2xl text-center">
                  <p className="text-3xl font-hero text-white mb-1">{stat.val}</p>
                  <p className="text-[9px] uppercase tracking-widest text-white/30">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Security Card */}
          <div className="space-y-6">
            <div className="bg-secondary/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
              <h3 className="text-xl font-heading text-white mb-6 flex items-center space-x-3">
                <Lock className="text-accent" size={20} />
                <span>Security</span>
              </h3>
              
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-white/40 font-bold ml-1">New Password</label>
                  <input 
                    required
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-primary border border-ui/10 px-4 py-3 rounded-xl text-ui focus:border-accent outline-none text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-white/40 font-bold ml-1">Confirm Password</label>
                  <input 
                    required
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-primary border border-ui/10 px-4 py-3 rounded-xl text-ui focus:border-accent outline-none text-sm"
                  />
                </div>

                <AnimatePresence>
                  {passwordStatus && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`p-3 rounded-lg flex items-start space-x-2 text-[10px] ${passwordStatus.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-accent/10 text-accent border border-accent/20'}`}
                    >
                      {passwordStatus.type === 'success' ? <CheckCircle size={14} className="shrink-0" /> : <AlertCircle size={14} className="shrink-0" />}
                      <span>{passwordStatus.message}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <PrimaryButton 
                  type="submit" 
                  className="w-full !py-3 !text-xs !tracking-[0.15em]"
                >
                  {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                </PrimaryButton>
              </form>
            </div>

            <div className="p-6 border border-accent/20 bg-accent/5 rounded-2xl">
              <p className="text-[9px] text-accent/60 leading-relaxed font-body uppercase tracking-wider text-center">
                Need more help with your account? Contact our support team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;
