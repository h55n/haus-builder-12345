import { NextRequest, NextResponse } from 'next/server'
import { callMistral } from '@/lib/mistral'
import { ARCHITECT_SYSTEM } from '@/lib/architectPrompt'
import { DesignSpecZ } from '@/lib/schemas'
import type { UserProfile } from '@/types'
import { buildPlannedDesign } from '@/lib/layoutPlanner'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const profile: UserProfile = body.profile
    const instruction: string | undefined = body.instruction

    console.log('[architect] profile style:', profile?.style)
    console.log('[architect] key set:', !!process.env.MISTRAL_API_KEY)

    const userMsg = instruction
      ? `Create design guidance for this instruction and profile: ${instruction}\nProfile: ${JSON.stringify(profile)}`
      : `Create design guidance for this profile: ${JSON.stringify(profile)}`

    try {
      const guidance = await callMistral('mistral-large-latest', ARCHITECT_SYSTEM, [{ role: 'user', content: userMsg }], 0.25)
      console.log('[architect] guidance chars:', guidance.length)
    } catch (err) {
      console.warn('[architect] guidance generation failed, using deterministic planner:', err)
    }

    const planned = buildPlannedDesign(profile)
    const validated = DesignSpecZ.safeParse(planned)

    if (!validated.success) {
      console.error('[architect] Zod fail:', validated.error.flatten())
      return NextResponse.json({ error: 'Planned blueprint validation failed' }, { status: 500 })
    }

    return NextResponse.json(validated.data)
  } catch (e) {
    console.error('[architect]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
