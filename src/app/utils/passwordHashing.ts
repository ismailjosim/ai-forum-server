import bcrypt from 'bcryptjs'
import { envVars } from '../configs/env'

const passwordHashing = async (password: string) => {
	const hashedPassword = await bcrypt.hash(
		password,
		Number(envVars.BCRYPT_SALT_ROUND),
	)

	return hashedPassword
}

export default passwordHashing
