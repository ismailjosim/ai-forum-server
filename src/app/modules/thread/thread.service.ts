import mongoose from 'mongoose'
import { ThreadModel } from './thread.model'
import { IThread } from './thread.interface'

import StatusCode from '../../utils/StatusCode'
import AppError from '../../helpers/AppError'
import { UserModel } from '../user/user.model'

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

const getAllThreadsFromDB = async () => {
	return null
}

export const ThreadServices = {
	createThreadIntoDB,
	getAllThreadsFromDB,
}
