'use client';

import { useCinematicStore } from '@/lib/store/useCinematicStore';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';

export function CinematicFooterTrigger() {
  const { openCinematic } = useCinematicStore();
  const params = useParams();
  const lang = (params?.lang as string) === 'en' ? 'en' : 'tr';

  return (
    <div className="w-full bg-void border-t border-line py-20 flex flex-col items-center justify-center text-center px-4">
      <h2 className="font-display text-4xl md:text-5xl font-bold text-bone mb-6 uppercase tracking-tight">
        {lang === 'en' ? 'Are You Ready?' : 'Hazır Mısın?'}
      </h2>
      <p className="text-dim mb-10 max-w-xl font-mono text-sm uppercase tracking-widest">
        {lang === 'en' 
          ? 'You can continue exploring the portfolio or embark on a cinematic journey.' 
          : 'Portfolyoyu incelemeye devam edebilir veya sinematik bir yolculuğa çıkabilirsin.'}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-6">
        <Button 
          size="lg" 
          className="bg-signal text-void hover:bg-signal/90 font-mono uppercase tracking-[0.2em] px-8"
          onClick={openCinematic}
        >
          {lang === 'en' ? 'INITIATE CINEMATIC' : 'SİNEMATİĞİ BAŞLAT'}
        </Button>
        <Button 
          variant="outline" 
          size="lg"
          className="border-line text-bone hover:bg-white/5 font-mono uppercase tracking-[0.2em] px-8"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          {lang === 'en' ? 'I\'ll explore more' : 'Biraz Daha Dolaşacağım'}
        </Button>
      </div>
    </div>
  );
}
