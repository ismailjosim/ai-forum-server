import express, { Application, Response, Request, NextFunction } from 'express'
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

// CRITICAL: Manual CORS headers BEFORE cors middleware
app.use((req: Request, res: Response, next: NextFunction) => {
	const origin = req.headers.origin

	// Allow all Vercel domains and localhost
	if (
		origin &&
		(origin.includes('vercel.app') ||
			origin.includes('localhost') ||
			origin === envVars.FRONTEND_URL)
	) {
		res.setHeader('Access-Control-Allow-Origin', origin)
		res.setHeader('Access-Control-Allow-Credentials', 'true')
		res.setHeader(
			'Access-Control-Allow-Methods',
			'GET,POST,PUT,DELETE,PATCH,OPTIONS',
		)
		res.setHeader(
			'Access-Control-Allow-Headers',
			'Content-Type,Authorization,Cookie',
		)
	}

	// Handle preflight
	if (req.method === 'OPTIONS') {
		return res.sendStatus(200)
	}

	next()
})

// Additional CORS middleware
app.use(
	cors({
		origin: (origin, callback) => {
			// Allow requests with no origin (like mobile apps or curl)
			if (!origin) return callback(null, true)

			// Allow all Vercel domains
			if (
				origin.includes('vercel.app') ||
				origin.includes('localhost') ||
				origin === envVars.FRONTEND_URL
			) {
				callback(null, true)
			} else {
				callback(new Error('Not allowed by CORS'))
			}
		},
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
	}),
)

initializeSocket(server)

//* Health Check Route
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
