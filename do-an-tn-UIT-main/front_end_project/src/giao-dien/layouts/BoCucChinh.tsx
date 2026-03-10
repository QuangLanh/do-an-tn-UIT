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
    // 1. Dùng h-screen để giới hạn chiều cao bằng màn hình, overflow-hidden để chống cuộn toàn trang
    <div className="h-screen w-full bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
      
      {/* Navbar cố định ở trên cùng */}
      <div className="flex-shrink-0">
        <ThanhDieuHuong />
      </div>

      {/* Container chứa Sidebar và Content */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* 2. Sidebar: Cho phép cuộn độc lập nếu menu quá dài */}
        <div className="h-full overflow-y-auto flex-shrink-0">
          <ThanhBen />
        </div>

        {/* 3. Vùng Content: Cho phép cuộn độc lập phần nội dung */}
        <div className="flex-1 h-full overflow-y-auto flex flex-col">
          <main className="flex-1 p-6 lg:p-8">
            <div className="max-w-full mx-auto">{children}</div>
          </main>
          
          {/* Chân trang sẽ nằm ở cuối vùng nội dung và cuộn theo nội dung */}
          <ChanTrang />
        </div>

      </div>
    </div>
  )
}