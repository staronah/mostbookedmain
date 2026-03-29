
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Youtube, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useLoading } from '../../context/LoadingContext';

const Footer: React.FC = () => {
  const [footerTitle, setFooterTitle] = useState('');
  const [footerDescription, setFooterDescription] = useState('');
  const { registerItem, markLoaded } = useLoading();
  const [communicationData, setCommunicationData] = useState({
    contactAddress: '12 Admiralty Way, Lekki Phase 1, Lagos, Nigeria',
    contactEmail: 'hello@mostbooked.ng',
    contactPhone: '+234 810 000 0000',
    instagramUrl: '',
    linkedinUrl: '',
    twitterUrl: '',
    youtubeUrl: '',
  });

  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        const docRef = doc(db, 'sites', 'mostbooked', 'global_content', 'data');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.footerTitle) setFooterTitle(data.footerTitle);
          if (data.footerDescription) setFooterDescription(data.footerDescription);
        } else {
          setFooterTitle('MOSTBOOKED');
        }
      } catch (err) {
        console.error("Error loading global content in footer:", err);
        setFooterTitle('MOSTBOOKED');
      }
    };

    const fetchCommunicationData = async () => {
      try {
        const docRef = doc(db, 'sites', 'mostbooked', 'communication', 'data');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCommunicationData({
            contactAddress: data.contactAddress || 'Lekki Phase 1, Lagos, Nigeria',
            contactEmail: data.contactEmail || 'hello@mostbooked.ng',
            contactPhone: data.contactPhone || '+234 810 000 0000',
            instagramUrl: data.instagramUrl || '',
            linkedinUrl: data.linkedinUrl || '',
            twitterUrl: data.twitterUrl || '',
            youtubeUrl: data.youtubeUrl || '',
          });
        }
      } catch (err) {
        console.error("Error loading communication data in footer:", err);
      }
    };
    
    fetchGlobalData();
    fetchCommunicationData();
  }, []);

  const displayTitle = footerTitle || 'MOSTBOOKED';
  const displayDescription = footerDescription || "The standard for premium video production and digital growth strategy in Lagos, Nigeria. Immersive storytelling for a global audience.";

  const socialLinks = [
    { icon: Instagram, url: communicationData.instagramUrl },
    { icon: Twitter, url: communicationData.twitterUrl },
    { icon: Youtube, url: communicationData.youtubeUrl },
    { icon: Linkedin, url: communicationData.linkedinUrl },
  ].filter(link => link.url && link.url.trim() !== '' && link.url !== '#');

  return (
    <footer className="bg-primary pt-24 pb-12 border-t border-accent/10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-20">
        <div className="space-y-6">
          <Link to="/" className="text-xl font-hero text-ui tracking-tightest font-black uppercase">
            {displayTitle}<span className="text-accent">.</span>
          </Link>
          <p className="text-ui/70 font-body text-sm leading-relaxed">
            {displayDescription}
          </p>
          <div className="flex space-x-4">
            {socialLinks.map((social, i) => (
              <a 
                key={i} 
                href={social.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white/60 hover:text-accent hover:bg-secondary/80 transition-all"
              >
                <social.icon size={20} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-ui font-heading text-lg mb-8 uppercase tracking-widest">Quick Links</h4>
          <ul className="space-y-4">
            {['Portfolio', 'Services', 'Merch', 'Courses', 'Contact'].map(link => (
              <li key={link}>
                <Link to={`/${link.toLowerCase()}`} className="text-ui/60 hover:text-accent transition-colors text-sm font-subheading">
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-ui font-heading text-lg mb-8 uppercase tracking-widest">Studios</h4>
          <ul className="space-y-4">
            <li className="flex items-start space-x-3 text-ui/60 text-sm">
              <MapPin size={18} className="text-accent shrink-0" />
              <span>{communicationData.contactAddress}</span>
            </li>
            <li className="flex items-center space-x-3 text-ui/60 text-sm">
              <Phone size={18} className="text-accent shrink-0" />
              <span>{communicationData.contactPhone}</span>
            </li>
            <li className="flex items-center space-x-3 text-ui/60 text-sm">
              <Mail size={18} className="text-accent shrink-0" />
              <Link to="/contact" className="hover:text-accent transition-colors">
                {communicationData.contactEmail}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-12 border-t border-accent/10 flex flex-col md:flex-row justify-between items-center text-ui/40 text-[10px] uppercase tracking-[0.2em]">
        <p>&copy; {new Date().getFullYear()} {displayTitle.toUpperCase()} PRODUCTIONS. ALL RIGHTS RESERVED.</p>
        <div className="flex space-x-8 mt-4 md:mt-0">
          <Link to="/privacy-policy" className="hover:text-ui transition-colors">Privacy Policy</Link>
          <Link to="/terms-of-service" className="hover:text-ui transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
