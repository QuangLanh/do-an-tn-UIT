/**
 * React Hooks for API calls
 * Wrapper hooks để UI components sử dụng API dễ dàng hơn
 */

import { useState, useCallback } from 'react'
import { apiService } from '../services/apiService'

/**
 * Generic hook để call API với loading và error state
 */
export function useApiCall<T, P extends any[] = any[]>(
  apiMethod: (...args: P) => Promise<T>,
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(
    async (...args: P) => {
      try {
        setLoading(true)
        setError(null)
        const result = await apiMethod(...args)
        setData(result)
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [apiMethod],
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return { data, loading, error, execute, reset }
}

/**
 * Hook để gọi API và tự động execute khi mount hoặc dependencies thay đổi
 */
export function useApi<T, P extends any[] = any[]>(
  apiMethod: (...args: P) => Promise<T>,
  ...args: P
) {
  const { data, loading, error, execute, reset } = useApiCall(apiMethod)

  // Auto execute khi args thay đổi (nếu cần)
  const shouldAutoExecute = args.length > 0
  if (shouldAutoExecute && !loading && !data && !error) {
    execute(...args)
  }

  return { data, loading, error, refetch: () => execute(...args), reset }
}

// Export apiService để UI có thể dùng trực tiếp nếu cần
export { apiService } from '../services/apiService'

