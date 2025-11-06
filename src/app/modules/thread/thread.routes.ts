import { Router } from 'express'
import validateSchema from '../../middlewares/validateRequest'
import { ThreadSchemaValidation } from './thread.validation'
import { ThreadController } from './thread.controller'

const router = Router()

router.post(
	'/create-thread',
	validateSchema(ThreadSchemaValidation.create),
	ThreadController.createThread,
)
router.post(
	'/',

	ThreadController.getAllThreads,
)

export const ThreadRoutes = router
