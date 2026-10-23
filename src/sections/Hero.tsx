import { useState } from 'react';
import { ArrowDown, ArrowUpRight, Pause, Play } from 'lucide-react';
import { weddingConfig as c } from '../config/weddingConfig';
import { PearlStrand, SectionLabel } from '../components/Ornament';
import type { Guest } from '../data/guests';
import { ChromeBackground } from '../components/ChromeBackground';
import { useMotionPreference } from '../hooks/useMotionPreference';
import '../styles/editorial-details.css';

export function Hero({ active }: { active: boolean }) {
  const [paused, setPaused] = useState(false);
  const reduced = useMotionPreference();
  return (
    <section className="hero" id="home" aria-labelledby="hero-title">
      <ChromeBackground active={active && !reduced} paused={paused} />
      <div className="hero-copy">
        <p className="micro hero-kicker">
          Весільна історія № 01 <span>Київ · 2027</span>
        </p>
        <h1 id="hero-title" tabIndex={-1} className="hero-names">
          <span className="name-line">{c.couple.first}</span>
          <span className="second-line">
            <i>&</i>
            {c.couple.second}
          </span>
        </h1>
        <p className="hero-statement">
          Один день.
          <br />
          <em>І ціле життя попереду.</em>
        </p>
        <div className="hero-meta">
          <div>
            <span className="micro">Збережіть цю дату</span>
            <p>
              {c.dateLabel}
              <br />
              <span>
                {c.ceremonyTime} · {c.city}
              </span>
            </p>
          </div>
          <a className="round-link" href="#letter" aria-label="Читати запрошення">
            <ArrowDown size={22} />
          </a>
        </div>
      </div>
      <figure className="hero-visual">
        <div className="hero-photo">
          <img
            src={c.photos.hero}
            alt={c.photos.heroAlt}
            fetchPriority="high"
            width="736"
            height="903"
          />
          <span className="image-corner micro">Разом — це головне.</span>
        </div>
        <figcaption className="image-caption">
          <span>Двоє. Одна історія.</span>
        </figcaption>
      </figure>
      <div className="hero-foot">
        <a href="#letter" className="micro">
          <ArrowDown size={12} /> Гортайте, тут про любов
        </a>
        <div className="hero-foot-actions">
          <span className="micro">
            Запрошуємо стати частиною нашого дня <ArrowUpRight size={12} />
          </span>
          {!reduced && (
            <button
              className="chrome-toggle"
              type="button"
              onClick={() => setPaused((value) => !value)}
              aria-label={paused ? 'Відновити анімацію фону' : 'Призупинити анімацію фону'}
              title={paused ? 'Відновити анімацію фону' : 'Призупинити анімацію фону'}
            >
              {paused ? (
                <Play size={14} aria-hidden="true" />
              ) : (
                <Pause size={14} aria-hidden="true" />
              )}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
export function Letter({ guest }: { guest: Guest }) {
  return (
    <section className="letter section" id="letter" aria-labelledby="letter-title">
      <SectionLabel number="01">Особисте запрошення</SectionLabel>
      <div className="letter-grid">
        <p className="letter-aside micro">
          Не просто гості.
          <br />
          Наші люди.
        </p>
        <div className="letter-copy">
          <h2 id="letter-title">{guest.greeting}</h2>
          <p className="letter-lead">{c.invitation.lead}</p>
          <p className="letter-text">{c.invitation.text}</p>
          <p className="signature">
            <span className="micro">З любов’ю,</span>
            {c.couple.together}
          </p>
        </div>
        <PearlStrand className="letter-flourish" />
      </div>
    </section>
  );
}
