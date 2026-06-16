import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { streamCoachResponse } from '../services/ai.service'

export const coachRouter = Router()

const ChatSchema = z.object({
  message: z.string().min(1).max(1000),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).max(20),
  profile: z.any(),
})

// POST /api/coach/chat — streaming AI coach response
coachRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, history, profile } = ChatSchema.parse(req.body)

    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.setHeader('Transfer-Encoding', 'chunked')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('X-Accel-Buffering', 'no')

    const stream = await streamCoachResponse(message, history, profile)

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        res.write(event.delta.text)
      }
    }

    res.end()
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: 'Coach response failed' })
    }
  }
})
