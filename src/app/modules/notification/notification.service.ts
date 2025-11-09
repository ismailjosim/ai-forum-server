import { Types } from 'mongoose'
import { getIO } from '../../configs/socket.config'
import { INotification } from './notification.interface'
import { NotificationModel } from './notification.model'

// Create notification and emit via socket
const createNotification = async (payload: Partial<INotification>) => {
	try {
		const notification = await NotificationModel.create(payload)
		await notification.populate('triggeredBy', 'name picture')

		const io = getIO()
		io.to(`user:${notification.userId}`).emit('notification:new', {
			_id: notification._id,
			type: notification.type,
			title: notification.title,
			message: notification.message,
			threadId: notification.threadId,
			postId: notification.postId,
			triggeredBy: notification.triggeredBy,
			isRead: false,
			createdAt: notification.createdAt,
		})

		console.log(`✅ Notification sent to user:${notification.userId}`)

		return notification
	} catch (error) {
		console.error('❌ Error creating notification:', error)
		throw error
	}
}

// Get user notifications with pagination
const getUserNotifications = async (
	userId: string,
	skip: number = 0,
	limit: number = 20,
	unreadOnly: boolean = false,
) => {
	if (!Types.ObjectId.isValid(userId)) {
		throw new Error('Invalid user ID')
	}

	const query: any = { userId }
	if (unreadOnly) {
		query.isRead = false
	}

	const notifications = await NotificationModel.find(query)
		.sort({ createdAt: -1 })
		.skip(skip)
		.limit(limit)
		.populate('triggeredBy', 'name picture')
		.populate('threadId', 'title')
		.lean()

	const unreadCount = await NotificationModel.countDocuments({
		userId,
		isRead: false,
	})

	return { notifications, unreadCount }
}

// Get unread count only
const getUnreadCount = async (userId: string) => {
	if (!Types.ObjectId.isValid(userId)) {
		throw new Error('Invalid user ID')
	}

	const count = await NotificationModel.countDocuments({
		userId,
		isRead: false,
	})

	return count
}

// Mark notifications as read
const markAsRead = async (userId: string, notificationIds: string[]) => {
	if (!Types.ObjectId.isValid(userId)) {
		throw new Error('Invalid user ID')
	}

	const validIds = notificationIds.filter((id) => Types.ObjectId.isValid(id))

	await NotificationModel.updateMany(
		{
			_id: { $in: validIds },
			userId,
		},
		{ $set: { isRead: true } },
	)

	// Emit socket event
	const io = getIO()
	io.to(`user:${userId}`).emit('notification:marked_read', validIds)

	return { success: true }
}

// Mark all as read
const markAllAsRead = async (userId: string) => {
	if (!Types.ObjectId.isValid(userId)) {
		throw new Error('Invalid user ID')
	}

	await NotificationModel.updateMany(
		{ userId, isRead: false },
		{ $set: { isRead: true } },
	)

	// Emit socket event
	const io = getIO()
	io.to(`user:${userId}`).emit('notification:all_marked_read')

	return { success: true }
}

// Delete notification
const deleteNotification = async (userId: string, notificationId: string) => {
	if (
		!Types.ObjectId.isValid(userId) ||
		!Types.ObjectId.isValid(notificationId)
	) {
		throw new Error('Invalid ID')
	}

	const notification = await NotificationModel.findOneAndDelete({
		_id: notificationId,
		userId,
	})

	if (!notification) {
		throw new Error('Notification not found')
	}

	// Emit socket event
	const io = getIO()
	io.to(`user:${userId}`).emit('notification:deleted', notificationId)

	return notification
}

// Helper: Extract mentions from content (@username)
const extractMentions = (content: string): string[] => {
	const mentionRegex = /@(\w+)/g
	const mentions: string[] = []
	let match

	while ((match = mentionRegex.exec(content)) !== null) {
		mentions.push(match[1])
	}

	return [...new Set(mentions)]
}

export const NotificationServices = {
	createNotification,
	getUserNotifications,
	getUnreadCount,
	markAsRead,
	markAllAsRead,
	deleteNotification,
	extractMentions,
}
