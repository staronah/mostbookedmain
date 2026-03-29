
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Clock, BookOpen, Star, Award, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PDFModal from '../components/ui/PDFModal';
import YouTubeModal from '../components/ui/YouTubeModal';
import { db, auth } from '../lib/firebase';
import { collection, getDocs, doc, getDoc, onSnapshot, query, where, orderBy, setDoc, increment } from 'firebase/firestore';
import { initiatePaystackPayment } from '../lib/payment';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface FirestoreCourse {
  id: string;
  title: string;
  image: string;
  decription: string; // Intentional misspelling as per user request
  catergory: string;  // Intentional misspelling as per user request
  price?: string;
  duration?: string;
  pdfUrl?: string;
  youtubeUrl?: string;
}

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<FirestoreCourse[]>([]);
  const [paidCourseTitles, setPaidCourseTitles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState<string | null>(null);
  const [pageDescription, setPageDescription] = useState<string | null>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [selectedPdf, setSelectedPdf] = useState<{ url: string, title: string } | null>(null);
  const [selectedYoutube, setSelectedYoutube] = useState<{ url: string, title: string } | null>(null);
  const lastOpened = useRef<Record<string, number>>({});
  const navigate = useNavigate();

  const handleOpenPdf = async (course: FirestoreCourse) => {
    if (!course.pdfUrl) return;

    const now = Date.now();
    const lastTime = lastOpened.current[course.id] || 0;
    const COOLDOWN = 5 * 60 * 1000; // 5 minutes

    if (now - lastTime > COOLDOWN) {
      try {
        const siteRef = doc(db, 'sites', 'mostbooked');
        await setDoc(siteRef, {
          coursesviewed: increment(1)
        }, { merge: true });
        console.log(`Course view recorded for: ${course.title}`);
      } catch (error) {
        console.error('Error recording course view:', error);
      }
      lastOpened.current[course.id] = now;
    }

    setSelectedPdf({ url: course.pdfUrl, title: course.title });
  };

  const handleOpenYoutube = async (course: FirestoreCourse) => {
    if (!course.youtubeUrl) return;

    const now = Date.now();
    const lastTime = lastOpened.current[course.id] || 0;
    const COOLDOWN = 5 * 60 * 1000; // 5 minutes

    if (now - lastTime > COOLDOWN) {
      try {
        const siteRef = doc(db, 'sites', 'mostbooked');
        await setDoc(siteRef, {
          coursesviewed: increment(1)
        }, { merge: true });
        console.log(`Course video view recorded for: ${course.title}`);
      } catch (error) {
        console.error('Error recording course view:', error);
      }
      lastOpened.current[course.id] = now;
    }

    setSelectedYoutube({ url: course.youtubeUrl, title: course.title });
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "public", currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }

        // Fetch transaction logs for the user to identify paid courses
        try {
          const transRef = collection(db, 'public', currentUser.uid, 'transaction_logs');
          // Fetch all transactions for the user and filter/sort in memory to avoid index requirements
          const transQuery = await getDocs(transRef);
          
          const successfulTransactions = transQuery.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as any))
            .filter(data => data.status === 'success');

          // Sort by createdAt. 
          successfulTransactions.sort((a, b) => {
            const parseDate = (val: any) => {
              if (!val) return new Date(0);
              if (val.toDate) return val.toDate(); // Firestore Timestamp
              if (typeof val === 'string') {
                // Handle "12 March 2026 at 00:37:48 UTC+1"
                // Replace " at " with a space and remove UTC offset for parsing
                const cleanDate = val.replace(' at ', ' ').replace(/UTC[+-]\d+/, '').trim();
                const d = new Date(cleanDate);
                return isNaN(d.getTime()) ? new Date(0) : d;
              }
              const d = new Date(val);
              return isNaN(d.getTime()) ? new Date(0) : d;
            };
            
            return parseDate(b.createdAt).getTime() - parseDate(a.createdAt).getTime();
          });
          
          const paidMap = new Map<string, any>();
          
          successfulTransactions.forEach(data => {
            const productName = data.metadata?.productName;
            
            if (productName && !paidMap.has(productName)) {
              paidMap.set(productName, data);
            }
          });
          
          setPaidCourseTitles(Array.from(paidMap.keys()));
        } catch (err) {
          console.error("Error fetching transactions:", err);
        }
      } else {
        setPaidCourseTitles([]);
      }
    });

    const fetchGlobalData = async () => {
      try {
        const docRef = doc(db, 'sites', 'mostbooked', 'global_content', 'data');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.coursesPageTitle) setPageTitle(data.coursesPageTitle);
          if (data.coursesPageDescription) setPageDescription(data.coursesPageDescription);
        }
      } catch (err) {
        console.error("Error fetching global content:", err);
      }
    };

    fetchGlobalData();
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'sites', 'mostbooked', 'courses'));
        const fetchedCourses: FirestoreCourse[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || 'Untitled Course',
            image: data.image || 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=800',
            decription: data.decription || data.description || '', 
            catergory: data.catergory || data.category || 'Academy', 
            price: data.price || 'Contact for Price',
            duration: data.duration || 'Flexible',
            pdfUrl: data.pdfUrl || null,
            youtubeUrl: data.youtubeUrl || null
          };
        });
        
        // Sort courses: Paid courses first
        const sortedCourses = [...fetchedCourses].sort((a, b) => {
          const aPaid = paidCourseTitles.includes(a.title);
          const bPaid = paidCourseTitles.includes(b.title);
          if (aPaid && !bPaid) return -1;
          if (!aPaid && bPaid) return 1;
          return 0;
        });

        setCourses(sortedCourses);
      } catch (err) {
        console.error("Error fetching courses:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [paidCourseTitles]);

  const formatPrice = (price?: string) => {
    if (!price) return 'Contact for Price';
    // If it's a numeric string, add the prefix and Naira sign
    if (!isNaN(Number(price))) {
      return `Starting from ₦${price}`;
    }
    return price;
  };

  return (
    <main className="pt-32 bg-primary min-h-screen">
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <div className="max-w-3xl mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-accent font-heading tracking-[0.3em] text-sm uppercase mb-4 block">Academy</span>
            
            {/* 
              Header text removed as per user screenshot circles: 
              'LEARN FROM THE PROFESSIONALS' is gone.
              If coursesPageTitle exists in Firestore, it will display here.
            */}
            {pageTitle && (
              <h1 className="text-ui font-hero text-6xl md:text-7xl leading-none mb-8 uppercase">
                {pageTitle}
              </h1>
            )}

            <p className="text-ui/60 font-body text-lg">
              {pageDescription || "Master the skills that power the world's most successful creators and production houses. Hands-on, cinematic education tailored for the next generation of visual storytellers."}
            </p>
          </motion.div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="animate-spin text-accent mb-4" size={48} strokeWidth={1} />
            <p className="text-ui/40 font-heading tracking-widest text-sm uppercase">Loading Curriculum...</p>
          </div>
        ) : courses.length > 0 ? (
          <div className="space-y-16">
            {paidCourseTitles.length > 0 && (
              <div>
                <div className="flex items-center space-x-4 mb-8">
                  <h2 className="text-ui font-hero text-3xl uppercase">My Learning</h2>
                  <div className="h-px flex-grow bg-white/5" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {courses.filter(c => paidCourseTitles.includes(c.title)).map((course, idx) => {
                    const isPaid = true;
                    return (
                      <motion.div 
                        key={course.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ y: -10 }}
                        onClick={() => {
                          if (course.youtubeUrl) handleOpenYoutube(course);
                          else if (course.pdfUrl) handleOpenPdf(course);
                        }}
                        className="bg-secondary border border-accent/20 rounded-3xl overflow-hidden group flex flex-col h-full cursor-pointer relative shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
                      >
                        <div className="relative aspect-video overflow-hidden">
                          <img src={course.image} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute top-4 left-4 flex flex-col gap-2">
                            <div className="px-3 py-1 bg-accent text-[10px] text-white uppercase tracking-widest font-bold rounded-full w-fit">
                              {course.catergory}
                            </div>
                            <div className="px-3 py-1 bg-green-500 text-[10px] text-white uppercase tracking-widest font-bold rounded-full w-fit shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                              Purchased
                            </div>
                          </div>
                        </div>
                        <div className="p-8 flex flex-col flex-grow">
                          <div className="flex items-center space-x-2 text-accent mb-4">
                            <Star size={14} fill="currentColor" />
                            <Star size={14} fill="currentColor" />
                            <Star size={14} fill="currentColor" />
                            <Star size={14} fill="currentColor" />
                            <Star size={14} fill="currentColor" />
                            <span className="text-[10px] text-ui/40 uppercase tracking-widest ml-2">Highly Rated</span>
                          </div>
                          <h3 className="text-white font-heading text-2xl mb-4 group-hover:text-accent transition-colors">
                            {course.title}
                          </h3>
                          <p className="text-white/50 text-sm font-body mb-6 line-clamp-3">
                            {course.decription}
                          </p>
                          <div className="mt-auto">
                            <div className="flex items-center justify-between text-white/40 text-xs mb-8">
                              <div className="flex items-center space-x-2">
                                <BookOpen size={16} />
                                <span>{course.duration}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock size={16} />
                                <span>Lifetime Access</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-heading text-white text-green-500">Owned</span>
                              <div className="flex gap-2">
                                {course.youtubeUrl && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenYoutube(course);
                                    }}
                                    className="px-4 py-2 bg-accent/10 text-accent hover:bg-accent hover:text-white transition-all duration-300 font-subheading text-[10px] uppercase tracking-widest font-bold rounded-lg border border-accent/20"
                                  >
                                    Watch Video
                                  </button>
                                )}
                                {course.pdfUrl && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenPdf(course);
                                    }}
                                    className="px-4 py-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all duration-300 font-subheading text-[10px] uppercase tracking-widest font-bold rounded-lg border border-green-500/20"
                                  >
                                    View PDF
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center space-x-4 mb-8">
                <h2 className="text-ui font-hero text-3xl uppercase">Available Courses</h2>
                <div className="h-px flex-grow bg-white/5" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.filter(c => !paidCourseTitles.includes(c.title)).map((course, idx) => (
                  <motion.div 
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -10 }}
                    onClick={() => {
                      if (!user) {
                        navigate('/auth');
                        return;
                      }
                      initiatePaystackPayment(
                        Number(course.price) || 0, 
                        user?.email || 'guest@example.com', 
                        `course_${course.id}_${Date.now()}`,
                        user?.uid || 'guest',
                        userData?.fullName || 'Guest',
                        course.title,
                        'course',
                        undefined,
                        course.id
                      );
                    }}
                    className="bg-secondary border border-ui/5 rounded-3xl overflow-hidden group flex flex-col h-full cursor-pointer relative"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img src={course.image} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute top-4 left-4">
                        <div className="px-3 py-1 bg-accent text-[10px] text-white uppercase tracking-widest font-bold rounded-full w-fit">
                          {course.catergory}
                        </div>
                      </div>
                    </div>
                    <div className="p-8 flex flex-col flex-grow">
                      <div className="flex items-center space-x-2 text-accent mb-4">
                        <Star size={14} fill="currentColor" />
                        <Star size={14} fill="currentColor" />
                        <Star size={14} fill="currentColor" />
                        <Star size={14} fill="currentColor" />
                        <Star size={14} fill="currentColor" />
                        <span className="text-[10px] text-ui/40 uppercase tracking-widest ml-2">Highly Rated</span>
                      </div>
                      <h3 className="text-white font-heading text-2xl mb-4 group-hover:text-accent transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-white/50 text-sm font-body mb-6 line-clamp-3">
                        {course.decription}
                      </p>
                      <div className="mt-auto">
                        <div className="flex items-center justify-between text-white/40 text-xs mb-8">
                          <div className="flex items-center space-x-2">
                            <BookOpen size={16} />
                            <span>{course.duration}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock size={16} />
                            <span>Lifetime Access</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-heading text-white">{formatPrice(course.price)}</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!user) {
                                navigate('/auth');
                                return;
                              }
                              initiatePaystackPayment(
                                Number(course.price) || 0, 
                                user?.email || 'guest@example.com', 
                                `course_${course.id}_${Date.now()}`,
                                user?.uid || 'guest',
                                userData?.fullName || 'Guest',
                                course.title,
                                'course',
                                undefined,
                                course.id
                              );
                            }}
                            className="px-6 py-2 bg-accent/10 text-accent hover:bg-accent hover:text-white transition-all duration-300 font-subheading text-[10px] uppercase tracking-widest font-bold rounded-lg border border-accent/20"
                          >
                            Enroll Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-24 bg-secondary/30 rounded-3xl border border-dashed border-ui/10">
            <p className="text-ui/40 font-heading text-xl uppercase tracking-widest">No courses available at the moment.</p>
            <p className="text-ui/20 text-sm mt-2">Check back soon for new masterclasses.</p>
          </div>
        )}
      </section>

      {/* PDF Reader Modal */}
      <PDFModal 
        isOpen={!!selectedPdf}
        onClose={() => setSelectedPdf(null)}
        pdfUrl={selectedPdf?.url || ''}
        courseTitle={selectedPdf?.title || ''}
      />

      {/* YouTube Player Modal */}
      <YouTubeModal 
        isOpen={!!selectedYoutube}
        onClose={() => setSelectedYoutube(null)}
        youtubeUrl={selectedYoutube?.url || ''}
        courseTitle={selectedYoutube?.title || ''}
      />

      {/* Trust Section */}
      <section className="bg-primary py-24 border-t border-ui/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Award className="text-accent mx-auto mb-8" size={48} />
          <h2 className="text-ui font-hero text-4xl md:text-5xl mb-12 uppercase">Transform your creative career</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* ... */}
            {[
              { label: 'Industry Experts', val: 'Taught by Pros' },
              { label: 'Real Projects', val: 'Case-based Learning' },
              { label: 'Community', val: 'Exclusive Discord' },
              { label: 'Certification', val: 'MostBooked Badge' }
            ].map((stat, i) => (
              <div key={i} className="p-8 bg-secondary rounded-2xl border border-white/5">
                <p className="text-accent font-heading text-xl mb-1">{stat.val}</p>
                <p className="text-white/30 text-[10px] uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default CoursesPage;
