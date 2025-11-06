import { NextFunction, Request, Response } from 'express'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import StatusCode from '../../utils/StatusCode'
import { PostServices } from './post.services'

// Create Post
const createPost = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const post = await PostServices.createPostIntoDB(req.body)

		sendResponse(res, {
			success: true,
			statusCode: StatusCode.CREATED,
			message: 'Post created successfully',
			data: post,
		})
	},
)

// Get all posts
const getAllPosts = catchAsync(
	async (_req: Request, res: Response, next: NextFunction) => {
		const posts = await PostServices.getAllPostsFromDB()

		sendResponse(res, {
			success: true,
			statusCode: StatusCode.OK,
			message: 'Posts fetched successfully',
			data: posts,
		})
	},
)

// Get single post
const getSinglePost = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const post = await PostServices.getSinglePostFromDB(req.params.id)

		sendResponse(res, {
			success: true,
			statusCode: StatusCode.OK,
			message: 'Post fetched successfully',
			data: post,
		})
	},
)

// Update post
const updatePost = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const post = await PostServices.updatePostInDB(req.params.id, req.body)

		sendResponse(res, {
			success: true,
			statusCode: StatusCode.OK,
			message: 'Post updated successfully',
			data: post,
		})
	},
)

// Delete post (soft delete)
const deletePost = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const deletedPost = await PostServices.deletePostFromDB(
			req.params.id,
			req.body.deletedBy,
		)

		sendResponse(res, {
			success: true,
			statusCode: StatusCode.OK,
			message: 'Post deleted successfully',
			data: deletedPost,
		})
	},
)

export const PostController = {
	createPost,
	getAllPosts,
	getSinglePost,
	updatePost,
	deletePost,
}
