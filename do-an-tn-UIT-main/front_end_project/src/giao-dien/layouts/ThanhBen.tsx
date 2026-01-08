/**
 * Sidebar Component
 * Menu bên trái
 */

import { NavLink } from 'react-router-dom'
import { Home, Package, AlertTriangle, FileText, ShoppingCart, Truck, X } from 'lucide-react'
import { useSidebarStore } from '@/kho-trang-thai/khoThanhBen'
import { useAuthStore } from '@/kho-trang-thai/khoXacThuc'

interface NavItem {
  path: string
  label: string
  icon: React.ReactNode
  permission?: string
}

export const ThanhBen = () => {
  const { isOpen, close } = useSidebarStore()
  const { hasPermission } = useAuthStore()

  const navItems: NavItem[] = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: <Home size={20} />,
    },
    {
      path: '/orders',
      label: 'Bán hàng',
      icon: <ShoppingCart size={20} />,
    },
    {
      path: '/purchases',
      label: 'Nhập hàng',
      icon: <Truck size={20} />,
    },
    {
      path: '/products',
      label: 'Sản phẩm',
      icon: <Package size={20} />,
    },
    {
      path: '/inventory',
      label: 'Tồn kho',
      icon: <AlertTriangle size={20} />,
    },
    {
      path: '/reports',
      label: 'Báo cáo',
      icon: <FileText size={20} />,
      permission: 'view_reports',
    },
  ]

  const filteredNavItems = navItems.filter(
    (item) => !item.permission || hasPermission(item.permission)
  )

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900 bg-opacity-50 lg:hidden"
          onClick={close}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:z-30 w-64`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 lg:hidden">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Menu</h2>
            <button
              onClick={close}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`
                }
                onClick={() => {
                  // Close sidebar on mobile after navigation
                  if (window.innerWidth < 1024) {
                    close()
                  }
                }}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              © 2024 Grocery Store
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}

