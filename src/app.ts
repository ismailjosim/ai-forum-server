import express, { Application, Response } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import { envVars } from './app/configs/env'
import router from './routes'
import notFound from './app/middlewares/notFound'
import { globalErrorHandler } from './app/middlewares/globalErrorHandler'

const app: Application = express()

// parsers
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(
	cors({
		origin: envVars.FRONTEND_URL,
		credentials: true,
	}),
)

//* Application Routes
app.use('/api/v1', router)

//* Basic Route for testing
app.get('/', async (_, res: Response) => {
	res.send({
		success: true,
		message: 'Welcome to Ai Forum Server',
		data: null,
	})
})

app.use(globalErrorHandler)

// not found route
app.use(notFound)

export default app
