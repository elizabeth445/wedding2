import { useCallback, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getGuest } from './data/guests';
import { Header } from './components/Header';
import { Invitation } from './components/Invitation';
import { Hero, Letter } from './sections/Hero';
import { Story } from './sections/Story';
import { Countdown, Day, Venue } from './sections/Day';
import { DressCode } from './sections/DressCode';
import { RSVP } from './sections/RSVP';
import { Closing } from './sections/Closing';
import { useMotionPreference } from './hooks/useMotionPreference';
gsap.registerPlugin(useGSAP, ScrollTrigger);
export default function App() {
  const [guest] = useState(getGuest);
  const [invitation, setInvitation] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const reduced = useMotionPreference();
  const close = useCallback(() => {
    setInvitation(false);
    requestAnimationFrame(() =>
      document.getElementById('hero-title')?.focus({ preventScroll: true }),
    );
  }, []);
  const replay = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setInvitation(true);
  }, []);
  useGSAP(
    () => {
      if (invitation || reduced) return;
      gsap
        .timeline({ defaults: { duration: 1, ease: 'power3.out' } })
        .from('.name-line, .second-line', { clipPath: 'inset(0 0 100% 0)', y: 14, stagger: 0.12 })
        .from('.hero-photo img', { scale: 1.06, duration: 1.3 }, 0);
      const media = gsap.matchMedia();
      media.add('(min-width: 701px)', () => {
        gsap.utils.toArray<HTMLElement>('.pearl-drift').forEach((strand) => {
          gsap.fromTo(
            strand,
            { y: -16 },
            {
              y: 16,
              ease: 'none',
              scrollTrigger: {
                trigger: strand.closest('section, footer'),
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            },
          );
        });
      });
      gsap.from('.story-photo img', {
        clipPath: 'inset(0 12% 0 12%)',
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.story-photo', start: 'top 85%', once: true },
      });
      gsap.from('.date-poster', {
        y: 24,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.date-poster', start: 'top 85%', once: true },
      });
      gsap.fromTo(
        '.closing-image img',
        { yPercent: -5, scale: 1.12 },
        {
          yPercent: 5,
          scale: 1.12,
          ease: 'none',
          scrollTrigger: {
            trigger: '.closing-spread',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      );
      return () => media.revert();
    },
    { scope: root, dependencies: [invitation, reduced], revertOnUpdate: true },
  );
  return (
    <div ref={root}>
      <a className="skip-link" href="#main">
        До основного вмісту
      </a>
      <Header onReplay={replay} />
      <main id="main">
        <Hero active={!invitation} />
        <Letter guest={guest} />
        <Story />
        <Countdown />
        <Day />
        <DressCode />
        <Venue />
        <RSVP guest={guest} />
      </main>
      <Closing onReplay={replay} />
      {invitation && <Invitation guest={guest} onClose={close} />}
    </div>
  );
}
