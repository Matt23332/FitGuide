import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export const progressRouter = Router()

const ProgressSchema = z.object({
  userId: z.string(),
  weight: z.number().optional(),
  calories: z.number().optional(),
  workoutCompleted: z.boolean().optional(),
  workoutType: z.string().optional(),
  durationMinutes: z.number().optional(),
  notes: z.string().optional(),
})

// POST /api/progress — log an entry
progressRouter.post('/', async (req: Request, res: Response) => {
  try {
    const data = ProgressSchema.parse(req.body)
    const entry = await prisma.progress.create({ data })
    res.status(201).json(entry)
  } catch (err) {
    res.status(400).json({ error: 'Invalid progress data' })
  }
})

// GET /api/progress/:userId — last 30 days
progressRouter.get('/:userId', async (req: Request, res: Response) => {
  try {
    const since = new Date()
    since.setDate(since.getDate() - 30)

    const entries = await prisma.progress.findMany({
      where: {
        userId: req.params.userId,
        date: { gte: since },
      },
      orderBy: { date: 'asc' },
    })

    // Aggregate stats
    const workoutsCompleted = entries.filter(e => e.workoutCompleted).length
    const latestWeight = entries.filter(e => e.weight).pop()?.weight
    const avgCalories = entries.filter(e => e.calories).length
      ? Math.round(
          entries.filter(e => e.calories).reduce((s, e) => s + (e.calories || 0), 0) /
          entries.filter(e => e.calories).length
        )
      : null

    res.json({ entries, stats: { workoutsCompleted, latestWeight, avgCalories } })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch progress' })
  }
})
