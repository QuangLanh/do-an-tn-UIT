/**
 * Root component của ứng dụng
 * Quản lý theme và routing
 */

import { useEffect } from 'react'
import { useThemeStore } from '@/kho-trang-thai/khoChuDe'
import UngDungDinhTuyen from '@/dinh-tuyen/UngDungDinhTuyen'

function UngDung() {
  const { theme } = useThemeStore()

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return <UngDungDinhTuyen />
}

export default UngDung

