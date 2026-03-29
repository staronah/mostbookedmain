
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Maximize2, Minimize2, Download, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Set up worker for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface PDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  courseTitle: string;
}

const PDFModal: React.FC<PDFModalProps> = ({ isOpen, onClose, pdfUrl, courseTitle }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // PDF Viewer state
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      loadPdf();
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, courseTitle, pdfUrl]);

  useEffect(() => {
    if (pdfDoc) {
      // Small delay to ensure canvas is mounted
      const timer = setTimeout(() => {
        renderPage(pageNumber);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [pdfDoc, pageNumber, isFullscreen]);

  const loadPdf = async () => {
    if (!pdfUrl) return;
    setIsLoading(true);
    setError(null);
    
    try {
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      setPdfDoc(pdf);
      setNumPages(pdf.numPages);
      setPageNumber(1);

      console.log("PDF Loaded successfully");
    } catch (err: any) {
      console.error("Error loading PDF:", err);
      let errorMessage = "Failed to load PDF curriculum. It might be private or unavailable.";
      
      // Check for CORS or Cloudinary specific issues
      if (pdfUrl.includes('cloudinary.com')) {
        errorMessage = "Cloudinary CORS error: This PDF is restricted by the server. Please check your Cloudinary settings or open the link directly.";
      } else if (err.name === 'MissingPDFException' || err.name === 'UnexpectedResponseException') {
        errorMessage = "The document could not be found or is not a valid PDF.";
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPage = async (num: number) => {
    if (!pdfDoc || !canvasRef.current) return;

    try {
      const page = await pdfDoc.getPage(num);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;

      // Adjust scale based on device pixel ratio for sharpness
      const dpr = window.devicePixelRatio || 1;
      const containerWidth = containerRef.current?.clientWidth || 800;
      
      // Initial viewport at scale 1 to get base dimensions
      const baseViewport = page.getViewport({ scale: 1 });
      const scale = (containerWidth * 0.9) / baseViewport.width;
      
      // Final viewport with calculated scale and DPR
      const viewport = page.getViewport({ scale: Math.min(scale, 2) * dpr });

      canvas.height = viewport.height;
      canvas.width = viewport.width;
      canvas.style.width = `${viewport.width / dpr}px`;
      canvas.style.height = `${viewport.height / dpr}px`;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
    } catch (err) {
      console.error("Error rendering page:", err);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (pdfDoc) {
        renderPage(pageNumber);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pdfDoc, pageNumber, isFullscreen]);

  const changePage = (offset: number) => {
    const newPage = pageNumber + offset;
    if (newPage >= 1 && newPage <= (numPages || 1)) {
      setPageNumber(newPage);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-secondary/95 backdrop-blur-xl p-4 md:p-8"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className={`bg-primary w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-ui/10 flex flex-col relative ${isFullscreen ? 'fixed inset-0 m-0 rounded-none' : 'max-w-6xl max-h-[90vh]'}`}
        >
          {/* Header */}
          <div className="p-6 border-b border-ui/5 flex items-center justify-between bg-white/50 backdrop-blur-md z-10">
            <div className="flex items-center space-x-4">
              <div>
                <h2 className="text-ui font-hero text-2xl uppercase tracking-tight">{courseTitle}</h2>
                <p className="text-ui/40 text-[10px] uppercase tracking-widest font-bold">Curriculum Reader</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => window.open(pdfUrl, '_blank')}
                className="p-3 bg-ui/5 text-ui/60 hover:bg-ui/10 rounded-xl transition-all duration-300"
                title="Download PDF"
              >
                <Download size={20} />
              </button>
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-3 bg-ui/5 text-ui/60 hover:bg-ui/10 rounded-xl transition-all duration-300 hidden md:block"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
              <button 
                onClick={onClose}
                className="p-3 bg-accent/10 text-accent hover:bg-accent hover:text-white rounded-xl transition-all duration-300"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-grow flex flex-col overflow-hidden relative">
            {/* PDF Viewer */}
            <div 
              ref={containerRef}
              className="flex-grow h-full bg-grey/10 relative transition-all duration-500 overflow-y-auto w-full"
            >
              <div className="flex flex-col items-center py-8 min-h-full">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center p-20">
                    <Loader2 className="animate-spin text-accent mb-4" size={40} />
                    <p className="text-ui/40 font-heading text-sm uppercase tracking-widest">Loading Document...</p>
                  </div>
                ) : error ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center p-20 text-center max-w-lg"
                  >
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-8">
                      <X size={40} />
                    </div>
                    <p className="text-white font-heading text-2xl mb-4 uppercase tracking-tight">{error}</p>
                    <p className="text-white/40 text-sm mb-12 leading-relaxed">
                      This can happen if the file is restricted by the server's security policy (CORS). You can still access the curriculum by opening it directly in a new window.
                    </p>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => window.open(pdfUrl, '_blank')}
                      className="px-10 py-4 bg-accent text-white rounded-2xl text-sm font-heading uppercase tracking-widest shadow-2xl shadow-accent/20 transition-all"
                    >
                      Open Curriculum Directly
                    </motion.button>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center">
                    <canvas 
                      ref={canvasRef} 
                      className="shadow-2xl bg-white max-w-full h-auto"
                    />
                    
                    {numPages && (
                      <div className="sticky bottom-6 mt-8 flex items-center space-x-4 bg-secondary/90 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl border border-white/10 z-20">
                        <button
                          type="button"
                          disabled={pageNumber <= 1}
                          onClick={() => changePage(-1)}
                          className="p-2 text-white/60 hover:text-white disabled:opacity-30 transition-colors"
                        >
                          <ChevronLeft size={24} />
                        </button>
                        <p className="text-white font-heading text-sm tracking-widest">
                          PAGE {pageNumber} OF {numPages}
                        </p>
                        <button
                          type="button"
                          disabled={pageNumber >= numPages}
                          onClick={() => changePage(1)}
                          className="p-2 text-white/60 hover:text-white disabled:opacity-30 transition-colors"
                        >
                          <ChevronRight size={24} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Overlay for luxury feel */}
              <div className="absolute inset-0 pointer-events-none border-4 border-primary/50 rounded-none z-10" />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PDFModal;
