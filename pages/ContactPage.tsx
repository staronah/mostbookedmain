
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, Instagram, Youtube, Twitter, Linkedin, CheckCircle2 } from 'lucide-react';
import PrimaryButton from '../components/ui/PrimaryButton';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsapp: '',
    subject: 'Video Production',
    customSubject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [commData, setCommData] = useState({
    contactAddress: 'Lekki Phase 1, Lagos',
    contactEmail: 'hello@mostbooked.ng',
    contactPhone: '+234 810 000 0000',
    instagramUrl: '',
    youtubeUrl: '',
    twitterUrl: '',
    linkedinUrl: '',
  });

  useEffect(() => {
    const fetchCommData = async () => {
      try {
        const docRef = doc(db, 'sites', 'mostbooked', 'communication', 'data');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCommData({
            contactAddress: data.contactAddress || 'Lekki Phase 1, Lagos',
            contactEmail: data.contactEmail || 'hello@mostbooked.ng',
            contactPhone: data.contactPhone || '+234 810 000 0000',
            instagramUrl: data.instagramUrl || '',
            youtubeUrl: data.youtubeUrl || '',
            twitterUrl: data.twitterUrl || '',
            linkedinUrl: data.linkedinUrl || '',
          });
        }
      } catch (err) {
        console.error("Error loading communication data in contact page:", err);
      }
    };
    fetchCommData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const finalSubject = formData.subject === 'Others' ? formData.customSubject : formData.subject;
      await addDoc(collection(db, 'sites', 'mostbooked', 'mail'), {
        fullName: formData.fullName,
        email: formData.email,
        whatsapp: formData.whatsapp,
        subject: finalSubject,
        message: formData.message,
        createdAt: serverTimestamp(),
        status: 'new'
      });
      setIsSuccess(true);
      setFormData({
        fullName: '',
        email: '',
        whatsapp: '',
        subject: 'Video Production',
        customSubject: '',
        message: '',
      });
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err) {
      console.error("Error submitting contact form:", err);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="pt-32 min-h-screen bg-primary">
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <span className="text-accent font-heading tracking-[0.3em] text-sm uppercase mb-4 block">Connect</span>
              <h1 className="text-ui font-hero text-4xl md:text-5xl lg:text-6xl leading-none mb-8 tracking-tightest font-black">
                LET'S MAKE <br/> <span className="text-accent">HISTORY</span>
              </h1>
              <p className="text-ui/60 font-body text-lg mb-12 max-w-md">
                Whether you have a fully-formed brief or just the spark of an idea, our team is ready to help you bring it to life.
              </p>

              <div className="space-y-8">
                <div className="flex items-center space-x-6">
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-accent">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-ui/40 text-[10px] uppercase tracking-widest">Email Us</p>
                    <a 
                      href="#contact-form" 
                      className="text-ui font-heading text-xl hover:text-accent transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      {commData.contactEmail}
                    </a>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-accent">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-ui/40 text-[10px] uppercase tracking-widest">Call Us</p>
                    <p className="text-ui font-heading text-xl">{commData.contactPhone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-accent">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-ui/40 text-[10px] uppercase tracking-widest">Visit Studio</p>
                    <p className="text-ui font-heading text-xl">{commData.contactAddress}</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mt-12">
                {commData.instagramUrl && commData.instagramUrl.trim() !== '' && commData.instagramUrl !== '#' && (
                  <a href={commData.instagramUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-secondary rounded-lg text-white/60 hover:text-accent transition-colors"><Instagram size={24} /></a>
                )}
                {commData.youtubeUrl && commData.youtubeUrl.trim() !== '' && commData.youtubeUrl !== '#' && (
                  <a href={commData.youtubeUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-secondary rounded-lg text-white/60 hover:text-accent transition-colors"><Youtube size={24} /></a>
                )}
                {commData.twitterUrl && commData.twitterUrl.trim() !== '' && commData.twitterUrl !== '#' && (
                  <a href={commData.twitterUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-secondary rounded-lg text-white/60 hover:text-accent transition-colors"><Twitter size={24} /></a>
                )}
                {commData.linkedinUrl && commData.linkedinUrl.trim() !== '' && commData.linkedinUrl !== '#' && (
                  <a href={commData.linkedinUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-secondary rounded-lg text-white/60 hover:text-accent transition-colors"><Linkedin size={24} /></a>
                )}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-secondary p-10 md:p-16 rounded-3xl border border-white/5 shadow-2xl shadow-accent/5"
          >
            {isSuccess ? (
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="text-accent" size={40} />
                </div>
                <h3 className="text-2xl font-heading text-white mb-4 uppercase tracking-tight">Message Sent!</h3>
                <p className="text-white/40 text-sm">Thank you for reaching out. We'll get back to you shortly via email or WhatsApp.</p>
                <button 
                  onClick={() => setIsSuccess(false)}
                  className="mt-8 text-accent text-xs uppercase tracking-widest font-bold hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form id="contact-form" className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-2">Full Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-primary border border-ui/10 p-5 rounded-xl text-ui focus:border-accent outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-2">Work Email</label>
                    <input 
                      type="email" 
                      required
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-primary border border-ui/10 p-5 rounded-xl text-ui focus:border-accent outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-2">WhatsApp Number (Optional)</label>
                  <input 
                    type="tel" 
                    placeholder="+234 810 000 0000"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full bg-primary border border-ui/10 p-5 rounded-xl text-ui focus:border-accent outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-2">Subject</label>
                  <select 
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-primary border border-ui/10 p-5 rounded-xl text-ui focus:border-accent outline-none transition-all appearance-none"
                  >
                    <option>Video Production</option>
                    <option>YouTube Strategy</option>
                    <option>Podcast Booking</option>
                    <option>Academy Inquiry</option>
                    <option>Others</option>
                  </select>
                </div>
                {formData.subject === 'Others' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2"
                  >
                    <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-2">Custom Subject</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Enter your subject"
                      value={formData.customSubject}
                      onChange={(e) => setFormData({ ...formData, customSubject: e.target.value })}
                      className="w-full bg-primary border border-ui/10 p-5 rounded-xl text-ui focus:border-accent outline-none transition-all"
                    />
                  </motion.div>
                )}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-2">Your Message</label>
                  <textarea 
                    required
                    placeholder="Tell us about your project goals..."
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-primary border border-ui/10 p-5 rounded-xl text-ui focus:border-accent outline-none transition-all resize-none"
                  />
                </div>
                <PrimaryButton 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center space-x-3 !py-5"
                >
                  <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                  <Send size={18} />
                </PrimaryButton>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="h-[400px] w-full bg-secondary overflow-hidden relative grayscale hover:grayscale-0 transition-all duration-1000">
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-primary/80 backdrop-blur-md px-8 py-4 rounded-full border border-accent/30 text-ui font-heading tracking-widest text-sm uppercase">
            MOSTBOOKED STUDIOS HQ
          </div>
        </div>
        <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover opacity-30" alt="Map View" />
      </section>
    </main>
  );
};

export default ContactPage;
