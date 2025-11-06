import { model, Schema } from 'mongoose'
import { IPost } from './post.interface'

const postSchema = new Schema<IPost>(
	{
		content: {
			type: String,
			required: [true, 'Post content is required'],
			minlength: 1,
		},
		author: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: [true, 'Post author is required'],
			index: true,
		},
		thread: {
			type: Schema.Types.ObjectId,
			ref: 'Thread',
			required: [true, 'Associated thread is required'],
			index: true,
		},
		parentPost: {
			type: Schema.Types.ObjectId,
			ref: 'Post',
			default: null,
		},
		depth: {
			type: Number,
			default: 0,
		},
		likes: [
			{
				type: Schema.Types.ObjectId,
				ref: 'User',
			},
		],
		likeCount: {
			type: Number,
			default: 0,
		},
		isEdited: {
			type: Boolean,
			default: false,
		},
		editedAt: {
			type: Date,
			default: null,
		},
		editHistory: [
			{
				content: { type: String, required: true },
				editedAt: { type: Date, required: true, default: Date.now },
			},
		],
		isDeleted: {
			type: Boolean,
			default: false,
		},
		deletedAt: {
			type: Date,
			default: null,
		},
		deletedBy: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			default: null,
		},
		isSpam: {
			type: Boolean,
			default: false,
		},
		spamScore: {
			type: Number,
			min: 0,
			max: 1,
			default: 0,
		},
		mentions: [
			{
				type: Schema.Types.ObjectId,
				ref: 'User',
			},
		],
		replyCount: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	},
)

export const PostModel = model<IPost>('Post', postSchema)
