'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { Rocket, Scan, Settings, Orbit, LockOpen, Power, ArrowUp, Zap, Box } from 'lucide-react';
import { useParams } from 'next/navigation';

interface InteractionProps {
  onAdvance: () => void;
  lang: string;
}

const t = {
  tr: {
    space_wait: "YÖRÜNGEYE ÇIKMAK İÇİN YUKARI SÜRÜKLE",
    space_done: "YÖRÜNGE ONAYLANDI",
    scan_wait: "YÜZEYİ TARAMAK İÇİN BASILI TUT",
    scan_done: "TARAMA TAMAMLANDI",
    morph_wait: "ARACA DÖNÜŞMEK İÇİN ÇARKI ÇEVİR",
    morph_done: "DÖNÜŞÜM AKTİF",
    throttle_wait: "GÜÇ VERMEK İÇİN SAĞA SÜRÜKLE",
    throttle_done: "MOTORLAR TAM GÜÇ",
    unlock_wait: "KUTUYU ALMAK İÇİN SÜRÜKLE",
    unlock_done: "KUTU GÜVENDE",
    launch_wait: "ÜSSE GERİ DÖN",
    launch_done: "BAŞLATIYOR...",
    launch_warn: "UYARI: OTOMATİK PİLOT DEVREYE GİRECEK"
  },
  en: {
    space_wait: "SWIPE UP TO ENTER ORBIT",
    space_done: "ORBIT CONFIRMED",
    scan_wait: "HOLD TO SCAN SURFACE",
    scan_done: "SCAN COMPLETE",
    morph_wait: "ROTATE DIAL TO MORPH",
    morph_done: "MORPH ENGAGED",
    throttle_wait: "DRAG RIGHT TO THROTTLE",
    throttle_done: "ENGINES FULL POWER",
    unlock_wait: "DRAG TO SECURE BOX",
    unlock_done: "BOX SECURED",
    launch_wait: "RETURN TO BASE",
    launch_done: "LAUNCHING...",
    launch_warn: "WARNING: AUTOPILOT ENGAGED"
  }
};

export default function CinematicInteractions({ onAdvance, currentScene }: { onAdvance: () => void, currentScene: number }) {
  const params = useParams();
  const lang = (params?.lang as string) === 'en' ? 'en' : 'tr';

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="absolute right-12 md:right-24 top-1/2 -translate-y-1/2 z-50 flex flex-col items-end pointer-events-auto drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]"
    >
      <div className="flex flex-col items-center gap-8">
        {currentScene === 1 && <InteractionSpace onAdvance={onAdvance} lang={lang} />}
        {currentScene === 2 && <InteractionScan onAdvance={onAdvance} lang={lang} />}
        {currentScene === 3 && <InteractionMorph onAdvance={onAdvance} lang={lang} />}
        {currentScene === 4 && <InteractionThrottle onAdvance={onAdvance} lang={lang} />}
        {currentScene === 5 && <InteractionUnlock onAdvance={onAdvance} lang={lang} />}
        {currentScene === 6 && <InteractionLaunch onAdvance={onAdvance} lang={lang} />}
      </div>
    </motion.div>
  );
}

// 1 -> 2: Uzaya Çıkış (Swipe Up)
function InteractionSpace({ onAdvance, lang }: InteractionProps) {
  const [success, setSuccess] = useState(false);
  const dict = t[lang as keyof typeof t];
  
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-cyan-400 font-mono tracking-widest uppercase text-sm border-b border-cyan-400/30 pb-2">
        {success ? dict.space_done : dict.space_wait}
      </div>
      
      <div className="h-64 w-20 bg-black/40 border border-cyan-500/30 rounded-full flex flex-col justify-end items-center pb-2 relative overflow-hidden backdrop-blur-md">
        <div className="absolute inset-y-0 w-px bg-cyan-500/20" />
        
        <motion.div
          drag="y"
          dragConstraints={{ top: -200, bottom: 0 }}
          dragElastic={0.1}
          onDragEnd={(_, info) => {
            if (info.offset.y < -150) {
              setSuccess(true);
              setTimeout(onAdvance, 600);
            }
          }}
          className="w-16 h-16 bg-cyan-600/80 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-[0_0_20px_rgba(8,145,178,0.6)] z-10"
        >
          <Rocket className="text-white w-8 h-8" />
        </motion.div>
      </div>
      
      <div className="flex flex-col items-center gap-1 opacity-50">
        <ArrowUp className="w-5 h-5 text-cyan-400 animate-bounce" />
        <ArrowUp className="w-5 h-5 text-cyan-400 animate-bounce" style={{ animationDelay: '0.1s' }} />
        <ArrowUp className="w-5 h-5 text-cyan-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
      </div>
    </div>
  );
}

// 2 -> 3: Yüzey Taraması (Hold to Scan)
function InteractionScan({ onAdvance, lang }: InteractionProps) {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [success, setSuccess] = useState(false);
  const dict = t[lang as keyof typeof t];
  
  useEffect(() => {
    if (success) return;
    
    let interval: NodeJS.Timeout;
    if (isHolding && progress < 100) {
      interval = setInterval(() => {
        setProgress(p => p + 2);
      }, 30);
    } else if (!isHolding && progress < 100) {
      setProgress(0); // Reset if let go early
    }
    return () => clearInterval(interval);
  }, [isHolding, progress, success]);

  useEffect(() => {
    if (progress >= 100 && !success) {
      setSuccess(true);
      setTimeout(onAdvance, 500);
    }
  }, [progress, success, onAdvance]);

  return (
    <div className="flex flex-col items-center gap-10">
      <div className="text-emerald-400 font-mono tracking-widest uppercase text-sm border-b border-emerald-400/30 pb-2">
        {progress === 100 ? dict.scan_done : dict.scan_wait}
      </div>
      
      <div 
        className="relative w-48 h-48 flex items-center justify-center cursor-pointer select-none"
        onMouseDown={() => setIsHolding(true)}
        onMouseUp={() => setIsHolding(false)}
        onMouseLeave={() => setIsHolding(false)}
        onTouchStart={(e) => { e.preventDefault(); setIsHolding(true); }}
        onTouchEnd={() => setIsHolding(false)}
      >
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle cx="96" cy="96" r="80" className="stroke-emerald-950/40" strokeWidth="8" fill="none" />
          <motion.circle 
            cx="96" cy="96" r="80" 
            className="stroke-emerald-500 shadow-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" 
            strokeWidth="8" fill="none" 
            strokeDasharray="502"
            strokeDashoffset={502 - (502 * progress) / 100}
            strokeLinecap="round"
          />
        </svg>
        
        <motion.div 
          animate={{ scale: isHolding ? 0.9 : 1 }} 
          className={`w-32 h-32 rounded-full flex items-center justify-center transition-colors duration-300 ${progress === 100 ? 'bg-emerald-500' : 'bg-emerald-950/60 border border-emerald-500/50'}`}
        >
          <Scan className={`w-12 h-12 ${progress === 100 ? 'text-black' : 'text-emerald-400'}`} />
        </motion.div>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-xl text-emerald-400 opacity-50 mt-16">
          {progress}%
        </div>
      </div>
    </div>
  );
}

// 3 -> 4: Araca Dönüşüm (Rotate Wheel)
function InteractionMorph({ onAdvance, lang }: InteractionProps) {
  const rotation = useMotionValue(0);
  const [success, setSuccess] = useState(false);
  const hasTriggered = useRef(false);
  const dict = t[lang as keyof typeof t];
  
  useEffect(() => {
    return rotation.onChange((v) => {
      if (Math.abs(v) > 270 && !hasTriggered.current) {
        hasTriggered.current = true;
        setSuccess(true);
        setTimeout(onAdvance, 800);
      }
    });
  }, [rotation, onAdvance]);

  return (
    <div className="flex flex-col items-center gap-10">
      <div className="text-amber-400 font-mono tracking-widest uppercase text-sm border-b border-amber-400/30 pb-2">
        {success ? dict.morph_done : dict.morph_wait}
      </div>
      
      <div className="relative w-56 h-56 flex items-center justify-center">
        <div className="absolute inset-0 border-[3px] border-dashed border-amber-500/20 rounded-full pointer-events-none" />
        
        <motion.div
          drag
          dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
          dragElastic={0}
          onDrag={(e, info) => {
            const current = rotation.get();
            const delta = info.delta.x + info.delta.y;
            rotation.set(current + delta * 2);
          }}
          style={{ rotate: rotation }}
          className="w-40 h-40 rounded-full border-4 border-amber-500/50 bg-amber-950/40 flex items-center justify-center cursor-grab active:cursor-grabbing shadow-[0_0_30px_rgba(245,158,11,0.2)]"
        >
          <Orbit className="w-20 h-20 text-amber-400 pointer-events-none" />
        </motion.div>
        
        {success && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 bg-amber-500 rounded-full flex items-center justify-center pointer-events-none"
          >
            <Settings className="w-24 h-24 text-black animate-spin-slow" />
          </motion.div>
        )}
      </div>
    </div>
  );
}

// 4 -> 5: Keşif (Drag Right / Throttle)
function InteractionThrottle({ onAdvance, lang }: InteractionProps) {
  const [success, setSuccess] = useState(false);
  const dict = t[lang as keyof typeof t];
  
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-orange-400 font-mono tracking-widest uppercase text-sm border-b border-orange-400/30 pb-2">
        {success ? dict.throttle_done : dict.throttle_wait}
      </div>
      
      <div className="w-80 h-20 bg-orange-950/40 border border-orange-500/30 rounded-full flex items-center px-2 relative overflow-hidden">
        {success && (
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.5 }}
            className="absolute inset-y-0 left-0 bg-orange-600/40"
          />
        )}
        
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 240 }}
          dragElastic={0.1}
          onDragEnd={(_, info) => {
            if (info.offset.x > 200) {
              setSuccess(true);
              setTimeout(onAdvance, 600);
            }
          }}
          className="w-16 h-16 bg-orange-600/80 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing backdrop-blur-md shadow-[0_0_20px_rgba(234,88,12,0.6)] z-10"
        >
          <Zap className="text-white w-8 h-8" />
        </motion.div>
        
        {!success && (
          <div className="absolute right-6 font-mono text-orange-400/40 flex items-center gap-2 pointer-events-none">
            <span>&gt;</span><span>&gt;</span><span>&gt;</span>
          </div>
        )}
      </div>
    </div>
  );
}

// 5 -> 6: Kutu Alma (Slide)
function InteractionUnlock({ onAdvance, lang }: InteractionProps) {
  const [success, setSuccess] = useState(false);
  const dict = t[lang as keyof typeof t];
  
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-purple-400 font-mono tracking-widest uppercase text-sm border-b border-purple-400/30 pb-2">
        {success ? dict.unlock_done : dict.unlock_wait}
      </div>
      
      <div className="w-80 h-20 bg-purple-950/40 border-2 border-purple-500/30 rounded-lg flex items-center px-2 relative overflow-hidden">
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 240 }}
          dragElastic={0.1}
          onDragEnd={(_, info) => {
            if (info.offset.x > 200) {
              setSuccess(true);
              setTimeout(onAdvance, 600);
            }
          }}
          className={`w-16 h-16 ${success ? 'bg-purple-500' : 'bg-purple-600/80'} rounded-md flex items-center justify-center cursor-grab active:cursor-grabbing backdrop-blur-md shadow-[0_0_20px_rgba(147,51,234,0.6)] z-10 transition-colors`}
        >
          {success ? <LockOpen className="text-black w-8 h-8" /> : <Box className="text-white w-8 h-8" />}
        </motion.div>
        
        <div className="absolute right-6 font-mono text-purple-400/40 flex items-center pointer-events-none">
          <div className="w-12 h-12 border-2 border-dashed border-purple-400/30 rounded-md"></div>
        </div>
      </div>
    </div>
  );
}

// 6 -> 7: Geri Dönüş (Launch Button)
function InteractionLaunch({ onAdvance, lang }: InteractionProps) {
  const [success, setSuccess] = useState(false);
  const dict = t[lang as keyof typeof t];
  
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-red-400 font-mono tracking-widest uppercase text-xl font-bold border-b border-red-400/30 pb-2 animate-pulse">
        {success ? dict.launch_done : dict.launch_wait}
      </div>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setSuccess(true);
          setTimeout(onAdvance, 600);
        }}
        className={`w-40 h-40 rounded-full border-4 ${success ? 'border-red-400 bg-red-500' : 'border-red-500/50 bg-red-950/60'} flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.5)] transition-colors duration-500`}
      >
        <Power className={`w-20 h-20 ${success ? 'text-black' : 'text-red-400'}`} />
      </motion.button>
      
      <div className="text-xs text-red-400/50 font-mono mt-4">
        {dict.launch_warn}
      </div>
    </div>
  );
}
