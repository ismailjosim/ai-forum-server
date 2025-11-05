import httpStatus from 'http-status-codes'
import { NextFunction, Request, Response } from 'express'

import { verifyToken } from '../utils/jwt'

import { JwtPayload } from 'jsonwebtoken'
import { UserModel } from '../modules/user/user.model'
import { IsActive } from '../modules/user/user.interface'
import AppError from '../helpers/AppError'
import { envVars } from '../configs/env'

const checkAuth =
	(...authRoles: string[]) =>
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const accessToken = req.headers.authorization || req.cookies.accessToken

			if (!accessToken) {
				throw new AppError(httpStatus.BAD_REQUEST, 'Token not received')
			}

			const tokenVerification = verifyToken(
				accessToken,
				envVars.JWT_ACCESS_SECRET,
			) as JwtPayload

			// ✅ Check if user exists
			const isUserExist = await UserModel.findOne({
				email: tokenVerification.email,
			})
			if (!isUserExist) {
				throw new AppError(httpStatus.BAD_REQUEST, "This user doesn't exist")
			}
			if (
				isUserExist.isActive === IsActive.BLOCKED ||
				isUserExist.isActive === IsActive.INACTIVE
			) {
				throw new AppError(
					httpStatus.BAD_REQUEST,
					`User is ${isUserExist.isActive}`,
				)
			}
			if (isUserExist.isDeleted) {
				throw new AppError(httpStatus.BAD_REQUEST, 'user is removed')
			}

			if (!isUserExist.isVerified) {
				throw new AppError(httpStatus.BAD_REQUEST, 'user is not verified')
			}

			if (!authRoles.includes(tokenVerification.role)) {
				throw new AppError(httpStatus.FORBIDDEN, 'Access Denied')
			}
			req.user = tokenVerification
			next()
		} catch (error) {
			next(error)
		}
	}

export default checkAuth
