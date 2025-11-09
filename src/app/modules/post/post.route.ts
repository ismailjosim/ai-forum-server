import { Router } from 'express'
import { PostController } from './post.controller'

const router = Router()

router.post('/create-post', PostController.createPost)
router.get('/', PostController.getAllPosts)
router.get('/:id', PostController.getSinglePost)
router.patch('/:id', PostController.updatePost)
router.delete('/:id', PostController.deletePost)
router.post('/:id/like', PostController.likePost)
export const PostRoutes = router
