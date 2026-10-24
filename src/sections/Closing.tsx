import { ArrowUpRight, ArrowUp } from 'lucide-react';
import { weddingConfig as c } from '../config/weddingConfig';
import { PearlStrand } from '../components/Ornament';
export function Closing({ onReplay }: { onReplay: () => void }) {
  return (
    <footer className="closing" aria-labelledby="closing-title">
      <div className="pearl-layer" aria-hidden="true">
        <PearlStrand className="closing-pearl pearl-drift" />
      </div>
      <div className="closing-top">
        <span className="micro">Не фінал. Тільки початок.</span>
        <span className="micro">{c.shortDate}</span>
      </div>
      <div className="closing-spread">
        <div className="closing-image">
          <img
            src={c.photos.closing}
            alt={c.photos.closingAlt}
            loading="lazy"
            width="736"
            height="901"
          />
        </div>
        <div className="closing-copy">
          <h2 id="closing-title">
            Усе тільки
            <br />
            <em>починається.</em>
          </h2>
          <p>
            І як же добре,
            <br />
            що ви будете поруч.
          </p>
          <a href="#rsvp" className="text-link">
            До зустрічі на нашому святі <ArrowUpRight size={18} />
          </a>
        </div>
      </div>
      <div className="closing-bottom">
        <p>{c.couple.together}</p>
        <button className="replay-link" onClick={onReplay}>
          Переглянути обкладинку
        </button>
        <a href="#home" aria-label="На початок сторінки">
          <ArrowUp size={17} />
        </a>
      </div>
    </footer>
  );
}
