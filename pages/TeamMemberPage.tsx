import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { TEAM } from '../constants';
import { TeamMember } from '../types';
import SEO from '../components/layout/SEO';

const TeamMemberPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [member, setMember] = useState<TeamMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMember = async () => {
      if (!id) return;
      
      try {
        // First try to fetch from Firestore
        const memberDocRef = doc(db, 'sites', 'mostbooked', 'narrative', 'data', 'collective', id);
        const memberSnap = await getDoc(memberDocRef);
        
        if (memberSnap.exists()) {
          const data = memberSnap.data();
          setMember({
            id: memberSnap.id,
            name: data.name || 'Visionary',
            role: data.role || 'Role',
            image: data.image || 'https://i.pravatar.cc/300',
            bio: data.bio || 'A visionary member of the MOSTBOOKED collective, dedicated to pushing the boundaries of cinematic storytelling in Africa.'
          });
        } else {
          // Fallback to constants
          const localMember = TEAM.find(m => m.id === id);
          if (localMember) {
            setMember(localMember);
          }
        }
      } catch (err) {
        console.error("Error fetching team member:", err);
        const localMember = TEAM.find(m => m.id === id);
        if (localMember) {
          setMember(localMember);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMember();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-accent mb-4" size={48} strokeWidth={1} />
        <p className="text-ui/20 font-heading text-xs uppercase tracking-[0.3em]">Loading Profile...</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center px-6">
        <h1 className="text-ui font-hero text-4xl mb-4 uppercase">Member Not Found</h1>
        <p className="text-ui/50 mb-8">The collective member you are looking for does not exist.</p>
        <Link to="/about" className="text-accent hover:text-white transition-colors flex items-center">
          <ArrowLeft className="mr-2" size={20} /> Back to About
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-primary pt-32 pb-24 px-6 relative overflow-hidden">
      <SEO 
        title={`${member.name} - ${member.role} | MOSTBOOKED`} 
        description={member.bio || `Learn more about ${member.name}, ${member.role} at MOSTBOOKED.`}
      />
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-3xl -z-10" />

      <div className="max-w-6xl mx-auto">
        <Link to="/about" className="inline-flex items-center text-ui/40 hover:text-ui transition-colors mb-12 uppercase tracking-widest text-xs font-bold">
          <ArrowLeft className="mr-2" size={16} /> Back to Collective
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl"
          >
            <img 
              src={member.image} 
              alt={member.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-accent font-heading tracking-[0.3em] text-sm uppercase mb-4 block">
              {member.role}
            </span>
            <h1 className="text-ui font-hero text-6xl md:text-8xl leading-none mb-8 uppercase">
              {member.name}
            </h1>
            
            <div className="w-20 h-1 bg-accent mb-8" />
            
            <div className="prose prose-invert prose-lg max-w-none">
              <p className="text-ui/70 font-body text-lg leading-relaxed mb-8">
                {member.bio || 'A visionary member of the MOSTBOOKED collective, dedicated to pushing the boundaries of cinematic storytelling in Africa.'}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default TeamMemberPage;
