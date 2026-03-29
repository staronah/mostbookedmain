
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, ShoppingBag } from 'lucide-react';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, limit } from 'firebase/firestore';
import { useLoading } from '../../context/LoadingContext';
import { useCart } from '../../context/CartContext';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [brandName, setBrandName] = useState('MOSTBOOKED');
  const [hasMerch, setHasMerch] = useState(false);
  const location = useLocation();
  const { cartCount } = useCart();

  const { registerItem, markLoaded } = useLoading();

  useEffect(() => {
    registerItem('brand-data');
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    const handleResize = () => {
      if (window.innerWidth >= 1024) { // 1024px is the 'lg' breakpoint
        setIsOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "public", currentUser.uid));
        if (userDoc.exists()) {
          setUserName(userDoc.data().fullName);
        } else {
          setUserName(currentUser.displayName || 'Creator');
        }
      } else {
        setUserName(null);
      }
    });

    // Fetch Brand Name from Firestore
    const fetchBrand = async () => {
      try {
        const docRef = doc(db, 'sites', 'mostbooked', 'global_content', 'data');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.heroTitle) setBrandName(data.heroTitle);
        }
        markLoaded('brand-data');
      } catch (err) {
        console.error("Error loading Firestore brand name in header:", err);
        markLoaded('brand-data');
      }
    };
    
    const checkMerch = async () => {
      try {
        const merchRef = collection(db, 'sites', 'mostbooked', 'merch');
        const querySnapshot = await getDocs(merchRef);
        setHasMerch(!querySnapshot.empty);
      } catch (err) {
        console.error("Error checking merch:", err);
      }
    };

    fetchBrand();
    checkMerch();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      unsubscribe();
    };
  }, []);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'Services', path: '/services' },
    { name: 'Courses', path: '/courses' },
    ...(hasMerch ? [{ name: 'Merch', path: '/merch' }] : []),
    { name: 'Contact', path: '/contact' },
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isOpen || scrolled ? 'bg-secondary py-4 border-b border-accent/20' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center relative z-[70]">
        {/* Logo */}
        <Link to="/" className="group">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <span className={`text-lg font-hero tracking-tightest font-black transition-colors duration-300 ${isOpen || scrolled ? 'text-primary' : 'text-ui'} group-hover:text-accent uppercase`}>
              {brandName}
            </span>
          </motion.div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className="relative group">
              <span className={`font-subheading text-[10px] uppercase tracking-[0.25em] transition-colors duration-300 ${location.pathname === item.path ? 'text-accent' : (isOpen || scrolled ? 'text-primary/60 hover:text-primary' : 'text-ui/60 hover:text-ui')}`}>
                {item.name}
              </span>
              <span className={`absolute -bottom-1 left-0 h-px bg-accent transition-all duration-300 ${location.pathname === item.path ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </Link>
          ))}
          
          <div className="flex items-center space-x-6 ml-4">
            {hasMerch && (
              <Link to="/cart" className={`relative flex items-center space-x-2 transition-colors duration-300 group ${isOpen || scrolled ? 'text-primary/60 hover:text-primary' : 'text-ui/60 hover:text-ui'}`}>
                <ShoppingBag size={14} className="group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
            <Link to={user ? "/profile" : "/auth"} className={`flex items-center space-x-2 transition-colors duration-300 group ${isOpen || scrolled ? 'text-primary/60 hover:text-primary' : 'text-ui/60 hover:text-ui'}`}>
              <User size={14} className="group-hover:scale-110 transition-transform" />
              <span className="font-subheading text-[10px] uppercase tracking-widest truncate max-w-[100px]">
                {user ? userName || 'Profile' : 'Login'}
              </span>
            </Link>
            
            <Link to="/services">
              <button className="px-5 py-2 border border-accent text-accent hover:bg-accent hover:text-white font-subheading text-[10px] uppercase tracking-widest transition-all duration-300">
                Book Now
              </button>
            </Link>
          </div>
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden flex items-center space-x-4">
          {hasMerch && (
            <Link to="/cart" className={`relative p-2 ${isOpen || scrolled ? 'text-primary/60' : 'text-ui/60'}`}>
              <ShoppingBag size={24} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          )}
          <Link to={user ? "/profile" : "/auth"} className={`p-2 ${isOpen || scrolled ? 'text-primary/60' : 'text-ui/60'}`}>
            <User size={24} />
          </Link>
          <button className={`p-2 ${isOpen || scrolled ? 'text-primary' : 'text-ui'}`} onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 w-full h-[100dvh] bg-black z-[60] flex flex-col items-center justify-start p-6 pt-24 lg:hidden overflow-y-auto"
          >
            <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-sm">
              {navItems.map((item, idx) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="w-full text-center"
                >
                  <Link 
                    to={item.path} 
                    onClick={() => setIsOpen(false)}
                    className="text-4xl sm:text-5xl font-hero text-white hover:text-grey transition-colors block py-2"
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navItems.length * 0.1 }}
                className="pt-4"
              >
                <Link 
                  to={user ? "/profile" : "/auth"}
                  onClick={() => setIsOpen(false)}
                  className="text-xl font-subheading text-white/40 uppercase tracking-widest hover:text-white transition-colors"
                >
                  {user ? userName || 'Account' : 'Login'}
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (navItems.length + 1) * 0.1 }}
                className="w-full pt-8"
              >
                <Link 
                  to="/services" 
                  onClick={() => setIsOpen(false)}
                  className="block w-full py-4 bg-white text-black font-hero text-2xl tracking-widest text-center hover:bg-grey transition-colors"
                >
                  BOOK NOW
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
