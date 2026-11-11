import type { Festival } from '../shared/festival.js';

// Ordre du festival, du samedi après-midi au dimanche matin.
export const programV11: Festival['program'] = [
  { id: 'ouverture', time: '16:30', title: 'Ouverture', description: '', location: 'La Source du Buron' },
  { id: 'ceremonie', time: '17:30', title: 'Cérémonie', description: '', location: '' },
  { id: 'activites', time: '18:00', title: 'Ouverture des activités',
    description: 'Plein de jeux en bois vous attendent sur l’espace activités.', location: 'Espace activités' },
  { id: 'grand-jeu', time: '18:30', title: 'Grand jeu des mariés — Hosted by Lip-sync challenge', description: '', location: '' },
  { id: 'restauration', time: '19:30', title: 'Restauration',
    description: 'Ouverture des stands de nourriture.', location: '' },
  { id: 'bal', time: '21:30', title: 'Ouverture du bal — Hosted by Lip-sync challenge', description: '', location: '' },
  { id: 'annees-80-90-2000', time: '22:00', title: 'Années 80, 90 et 2000',
    description: 'Le nom du DJ sera annoncé.', location: '' },
  { id: 'surprise-dj-set', time: '22:30', title: 'Surprise DJ set des mariés',
    description: 'Les mariés vous préparent un DJ set avec vos musiques préférées.', location: '' },
  { id: 'reprise-annees-80-90-2000', time: '23:00', title: 'Années 80, 90 et 2000', description: '', location: '' },
  { id: 'free-playlist', time: '00:30', title: 'Free playlist',
    description: 'Le nom du DJ sera annoncé.', location: '' },
  { id: 'rock', time: '01:30', title: 'Rock’n’Roll',
    description: 'Le nom du DJ sera annoncé.', location: '' },
  { id: 'techno-dj-set', time: '02:30', title: 'Techno DJ set des mariés',
    description: 'Restez éveillés jusque-là, ça vaudra le coup !', location: '' },
  { id: 'rave', time: '02:45', title: 'Rave (techno to hard)',
    description: 'De la techno pour tous.', location: '' },
  { id: 'coupure-du-son', time: '04:00', title: 'Coupure du son', description: '', location: '' },
  { id: 'fermeture', time: '05:00', title: 'Fermeture du site', description: '', location: '' },
];
