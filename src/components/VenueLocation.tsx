import { ExternalLink } from 'lucide-react';
import type { Festival } from '../../shared/festival';

type Location = NonNullable<Festival['information'][number]['location']>;

export function VenueLocation({ location }: { location: Location }) {
  const destination = encodeURIComponent(`${location.name}, ${location.address}, ${location.town}`);
  const links = [
    { label: 'Google Maps', url: `https://www.google.com/maps/search/?api=1&query=${destination}` },
    { label: 'Plans', url: `https://maps.apple.com/?q=${destination}` },
    { label: 'Waze', url: `https://www.waze.com/ul?q=${destination}&navigate=yes` },
  ];

  return <div className="venue-location">
    <h3>{location.name}</h3>
    <address>{location.address}<br />{location.town}</address>
    <div className="venue-map-links" aria-label="Ouvrir l’adresse dans une application">
      {links.map(link => <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer">
        {link.label}<ExternalLink size={15} aria-hidden="true" /><span className="sr-only"> (nouvel onglet)</span>
      </a>)}
    </div>
    <iframe className="venue-map" title={`Carte Google Maps : ${location.name}`}
      src={`https://maps.google.com/maps?q=${destination}&z=15&output=embed&hl=fr`}
      loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
  </div>;
}
