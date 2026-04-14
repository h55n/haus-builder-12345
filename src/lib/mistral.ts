import { Mistral } from '@mistralai/mistralai'

let _client: Mistral | null = null
const MISTRAL_ENV_KEYS = ['MISTRAL_API_KEY', 'MISTRAL_KEY'] as const

function resolveMistralApiKey(): string {
  for (const keyName of MISTRAL_ENV_KEYS) {
    const value = process.env[keyName]
    if (value?.trim()) return value
  }
  throw new Error(`Mistral key missing. Set one of: ${MISTRAL_ENV_KEYS.join(', ')}`)
}

export function getMistral(): Mistral {
  if (!_client) {
    const key = resolveMistralApiKey()
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

/**
 * Mistral responses can be a plain string or an array of typed blocks
 * (for example: [{ type: 'text', text: '...' }]).
 * This extracts only text payloads into a normalized string.
 */
function extractTextContent(raw: unknown): string {
  if (typeof raw === 'string') return raw
  if (Array.isArray(raw)) {
    return raw
      .map((block) => {
        if (typeof block === 'string') return block
        if (block && typeof block === 'object' && 'text' in block) {
          const text = block.text
          return typeof text === 'string' ? text : ''
        }
        return ''
      })
      .join('')
  }
  return ''
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
      const text = extractTextContent(raw)
      return stripFences(text)
    } catch (e) {
      lastErr = e as Error
      console.error(`[mistral] attempt ${i + 1} failed:`, e)
      await new Promise(r => setTimeout(r, 800 * (i + 1)))
    }
  }
  throw lastErr ?? new Error('Mistral call failed')
}
