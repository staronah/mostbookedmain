
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, getDocs, query, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Clock, Package, Tag, ExternalLink } from 'lucide-react';
import { MerchItem } from '../types';

const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [merchItems, setMerchItems] = useState<Record<string, MerchItem>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/auth');
        return;
      }
      setUser(currentUser);

      try {
        // 1. Fetch all merch items first to have a lookup table
        const merchRef = collection(db, 'sites', 'mostbooked', 'merch');
        const merchSnapshot = await getDocs(merchRef);
        const merchMap: Record<string, MerchItem> = {};
        merchSnapshot.docs.forEach(doc => {
          merchMap[doc.id] = { id: doc.id, ...doc.data() } as MerchItem;
        });
        setMerchItems(merchMap);

        // 2. Fetch transaction logs
        const logsRef = collection(db, 'public', currentUser.uid, 'transaction_logs');
        const unsubscribeLogs = onSnapshot(logsRef, (snapshot) => {
          const fetchedOrders = snapshot.docs
            .map(doc => {
              const data = doc.data();
              const metadata = data.metadata || {};
              const type = metadata.type || data.type;
              
              // Only process merch orders
              if (type !== 'merch') return null;

              const productName = metadata.productName || data.productName || '';
              const amountPaid = data.amount?.naira ?? (typeof data.amount === 'number' ? data.amount / 100 : data.amount);
              const date = data.date || metadata.date || data.createdAt;

              // Parse IDs and quantities from productName string
              // Format: "IDs: [ID1(qty1), ID2(qty2)] | ..."
              const idMatch = productName.match(/IDs: \[(.*?)\]/);
              const itemsList: any[] = [];

              if (idMatch && idMatch[1]) {
                const idStrings = idMatch[1].split(', ');
                idStrings.forEach((str: string) => {
                  const itemMatch = str.match(/(.*?)\((.*?)\)/);
                  if (itemMatch) {
                    const id = itemMatch[1];
                    const qty = parseInt(itemMatch[2]);
                    const merch = merchMap[id];
                    if (merch) {
                      itemsList.push({
                        id,
                        quantity: qty,
                        label: merch.label,
                        image: merch.images?.[0],
                        amount: merch.amount
                      });
                    }
                  } else {
                    // Fallback for old format without quantity
                    const id = str.trim();
                    const merch = merchMap[id];
                    if (merch) {
                      itemsList.push({
                        id,
                        quantity: 1,
                        label: merch.label,
                        image: merch.images?.[0],
                        amount: merch.amount
                      });
                    }
                  }
                });
              }

              return {
                id: doc.id,
                reference: data.reference,
                status: data.status,
                amountPaid,
                date,
                items: itemsList,
                fullDescription: productName
              };
            })
            .filter(order => order !== null && order.items.length > 0);

          // Sort by date
          fetchedOrders.sort((a, b) => {
            const dateA = new Date(a.date || 0);
            const dateB = new Date(b.date || 0);
            return dateB.getTime() - dateA.getTime();
          });

          setOrders(fetchedOrders);
          setIsLoading(false);
        });

        return () => unsubscribeLogs();
      } catch (error) {
        console.error("Error fetching order history:", error);
        setIsLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  const formatDate = (dateString: any) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-NG', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch (e) {
      return String(dateString);
    }
  };

  return (
    <main className="pt-32 pb-24 px-6 min-h-screen bg-primary relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/30 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <button 
            onClick={() => navigate('/cart')}
            className="flex items-center text-accent text-[10px] uppercase tracking-[0.3em] font-bold mb-6 hover:opacity-70 transition-opacity group"
          >
            <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Cart
          </button>
          <div className="flex items-end justify-between">
            <div>
              <span className="text-accent font-heading tracking-[0.3em] text-sm uppercase mb-2 block">Your Merch</span>
              <h1 className="text-ui font-hero text-6xl md:text-8xl leading-none uppercase">ORDER <br/><span className="text-accent">HISTORY</span></h1>
            </div>
            <ShoppingBag size={64} className="text-accent/10 hidden md:block mb-2" />
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-ui/30 font-heading text-[10px] uppercase tracking-widest">Loading Orders...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-8">
            {orders.map((order, idx) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-secondary/40 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden"
              >
                {/* Order Header */}
                <div className="p-6 md:p-8 border-b border-white/5 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent/10 rounded-2xl">
                      <Package size={24} className="text-accent" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1">Order Ref</p>
                      <h3 className="text-lg font-heading text-white uppercase tracking-tight">#{order.reference?.slice(0, 12).toUpperCase()}</h3>
                    </div>
                  </div>
                  
                  <div className="flex gap-8">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1">Date</p>
                      <p className="text-sm text-white/70 font-body">{formatDate(order.date)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1">Total Paid</p>
                      <p className="text-lg font-heading text-accent">₦{Number(order.amountPaid).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="p-6 md:p-8 space-y-6">
                  {order.items.map((item: any, itemIdx: number) => (
                    <div key={itemIdx} className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-primary shrink-0 border border-white/5">
                        <img 
                          src={item.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80'} 
                          alt={item.label}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-lg font-heading text-white uppercase tracking-tight mb-1">{item.label}</h4>
                            <p className="text-ui/40 text-[10px] uppercase tracking-widest">ID: {item.id}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-accent font-mono">₦{item.amount.toLocaleString()}</p>
                            <p className="text-ui/40 text-[10px] uppercase tracking-widest mt-1">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer / Status */}
                <div className="px-6 md:px-8 py-4 bg-white/5 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-green-500">Completed</span>
                  </div>
                  <button 
                    onClick={() => navigate('/profile/transactions')}
                    className="text-[10px] uppercase tracking-widest text-white/30 hover:text-accent transition-colors flex items-center gap-2"
                  >
                    View Transaction Log <ExternalLink size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-secondary/20 border border-dashed border-white/10 rounded-[2rem] py-32 text-center"
          >
            <ShoppingBag size={48} className="text-white/5 mx-auto mb-6" />
            <p className="text-white/20 font-heading text-2xl uppercase tracking-widest">No merch orders found</p>
            <p className="text-white/10 text-[10px] mt-4 uppercase tracking-[0.2em] font-bold">Your creator merch collection is waiting</p>
            <button 
              onClick={() => navigate('/merch')}
              className="mt-8 px-8 py-3 bg-accent/10 text-accent border border-accent/20 rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-accent hover:text-white transition-all"
            >
              Shop Merch
            </button>
          </motion.div>
        )}
      </div>
    </main>
  );
};

export default OrderHistoryPage;
