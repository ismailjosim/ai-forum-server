import { model, Schema } from 'mongoose'
import { INotification } from './notification.interface'

const notificationSchema = new Schema<INotification>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: [true, 'User ID is required'],
			index: true,
		},
		type: {
			type: String,
			enum: ['reply', 'mention', 'like', 'system', 'thread_approved'],
			required: [true, 'Notification type is required'],
		},
		title: {
			type: String,
			required: [true, 'Notification title is required'],
		},
		message: {
			type: String,
		},
		threadId: {
			type: Schema.Types.ObjectId,
			ref: 'Thread',
		},
		postId: {
			type: Schema.Types.ObjectId,
			ref: 'Post',
		},
		triggeredBy: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
		isRead: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	},
)

export const NotificationModel = model<INotification>(
	'Notification',
	notificationSchema,
)
