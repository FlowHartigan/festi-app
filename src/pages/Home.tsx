import { Heart } from 'lucide-react';
import { useFestival } from '../components/Layout';

export function Home() {
  const festival = useFestival();
  const date = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: festival.timezone })
    .format(new Date(festival.date + 'T12:00:00Z'));
  const weekday = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', timeZone: festival.timezone })
    .format(new Date(festival.date + 'T12:00:00Z'));
  return <section className="home-page">
    <h1 className="home-wordmark"><span className="sr-only">{festival.name}</span><img src="/assets/identity/home-artwork.webp" width="1305" height="1205" alt="" fetchPriority="high" /></h1>
    <p className="home-couple">Charline &amp; Florian</p>
    <div className="home-divider" aria-hidden="true"><Heart size={19} fill="currentColor" strokeWidth={0} /></div>
    <time className="home-date" dateTime={festival.date}><span>{weekday}</span>{date}</time>
    <p className="home-venue">{festival.venue.split(' · ').map(part => <span key={part}>{part}</span>)}</p>
  </section>;
}
