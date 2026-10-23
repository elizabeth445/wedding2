import { useRef, useState } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { weddingConfig as c } from '../config/weddingConfig';
const links = [
  ['#story', 'Наша історія'],
  ['#day', 'День весілля'],
  ['#dress-code', 'Дрескод'],
] as const;
export function Header({ onReplay }: { onReplay: () => void }) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  function close() {
    setOpen(false);
    toggle.current?.focus();
  }
  return (
    <header className="site-header">
      <a className="monogram" href="#home" aria-label={`${c.couple.together} — на початок`}>
        {c.couple.initials}
        <span>{c.shortDate}</span>
      </a>
      <button
        className="menu-toggle"
        ref={toggle}
        aria-expanded={open}
        aria-controls="main-nav"
        aria-label={open ? 'Закрити меню' : 'Відкрити меню'}
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={21} /> : <Menu size={21} />}
      </button>
      <nav
        id="main-nav"
        className={open ? 'main-nav is-open' : 'main-nav'}
        aria-label="Головна навігація"
        onKeyDown={(e) => {
          if (e.key === 'Escape') close();
        }}
      >
        {links.map(([href, text]) => (
          <a key={href} href={href} onClick={() => setOpen(false)}>
            {text}
          </a>
        ))}
        <button
          className="replay-link"
          onClick={() => {
            setOpen(false);
            onReplay();
          }}
        >
          Обкладинка
        </button>
        <a className="nav-rsvp" href="#rsvp" onClick={() => setOpen(false)}>
          Буду з вами <ArrowUpRight size={15} />
        </a>
      </nav>
    </header>
  );
}
