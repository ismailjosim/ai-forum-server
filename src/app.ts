import express, { Application, Response } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import http from 'http'
import { envVars } from './app/configs/env'
import router from './routes'
import notFound from './app/middlewares/notFound'
import { globalErrorHandler } from './app/middlewares/globalErrorHandler'
import { initializeSocket } from './app/configs/socket.config'

const app: Application = express()
const server = http.createServer(app)

// parsers
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(
	cors({
		origin:
			envVars.NODE_ENV === 'production'
				? [envVars.FRONTEND_URL, /https:\/\/.*\.vercel\.app$/]
				: ['http://localhost:3000'],
		credentials: true,
	}),
)

initializeSocket(server)

//* Health Check Route (Important for Render)
app.get('/health', async (_, res: Response) => {
	res.status(200).json({
		success: true,
		message: 'Server is healthy',
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
	})
})

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

export default server
