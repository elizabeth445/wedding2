import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  CalendarPlus,
  MapPin,
  HandHeart,
  Heart,
  Utensils,
  Music2,
  CakeSlice,
  Hand,
} from 'lucide-react';
import { weddingConfig as c } from '../config/weddingConfig';
import { SectionLabel } from '../components/Ornament';
import { downloadCalendar, validExternalURL } from '../lib/calendar';
const target = new Date(c.date).getTime();
const scheduleIcons = [HandHeart, Heart, Utensils, Music2, CakeSlice, Hand];
const plurals = new Intl.PluralRules('uk-UA');
function unit(value: number, forms: [string, string, string]) {
  const rule = plurals.select(value);
  return forms[rule === 'one' ? 0 : rule === 'few' ? 1 : 2];
}
function remaining() {
  let seconds = Math.max(0, Math.floor((target - Date.now()) / 1000));
  const days = Math.floor(seconds / 86400);
  seconds %= 86400;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  return [days, hours, Math.floor(seconds / 60), seconds % 60];
}
export function Countdown() {
  const [time, setTime] = useState(remaining);
  useEffect(() => {
    const interval = window.setInterval(() => setTime(remaining()), 1000);
    return () => clearInterval(interval);
  }, []);
  const started = time.every((value) => value === 0);
  return (
    <section className="countdown section" aria-labelledby="countdown-title">
      <div className="countdown-heading">
        <span className="micro">Очікування теж частина історії</span>
        <h2 id="countdown-title">{started ? 'Наш день настав.' : 'До нашого «так»'}</h2>
      </div>
      <div
        className="countdown-digits"
        role="timer"
        aria-label={
          started
            ? 'День весілля настав'
            : `До весілля: ${time[0]} ${unit(time[0], ['день', 'дні', 'днів'])}, ${time[1]} ${unit(time[1], ['година', 'години', 'годин'])}, ${time[2]} ${unit(time[2], ['хвилина', 'хвилини', 'хвилин'])}`
        }
        aria-live="off"
      >
        {time.map((value, index) => (
          <div key={index}>
            <span>{String(value).padStart(2, '0')}</span>
            <span className="micro">{['Днів', 'Годин', 'Хвилин', 'Секунд'][index]}</span>
          </div>
        ))}
      </div>
      <p className="countdown-caption">Один день у календарі. Безліч спогадів на все життя.</p>
    </section>
  );
}
export function Day() {
  const date = new Date(c.date);
  const dateParts = new Intl.DateTimeFormat('uk-UA', {
    timeZone: c.timezone,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    dateParts.find((p) => p.type === type)?.value;
  return (
    <section className="day section" id="day" aria-labelledby="day-title">
      <SectionLabel number="03">Цей день — наш</SectionLabel>
      <div className="day-grid">
        <div className="date-column">
          <h2 id="day-title">
            Місце.
            <br />
            Час.
            <br />
            <em>Ми.</em>
          </h2>
          <div className="date-poster">
            <span className="micro">{part('weekday')}</span>
            <span className="poster-number">{part('day')}</span>
            <p>
              {part('month')}
              <span>{part('year')}</span>
            </p>
          </div>
          <button className="text-link calendar-link" onClick={downloadCalendar}>
            Додати в календар <CalendarPlus size={18} />
          </button>
        </div>
        <div className="day-details">
          <div className="event-summary">
            <div>
              <span className="micro">Де</span>
              <p>
                {c.venue.name}
                <span>{c.venue.address}</span>
              </p>
            </div>
            <div>
              <span className="micro">Початок церемонії</span>
              <p>
                {c.ceremonyTime}
                <span>За київським часом</span>
              </p>
            </div>
            <a className="event-venue-preview" href="#venue">
              <img src={c.photos.venue} alt="" width="1440" height="852" loading="lazy" />
              <span>
                Локація та маршрут <ArrowUpRight size={18} />
              </span>
            </a>
          </div>
          <div className="schedule-heading">
            <h3>Ритм нашого дня</h3>
            <span className="micro">Від обіймів до останнього танцю</span>
          </div>
          <ol className="schedule">
            {c.schedule.map((item, index) => {
              const Icon = scheduleIcons[index] ?? Heart;
              return (
                <li key={item.time}>
                  <span className="schedule-time">{item.time}</span>
                  <span className="schedule-icon" aria-hidden="true">
                    <Icon size={23} strokeWidth={1.35} />
                  </span>
                  <div className="schedule-copy">
                    <h4>{item.title}</h4>
                    <p>{item.text}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
export function Venue() {
  const directions = validExternalURL(c.venue.directions);
  const website = validExternalURL(c.venue.website);
  return (
    <section className="venue section" id="venue" aria-labelledby="venue-title">
      <SectionLabel number="05">Місце зустрічі</SectionLabel>
      <div className="venue-grid">
        <div className="venue-image">
          <img
            src={c.photos.venue}
            alt={c.photos.venueAlt}
            loading="lazy"
            width="1440"
            height="852"
          />
          <span className="micro">Найкраще місце — поруч із вами.</span>
        </div>
        <div className="venue-copy">
          <span className="micro">Заміський комплекс · {c.venue.region}</span>
          <h2 id="venue-title">{c.venue.name}</h2>
          <p className="venue-address">
            <MapPin size={18} aria-hidden="true" />
            <span>{c.venue.address}</span>
          </p>
          <p className="venue-note">{c.venue.note}</p>
          {directions && (
            <a className="text-link" href={directions} target="_blank" rel="noopener noreferrer">
              Прокласти маршрут <ArrowUpRight size={18} />
            </a>
          )}
          {website && (
            <a className="text-link" href={website} target="_blank" rel="noopener noreferrer">
              Сайт локації <ArrowUpRight size={18} />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
