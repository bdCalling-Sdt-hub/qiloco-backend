import { z } from 'zod';

const productSchema = z.object({
  userId: z.string().min(24, 'User ID must be a valid ObjectId'),
  name: z.string().min(1, 'Product name is required').trim(),
  description: z.string().min(1, 'Product description is required').trim(),
  price: z
    .number()
    .positive('Price must be a positive number')
    .min(0.01, 'Price must be at least $0.01'),
  quality: z
    .enum(['high', 'medium'])
    .refine((val) => ['high', 'medium'].includes(val), {
      message: "Quality must be either 'high' or 'medium'",
    }),
  quantity: z
    .number()
    .positive('Quantity must be a positive number')
    .min(1, 'Quantity is required'),

  moodTag: z.array(z.string()).min(1, 'At least one mood tag is required'),
  potency: z.string().min(1, 'Potency is required'),
  genetics: z.string().min(1, 'Genetics is required'),
  origin: z.string().min(1, 'Origin is required'),
  type: z.string().min(1, 'Type is required'),
  scent: z.string().min(1, 'Scent is required'),
  image: z.array(z.string().url().optional()),
});

export const ValidationSchema = {
  productSchema,
};
