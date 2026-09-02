import { z } from 'zod'

const emailField = z
  .string()
  .trim()
  .min(1, 'Email is required.')
  .email('Enter a valid email address.')
  .toLowerCase()

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password is required.'),
})

export type LoginValues = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  email: emailField,
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.'),
})

export type RegisterValues = z.infer<typeof registerSchema>