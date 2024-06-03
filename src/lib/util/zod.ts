import { z } from 'zod';

export const signInSchema = z.object({
	email: z
		.string({ required_error: 'Email is required' })
		.min(1, 'Email is required')
		.email('Invalid email'),
	password: z
		.string({ required_error: 'Password is required' })
		.min(1, 'Password is required'),
});

export const signOnSchema = z.object({
	email: z
		.string({ required_error: 'Email is required' })
		.min(1, 'Email is required')
		.email('Invalid email'),
	password: z
		.string({ required_error: 'Password is required' })
		.min(1, 'Password is required')
		.min(8, 'Password must be more than 8 characters')
		.max(32, 'Password must be less than 32 characters'),
	firstName: z
		.string({ required_error: 'First Name is required' })
		.min(1, 'First Name is required')
		.max(32, 'First Name must be less than 32 characters'),
	lastName: z
		.string({ required_error: 'Last Name is required' })
		.min(1, 'Last Name is required')
		.max(32, 'Last Name must be less than 32 characters'),
});
