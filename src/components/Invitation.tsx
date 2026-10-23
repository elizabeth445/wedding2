import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ArrowUpRight } from 'lucide-react';
import { weddingConfig as c } from '../config/weddingConfig';
import type { Guest } from '../data/guests';
import { useMotionPreference } from '../hooks/useMotionPreference';
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
      const landscape = window.innerWidth > window.innerHeight && window.innerHeight <= 560;
      const scale = landscape ? 1.06 : 1.13;
      const card = root.current
        ?.querySelector<HTMLElement>('.invitation-card')
        ?.getBoundingClientRect();
      const stage = root.current
        ?.querySelector<HTMLElement>('.invitation-stage')
        ?.getBoundingClientRect();
      let lift = landscape ? -24 : -42;
      if (card && stage) {
        const angle = (7 * Math.PI) / 180;
        const rotatedHeight =
          scale * (card.height * Math.cos(angle) + card.width * Math.sin(angle));
        const safeLift =
          ((stage.top + 16 - card.top + (rotatedHeight - card.height) / 2) / card.height) * 100;
        lift = Math.max(lift, safeLift);
      }
      timeline.current = gsap
        .timeline({ defaults: { ease: 'power3.inOut' }, onComplete: onClose })
        .to('.envelope-seal', { scale: 0.8, opacity: 0, duration: 0.18 })
        .to('.paper-date', { opacity: 0, duration: 0.18 }, 0.18)
        .to(
          '.invitation-card',
          {
            yPercent: lift,
            scale,
            rotation: -7,
            duration: 0.9,
            ease: 'power3.out',
          },
          0.16,
        )
        .to('.cover-image', { opacity: 1, duration: 0.38 }, 0.32)
        .to('.cover-heading', { top: '58%', color: '#fff', duration: 0.38 }, 0.32)
        .set('.invitation-card', { zIndex: 5 }, 0.75)
        .to(
          '.envelope-art, .envelope-inscription',
          { yPercent: 18, opacity: 0, duration: 0.65 },
          0.8,
        )
        .to(
          '.invitation-bottom, .invitation-top, .invitation-recipient',
          { opacity: 0, duration: 0.3 },
          1,
        )
        .to('.invitation-card', { yPercent: lift + 4, rotation: 0, duration: 0.5 }, 1.12)
        .to('.invitation-card', { yPercent: lift - 6, opacity: 0, duration: 0.5 }, 2.05)
        .to(root.current, { opacity: 0, duration: 0.35 }, 2.35);
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
        <div className="envelope-scene">
          <img
            className="envelope-art envelope-back"
            src="/images/lace-envelope.webp"
            alt=""
            aria-hidden="true"
            width="1254"
            height="1254"
            fetchPriority="high"
          />
          <div className="invitation-card">
            <div className="cover-image" aria-hidden={!opening}>
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
              <p className="paper-date">{c.dateLabel}</p>
            </div>
          </div>
          <img
            className="envelope-art envelope-front"
            src="/images/lace-envelope.webp"
            alt=""
            aria-hidden="true"
            width="1254"
            height="1254"
          />
          <div className="envelope-inscription">
            <button
              className="envelope-seal"
              type="button"
              onClick={open}
              disabled={opening}
              aria-label="Розкрити конверт"
            />
          </div>
        </div>
        <div className="invitation-recipient">
          <p className="cover-caption">{c.couple.together}</p>
          <p>{guest.cover}</p>
        </div>
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
