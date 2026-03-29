
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HeroSection from '../components/sections/HeroSection';
import PortfolioGrid from '../components/sections/PortfolioGrid';
import ServicesPreview from '../components/sections/ServicesPreview';
import { motion } from 'motion/react';
import { TESTIMONIALS } from '../constants';
import { Quote, Loader2, ShoppingBag, ArrowRight, Package } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { Testimonial, MerchItem } from '../types';
import { useLoading } from '../context/LoadingContext';
import SEO from '../components/layout/SEO';

interface StatItem {
  label: string;
  value: string;
}

const HomePage: React.FC = () => {
  const [stats, setStats] = useState<StatItem[]>([
    { label: 'Views Generated', value: '250M+' },
    { label: 'Subscribers Added', value: '5M+' },
    { label: 'Awards Won', value: '12' },
    { label: 'Projects Done', value: '1,200+' },
  ]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(TESTIMONIALS);
  const [merchItems, setMerchItems] = useState<MerchItem[]>([]);
  const [isTestimonialsLoading, setIsTestimonialsLoading] = useState(true);
  const [isMerchLoading, setIsMerchLoading] = useState(true);
  const { registerItem, markLoaded } = useLoading();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch statistics from Firestore path: sites/mostbooked/statistics/data
    const fetchStats = async () => {
      try {
        const docRef = doc(db, 'sites', 'mostbooked', 'statistics', 'data');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          const mapping = [
            { id: 'views_generated', label: 'Views Generated' },
            { id: 'subscribers_added', label: 'Subscribers Added' },
            { id: 'awards_won', label: 'Awards Won' },
            { id: 'projects_done', label: 'Projects Done' },
          ];

          const statsArray = mapping.map(item => {
            const rawValue = data[item.id];
            
            let displayValue = '0';
            let displayLabel = item.label;

            if (typeof rawValue === 'object' && rawValue !== null) {
              displayValue = rawValue.value || '0';
              displayLabel = rawValue.label || item.label;
            } else if (rawValue !== undefined) {
              displayValue = String(rawValue);
            }

            return {
              label: displayLabel,
              value: displayValue
            };
          });

          if (statsArray.length > 0) {
            setStats(statsArray);
          }
        }
      } catch (err) {
        console.error("Error loading stats from Firestore:", err);
      }
    };

    const fetchTestimonials = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'sites', 'mostbooked', 'reputation'));
        const fetchedTestimonials: Testimonial[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || 'Anonymous',
            role: data.role || 'Client',
            content: data.content || '',
            avatar: data.avatar || `https://i.pravatar.cc/150?u=${doc.id}`
          };
        });
        
        if (fetchedTestimonials.length > 0) {
          setTestimonials(fetchedTestimonials);
        }
      } catch (err) {
        console.error("Error fetching testimonials from Firestore:", err);
      } finally {
        setIsTestimonialsLoading(false);
      }
    };

    const fetchMerch = async () => {
      try {
        const merchRef = collection(db, 'sites', 'mostbooked', 'merch');
        const q = query(merchRef, orderBy('createdAt', 'desc'), limit(4));
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
            createdAt: data.createdAt
          };
        });
        
        setMerchItems(items);
      } catch (error) {
        console.error('Error fetching merch:', error);
      } finally {
        setIsMerchLoading(false);
      }
    };

    fetchStats();
    fetchTestimonials();
    fetchMerch();
  }, []);

  return (
    <main>
      <SEO 
        title="Home | MOSTBOOKED" 
        description="Premium video production and YouTube growth strategy in Lagos. We help you become the most booked creator in your niche."
      />
      <HeroSection />
      
      {/* Stats Counter Section */}
      <section className="py-20 bg-primary border-y border-accent/10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:md:grid-cols-4 gap-12 text-center">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <h3 className="text-4xl md:text-5xl font-hero text-accent mb-2">{stat.value}</h3>
              <p className="text-ui/70 text-xs uppercase tracking-[0.2em] font-subheading">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <PortfolioGrid collectionPath="sites/mostbooked/global_content/data/videos" />

      <ServicesPreview />

      {/* Testimonials */}
      <section className="py-24 bg-primary overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-16">
          <h2 className="text-ui font-hero text-5xl text-center uppercase tracking-tight">Client Voice</h2>
          <div className="w-20 h-1 bg-accent mx-auto mt-4" />
        </div>

        {isTestimonialsLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
             <Loader2 className="animate-spin text-accent mb-4" size={40} strokeWidth={1} />
             <p className="text-ui/60 font-heading text-xs uppercase tracking-widest">Collecting feedback...</p>
          </div>
        ) : (
          <div className="flex animate-scroll whitespace-nowrap py-12 px-6">
            {(testimonials.length > 0 ? Array(8).fill(testimonials).flat() : []).map((t, idx) => (
              <div key={`${t.id}-${idx}`} className="inline-block min-w-[350px] md:min-w-[450px] mr-8 bg-secondary p-10 rounded-3xl border border-white/5 shadow-2xl">
                <Quote className="text-accent mb-6 opacity-40" size={40} />
                <p className="text-white/80 font-accent italic text-xl mb-8 leading-relaxed whitespace-normal">
                  "{t.content}"
                </p>
                <div className="flex items-center space-x-4">
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full border border-accent/30 object-cover" />
                  <div>
                    <h4 className="text-white font-heading text-lg uppercase">{t.name}</h4>
                    <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Merch Preview Section */}
      <section className="py-32 bg-primary">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl">
              <span className="text-accent font-heading tracking-[0.3em] text-sm uppercase mb-4 block">The Collection</span>
              <h2 className="text-ui font-hero text-6xl md:text-8xl leading-none uppercase">CREATOR <br/><span className="text-accent text-outline">ESSENTIALS</span></h2>
            </div>
            <Link to="/merch" className="group flex items-center space-x-4 text-ui hover:text-accent transition-colors">
              <span className="font-heading text-sm uppercase tracking-[0.2em]">View All Merch</span>
              <div className="w-12 h-12 rounded-full border border-ui/20 flex items-center justify-center group-hover:border-accent transition-colors">
                <ArrowRight size={20} />
              </div>
            </Link>
          </div>

          {isMerchLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-accent mb-4" size={40} strokeWidth={1} />
              <p className="text-ui/60 font-heading text-xs uppercase tracking-widest">Loading Merch...</p>
            </div>
          ) : merchItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Package className="text-accent/20 mb-4" size={64} />
              <h3 className="text-ui font-hero text-4xl uppercase mb-2">Coming Soon...</h3>
              <p className="text-ui/40 font-subheading">New collection dropping soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {merchItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group"
                >
                  <Link to={`/merch/${item.id}`}>
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
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-heading text-ui uppercase tracking-tight mb-1">{item.label}</h3>
                        <p className="text-ui/40 text-[10px] uppercase tracking-widest font-bold">₦{item.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Final - Studio Lounge Vibe */}
      <section className="py-32 bg-secondary relative overflow-hidden group">
        <motion.div 
           initial={{ scale: 0.8, opacity: 0 }}
           whileInView={{ scale: 1, opacity: 1 }}
           className="max-w-4xl mx-auto px-6 text-center relative z-10"
        >
          <h2 className="text-primary font-hero text-4xl md:text-6xl mb-8 leading-none uppercase">READY TO BE THE <span className="text-accent">MOSTBOOKED</span>?</h2>
          <Link 
            to="/contact"
            className="inline-block px-12 py-5 bg-accent text-white font-hero text-2xl tracking-[0.2em] hover:bg-white hover:text-accent transition-all duration-500 shadow-2xl shadow-accent/20"
          >
            START YOUR JOURNEY
          </Link>
        </motion.div>
        {/* Floating Background Shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
      </section>
    </main>
  );
};

export default HomePage;
