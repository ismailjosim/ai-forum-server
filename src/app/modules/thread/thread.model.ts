import { model, Schema } from 'mongoose'
import { IThread, ThreadCategory } from './thread.interface'

const threadSchema = new Schema<IThread>(
	{
		title: {
			type: String,
			required: [true, 'Thread title is required'],
			trim: true,
			minlength: 5,
			maxlength: 250,
		},
		content: {
			type: String,
			required: [true, 'Thread content is required'],
			minlength: 20,
		},
		category: {
			type: String,
			enum: Object.values(ThreadCategory),
			required: [true, 'Thread category is required'],
			index: true,
		},
		author: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: [true, 'Thread author is required'],
			index: true,
		},
		tags: {
			type: [String],
			default: [],
			index: true,
		},

		// Status/Control Flags
		isPinned: { type: Boolean, default: false },
		isLocked: { type: Boolean, default: false },
		isClosed: { type: Boolean, default: false },
		isDeleted: { type: Boolean, default: false },

		// Metrics
		views: { type: Number, default: 0 },
		postCount: { type: Number, default: 0 },

		// Activity Tracking
		lastActivity: { type: Date, default: Date.now, index: true },
		lastPostBy: { type: Schema.Types.ObjectId, ref: 'User' },

		// Spam/Moderation
		isSpam: { type: Boolean, default: false, index: true },
		spamScore: { type: Number, min: 0, max: 1 },
		deletedAt: { type: Date },
		deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },

		// AI Features
		aiSummary: { type: String, maxlength: 1000 },
		summaryGeneratedAt: { type: Date },
	},
	{
		timestamps: true,
	},
)

export const ThreadModel = model<IThread>('Thread', threadSchema)
