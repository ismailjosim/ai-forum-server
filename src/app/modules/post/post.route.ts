import { Router } from 'express'
import { PostController } from './post.controller'
import checkAuth from '../../middlewares/checkAuth'
import { Role } from '../user/user.interface'

const router = Router()

router.post(
	'/create-post',
	checkAuth(...Object.values(Role)),
	PostController.createPost,
)
router.get('/', checkAuth(...Object.values(Role)), PostController.getAllPosts)
router.get(
	'/:id',
	checkAuth(...Object.values(Role)),
	PostController.getSinglePost,
)
router.patch(
	'/:id',
	checkAuth(...Object.values(Role)),
	PostController.updatePost,
)
router.delete(
	'/:id',
	checkAuth(...Object.values(Role)),
	PostController.deletePost,
)
router.post(
	'/:id/like',
	checkAuth(...Object.values(Role)),
	PostController.likePost,
)
export const PostRoutes = router
