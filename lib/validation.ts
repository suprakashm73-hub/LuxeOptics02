import { z } from 'zod';
import { AGE_GROUPS, FRAME_SIZES, ORDER_STATUSES, PRODUCT_TYPES, REQUEST_STATUSES } from './types';

export const mobileSchema = z
  .string()
  .transform((s) => s.replace(/[^+\d]/g, ''))
  .pipe(z.string().regex(/^\+?\d{8,15}$/, 'Enter a valid mobile number, including country code if needed.'));

export const authSchema = z.object({
  mode: z.enum(['login', 'signup']),
  mobile: mobileSchema,
  password: z.string().min(6, 'Password must be at least 6 characters.').max(200),
});

export const checkoutSchema = z.object({
  name: z.string().trim().min(2, 'Enter the recipient name.').max(100),
  mobile: mobileSchema,
  pincode: z.string().regex(/^\d{6}$/, 'PIN code must be 6 digits.'),
  address: z.string().trim().min(5, 'Enter the street address.').max(300),
  city: z.string().trim().min(2, 'Enter the city.').max(80),
  state: z.string().trim().min(2, 'Enter the state.').max(80),
  payment: z.enum(['COD', 'UPI']),
  items: z
    .array(z.object({ id: z.string().max(40), qty: z.number().int().min(1).max(20) }))
    .min(1, 'Your bag is empty.')
    .max(50),
});

const httpUrl = z
  .string()
  .max(1000)
  .refine((s) => {
    try {
      return ['http:', 'https:'].includes(new URL(s).protocol);
    } catch {
      return false;
    }
  }, 'Image URLs must start with https://');

export const productSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(80),
  type: z.enum(PRODUCT_TYPES),
  price: z.coerce.number().int('Price must be a whole number.').min(1, 'Enter a price.').max(1_000_000),
  color: z.string().trim().min(1, 'Color is required.').max(60),
  badge: z.string().trim().max(20).default(''),
  ageGroup: z.enum(AGE_GROUPS),
  frameSize: z.enum(FRAME_SIZES),
  desc: z.string().trim().max(600).default(''),
  images: z
    .string()
    .transform((s) => s.split(/\s+/).filter(Boolean))
    .pipe(z.array(httpUrl).min(1, 'Add at least one image URL.').max(5, 'Use at most 5 images.')),
});

export const orderUpdateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(ORDER_STATUSES),
  message: z.string().trim().max(500).default(''),
});

export const serviceRequestSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['Return', 'Exchange']),
  message: z.string().trim().min(5, 'Please add a short reason.').max(500),
});

export const serviceAnswerSchema = z.object({
  id: z.string().min(1),
  status: z.enum(REQUEST_STATUSES),
  reply: z.string().trim().max(500).default(''),
});

export const ratingSchema = z.object({ productId: z.string().min(1), stars: z.coerce.number().int().min(1).max(5) });

export const helplineSchema = z.object({
  phone: z.string().trim().regex(/^\+?[\d\s-]{8,20}$/, 'Enter a valid phone number.'),
});

export const firstError = (e: z.ZodError) => e.issues[0]?.message ?? 'Invalid input.';
