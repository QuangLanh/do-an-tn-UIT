/**
 * Root component của ứng dụng
 * Quản lý theme và routing
 */

import { useEffect } from 'react'
import { useThemeStore } from '@/kho-trang-thai/khoChuDe'
import { useLoadingStore } from '@/kho-trang-thai/khoTai'
import { Spinner } from '@/giao-dien/components/Spinner'
import UngDungDinhTuyen from '@/dinh-tuyen/UngDungDinhTuyen'

function UngDung() {
  const { theme } = useThemeStore()
  const { isLoading } = useLoadingStore()

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return (
    <>
      <UngDungDinhTuyen />
      {isLoading && <Spinner />}
    </>
  )
}

export default UngDung

