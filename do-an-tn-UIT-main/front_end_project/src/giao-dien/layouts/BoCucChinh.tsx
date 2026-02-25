/**
 * Main Layout Component
 * Layout chính bao gồm Navbar, Sidebar và Content
 */

import { ReactNode } from 'react'
import { ThanhDieuHuong } from './ThanhDieuHuong'
import { ThanhBen } from './ThanhBen'
import { ChanTrang } from './ChanTrang'
import { useOrdersSocket } from '@/ha-tang/socket/useOrdersSocket'

interface MainLayoutProps {
  children: ReactNode
}

export const BoCucChinh = ({ children }: MainLayoutProps) => {
  // Kết nối socket đơn hàng cho admin/staff để nhận thông báo real-time
  useOrdersSocket()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <ThanhDieuHuong />
      <div className="flex flex-1">
        <ThanhBen />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-full mx-auto">{children}</div>
        </main>
      </div>
      <ChanTrang />
    </div>
  )
}

