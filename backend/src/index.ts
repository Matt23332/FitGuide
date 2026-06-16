import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

import { planRouter } from './routes/plan.routes'
import { coachRouter } from './routes/coach.routes'
import { nutritionRouter } from './routes/nutrition.routes'
import { progressRouter } from './routes/progress.routes'
import { errorHandler } from './middleware/error.middleware'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Security
app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))

// Rate limiting
app.use('/api/plan/generate', rateLimit({ windowMs: 60_000, max: 5, message: 'Too many plan requests' }))
app.use('/api/coach', rateLimit({ windowMs: 60_000, max: 20, message: 'Too many coach messages' }))

// Parsing
app.use(express.json({ limit: '10kb' }))

// Routes
app.use('/api/plan', planRouter)
app.use('/api/coach', coachRouter)
app.use('/api/nutrition', nutritionRouter)
app.use('/api/progress', progressRouter)

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

// Error handling
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`✅ FitGuide AI backend running on http://localhost:${PORT}`)
})

export default app
