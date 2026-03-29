
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { PlayCircle, Award, Users, Camera, Loader2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { TeamMember } from '../types';
import SEO from '../components/layout/SEO';

interface AboutContent {
  title: string;
  subtitle: string;
  description: string;
  image: string;
}

interface AboutStats {
  experience: string;
  brands: string;
}

const AboutPage: React.FC = () => {
  const [content, setContent] = useState<AboutContent>({
    title: 'CRAFTING VISUAL LEGACIES',
    subtitle: 'Our Story',
    description: 'Born in the heart of Lagos, MOSTBOOKED is more than a production house. We are a collective of visionaries dedicated to pushing the boundaries of cinematic storytelling in Africa.',
    image: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&q=80&w=800'
  });
  
  const [stats, setStats] = useState<AboutStats>({
    experience: '10+',
    brands: '500+'
  });

  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // 1. Fetch Main Narrative Content
        const narrativeDocRef = doc(db, 'sites', 'mostbooked', 'narrative', 'data');
        const narrativeSnap = await getDoc(narrativeDocRef);
        if (narrativeSnap.exists()) {
          const data = narrativeSnap.data();
          setContent({
            title: data.aboutTitle || 'CRAFTING VISUAL LEGACIES',
            subtitle: data.aboutSubtitle || 'Our Story',
            description: data.aboutDescription || '',
            image: data.aboutImage || 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&q=80&w=800'
          });
        }

        // 2. Fetch Statistics
        const statsDocRef = doc(db, 'sites', 'mostbooked', 'statistics', 'data');
        const statsSnap = await getDoc(statsDocRef);
        if (statsSnap.exists()) {
          const data = statsSnap.data();
          setStats({
            experience: String(data.about_experience || '10+'),
            brands: String(data.about_brands || '500+')
          });
        }

        // 3. Fetch Team Members (Collective)
        const teamColRef = collection(db, 'sites', 'mostbooked', 'narrative', 'data', 'collective');
        const teamSnap = await getDocs(teamColRef);
        const fetchedTeam: TeamMember[] = teamSnap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || 'Visionary',
            role: data.role || 'Role',
            image: data.image || 'https://i.pravatar.cc/300'
          };
        });
        setTeam(fetchedTeam);

      } catch (err) {
        console.error("Error fetching about page data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-accent mb-4" size={48} strokeWidth={1} />
        <p className="text-ui/20 font-heading text-xs uppercase tracking-[0.3em]">Loading Narrative...</p>
      </div>
    );
  }

  return (
    <main className="pt-32 bg-primary">
      <SEO 
        title="About Our Collective | MOSTBOOKED" 
        description="Learn about the MOSTBOOKED vision, our story of crafting visual legacies in Lagos, and the creative collective behind the lens."
      />
      {/* Hero Section */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
        >
          <div>
            <span className="text-accent font-heading tracking-[0.3em] text-sm uppercase mb-4 block">
              {content.subtitle}
            </span>
            <h1 className="text-ui font-hero text-4xl md:text-6xl lg:text-7xl leading-none mb-8 uppercase tracking-tightest font-black">
              {content.title}
            </h1>
            <p className="text-ui/70 font-body text-lg leading-relaxed mb-8 max-w-lg">
              {content.description}
            </p>
            <div className="flex space-x-12">
              <div className="flex flex-col">
                <span className="text-4xl font-hero text-accent">{stats.experience}</span>
                <span className="text-[10px] uppercase tracking-widest text-ui/40 font-bold">Years Experience</span>
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-hero text-accent">{stats.brands}</span>
                <span className="text-[10px] uppercase tracking-widest text-ui/40 font-bold">Brands Served</span>
              </div>
            </div>
          </div>
          <div className="relative aspect-square">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="w-full h-full"
            >
              <img 
                src={content.image} 
                alt="Studio Preview" 
                className="w-full h-full object-cover rounded-3xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 md:-bottom-10 md:-left-10 w-32 h-32 md:w-48 md:h-48 bg-accent rounded-2xl flex items-center justify-center p-6 md:p-8 hidden md:flex shadow-2xl">
                <PlayCircle className="text-white" size={48} />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Values Section */}
      <section className="bg-secondary py-24 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon: Award, title: 'Excellence', text: 'We never settle for "good enough". Every frame is polished to perfection.' },
            { icon: Users, title: 'Collaboration', text: 'Your vision, our expertise. We work as an extension of your creative team.' },
            { icon: Camera, title: 'Innovation', text: 'Using world-class equipment and cutting-edge strategy to dominate algorithms.' }
          ].map((v, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="space-y-4"
            >
              <v.icon className="text-accent" size={40} />
              <h3 className="text-white font-heading text-2xl uppercase tracking-widest">{v.title}</h3>
              <p className="text-white/50 font-body leading-relaxed">{v.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-ui font-hero text-5xl mb-4 uppercase tracking-tightest font-black">The Collective</h2>
            <div className="w-20 h-1 bg-accent" />
          </motion.div>
        </div>
        
        {team.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, idx) => (
              <Link 
                to={`/team/${member.id}`}
                key={member.id}
              >
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="group relative overflow-hidden rounded-2xl bg-secondary aspect-[3/4] cursor-pointer"
                >
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500 p-8 flex flex-col justify-end">
                    <h4 className="text-ui font-heading text-2xl uppercase tracking-tighter leading-none mb-1">{member.name}</h4>
                    <p className="text-accent text-[10px] uppercase tracking-[0.2em] font-black">{member.role}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-secondary/30 rounded-3xl border border-dashed border-ui/10">
            <p className="text-ui/20 font-heading text-xl uppercase tracking-widest">Team profiles loading...</p>
          </div>
        )}
      </section>

      {/* Trust Section CTA */}
      <section className="py-24 bg-accent/5">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-ui font-hero text-4xl md:text-5xl mb-8 uppercase leading-none">JOIN THE MOSTBOOKED COLLECTIVE</h2>
          <p className="text-ui/50 mb-12 font-body">We are always looking for visionary creators and strategic partners to redefine African cinema.</p>
          <Link 
            to="/contact"
            className="inline-block px-10 py-4 bg-accent text-white font-heading text-lg tracking-widest hover:bg-white hover:text-accent transition-all duration-500 rounded-lg"
          >
            WORK WITH US
          </Link>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;
