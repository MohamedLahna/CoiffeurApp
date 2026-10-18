import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from '../../i18n';
import './restored-sections.css';

const barbers = [
  ['Yanis El Amrani', 'Master Barber', 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=900&q=85'],
  ['Léa Benali', 'Style Director', 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=900&q=85'],
  ['Adam Rahmani', 'Grooming Expert', 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=85'],
];

export function TeamSection() {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const [compact, setCompact] = useState(() => window.innerWidth <= 800);

  useEffect(() => {
    const breakpoint = window.matchMedia('(max-width: 800px)');
    const update = (event) => setCompact(event.matches);
    breakpoint.addEventListener('change', update);
    return () => breakpoint.removeEventListener('change', update);
  }, []);

  const shift = (direction) => setActive((current) => (current + direction + barbers.length) % barbers.length);

  return (
    <section id="team" className="team-section restored-team">
      <div className="section-head">
        <div>
          <p className="eyebrow">{t('team.eyebrow')}</p>
          <h2>{t('team.title')}<br /><em>{t('team.accent')}</em></h2>
          <p className="muted team-intro">{t('team.body')}</p>
        </div>
      </div>
      <div className="barber-stage team-carousel">
        <div className="orbit" />
        {barbers.map((barber, index) => {
          const relative = (index - active + barbers.length) % barbers.length;
          const position = relative === 0 ? 'front' : relative === 1 ? 'right' : 'left';
          const offset = compact ? 205 : 310;
          return (
            <motion.article
              key={barber[0]}
              className={`barber-card team-barber ${position}`}
              initial={false}
              animate={{
                x: position === 'front' ? 0 : position === 'right' ? offset : -offset,
                scale: position === 'front' ? 1 : 0.7,
                rotateY: position === 'front' ? 0 : position === 'right' ? -38 : 38,
                opacity: position === 'front' ? 1 : 0.48,
                zIndex: position === 'front' ? 3 : 1,
              }}
              transition={{ duration: 0.55, ease: [0.22, 0.7, 0.2, 1] }}
              onClick={() => position !== 'front' && setActive(index)}
            >
              <img src={barber[2]} alt={barber[0]} loading="lazy" decoding="async" />
              <div><p>{barber[1]}</p><h3>{barber[0]}</h3></div>
            </motion.article>
          );
        })}
        <div className="team-carousel-controls">
          <button onClick={() => shift(-1)} aria-label="Previous barber"><ArrowLeft size={17} /></button>
          <span>0{active + 1} <i>/ 0{barbers.length}</i></span>
          <button onClick={() => shift(1)} aria-label="Next barber"><ArrowRight size={17} /></button>
        </div>
      </div>
    </section>
  );
}
