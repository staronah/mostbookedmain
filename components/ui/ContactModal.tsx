
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, MessageCircle, Calendar, Send, CheckCircle2 } from 'lucide-react';
import PrimaryButton from './PrimaryButton';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';

interface ContactModalProps {
  serviceTitle: string;
  onClose: () => void;
  contactInfo: { email: string; whatsapp: string };
}

const ContactModal: React.FC<ContactModalProps> = ({ serviceTitle, onClose, contactInfo }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [method, setMethod] = useState<'email' | 'whatsapp'>('whatsapp');
  const [userEmail, setUserEmail] = useState('');
  const [userWhatsApp, setUserWhatsApp] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email || '');
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSend = async () => {
    setIsSubmitting(true);
    try {
      const inquiryData = {
        serviceTitle,
        startDate,
        endDate,
        userEmail: userEmail || 'no-email@provided.com',
        userWhatsApp: userWhatsApp || '',
        userMessage: userMessage || '',
        status: 'new',
        createdAt: serverTimestamp(),
        type: method === 'whatsapp' ? 'whatsapp_inquiry' : 'email_inquiry'
      };

      // Save to site-wide inquiries
      await addDoc(collection(db, 'sites', 'mostbooked', 'inquiries_contactus'), {
        ...inquiryData,
        category: 'contactus'
      });

      // Save to user-specific inquiries if logged in
      if (userId) {
        await addDoc(collection(db, 'public', userId, 'inquiries_contactus'), {
          ...inquiryData,
          category: 'contactus'
        });
      }

      if (method === 'whatsapp') {
        const baseMessage = `Hello MOSTBOOKED Team,

I am interested in booking your "${serviceTitle}" service. 

Here are my preferred dates:
- Date Needed: ${startDate}
- Return/End Date: ${endDate}

I would appreciate more information regarding availability and the next steps for this booking.

Looking forward to your response.`;
        const encodedMessage = encodeURIComponent(baseMessage);
        const cleanNumber = contactInfo.whatsapp.replace(/\D/g, '');
        const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
        onClose();
      } else {
        setIsSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error("Error sending inquiry:", error);
      alert("Failed to send inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-secondary border border-white/10 rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh] scrollbar-hide"
        >
          {isSuccess ? (
            <div className="py-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 className="text-accent" size={40} />
              </motion.div>
              <h3 className="text-2xl font-heading text-white mb-2 uppercase tracking-tight">Sent Successfully!</h3>
              <p className="text-white/40 text-sm">We'll get back to you shortly via email or WhatsApp.</p>
            </div>
          ) : (
            <>
              <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <h3 className="text-2xl font-heading text-white mb-2 uppercase tracking-tight">Contact Us</h3>
              <p className="text-white/40 text-xs uppercase tracking-widest mb-8">Inquiry for {serviceTitle}</p>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2 font-black">Date Needed</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" size={18} />
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-accent transition-colors [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2 font-black">Return Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" size={18} />
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-accent transition-colors [color-scheme:dark]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2 font-black">Contact Via</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setMethod('whatsapp')}
                      className={`flex items-center justify-center space-x-2 py-3 rounded-xl border transition-all ${method === 'whatsapp' ? 'bg-accent/10 border-accent text-accent' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'}`}
                    >
                      <MessageCircle size={18} />
                      <span className="text-xs font-heading uppercase">WhatsApp</span>
                    </button>
                    <button
                      onClick={() => setMethod('email')}
                      className={`flex items-center justify-center space-x-2 py-3 rounded-xl border transition-all ${method === 'email' ? 'bg-accent/10 border-accent text-accent' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'}`}
                    >
                      <Mail size={18} />
                      <span className="text-xs font-heading uppercase">Email</span>
                    </button>
                  </div>
                </div>

                {method === 'email' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2 font-black">Your Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" size={18} />
                        <input
                          type="email"
                          placeholder="your@email.com"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-accent transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2 font-black">WhatsApp Number (Optional)</label>
                      <div className="relative">
                        <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" size={18} />
                        <input
                          type="tel"
                          placeholder="+1 234 567 890"
                          value={userWhatsApp}
                          onChange={(e) => setUserWhatsApp(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-accent transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2 font-black">Additional Notes</label>
                      <textarea
                        placeholder="Any specific requirements?"
                        value={userMessage}
                        onChange={(e) => setUserMessage(e.target.value)}
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-accent transition-colors resize-none"
                      />
                    </div>
                  </motion.div>
                )}

                <PrimaryButton
                  onClick={handleSend}
                  disabled={!startDate || !endDate || (method === 'email' && !userEmail) || isSubmitting}
                  className="w-full mt-4"
                >
                  {isSubmitting ? 'Sending...' : method === 'whatsapp' ? 'Open WhatsApp' : 'Send Inquiry'}
                </PrimaryButton>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ContactModal;
