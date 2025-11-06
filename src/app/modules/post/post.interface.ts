import { Types } from 'mongoose'

export interface IPost {
	_id?: Types.ObjectId
	content: string
	author: Types.ObjectId
	thread: Types.ObjectId
	parentPost?: Types.ObjectId | null
	depth?: number // Nesting level (0 = top level)
	likes?: Types.ObjectId[]
	likeCount?: number

	isEdited?: Boolean
	editedAt?: Date | null
	editHistory?: {
		content: string
		editedAt: Date
	}[]

	// Soft delete flag
	isDeleted?: boolean
	deletedAt?: Date | null
	deletedBy?: Types.ObjectId | null

	isSpam?: boolean // Marked as spam
	spamScore?: number // Spam score

	// Mentioned users
	mentions?: Types.ObjectId[]
	replyCount?: number

	createdAt?: Date
	updatedAt?: Date
}
