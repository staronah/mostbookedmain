
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Receipt, Clock, CreditCard, User, Tag, ChevronRight } from 'lucide-react';

const TransactionLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate('/auth');
        return;
      }
      setUser(currentUser);

      // Path: public/{uid}/transaction_logs/
      const logsRef = collection(db, 'public', currentUser.uid, 'transaction_logs');
      
      // Remove orderBy from Firestore query to avoid index issues or missing field filtering
      const unsubscribeLogs = onSnapshot(logsRef, (snapshot) => {
        const fetchedLogs = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Explicitly map nested fields for easier access if they exist
            productName: data.metadata?.productName || data.productName,
            fullName: data.metadata?.fullName || data.fullName,
            type: data.metadata?.type || data.type,
            date: data.metadata?.date || data.date,
            createdAt: data.createdAt || data.metadata?.date || data.date,
            gatewayResponse: data.fullPayload?.data?.gateway_response || data.gateway_response,
            amountPaid: data.amount?.naira ?? (typeof data.amount === 'number' ? data.amount / 100 : data.amount)
          };
        });

        // Sort in memory instead
        fetchedLogs.sort((a, b) => {
          const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date || 0);
          const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date || 0);
          return dateB.getTime() - dateA.getTime();
        });

        setLogs(fetchedLogs);
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching transaction logs:", error);
        setIsLoading(false);
      });

      return () => unsubscribeLogs();
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  const formatDate = (dateString: any) => {
    if (!dateString) return 'N/A';
    try {
      // Handle both ISO strings and Firestore Timestamps
      const date = dateString.toDate ? dateString.toDate() : new Date(dateString);
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
      {/* Decorative BG */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/30 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <button 
            onClick={() => navigate('/profile')}
            className="flex items-center text-accent text-[10px] uppercase tracking-[0.3em] font-bold mb-6 hover:opacity-70 transition-opacity group"
          >
            <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Profile
          </button>
          <div className="flex items-end justify-between">
            <div>
              <span className="text-accent font-heading tracking-[0.3em] text-sm uppercase mb-2 block">History</span>
              <h1 className="text-ui font-hero text-6xl md:text-8xl leading-none uppercase">TRANSACTION <br/><span className="text-accent">LOGS</span></h1>
            </div>
            <Receipt size={64} className="text-accent/10 hidden md:block mb-2" />
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-ui/30 font-heading text-[10px] uppercase tracking-widest">Retrieving Ledger...</p>
          </div>
        ) : logs.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {logs.map((log, idx) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-secondary/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 hover:border-accent/30 transition-all group relative overflow-hidden"
              >
                {/* Status Indicator */}
                <div className="absolute top-0 left-0 w-1 h-full bg-accent/30 group-hover:bg-accent transition-colors" />
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-5">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-accent/10 rounded-lg">
                        <Tag size={14} className="text-accent" />
                      </div>
                      <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Product Details</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-heading text-white uppercase tracking-tight group-hover:text-accent transition-colors">
                      {log.productName || 'General Payment'}
                    </h3>
                    <div className="flex items-center space-x-3 mt-2">
                      <span className="px-2 py-0.5 bg-white/5 rounded text-[8px] uppercase tracking-widest text-white/40 font-bold border border-white/5">
                        {log.type || 'Transaction'}
                      </span>
                      <span className="text-[9px] font-mono text-white/20">#{log.id.slice(-8).toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="md:col-span-3">
                    <div className="flex items-center space-x-3 mb-3">
                      <Clock size={14} className="text-accent" />
                      <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Timestamp</span>
                    </div>
                    <p className="text-white/70 font-body text-sm">{formatDate(log.date)}</p>
                  </div>

                  <div className="md:col-span-3 text-left md:text-right">
                    <div className="flex items-center md:justify-end space-x-3 mb-3">
                      <CreditCard size={14} className="text-accent" />
                      <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Amount Paid</span>
                    </div>
                    <p className="text-3xl font-heading text-white">
                      <span className="text-accent mr-1">₦</span>
                      {Number(log.amountPaid || 0).toLocaleString()}
                    </p>
                    <p className="text-[9px] uppercase tracking-widest text-white/20 font-bold mt-1">
                      Ref: {log.reference?.slice(0, 12)}...
                    </p>
                  </div>

                  <div className="md:col-span-1 flex justify-end">
                    <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-white/20 group-hover:text-accent group-hover:border-accent/30 transition-all">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>                {/* Expanded Details */}
                <div className="mt-8 pt-6 border-t border-white/5">
                  <div className="bg-black/20 rounded-2xl p-5 border border-white/5">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      <div>
                        <p className="text-[8px] uppercase tracking-[0.2em] text-white/20 font-bold mb-1.5">Customer</p>
                        <p className="text-[11px] text-white/80 font-medium truncate">{log.fullName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[8px] uppercase tracking-[0.2em] text-white/20 font-bold mb-1.5">Created At</p>
                        <p className="text-[11px] text-white/80 font-medium">{formatDate(log.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-[8px] uppercase tracking-[0.2em] text-white/20 font-bold mb-1.5">Status</p>
                        <div className="flex items-center space-x-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${log.status === 'success' || !log.status ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'}`} />
                          <p className={`text-[10px] font-bold uppercase tracking-widest ${log.status === 'success' || !log.status ? 'text-green-500' : 'text-red-500'}`}>
                            {log.status || 'Success'}
                          </p>
                        </div>
                      </div>
                      <div className="text-left lg:text-right">
                        <p className="text-[8px] uppercase tracking-[0.2em] text-white/20 font-bold mb-1.5">Gateway Response</p>
                        <p className="text-[10px] text-accent font-bold uppercase tracking-widest">{log.gatewayResponse || 'Approved'}</p>
                      </div>
                    </div>
                  </div>
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
            <Receipt size={48} className="text-white/5 mx-auto mb-6" />
            <p className="text-white/20 font-heading text-2xl uppercase tracking-widest">No transactions found</p>
            <p className="text-white/10 text-[10px] mt-4 uppercase tracking-[0.2em] font-bold">Your cinematic journey starts with your first booking</p>
            <button 
              onClick={() => navigate('/services')}
              className="mt-8 px-8 py-3 bg-accent/10 text-accent border border-accent/20 rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-accent hover:text-white transition-all"
            >
              Explore Services
            </button>
          </motion.div>
        )}
      </div>
    </main>
  );
};

export default TransactionLogsPage;
