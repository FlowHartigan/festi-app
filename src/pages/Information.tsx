import { HeadingArtwork } from '../components/HeadingArtwork';
import { FestivalFlower } from '../components/FestivalFlower';
import { useFestival } from '../components/Layout';
import { VenueLocation } from '../components/VenueLocation';
import { UsersRound, BedDouble, ChevronDown, Clock, ExternalLink, Info, MapPin, Tent, Utensils } from 'lucide-react';

const categories = [
  { id: 'horaires', title: 'Horaires', icon: Clock, itemIds: ['horaires'] },
  { id: 'petits-bouts', title: 'Petits bouts', icon: UsersRound, itemIds: ['petits-bouts', 'enfants'] },
  { id: 'restauration', title: 'Restauration', icon: Utensils, itemIds: ['restauration'] },
  { id: 'hebergement', title: 'Hébergement', icon: BedDouble, itemIds: ['hebergement', 'van', 'hebergements-proximite'] },
  { id: 'localisation', title: 'Localisation', icon: MapPin, itemIds: ['localisation', 'lieu'] },
  { id: 'divers', title: 'Infos divers', icon: Info, itemIds: ['divers', 'esprit'] },
];

const formatTime = (time: string) => time.replace(/^0/, '').replace(':00', ' h').replace(':', ' h ');

export function Information() {
  const { information, program } = useFestival();
  return <section className="page information-page"><div className="page-heading"><h1><HeadingArtwork kind="information" label="Informations" /></h1><FestivalFlower /></div><p className="intro">Les petits détails pour profiter de la fête.</p>
    <div className="information-list">{categories.map(category => {
      const Icon = category.icon;
      const items = information.filter(item => (categories.find(entry => entry.itemIds.includes(item.id))?.id ?? 'divers') === category.id);
      const showProgram = category.id === 'horaires' && items.length === 0 && program.length > 0;
      return <details key={category.id} className="information-category">
        <summary className="information-summary"><h2><span className="information-category-label"><Icon className="information-category-icon" size={23} strokeWidth={1.7} aria-hidden="true" />{category.title}</span><ChevronDown className="information-chevron" size={20} aria-hidden="true" /></h2></summary>
        <div className="information-content">
          {showProgram && <ol className="information-hours">{[...program].sort((a, b) => a.time.localeCompare(b.time)).map(moment =>
            <li key={moment.id}><span><time dateTime={moment.time}>{formatTime(moment.time)}</time>{moment.endTime && <> – <time dateTime={moment.endTime}>{formatTime(moment.endTime)}</time></>}</span><span>{moment.title}</span></li>)}</ol>}
          {items.map(item => category.id === 'hebergement' ? <details key={item.id} className="accommodation-section">
            <summary className="accommodation-summary"><h3>{item.id === 'van' ? <Tent size={20} aria-hidden="true" /> : <BedDouble size={20} aria-hidden="true" />}<span>{item.title}</span><ChevronDown className="accommodation-chevron" size={18} aria-hidden="true" /></h3></summary>
            <div className="accommodation-content">
              <p>{item.body}</p>
              {item.lodgings?.length ? <ul className="lodging-list">{item.lodgings.map(lodging => <li key={lodging.url}>
                <a href={lodging.url} target="_blank" rel="noopener noreferrer"><span><strong>{lodging.name}</strong><span>{lodging.kind} · {lodging.town}</span></span><ExternalLink size={18} aria-hidden="true" /><span className="sr-only"> (nouvel onglet)</span></a>
              </li>)}</ul> : null}
            </div>
          </details> : <div key={item.id} className="information-item">
            {item.location ? <VenueLocation location={item.location} /> : item.schedule?.length ? <>
              <dl className="practical-hours" aria-label={item.title}>{item.schedule.map(moment =>
                <div key={moment.time}><dt><time dateTime={moment.time} aria-label={moment.nextDay ? `${formatTime(moment.time)}, dans la nuit du samedi au dimanche` : undefined}>{formatTime(moment.time)}</time></dt><dd>{moment.title}</dd></div>)}</dl>
              <p className="practical-hours-note">{item.body}</p>
            </> : <><h3>{item.title}</h3><p>{item.body}</p></>}
          </div>)}
          {!showProgram && items.length === 0 && <p>Les informations de cette rubrique seront précisées prochainement.</p>}
        </div>
      </details>;
    })}</div>
  </section>;
}
