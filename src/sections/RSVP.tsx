import { useRef, useState, type FormEvent } from 'react';
import { ArrowUpRight, Check, Pencil } from 'lucide-react';
import { weddingConfig as c } from '../config/weddingConfig';
import { PearlStrand, SectionLabel } from '../components/Ornament';
import type { Guest } from '../data/guests';
export type Reply = { version: 1; name: string; attendance: 'yes' | 'no'; message: string };
function readReply(key: string): Reply | null {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(key) || 'null');
    if (!data || typeof data !== 'object') return null;
    const reply = data as Partial<Reply>;
    return reply.version === 1 &&
      typeof reply.name === 'string' &&
      reply.name.trim().length > 1 &&
      reply.name.length <= 100 &&
      (reply.attendance === 'yes' || reply.attendance === 'no') &&
      typeof reply.message === 'string' &&
      reply.message.length <= 1000
      ? (reply as Reply)
      : null;
  } catch {
    return null;
  }
}
export function RSVP({ guest }: { guest: Guest }) {
  const key = `${c.rsvp.storageKey}:${guest.id}`;
  const [saved, setSaved] = useState(() => readReply(key));
  const [name, setName] = useState(saved?.name || guest.name);
  const [attendance, setAttendance] = useState<'yes' | 'no' | ''>(saved?.attendance || '');
  const [message, setMessage] = useState(saved?.message || '');
  const [editing, setEditing] = useState(!saved);
  const [error, setError] = useState('');
  const nameInput = useRef<HTMLInputElement>(null);
  const attendanceInput = useRef<HTMLInputElement>(null);
  const confirmation = useRef<HTMLHeadingElement>(null);
  function save(event: FormEvent) {
    event.preventDefault();
    if (name.trim().length < 2) {
      setError('Будь ласка, вкажіть ім’я — щонайменше 2 символи.');
      nameInput.current?.focus();
      return;
    }
    if (!attendance) {
      setError('Оберіть, чи будете ви з нами.');
      attendanceInput.current?.focus();
      return;
    }
    const reply: Reply = { version: 1, name: name.trim(), attendance, message: message.trim() };
    try {
      localStorage.setItem(key, JSON.stringify(reply));
    } catch {
      setError(
        'Браузер не дозволив зберегти відповідь. Дозвольте локальне сховище й спробуйте ще раз.',
      );
      return;
    }
    setSaved(reply);
    setError('');
    setEditing(false);
    requestAnimationFrame(() => confirmation.current?.focus());
  }
  function edit() {
    setEditing(true);
    requestAnimationFrame(() => nameInput.current?.focus());
  }
  return (
    <section className="rsvp section" id="rsvp" aria-labelledby="rsvp-title">
      <PearlStrand variant="garland" className="rsvp-garland" />
      <SectionLabel number="06">Дайте нам знати</SectionLabel>
      <div className="rsvp-grid">
        <div className="rsvp-intro">
          <span className="micro">Ваша відповідь — частина нашої історії</span>
          <div className="rsvp-title-art">
            <h2 id="rsvp-title">
              Ви з<br />
              <em>нами?</em>
            </h2>
          </div>
          <p>
            Дуже хочемо розділити цей день із вами. Залиште відповідь до <span>{c.deadline}.</span>
          </p>
          <span className="rsvp-monogram" aria-hidden="true">
            {c.couple.initials}
          </span>
        </div>
        <div className="rsvp-panel">
          {editing ? (
            <form onSubmit={save} noValidate>
              <fieldset>
                <legend>Чи будете ви з нами?</legend>
                <div className="attendance-options">
                  <label className={attendance === 'yes' ? 'selected' : ''}>
                    <input
                      ref={attendanceInput}
                      type="radio"
                      name="attendance"
                      value="yes"
                      checked={attendance === 'yes'}
                      onChange={() => {
                        setAttendance('yes');
                        setError('');
                      }}
                    />
                    <span>Так, із радістю</span>
                    <ArrowUpRight size={17} />
                  </label>
                  <label className={attendance === 'no' ? 'selected' : ''}>
                    <input
                      type="radio"
                      name="attendance"
                      value="no"
                      checked={attendance === 'no'}
                      onChange={() => {
                        setAttendance('no');
                        setError('');
                      }}
                    />
                    <span>На жаль, не зможу</span>
                  </label>
                </div>
              </fieldset>
              <div className="form-field">
                <label htmlFor="guest-name">
                  Ваше ім’я та прізвище <span>Обов’язково</span>
                </label>
                <input
                  id="guest-name"
                  ref={nameInput}
                  name="name"
                  autoComplete="name"
                  maxLength={100}
                  value={name}
                  required
                  minLength={2}
                  aria-invalid={!!error && name.trim().length < 2}
                  aria-describedby={error ? 'rsvp-error' : undefined}
                  placeholder="Як до вас звертатися?"
                  onChange={(e) => {
                    setName(e.target.value);
                    setError('');
                  }}
                />
              </div>
              <div className="form-field">
                <label htmlFor="guest-message">
                  Кілька слів для нас <span>За бажанням</span>
                </label>
                <textarea
                  id="guest-message"
                  name="message"
                  maxLength={1000}
                  rows={3}
                  value={message}
                  placeholder="Побажання, алергії або пісня, під яку ви точно танцюватимете…"
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              {error && (
                <p className="form-error" id="rsvp-error" role="alert">
                  {error}
                </p>
              )}
              <button className="button rsvp-save" type="submit">
                Зберегти відповідь <ArrowUpRight size={18} />
              </button>
              <p className="rsvp-disclaimer">{c.rsvp.note}</p>
            </form>
          ) : (
            <div className="rsvp-confirmation">
              <span className="confirmation-icon">
                <Check size={25} />
              </span>
              <span className="micro">Відповідь збережено в браузері</span>
              <h3 ref={confirmation} tabIndex={-1}>
                {saved?.attendance === 'yes' ? 'До зустрічі!' : 'Дякуємо, що дали знати.'}
              </h3>
              <p>
                {saved?.name},{' '}
                {saved?.attendance === 'yes'
                  ? 'ваше «так» робить цей день ще теплішим.'
                  : 'подумки ви будете поруч. Обіймаємо.'}
              </p>
              {saved?.message && <blockquote>{saved.message}</blockquote>}
              <button className="text-link" onClick={edit}>
                Редагувати відповідь <Pencil size={16} />
              </button>
              <p className="rsvp-disclaimer">{c.rsvp.note}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
