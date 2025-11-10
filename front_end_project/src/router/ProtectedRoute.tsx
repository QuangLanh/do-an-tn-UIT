/**
 * Protected Route Component
 * Route yêu cầu authentication
 */

import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  requiredPermission?: string
}

export const ProtectedRoute = ({ children, requiredPermission }: ProtectedRouteProps) => {
  const { isAuthenticated, hasPermission } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-red-600 dark:text-red-400">403</h1>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-4">
            Không có quyền truy cập
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            Bạn không có quyền truy cập vào trang này.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

