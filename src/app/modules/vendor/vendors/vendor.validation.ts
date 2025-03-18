import { z } from 'zod';
const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postcode: z.string().min(4, 'Postcode is required'),
  country: z.string().min(1, 'Country is required'),
});
const vendorSchema = z.object({
  body: z.object({
    fullName: z.string().min(1, 'Full Name is required'),
    contactNumber: z
      .string()
      .min(10, 'Contact Number must be at least 10 digits'),
    userName: z.string().min(1, 'User Name is required'),
    company: z.string().min(1, 'User Name is required'),
    address: addressSchema,
  }),
});

export const VendorValidation = { vendorSchema };
