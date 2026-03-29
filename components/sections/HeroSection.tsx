
import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import PrimaryButton from '../ui/PrimaryButton';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useLoading } from '../../context/LoadingContext';
import { getYoutubeEmbedUrl } from '../../lib/utils';
import { ArrowRight } from 'lucide-react';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [displayText, setDisplayText] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [useYoutube, setUseYoutube] = useState(true);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroDescription, setHeroDescription] = useState('');
  const [videoVisible, setVideoVisible] = useState(false);
  const fullText = "PREMIUM VIDEO PRODUCTION";
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { registerItem, markLoaded } = useLoading();

  // Framer motion scroll tracking
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  const textY = useTransform(scrollYProgress, [0, 1], [0, 250]);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  useEffect(() => {
    registerItem('hero-video');
    // Typing animation
    let i = 0;
    const interval = setInterval(() => {
      setDisplayText(fullText.substring(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 100);

    // Fetch dynamic content
    const fetchData = async () => {
      try {
        const docRef = doc(db, 'sites', 'mostbooked', 'global_content', 'data');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUseYoutube(String(data.heroUseYoutube) !== 'false');
          if (data.heroYoutubeUrl) setYoutubeUrl(getYoutubeEmbedUrl(data.heroYoutubeUrl));
          if (data.heroBgVideoUrl) setVideoUrl(data.heroBgVideoUrl);
          if (data.heroTitle) setHeroTitle(data.heroTitle);
          if (data.heroDescription) setHeroDescription(data.heroDescription);
        } else {
          setUseYoutube(false);
          setHeroTitle('MOSTBOOKED');
        }
      } catch (err) {
        console.error("Error loading Firestore data in hero:", err);
        setUseYoutube(false);
        setHeroTitle('MOSTBOOKED');
      }
    };

    fetchData();

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (videoUrl && videoRef.current) {
      const video = videoRef.current;
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      
      const playVideo = async () => {
        try {
          // Only attempt to play if the component is still mounted
          if (isMounted) {
            const playPromise = video.play();
            if (playPromise !== undefined) {
              await playPromise;
              if (isMounted) setVideoVisible(true);
            }
          }
        } catch (error: any) {
          // Ignore AbortError which happens when play is interrupted by pause or removal
          if (error.name !== 'AbortError') {
            console.warn("Autoplay blocked or failed:", error);
          }
        }
      };

      playVideo();
    }

    return () => {
      isMounted = false;
    };
  }, [videoUrl]);

  return (
    <section 
      ref={sectionRef}
      className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-primary"
    >
      {/* Cinematic Background Video */}
      <motion.div 
        style={{ scale: videoScale }}
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-primary"
      >
        <AnimatePresence mode="wait">
          {useYoutube ? (
            youtubeUrl && (
              <motion.iframe
                key={youtubeUrl}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
                width="100%"
                height="100%"
                src={youtubeUrl}
                title="Hero Background"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-screen min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2"
                onLoad={() => {
                  setVideoVisible(true);
                  markLoaded('hero-video');
                }}
              />
            )
          ) : videoUrl && (
            <motion.video
              ref={videoRef}
              key={videoUrl}
              initial={{ opacity: 0 }}
              animate={{ opacity: videoVisible ? 1 : 0 }}
              transition={{ duration: 1.5 }}
              src={videoUrl}
              muted
              loop
              playsInline
              autoPlay
              preload="auto"
              onCanPlayThrough={() => {
                setVideoVisible(true);
                markLoaded('hero-video');
              }}
              className="w-full h-full object-cover"
            />
          )}
        </AnimatePresence>
        
        {/* Overlays */}
      </motion.div>

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col justify-start items-center px-6 pt-20 md:pt-24">
        {/* Main Title - Centered & Much Higher */}
        <motion.div 
          style={{ y: textY, opacity: contentOpacity }}
          className="text-center w-full"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
          >
            <h1 className="text-zinc-100 font-hero text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-none tracking-tightest uppercase font-black transition-all duration-500">
              {heroTitle || 'MOSTBOOKED'}<span className="text-accent">.</span>
            </h1>
          </motion.div>
        </motion.div>
      </div>

      {/* Animated Info Card - Absolute Bottom Right */}
      <div className="absolute bottom-6 right-4 md:bottom-10 md:right-6 z-20 pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
          className="w-[220px] md:w-[280px] bg-zinc-900/85 backdrop-blur-xl p-4 md:p-6 rounded-[1rem] md:rounded-[1.25rem] border border-white/10 shadow-2xl"
        >
          <div className="flex items-center space-x-3 mb-3 md:mb-4">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-accent rounded-full flex items-center justify-center">
              <div className="w-2 h-2 md:w-3 md:h-3 bg-white rounded-full" />
            </div>
            <h3 className="text-white font-hero text-sm md:text-base uppercase tracking-tighter leading-tight">
              MOSTBOOKED <br /> <span className="text-accent">STUDIO</span>
            </h3>
          </div>
          
          <p className="text-zinc-400 font-heading text-[10px] md:text-xs leading-relaxed mb-4 md:mb-5">
            {heroDescription || "I'M A STORYTELLER CAPTURING LIVES, CULTURES, AND IDEAS THAT CHALLENGE THE ORDINARY."}
          </p>

          <div className="flex flex-col space-y-2">
            <button 
              onClick={() => navigate('/portfolio')}
              className="w-full py-2.5 md:py-3 bg-accent text-white font-subheading font-bold uppercase tracking-[0.2em] text-[8px] md:text-[9px] transition-all duration-300 hover:bg-accent/90 shadow-lg rounded-full"
            >
              View Portfolio
            </button>
            
            <button 
              onClick={() => navigate('/services')}
              className="group flex items-center justify-center space-x-2 text-zinc-400 hover:text-white transition-all py-1"
            >
              <span className="font-subheading font-bold text-[7px] md:text-[8px] uppercase tracking-widest">Learn More</span>
              <ArrowRight size={8} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        style={{ opacity: scrollIndicatorOpacity }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center"
      >
        <span className="text-[10px] uppercase tracking-widest text-zinc-100/50 mb-2">Scroll to explore</span>
        <div className="w-px h-8 bg-gradient-to-b from-accent to-transparent" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
