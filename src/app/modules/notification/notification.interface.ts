import { Types } from 'mongoose'

export interface INotification {
	_id?: Types.ObjectId
	userId: Types.ObjectId
	type: 'reply' | 'mention' | 'like' | 'system' | 'thread_approved'
	title: string
	message?: string
	threadId?: Types.ObjectId
	postId?: Types.ObjectId
	triggeredBy?: Types.ObjectId
	isRead: boolean
	createdAt?: Date
	updatedAt?: Date
}

export interface INotificationResponse {
	notifications: INotification[]
	unreadCount: number
}
