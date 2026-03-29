
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, ArrowRight, Phone, Eye, EyeOff, MailCheck, AlertCircle, CheckCircle } from 'lucide-react';
import PrimaryButton from '../components/ui/PrimaryButton';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { getYoutubeEmbedUrl } from '../lib/utils';

const getFriendlyErrorMessage = (errorCode: string, defaultMessage: string) => {
  switch (errorCode) {
    case 'auth/invalid-email': return 'Invalid email address format.';
    case 'auth/user-disabled': return 'This account has been disabled.';
    case 'auth/user-not-found': return 'No account found with this email.';
    case 'auth/wrong-password': return 'Incorrect password.';
    case 'auth/email-already-in-use': return 'An account already exists with this email.';
    case 'auth/weak-password': return 'Password should be at least 6 characters.';
    case 'auth/invalid-credential': return 'Invalid email or password.';
    case 'auth/too-many-requests': return 'Too many attempts. Please try again later.';
    default: return defaultMessage || 'An unexpected error occurred. Please try again.';
  }
};

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Background Video State
  const [bgVideoData, setBgVideoData] = useState({
    useYoutube: true,
    youtubeUrl: '',
    videoUrl: ''
  });

  useEffect(() => {
    const fetchBgVideo = async () => {
      try {
        const docRef = doc(db, 'sites', 'mostbooked', 'global_content', 'data');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setBgVideoData({
            useYoutube: String(data.heroUseYoutube) !== 'false', // default to true unless explicitly false
            youtubeUrl: data.heroYoutubeUrl ? getYoutubeEmbedUrl(data.heroYoutubeUrl) : '',
            videoUrl: data.heroBgVideoUrl || ''
          });
        }
      } catch (err) {
        console.error("Error fetching background video data:", err);
      }
    };
    fetchBgVideo();
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
    if (successMsg) setSuccessMsg(null);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      setError("Please enter your email address to reset your password.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await sendPasswordResetEmail(auth, formData.email);
      setSuccessMsg("Password reset email sent. Please check your inbox and your spam folder.");
      // Optional: switch back to login after a delay
      setTimeout(() => {
        setIsForgotPassword(false);
        setSuccessMsg(null);
      }, 5000);
    } catch (err: any) {
      console.error("Password Reset Error:", err);
      setError(getFriendlyErrorMessage(err.code, err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        navigate('/');
      } else {
        // Validation
        if (formData.email !== formData.confirmEmail) {
          throw new Error("Emails do not match.");
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        // Save user data to Firestore 'public' collection
        await setDoc(doc(db, "public", user.uid), {
          uid: user.uid,
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          createdAt: serverTimestamp(),
          role: 'user'
        });

        navigate('/');
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      setError(getFriendlyErrorMessage(err.code, err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLogin = (val: boolean) => {
    setIsLogin(val);
    setIsForgotPassword(false);
    setError(null);
    setSuccessMsg(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-6 py-20 relative overflow-hidden">
      {/* Background Cinematic Video Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-primary">
        <div className="absolute inset-0 z-10 bg-primary/80 backdrop-blur-[2px]" />
        
        {bgVideoData.useYoutube ? (
          bgVideoData.youtubeUrl && (
            <div className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-screen min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2 opacity-30 grayscale contrast-125">
              <iframe
                width="100%"
                height="100%"
                src={bgVideoData.youtubeUrl}
                title="Auth Background"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          )
        ) : (
          bgVideoData.videoUrl && (
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale contrast-125"
              src={bgVideoData.videoUrl}
            />
          )
        )}

        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px] z-20 pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/30 rounded-full blur-[120px] z-20 pointer-events-none" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-30 w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-block mb-6">
            <span className="text-4xl font-hero text-ui tracking-tighter">
              MOSTBOOKED<span className="text-accent">.</span>
            </span>
          </Link>
          <h1 className="text-white font-hero text-3xl tracking-widest uppercase">
            {isLogin ? 'Welcome Back' : 'Join the Elite'}
          </h1>
          <p className="text-white/40 font-subheading text-[10px] uppercase tracking-[0.2em] mt-2">
            {isLogin ? 'Access your creative dashboard' : 'Start your cinematic journey today'}
          </p>
        </div>

        <div className="bg-secondary/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-accent/10 border border-accent/20 rounded-xl flex items-start space-x-3 text-accent text-xs"
              >
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
            {successMsg && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start space-x-3 text-green-400 text-xs"
              >
                <CheckCircle size={16} className="shrink-0" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle Tabs */}
          {!isForgotPassword && (
            <div className="flex bg-primary/50 p-1 rounded-xl mb-8 border border-ui/5">
              <button 
                onClick={() => toggleLogin(true)}
                className={`flex-1 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${isLogin ? 'bg-accent text-white shadow-lg' : 'text-ui/40 hover:text-ui/60'}`}
              >
                Login
              </button>
              <button 
                onClick={() => toggleLogin(false)}
                className={`flex-1 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${!isLogin ? 'bg-accent text-white shadow-lg' : 'text-ui/40 hover:text-ui/60'}`}
              >
                Sign Up
              </button>
            </div>
          )}

          {isForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-ui font-heading text-xl uppercase tracking-widest mb-2">Reset Password</h2>
                <p className="text-ui/50 text-xs">Enter your email address and we'll send you a link to reset your password.</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-ui/20" size={18} />
                  <input 
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email" 
                    placeholder="name@example.com"
                    className="w-full bg-primary border border-ui/10 pl-12 pr-4 py-3.5 rounded-xl text-ui focus:border-accent outline-none transition-all placeholder:text-ui/20"
                  />
                </div>
              </div>

              <PrimaryButton 
                type="submit" 
                className="w-full !py-4 flex items-center justify-center space-x-2 mt-4"
              >
                <span>{isLoading ? 'Sending...' : 'Send Reset Link'}</span>
                {!isLoading && <ArrowRight size={18} />}
              </PrimaryButton>

              <button 
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="w-full text-center mt-4 text-[10px] uppercase tracking-widest text-ui/40 hover:text-ui transition-colors font-bold"
              >
                Back to Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="popLayout">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-ui/20" size={18} />
                        <input 
                          required
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          type="text" 
                          placeholder="Enter your name"
                          className="w-full bg-primary/50 border border-ui/10 pl-12 pr-4 py-3.5 rounded-xl text-ui focus:border-accent outline-none transition-all placeholder:text-ui/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-ui/20" size={18} />
                        <input 
                          required
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          type="tel" 
                          placeholder="+234 000 000 0000"
                          className="w-full bg-primary/50 border border-ui/10 pl-12 pr-4 py-3.5 rounded-xl text-ui focus:border-accent outline-none transition-all placeholder:text-ui/20"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-ui/20" size={18} />
                  <input 
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email" 
                    placeholder="name@example.com"
                    className="w-full bg-primary border border-ui/10 pl-12 pr-4 py-3.5 rounded-xl text-ui focus:border-accent outline-none transition-all placeholder:text-ui/20"
                  />
                </div>
              </div>

              <AnimatePresence mode="popLayout">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Confirm Email</label>
                    <div className="relative">
                      <MailCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-ui/20" size={18} />
                      <input 
                        required
                        name="confirmEmail"
                        value={formData.confirmEmail}
                        onChange={handleChange}
                        type="email" 
                        placeholder="name@example.com"
                        className="w-full bg-primary border border-ui/10 pl-12 pr-4 py-3.5 rounded-xl text-ui focus:border-accent outline-none transition-all placeholder:text-ui/20"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Password</label>
                  {isLogin && (
                    <button 
                      type="button" 
                      onClick={() => setIsForgotPassword(true)}
                      className="text-[9px] uppercase tracking-widest text-accent hover:text-accent-hover transition-colors font-bold"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-ui/20" size={18} />
                  <input 
                    required
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full bg-primary border border-ui/10 pl-12 pr-12 py-3.5 rounded-xl text-ui focus:border-accent outline-none transition-all placeholder:text-ui/20"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-ui/20 hover:text-ui/60 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <AnimatePresence mode="popLayout">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-ui/20" size={18} />
                      <input 
                        required
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="w-full bg-primary border border-ui/10 pl-12 pr-12 py-3.5 rounded-xl text-ui focus:border-accent outline-none transition-all placeholder:text-ui/20"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-ui/20 hover:text-ui/60 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <PrimaryButton 
                type="submit" 
                className="w-full !py-4 flex items-center justify-center space-x-2 mt-4"
              >
                <span>{isLoading ? 'Processing...' : (isLogin ? 'Enter Dashboard' : 'Create Account')}</span>
                {!isLoading && <ArrowRight size={18} />}
              </PrimaryButton>
            </form>
          )}
        </div>

        {!isForgotPassword && (
          <p className="text-center mt-8 text-ui/30 text-[10px] uppercase tracking-widest">
            {isLogin ? "Don't have an account?" : "Already a member?"}
            <button 
              onClick={() => toggleLogin(!isLogin)}
              className="ml-2 text-accent font-bold hover:underline"
            >
              {isLogin ? "Join Now" : "Login Here"}
            </button>
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default AuthPage;
