import { NextRequest, NextResponse } from 'next/server'
import { callMistral } from '@/lib/mistral'
import { QUIZ_SYSTEM } from '@/lib/quizPrompt'
import type { ChatMessage } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: ChatMessage[] } = await req.json()
    const result = await callMistral('mistral-small-latest', QUIZ_SYSTEM, messages, 0.7)
    const parsed = JSON.parse(result)
    return NextResponse.json(parsed)
  } catch (e) {
    console.error('[quiz-agent]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
