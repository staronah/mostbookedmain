
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Youtube, Mic, ChevronDown, Check, Briefcase, Video, Settings, Star, Loader2 } from 'lucide-react';
import PrimaryButton from '../ui/PrimaryButton';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { Service } from '../../types';
import { useLoading } from '../../context/LoadingContext';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import ContactModal from '../ui/ContactModal';

const IconMap: Record<string, React.ReactNode> = {
  camera: <Camera className="text-accent" size={32} />,
  youtube: <Youtube className="text-accent" size={32} />,
  mic: <Mic className="text-accent" size={32} />,
  briefcase: <Briefcase className="text-accent" size={32} />,
  video: <Video className="text-accent" size={32} />,
  settings: <Settings className="text-accent" size={32} />,
  star: <Star className="text-accent" size={32} />,
};

const ServicesPreview: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [contactInfo, setContactInfo] = useState({ email: '', whatsapp: '' });
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const navigate = useNavigate();
  const { registerItem, markLoaded } = useLoading();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "public", currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      }
    });

    const fetchContactInfo = async () => {
      try {
        const contactDoc = await getDoc(doc(db, 'sites', 'mostbooked', 'bookings', 'contact'));
        if (contactDoc.exists()) {
          setContactInfo(contactDoc.data() as { email: string; whatsapp: string });
        }
      } catch (err) {
        console.error("Error fetching contact info:", err);
      }
    };

    const fetchServices = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'sites', 'mostbooked', 'services'));
        const fetchedServices: Service[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          
          // Mapping based on user's screenshot structure:
          // description is at the root
          // features is a map containing title, price, icon
          const featuresMap = data.features || {};
          const imagesMap = data.images || {};
          
          // Extract images from keys 0, 1, 2, 3, 4
          const images = [
            imagesMap['0'],
            imagesMap['1'],
            imagesMap['2'],
            imagesMap['3'],
            imagesMap['4']
          ].filter(Boolean);
          
          return {
            id: doc.id,
            title: featuresMap.title || data.title || 'Untitled Service',
            icon: featuresMap.icon || data.icon || 'camera',
            description: data.description || '',
            price: featuresMap.price || data.price || 'Contact for Quote',
            // If there's an actual list of features (bullet points), use it, 
            // otherwise default to a message or empty array
            features: Array.isArray(data.featuresList) ? data.featuresList : (data.featuresList ? [data.featuresList] : []),
            images: images.length > 0 ? images : undefined
          };
        });
        setServices(fetchedServices);
      } catch (err) {
        console.error("Error fetching services from Firestore:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
    fetchContactInfo();
    return () => unsubscribeAuth();
  }, []);

  const formatPrice = (price: string) => {
    // If it's a numeric string, add the prefix and Naira sign
    if (!isNaN(Number(price))) {
      return `Starting from ₦${price}`;
    }
    // If it's already a descriptive string, just return it
    return price;
  };

  return (
    <section className="py-24 bg-primary">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-ui font-hero text-5xl md:text-6xl mb-4 uppercase tracking-tightest font-black">Core Expertise</h2>
            <div className="w-20 h-1 bg-accent mx-auto mb-6" />
            <p className="text-ui/60 font-body max-w-xl mx-auto">
              From single camera setups to multi-city documentary productions, we scale to your needs.
            </p>
          </motion.div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-accent mb-4" size={40} strokeWidth={1} />
            <p className="text-ui/30 font-heading text-xs uppercase tracking-widest">Loading solutions...</p>
          </div>
        ) : services.length > 0 ? (
          <div className="space-y-6">
            {services.map((service) => (
              <div 
                key={service.id}
                className={`border border-white/5 transition-all duration-500 rounded-2xl overflow-hidden ${expandedId === service.id ? 'bg-secondary border-accent/30 shadow-2xl shadow-black/40' : 'bg-secondary/90 hover:bg-secondary'}`}
              >
                <button
                  onClick={() => setExpandedId(expandedId === service.id ? null : service.id)}
                  className="w-full flex items-center justify-between p-6 md:p-10 text-left group"
                >
                  <div className="flex items-center space-x-4 md:space-x-8">
                    <div className="p-3 md:p-4 bg-white/5 rounded-xl group-hover:bg-accent/10 transition-colors">
                      {IconMap[service.icon.toLowerCase()] || IconMap['camera']}
                    </div>
                    <div>
                      <h3 className="text-white font-heading text-xl md:text-2xl mb-1 uppercase tracking-tight">{service.title}</h3>
                      <p className="text-white/40 text-[9px] md:text-[10px] font-subheading uppercase tracking-[0.2em] font-bold">{formatPrice(service.price)}</p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedId === service.id ? 180 : 0 }}
                    className="text-white/30 group-hover:text-accent transition-colors"
                  >
                    <ChevronDown size={32} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {expandedId === service.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                    >
                      {/* Service Gallery */}
                      {service.images && service.images.length > 0 && (
                        <div className="px-8 md:px-12 pt-8">
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {service.images.map((img, idx) => (
                              <motion.div 
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="aspect-square rounded-2xl overflow-hidden border border-white/5 shadow-2xl"
                              >
                                <img 
                                  src={img} 
                                  alt={`${service.title} ${idx + 1}`} 
                                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                                  referrerPolicy="no-referrer"
                                />
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="px-8 md:px-12 pb-12 grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-white/5 pt-8 mt-4 mx-8">
                        <div>
                          <p className="text-white/70 text-lg font-body leading-relaxed mb-8">
                            {service.description}
                          </p>
                          {service.features.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {service.features.map((feature, idx) => (
                                <div key={idx} className="flex items-center space-x-3 text-white/60">
                                  <Check size={18} className="text-accent" />
                                  <span className="text-sm font-body">{feature}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col justify-center items-start md:items-end">
                          <div className="p-10 bg-white/5 rounded-3xl w-full md:w-auto text-center md:text-right border border-white/5 shadow-inner">
                            <p className="text-[10px] uppercase tracking-widest text-white/40 mb-3 font-black">Service Package</p>
                            <p className="text-4xl font-heading text-white mb-8">{formatPrice(service.price)}</p>
                            <PrimaryButton onClick={() => {
                              setSelectedService(service);
                            }} className="w-full">
                              Contact Us
                            </PrimaryButton>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-ui/5 rounded-3xl border border-dashed border-ui/10">
            <p className="text-ui/20 font-heading text-xl uppercase tracking-widest">No services found.</p>
          </div>
        )}
      </div>

      {selectedService && (
        <ContactModal 
          serviceTitle={selectedService.title}
          onClose={() => setSelectedService(null)}
          contactInfo={contactInfo}
        />
      )}
    </section>
  );
};

export default ServicesPreview;
