import { z } from 'zod';

export const loginSchema = z.object({ code: z.string().regex(/^\d{4}$/) }).strict();
export const presenceSchema = z.object({ attending: z.boolean() }).strict();
export const organizerPresenceSchema = presenceSchema.extend({ attending: presenceSchema.shape.attending.nullable() });
export const vanSchema = z.object({ van: z.boolean() }).strict();
export const responseSchema = z.object({ attending: z.boolean(), van: z.boolean() }).strict()
  .refine(value => value.attending || !value.van, { message: 'Le couchage en van nécessite une présence au mariage.' });
export const accountSchema = z.object({
  name: z.string(), attending: z.boolean().nullable(), van: z.boolean().nullable(), updatedAt: z.string().nullable(),
});
export type Account = z.infer<typeof accountSchema>;
export const guestResponseSchema = accountSchema.extend({ id: z.uuid() }).strict();
export const organizerResponsesSchema = z.array(guestResponseSchema);
export type GuestResponse = z.infer<typeof guestResponseSchema>;
