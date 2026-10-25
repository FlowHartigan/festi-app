import type { Festival } from '../shared/festival.js';

// Names, towns and links checked on 2026-10-17; sources: docs/HEBERGEMENTS.md.
export const nearbyAccommodation: Festival['information'][number] = {
  id: 'hebergements-proximite',
  title: 'Dormir à proximité',
  body: '10 adresses autour de Saint-Poncy pour prolonger la nuit au calme. Tarifs et disponibilités à vérifier auprès de chaque hébergement.',
  lodgings: [
    { name: 'Auberge de l’Allagnonette', kind: 'Hôtel', town: 'Saint-Poncy', url: 'https://auberge-allagnonette.com/' },
    { name: 'Gîte de Saint-Poncy · n°644', kind: 'Gîte', town: 'Saint-Poncy', url: 'https://www.gites-de-france-cantal.fr/location-Gite-Saint-poncy-Cantal-15G644.html' },
    { name: 'La Maison des Chats', kind: 'Chambres d’hôtes', town: 'Saint-Mary-le-Plain', url: 'https://www.booking.com/hotel/fr/la-maison-des-chats-saint-mary-le-plain.fr.html' },
    { name: 'Auberge de l’Arcueil', kind: 'Chambres d’hôtes', town: 'Vieillespesse', url: 'https://www.booking.com/hotel/fr/auberge-de-l-arcueil.fr.html' },
    { name: 'Gîte du Four d’Antan', kind: 'Gîte', town: 'Vieillespesse', url: 'https://www.booking.com/hotel/fr/gite-du-four-d-antan.fr.html' },
    { name: 'Le Clos de la Ronzière', kind: 'Chambres d’hôtes et gîte', town: 'Soulages', url: 'https://leclosdelaronziere.fr/' },
    { name: 'Hôtel des Voyageurs', kind: 'Hôtel', town: 'Ferrières-Saint-Mary', url: 'https://www.hoteldesvoyageurs15.fr/fr' },
    { name: 'Les Portes du Cantal', kind: 'Hôtel', town: 'Massiac', url: 'https://www.fanihotels.com/les-portes-du-cantal-a-massiac/' },
    { name: 'Hôtel La Colombière', kind: 'Hôtel', town: 'Massiac', url: 'https://www.hotel-lacolombiere.com/' },
    { name: 'La Ferme de Vazerat', kind: 'Chambres d’hôtes et gîtes', town: 'Massiac', url: 'https://www.lafermedevazerat.com/' },
  ],
};
