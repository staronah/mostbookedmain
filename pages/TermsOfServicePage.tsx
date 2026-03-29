
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const TermsOfServicePage: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32 pb-20 px-4 min-h-screen bg-primary text-ui"
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="font-hero text-5xl md:text-7xl mb-8 text-ui tracking-wider">Terms & Services</h1>
        <p className="text-grey mb-8 italic">Last updated: February 20, 2026</p>
        
        <div className="space-y-6 text-lg leading-relaxed font-body">
          <p>
            By using this website, you agree to our Terms and Conditions. This site provides information about MOSTBOOKED’s production services, including video production, equipment rental, podcast studio rental, YouTube growth services, and digital products.
          </p>
          
          <p>
            All bookings and payments made through the website are final unless otherwise stated. Payments are securely processed via Paystack.
          </p>
          
          <p>
            The website and its content are for personal and professional use only. Unauthorized copying, redistribution, or commercial use is not allowed.
          </p>
          
          <p>
            MostBooked is not responsible for the content or practices of external links or third-party services linked on this website.
          </p>
          
          <div className="pt-8 border-t border-ui/10">
            <p className="font-semibold text-ui">For questions, contact:</p>
            <Link to="/contact" className="text-accent hover:text-accent-hover transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TermsOfServicePage;
