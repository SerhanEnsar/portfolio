'use client';

import { useEffect, useRef, useState } from 'react';
import { useCinematicStore } from '@/lib/store/useCinematicStore';
import { Button } from '@/components/ui/button';
import { X, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CinematicInteractions from './CinematicInteractions';
import { useParams } from 'next/navigation';

const sceneData: Record<number, { title: string; subtitle: string }> = {
  1: { title: 'TUYGUN', subtitle: 'UAV SYSTEM' },
  2: { title: 'TUYGUN', subtitle: 'UAV SYSTEM' },
  3: { title: 'TUYGUN', subtitle: 'UAV SYSTEM' },
  4: { title: 'EGE ODBARS', subtitle: 'UGV ROBOT' },
  5: { title: 'EGE ODBARS', subtitle: 'UGV ROBOT' },
  6: { title: 'EGENODE', subtitle: 'LOGISTICS ARM' },
  7: { title: 'TUYGUN', subtitle: 'UAV SYSTEM' },
};

export function CinematicPlayer() {
  const { 
    isOpen, 
    closeCinematic, 
    currentScene, 
    advanceScene, 
    isWaitingForAction, 
    setWaitingForAction,
    isIdleLooping,
    setIdleLooping
  } = useCinematicStore();
  
  const params = useParams();
  const lang = (params?.lang as string) === 'en' ? 'en' : 'tr';
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFinished, setIsFinished] = useState(false);

  // Initialize on open
  useEffect(() => {
    if (isOpen) {
      setIsFinished(false);
      setWaitingForAction(false);
      setIdleLooping(true);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(console.error);
      }
    }
  }, [isOpen, setWaitingForAction, setIdleLooping]);

  // Handle scene transitions (auto-play when scene changes)
  useEffect(() => {
    if (isOpen && videoRef.current && !isWaitingForAction && !isIdleLooping) {
      // Only reset to 0 if we are actually starting a brand new scene
      // (The very first play from idle loop shouldn't reset to 0, it should continue from 2.3)
      if (currentScene > 1) {
        videoRef.current.currentTime = 0;
      }
      videoRef.current.play().catch(console.error);
    }
  }, [currentScene, isWaitingForAction, isIdleLooping, isOpen]);

  // High-precision requestAnimationFrame for loop and transition cuts
  useEffect(() => {
    if (!isOpen) return;

    let rafId: number;

    const checkVideoTime = () => {
      if (videoRef.current) {
        const time = videoRef.current.currentTime;
        const duration = videoRef.current.duration;

        // 1. Idle Logic for Scene 1 (Play until 2.3s then pause, don't loop)
        if (isIdleLooping && currentScene === 1) {
          if (time >= 2.3) {
            videoRef.current.pause();
          }
        } 
        // 2. End-of-scene precision cuts
        else if (!isWaitingForAction && !isFinished && duration > 0) {
          // Cut 0.4s early to prevent the slow-down effect in the raw videos
          // Don't cut scene 7 since it's the final ending
          const limit = currentScene === 7 ? duration : duration - 0.4;
          
          if (time >= limit) {
            videoRef.current.pause();
            
            if (currentScene === 7) {
              setIsFinished(true);
            } else {
              setWaitingForAction(true);
            }
          }
        }
      }
      rafId = requestAnimationFrame(checkVideoTime);
    };

    rafId = requestAnimationFrame(checkVideoTime);
    return () => cancelAnimationFrame(rafId);
  }, [isOpen, isIdleLooping, currentScene, isWaitingForAction, isFinished, setWaitingForAction]);

  if (!isOpen) return null;

  const currentInfo = sceneData[currentScene];

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden">
      {/* Background Preloader for Next Scene */}
      {currentScene < 7 && (
        <video src={`/cinematic/sahne${currentScene + 1}.mp4`} preload="auto" className="hidden" />
      )}

      {/* Orientation Warning (Mobile) */}
      <div className="absolute inset-0 z-[110] portrait:flex landscape:hidden bg-black flex-col items-center justify-center text-center p-6">
        <div className="text-bone font-display uppercase tracking-widest text-xl font-bold mb-4">Cihazınızı Yan Çevirin</div>
        <div className="text-dim font-mono text-xs uppercase tracking-widest">En iyi sinematik deneyim için yatay mod gereklidir.</div>
        <Button variant="outline" className="mt-6 border-line text-bone font-mono uppercase tracking-widest" onClick={closeCinematic}>
          Çıkış Yap
        </Button>
      </div>

      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-[105] text-dim hover:text-signal hover:bg-transparent"
        onClick={closeCinematic}
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Video Element */}
      <video
        ref={videoRef}
        src={`/cinematic/sahne${currentScene}.mp4`}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted={false}
      />

      {/* Cyberpunk HUD Overlay */}
      <AnimatePresence mode="wait">
        {!isWaitingForAction && !isIdleLooping && (
          <motion.div
            key={currentInfo.title + currentInfo.subtitle}
            initial={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute bottom-12 left-12 z-40 flex flex-col pointer-events-none"
          >
            <div className="border-l-4 border-signal pl-4 py-1">
              <h1 className="font-display text-4xl md:text-5xl font-bold text-bone uppercase tracking-[0.1em] drop-shadow-md">
                {currentInfo.title}
              </h1>
              <p className="font-mono text-sm md:text-base text-signal uppercase tracking-[0.3em] mt-1 drop-shadow-md">
                {currentInfo.subtitle}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Initial Play Button (Breaks the 2.3s loop) */}
      <AnimatePresence>
        {isIdleLooping && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setIdleLooping(false);
                if (videoRef.current) {
                  // Push it just slightly past 2.3 to ensure we don't accidentally loop again
                  videoRef.current.currentTime = 2.35;
                }
              }}
              className="group flex flex-col items-center gap-4"
            >
              <div className="w-24 h-24 rounded-full border-2 border-signal/50 bg-black/50 backdrop-blur-md flex items-center justify-center group-hover:border-signal group-hover:bg-signal/20 transition-all duration-500 shadow-[0_0_30px_rgba(var(--signal),0.3)]">
                <Play className="w-10 h-10 text-signal ml-2" />
              </div>
              <div className="text-signal font-mono uppercase tracking-[0.3em] text-sm group-hover:text-bone transition-colors">
                {lang === 'en' ? 'INITIATE SYSTEM' : 'SİSTEMİ BAŞLAT'}
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cyberpunk Interactions */}
      <AnimatePresence>
        {isWaitingForAction && !isFinished && (
          <CinematicInteractions 
            currentScene={currentScene} 
            onAdvance={advanceScene} 
          />
        )}
      </AnimatePresence>

      {/* Action Button Overlay (Only at the very end) */}
      <AnimatePresence>
        {isFinished && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-12 right-12 z-40 flex justify-end"
          >
            <Button
              size="lg"
              className="text-sm px-8 py-6 rounded-none bg-signal/10 hover:bg-signal/20 backdrop-blur-sm border border-signal text-signal font-mono uppercase tracking-[0.2em] transition-all duration-300"
              onClick={closeCinematic}
            >
              {lang === 'en' ? 'MISSION ACCOMPLISHED - EXIT' : 'GÖREV TAMAMLANDI - ÇIKIŞ'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
