import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ArrowUpRight } from 'lucide-react';
import { weddingConfig as c } from '../config/weddingConfig';
import type { Guest } from '../data/guests';
import { useMotionPreference } from '../hooks/useMotionPreference';
export function Invitation({ guest, onClose }: { guest: Guest; onClose: () => void }) {
  const root = useRef<HTMLDialogElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const [opening, setOpening] = useState(false);
  const reduced = useMotionPreference();
  const { contextSafe } = useGSAP({ scope: root });
  useEffect(() => {
    const dialog = root.current;
    const viewport = window.visualViewport;
    let resizeFrame = 0;
    const fitViewport = () => {
      const height = Math.min(window.innerHeight, viewport?.height || window.innerHeight);
      dialog?.style.setProperty('--invitation-height', `${height}px`);
      dialog?.style.setProperty('--invitation-top', `${viewport?.offsetTop || 0}px`);
      dialog?.toggleAttribute('data-compact', height <= 560);
    };
    const scheduleFit = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(fitViewport);
    };
    fitViewport();
    viewport?.addEventListener('resize', scheduleFit);
    viewport?.addEventListener('scroll', scheduleFit);
    window.addEventListener('resize', scheduleFit);
    dialog?.showModal();
    dialog?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(resizeFrame);
      viewport?.removeEventListener('resize', scheduleFit);
      viewport?.removeEventListener('scroll', scheduleFit);
      window.removeEventListener('resize', scheduleFit);
      dialog?.close();
      document.body.style.overflow = previous;
    };
  }, []);
  useEffect(() => {
    if (reduced && opening) {
      timeline.current?.kill();
      onClose();
    }
  }, [reduced, opening, onClose]);
  const open = () =>
    contextSafe(() => {
      if (opening) return;
      setOpening(true);
      if (reduced) {
        onClose();
        return;
      }
      timeline.current = gsap
        .timeline({ defaults: { ease: 'power3.inOut' }, onComplete: onClose })
        .to('.cover-type', { yPercent: -18, opacity: 0, duration: 0.5, stagger: 0.06 })
        .to(
          '.cover-panel',
          { xPercent: -105, rotation: -4, duration: 1.1, transformOrigin: 'left bottom' },
          0.2,
        )
        .to('.cover-image', { clipPath: 'inset(0 0 100% 0)', duration: 1 }, 0.35)
        .to(root.current, { opacity: 0, duration: 0.35 }, 1.05);
    })();
  return (
    <dialog
      className="invitation-overlay"
      ref={root}
      tabIndex={-1}
      aria-labelledby="invitation-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="cover-panel" />
      <div className="invitation-top">
        <span className="micro">Особливий випуск · 2027</span>
        <button className="text-link" onClick={onClose}>
          Пропустити <ArrowUpRight size={15} />
        </button>
      </div>
      <div className="magazine-cover">
        <div className="cover-image">
          <img
            src={c.photos.hero}
            alt={c.photos.heroAlt}
            width="736"
            height="903"
            fetchPriority="high"
          />
          <p className="cover-date cover-type">
            {c.shortDate.split('.')[0]}
            <br />
            <span>
              {c.shortDate
                .split('.')
                .slice(1)
                .map((value, index) => (index === 1 ? value.slice(-2) : value))
                .join(' · ')}
            </span>
          </p>
        </div>
        <div className="cover-heading cover-type">
          <span className="micro">{guest.cover}</span>
          <h1 id="invitation-title">
            <span className="cover-first">Це ми.</span>
            <br />
            <span className="cover-last">Назавжди.</span>
          </h1>
        </div>
        <p className="cover-edition cover-type">
          ОДИН ДЕНЬ.
          <br />
          ЦІЛЕ ЖИТТЯ.
        </p>

        <span className="cover-caption micro">
          <span>{c.couple.together} · Київ</span>
          <span className="cover-mobile-date">{c.dateLabel}</span>
        </span>
      </div>
      <div className="invitation-bottom">
        <button className="button" onClick={open} disabled={opening}>
          Відкрити запрошення <ArrowUpRight size={18} />
        </button>
        <span className="micro">Наша найважливіша історія</span>
      </div>
    </dialog>
  );
}
