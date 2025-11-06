import { z } from 'zod'
import { ThreadCategory } from './thread.interface'

const objectIdSchema = z
	.string({ error: 'ObjectId string is required' })
	.refine((val) => typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val), {
		message: 'Invalid MongoDB ObjectId: must be a 24-character hex string',
	})

// Create Thread schema
// Create Thread schema
const createThreadSchemaValidation = z
	.object({
		title: z
			.string({ error: 'Title is required' })
			.trim()
			.min(5, { message: 'Title must be at least 5 characters' })
			.max(250, { message: 'Title cannot exceed 250 characters' }),

		content: z
			.string({ error: 'Content is required' })
			.min(20, { message: 'Content must be at least 20 characters' }),

		category: z.enum(Object.values(ThreadCategory) as [string, ...string[]]),

		author: objectIdSchema,

		tags: z.array(z.string().trim()).optional().default([]),

		// Optional flags
		isPinned: z.boolean().optional(),
		isLocked: z.boolean().optional(),
		isClosed: z.boolean().optional(),
		isDeleted: z.boolean().optional(),
		isSpam: z.boolean().optional(),

		spamScore: z.coerce.number().min(0).max(1).optional(),
		views: z.coerce.number().optional(),
		postCount: z.coerce.number().optional(),

		lastPostBy: objectIdSchema.optional(),
		lastActivity: z.coerce.date().optional(),
		deletedAt: z.coerce.date().optional(),
		deletedBy: objectIdSchema.optional(),

		aiSummary: z.string().max(1000).optional(),

		createdAt: z.coerce.date().optional(),
		updatedAt: z.coerce.date().optional(),
	})
	.strict()
// Update Thread schema
const updateThreadSchemaValidation = z
	.object({
		title: z
			.string()
			.trim()
			.min(5, { message: 'Title must be at least 5 characters' })
			.max(250, { message: 'Title cannot exceed 250 characters' })
			.optional(),
		content: z
			.string()
			.min(20, { message: 'Content must be at least 20 characters' })
			.optional(),
		category: z
			.enum(Object.values(ThreadCategory) as [string, ...string[]])
			.optional(),
		tags: z.array(z.string().trim()).optional(),

		lastPostBy: objectIdSchema.optional(),
		isPinned: z.boolean().optional(),
		isLocked: z.boolean().optional(),
		isClosed: z.boolean().optional(),
		isDeleted: z.boolean().optional(),
		isSpam: z.boolean().optional(),
		spamScore: z.number().min(0).max(1).optional(),
		aiSummary: z
			.string()
			.max(1000, { message: 'AI Summary is too long' })
			.optional(),
	})
	.strict()

export const ThreadSchemaValidation = {
	create: createThreadSchemaValidation,
	update: updateThreadSchemaValidation,
}
