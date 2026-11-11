import { HeadingArtwork } from '../components/HeadingArtwork';
import { FestivalFlower } from '../components/FestivalFlower';
import { useFestival } from '../components/Layout';
import { VenueLocation } from '../components/VenueLocation';
import { Link } from 'react-router-dom';
import { CateringInstagramLink, isDanceTime, ProgramMomentDetails, ProgramMomentTitle } from '../components/ProgramMoment';
import { UsersRound, BedDouble, CalendarCheck, ChevronDown, Clock, ExternalLink, Info, MapPin, Shirt, Tent, Utensils } from 'lucide-react';

const categories = [
  { id: 'horaires', title: 'Horaires', icon: Clock, itemIds: ['horaires'] },
  { id: 'confirmation', title: 'Comment confirmer ma venue ?', icon: CalendarCheck, itemIds: [] },
  { id: 'dress-code', title: 'Comment on s’habille ?', icon: Shirt, itemIds: ['dress-code', 'moodboard'] },
  { id: 'petits-bouts', title: 'Petits bouts et accompagnants', icon: UsersRound, itemIds: ['petits-bouts', 'enfants'] },
  { id: 'restauration', title: 'Restauration', icon: Utensils, itemIds: ['restauration'] },
  { id: 'hebergement', title: 'Hébergement', icon: BedDouble, itemIds: ['hebergement', 'van', 'hebergements-proximite'] },
  { id: 'localisation', title: 'Localisation', icon: MapPin, itemIds: ['localisation', 'lieu'] },
  { id: 'divers', title: 'Infos divers', icon: Info, itemIds: ['divers', 'esprit'] },
];

const formatTime = (time: string) => time.replace(/^0/, '').replace(':00', ' h').replace(':', ' h ');

function childrenNotice(body: string) {
  const sentence = 'nous ne pourrons pas accueillir vos petits bouts.';
  const position = body.indexOf(sentence);
  if (position === -1) return body;
  return <>{body.slice(0, position)}<strong>{sentence}</strong>{body.slice(position + sentence.length)}</>;
}

export function Information() {
  const { information, program } = useFestival();
  const firstDance = program.findIndex(moment => isDanceTime(moment.time));
  return <section className="page information-page"><div className="page-heading"><h1><HeadingArtwork kind="information" label="Informations" /></h1><FestivalFlower /></div><p className="intro">Les petits détails pour profiter de la fête.</p>
    <div className="information-list">{categories.map(category => {
      const Icon = category.icon;
      const items = information.filter(item => (categories.find(entry => entry.itemIds.includes(item.id))?.id ?? 'divers') === category.id);
      const showProgram = category.id === 'horaires' && program.length > 0;
      return <details key={category.id} className="information-category">
        <summary className="information-summary"><h2><span className="information-category-label"><Icon className="information-category-icon" size={23} strokeWidth={1.7} aria-hidden="true" />{category.title}</span><ChevronDown className="information-chevron" size={20} aria-hidden="true" /></h2></summary>
        <div className="information-content">
          {category.id === 'confirmation' && <div className="information-item">
            <p>Retrouve ton code personnel à 4 chiffres sur la <strong>face B du vinyle</strong> de ton invitation. S’il y a plusieurs codes sur la même invitation, chacun répond avec le sien.</p>
            <p>Entre ton code dans <Link to="/compte">ton espace Compte</Link>, puis ouvre « Ma présence ». Indique si tu viens et enregistre ta réponse.</p>
          </div>}
          {category.id === 'restauration' && <div className="information-item">
            <p>La Boîte à Rêve s’occupe de la restauration et vous proposera plusieurs petits stands pour manger au gré de vos envies.</p>
            <p><CateringInstagramLink /></p>
            <p>Si vous avez une allergie alimentaire, contactez-nous avant le mariage.</p>
          </div>}
          {showProgram && <ol className="information-hours">{program.map((moment, index) => {
            if (index === firstDance) return <li key="dance"><span><time dateTime="22:00">22 h</time> – <time dateTime="04:00" aria-label="4 h le lendemain">4 h</time></span><strong>Dance</strong></li>;
            if (isDanceTime(moment.time)) return null;
            return <li key={moment.id}>
              <span><time dateTime={moment.time}>{formatTime(moment.time)}</time>{moment.endTime && <> – <time dateTime={moment.endTime}>{formatTime(moment.endTime)}</time></>}</span>
              <div className="information-hours-moment"><strong><ProgramMomentTitle moment={moment} /></strong><ProgramMomentDetails moment={moment} /></div>
            </li>;
          })}</ol>}
          {!showProgram && items.map(item => category.id === 'hebergement' ? <details key={item.id} className="accommodation-section">
            <summary className="accommodation-summary"><h3>{item.id === 'van' ? <Tent size={20} aria-hidden="true" /> : <BedDouble size={20} aria-hidden="true" />}<span>{item.title}</span><ChevronDown className="accommodation-chevron" size={18} aria-hidden="true" /></h3></summary>
            <div className="accommodation-content">
              {item.id === 'van' ? <p>Une zone est prévue pour dormir en van ou en voiture aménagée. Indiquez-nous votre venue dans la rubrique « Ma nuit en van » de votre <Link to="/compte">espace Compte</Link>, pour que nous puissions vous réserver un emplacement.</p> : <p>{item.body}</p>}
              {item.lodgings?.length ? <ul className="lodging-list">{item.lodgings.map(lodging => <li key={lodging.url}>
                <a href={lodging.url} target="_blank" rel="noopener noreferrer"><span><strong>{lodging.name}</strong><span>{lodging.kind} · {lodging.town}</span></span><ExternalLink size={18} aria-hidden="true" /><span className="sr-only"> (nouvel onglet)</span></a>
              </li>)}</ul> : null}
            </div>
          </details> : <div key={item.id} className="information-item">
            {item.location ? <VenueLocation location={item.location} /> : item.schedule?.length ? <>
              <dl className="practical-hours" aria-label={item.title}>{item.schedule.map(moment =>
                <div key={moment.time}><dt><time dateTime={moment.time} aria-label={moment.nextDay ? `${formatTime(moment.time)}, dans la nuit du samedi au dimanche` : undefined}>{formatTime(moment.time)}</time></dt><dd>{moment.title}</dd></div>)}</dl>
              <p className="practical-hours-note">{item.body}</p>
            </> : <><h3>{item.title}</h3><p>{category.id === 'petits-bouts' ? childrenNotice(item.body) : item.body}</p></>}
          </div>)}
          {category.id === 'petits-bouts' && <div className="information-item">
            <h3>Accompagnants</h3>
            <p>On se réjouit de vous retrouver pour fêter notre mariage ! Comme le lieu sera au complet, nous pourrons accueillir une personne par bracelet reçu. <strong>Si vous avez reçu un seul bracelet, il vous est réservé.</strong> On aurait aimé pouvoir vous laisser venir accompagné, et on est sincèrement désolés que ce ne soit pas possible. Merci de votre compréhension.</p>
          </div>}
          {category.id === 'dress-code' && <div className="information-item">
            <p>Portez ce qui vous plaît et dans quoi vous vous sentez bien ! Si vous avez envie de vous accorder à l’esprit du mariage, le moodboard ci-dessous vous donne quelques idées. Des tenues qui se répondent, ça fera de belles photos tous ensemble.</p>
            <p><strong>La seule règle : le blanc de la tête aux pieds est réservé à la mariée.</strong></p>
            <img className="dress-code-moodboard" src="/assets/identity/dress-code-moodboard.png" width="1024" height="1536" loading="lazy" alt="Idées de tenues pour Once Upon a Fest : costumes sable et bordeaux, chemises en lin, combinaison terracotta, robe fleurie et accessoires de festival." />
          </div>}
          {!showProgram && items.length === 0 && !['confirmation', 'restauration', 'petits-bouts', 'dress-code'].includes(category.id) && <p>Les informations de cette rubrique seront précisées prochainement.</p>}
        </div>
      </details>;
    })}</div>
  </section>;
}
