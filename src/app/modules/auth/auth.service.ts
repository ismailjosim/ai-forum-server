import {
	createNewAccessTokenWithRefreshToken,
	createUserToken,
} from '../../utils/userTokens'
import { UserModel } from '../user/user.model'
import AppError from '../../helpers/AppError'
import StatusCode from '../../utils/StatusCode'
import { passwordManage } from '../../utils/passwordHashing'
import { JwtPayload } from 'jsonwebtoken'

const loginIntoDB = async (payload: { email: string; password: string }) => {
	const user = await UserModel.findOne({
		email: payload.email,
	})

	if (!user) {
		throw new AppError(StatusCode.BAD_REQUEST, 'This user is not found')
	}

	// check password
	const isPassCorrect = await passwordManage.checkingPassword(
		payload.password,
		user?.password as string,
	)

	if (!isPassCorrect) {
		throw new AppError(
			StatusCode.BAD_REQUEST,
			'Email or password does not match',
		)
	}
	const userWithoutPassword = user.toObject()
	delete userWithoutPassword.password
	const { accessToken, refreshToken } = await createUserToken(user)

	return {
		accessToken,
		refreshToken,
		user: userWithoutPassword,
	}
}

const refreshTokenFromDB = async (refreshToken: string) => {
	const accessToken = await createNewAccessTokenWithRefreshToken(refreshToken)
	return { accessToken }
}

const changePasswordIntoDB = async (
	oldPassword: string,
	newPassword: string,
	decodedToken: JwtPayload,
) => {
	console.log(decodedToken)
	const user = await UserModel.findById(decodedToken.userId)
	const isOldPasswordMatch = await passwordManage.checkingPassword(
		oldPassword,
		user!.password as string,
	)
	if (!isOldPasswordMatch) {
		throw new AppError(StatusCode.UNAUTHORIZED, "Old Password doesn't match")
	}
	// check the old password and new password are same
	if (oldPassword === newPassword) {
		throw new AppError(
			StatusCode.BAD_REQUEST,
			'New Password must be different from Old Password',
		)
	}
	// password can't be incudes user email
	if (newPassword.includes(user!.email)) {
		throw new AppError(
			StatusCode.BAD_REQUEST,
			'Password can not includes user email',
		)
	}

	user!.password = await passwordManage.passwordHashing(newPassword)
	await user!.save()
}

export const AuthServices = {
	loginIntoDB,
	refreshTokenFromDB,
	changePasswordIntoDB,
}
