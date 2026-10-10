import type { Festival } from '../shared/festival.js';

// Contenu confirmé par les mariés, utilisé par la migration 2 et les nouvelles bases.
export const programV2: Festival['program'] = [
  { id: 'activites', time: '17:00', endTime: '19:00', title: 'Activités',
    description: 'Plein de jeux en bois vous attendent sur l’espace activités.', location: 'Espace activités' },
  { id: 'dj-set', time: '19:00', endTime: '20:00', title: 'DJ set',
    description: 'Un DJ set années 2000 sur la scène.', location: 'La scène' },
];
