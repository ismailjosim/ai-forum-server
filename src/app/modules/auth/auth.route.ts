import { Router } from 'express'
import { AuthControllers } from './auth.controller'
import checkAuth from '../../middlewares/checkAuth'
import { Role } from '../user/user.interface'

const router = Router()

router.post('/login', AuthControllers.login)
router.post('/logout', AuthControllers.logout)
router.post('/refresh-token', AuthControllers.refreshToken)
router.post(
	'/change-password',
	checkAuth(...Object.values(Role)),
	AuthControllers.changePassword,
)

// router.post('/forget-password', AuthControllers.forgetPassword)
// router.post('/reset-password', AuthControllers.setPassword)

export const AuthRoutes = router
