import { Router } from 'express'
import { UserRoutes } from '../app/modules/user/user.route'
import { ThreadRoutes } from '../app/modules/thread/thread.routes'
import { PostRoutes } from '../app/modules/post/post.route'

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
	{
		path: '/post',
		route: PostRoutes,
	},
]

moduleRoutes.forEach(({ path, route }) => router.use(path, route))

export default router
