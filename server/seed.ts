import type { Festival } from '../shared/festival.js';
import { programV2 } from './program-v2.js';
import { practicalHours } from './practical-hours.js';
import { childrenInformation } from './children-information.js';
import { nearbyAccommodation } from './nearby-accommodation.js';
import { venueLocation } from './venue-location.js';

export const initialFestival: Festival = {
  name: 'Once Upon a Fest', couple: 'Florian & Charline', date: '2027-09-04',
  timezone: 'Europe/Paris', venue: 'La Source du Buron · Saint-Poncy, Cantal',
  logo: '/assets/logo-mariage.png', mapImage: '/assets/plan-mariage.png',
  program: [{ id: 'ouverture', time: '16:30', title: 'Début des festivités',
    description: 'On se retrouve à La Source du Buron pour célébrer ensemble.',
    location: 'La Source du Buron' }, ...programV2],
  places: [],
  information: [
    practicalHours,
    childrenInformation,
    venueLocation,
    { id: 'esprit', title: 'L’esprit du festival', body: 'Un mariage convivial, musical et festif. Profitez des espaces à votre rythme, pour discuter, danser et vous retrouver.' },
    { id: 'van', title: 'Venir en van', body: 'Une zone est prévue pour les invités venant en van. Les modalités pratiques seront précisées ici.' },
    nearbyAccommodation,
  ],
};
