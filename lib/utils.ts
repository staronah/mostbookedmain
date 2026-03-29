export function getYoutubeEmbedUrl(url: string): string {
  if (!url) return '';
  
  // Extract video ID from various YouTube URL formats
  let videoId = '';
  
  // Handle youtu.be/ID
  if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0];
  } 
  // Handle youtube.com/watch?v=ID
  else if (url.includes('youtube.com/watch')) {
    const urlParams = new URLSearchParams(url.split('?')[1]);
    videoId = urlParams.get('v') || '';
  }
  // Handle youtube.com/embed/ID
  else if (url.includes('youtube.com/embed/')) {
    videoId = url.split('youtube.com/embed/')[1]?.split('?')[0];
  }
  // Handle youtube.com/shorts/ID
  else if (url.includes('youtube.com/shorts/')) {
    videoId = url.split('youtube.com/shorts/')[1]?.split('?')[0];
  }
  // If it's just an ID (alphanumeric, 11 chars usually)
  else if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    videoId = url;
  }
  
  if (!videoId) return url; // Return original if we couldn't parse it
  
  // Construct the embed URL with parameters for background autoplay
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&playsinline=1&rel=0`;
}
