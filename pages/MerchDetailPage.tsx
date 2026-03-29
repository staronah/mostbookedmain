
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ArrowLeft, ChevronLeft, ChevronRight, Loader2, ShoppingCart, Check } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { MerchItem } from '../types';
import { initiatePaystackPayment } from '../lib/payment';
import SEO from '../components/layout/SEO';
import { useCart } from '../context/CartContext';

const MerchDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<MerchItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const user = auth.currentUser;
  const { addToCart, cartItems } = useCart();
  
  const cartItem = cartItems.find(i => i.id === item?.id);
  const isInCart = !!cartItem;
  const isMaxQuantityReached = typeof item?.maxQuantity === 'number' ? (cartItem?.quantity || 0) >= item.maxQuantity : false;

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'sites', 'mostbooked', 'merch', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setItem({
            id: docSnap.id,
            label: data.label || 'Unnamed Item',
            amount: data.amount || 0,
            images: data.images || [],
            description: data.description || '',
            tag: data.tag || 'General',
            createdAt: data.createdAt,
            maxQuantity: typeof data.maxQuantity === 'number' ? data.maxQuantity : undefined,
            outOfStock: data.outOfStock || false
          });
        }
      } catch (error) {
        console.error('Error fetching merch item:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleAddToCart = () => {
    if (!item || item.outOfStock || isInCart) return;
    addToCart(item);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-accent mb-4" size={48} strokeWidth={1} />
        <p className="text-ui/60 font-heading text-xs uppercase tracking-widest">Loading Details...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-ui font-hero text-6xl uppercase mb-6">Item Not Found</h1>
        <button 
          onClick={() => navigate('/merch')}
          className="flex items-center space-x-2 text-accent font-heading uppercase tracking-widest hover:underline"
        >
          <ArrowLeft size={20} />
          <span>Back to Store</span>
        </button>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % item.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length);
  };

  return (
    <main className="pt-32 pb-24 px-6 min-h-screen bg-primary">
      <SEO 
        title={`${item.label} | MOSTBOOKED Store`}
        description={item.description}
      />
      
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={() => navigate('/merch')}
          className="group flex items-center space-x-2 text-ui/60 hover:text-accent transition-colors mb-12 font-heading uppercase tracking-widest text-sm"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Collection</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Image Gallery */}
          <div className="space-y-6">
            <div className="relative aspect-[4/5] bg-secondary rounded-[2rem] overflow-hidden group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  src={item.images[currentImageIndex]}
                  alt={item.label}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {item.images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-accent transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-accent transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

              <div className="absolute top-6 left-6 flex flex-col gap-2">
                <span className="bg-accent text-white px-4 py-1.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold shadow-xl w-fit">
                  {item.tag}
                </span>
                {item.outOfStock && (
                  <span className="bg-red-500 text-white px-4 py-1.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold shadow-xl w-fit">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {item.images.length > 1 && (
              <div className="flex space-x-4 overflow-x-auto pb-2 no-scrollbar">
                {item.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative w-24 aspect-square rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      currentImageIndex === idx ? 'border-accent scale-105' : 'border-transparent opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:sticky lg:top-40"
          >
            <h1 className="text-ui font-hero text-6xl md:text-8xl leading-none uppercase mb-4">{item.label}</h1>
            <p className="text-accent font-heading text-3xl mb-8">₦{item.amount.toLocaleString()}</p>
            
            <div className="h-px w-full bg-ui/10 mb-8" />
            
            <div className="mb-12">
              <h3 className="text-ui/40 font-heading text-xs uppercase tracking-widest mb-4">Description</h3>
              <p className="text-ui/70 font-subheading text-lg leading-relaxed">
                {item.description || "No description available for this premium creator essential."}
              </p>
            </div>

            <div className="space-y-4">
              <button 
                onClick={handleAddToCart}
                disabled={item.outOfStock || isInCart || isAdded}
                className={`w-full py-6 rounded-2xl font-hero text-2xl tracking-[0.2em] flex items-center justify-center space-x-4 transition-all duration-500 group ${
                  item.outOfStock || isInCart || isAdded
                    ? 'bg-ui/10 text-ui/40 cursor-not-allowed' 
                    : 'bg-transparent border border-accent text-accent hover:bg-accent/10'
                }`}
              >
                <AnimatePresence mode="wait">
                  {isAdded ? (
                    <motion.div
                      key="added"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center space-x-2 text-green-500"
                    >
                      <span>Added!</span>
                      <Check size={24} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="default"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center space-x-4"
                    >
                      <span>
                        {item.outOfStock 
                          ? 'Out of Stock' 
                          : isInCart 
                            ? 'In Cart' 
                            : 'Add to Cart'}
                      </span>
                      {!item.outOfStock && !isInCart && <ShoppingCart size={24} className="group-hover:scale-110 transition-transform" />}
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
              
              <div className="flex items-center justify-center space-x-8 text-ui/40 font-heading text-[10px] uppercase tracking-widest pt-4">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span>Premium Quality</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span>Fast Delivery</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span>Secure Payment</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default MerchDetailPage;
