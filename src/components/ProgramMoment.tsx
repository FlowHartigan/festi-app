import { MapPin } from 'lucide-react';
import type { Festival } from '../../shared/festival';

type Moment = Festival['program'][number];
const lipSyncCredit = ' — Hosted by Lip-sync challenge';

export function CateringInstagramLink() {
  return <a href="https://www.instagram.com/la_boite_a_reves_lepuyenvelay?obrf=bHBjdHVpNTFzZTM3" target="_blank" rel="noopener noreferrer">La Boîte à Rêve sur Instagram</a>;
}

export function isDanceTime(time: string) {
  return time >= '22:00' || time < '04:00';
}

export function ProgramMomentTitle({ moment }: { moment: Moment }) {
  if (moment.title.endsWith(lipSyncCredit)) {
    return <>{moment.title.slice(0, -lipSyncCredit.length)} — <em className="schedule-credit">by Lip-sync challenge</em></>;
  }
  return <>{moment.title}{moment.id === 'restauration' && <> — <em className="schedule-credit">by La Boîte à Rêve</em></>}</>;
}

export function ProgramMomentDetails({ moment }: { moment: Moment }) {
  const description = moment.id === 'fermeture' ? 'Il est temps d’aller dormir.' : moment.description;
  return <>
    {description && <p>{description}</p>}
    {moment.id === 'restauration' && <p><CateringInstagramLink /></p>}
    {moment.location && <p className="schedule-location"><MapPin size={16} aria-hidden="true" /><span>{moment.location}</span></p>}
  </>;
}
