import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface UserProfile {
  age: number
  weight: number
  height: number
  gender: string
  occupation?: string
  goal: string
  medicalConditions?: string
  workouts: string[]
  preferredTime?: string
  diet: string
  allergies?: string
  daysPerWeek: number
  sessionDuration: string
  experienceLevel: string
}

function buildSystemPrompt(): string {
  return `You are FitGuide AI, an expert personal trainer and registered dietitian with 15+ years of experience. 
You create evidence-based, personalized fitness and nutrition plans.

RULES:
- Always account for medical conditions and adjust exercises/nutrition accordingly
- Never recommend anything that could worsen a stated medical condition
- Plans must be realistic for the user's lifestyle and occupation
- Always remind users to consult a doctor for medical concerns
- Responses must be structured JSON only — no prose, no markdown outside JSON strings

EXPERTISE:
- Exercise science, progressive overload, periodization
- Macronutrient optimization, meal timing, dietary restrictions
- Injury prevention and modification for medical conditions
- Circadian rhythm-aligned training for shift workers`
}

function buildPlanPrompt(profile: UserProfile): string {
  const bmi = profile.weight / ((profile.height / 100) ** 2)

  return `Generate a personalized fitness and nutrition plan for this user:

PROFILE:
- Age: ${profile.age}, Gender: ${profile.gender}
- Weight: ${profile.weight}kg, Height: ${profile.height}cm, BMI: ${bmi.toFixed(1)}
- Occupation: ${profile.occupation || 'Not specified'}
- Experience: ${profile.experienceLevel}

GOALS & HEALTH:
- Primary goal: ${profile.goal}
- Medical conditions: ${profile.medicalConditions || 'None'}
- Preferred workout time: ${profile.preferredTime || 'Flexible'}

WORKOUT PREFERENCES:
- Types: ${profile.workouts.join(', ')}
- Days per week: ${profile.daysPerWeek}
- Session length: ${profile.sessionDuration}

NUTRITION:
- Diet type: ${profile.diet}
- Allergies/dislikes: ${profile.allergies || 'None'}

Return ONLY this JSON structure (no other text):
{
  "calories": <number>,
  "protein": <grams>,
  "carbs": <grams>,
  "fats": <grams>,
  "bmi": <number>,
  "bmiCategory": "<Underweight|Normal|Overweight|Obese>",
  "weeklyWorkouts": [
    {
      "day": "<e.g. Monday & Wednesday>",
      "name": "<Workout name>",
      "type": "<strength|cardio|flexibility|mixed>",
      "exercises": [
        { "name": "<exercise>", "sets": <n>, "reps": "<e.g. 10-12>", "rest": "<e.g. 60s>" }
      ]
    }
  ],
  "mealPlan": {
    "breakfast": { "name": "<meal>", "description": "<ingredients>", "calories": <n> },
    "lunch": { "name": "<meal>", "description": "<ingredients>", "calories": <n> },
    "dinner": { "name": "<meal>", "description": "<ingredients>", "calories": <n> },
    "snacks": [{ "name": "<snack>", "description": "<description>", "calories": <n> }]
  },
  "coachNote": "<2-3 sentence personalized coaching insight referencing their specific situation>"
}`
}

export async function generateFitnessPlan(profile: UserProfile) {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: buildSystemPrompt(),
    messages: [{ role: 'user', content: buildPlanPrompt(profile) }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('AI returned invalid plan format')

  return JSON.parse(jsonMatch[0])
}

export async function streamCoachResponse(
  message: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  profile: UserProfile
) {
  const systemPrompt = `${buildSystemPrompt()}

The user's profile: age ${profile.age}, goal: ${profile.goal}, diet: ${profile.diet}, 
workouts: ${profile.workouts.join(', ')}, experience: ${profile.experienceLevel}.
Medical conditions: ${profile.medicalConditions || 'none'}.

Answer coaching questions in a warm, motivating but evidence-based tone. Keep responses concise (2-4 paragraphs max).`

  return client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 800,
    system: systemPrompt,
    messages: [
      ...history,
      { role: 'user', content: message },
    ],
  })
}
