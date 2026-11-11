import { useFestival } from '../components/Layout';
import { ChevronDown } from 'lucide-react';
import { isDanceTime, ProgramMomentDetails, ProgramMomentTitle } from '../components/ProgramMoment';

// Ordre des illustrations dans la planche de cinq colonnes.
const illustratedMoments = [
  'ouverture', 'ceremonie', 'activites', 'grand-jeu', 'restauration',
  'bal', 'annees-80-90-2000', 'surprise-dj-set', 'reprise-annees-80-90-2000', 'free-playlist',
  'rock', 'techno-dj-set', 'rave', 'coupure-du-son', 'fermeture',
];

export function Lineup() {
  const { program } = useFestival();
  return <section className="page lineup-page">
    <header className="lineup-heading">
      <div className="lineup-heading-art">
        <img src="/assets/identity/lineup-header.webp" width="2172" height="724" alt="" fetchPriority="high" />
      </div>
      <h1 className="sr-only">Line-up — Once Upon a Fest</h1>
      <p className="sr-only">Florian et Charline</p>
    </header>
    {program.length > 0 ? <>
      <ol className="festival-schedule">{program.map(moment => {
        const iconIndex = illustratedMoments.indexOf(moment.id);
        const isMusic = isDanceTime(moment.time);
        const musicTitle = moment.id === 'rave' ? 'Rave' : moment.title.replace(/\bDJ set\s*(?:-\s*)?/i, '');
        return <li key={moment.id} className="schedule-row">
          <details className="schedule-step">
            <summary className="schedule-summary">
              {iconIndex >= 0 && <span className="schedule-icon" aria-hidden="true"
                style={{ backgroundPosition: `${(iconIndex % 5) * 25}% ${Math.floor(iconIndex / 5) * 50}%` }} />}
              <span className="schedule-card">
                <span>
                  <span className="schedule-time">
                <time dateTime={moment.time}>{moment.time.replace(':00', ' h').replace(':', ' h ')}</time>
                {moment.endTime && <span className="schedule-end"><span className="sr-only">jusqu’à </span><span aria-hidden="true">– </span><time dateTime={moment.endTime}>{moment.endTime.replace(':00', ' h').replace(':', ' h ')}</time></span>}
                  </span>
                <span className="schedule-title">
                  {isMusic
                    ? <>{musicTitle.charAt(0).toUpperCase() + musicTitle.slice(1)} - <em className="schedule-credit">DJ Set</em></>
                    : <ProgramMomentTitle moment={moment} />}
                </span>
                </span>
                <ChevronDown className="schedule-chevron" size={18} aria-hidden="true" />
              </span>
            </summary>
            <div className="schedule-details">
              <ProgramMomentDetails moment={moment} />
              {!moment.description && !moment.location && <p>Les détails de cette étape seront précisés prochainement.</p>}
            </div>
          </details>
        </li>;
      })}</ol>
      <p className="quiet-note">Touche un moment pour en savoir plus.</p>
    </> : <p className="quiet-note">Le programme sera dévoilé prochainement.</p>}
  </section>;
}
