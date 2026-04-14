'use client'
import { useCallback } from 'react'
import { useDesignStore } from '@/store/designStore'
import type { UserProfile, DesignSpec } from '@/types'

export function useArchitectAgent() {
  const { setDesign, setGenerating, setError } = useDesignStore()

  const generateDesign = useCallback(async (profile: UserProfile): Promise<DesignSpec | null> => {
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/agent/design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: DesignSpec = await res.json()
      if ((data as any).error) throw new Error((data as any).error)
      setDesign(data)
      return data
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error('[useArchitectAgent]', msg)
      setError(msg)
      return null
    } finally {
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
