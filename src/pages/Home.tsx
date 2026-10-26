import { Heart } from 'lucide-react';
import { FestivalFlower } from '../components/FestivalFlower';
import { useFestival } from '../components/Layout';

export function Home() {
  const festival = useFestival();
  const date = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: festival.timezone })
    .format(new Date(festival.date + 'T12:00:00Z'));
  const weekday = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', timeZone: festival.timezone })
    .format(new Date(festival.date + 'T12:00:00Z'));
  return <section className="home-page">
    <div className="home-art" aria-hidden="true">
      <svg className="home-ribbons" viewBox="0 0 260 160" focusable="false">
        <path d="M-40 160C35 160 15 55 100 60S175 0 265-25" fill="none" stroke="var(--gold)" strokeWidth="27" />
        <path d="M-40 126C30 126 18 26 104 31S177-25 260-50" fill="none" stroke="var(--coral)" strokeWidth="18" />
      </svg>
      <div className="home-bouquet">
        <svg className="home-leaves" viewBox="0 0 160 150" focusable="false">
          <path d="M85 145Q70 90 95 20M85 140Q120 115 130 70" fill="none" stroke="var(--olive)" strokeWidth="3" />
          <path d="M83 115Q25 115 41 86Q65 80 83 115M85 94Q133 75 122 51Q96 52 85 94M92 59Q65 22 88 9Q107 21 92 59M91 136Q127 141 141 119Q114 108 91 136" fill="var(--leaf)" />
        </svg>
        <span className="home-flower-gold"><FestivalFlower /></span>
        <span className="home-flower-coral"><FestivalFlower /></span>
      </div>
    </div>
    <h1 className="home-wordmark" aria-label={festival.name}><span>Once Upon</span><span>a Fest</span></h1>
    <p className="home-couple">Charline &amp; Florian</p>
    <div className="home-divider" aria-hidden="true"><Heart size={19} fill="currentColor" strokeWidth={0} /></div>
    <time className="home-date" dateTime={festival.date}><span>{weekday}</span>{date}</time>
    <p className="home-venue">{festival.venue}</p>
  </section>;
}
