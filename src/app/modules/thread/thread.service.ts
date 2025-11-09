import mongoose from 'mongoose'
import { ThreadModel } from './thread.model'
import { IThread } from './thread.interface'

import StatusCode from '../../utils/StatusCode'
import AppError from '../../helpers/AppError'
import { UserModel } from '../user/user.model'
import { QueryBuilder } from '../../utils/QueryBuilder'
import { threadSearchableFields } from './thread.constant'
import { PostModel } from '../post/post.model'

/*
 * Create a new thread and handle related updates (like user stats)
 */
const createThreadIntoDB = async (payload: Partial<IThread>) => {
	const session = await mongoose.startSession()
	session.startTransaction()

	try {
		// Ensure author is provided
		if (!payload.author) {
			throw new AppError(StatusCode.BAD_REQUEST, 'Author ID is required')
		}

		// Ensure title and content are present
		if (!payload.title || !payload.content) {
			throw new AppError(
				StatusCode.BAD_REQUEST,
				'Title and content are required',
			)
		}

		// Check if author exists
		const author = await UserModel.findById(payload.author).session(session)
		if (!author) {
			throw new AppError(StatusCode.NOT_FOUND, 'Author not found')
		}

		// Create the thread
		const thread = await ThreadModel.create([payload], { session })
		const createdThread = thread[0]

		// Increment author's thread count
		await UserModel.findByIdAndUpdate(
			payload.author,
			{ $inc: { 'stats.threadsCreated': 1 } },
			{ new: true, session },
		)

		await session.commitTransaction()
		session.endSession()

		// Populate author info before returning
		const populatedThread = await ThreadModel.findById(createdThread._id)
			.populate('lastPostBy', 'username avatar')
			.populate('deletedBy', 'username')
			.populate('author', 'username avatar email')

		return populatedThread
	} catch (error) {
		await session.abortTransaction()
		session.endSession()
		throw error
	}
}

const getAllThreadsFromDB = async (query: Record<string, string>) => {
	const queryBuilder = new QueryBuilder(ThreadModel.find(), query)
	const threads = queryBuilder
		.search(threadSearchableFields)
		.filter()
		.sort()
		.fields()
		.paginate()
	const [data, meta] = await Promise.all([
		threads.build(),
		queryBuilder.getMeta(),
	])
	return {
		data,
		meta,
	}
}
const getSingleThreadFromDB = async (id: string) => {
	// Fetch the thread
	const threadFieldLimit = {
		_id: 1,
		title: 1,
		content: 1,
		category: 1,
		author: 1,
		tags: 1,
		views: 1,
		createdAt: 1,
		updatedAt: 1,
	}
	const postFieldLimit = {
		_id: 1,
		content: 1,
		author: 1,
		thread: 1,
		parentPost: 1,
		likes: 1,
		likesCount: 1,
		createdAt: 1,
		updatedAt: 1,
	}

	const thread = await ThreadModel.findById(id)
		.populate({
			path: 'author',
			select: '_id picture name role isVerified',
		})
		.select(threadFieldLimit)

	// Fetch all posts for this thread
	const matchedPosts = await PostModel.find({ thread: id })
		.populate({
			path: 'author',
			select: '_id picture name role isVerified',
		})
		.select(postFieldLimit)
		.lean()

	// Map to store posts by their ID
	const postMap = new Map<string, any>()

	// Initialize all posts in the map
	matchedPosts.forEach((post) => {
		;(post as any).replies = []
		postMap.set(post._id.toString(), post)
	})

	// Array to hold top-level posts
	const nestedPosts: any[] = []

	// Build the nested structure
	matchedPosts.forEach((post) => {
		if (post.parentPost) {
			const parent = postMap.get(post.parentPost.toString())
			if (parent) {
				parent.replies.push(post)
			}
		} else {
			// Top-level post
			nestedPosts.push(post)
		}
	})
	const data = { thread, threadPost: nestedPosts }
	// console.log(data)
	return data
}

const updateSingleThreadIntoDB = async (
	id: string,
	payload: Partial<IThread>,
) => {
	// Validate ObjectId
	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw new AppError(StatusCode.BAD_REQUEST, 'Invalid Thread ID')
	}

	const updatedThread = await ThreadModel.findByIdAndUpdate(
		id,
		{ $set: payload },
		{ new: true, runValidators: true },
	)

	if (!updatedThread) {
		throw new AppError(StatusCode.NOT_FOUND, 'Thread not found')
	}

	return updatedThread
}

export const deleteThreadByIDFromDB = async (id: string) => {
	// Validate ObjectId
	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw new AppError(StatusCode.BAD_REQUEST, 'Invalid Thread ID')
	}

	const deletedThread = await ThreadModel.findByIdAndDelete(id)

	if (!deletedThread) {
		throw new AppError(StatusCode.NOT_FOUND, 'Thread not found')
	}

	return deletedThread
}

export const ThreadServices = {
	createThreadIntoDB,
	getAllThreadsFromDB,
	getSingleThreadFromDB,
	updateSingleThreadIntoDB,
	deleteThreadByIDFromDB,
}
