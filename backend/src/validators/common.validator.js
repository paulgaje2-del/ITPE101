import {z} from 'zod';

export const uuidSchema=z.string().uuid();
export const positiveIntegerSchema=z.coerce.number().int().positive();
