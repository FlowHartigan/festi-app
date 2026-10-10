import { festivalSchema } from '../../shared/festival';
import type { LoaderFunctionArgs } from 'react-router-dom';

export async function loadFestival({ request }: LoaderFunctionArgs) {
  const response = await fetch('/api/festival', { signal: request.signal });
  if (!response.ok) throw new Error('Impossible de charger les informations du festival');
  return festivalSchema.parse(await response.json());
}
