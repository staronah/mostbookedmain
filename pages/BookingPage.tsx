
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SERVICES } from '../constants';
import { CheckCircle, Calendar, User, Briefcase, Camera, Video, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PrimaryButton from '../components/ui/PrimaryButton';
import { initiatePaystackPayment } from '../lib/payment';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

const BookingPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    serviceId: '',
    date: '',
    time: '',
    name: '',
    email: '',
    details: '',
  });

  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "public", currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
          setFormData(prev => ({
            ...prev,
            name: userDoc.data().fullName || '',
            email: currentUser.email || ''
          }));
        }
      }
      setIsAuthReady(true);
    });
    return () => unsubscribeAuth();
  }, []);

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-primary pt-32 pb-24 px-6 flex items-center justify-center">
        <p className="text-ui/40 font-heading uppercase tracking-widest text-sm">Checking authentication...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-primary pt-32 pb-24 px-6 relative overflow-hidden flex items-center justify-center">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-3xl -z-10" />
        
        <div className="max-w-md w-full text-center bg-secondary/80 backdrop-blur-2xl border border-white/10 p-12 rounded-3xl shadow-2xl">
          <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <User size={40} className="text-accent" />
          </div>
          <h2 className="text-3xl font-hero text-ui mb-4 uppercase">Login Required</h2>
          <p className="text-ui/60 mb-8 font-body">You must be logged in to book a service or rent our studio.</p>
          <PrimaryButton onClick={() => navigate('/auth')} className="w-full justify-center">
            Login to Continue
          </PrimaryButton>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-heading text-ui mb-8">Select Your Service</h2>
            <div className="grid grid-cols-1 gap-4">
              {SERVICES.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    setFormData({ ...formData, serviceId: s.id });
                    nextStep();
                  }}
                  className={`p-6 rounded-2xl text-left transition-all duration-300 border ${formData.serviceId === s.id ? 'border-accent bg-accent/5' : 'border-ui/10 bg-secondary hover:bg-secondary/90'}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className={`text-xl font-heading ${formData.serviceId === s.id ? 'text-ui' : 'text-white'}`}>{s.title}</h3>
                      <p className={`${formData.serviceId === s.id ? 'text-ui/40' : 'text-white/40'} text-sm`}>{s.price}</p>
                    </div>
                    {formData.serviceId === s.id && <CheckCircle className="text-accent" />}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-heading text-ui mb-8">Choose a Time</h2>
            <div className="space-y-4">
              <input 
                type="date" 
                className="w-full bg-secondary border border-ui/10 p-4 rounded-xl text-ui focus:border-accent outline-none"
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
              <div className="grid grid-cols-3 gap-3">
                {['09:00', '11:00', '13:00', '15:00', '17:00', '19:00'].map(t => (
                  <button
                    key={t}
                    onClick={() => setFormData({ ...formData, time: t })}
                    className={`py-3 rounded-lg border transition-all ${formData.time === t ? 'bg-accent border-accent text-white' : 'bg-secondary border-white/10 text-white/60 hover:bg-secondary/80'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-between pt-8">
              <button onClick={prevStep} className="flex items-center text-ui/40 hover:text-ui transition-colors">
                <ArrowLeft className="mr-2" size={20} /> Back
              </button>
              <PrimaryButton onClick={nextStep} className="!px-12">
                Continue
              </PrimaryButton>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-heading text-ui mb-8">Final Details</h2>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Full Name"
                className="w-full bg-secondary border border-ui/10 p-4 rounded-xl text-ui focus:border-accent outline-none"
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <input 
                type="email" 
                placeholder="Email Address"
                className="w-full bg-secondary border border-ui/10 p-4 rounded-xl text-ui focus:border-accent outline-none"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <textarea 
                placeholder="Project details, goals, or references..."
                rows={4}
                className="w-full bg-secondary border border-ui/10 p-4 rounded-xl text-ui focus:border-accent outline-none"
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              />
            </div>
            <div className="flex justify-between pt-8">
              <button onClick={prevStep} className="flex items-center text-ui/40 hover:text-ui transition-colors">
                <ArrowLeft className="mr-2" size={20} /> Back
              </button>
              <PrimaryButton onClick={nextStep}>
                Confirm Booking
              </PrimaryButton>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle size={48} className="text-accent" />
            </div>
            <h2 className="text-4xl font-hero text-ui mb-4">CONFIRMED!</h2>
            <p className="text-ui/60 mb-12 max-w-sm mx-auto">
              We've received your booking request for <strong>{formData.serviceId}</strong>. 
              Expect an email from our production team within 24 hours.
            </p>
            <div className="flex flex-col gap-4">
              <PrimaryButton onClick={() => initiatePaystackPayment(
                10000, 
                formData.email, 
                `booking_${formData.serviceId}_${Date.now()}`,
                user?.uid || 'guest',
                formData.name || 'Guest',
                formData.serviceId,
                'service',
                undefined,
                formData.serviceId
              )}>
                Pay Now
              </PrimaryButton>
              <button onClick={() => navigate('/')} className="text-ui/40 hover:text-ui transition-colors">
                Return Home
              </button>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-primary pt-32 pb-24 px-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-3xl -z-10" />

      <div className="max-w-xl mx-auto">
        <div className="mb-12">
          <p className="text-accent font-heading tracking-widest text-xs mb-2 uppercase">Booking Experience</p>
          <h1 className="text-ui font-hero text-5xl md:text-6xl mb-4 leading-none">START YOUR <br/>PRODUCTION</h1>
          
          {/* Progress Bar */}
          <div className="flex space-x-2 mt-8">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-accent' : 'bg-ui/10'}`} />
            ))}
          </div>
        </div>

        <div className="bg-primary border border-ui/10 p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
