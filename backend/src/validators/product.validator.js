import {z} from 'zod';
import {uuidSchema} from './common.validator.js';

export const productIdSchema=z.object({id:uuidSchema});
export const managedProductQuerySchema=z.object({
 q:z.string().trim().max(120).optional()
});
export const productQuerySchema=z.object({
 q:z.string().trim().max(120).optional(),
 category:z.string().trim().max(60).optional(),
 sort:z.enum(['newest','price-low','price-high']).default('newest'),
 page:z.coerce.number().int().min(1).default(1),
 limit:z.coerce.number().int().min(1).max(48).default(12)
});

export const productInputSchema=z.object({
 name:z.string().trim().min(1).max(140),
 slug:z.string().trim().min(1).max(160).optional(),
 brand:z.string().trim().min(1).max(80).optional(),
 category:z.string().trim().min(1).max(60),
 description:z.string().trim().min(1).max(3000),
 price:z.coerce.number().finite().min(0),
 image:z.string().url().max(2048),
 sizes:z.array(z.coerce.number().int().positive()).min(1).max(30),
 colors:z.array(z.string().trim().min(1).max(40)).max(20).default([]),
 stock:z.coerce.number().int().min(0),
 featured:z.boolean().default(false),
 active:z.boolean().default(true),
 material:z.string().trim().max(120).nullable().optional(),
 sport:z.string().trim().max(60).nullable().optional()
});

export const productUpdateSchema=productInputSchema.partial();
