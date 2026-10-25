import type { Festival } from '../shared/festival.js';

// Adresse publiée par le lieu : https://www.lasourceduburon.fr/contact-plan-dacces/
export const venueLocation: Festival['information'][number] = {
  id: 'lieu', title: 'La Source du Buron', body: '',
  location: {
    name: 'La Source du Buron', address: 'Domaine de Luc', town: '15500 Saint-Poncy, France',
  },
};
