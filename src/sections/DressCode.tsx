import { useState } from 'react';
import { weddingConfig as c } from '../config/weddingConfig';
import { PearlStrand, SectionLabel } from '../components/Ornament';
const fabricNotes = [
  'Матовий шовк, оксамит або костюмна тканина — стримано й виразно.',
  'Фактурні тканини та м’які складки — для глибини й красивого силуету.',
  'Делікатний блиск в аксесуарах, прикрасах або деталях вашого образу.',
];
export function DressCode() {
  const [selected, setSelected] = useState(0);
  const [lead, ...rest] = c.dressCode.title.split('. ');
  return (
    <section className="dress section" id="dress-code" aria-labelledby="dress-title">
      <SectionLabel number="04">Стиль цього вечора</SectionLabel>
      <div className="dress-top">
        <h2 id="dress-title">
          {lead}.<br />
          <em>{rest.join('. ')}</em>
        </h2>
        <div className="dress-intro">
          <p>{c.dressCode.text}</p>
        </div>
      </div>
      <div className="dress-composition">
        <figure className="dress-detail">
          <img
            src={c.photos.dress}
            alt={c.photos.dressAlt}
            loading="lazy"
            width="736"
            height="920"
          />
          <figcaption className="micro">Текстури. Лінії. Характер.</figcaption>
        </figure>
        <div className="dress-palette">
          <PearlStrand variant="garland" className="dress-garland" />
          <div className="dress-swatches" role="group" aria-label="Відтінки та фактури дрескоду">
            {c.dressCode.palette.map((tone, index) => (
              <button
                key={tone.name}
                className="swatch"
                type="button"
                aria-pressed={selected === index}
                onClick={() => setSelected(index)}
              >
                <span
                  className={`swatch-fabric fabric-${index}`}
                  style={{ backgroundColor: tone.color }}
                  aria-hidden="true"
                />
                <span className="swatch-name">{tone.name}</span>
                <span className="swatch-texture">{tone.texture}</span>
              </button>
            ))}
          </div>
          <p className="fabric-note" aria-live="polite" aria-atomic="true">
            {fabricNotes[selected]}
          </p>
          <p className="dress-note">{c.dressCode.note}</p>
        </div>
      </div>
    </section>
  );
}
