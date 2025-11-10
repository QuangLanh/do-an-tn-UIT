/**
 * Root component của ứng dụng
 * Quản lý theme và routing
 */

import { useEffect } from 'react'
import { useThemeStore } from '@/store/themeStore'
import AppRouter from '@/router/AppRouter'

function App() {
  const { theme } = useThemeStore()

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return <AppRouter />
}

export default App

