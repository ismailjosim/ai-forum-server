import { Router } from 'express'
import validateSchema from '../../middlewares/validateRequest'
import { ThreadSchemaValidation } from './thread.validation'
import { ThreadController } from './thread.controller'
import checkAuth from '../../middlewares/checkAuth'
import { Role } from '../user/user.interface'

const router = Router()

router.post(
	'/create-thread',
	checkAuth(...Object.values(Role)),
	validateSchema(ThreadSchemaValidation.create),
	ThreadController.createThread,
)
router.get(
	'/',
	checkAuth(...Object.values(Role)),
	ThreadController.getAllThreads,
)
router.get(
	'/my-thread',
	checkAuth(...Object.values(Role)),
	ThreadController.getAllMyThreads,
)
router.get(
	'/:id',
	checkAuth(...Object.values(Role)),
	ThreadController.getSingleThread,
)
router.patch(
	'/:id',
	checkAuth(...Object.values(Role)),
	ThreadController.updateSingleThread,
)
router.delete(
	'/:id',
	checkAuth(...Object.values(Role)),
	ThreadController.deleteThreadByID,
)

export const ThreadRoutes = router
