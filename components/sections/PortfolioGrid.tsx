
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X, Play, ArrowUpRight, Youtube, ExternalLink } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Project } from '../../types';
import { useLoading } from '../../context/LoadingContext';

interface PortfolioGridProps {
  collectionPath?: string;
  isPortfolioPage?: boolean;
}

const PortfolioGrid: React.FC<PortfolioGridProps> = ({ 
  collectionPath = 'sites/mostbooked/global_content/data/videos',
  isPortfolioPage = false 
}) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [dynamicCategories, setDynamicCategories] = useState<string[]>(['All']);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { registerItem, markLoaded } = useLoading();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const querySnapshot = await getDocs(collection(db, collectionPath));
        const tagsSet = new Set<string>(['All']);
        
        const fetchedProjects: Project[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          let aspect: 'landscape' | 'portrait' | 'featured' = 'landscape';
          
          // Field mapping varies based on collection
          const title = data.title || data.name || 'Untitled Project';
          const client = data.client || 'MostBooked Productions';
          const category = data.category || data.tag || 'Video';
          const thumbnail = data.thumbnail || data.thumbnailUrl || 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=800';
          const videoUrl = data.videoUrl || '';
          const previewUrl = data.previewUrl || ''; // This is used for the YouTube redirect
          const description = data.description || '';

          // Orientation mapping
          const orientation = data.aspect || data.orientation;
          if (orientation === 'featured' || data.featured === true || data.featured === "true") {
            aspect = 'featured';
          } 
          else if (orientation === 'vertical' || orientation === 'portrait') {
            aspect = 'portrait';
          } 
          else if (orientation === 'horizontal' || orientation === 'landscape' || !orientation) {
            aspect = 'landscape';
          }

          // Track unique tags for filtering
          if (category) {
            tagsSet.add(category);
          }

          return {
            id: doc.id,
            title,
            client,
            category,
            thumbnail,
            previewUrl, // Store YouTube link here for the 'ended' UI
            videoUrl,    // Store direct video file here
            description,
            aspect
          };
        });
        
        const sortedTags = Array.from(tagsSet).sort((a, b) => {
          if (a === 'All') return -1;
          if (b === 'All') return 1;
          return a.localeCompare(b);
        });
        setDynamicCategories(sortedTags);

        // Sorting logic
        const featuredItems = fetchedProjects.filter(p => p.aspect === 'featured');
        const standardItems = fetchedProjects.filter(p => p.aspect !== 'featured');

        let finalOrder: Project[] = [];
        if (featuredItems.length >= 2) {
          const firstFeatured = featuredItems[0];
          const lastFeatured = featuredItems[1];
          const middleItems = [...standardItems, ...featuredItems.slice(2)].sort(() => Math.random() - 0.5);
          finalOrder = [firstFeatured, ...middleItems, lastFeatured];
        } else if (featuredItems.length === 1) {
          finalOrder = [featuredItems[0], ...standardItems];
        } else {
          finalOrder = fetchedProjects;
        }

        setProjects(finalOrder);
      } catch (err) {
        console.error("Error fetching projects from Firestore:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [collectionPath]);

  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [selectedProject]);

  const filteredProjects = activeCategory === 'All' 
    ? projects 
    : projects.filter(p => p.category === activeCategory);

  const getGridClasses = (aspect?: string) => {
    switch (aspect) {
      case 'featured': return 'md:col-span-2 md:row-span-2';
      case 'portrait': return 'md:col-span-1 md:row-span-2';
      case 'landscape': return 'md:col-span-2 md:row-span-1';
      default: return 'md:col-span-1 md:row-span-1';
    }
  };

  const VideoPlayer = ({ project }: { project: Project }) => {
    const [hasEnded, setHasEnded] = useState(false);
    const url = project.videoUrl;
    const youtubeUrl = project.previewUrl;
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    const isVimeo = url.includes('vimeo.com');
    const isPortrait = project.aspect === 'portrait';

    const playerWrapperClasses = isPortrait 
      ? "relative h-full max-h-[85vh] aspect-[9/16] mx-auto shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-black rounded-2xl overflow-hidden" 
      : "relative w-full max-w-6xl aspect-video mx-auto shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-black rounded-2xl overflow-hidden";

    const handleContinueToYoutube = () => {
      if (youtubeUrl) {
        window.open(youtubeUrl, '_blank');
      }
    };

    if (isYouTube) {
      const videoId = url.includes('watch?v=') ? url.split('v=')[1].split('&')[0] : url.split('/').pop();
      return (
        <div className={playerWrapperClasses}>
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      );
    }

    if (isVimeo) {
      const videoId = url.split('/').pop();
      return (
        <div className={playerWrapperClasses}>
          <iframe
            className="w-full h-full"
            src={`https://player.vimeo.com/video/${videoId}?autoplay=1`}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-6 w-full max-w-6xl">
        <h2 className="text-white font-hero text-3xl md:text-5xl uppercase tracking-tight text-center">{project.title}</h2>
        <div className={playerWrapperClasses}>
          <video
            className="w-full h-full object-cover"
            src={url}
            controls={!hasEnded}
            autoPlay
            playsInline
            onEnded={() => setHasEnded(true)}
            onLoadStart={(e) => {
              const video = e.currentTarget;
              video.play().catch(error => {
                if (error.name !== 'AbortError') {
                  console.warn("Autoplay blocked or failed:", error);
                }
              });
            }}
          ></video>
          
          <AnimatePresence>
            {hasEnded && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-secondary/95 backdrop-blur-xl flex flex-col items-center justify-center text-center p-8 z-50"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ type: "spring", damping: 20 }}
                  className="max-w-md"
                >
                  <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Youtube className="text-accent" size={40} />
                  </div>
                  <h3 className="text-white font-hero text-3xl mb-4 uppercase tracking-tight">Enjoyed the preview?</h3>
                  <p className="text-white/60 font-body mb-10 text-sm leading-relaxed px-4">
                    Watch the full high-quality production and explore more of our content on our official YouTube channel.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button 
                      onClick={handleContinueToYoutube}
                      className="w-full sm:w-auto px-8 py-4 bg-accent text-white font-heading text-sm uppercase tracking-[0.2em] font-bold rounded-xl flex items-center justify-center space-x-3 hover:bg-accent/90 transition-all shadow-xl shadow-accent/20"
                    >
                      <span>Watch Full Video</span>
                      <ExternalLink size={18} />
                    </button>
                    <button 
                      onClick={() => setHasEnded(false)}
                      className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white/60 font-heading text-sm uppercase tracking-[0.2em] font-bold rounded-xl hover:bg-white/10 transition-all"
                    >
                      Replay Clip
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <section className={`py-24 ${isPortfolioPage ? 'bg-transparent' : 'bg-primary'} px-4 md:px-10 relative overflow-hidden`}>
      {!isPortfolioPage && (
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[150px] pointer-events-none" />
      )}
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
             <span className="text-accent font-heading tracking-[0.5em] text-[10px] uppercase mb-4 block font-bold">PORTFOLIO</span>
            <h2 className="text-ui font-hero text-6xl md:text-8xl tracking-tightest uppercase leading-none font-black">GALLERY</h2>
          </motion.div>
          
          <div className="w-full md:w-auto overflow-x-auto no-scrollbar pb-4 -mb-4">
            <div className="flex gap-3 px-4 md:px-0 min-w-max">
              {dynamicCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-8 py-3 rounded-full font-subheading text-[10px] uppercase tracking-widest transition-all duration-500 border whitespace-nowrap ${activeCategory === cat ? 'bg-accent text-white border-accent shadow-[0_0_20px_rgba(184,92,36,0.3)]' : 'bg-transparent text-ui/20 border-ui/5 hover:text-ui/50'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-56">
            <Loader2 className="animate-spin text-accent mb-4" size={48} strokeWidth={1} />
          </div>
        ) : filteredProjects.length > 0 ? (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 grid-flow-dense gap-6 md:auto-rows-[300px]">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, idx) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.7, delay: idx * 0.05, ease: [0.19, 1, 0.22, 1] }}
                  onMouseEnter={() => setHoveredId(project.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => setSelectedProject(project)}
                  className={`relative group cursor-pointer overflow-hidden rounded-[2.5rem] bg-secondary border border-white/5 transition-all duration-700 ${getGridClasses(project.aspect)} min-h-[400px] md:min-h-0 shadow-2xl shadow-black/20`}
                >
                  <div className="absolute inset-0 z-0">
                    <img src={project.thumbnail} alt="" className={`w-full h-full object-cover transition-all duration-1000 ease-in-out ${hoveredId === project.id ? 'scale-110' : 'scale-100'}`} />
                    <AnimatePresence>
                      {hoveredId === project.id && project.videoUrl && !project.videoUrl.includes('youtube') && (
                        <motion.video 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }} 
                          exit={{ opacity: 0 }} 
                          transition={{ duration: 0.8 }} 
                          autoPlay 
                          muted 
                          loop 
                          playsInline 
                          className="absolute inset-0 w-full h-full object-cover z-10"
                          onLoadStart={(e) => {
                            const video = e.currentTarget;
                            video.play().catch(error => {
                              if (error.name !== 'AbortError') {
                                console.warn("Autoplay blocked or failed:", error);
                              }
                            });
                          }}
                        >
                          <source src={project.videoUrl} type="video/mp4" />
                        </motion.video>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="absolute inset-0 z-30 p-8 flex flex-col justify-end">
                    <div className="relative overflow-hidden">
                      <div className="flex items-center space-x-3 mb-4 translate-y-10 group-hover:translate-y-0 transition-transform duration-700 ease-out">
                        <span className="px-3 py-1 bg-accent/90 backdrop-blur-md text-[8px] text-white uppercase tracking-[0.3em] font-black rounded-md">{project.category}</span>
                        <div className="h-px w-6 bg-white/10" />
                        <span className="text-white/40 text-[9px] uppercase tracking-widest font-bold">{project.client}</span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-accent translate-y-10 group-hover:translate-y-0 transition-transform duration-700 delay-150 ease-out">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20 group-hover:bg-accent group-hover:text-white transition-all duration-500 shadow-xl">
                          <Play size={14} fill="currentColor" />
                        </div>
                        <span className="text-[9px] uppercase tracking-[0.4em] font-black text-white/60 group-hover:text-accent transition-colors">EXPLORE</span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-8 right-8 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="w-12 h-12 rounded-full border border-white/10 backdrop-blur-xl flex items-center justify-center text-white/40">
                      <ArrowUpRight size={18} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-32 bg-secondary/20 rounded-[3rem] border border-dashed border-white/5">
             <p className="text-ui/20 font-heading text-2xl uppercase tracking-widest">No projects found in this collection.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/95 backdrop-blur-3xl p-4 md:p-10"
            onClick={() => setSelectedProject(null)}
          >
            <motion.button 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedProject(null)}
              className="absolute top-6 right-6 md:top-10 md:right-10 z-[110] p-4 text-ui/40 hover:text-accent transition-colors duration-300"
            >
              <X size={40} strokeWidth={1} />
            </motion.button>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-full flex items-center justify-center"
              onClick={e => e.stopPropagation()}
            >
               <VideoPlayer project={selectedProject} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default PortfolioGrid;
