
import React, { useEffect } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useLoading } from '../../context/LoadingContext';

const VideoPreloader: React.FC = () => {
  const { addPreloadedVideo, preloadedVideos } = useLoading();

  useEffect(() => {
    const fetchAndPreload = async () => {
      try {
        // 1. Fetch Global Hero Video
        const globalRef = doc(db, 'sites', 'mostbooked', 'global_content', 'data');
        const globalSnap = await getDoc(globalRef);
        if (globalSnap.exists()) {
          const data = globalSnap.data();
          if (data.heroBgVideoUrl) {
            addPreloadedVideo(data.heroBgVideoUrl);
          }
        }

        // 2. Fetch Portfolio Videos (Top 5)
        const portfolioRef = collection(db, 'sites', 'mostbooked', 'global_content', 'data', 'videos');
        const portfolioSnap = await getDocs(portfolioRef);
        portfolioSnap.docs.slice(0, 5).forEach(doc => {
          const data = doc.data();
          if (data.videoUrl && !data.videoUrl.includes('youtube') && !data.videoUrl.includes('vimeo')) {
            addPreloadedVideo(data.videoUrl);
          }
        });

        // 3. Fetch Project Videos (Top 5)
        const projectsRef = collection(db, 'sites', 'mostbooked', 'projects');
        const projectsSnap = await getDocs(projectsRef);
        projectsSnap.docs.slice(0, 5).forEach(doc => {
          const data = doc.data();
          if (data.videoUrl && !data.videoUrl.includes('youtube') && !data.videoUrl.includes('vimeo')) {
            addPreloadedVideo(data.videoUrl);
          }
        });

      } catch (err) {
        console.error("Error preloading videos:", err);
      }
    };

    fetchAndPreload();
  }, [addPreloadedVideo]);

  return (
    <div className="hidden" aria-hidden="true">
      {Array.from(preloadedVideos).map(url => (
        <video key={url} src={url} preload="auto" muted playsInline />
      ))}
    </div>
  );
};

export default VideoPreloader;
