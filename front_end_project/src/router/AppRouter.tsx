/**
 * App Router
 * Cấu hình routing cho ứng dụng
 */

import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { MainLayout } from '@/ui/layouts/MainLayout'
import { ProtectedRoute } from './ProtectedRoute'

// Pages
import { LoginPage } from '@/ui/pages/LoginPage'
import { DashboardPage } from '@/ui/pages/DashboardPage'
import { ProductsPage } from '@/ui/pages/ProductsPage'
import { InventoryPage } from '@/ui/pages/InventoryPage'
import { ReportsPage } from '@/ui/pages/ReportsPage'
import { OrdersPage } from '@/ui/pages/OrdersPage'
import { CreateOrderPage } from '@/ui/pages/CreateOrderPage'
import { PurchasesPage } from '@/ui/pages/PurchasesPage'
import { CreatePurchasePage } from '@/ui/pages/CreatePurchasePage'
import { NotFoundPage } from '@/ui/pages/NotFoundPage'

const AppRouter = () => {
  const { isAuthenticated } = useAuthStore()

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <DashboardPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <MainLayout>
              <ProductsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <MainLayout>
              <InventoryPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <MainLayout>
              <OrdersPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders/new"
        element={
          <ProtectedRoute>
            <MainLayout>
              <CreateOrderPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <CreateOrderPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/purchases"
        element={
          <ProtectedRoute>
            <MainLayout>
              <PurchasesPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/purchases/new"
        element={
          <ProtectedRoute>
            <MainLayout>
              <CreatePurchasePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/purchases/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <CreatePurchasePage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute requiredPermission="view_reports">
            <MainLayout>
              <ReportsPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Redirect root to dashboard */}
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        }
      />

      {/* 404 Not Found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRouter

