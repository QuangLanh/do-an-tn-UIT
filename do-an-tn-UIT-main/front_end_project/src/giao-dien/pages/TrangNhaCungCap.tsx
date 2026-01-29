import { useState, useEffect } from 'react'
import { Plus, Search, Trash2, Phone, MapPin } from 'lucide-react'
import { NutBam } from '@/giao-dien/components/NutBam'
import { NhapLieu } from '@/giao-dien/components/NhapLieu'
import { BangDuLieu } from '@/giao-dien/components/BangDuLieu'
import { HopThoai } from '@/giao-dien/components/HopThoai'
import { Supplier } from '@/linh-vuc/suppliers/entities/Supplier'
import { supplierApi } from '@/ha-tang/api/supplierApi'
import toast from 'react-hot-toast'

export const TrangNhaCungCap = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', contactPerson: '' })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const data = await supplierApi.getAll.execute()
      setSuppliers(data)
    } catch (error) {
      console.log("Lỗi tải API, dùng dữ liệu mẫu");
      setSuppliers([
        { id: '1', code: 'NCC001', name: 'Công ty TNHH ABC', phone: '0123456789', address: '123 Đường A, Quận 1', contactPerson: 'Nguyễn Văn A', isActive: true },
      ])
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // 1. Tự sinh mã code
      const randomCode = `NCC${Math.floor(1000 + Math.random() * 9000)}`;

      // 2. Gửi API (Gộp code + dữ liệu form)
      await supplierApi.create.execute({
        ...formData,      // Bung toàn bộ dữ liệu form ra (name, phone, address, contactPerson)
        code: randomCode  // Thêm trường code bắt buộc
      } as any)

      toast.success('Thêm nhà cung cấp thành công')
      setIsModalOpen(false)
      loadData()
      setFormData({ name: '', phone: '', address: '', contactPerson: '' })
    } catch (error) {
      console.error(error)
      toast.error('Lỗi khi thêm: Kiểm tra lại xem Backend đã cho phép field contactPerson chưa?')
    }
  }

  const handleDelete = async (id: string) => {
    if(!confirm("Bạn chắc chắn muốn xóa?")) return;
    try {
        await supplierApi.delete.execute(id);
        toast.success("Đã xóa");
        loadData();
    } catch (e) { toast.error("Lỗi xóa"); }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nhà Cung Cấp</h1>
        <NutBam onClick={() => setIsModalOpen(true)}>
          <Plus size={20} className="mr-2"/> Thêm NCC
        </NutBam>
      </div>

      <div className="relative w-full md:w-1/3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
        <NhapLieu 
          placeholder="Tìm tên, sđt nhà cung cấp..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <BangDuLieu 
        data={suppliers.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))} 
        columns={[
            { header: 'Mã', accessor: 'code' as keyof Supplier },
            { header: 'Tên NCC', accessor: 'name' as keyof Supplier },
            { header: 'Liên hệ', accessor: (s: Supplier) => (
                <div className="text-sm">
                    <div className="flex items-center gap-1"><Phone size={12}/> {s.phone}</div>
                    <div className="flex items-center gap-1 text-gray-500"><MapPin size={12}/> {s.address}</div>
                </div>
            )},
            { header: 'Người liên hệ', accessor: 'contactPerson' as keyof Supplier },
            { header: 'Thao tác', accessor: (s: Supplier) => (
                <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={18}/></button>
            )}
        ]} 
      />

      <HopThoai isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Thêm Nhà Cung Cấp">
        <form onSubmit={handleSave} className="space-y-4">
          <NhapLieu label="Tên NCC *" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <NhapLieu label="Số điện thoại *" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
          <NhapLieu label="Người liên hệ" value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} />
          <NhapLieu label="Địa chỉ" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
          <div className="flex justify-end gap-3 pt-4">
            <NutBam type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Hủy</NutBam>
            <NutBam type="submit">Lưu</NutBam>
          </div>
        </form>
      </HopThoai>
    </div>
  )
}