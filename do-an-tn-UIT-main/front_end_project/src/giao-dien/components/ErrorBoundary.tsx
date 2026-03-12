/**
 * Error Boundary - Bắt lỗi render và hiển thị fallback thay vì trang trắng
 */

import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <AlertTriangle size={48} className="text-amber-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Đã xảy ra lỗi
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-4 max-w-md">
            {this.state.error.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Tải lại trang
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
