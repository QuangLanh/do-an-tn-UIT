/**
 * Main Layout Component
 * Layout chính bao gồm Navbar, Sidebar và Content
 */

import { ReactNode } from 'react'
import { ThanhDieuHuong } from './ThanhDieuHuong'
import { ThanhBen } from './ThanhBen'
import { ChanTrang } from './ChanTrang'

interface MainLayoutProps {
  children: ReactNode
}

export const BoCucChinh = ({ children }: MainLayoutProps) => {
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

