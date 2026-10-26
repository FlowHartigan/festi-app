/** Decorative stationery motif. */
export function FestivalFlower() {
  return <svg className="festival-flower" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
    {Array.from({ length: 8 }, (_, i) => <ellipse key={i} cx="50" cy="25" rx="10" ry="21" transform={'rotate(' + i * 45 + ' 50 50)'} fill="currentColor" />)}
    <circle cx="50" cy="50" r="12" fill="var(--cream)" />
    <circle cx="50" cy="50" r="8" fill="var(--gold)" />
  </svg>;
}
