const frames = { information: '15 85 1220 270', account: '15 365 1110 290', lineup: '15 700 830 260', map: '15 970 800 260' };
export function HeadingArtwork({ kind, label }: { kind: keyof typeof frames; label: string }) {
  return <><span className="sr-only">{label}</span><svg className={'heading-artwork heading-' + kind} viewBox={frames[kind]} aria-hidden="true" focusable="false"><image href="/assets/identity/heading-atlas.webp" width="1280" height="1280" /></svg></>;
}
