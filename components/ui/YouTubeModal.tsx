
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2 } from 'lucide-react';

interface YouTubeModalProps {
  isOpen: boolean;
  onClose: () => void;
  youtubeUrl: string;
  courseTitle: string;
}

const YouTubeModal: React.FC<YouTubeModalProps> = ({ isOpen, onClose, youtubeUrl, courseTitle }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Extract video ID from YouTube URL
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeId(youtubeUrl);
  // Using modestbranding, rel=0, and iv_load_policy to minimize YouTube branding and sharing options
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&showinfo=0` : '';

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if ((containerRef.current as any).webkitRequestFullscreen) {
        (containerRef.current as any).webkitRequestFullscreen();
      } else if ((containerRef.current as any).msRequestFullscreen) {
        (containerRef.current as any).msRequestFullscreen();
      }

      // Try to lock orientation to landscape on mobile
      if (window.screen && window.screen.orientation && (window.screen.orientation as any).lock) {
        (window.screen.orientation as any).lock('landscape').catch((err: any) => {
          console.log("Orientation lock failed:", err);
        });
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      // Auto-trigger fullscreen on mobile if possible
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        const timer = setTimeout(() => {
          handleFullscreen();
        }, 500);
        return () => clearTimeout(timer);
      }
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen || !videoId) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-secondary/95 backdrop-blur-xl p-0 md:p-8"
        onClick={onClose}
        onContextMenu={(e) => e.preventDefault()}
      >
        <motion.div
          ref={containerRef}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-primary w-full h-full md:h-auto md:max-w-5xl md:aspect-video md:rounded-3xl overflow-hidden shadow-2xl border-0 md:border md:border-ui/10 flex flex-col relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Hidden in mobile fullscreen to maximize space */}
          <div className="p-4 border-b border-ui/5 flex items-center justify-between bg-white/50 backdrop-blur-md z-30 md:flex hidden">
            <div className="flex items-center space-x-4">
              <div>
                <h2 className="text-ui font-hero text-xl uppercase tracking-tight">{courseTitle}</h2>
                <p className="text-ui/40 text-[10px] uppercase tracking-widest font-bold">Video Lesson</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleFullscreen}
                className="p-2 bg-ui/5 text-ui/60 hover:bg-ui/10 rounded-xl transition-all duration-300"
                title="Fullscreen"
              >
                <Maximize2 size={20} />
              </button>
              <button 
                onClick={onClose}
                className="p-2 bg-accent/10 text-accent hover:bg-accent hover:text-white rounded-xl transition-all duration-300"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Mobile Close Button - Floating for better UX */}
          <button 
            onClick={onClose}
            className="md:hidden absolute top-4 right-4 z-40 p-3 bg-black/50 text-white rounded-full backdrop-blur-md border border-white/10"
          >
            <X size={24} />
          </button>

          {/* Video Area */}
          <div className="flex-grow bg-black relative overflow-hidden h-full">
            {/* Transparent overlay to block clicking the top bar (title/share) */}
            <div className="absolute top-0 left-0 w-full h-20 z-20 pointer-events-auto" />
            {/* Transparent overlay to block clicking the YouTube logo/button in the bottom right */}
            <div className="absolute bottom-0 right-0 w-32 h-16 z-20 pointer-events-auto" />
            
            <div className="absolute inset-0 w-full h-full scale-[1.03] origin-center">
              <iframe
                src={embedUrl}
                title={courseTitle}
                className="w-full h-full relative z-10"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default YouTubeModal;
