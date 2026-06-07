import express, { type Request, type Response, type NextFunction } from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { initDb } from './db.js'
import { initAuth, authMiddleware } from './routes/auth.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import contractRoutes from './routes/contracts.js'
import reminderRoutes from './routes/reminders.js'
import uploadRoutes from './routes/upload.js'
import backupRoutes from './routes/backup.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

initDb()
initAuth()

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

// Health check (public)
app.use('/api/health', (req: Request, res: Response, next: NextFunction): void => {
  res.status(200).json({ success: true, message: 'ok' })
})

// Auth routes - login and me are handled in authRoutes with their own auth checks
app.use('/api/auth', authRoutes)

// Protected API routes
app.use(authMiddleware)
app.use('/api/users', userRoutes)
app.use('/api/contracts', contractRoutes)
app.use('/api/reminders', reminderRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/backup', backupRoutes)

// Serve static frontend files in production
const distPath = path.join(__dirname, '..', 'dist')
app.use(express.static(distPath))

// Fallback to index.html for SPA routes
app.get('*', (req: Request, res: Response) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'))
  } else {
    res.status(404).json({ success: false, error: 'API not found' })
  }
})

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(error)
  res.status(500).json({ success: false, error: 'Server internal error' })
})

export default app
