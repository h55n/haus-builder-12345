import { NextRequest, NextResponse } from 'next/server'
import { callMistral } from '@/lib/mistral'
import { ARCHITECT_SYSTEM } from '@/lib/architectPrompt'
import { DesignSpecZ } from '@/lib/schemas'
import type { UserProfile } from '@/types'
import { v4 as uuid } from 'uuid'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const profile: UserProfile = body.profile
    const instruction: string | undefined = body.instruction

    console.log('[architect] profile style:', profile?.style)
    console.log('[architect] key set:', !!process.env.MISTRAL_API_KEY)

    const userMsg = instruction
      ? `Existing design instruction: ${instruction}\nProfile: ${JSON.stringify(profile)}`
      : `Design a home for this profile: ${JSON.stringify(profile)}`

    let raw = await callMistral('mistral-large-latest', ARCHITECT_SYSTEM, [{ role: 'user', content: userMsg }], 0.25)

    // strip any accidental fences
    raw = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()

    // ensure id + generatedAt present
    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(raw)
    } catch {
      console.error('[architect] JSON parse fail, raw:', raw.slice(0, 500))
      return NextResponse.json({ error: 'Failed to parse architect response' }, { status: 500 })
    }

    if (!parsed.id) parsed.id = uuid()
    if (!parsed.generatedAt) parsed.generatedAt = new Date().toISOString()
    if (!parsed.version) parsed.version = 1

    const validated = DesignSpecZ.safeParse(parsed)
    if (!validated.success) {
      console.error('[architect] Zod fail:', validated.error.flatten())
      // return raw parsed anyway — let renderer handle gracefully
      return NextResponse.json(parsed)
    }

    return NextResponse.json(validated.data)
  } catch (e) {
    console.error('[architect]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
