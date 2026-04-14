import { Mistral } from '@mistralai/mistralai'

let _client: Mistral | null = null

export function getMistral(): Mistral {
  if (!_client) {
    const key = process.env.MISTRAL_API_KEY
    if (!key) throw new Error('MISTRAL_API_KEY not set')
    _client = new Mistral({ apiKey: key })
  }
  return _client
}

export function stripFences(raw: string): string {
  return raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()
}

export async function callMistral(
  model: string,
  system: string,
  messages: { role: 'user' | 'assistant'; content: string }[],
  temperature = 0.3,
  retries = 3
): Promise<string> {
  const client = getMistral()
  let lastErr: Error | null = null

  for (let i = 0; i < retries; i++) {
    try {
      const res = await client.chat.complete({
        model,
        temperature,
        messages: [{ role: 'system', content: system }, ...messages],
      })
      const raw = res.choices?.[0]?.message?.content ?? ''
      const text = typeof raw === 'string' ? raw : JSON.stringify(raw)
      return stripFences(text)
    } catch (e) {
      lastErr = e as Error
      console.error(`[mistral] attempt ${i + 1} failed:`, e)
      await new Promise(r => setTimeout(r, 800 * (i + 1)))
    }
  }
  throw lastErr ?? new Error('Mistral call failed')
}
