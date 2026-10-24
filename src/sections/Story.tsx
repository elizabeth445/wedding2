import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Maximize2, X } from 'lucide-react';
import { weddingConfig as c } from '../config/weddingConfig';
import { PearlStrand, SectionLabel } from '../components/Ornament';
function PhotoViewer({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      element?.close();
      document.body.style.overflow = overflow;
    };
  }, []);
  return (
    <dialog
      className="photo-viewer"
      ref={dialog}
      aria-label="Фотографія нашої історії"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button className="viewer-close" onClick={onClose} aria-label="Закрити фотографію">
        <X />
      </button>
      <img src={c.photos.story} alt={c.photos.storyAlt} width="1200" height="1469" />
      <p className="micro">Наступний розділ — разом із вами.</p>
    </dialog>
  );
}
export function Story() {
  const [selected, setSelected] = useState(0);
  const [viewer, setViewer] = useState(false);
  const photoButton = useRef<HTMLButtonElement>(null);
  function closeViewer() {
    setViewer(false);
    requestAnimationFrame(() => photoButton.current?.focus({ preventScroll: true }));
  }
  const chapter = c.story[selected];
  return (
    <section className="story section" id="story" aria-labelledby="story-title">
      <div className="pearl-layer" aria-hidden="true">
        <PearlStrand className="story-pearl pearl-drift" />
      </div>
      <SectionLabel number="02">Історія без сценарію</SectionLabel>
      <div className="story-heading">
        <h2 id="story-title">
          У кожному
          <br />
          кадрі — <em>ми.</em>
        </h2>
        <p>
          <span>Не ідеальні.</span>
          <span>Справжні.</span>
          <span>І завжди — разом.</span>
        </p>
      </div>
      <div className="story-spread">
        <figure className="story-figure">
          <button
            ref={photoButton}
            className="story-photo"
            onClick={() => setViewer(true)}
            aria-label="Збільшити фотографію нашої історії"
          >
            <img
              src={c.photos.story}
              alt={c.photos.storyAlt}
              loading="lazy"
              width="1200"
              height="1469"
            />
            <span className="photo-expand">
              <Maximize2 size={16} />
              <span>Збільшити кадр</span>
            </span>
          </button>
          <figcaption className="image-caption">
            <span>Наш улюблений напрямок — разом</span>
          </figcaption>
        </figure>
        <div className="story-note">
          <span className="story-year" aria-hidden="true">
            {chapter.year}
          </span>
          <div className="story-tabs" role="group" aria-label="Розділи нашої історії">
            {c.story.map((item, index) => (
              <button
                key={item.year}
                aria-pressed={selected === index}
                onClick={() => setSelected(index)}
              >
                {item.year}
                <ArrowUpRight size={12} />
              </button>
            ))}
          </div>
          <div className="chapter" aria-live="polite" aria-atomic="true">
            <h3>{chapter.title}</h3>
            <p>{chapter.text}</p>
          </div>
          <span className="micro story-note-bottom">А найкраще — ще попереду.</span>
        </div>
      </div>
      {viewer && <PhotoViewer onClose={closeViewer} />}
    </section>
  );
}
