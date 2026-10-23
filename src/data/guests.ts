import { weddingConfig } from '../config/weddingConfig';
export type Guest = { id: string; greeting: string; cover: string; name: string; limit: number };
// Нейтральні приклади персоналізації без персональних даних.
const guests: Record<string, Guest> = {
  'guest-example': {
    id: 'guest-example',
    greeting: 'Дорогий гостю!',
    cover: 'Для дорогого гостя',
    name: 'Гість',
    limit: 1,
  },
  'couple-example': {
    id: 'couple-example',
    greeting: 'Дорогі гості!',
    cover: 'Для дорогих гостей',
    name: 'Гості',
    limit: 2,
  },
  'family-example': {
    id: 'family-example',
    greeting: 'Дорога родино!',
    cover: 'Для дорогої родини',
    name: 'Родина',
    limit: 4,
  },
};
export function getGuest(): Guest {
  const key = new URLSearchParams(window.location.search).get('guest') || '';
  return Object.hasOwn(guests, key)
    ? guests[key]
    : {
        id: 'default',
        greeting: 'Дорогі наші!',
        cover: 'Для тих, хто нам дорогий',
        name: '',
        limit: weddingConfig.defaultLimit,
      };
}
