import { useState, type FormEvent } from 'react';
import { guestResponseSchema, organizerResponsesSchema, type GuestResponse } from '../../shared/account';
import './Organizer.css';

const filters = [
  { label: 'Invités', matches: () => true },
  { label: 'Présents', matches: (guest: GuestResponse) => guest.attending === true },
  { label: 'Absents', matches: (guest: GuestResponse) => guest.attending === false },
  { label: 'Présence à confirmer', matches: (guest: GuestResponse) => guest.attending === null },
  { label: 'Nuits en van', matches: (guest: GuestResponse) => guest.van === true },
  { label: 'Van à confirmer', matches: (guest: GuestResponse) => guest.attending === true && guest.van === null },
];
const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Paris' });
const searchText = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
const answer = (value: boolean | null) => value === null ? 'En attente' : value ? 'Oui' : 'Non';
const savedPresence = (value: boolean | null) => value === null ? 'réponse réinitialisée' : value ? 'présence confirmée' : 'absence enregistrée';

export function Organizer() {
  const [key, setKey] = useState('');
  const [guests, setGuests] = useState<GuestResponse[] | null>(null);
  const [filter, setFilter] = useState(0);
  const [query, setQuery] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function requestResponses(change?: { id: string; attending: boolean | null }) {
    setPending(true);
    setError('');
    setNotice('');
    try {
      const path = '/api/organizer/responses' + (change ? `/${change.id}/presence` : '');
      const response = await fetch(path, {
        method: change ? 'PUT' : 'GET',
        headers: {
          Authorization: `Bearer ${key.trim()}`,
          ...(change && { 'Content-Type': 'application/json' }),
        },
        body: change ? JSON.stringify({ attending: change.attending }) : undefined,
        cache: 'no-store',
        credentials: 'omit',
        redirect: 'error',
      });
      if (response.status === 401 || response.status === 503) {
        setGuests(null);
        setError(response.status === 401 ? 'Clé organisateur incorrecte.' : 'Le tableau de bord doit être activé sur le serveur.');
        return;
      }
      if (response.status === 429) {
        setError('Trop de tentatives. Réessayez plus tard.');
        return;
      }
      if (!response.ok) throw new Error();
      const data: unknown = await response.json();
      if (change) {
        const updated = guestResponseSchema.parse(data);
        setGuests(rows => rows?.map(guest => guest.id === updated.id ? updated : guest) ?? null);
        setNotice(`${updated.name} — ${savedPresence(updated.attending)}.`);
      } else {
        setGuests(organizerResponsesSchema.parse(data).sort((a, b) => a.name.localeCompare(b.name, 'fr')));
      }
    } catch {
      setError(change ? 'Impossible d’enregistrer la présence. Actualisez les réponses et réessayez.' : 'Impossible de charger les réponses. Réessayez.');
    } finally {
      setPending(false);
    }
  }

  function loadResponses(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    void requestResponses();
  }

  function savePresence(guest: GuestResponse, attending: boolean | null) {
    if (attending === null && !window.confirm(`Réinitialiser la réponse de ${guest.name} ? La présence et la nuit en van repasseront sans réponse.`)) return;
    if (attending === false && !window.confirm(`Marquer ${guest.name} comme absent ? Un éventuel couchage en van sera annulé.`)) return;
    void requestResponses({ id: guest.id, attending });
  }

  function lock() {
    setGuests(null);
    setKey('');
    setQuery('');
    setFilter(0);
    setError('');
    setNotice('');
  }

  const visible = guests?.filter(guest => filters[filter].matches(guest) && searchText(guest.name).includes(searchText(query))) ?? [];

  return <main className="organizer">
    <header className="organizer-header">
      <h1>Réponses des invités</h1>
      {guests && <button type="button" onClick={lock} disabled={pending}>Verrouiller</button>}
    </header>
    {error && <p role="alert" className="organizer-error">{error}</p>}
    {guests === null ? (
      <form className="organizer-login" onSubmit={loadResponses}>
        <label htmlFor="organizer-key">Clé organisateur</label>
        <input id="organizer-key" type="password" value={key} onChange={event => setKey(event.target.value)} required disabled={pending} />
        <button type="submit" disabled={pending}>{pending ? 'Chargement…' : 'Ouvrir le tableau de bord'}</button>
      </form>
    ) : (
      <>
        <div className="organizer-totals" role="group" aria-label="Filtrer par réponse">
          {filters.map(({ label, matches }, index) => (
            <button key={label} type="button" aria-pressed={filter === index} onClick={() => setFilter(index)}>
              <strong>{guests.filter(matches).length}</strong>
              {label}
            </button>
          ))}
        </div>
        <div className="organizer-tools">
          <label htmlFor="guest-search">Rechercher un invité
            <input id="guest-search" type="search" value={query} onChange={event => setQuery(event.target.value)} />
          </label>
          <button type="button" disabled={pending} onClick={() => void loadResponses()}>{pending ? 'Chargement…' : 'Actualiser'}</button>
        </div>
        <p className="organizer-count">{visible.length} sur {guests.length} invités</p>
        <p className="organizer-notice" role="status">{notice}</p>
        {visible.length === 0 ? <p>Aucun invité à afficher.</p> : (
          <ul className="organizer-guests" aria-label="Liste des réponses">
            {visible.map(guest => (
              <li key={guest.id}>
                <div className="organizer-guest-name">
                  <strong>{guest.name}</strong>
                  {guest.updatedAt && <time dateTime={guest.updatedAt}>{dateFormat.format(new Date(guest.updatedAt))}</time>}
                </div>
                <dl className="organizer-answers">
                  <div><dt>Présence</dt><dd data-answer={guest.attending}>{answer(guest.attending)}</dd></div>
                  <div><dt>Nuit en van</dt><dd data-answer={guest.van}>{guest.attending === true ? answer(guest.van) : '—'}</dd></div>
                </dl>
                <div className="organizer-actions" role="group" aria-label={`Modifier la présence de ${guest.name}`}>
                  {guest.attending !== true && <button type="button" disabled={pending} onClick={() => savePresence(guest, true)}>Confirmer la présence</button>}
                  {guest.attending !== false && <button type="button" disabled={pending} onClick={() => savePresence(guest, false)}>Marquer absent</button>}
                  {guest.attending !== null && <button type="button" disabled={pending} onClick={() => savePresence(guest, null)}>Réinitialiser</button>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </>
    )}
  </main>;
}
