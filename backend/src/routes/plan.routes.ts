import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { generateFitnessPlan } from '../services/ai.service'
import { prisma } from '../lib/prisma'

export const planRouter = Router()

const ProfileSchema = z.object({
  profile: z.object({
    age: z.number().min(10).max(100),
    weight: z.number().min(20).max(400),
    height: z.number().min(100).max(250),
    gender: z.string(),
    occupation: z.string().optional(),
    goal: z.string(),
    medicalConditions: z.string().optional(),
    workouts: z.array(z.string()),
    preferredTime: z.string().optional(),
    diet: z.string(),
    allergies: z.string().optional(),
    daysPerWeek: z.number().min(1).max(7),
    sessionDuration: z.string(),
    experienceLevel: z.string(),
  }),
  userId: z.string().optional(),
})

// POST /api/plan/generate
planRouter.post('/generate', async (req: Request, res: Response) => {
  try {
    const { profile, userId } = ProfileSchema.parse(req.body)

    const plan = await generateFitnessPlan(profile)

    // Optionally persist if user is authenticated
    if (userId) {
      await prisma.plan.create({
        data: {
          userId,
          calories: plan.calories,
          protein: plan.protein,
          carbs: plan.carbs,
          fats: plan.fats,
          bmi: plan.bmi,
          bmiCategory: plan.bmiCategory,
          workoutPlan: plan.weeklyWorkouts,
          mealPlan: plan.mealPlan,
          coachNote: plan.coachNote,
        },
      })
    }

    res.json({ plan, generatedAt: new Date().toISOString() })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid profile data', details: err.errors })
    }
    console.error('Plan generation error:', err)
    res.status(500).json({ error: 'Failed to generate plan. Please try again.' })
  }
})

// GET /api/plan/:userId — fetch saved plan
planRouter.get('/:userId', async (req: Request, res: Response) => {
  try {
    const plan = await prisma.plan.findFirst({
      where: { userId: req.params.userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    })

    if (!plan) return res.status(404).json({ error: 'No plan found' })
    res.json(plan)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch plan' })
  }
})
