import { Types } from 'mongoose'

export enum ThreadCategory {
	General = 'general',
	Technology = 'technology',
	Science = 'science',
	Entertainment = 'entertainment',
	Sports = 'sports',
	Other = 'other',
}

export interface IThread {
	title: string
	content: string
	author: Types.ObjectId
	category: ThreadCategory
	tags?: string[]

	// Metrics
	views?: number
	postCount?: number
	lastActivity?: Date
	lastPostBy?: Types.ObjectId

	// Spam / Moderation
	isSpam?: boolean
	spamScore?: number
	isDeleted?: boolean
	deletedAt?: Date
	deletedBy?: Types.ObjectId

	// AI / Summaries
	aiSummary?: string
	summaryGeneratedAt?: Date

	// Status Flags
	isPinned?: boolean
	isLocked?: boolean
	isClosed?: boolean

	// Timestamps
	createdAt?: Date
	updatedAt?: Date
}
