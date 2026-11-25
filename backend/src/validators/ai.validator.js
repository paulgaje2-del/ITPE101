import {z} from 'zod';

export const aiQuerySchema=z.object({
 query:z.string().trim().min(1).max(240)
});
