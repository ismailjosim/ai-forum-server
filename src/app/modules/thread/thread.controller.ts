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
		const result = await ThreadServices.getAllThreadsFromDB(req.body)
		sendResponse(res, {
			success: true,
			statusCode: StatusCode.OK,
			message: 'All Threads Retrieved successfully',
			data: result,
		})
	},
)

export const ThreadController = {
	createThread,
	getAllThreads,
}
