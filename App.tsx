
import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import BookingPage from './pages/BookingPage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import PortfolioPage from './pages/PortfolioPage';
import CoursesPage from './pages/CoursesPage';
import ContactPage from './pages/ContactPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import TransactionLogsPage from './pages/TransactionLogsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import MerchPage from './pages/MerchPage';
import MerchDetailPage from './pages/MerchDetailPage';
import CartPage from './pages/CartPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import PaymentCallbackPage from './pages/PaymentCallbackPage';
import TeamMemberPage from './pages/TeamMemberPage';
import { LoadingProvider, useLoading } from './context/LoadingContext';
import { CartProvider } from './context/CartContext';
import LoadingScreen from './components/ui/LoadingScreen';
import { HelmetProvider } from 'react-helmet-async';
import SEO from './components/layout/SEO';
import VideoPreloader from './components/ui/VideoPreloader';
import { db, auth } from './lib/firebase';
import { doc, setDoc, increment, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { AlertCircle, LogOut } from 'lucide-react';

// Simple ScrollToTop component
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';
  const { isLoading } = useLoading();
  const [isSuspended, setIsSuspended] = React.useState(false);

  React.useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = doc(db, 'public', user.uid);
        const unsubscribeDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists() && docSnap.data().disabled === true) {
            setIsSuspended(true);
          } else {
            setIsSuspended(false);
          }
        });
        return () => unsubscribeDoc();
      } else {
        setIsSuspended(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsSuspended(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  React.useEffect(() => {
    const VISIT_THRESHOLD = 3 * 60 * 1000; // 3 minutes
    const timer = setTimeout(async () => {
      try {
        const siteRef = doc(db, 'sites', 'mostbooked');
        await setDoc(siteRef, {
          sitevisit: increment(1)
        }, { merge: true });
        console.log('Site visit recorded after 3 minutes');
      } catch (error) {
        console.error('Error recording site visit:', error);
      }
    }, VISIT_THRESHOLD);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-primary selection:bg-accent selection:text-white">
      <SEO />
      <VideoPreloader />
      <AnimatePresence>
        {isLoading && <LoadingScreen key="loader" />}
      </AnimatePresence>
      
      {!isAuthPage && <Header />}
      <ScrollToTop />

      {/* Suspension Modal */}
      <AnimatePresence>
        {isSuspended && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-primary/95 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="max-w-md w-full bg-secondary border border-white/10 rounded-[2.5rem] p-10 text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -z-10" />
              
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                <AlertCircle size={40} className="text-red-500" />
              </div>

              <h2 className="text-ui font-hero text-4xl uppercase mb-4 leading-none">Account <br/><span className="text-red-500">Suspended</span></h2>
              <p className="text-ui/60 font-subheading text-sm leading-relaxed mb-10">
                Your access to MostBooked has been suspended. Please contact support if you believe this is a mistake.
              </p>

              <button
                onClick={handleLogout}
                className="w-full py-4 bg-red-500 text-white rounded-2xl font-heading text-xs uppercase tracking-[0.2em] font-bold hover:bg-red-600 transition-all flex items-center justify-center gap-3 group"
              >
                <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
                Logout Account
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/team/:id" element={<TeamMemberPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/transactions" element={<TransactionLogsPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-of-service" element={<TermsOfServicePage />} />
          <Route path="/merch" element={<MerchPage />} />
          <Route path="/merch/:id" element={<MerchDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/order-history" element={<OrderHistoryPage />} />
          <Route path="/payment-callback" element={<PaymentCallbackPage />} />
        </Routes>
      </AnimatePresence>
      {!isAuthPage && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <LoadingProvider>
        <CartProvider>
          <Router>
            <AppContent />
          </Router>
        </CartProvider>
      </LoadingProvider>
    </HelmetProvider>
  );
};

export default App;
