import { useState, useCallback, useEffect } from 'react'
import { getFrames } from '../lib/queries'
import type { Frame, FrameFilters } from '../types'

interface UseInfiniteFramesResult {
  frames: Frame[]
  hasMore: boolean
  loading: boolean
  initialLoading: boolean
  loadMore: () => void
  refresh: () => void
  error: string | null
}

export function useInfiniteFrames(filters?: FrameFilters): UseInfiniteFramesResult {
  const [frames, setFrames] = useState<Frame[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const filterKey = JSON.stringify(filters ?? {})

  const fetchPage = useCallback(
    async (p: number, reset = false) => {
      try {
        if (p === 1) setInitialLoading(true)
        else setLoading(true)

        const result = await getFrames(p, filters)

        if (reset || p === 1) {
          setFrames(result.frames)
        } else {
          setFrames((prev) => [...prev, ...result.frames])
        }

        setHasMore(result.hasMore)
        setPage(p)
        setError(null)
      } catch (e) {
        setError('Failed to load frames.')
      } finally {
        setInitialLoading(false)
        setLoading(false)
      }
    },
    [filterKey]
  )

  useEffect(() => {
    setPage(1)
    setHasMore(true)
    fetchPage(1, true)
  }, [filterKey])

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return
    fetchPage(page + 1)
  }, [loading, hasMore, page, fetchPage])

  const refresh = useCallback(() => {
    fetchPage(1, true)
  }, [fetchPage])

  return { frames, hasMore, loading, initialLoading, loadMore, refresh, error }
}
