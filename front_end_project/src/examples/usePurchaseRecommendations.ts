/**
 * Example: Sử dụng Purchase Recommendations API
 * 
 * Đây là file ví dụ để minh họa cách sử dụng recommendations API
 * Bạn có thể copy code này vào component hoặc page của bạn
 */

import { purchaseApi } from '@/infra/api/purchaseApi'
import { PurchaseRecommendation, PurchaseRecommendationItem } from '@/domains/purchases/entities/PurchaseRecommendation'

// Ví dụ 1: Lấy tất cả recommendations
export const getAllRecommendations = async (): Promise<PurchaseRecommendation> => {
  try {
    const recommendations = await purchaseApi.getRecommendations()
    console.log('High Priority:', recommendations.highPriority)
    console.log('Medium Priority:', recommendations.mediumPriority)
    console.log('Low Priority:', recommendations.lowPriority)
    return recommendations
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    throw error
  }
}

// Ví dụ 2: Chỉ lấy high priority recommendations
export const getHighPriorityOnly = async (): Promise<PurchaseRecommendationItem[]> => {
  try {
    const highPriority = await purchaseApi.getHighPriorityRecommendations()
    console.log('Products cần nhập gấp:', highPriority)
    return highPriority
  } catch (error) {
    console.error('Error fetching high priority recommendations:', error)
    throw error
  }
}

// Ví dụ 3: Chỉ lấy low priority recommendations (sản phẩm nên nhập ít)
export const getLowPriorityOnly = async (): Promise<PurchaseRecommendationItem[]> => {
  try {
    const lowPriority = await purchaseApi.getLowPriorityRecommendations()
    console.log('Sản phẩm nên nhập ít:', lowPriority)
    return lowPriority
  } catch (error) {
    console.error('Error fetching low priority recommendations:', error)
    throw error
  }
}

// Ví dụ 4: Sử dụng trong React component
/*
import { useState, useEffect } from 'react'
import { purchaseApi } from '@/infra/api/purchaseApi'
import { PurchaseRecommendation } from '@/domains/purchases/entities/PurchaseRecommendation'

export const RecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState<PurchaseRecommendation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecommendations()
  }, [])

  const loadRecommendations = async () => {
    try {
      setLoading(true)
      const data = await purchaseApi.getRecommendations()
      setRecommendations(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h2>Gợi ý Nhập Hàng</h2>
      
      <div>
        <h3>Cần nhập gấp ({recommendations?.highPriority.length || 0})</h3>
        {recommendations?.highPriority.map(item => (
          <div key={item.productId}>
            <p>{item.productName} - Số lượng nên nhập: {item.recommendedQuantity}</p>
            <p>Lý do: {item.reason}</p>
          </div>
        ))}
      </div>

      <div>
        <h3>Nên nhập ít ({recommendations?.lowPriority.length || 0})</h3>
        {recommendations?.lowPriority.map(item => (
          <div key={item.productId}>
            <p>{item.productName} - Số lượng: {item.recommendedQuantity}</p>
            <p>Lý do: {item.reason}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
*/

