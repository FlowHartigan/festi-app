import type { Festival } from '../shared/festival.js';

export const practicalHours: Festival['information'][number] = {
  id: 'horaires',
  title: 'Le tempo du festival',
  body: 'Samedi, jusqu’au petit matin. Aucun programme le dimanche.',
  schedule: [
    { time: '16:30', title: 'Ouverture du festival' },
    { time: '04:00', title: 'Fin de la musique', nextDay: true },
    { time: '05:00', title: 'Départ du site', nextDay: true },
  ],
};
