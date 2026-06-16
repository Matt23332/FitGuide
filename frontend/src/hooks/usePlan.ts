import { useFitGuideStore } from '@/store/fitguide.store'

const API_URL = import.meta.env.VITE_API_URL || ''

export function usePlanGenerator() {
  const { profile, setGenerating, setPlan, setError } = useFitGuideStore()

  const generatePlan = async () => {
    setGenerating(true)
    setError(null)

    try {
      const res = await fetch(`${API_URL}/api/plan/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to generate plan')
      }

      const data = await res.json()
      setPlan(data.plan)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setGenerating(false)
    }
  }

  return { generatePlan }
}

export function useAICoach() {
  const { profile } = useFitGuideStore()

  const sendMessage = async (
    message: string,
    history: { role: 'user' | 'assistant'; content: string }[]
  ) => {
    const res = await fetch(`${API_URL}/api/coach/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, profile }),
    })

    if (!res.ok) throw new Error('Coach request failed')

    // Stream the response
    const reader = res.body?.getReader()
    const decoder = new TextDecoder()

    return { reader, decoder }
  }

  return { sendMessage }
}
