import { Router } from 'express'
import { UserRoutes } from '../app/modules/user/user.route'
import { ThreadRoutes } from '../app/modules/thread/thread.routes'

export const router = Router()
const moduleRoutes = [
	{
		path: '/user',
		route: UserRoutes,
	},
	{
		path: '/thread',
		route: ThreadRoutes,
	},
]

moduleRoutes.forEach(({ path, route }) => router.use(path, route))

export default router
