/**
 * API Usage Examples
 * Ví dụ cách sử dụng centralized API service trong UI components
 */

import { useState, useEffect } from 'react'
import { apiService } from '@/ha-tang/api'
import { useApiCall } from '@/ha-tang/api/moc/useApi'

// ==================== Example 1: Direct API Call ====================
export const ExampleDirectCall = () => {
  const [products, setProducts] = useState([])

  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Chỉ cần gọi method, không cần biết URL
        const data = await apiService.products.list()
        setProducts(data)
      } catch (error) {
        console.error('Error:', error)
      }
    }
    loadProducts()
  }, [])

  return <div>Products loaded: {products.length}</div>
}

// ==================== Example 2: Using Hook ====================
export const ExampleUsingHook = () => {
  const { data: products, loading, error, execute } = useApiCall(
    apiService.products.list,
  )

  useEffect(() => {
    execute()
  }, [execute])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return <div>Products: {products?.length || 0}</div>
}

// ==================== Example 3: Create Product ====================
export const ExampleCreateProduct = () => {
  const handleCreate = async () => {
    try {
      // Chỉ cần truyền data, không cần URL
      const newProduct = await apiService.products.create({
        name: 'New Product',
        sku: 'SKU001',
        category: 'Category',
        purchasePrice: 1000,
        salePrice: 1500,
        stock: 50,
      })
      console.log('Created:', newProduct)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return <button onClick={handleCreate}>Create Product</button>
}

// ==================== Example 4: With Params ====================
export const ExampleWithParams = () => {
  const handleSearch = async () => {
    try {
      // Truyền params vào method, không cần tự build query string
      const products = await apiService.products.list({
        search: 'keyword',
        category: 'electronics',
        lowStock: true,
      })
      console.log('Found:', products)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return <button onClick={handleSearch}>Search</button>
}

// ==================== Example 5: Orders with Date Range ====================
export const ExampleOrdersDateRange = () => {
  const loadOrders = async () => {
    try {
      const orders = await apiService.orders.list({
        from: '2024-10-01',
        to: '2024-10-31',
        status: 'completed',
      })
      console.log('Orders:', orders)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return <button onClick={loadOrders}>Load Orders</button>
}

// ==================== Example 6: Purchase Recommendations ====================
export const ExamplePurchaseRecommendations = () => {
  const { data, loading, execute } = useApiCall(
    apiService.purchases.recommendations,
  )

  useEffect(() => {
    execute()
  }, [execute])

  if (loading) return <div>Loading recommendations...</div>

  return (
    <div>
      <h3>High Priority: {data?.highPriority?.length || 0}</h3>
      <h3>Low Priority: {data?.lowPriority?.length || 0}</h3>
    </div>
  )
}

// ==================== Example 7: Dashboard Data ====================
export const ExampleDashboard = () => {
  const [, setSummary] = useState<any | null>(null)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Gọi nhiều API cùng lúc
        const [dashboardSummary, topProducts, ordersTrend] = await Promise.all([
          apiService.dashboard.summary(),
          apiService.dashboard.topProducts(10),
          apiService.dashboard.ordersTrend(30),
        ])

        setSummary({
          summary: dashboardSummary,
          topProducts,
          ordersTrend,
        })
      } catch (error) {
        console.error('Error:', error)
      }
    }
    loadDashboard()
  }, [])

  return <div>Dashboard loaded</div>
}

// ==================== Example 8: Download PDF ====================
export const ExampleDownloadPDF = () => {
  const handleDownload = async () => {
    try {
      // API service tự động handle download
      await apiService.reports.export({
        from: '2024-10-01',
        to: '2024-10-31',
      })
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return <button onClick={handleDownload}>Download Report PDF</button>
}

