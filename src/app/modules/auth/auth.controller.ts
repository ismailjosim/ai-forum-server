import { NextFunction, Request, Response } from 'express'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { AuthServices } from './auth.service'
import { setAuthCookie } from '../../utils/setCookie'
import { JwtPayload } from 'jsonwebtoken'
import StatusCode from '../../utils/StatusCode'
import AppError from '../../helpers/AppError'
import { envVars } from '../../configs/env'

const login = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const result = await AuthServices.loginIntoDB(req.body)

		setAuthCookie(res, {
			accessToken: result.accessToken,
			refreshToken: result.refreshToken,
		})

		sendResponse(res, {
			success: true,
			statusCode: StatusCode.OK,
			message: 'User logged in successfully',
			data: { ...result },
		})
	},
)

// user logout
const logout = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		// ❌ Clear access token cookie
		const isProduction = envVars.NODE_ENV === 'production'

		res.clearCookie('accessToken', {
			httpOnly: true,
			secure: isProduction, // ✅ Set to true in production (HTTPS)
			sameSite: isProduction ? 'none' : 'lax',
		})

		// ❌ Clear refresh token cookie
		res.clearCookie('refreshToken', {
			httpOnly: true,
			secure: isProduction,
			sameSite: isProduction ? 'none' : 'lax',
		})

		// ✅ Send logout confirmation
		sendResponse(res, {
			success: true,
			statusCode: StatusCode.CREATED,
			message: 'User Logged Out Successfully',
			data: null,
		})
	},
)

// getNewAccessToken
const refreshToken = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const refreshToken = req.body.refreshToken || req.cookies.refreshToken
		if (!refreshToken) {
			throw new AppError(StatusCode.BAD_REQUEST, 'No Refresh Token received')
		}

		const loginInfo = await AuthServices.refreshTokenFromDB(refreshToken)

		setAuthCookie(res, loginInfo)

		sendResponse(res, {
			success: true,
			statusCode: StatusCode.CREATED,
			message: 'New Access Token Generate successfully',
			data: {
				accessToken: loginInfo.accessToken,
			},
		})
	},
)

//* if a logged in your want to change password
const changePassword = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const newPassword = req.body.newPassword
		const oldPassword = req.body.oldPassword
		const decodedToken = req.user

		await AuthServices.changePasswordIntoDB(
			oldPassword,
			newPassword,
			decodedToken as JwtPayload,
		)

		sendResponse(res, {
			success: true,
			statusCode: StatusCode.OK,
			message: 'Password reset Successfully',
			data: null,
		})
	},
)

export const AuthControllers = {
	login,
	logout,
	refreshToken,
	changePassword,
}
