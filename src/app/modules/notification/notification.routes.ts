import { Router } from 'express'
import { NotificationController } from './notification.controller'
import checkAuth from '../../middlewares/checkAuth'
import { Role } from '../user/user.interface'

const router = Router()

router.get(
	'/',
	checkAuth(...Object.values(Role)),
	NotificationController.getUserNotifications,
)

router.get(
	'/unread-count',
	checkAuth(...Object.values(Role)),
	NotificationController.getUnreadCount,
)

router.put(
	'/read',
	checkAuth(...Object.values(Role)),
	NotificationController.markAsRead,
)

router.put(
	'/read-all',
	checkAuth(...Object.values(Role)),
	NotificationController.markAllAsRead,
)

router.delete(
	'/:id',
	checkAuth(...Object.values(Role)),
	NotificationController.deleteNotification,
)

export const NotificationRoutes = router
