import { getIO } from '../../configs/socket.config'
import { IPost } from './post.interface'
import { PostModel } from './post.model'
import { Types } from 'mongoose'

const createPostIntoDB = async (payload: Partial<IPost>) => {
	// If depth or parentPost is not provided, default to 0/null
	if (!payload.depth) payload.depth = payload.parentPost ? 1 : 0

	const post = await PostModel.create(payload)

	// Populate the author field before emitting
	await post.populate('author', 'name picture isVerified role')

	// emit socket event for new post
	try {
		const io = getIO()

		// Emit to the thread room (not parent post room)
		// This way all users viewing the thread get the update
		io.to(`post-${post.thread}`).emit('new-comment', {
			postId: post.thread,
			comment: post,
		})

		console.log(`📤 Emitted new-comment to post-${post.thread}`)
	} catch (error) {
		// Socket not initialized yet or error - continue without real-time
		console.log('Socket emit failed:', error)
	}

	return post
}

const getAllPostsFromDB = async () => {
	const posts = await PostModel.find()
	// .populate('author', 'name email')
	// .populate('thread')
	return posts
}

const getSinglePostFromDB = async (id: string) => {
	if (!Types.ObjectId.isValid(id)) throw new Error('Invalid post ID')
	const post = await PostModel.findById(id)
	// .populate('author', 'name email')
	// .populate('thread')
	// .populate('parentPost')
	return post
}

const updatePostInDB = async (id: string, payload: Partial<IPost>) => {
	if (!Types.ObjectId.isValid(id)) throw new Error('Invalid post ID')
	const updatedPost = await PostModel.findByIdAndUpdate(
		id,
		{ ...payload, isEdited: true, editedAt: new Date() },
		{ new: true },
	)
	return updatedPost
}

const deletePostFromDB = async (id: string, deletedBy: string) => {
	if (!Types.ObjectId.isValid(id)) throw new Error('Invalid post ID')
	const deletedPost = await PostModel.findByIdAndUpdate(
		id,
		{ isDeleted: true, deletedAt: new Date(), deletedBy },
		{ new: true },
	)
	return deletedPost
}

export const PostServices = {
	createPostIntoDB,
	getAllPostsFromDB,
	getSinglePostFromDB,
	updatePostInDB,
	deletePostFromDB,
}
