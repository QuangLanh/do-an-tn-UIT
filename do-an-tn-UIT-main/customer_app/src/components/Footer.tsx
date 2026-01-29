import { useNavigate } from 'react-router-dom'
import { ShoppingBag, Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react'

export const Footer = () => {
  const navigate = useNavigate()

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 dark:text-gray-400 mt-auto border-t border-gray-800 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white dark:text-gray-100 font-bold text-lg mb-4 flex items-center gap-2">
              <ShoppingBag size={20} />
              Cửa Hàng Tạp Hóa
            </h3>
            <p className="text-sm leading-relaxed text-gray-300 dark:text-gray-400">
              Cung cấp các sản phẩm tạp hóa chất lượng cao với giá cả hợp lý. 
              Mua sắm tiện lợi, giao hàng nhanh chóng.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white dark:text-gray-100 font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button 
                  onClick={() => navigate('/')}
                  className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-100 transition-colors"
                >
                  Trang chủ
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/cart')}
                  className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-100 transition-colors"
                >
                  Giỏ hàng
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/orders')}
                  className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-100 transition-colors"
                >
                  Đơn hàng
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/login')}
                  className="text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-100 transition-colors"
                >
                  Đăng nhập
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white dark:text-gray-100 font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-gray-300 dark:text-gray-400">
                <Phone size={16} />
                <span>0123 456 789</span>
              </li>
              <li className="flex items-center gap-2 text-gray-300 dark:text-gray-400">
                <Mail size={16} />
                <span>contact@cuahangtaphoa.com</span>
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
              © 2024 Cửa Hàng Tạp Hóa. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
