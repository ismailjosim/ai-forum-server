/* eslint-disable no-console */
import server from './app' // Import the HTTP server, not just the Express app
import connectDB from './app/configs/db'
import { Server } from 'http'
import { envVars } from './app/configs/env'

let httpServer: Server

// Graceful shutdown logic reused in all error signals
const gracefulShutdown = (reason: string, error?: unknown) => {
	console.error(`\n${reason}`)
	if (error) {
		console.error('Error:', error)
	}
	if (httpServer) {
		httpServer.close(() => {
			console.log('🔴 Server closed gracefully.')
			process.exit(1)
		})
	} else {
		process.exit(1)
	}
}

const cleanExit = (signal: string) => {
	console.log(`\n🟡 ${signal} received. Shutting down gracefully...`)
	if (httpServer) {
		httpServer.close(() => {
			console.log('🟢 Server closed cleanly.')
			process.exit(0)
		})
	} else {
		process.exit(0)
	}
}

async function startServer() {
	try {
		await connectDB()
		// Use the HTTP server (which has Socket.IO attached) instead of app.listen()
		httpServer = server.listen(envVars.PORT, () => {
			console.log(`Server running on port: ${envVars.PORT}`.bgMagenta.bold)
			console.log('✅ Socket.IO initialized and ready')
		})
	} catch (error) {
		gracefulShutdown('❌ Failed to connect to database or start server', error)
	}
}
startServer()

// Unhandled Promise Rejection
process.on('unhandledRejection', (reason) => {
	gracefulShutdown('❌ Unhandled Rejection Detected. Shutting down...', reason)
})

// Uncaught Exception
process.on('uncaughtException', (error) => {
	gracefulShutdown('❌ Uncaught Exception Detected. Shutting down...', error)
})

// Signal Termination (e.g., Docker, Heroku, PM2)
process.on('SIGTERM', () => cleanExit('SIGTERM'))
process.on('SIGINT', () => cleanExit('SIGINT'))
