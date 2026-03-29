
import { Project, Service, Testimonial, Course, TeamMember, MerchItem } from './types';

export const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Summer Solstice',
    client: 'HighLife Fashion',
    category: 'Commercial',
    thumbnail: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=800',
    previewUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'A cinematic high-fashion commercial shot in Lagos.',
    aspect: 'featured'
  },
  {
    id: '2',
    title: 'The Unseen Lagos',
    client: 'Discovery NG',
    category: 'Documentary',
    thumbnail: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=800',
    previewUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'Documenting the hidden gems of Africa\'s largest metropolis.',
    aspect: 'landscape'
  },
  {
    id: '3',
    title: 'Urban Rhythm',
    client: 'StreetWear NG',
    category: 'Commercial',
    thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
    previewUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'A portrait-first social media campaign.',
    aspect: 'portrait'
  },
  {
    id: '4',
    title: 'Neon Nights',
    client: 'Electro-Wave',
    category: 'Music Video',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800',
    previewUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'An explosive visual journey through cyberpunk aesthetics.',
    aspect: 'landscape'
  },
  {
    id: '5',
    title: 'Inside the Mind',
    client: 'Talkative Podcast',
    category: 'Podcast',
    thumbnail: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=800',
    previewUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'Premium multi-cam podcast setup for industry leaders.',
    aspect: 'portrait'
  },
  {
    id: '6',
    title: 'Future Of Tech',
    client: 'Nexa Corp',
    category: 'Corporate',
    thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
    previewUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'Explaining complex systems through high-end 3D motion graphics.',
    aspect: 'landscape'
  },
  {
    id: '7',
    title: 'Creator Peak',
    client: 'Top Creator NG',
    category: 'YouTube',
    thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&q=80&w=800',
    previewUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'Editing and strategy that took a channel from 10k to 500k.',
    aspect: 'landscape'
  },
  {
    id: '8',
    title: 'Lagos Sunset',
    client: 'Tourism Board',
    category: 'Documentary',
    thumbnail: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800',
    previewUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'Capturing the golden hour in Eko.',
    aspect: 'portrait'
  },
  {
    id: '9',
    title: 'Pulse',
    client: 'Energy Drink',
    category: 'Commercial',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800',
    previewUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    description: 'High octane energy drink commercial.',
    aspect: 'featured'
  }
];

export const SERVICES: Service[] = [
  {
    id: 'vid-prod',
    title: 'Premium Video Production',
    icon: 'camera',
    description: 'End-to-end cinematic storytelling for brands that want to stand out. We handle everything from concept development to high-end color grading.',
    price: 'Starting at $1,500',
    features: ['4K Cinema Cameras', 'Color Grading', 'Professional Sound Design', 'Scriptwriting Support']
  },
  {
    id: 'yt-growth',
    title: 'YouTube Mastery',
    icon: 'youtube',
    description: 'Strategic growth management, high-retention editing, and thumbnail optimization designed for modern algorithms.',
    price: 'Starting at $800/mo',
    features: ['Retention Analysis', 'SEO Optimization', 'Thumbnail Design', 'Channel Audit']
  },
  {
    id: 'podcast',
    title: 'Podcast Studio Rental',
    icon: 'mic',
    description: 'A luxurious, acoustic-treated studio for high-end audio and video podcasts in the heart of Lagos.',
    price: '$150 / Hour',
    features: ['4x Shure SM7B Mics', '3-Cam 4K Setup', 'Live Mixing', 'Raw Files Provided']
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Sarah Johnson',
    role: 'Marketing Director, Nexa',
    content: 'MOSTBOOKED transformed our brand image. Their cinematic approach is unmatched in Nigeria.',
    avatar: 'https://i.pravatar.cc/150?u=t1'
  },
  {
    id: 't2',
    name: 'David Adeleke',
    role: 'YouTube Creator',
    content: 'The growth I saw in 3 months with their strategy was more than I got in 3 years.',
    avatar: 'https://i.pravatar.cc/150?u=t2'
  },
  {
    id: 't3',
    name: 'Emeka Obi',
    role: 'CEO, Obi Group',
    content: 'Professionalism at its peak. The studio experience is world-class.',
    avatar: 'https://i.pravatar.cc/150?u=t3'
  }
];

// Fix: Added missing COURSES export used in CoursesPage.tsx
export const COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Cinematic Storytelling',
    category: 'Production',
    image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=800',
    price: '$299',
    duration: '12 Weeks'
  },
  {
    id: 'c2',
    title: 'YouTube Growth Strategy',
    category: 'Strategy',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&q=80&w=800',
    price: '$199',
    duration: '8 Weeks'
  },
  {
    id: 'c3',
    title: 'Advanced Color Grading',
    category: 'Post-Production',
    image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=800',
    price: '$349',
    duration: '10 Weeks'
  }
];

export const TEAM: TeamMember[] = [
  {
    id: 'tm1',
    name: 'Fola',
    role: 'Creative Director',
    image: 'https://i.pravatar.cc/300?u=tm1',
    bio: 'Fola is the visionary behind MOSTBOOKED, bringing over a decade of cinematic storytelling experience to every project.'
  },
  {
    id: 'tm2',
    name: 'Tunde',
    role: 'Lead Cinematographer',
    image: 'https://i.pravatar.cc/300?u=tm2',
    bio: 'Tunde captures the essence of every scene with an unparalleled eye for lighting and composition.'
  },
  {
    id: 'tm3',
    name: 'Chisom',
    role: 'Head of Growth',
    image: 'https://i.pravatar.cc/300?u=tm3',
    bio: 'Chisom drives the strategic expansion of MOSTBOOKED, ensuring our creative vision reaches global audiences.'
  },
  {
    id: 'tm4',
    name: 'Ayo',
    role: 'Senior Editor',
    image: 'https://i.pravatar.cc/300?u=tm4',
    bio: 'Ayo weaves raw footage into compelling narratives, mastering the rhythm and pacing of modern video production.'
  }
];

export const CATEGORIES = ['All', 'Commercial', 'Documentary', 'Music Video', 'Corporate', 'YouTube', 'Podcast'];

export const MERCH: MerchItem[] = [
  {
    id: 'm1',
    label: 'Cinematic Hoodie',
    amount: 45000,
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800'],
    description: 'Premium heavy-weight hoodie for the modern creator.',
    tag: 'Apparel'
  },
  {
    id: 'm2',
    label: 'Director\'s Cap',
    amount: 15000,
    images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=800'],
    description: 'Classic dad hat with embroidered logo.',
    tag: 'Accessories'
  },
  {
    id: 'm3',
    label: 'Creator Tote Bag',
    amount: 12000,
    images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800'],
    description: 'Durable canvas tote for your gear and essentials.',
    tag: 'Accessories'
  },
  {
    id: 'm4',
    label: 'Production Tee',
    amount: 25000,
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800'],
    description: 'Minimalist tee with high-quality screen print.',
    tag: 'Apparel'
  }
];
