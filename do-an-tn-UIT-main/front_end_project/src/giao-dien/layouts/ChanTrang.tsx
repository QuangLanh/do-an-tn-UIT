/**
 * Footer Component
 * Footer cho UI quản lý
 */

import { Settings, Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react'

export const ChanTrang = () => {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 dark:text-gray-400 mt-auto border-t border-gray-800 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white dark:text-gray-100 font-bold text-lg mb-4 flex items-center gap-2">
              <Settings size={20} />
              Hệ Thống Quản Lý
            </h3>
            <p className="text-sm leading-relaxed text-gray-300 dark:text-gray-400">
              Hệ thống quản lý cửa hàng tạp hóa chuyên nghiệp. 
              Quản lý sản phẩm, đơn hàng, nhập hàng và báo cáo hiệu quả.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white dark:text-gray-100 font-semibold mb-4">Chức năng chính</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-100 transition-colors cursor-pointer">
                  Quản lý sản phẩm
                </span>
              </li>
              <li>
                <span className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-100 transition-colors cursor-pointer">
                  Quản lý đơn hàng
                </span>
              </li>
              <li>
                <span className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-100 transition-colors cursor-pointer">
                  Quản lý nhập hàng
                </span>
              </li>
              <li>
                <span className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-100 transition-colors cursor-pointer">
                  Báo cáo & Thống kê
                </span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white dark:text-gray-100 font-semibold mb-4">Liên hệ hỗ trợ</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-gray-300 dark:text-gray-400">
                <Phone size={16} />
                <span>0123 456 789</span>
              </li>
              <li className="flex items-center gap-2 text-gray-300 dark:text-gray-400">
                <Mail size={16} />
                <span>support@quanlytaphoa.com</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300 dark:text-gray-400">
                <MapPin size={16} className="mt-1" />
                <span>123 Đường ABC, Quận XYZ, TP.HCM</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-white dark:text-gray-100 font-semibold mb-4">Theo dõi chúng tôi</h3>
            <div className="flex gap-4">
              <a 
                href="#" 
                className="p-2 bg-gray-800 dark:bg-gray-900 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="#" 
                className="p-2 bg-gray-800 dark:bg-gray-900 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="#" 
                className="p-2 bg-gray-800 dark:bg-gray-900 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
            </div>
            <p className="text-xs mt-4 text-gray-500 dark:text-gray-600">
              © 2024 Hệ Thống Quản Lý Tạp Hóa. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
