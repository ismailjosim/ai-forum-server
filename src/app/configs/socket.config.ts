import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { envVars } from './env'

let io: SocketIOServer | null = null

export const initializeSocket = (server: HTTPServer) => {
	io = new SocketIOServer(server, {
		cors: {
			origin: (origin, callback) => {
				// Allow all Vercel domains and localhost
				if (
					!origin ||
					origin.includes('vercel.app') ||
					origin.includes('localhost') ||
					origin === envVars.FRONTEND_URL
				) {
					callback(null, true)
				} else {
					callback(new Error('Not allowed by CORS'))
				}
			},
			methods: ['GET', 'POST'],
			credentials: true,
			allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
		},
		transports: ['websocket', 'polling'],
		pingTimeout: 60000,
		pingInterval: 25000,
		allowEIO3: true,
	})

	io.on('connection', (socket) => {
		console.log('✅ User connected:', socket.id)

		// Join a specific post room
		socket.on('join-post', (postId: string) => {
			socket.join(`post-${postId}`)
			console.log(`User ${socket.id} joined post-${postId}`)
		})

		// Leave a post room
		socket.on('leave-post', (postId: string) => {
			socket.leave(`post-${postId}`)
			console.log(`User ${socket.id} left post-${postId}`)
		})

		socket.on('disconnect', () => {
			console.log('❌ User disconnected:', socket.id)
		})
	})

	console.log('🔌 Socket.IO initialized')
	return io
}

export const getIO = (): SocketIOServer => {
	if (!io) {
		throw new Error('Socket.io not initialized!')
	}
	return io
}
