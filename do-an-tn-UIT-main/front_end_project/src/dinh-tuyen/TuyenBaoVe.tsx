/**
 * Protected Route Component
 * Route yêu cầu authentication
 */

import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/kho-trang-thai/khoXacThuc'
import { ReactNode } from 'react'
import type { UserRole } from '@/linh-vuc/users/entities/User'

interface TuyenBaoVeProps {
  children: ReactNode
  requiredPermission?: string
  requiredRoles?: UserRole | UserRole[]
}

export const TuyenBaoVe = ({ children, requiredPermission, requiredRoles }: TuyenBaoVeProps) => {
  const { isAuthenticated, hasPermission, user } = useAuthStore()
  const location = useLocation()

  const roles = requiredRoles
    ? (Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles])
    : undefined

  const isCustomerArea = location.pathname.startsWith('/khach-hang')
  const requiresCustomer = roles?.includes('customer') ?? false
  const loginPath = isCustomerArea || requiresCustomer ? '/khach-hang/dang-nhap' : '/login'

  if (!isAuthenticated) {
    return <Navigate to={loginPath} replace state={{ from: location }} />
  }

  if (requiredRoles) {
    if (!user || !roles.includes(user.role)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-red-600 dark:text-red-400">403</h1>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-4">
              Không có quyền truy cập
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-4">
              Trang này không dành cho vai trò của bạn.
            </p>
          </div>
        </div>
      )
    }
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

