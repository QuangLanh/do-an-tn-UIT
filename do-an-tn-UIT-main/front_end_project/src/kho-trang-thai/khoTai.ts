/**
 * Loading Store (Zustand)
 * Quản lý trạng thái loading toàn cục cho API calls
 */

import { create } from 'zustand'

interface LoadingState {
  isLoading: boolean
  loadingCount: number
  setLoading: (loading: boolean) => void
  startLoading: () => void
  stopLoading: () => void
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  loadingCount: 0,

  setLoading: (loading: boolean) => {
    set((state) => ({
      isLoading: loading,
      loadingCount: loading ? state.loadingCount + 1 : Math.max(0, state.loadingCount - 1),
    }))
  },

  startLoading: () => {
    set((state) => {
      const newCount = state.loadingCount + 1
      return {
        loadingCount: newCount,
        isLoading: true,
      }
    })
  },

  stopLoading: () => {
    set((state) => {
      const newCount = Math.max(0, state.loadingCount - 1)
      return {
        loadingCount: newCount,
        isLoading: newCount > 0,
      }
    })
  },
}))
