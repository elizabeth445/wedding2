import { weddingConfig as c } from '../config/weddingConfig';
import { SectionLabel } from '../components/Ornament';
export function DressCode() {
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
          <span className="micro">Форма — вільна. Настрій — святковий.</span>
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
        <div className="dress-swatches">
          {c.dressCode.palette.map((tone, index) => (
            <div
              key={tone.name}
              className="swatch"
              style={{ backgroundColor: tone.color, color: index === 2 ? '#181818' : '#fafaf8' }}
            >
              <span className="micro">0{index + 1}</span>
              <p>{tone.name}</p>
              <span className="micro">{tone.texture}</span>
            </div>
          ))}
        </div>
        <p className="dress-note">{c.dressCode.note}</p>
      </div>
    </section>
  );
}
