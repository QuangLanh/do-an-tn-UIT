/**
 * Reports Page
 * Trang báo cáo với chức năng xuất PDF
 */

import { useEffect, useState, useRef } from 'react'
import { FileDown, TrendingUp, DollarSign } from 'lucide-react'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import { Table } from '@/ui/components/Table'
import { Product } from '@/domains/products/entities/Product'
import { productApi } from '@/infra/api/productApi'
import { reportApi } from '@/infra/api/reportApi'
import { formatCurrency, formatDate } from '@/infra/utils/formatters'
import toast from 'react-hot-toast'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

// Sử dụng reportApi thay vì khởi tạo ReportService trực tiếp

export const ReportsPage = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingReport, setIsLoadingReport] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)
  const [dailySales, setDailySales] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Tải dữ liệu sản phẩm
      const data = await productApi.getAllProducts.execute()
      setProducts(data)
    } catch (error) {
      toast.error('Không thể tải dữ liệu báo cáo')
      console.error('Error loading products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadReportData = async () => {
    try {
      setIsLoadingReport(true)
      // Tải dữ liệu doanh thu 30 ngày
      const salesData = await reportApi.getDailySalesReport(30)
      setDailySales(salesData || [])

      // Tải dữ liệu top sản phẩm
      const topProductsData = await reportApi.getTopProductsReport(10)
      setTopProducts(topProductsData || [])
    } catch (error) {
      console.error('Failed to load report data:', error)
      toast.error('Không thể tải dữ liệu báo cáo chi tiết')
      // Set empty arrays on error to prevent crashes
      setDailySales([])
      setTopProducts([])
    } finally {
      setIsLoadingReport(false)
    }
  }

  useEffect(() => {
    if (!isLoading) {
      loadReportData()
    }
  }, [isLoading])

  const handleExportPDF = async () => {
    if (!reportRef.current) return

    setIsExporting(true)
    toast.loading('Đang tạo file PDF...', { id: 'export-pdf' })

    try {
      // Capture the report content
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = 10

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
      pdf.save(`bao-cao-${new Date().toISOString().split('T')[0]}.pdf`)

      toast.success('Xuất PDF thành công!', { id: 'export-pdf' })
    } catch (error) {
      toast.error('Không thể xuất PDF', { id: 'export-pdf' })
      console.error('Export PDF error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  if (isLoading || isLoadingReport) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Đang tải...</div>
      </div>
    )
  }

  // Calculate summary - safe with default values
  const totalRevenue = dailySales.reduce((sum, day) => sum + (day?.revenue || 0), 0)
  const totalProfit = dailySales.reduce((sum, day) => sum + (day?.profit || 0), 0)
  const profitMargin = reportApi.calculateProfitMargin(totalRevenue, totalProfit)
  const lowStockCount = products.filter((p) => p.stock < 10).length

  const dailySalesColumns = [
    { header: 'Ngày', accessor: 'date' as const },
    {
      header: 'Doanh thu',
      accessor: (row: any) => formatCurrency(row.revenue),
    },
    {
      header: 'Chi phí',
      accessor: (row: any) => formatCurrency(row.cost),
    },
    {
      header: 'Lợi nhuận',
      accessor: (row: any) => (
        <span className="text-green-600 dark:text-green-400 font-semibold">
          {formatCurrency(row.profit)}
        </span>
      ),
    },
    { header: 'Đơn hàng', accessor: 'orders' as const },
  ]

  const topProductsColumns = [
    { header: 'Sản phẩm', accessor: 'productName' as const },
    { header: 'Số lượng bán', accessor: 'quantitySold' as const },
    {
      header: 'Doanh thu',
      accessor: (row: any) => formatCurrency(row.revenue),
    },
    {
      header: 'Lợi nhuận',
      accessor: (row: any) => (
        <span className="text-green-600 dark:text-green-400 font-semibold">
          {formatCurrency(row.profit)}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Báo cáo doanh thu</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Báo cáo chi tiết về doanh thu và lợi nhuận
          </p>
        </div>
        <Button onClick={handleExportPDF} isLoading={isExporting} variant="success">
          <FileDown size={20} className="mr-2" />
          Xuất PDF
        </Button>
      </div>

      {/* Report Content - This will be exported to PDF */}
      <div ref={reportRef} className="space-y-6 bg-white dark:bg-gray-900 p-8">
        {/* Report Header */}
        <div className="text-center pb-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            BÁO CÁO DOANH THU VÀ LỢI NHUẬN
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Thời gian: {formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))} -{' '}
            {formatDate(new Date())}
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="text-center">
              <div className="inline-flex p-4 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                <DollarSign size={32} className="text-green-600 dark:text-green-300" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tổng doanh thu (30 ngày)</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <div className="inline-flex p-4 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                <TrendingUp size={32} className="text-blue-600 dark:text-blue-300" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tổng lợi nhuận (30 ngày)</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(totalProfit)}
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <div className="inline-flex p-4 bg-purple-100 dark:bg-purple-900 rounded-full mb-4">
                <TrendingUp size={32} className="text-purple-600 dark:text-purple-300" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tỷ suất lợi nhuận</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {profitMargin.toFixed(1)}%
              </p>
            </div>
          </Card>
        </div>

        {/* Top Products */}
        <Card title="Top 10 sản phẩm bán chạy">
          <Table data={topProducts} columns={topProductsColumns} />
        </Card>

        {/* Daily Sales - Show last 10 days for PDF */}
        <Card title="Doanh thu 10 ngày gần nhất">
          <Table data={dailySales.slice(-10)} columns={dailySalesColumns} />
        </Card>

        {/* Analysis */}
        <Card title="Phân tích và nhận xét">
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <p>
              <strong>1. Doanh thu trung bình mỗi ngày:</strong>{' '}
              {formatCurrency(totalRevenue / 30)}
            </p>
            <p>
              <strong>2. Lợi nhuận trung bình mỗi ngày:</strong>{' '}
              {formatCurrency(totalProfit / 30)}
            </p>
            <p>
              <strong>3. Sản phẩm bán chạy nhất:</strong> {topProducts[0]?.productName} (
              {topProducts[0]?.quantitySold} đơn vị)
            </p>
            <p>
              <strong>4. Tỷ suất lợi nhuận:</strong>{' '}
              {profitMargin > 30 ? 'Tốt' : profitMargin > 20 ? 'Trung bình' : 'Cần cải thiện'} (
              {profitMargin.toFixed(1)}%)
            </p>
            <p>
              <strong>5. Đề xuất:</strong>{' '}
              {lowStockCount > 5
                ? `Có ${lowStockCount} sản phẩm sắp hết hàng, cần nhập thêm`
                : 'Tồn kho ổn định'}
            </p>
          </div>
        </Card>

        {/* Footer */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Báo cáo được tạo tự động bởi Hệ thống Quản lý Tạp Hóa</p>
          <p>Ngày tạo: {formatDate(new Date())}</p>
        </div>
      </div>
    </div>
  )
}

