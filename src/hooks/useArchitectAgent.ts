'use client'
import { useCallback } from 'react'
import { useDesignStore } from '@/store/designStore'
import type { UserProfile, DesignSpec } from '@/types'
import { buildFallbackDesign } from '@/lib/fallbackDesign'

const DESIGN_REQUEST_TIMEOUT_MS = 85000

export function useArchitectAgent() {
  const { setDesign, setGenerating, setError } = useDesignStore()

  const generateDesign = useCallback(async (profile: UserProfile): Promise<DesignSpec | null> => {
    setGenerating(true)
    setError(null)
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(new Error('design-timeout')), DESIGN_REQUEST_TIMEOUT_MS)
    try {
      const res = await fetch('/api/agent/design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
        signal: controller.signal,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: DesignSpec = await res.json()
      if ((data as any).error) throw new Error((data as any).error)
      setDesign(data)
      return data
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error('[useArchitectAgent]', msg)
      const fallback = buildFallbackDesign(profile)
      setDesign(fallback)
      setError(null)
      return fallback
    } finally {
      window.clearTimeout(timeoutId)
      setGenerating(false)
    }
  }, [setDesign, setGenerating, setError])

  const refineDesign = useCallback(async (profile: UserProfile, instruction: string): Promise<DesignSpec | null> => {
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/agent/design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, instruction }),
      })
      const data: DesignSpec = await res.json()
      setDesign(data)
      return data
    } catch (e) {
      setError(String(e))
      return null
    } finally {
      setGenerating(false)
    }
  }, [setDesign, setGenerating, setError])

  return { generateDesign, refineDesign }
}
