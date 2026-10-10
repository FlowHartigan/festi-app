import { useFestival } from '../components/Layout';

export function Home() {
  const festival = useFestival();
  const date = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full', timeZone: festival.timezone })
    .format(new Date(`${festival.date}T12:00:00Z`));
  return <section className="home-page">
    <h1 className="sr-only">{festival.name}</h1>
    <img className="festival-logo" src={festival.logo} alt="Once Upon a Fest — Florian et Charline" width={1055} height={1200} fetchPriority="high" />
    <div className="date-ticket"><p>On se retrouve le</p><time dateTime={festival.date}>{date}</time></div>
    <p className="home-venue">{festival.venue}</p>
  </section>;
}
