import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ArrowUpRight } from 'lucide-react';
import { weddingConfig as c } from '../config/weddingConfig';
import type { Guest } from '../data/guests';
import { useMotionPreference } from '../hooks/useMotionPreference';
import { Chandelier, PearlStrand } from './Ornament';
import '../styles/invitation.css';
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
        .to('.envelope-seal', { scale: 0.8, opacity: 0, duration: 0.22 })
        .to('.envelope-flap', { rotationX: 180, duration: 0.6 }, 0.12)
        .set('.envelope-flap', { zIndex: 0 }, 0.42)
        .to('.invitation-card', { yPercent: -12, rotation: -2, duration: 0.75 }, 0.44)
        .to('.envelope-body', { yPercent: 50, opacity: 0, duration: 0.7 }, 0.65)
        .to(
          '.invitation-bottom, .invitation-top, .cover-decoration',
          { opacity: 0, duration: 0.3 },
          0.9,
        )
        .to('.invitation-card', { yPercent: -16, scale: 1.035, rotation: 0, duration: 0.5 }, 1.2)
        .to(root.current, { opacity: 0, duration: 0.4 }, 1.65);
    })();
  return (
    <dialog
      className="invitation-overlay"
      ref={root}
      tabIndex={-1}
      aria-labelledby="invitation-title"
      data-opening={opening || undefined}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="cover-panel" />
      <div className="invitation-top">
        <span className="invitation-personal">Особисто для вас</span>
        <button className="text-link" onClick={onClose}>
          Пропустити <ArrowUpRight size={15} />
        </button>
      </div>
      <div className="invitation-stage">
        <Chandelier className="cover-decoration cover-chandelier" />
        <PearlStrand className="cover-decoration cover-pearls" />
        <div className="envelope-scene">
          <div className="envelope-body envelope-back" aria-hidden="true" />
          <div className="envelope-body envelope-flap" aria-hidden="true" />
          <div className="invitation-card">
            <div className="cover-image">
              <img
                src={c.photos.hero}
                alt={c.photos.heroAlt}
                width="736"
                height="903"
                fetchPriority="high"
              />
            </div>
            <div className="cover-heading">
              <h1 id="invitation-title">
                <span className="cover-first">Це ми.</span>
                <span className="cover-last">Назавжди.</span>
              </h1>
            </div>
          </div>
          <div className="envelope-body envelope-front" aria-hidden="true" />
          <svg
            className="envelope-body envelope-seams"
            viewBox="0 0 480 200"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M2 2 240 98 478 2M2 198 175 105M478 198 305 105" />
          </svg>
          <div className="envelope-body envelope-inscription">
            <button
              className="envelope-seal"
              type="button"
              onClick={open}
              disabled={opening}
              aria-label="Розкрити конверт"
            >
              {c.couple.initials}
            </button>
            <p className="cover-caption">
              {c.couple.together}
              <span>{c.dateLabel}</span>
            </p>
          </div>
        </div>
        <p className="invitation-recipient">{guest.cover}</p>
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
