import { passwordManage } from './passwordHashing'
import { envVars } from '../configs/env'
import { IAuthProvider, Role } from '../modules/user/user.interface'
import { UserModel } from '../modules/user/user.model'

const seedSuperAdmin = async () => {
	try {
		const isSuperAdminExist = await UserModel.findOne({
			email: envVars.SUPER_ADMIN_EMAIL,
		})

		if (isSuperAdminExist) {
			if (envVars.NODE_ENV === 'development') {
				console.log('Super Admin already exist')
			}
			return
		}

		const hashedPassword = await passwordManage.passwordHashing(
			envVars.SUPER_ADMIN_PASS as string,
		)

		const authProvider: IAuthProvider = {
			provider: 'credentials',
			providerId: envVars.SUPER_ADMIN_EMAIL,
		}

		const payload = {
			name: 'Super Admin',
			role: Role.SUPER_ADMIN,
			email: envVars.SUPER_ADMIN_EMAIL,
			password: hashedPassword,
			auths: [authProvider],
			isVerified: true,
		}

		const superAdmin = await UserModel.create(payload)
		if (envVars.NODE_ENV === 'development') {
			console.log('Super Admin Created Successfully. Name: ', superAdmin.name)
		}
	} catch (error) {
		if (envVars.NODE_ENV === 'development') {
			console.log(error)
		}
	}
}

export default seedSuperAdmin
