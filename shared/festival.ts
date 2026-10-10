import { z } from 'zod';

export const festivalSchema = z.object({
  name: z.string().min(1),
  couple: z.string().min(1),
  date: z.iso.date(),
  timezone: z.literal('Europe/Paris'),
  venue: z.string(),
  logo: z.string().startsWith('/assets/'),
  mapImage: z.string().startsWith('/assets/'),
  program: z.array(z.object({
    id: z.string(), time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
    title: z.string(), description: z.string(), location: z.string(),
  })),
  places: z.array(z.object({
    id: z.string(), name: z.string(), description: z.string(),
    x: z.number().min(0).max(100), y: z.number().min(0).max(100),
  })),
  information: z.array(z.object({ id: z.string(), title: z.string(), body: z.string() })),
});

export type Festival = z.infer<typeof festivalSchema>;
