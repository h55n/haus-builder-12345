import { NextRequest, NextResponse } from 'next/server'
import { callMistral } from '@/lib/mistral'
import { QUIZ_SYSTEM } from '@/lib/quizPrompt'
import type { ChatMessage } from '@/types'

function parseQuizResponse(result: string) {
  try {
    return JSON.parse(result)
  } catch {
    const match = result.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('Model returned non-JSON response')
    return JSON.parse(match[0])
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: ChatMessage[] } = await req.json()
    const result = await callMistral('mistral-small-latest', QUIZ_SYSTEM, messages, 0.7)
    const parsed = parseQuizResponse(result)
    return NextResponse.json(parsed)
  } catch (e) {
    console.error('[quiz-agent]', e)
    const message = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ type: 'error', message }, { status: 500 })
  }
}
