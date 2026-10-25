import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { KeyRound, Tent, UserRound, Check, CalendarCheck, ChevronRight, ArrowLeft } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { accountSchema } from '../../shared/account';
import type { Account as GuestAccount } from '../../shared/account';

class AccountError extends Error {
  status: number;
  constructor(message: string, status: number) { super(message); this.status = status; }
}

async function requestAccount(path = '', method = 'GET', body?: unknown, signal?: AbortSignal) {
  const response = await fetch(`/api/account${path}`, {
    method, signal, credentials: 'same-origin',
    headers: method === 'GET' ? {} : { 'Content-Type': 'application/json', 'X-Account-Request': '1' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new AccountError(data?.error ?? 'Le service est indisponible. Réessayez dans un instant.', response.status);
  }
  return response.status === 204 ? null : accountSchema.parse(await response.json());
}

const errorMessage = (error: unknown) => error instanceof AccountError ? error.message : 'Connexion interrompue. Votre saisie est conservée : réessayez dans un instant.';

function AnswerChoice({ name, value, onChange, yes, no }: {
  name: string; value: boolean | null; onChange: (answer: boolean) => void; yes: string; no: string;
}) {
  return <div className="account-choices">{[{ value: true, label: yes }, { value: false, label: no }].map(option =>
    <label key={String(option.value)} className={value === option.value ? 'answer-option selected' : 'answer-option'}>
      <input type="radio" name={name} value={String(option.value)} required checked={value === option.value} onChange={() => onChange(option.value)} />
      <span>{option.label}</span>
    </label>)}</div>;
}

export function Account() {
  const [params, setParams] = useSearchParams();
  const section = params.get('rubrique') === 'presence' ? 'presence' : params.get('rubrique') === 'van' ? 'van' : null;
  const [account, setAccount] = useState<GuestAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [reload, setReload] = useState(0);
  const [code, setCode] = useState('');
  const [attending, setAttending] = useState<boolean | null>(null);
  const [van, setVan] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [expired, setExpired] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const loggedIn = account !== null;

  useEffect(() => { if (loggedIn) titleRef.current?.focus(); }, [section, loggedIn]);

  useEffect(() => {
    const controller = new AbortController();
    requestAccount('', 'GET', undefined, controller.signal).then(data => {
      setAccount(data); setAttending(data?.attending ?? null); setVan(data?.van ?? null);
      setLoadFailed(false); setError('');
    }).catch(error => {
      if (controller.signal.aborted) return;
      if (!(error instanceof AccountError && error.status === 401)) {
        setLoadFailed(true); setError('Impossible de charger votre compte. Réessayez dans un instant.');
      }
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [reload]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const data = await requestAccount('/login', 'POST', { code });
      setAccount(data); setAttending(data?.attending ?? null); setVan(data?.van ?? null);
      setCode(''); setExpired(false); setSaved(false);
    } catch (error) { setError(errorMessage(error)); }
    finally { setBusy(false); }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setSaved(false);
    if ((section === 'presence' && attending === null) || (section === 'van' && van === null)) {
      setError('Choisissez une réponse avant d’enregistrer.'); return;
    }
    setBusy(true);
    try {
      const data = await requestAccount(`/${section}`, 'PUT', section === 'presence' ? { attending } : { van });
      setAccount(data); setAttending(data?.attending ?? null); setVan(data?.van ?? null); setSaved(true);
    } catch (error) {
      setError(errorMessage(error));
      if (error instanceof AccountError && error.status === 401) setExpired(true);
    } finally { setBusy(false); }
  }

  async function logout() {
    setBusy(true); setError('');
    try {
      await requestAccount('/logout', 'POST');
      setAccount(null); setAttending(null); setVan(null); setSaved(false); setExpired(false);
      setParams({});
    } catch (error) { setError(errorMessage(error)); }
    finally { setBusy(false); }
  }

  function openSection() {
    setAttending(account?.attending ?? null); setVan(account?.van ?? null); setError(''); setSaved(false);
  }

  const dirty = account !== null && (section === 'presence' ? attending !== account.attending : van !== account.van);
  const answer = section === 'presence' ? attending : van;
  const answered = account !== null && (section === 'presence' ? account.attending !== null : account.van !== null);
  return <section className="page account-page">
    {account && section && <Link className="account-back" to="/compte" onClick={openSection}><ArrowLeft size={18} aria-hidden="true" /> Mon compte</Link>}
    <div className="account-heading"><h1 ref={titleRef} tabIndex={-1}>{account && section ? section === 'presence' ? 'Ma présence' : 'Ma nuit en van' : 'Compte'}</h1><UserRound size={28} aria-hidden="true" /></div>
    {loading ? <p role="status">Chargement de votre espace…</p> : loadFailed ? <>
      <p role="alert" className="account-error">{error}</p>
      <button className="action" onClick={() => { setLoading(true); setReload(value => value + 1); }}>Réessayer</button>
    </> : !account ? <>
      <p className="intro">Votre petit coin du festival, pour nous dire si vous serez de la fête.</p>
      <form className="account-login" onSubmit={login} aria-busy={busy}>
        <KeyRound size={27} aria-hidden="true" className="account-key" />
        <h2>Bienvenue dans votre espace</h2>
        <label htmlFor="access-code">Votre code à 4 chiffres</label>
        <p id="code-help" className="account-hint">Utilisez le code personnel qui vous a été communiqué.</p>
        <input id="access-code" className="account-code" type="password" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{4}" maxLength={4} minLength={4} required value={code} disabled={busy}
          aria-describedby={error ? 'code-help account-error' : 'code-help'} aria-invalid={!!error}
          onChange={event => { setCode(event.target.value.replace(/[^0-9]/g, '').slice(0, 4)); setError(''); }} />
        {error && <p id="account-error" role="alert" className="account-error">{error}</p>}
        <button className="account-primary" disabled={busy}>{busy ? 'Connexion…' : 'Accéder à mon espace'}</button>
      </form>
    </> : <>
      {!section ? <>
        <p className="account-welcome">Bienvenue, <strong>{account.name}</strong></p>
        <p className="intro">Préparez votre venue, une réponse à la fois. Choisissez une rubrique pour confirmer ou modifier votre réponse.</p>
        <div className="account-menu">
          <Link className="account-menu-button" to="?rubrique=presence" onClick={openSection}>
            <CalendarCheck className="account-menu-icon" size={26} aria-hidden="true" />
            <span><strong>Ma présence</strong><span>{account.attending === null ? 'À confirmer' : account.attending ? 'Présence confirmée' : 'Absence confirmée'}</span></span>
            <ChevronRight size={22} aria-hidden="true" />
          </Link>
          <Link className="account-menu-button" to="?rubrique=van" onClick={openSection}>
            <Tent className="account-menu-icon" size={26} aria-hidden="true" />
            <span><strong>Ma nuit en van</strong><span>{account.attending !== true ? 'Confirmez d’abord votre présence' : account.van === null ? 'À confirmer' : account.van ? 'Nuit en van confirmée' : 'Pas de nuit en van'}</span></span>
            <ChevronRight size={22} aria-hidden="true" />
          </Link>
        </div>
        {error && <p role="alert" className="account-error">{error}</p>}
      </> : section === 'van' && account.attending !== true ? <>
        <p className="intro">Confirmez d’abord votre présence au mariage pour nous dire si vous comptez dormir en van.</p>
        <Link className="account-primary account-link" to="?rubrique=presence" onClick={openSection}>Confirmer ma présence</Link>
        {error && <p role="alert" className="account-error">{error}</p>}
      </> : <>
      <p className="intro">{section === 'presence' ? 'Dites-nous si vous serez de la fête. Vous pourrez modifier votre réponse ici.' : 'Indiquez si vous prévoyez de dormir dans votre van sur l’espace dédié.'}</p>
      <form key={section} onSubmit={save} aria-busy={busy}>
        {section === 'presence' ? <fieldset className="account-question" disabled={busy || expired}>
          <legend>Serez-vous de la fête ?</legend>
          <p className="account-hint">Le samedi 4 septembre 2027, à La Source du Buron.</p>
          <AnswerChoice name="attending" value={attending} yes="Oui, je serai là !" no="Non, je ne pourrai pas venir" onChange={value => {
            setAttending(value); setSaved(false); setError('');
          }} />
        </fieldset> : <fieldset className="account-question" disabled={busy || expired}>
          <legend><Tent size={22} aria-hidden="true" /> Une nuit en van ?</legend>
          <p className="account-hint">Prévoyez-vous de dormir dans votre van sur l’espace dédié ?</p>
          <AnswerChoice name="van" value={van} yes="Oui, je dormirai en van" no="Non, pas de van pour moi" onChange={value => { setVan(value); setSaved(false); setError(''); }} />
        </fieldset>}
        {section === 'presence' && attending === false && <p className="account-hint account-absence">Merci de nous prévenir. Aucun couchage en van ne sera indiqué pour vous.</p>}
        {error && <p role="alert" className="account-error">{error}</p>}
        {expired ? <button type="button" className="account-primary" onClick={() => { setAccount(null); setError(''); setExpired(false); }}>Me reconnecter</button> :
          <button className="account-primary" disabled={busy || answer === null || (!dirty && answered)}>{busy ? 'Enregistrement…' : section === 'presence' ? 'Enregistrer ma présence' : 'Enregistrer ma nuit en van'}</button>}
        <div role="status" className="account-status">{saved ? <><Check size={20} aria-hidden="true" /> Votre réponse a bien été enregistrée. Merci !</> :
          dirty ? 'Votre modification n’est pas encore enregistrée.' : answered ? 'Votre réponse est enregistrée.' : 'Vous n’avez pas encore répondu à cette question.'}</div>
      </form>
      </>}
      <button type="button" className="account-logout" disabled={busy} onClick={logout}>Me déconnecter</button>
    </>}
  </section>;
}
