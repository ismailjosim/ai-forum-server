import httpStatus from 'http-status-codes'
import { JwtPayload } from 'jsonwebtoken'

import { IsActive, IUser } from '../modules/user/user.interface'
import { generateToken, verifyToken } from './jwt'
import { UserModel } from '../modules/user/user.model'
import { envVars } from '../configs/env'
import AppError from '../helpers/AppError'

// create access token and user token with user info
export const createUserToken = (user: Partial<IUser>) => {
	// 🧾 Payload for token
	const tokenPayload = {
		userId: user._id,
		email: user.email,
		role: user.role,
	}

	// 🔑 Generate access token
	const accessToken = generateToken(
		tokenPayload,
		envVars.JWT_ACCESS_SECRET,
		envVars.JWT_ACCESS_EXPIRES,
	)

	// 🔄 Generate refresh token
	const refreshToken = generateToken(
		tokenPayload,
		envVars.REFRESH_TOKEN_SECRET,
		envVars.REFRESH_TOKEN_EXPIRES,
	)

	return { accessToken, refreshToken }
}

export const createNewAccessTokenWithRefreshToken = async (
	ParamsRefreshToken: string,
) => {
	const verifyRefreshToken = verifyToken(
		ParamsRefreshToken,
		envVars.REFRESH_TOKEN_SECRET,
	) as JwtPayload

	// ✅ Check if user exists
	const isUserExist = await UserModel.findOne({
		email: verifyRefreshToken.email,
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

	// 🧾 Payload for token
	const tokenPayload = {
		userId: isUserExist._id,
		email: isUserExist.email,
		role: isUserExist.role,
	}

	// 🔑 Generate access token
	const accessToken = generateToken(
		tokenPayload,
		envVars.JWT_ACCESS_SECRET,
		envVars.JWT_ACCESS_EXPIRES,
	)

	return accessToken
}
