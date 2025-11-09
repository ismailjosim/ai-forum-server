import { getIO } from '../../configs/socket.config'
import { IPost } from './post.interface'
import { PostModel } from './post.model'
import { Types } from 'mongoose'
import { NotificationServices } from '../notification/notification.service'
import { UserModel } from '../user/user.model'
import { ThreadModel } from '../thread/thread.model'

const createPostIntoDB = async (payload: Partial<IPost>) => {
	if (!payload.depth) payload.depth = payload.parentPost ? 1 : 0

	const post = await PostModel.create(payload)
	await post.populate('author', 'name picture isVerified role')

	try {
		const io = getIO()

		// Emit to thread room for real-time post updates
		io.to(`post-${post.thread}`).emit('new-comment', {
			postId: post.thread,
			comment: post,
		})

		console.log(`📤 Emitted new-comment to post-${post.thread}`)

		// Send notifications asynchronously
		await handlePostNotifications(post)
	} catch (error) {
		console.log('Socket emit failed:', error)
	}

	return post
}

// Handle all post-related notifications
const handlePostNotifications = async (post: any) => {
	try {
		// Get thread details
		const thread = await ThreadModel.findById(post.thread).select(
			'title author',
		)
		if (!thread) return

		const postAuthor = await UserModel.findById(post.author).select('name')
		if (!postAuthor) return

		// 1. Notify thread owner about new reply (if not self-reply)
		if (
			thread.author.toString() !== post.author.toString() &&
			(!post.parentPost || post.depth === 0)
		) {
			await NotificationServices.createNotification({
				userId: thread.author,
				type: 'reply',
				title: `New reply in "${thread.title}"`,
				message: `${postAuthor.name} replied to your thread`,
				threadId: thread._id,
				postId: post._id,
				triggeredBy: post.author,
			})
		}

		// 2. Notify parent post author if it's a nested reply
		if (post.parentPost && post.depth > 0) {
			const parentPost = await PostModel.findById(post.parentPost).select(
				'author',
			)
			if (
				parentPost &&
				parentPost.author.toString() !== post.author.toString()
			) {
				await NotificationServices.createNotification({
					userId: parentPost.author,
					type: 'reply',
					title: 'New reply to your comment',
					message: `${postAuthor.name} replied to your comment in "${thread.title}"`,
					threadId: thread._id,
					postId: post._id,
					triggeredBy: post.author,
				})
			}
		}

		// 3. Handle mentions (@username)
		if (post.content) {
			const mentions = NotificationServices.extractMentions(post.content)

			for (const username of mentions) {
				const mentionedUser = await UserModel.findOne({ username }).select(
					'_id',
				)

				if (
					mentionedUser &&
					mentionedUser._id.toString() !== post.author.toString()
				) {
					await NotificationServices.createNotification({
						userId: mentionedUser._id,
						type: 'mention',
						title: `You were mentioned in "${thread.title}"`,
						message: `${postAuthor.name} mentioned you in a comment`,
						threadId: thread._id,
						postId: post._id,
						triggeredBy: post.author,
					})
				}
			}
		}
	} catch (error) {
		console.error('❌ Error sending notifications:', error)
	}
}

// Add like notification handler
const likePost = async (postId: string, userId: string) => {
	if (!Types.ObjectId.isValid(postId) || !Types.ObjectId.isValid(userId)) {
		throw new Error('Invalid ID')
	}

	const post = await PostModel.findById(postId)
	if (!post) throw new Error('Post not found')

	// Check if already liked
	const isAlreadyLiked = post.likes?.some(
		(likeId) => likeId.toString() === userId,
	)

	if (isAlreadyLiked) {
		// Unlike
		await PostModel.findByIdAndUpdate(postId, {
			$pull: { likes: userId },
			$inc: { likeCount: -1 },
		})
		return { action: 'unliked' }
	} else {
		// Like
		await PostModel.findByIdAndUpdate(postId, {
			$addToSet: { likes: userId },
			$inc: { likeCount: 1 },
		})

		// Send notification to post author (if not self-like)
		if (post.author.toString() !== userId) {
			const liker = await UserModel.findById(userId).select('name')

			await NotificationServices.createNotification({
				userId: post.author,
				type: 'like',
				title: `${liker?.name} liked your post`,
				threadId: post.thread,
				postId: post._id,
				triggeredBy: new Types.ObjectId(userId),
			})
		}

		return { action: 'liked' }
	}
}

const getAllPostsFromDB = async () => {
	const posts = await PostModel.find()
	return posts
}

const getSinglePostFromDB = async (id: string) => {
	if (!Types.ObjectId.isValid(id)) throw new Error('Invalid post ID')
	const post = await PostModel.findById(id)
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
	likePost,
}
