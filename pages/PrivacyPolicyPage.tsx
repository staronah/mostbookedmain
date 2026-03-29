
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32 pb-20 px-4 min-h-screen bg-primary text-ui"
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="font-hero text-5xl md:text-7xl mb-8 text-ui tracking-wider">Privacy Policy</h1>
        <p className="text-grey mb-8 italic">Last updated: February 20, 2026</p>
        
        <div className="space-y-6 text-lg leading-relaxed font-body">
          <p>
            We respect your privacy. Any personal information you provide, such as your name, email, or payment details, is used only to provide our services, process bookings, and communicate with you.
          </p>
          
          <p>
            We do not sell your information to third parties. Payments are securely processed via Paystack.
          </p>
          
          <p>
            By using this website, you agree to our Privacy Policy.
          </p>
          
          <div className="pt-8 border-t border-ui/10">
            <p className="font-semibold text-ui">For questions, contact:</p>
            <Link to="/contact" className="text-accent hover:text-accent-hover transition-colors">
              {/* Using a placeholder or the actual email if we have it, but Link to /contact is better */}
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PrivacyPolicyPage;
