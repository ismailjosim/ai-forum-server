import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { envVars } from './env'

let io: SocketIOServer | null = null

export const initializeSocket = (server: HTTPServer) => {
	io = new SocketIOServer(server, {
		cors: {
			origin:
				envVars.NODE_ENV === 'production'
					? [envVars.FRONTEND_URL || '', /https:\/\/.*\.vercel\.app$/]
					: ['http://localhost:3000'],
			methods: ['GET', 'POST'],
			credentials: true,
		},
		transports: ['websocket', 'polling'],
		pingTimeout: 60000,
		pingInterval: 25000,
	})

	io.on('connection', (socket) => {
		console.log('User connected:', socket.id)

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
			console.log('User disconnected:', socket.id)
		})
	})

	return io
}

export const getIO = (): SocketIOServer => {
	if (!io) {
		throw new Error('Socket.io not initialized!')
	}
	return io
}
