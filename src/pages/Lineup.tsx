import { useFestival } from '../components/Layout';
import { ChevronDown, MapPin } from 'lucide-react';
import { FestivalFlower } from '../components/FestivalFlower';

export function Lineup() {
  const { program, date, timezone } = useFestival();
  const day = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: timezone })
    .format(new Date(`${date}T12:00:00Z`));
  return <section className="page lineup-page">
    <div className="lineup-heading">
      <h1>Line-up</h1>
      <FestivalFlower />
    </div>
    <div className="lineup-day"><time dateTime={date}>{day}</time></div>
    {program.length > 0 ? <>
      <ol className="festival-schedule">{[...program].sort((a, b) => a.time.localeCompare(b.time)).map(moment =>
        <li key={moment.id} className="schedule-row">
          <details className="schedule-step">
            <summary className="schedule-summary">
              <span className="schedule-time"><time dateTime={moment.time}>{moment.time.replace(':00', ' h').replace(':', ' h ')}</time>{moment.endTime && <span className="schedule-end"><span className="sr-only">jusqu’à </span><span aria-hidden="true">– </span><time dateTime={moment.endTime}>{moment.endTime.replace(':00', ' h').replace(':', ' h ')}</time></span>}</span>
              <span className="schedule-card"><span className="schedule-title">{moment.title}</span><ChevronDown className="schedule-chevron" size={18} aria-hidden="true" /></span>
            </summary>
            <div className="schedule-details">
              {moment.description && <p>{moment.description}</p>}
              {moment.location && <p className="schedule-location"><MapPin size={16} aria-hidden="true" /><span>{moment.location}</span></p>}
              {!moment.description && !moment.location && <p>Les détails de cette étape seront précisés prochainement.</p>}
            </div>
          </details>
        </li>
      )}</ol>
      <p className="quiet-note">Touche un moment pour en savoir plus.</p>
    </> : <p className="quiet-note">Le programme sera dévoilé prochainement.</p>}
  </section>;
}
