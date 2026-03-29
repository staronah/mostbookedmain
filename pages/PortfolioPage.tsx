
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import PortfolioGrid from '../components/sections/PortfolioGrid';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import SEO from '../components/layout/SEO';
import { getYoutubeEmbedUrl } from '../lib/utils';

const PortfolioPage: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [useYoutube, setUseYoutube] = useState(true);
  const [youtubeUrl, setYoutubeUrl] = useState('https://www.youtube.com/embed/9oRWxopIQ9o?autoplay=1&mute=1&loop=1&playlist=9oRWxopIQ9o&controls=0&modestbranding=1&playsinline=1&rel=0');
  const [videoVisible, setVideoVisible] = useState(false);
  const [worksYearRange, setWorksYearRange] = useState('2023-24');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Fetch background video from Firestore path: sites/mostbooked/global_content/data
    const fetchPortfolioData = async () => {
      try {
        const docRef = doc(db, 'sites', 'mostbooked', 'global_content', 'data');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUseYoutube(String(data.heroUseYoutube) !== 'false');
          if (data.heroYoutubeUrl) setYoutubeUrl(getYoutubeEmbedUrl(data.heroYoutubeUrl));
          if (data.heroBgVideoUrl) setVideoUrl(data.heroBgVideoUrl);
        } else {
          setUseYoutube(false);
          setVideoUrl("https://assets.mixkit.co/videos/preview/mixkit-urban-fashion-man-in-the-city-at-night-40291-large.mp4");
        }
      } catch (err) {
        console.error("Error loading Firestore data in portfolio:", err);
        setUseYoutube(false);
        setVideoUrl("https://assets.mixkit.co/videos/preview/mixkit-urban-fashion-man-in-the-city-at-night-40291-large.mp4");
      }
    };

    // Fetch works year range from Firestore path: sites/mostbooked/statistics/data
    const fetchStatsData = async () => {
      try {
        const statsDocRef = doc(db, 'sites', 'mostbooked', 'statistics', 'data');
        const statsSnap = await getDoc(statsDocRef);
        if (statsSnap.exists()) {
          const data = statsSnap.data();
          if (data.works_year_range) setWorksYearRange(data.works_year_range);
        }
      } catch (err) {
        console.error("Error loading stats data in portfolio:", err);
      }
    };
    
    fetchPortfolioData();
    fetchStatsData();
  }, []);

  useEffect(() => {
    if (videoUrl && videoRef.current) {
      const video = videoRef.current;
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      
      const playVideo = async () => {
        try {
          await video.play();
        } catch (error) {
          console.warn("Portfolio video play failed:", error);
        }
      };

      playVideo();
    }
  }, [videoUrl]);

  return (
    <main className="pt-24 bg-primary min-h-screen">
      <SEO 
        title="Portfolio Gallery | MOSTBOOKED" 
        description="Explore our cinematic works, commercials, and YouTube productions. See why we are the standard for visual excellence."
      />
      {/* Portfolio Hero with Video Background */}
      <section className="relative min-h-[70vh] flex flex-col justify-center overflow-hidden px-6 pt-20 bg-primary">
        {/* Background Video */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-primary">
          <AnimatePresence>
            {useYoutube ? (
              <motion.iframe
                key={youtubeUrl}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2 }}
                width="100%"
                height="100%"
                src={youtubeUrl}
                title="Portfolio Background"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-screen min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2"
                onLoad={() => setVideoVisible(true)}
              />
            ) : videoUrl && (
              <motion.video
                ref={videoRef}
                key={videoUrl}
                initial={{ opacity: 0 }}
                animate={{ opacity: videoVisible ? 1 : 0 }}
                transition={{ duration: 2 }}
                src={videoUrl}
                muted
                loop
                playsInline
                autoPlay
                preload="auto"
                onCanPlayThrough={() => {
                  setVideoVisible(true);
                  if (videoRef.current) videoRef.current.play();
                }}
                className="w-full h-full object-cover"
              />
            )}
          </AnimatePresence>
          {/* Cinema gradient overlay */}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-ui font-hero text-[60px] md:text-[100px] lg:text-[140px] leading-[0.9] mb-8 tracking-tightest font-black">
              WORKS <br/> 
              <span className="text-accent">{worksYearRange}</span>
            </h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-white/80 font-body max-w-xl uppercase tracking-[0.25em] text-[10px] md:text-sm leading-relaxed"
            >
              A selection of our most impactful cinematic projects across commercials, music videos, and digital growth strategy.
            </motion.p>
          </motion.div>
        </div>

        {/* Decorative scroll line */}
        <motion.div 
          animate={{ height: [40, 80, 40] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px bg-accent/30 hidden md:block"
        />
      </section>

      {/* Grid Section - Fetching from 'projects' collection */}
      <PortfolioGrid collectionPath="sites/mostbooked/projects" isPortfolioPage={true} />
      
      {/* Footer CTA specifically for Portfolio */}
      <section className="py-32 bg-secondary relative border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center px-6">
          <span className="text-accent font-heading tracking-[0.4em] text-[10px] uppercase mb-4 block">Collaboration</span>
          <h2 className="text-white font-hero text-5xl md:text-6xl mb-12">HAVE A UNIQUE VISION?</h2>
          <Link 
            to="/contact"
            className="group relative inline-block px-12 py-5 overflow-hidden border border-accent/30"
          >
            <span className="relative z-10 text-white font-subheading uppercase tracking-widest font-bold group-hover:text-secondary transition-colors duration-500">TELL US ABOUT IT</span>
            <div className="absolute inset-0 bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </Link>
        </div>
      </section>
    </main>
  );
};

export default PortfolioPage;
