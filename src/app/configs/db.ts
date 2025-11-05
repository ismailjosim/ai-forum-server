/* eslint-disable no-console */
import mongoose from 'mongoose'

import 'colors'
import { envVars } from './env'

const connectDB = async () => {
	try {
		await mongoose.connect(envVars.DATABASE_URL)
		console.log('Database Connected successfully'.bgBlue.bold)
	} catch (error) {
		console.log(`Failed to connect to database: ${error}`.bgRed.bold)
		process.exit(1)
	}
}

export default connectDB
