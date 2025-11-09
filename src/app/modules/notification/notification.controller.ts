import { NextFunction, Request, Response } from 'express'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import StatusCode from '../../utils/StatusCode'
import { NotificationServices } from './notification.service'

// Get user notifications
const getUserNotifications = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const userId = req.user?.userId
		const skip = parseInt(req.query.skip as string) || 0
		const limit = parseInt(req.query.limit as string) || 20
		const unreadOnly = req.query.unreadOnly === 'true'

		const result = await NotificationServices.getUserNotifications(
			userId,
			skip,
			limit,
			unreadOnly,
		)

		sendResponse(res, {
			success: true,
			statusCode: StatusCode.OK,
			message: 'Notifications fetched successfully',
			data: result,
		})
	},
)

// Get unread count
const getUnreadCount = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const userId = req.user?.userId

		const count = await NotificationServices.getUnreadCount(userId)

		sendResponse(res, {
			success: true,
			statusCode: StatusCode.OK,
			message: 'Unread count fetched successfully',
			data: { count },
		})
	},
)

// Mark notifications as read
const markAsRead = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const userId = req.user?.userId
		const { notificationIds } = req.body

		if (!Array.isArray(notificationIds)) {
			return sendResponse(res, {
				success: false,
				statusCode: StatusCode.BAD_REQUEST,
				message: 'notificationIds must be an array',
				data: null,
			})
		}

		await NotificationServices.markAsRead(userId, notificationIds)

		sendResponse(res, {
			success: true,
			statusCode: StatusCode.OK,
			message: 'Notifications marked as read',
			data: null,
		})
	},
)

// Mark all as read
const markAllAsRead = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const userId = req.user?.userId

		await NotificationServices.markAllAsRead(userId)

		sendResponse(res, {
			success: true,
			statusCode: StatusCode.OK,
			message: 'All notifications marked as read',
			data: null,
		})
	},
)

const deleteNotification = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const userId = req.user?.userId
		const notificationId = req.params.id

		await NotificationServices.deleteNotification(userId, notificationId)

		sendResponse(res, {
			success: true,
			statusCode: StatusCode.OK,
			message: 'Notification deleted successfully',
			data: null,
		})
	},
)

export const NotificationController = {
	getUserNotifications,
	getUnreadCount,
	markAsRead,
	markAllAsRead,
	deleteNotification,
}
