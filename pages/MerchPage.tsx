
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, ArrowRight, Loader2, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { MerchItem } from '../types';

const MerchPage: React.FC = () => {
  const [merchItems, setMerchItems] = useState<MerchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMerch = async () => {
      try {
        const merchRef = collection(db, 'sites', 'mostbooked', 'merch');
        const q = query(merchRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const items: MerchItem[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            label: data.label || 'Unnamed Item',
            amount: data.amount || 0,
            images: data.images || [],
            description: data.description || '',
            tag: data.tag || 'General',
            createdAt: data.createdAt,
            maxQuantity: typeof data.maxQuantity === 'number' ? data.maxQuantity : undefined,
            outOfStock: data.outOfStock || false
          };
        });
        
        setMerchItems(items);
      } catch (error) {
        console.error('Error fetching merch:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMerch();
  }, []);

  return (
    <main className="pt-32 pb-24 px-6 min-h-screen bg-primary">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <span className="text-accent font-heading tracking-[0.3em] text-sm uppercase mb-4 block">Store</span>
          <h1 className="text-ui font-hero text-7xl md:text-8xl leading-none uppercase">CREATOR <br/><span className="text-accent text-outline">MERCH</span></h1>
          <p className="text-ui/60 max-w-xl mt-8 font-subheading text-lg leading-relaxed">
            Premium apparel and accessories designed for the modern visual storyteller. 
            Crafted with quality, worn with pride.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="animate-spin text-accent mb-4" size={48} strokeWidth={1} />
            <p className="text-ui/60 font-heading text-xs uppercase tracking-widest">Loading Collection...</p>
          </div>
        ) : merchItems.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-6">
              <Package className="text-accent" size={40} />
            </div>
            <h2 className="text-ui font-hero text-5xl uppercase mb-4">Coming Soon...</h2>
            <p className="text-ui/40 font-subheading max-w-md">
              We're currently crafting our next collection. Sign up for our newsletter to be the first to know when we drop.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {merchItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group cursor-pointer"
                onClick={() => navigate(`/merch/${item.id}`)}
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-secondary mb-6">
                  <img 
                    src={item.images[0] || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800'} 
                    alt={item.label}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                    <div className="bg-white text-black px-8 py-3 rounded-full font-heading text-sm uppercase tracking-widest flex items-center space-x-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                      <span>View Details</span>
                      <ShoppingBag size={16} />
                    </div>
                  </div>
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className="bg-accent text-white px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold w-fit">
                      {item.tag}
                    </span>
                    {item.outOfStock && (
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold w-fit">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-heading text-ui uppercase tracking-tight mb-1">{item.label}</h3>
                    <p className="text-ui/40 text-xs uppercase tracking-widest font-bold">{item.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-heading text-accent">₦{item.amount.toLocaleString()}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Custom Order Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 p-12 md:p-20 bg-secondary rounded-[3rem] relative overflow-hidden text-center"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-hero text-white uppercase mb-6">WANT CUSTOM <br/><span className="text-accent">PRODUCTION GEAR?</span></h2>
            <p className="text-white/40 max-w-xl mx-auto mb-10 font-subheading">
              We offer personalized branding for production teams and studios. 
              Get in touch for bulk orders and custom designs.
            </p>
            <button className="group flex items-center space-x-4 mx-auto text-white hover:text-accent transition-colors">
              <span className="font-heading text-sm uppercase tracking-[0.3em]">Contact Sales</span>
              <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-accent transition-colors">
                <ArrowRight size={20} />
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default MerchPage;
