import { Router, Request, Response } from 'express'
import axios from 'axios'

export const nutritionRouter = Router()

const NUTRITIONIX_BASE = 'https://trackapi.nutritionix.com/v2'

const nutritionixHeaders = {
  'x-app-id': process.env.NUTRITIONIX_APP_ID,
  'x-app-key': process.env.NUTRITIONIX_API_KEY,
}

// GET /api/nutrition/search?q=chicken+breast
nutritionRouter.get('/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string
    if (!query) return res.status(400).json({ error: 'Query param q is required' })

    const response = await axios.get(`${NUTRITIONIX_BASE}/search/instant`, {
      params: { query },
      headers: nutritionixHeaders,
    })

    const items = response.data.common?.slice(0, 10).map((item: any) => ({
      name: item.food_name,
      thumbnail: item.photo?.thumb,
      servingUnit: item.serving_unit,
    }))

    res.json({ items })
  } catch (err) {
    res.status(500).json({ error: 'Nutrition search failed' })
  }
})

// POST /api/nutrition/lookup — get detailed macros for a food
nutritionRouter.post('/lookup', async (req: Request, res: Response) => {
  try {
    const { query } = req.body
    if (!query) return res.status(400).json({ error: 'Body param query is required' })

    const response = await axios.post(
      `${NUTRITIONIX_BASE}/natural/nutrients`,
      { query },
      { headers: { ...nutritionixHeaders, 'Content-Type': 'application/json' } }
    )

    const foods = response.data.foods?.map((f: any) => ({
      name: f.food_name,
      calories: Math.round(f.nf_calories),
      protein: Math.round(f.nf_protein),
      carbs: Math.round(f.nf_total_carbohydrate),
      fats: Math.round(f.nf_total_fat),
      servingQty: f.serving_qty,
      servingUnit: f.serving_unit,
    }))

    res.json({ foods })
  } catch (err) {
    res.status(500).json({ error: 'Nutrition lookup failed' })
  }
})
