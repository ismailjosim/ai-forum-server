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
router.get('/', ThreadController.getAllThreads)
router.get('/:id', ThreadController.getSingleThread)
router.patch('/:id', ThreadController.updateSingleThread)
router.delete('/:id', ThreadController.deleteThreadByID)

export const ThreadRoutes = router
