import {z} from 'zod';

export const couponInputSchema=z.object({
 code:z.string().trim().min(2).max(40),
 type:z.enum(['percent','fixed']),
 value:z.coerce.number().finite().min(0),
 minSpend:z.coerce.number().finite().min(0).default(0),
 expiresAt:z.string().datetime().nullable().optional(),
 usageLimit:z.coerce.number().int().positive(),
 perCustomerLimit:z.coerce.number().int().positive().default(1),
 active:z.boolean().default(true)
});
