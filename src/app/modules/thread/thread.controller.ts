import catchAsync from '../../utils/catchAsync'
import { NextFunction, Request, Response } from 'express'
import sendResponse from '../../utils/sendResponse'
import { ThreadServices } from './thread.service'
import StatusCode from '../../utils/StatusCode'
const createThread = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const result = await ThreadServices.createThreadIntoDB(req.body)
		sendResponse(res, {
			success: true,
			statusCode: StatusCode.CREATED,
			message: 'Thread created successfully',
			data: result,
		})
	},
)
const getAllThreads = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const result = await ThreadServices.getAllThreadsFromDB(
			req.query as Record<string, string>,
		)
		sendResponse(res, {
			success: true,
			statusCode: StatusCode.OK,
			message: 'All Threads Retrieved successfully',
			data: result.data,
			meta: result.meta,
		})
	},
)
const getSingleThread = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const result = await ThreadServices.getSingleThreadFromDB(
			req.params.id as string,
		)
		sendResponse(res, {
			success: true,
			statusCode: StatusCode.OK,
			message: 'Thread Info Retrieved successfully',
			data: result,
		})
	},
)
const updateSingleThread = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const threadId = req.params.id as string
		const payload = req.body

		const updatedThread = await ThreadServices.updateSingleThreadIntoDB(
			threadId,
			payload,
		)

		sendResponse(res, {
			success: true,
			statusCode: StatusCode.OK,
			message: 'Thread updated successfully',
			data: updatedThread,
		})
	},
)
const deleteThreadByID = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const threadId = req.params.id

		const deletedThread = await ThreadServices.deleteThreadByIDFromDB(threadId)

		sendResponse(res, {
			success: true,
			statusCode: StatusCode.OK,
			message: 'Thread deleted successfully',
			data: deletedThread,
		})
	},
)

export const ThreadController = {
	createThread,
	getAllThreads,
	getSingleThread,
	updateSingleThread,
	deleteThreadByID,
}
