import {z} from 'zod';
import {uuidSchema} from './common.validator.js';

export const checkoutSchema=z.object({
 items:z.array(z.object({
  productId:uuidSchema,
  size:z.coerce.number().int().positive(),
  quantity:z.coerce.number().int().min(1).max(5),
  color:z.string().trim().max(40).optional()
 })).min(1).max(20),
 coupon:z.string().trim().max(60).optional(),
 shipping:z.object({
  name:z.string().trim().min(1).max(120),
  phone:z.string().trim().max(40).optional(),
  address:z.string().trim().max(300).optional(),
  city:z.string().trim().max(100).optional(),
  postalCode:z.string().trim().max(20).optional()
 }).passthrough()
});

export const orderIdSchema=z.object({id:uuidSchema});
export const orderStatusSchema=z.object({status:z.enum(['processing','shipped','delivered','cancelled','expired'])});
export const idempotencyHeaderSchema=z.object({
 'idempotency-key':z.string().trim().min(1).max(200)
});
