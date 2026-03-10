import { useState, useEffect } from 'react'
import { Plus, Search, Trash2, Phone, MapPin, Eye, Pencil } from 'lucide-react'
import { NutBam } from '@/giao-dien/components/NutBam'
import { NhapLieu } from '@/giao-dien/components/NhapLieu'
import { BangDuLieu } from '@/giao-dien/components/BangDuLieu'
import { HopThoai } from '@/giao-dien/components/HopThoai'
import { Supplier } from '@/linh-vuc/suppliers/entities/Supplier'
import { supplierApi } from '@/ha-tang/api/supplierApi'
import { normalizePhoneInput, isValidPhone10 } from '@/ha-tang/utils/formatters'
import toast from 'react-hot-toast'

export const TrangNhaCungCap = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Quản lý chế độ Modal (Thêm/Sửa/Xem) và ID đang chọn
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  
  // Form state (Đã đồng bộ 'contact' thay vì 'contactPerson')
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', contact: '' })

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
        { id: '1', code: 'NCC001', name: 'Công ty TNHH ABC', phone: '0123456789', address: '123 Đường A, Quận 1', contact: 'Nguyễn Văn A', isActive: true },
      ])
    }
  }

  const handleAddNew = () => {
    setModalMode('create')
    setFormData({ name: '', phone: '', address: '', contact: '' })
    setIsModalOpen(true)
  }

  const handleView = (supplier: Supplier) => {
    setModalMode('view')
    setFormData({ 
      name: supplier.name, 
      phone: supplier.phone, 
      address: supplier.address || '', 
      contact: supplier.contact || '' 
    })
    setIsModalOpen(true)
  }

  const handleEdit = (supplier: Supplier) => {
    setModalMode('edit')
    setSelectedId(supplier.id || (supplier as any)._id)
    setFormData({ 
      name: supplier.name, 
      phone: supplier.phone, 
      address: supplier.address || '', 
      contact: supplier.contact || '' 
    })
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidPhone10(formData.phone)) {
      toast.error('Số điện thoại phải đúng 10 số (ví dụ: 0123456789).')
      return
    }
    try {
      if (modalMode === 'create') {
        const randomCode = `NCC${Math.floor(1000 + Math.random() * 9000)}`;
        await supplierApi.create.execute({
          ...formData,
          code: randomCode
        } as any)
        toast.success('Thêm nhà cung cấp thành công')
      } else if (modalMode === 'edit' && selectedId) {
        await supplierApi.update.execute(selectedId, formData as any)
        toast.success('Cập nhật nhà cung cấp thành công')
      }

      setIsModalOpen(false)
      loadData()
    } catch (error) {
      console.error(error)
      toast.error('Lỗi khi lưu dữ liệu. Kiểm tra lại backend.')
    }
  }

  // ĐÃ SỬA: Nhận toàn bộ object supplier để tự trích xuất ID an toàn
  const handleDelete = async (supplier: Supplier) => {
    const finalId = supplier.id || (supplier as any)._id;
    
    if (!finalId) {
      toast.error("Lỗi: Không tìm thấy ID nhà cung cấp.");
      return;
    }

    if(!confirm("Bạn chắc chắn muốn xóa?")) return;
    try {
        await supplierApi.delete.execute(finalId);
        toast.success("Đã xóa thành công");
        loadData();
    } catch (e) { 
        console.error(e);
        toast.error("Lỗi xóa nhà cung cấp"); 
    }
  }

  const modalTitle = modalMode === 'create' ? 'Thêm Nhà Cung Cấp' : 
                     modalMode === 'edit' ? 'Sửa Nhà Cung Cấp' : 'Chi Tiết Nhà Cung Cấp';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nhà Cung Cấp</h1>
        <NutBam onClick={handleAddNew}>
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
            { header: 'Người liên hệ', accessor: 'contact' as keyof Supplier },
            { header: 'Thao tác', accessor: (s: Supplier) => (
                <div className="flex items-center gap-3">
                  <button onClick={() => handleView(s)} className="text-blue-500 hover:bg-blue-50 p-2 rounded" title="Xem chi tiết"><Eye size={18}/></button>
                  <button onClick={() => handleEdit(s)} className="text-yellow-500 hover:bg-yellow-50 p-2 rounded" title="Sửa"><Pencil size={18}/></button>
                  {/* ĐÃ SỬA: Truyền toàn bộ object 's' vào handleDelete */}
                  <button onClick={() => handleDelete(s)} className="text-red-500 hover:bg-red-50 p-2 rounded" title="Xóa"><Trash2 size={18}/></button>
                </div>
            )}
        ]} 
      />

      <HopThoai isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle}>
        <form onSubmit={handleSave} className="space-y-4">
          <NhapLieu 
            label="Tên NCC *" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            required 
            disabled={modalMode === 'view'}
          />
          <NhapLieu
            label="Số điện thoại *"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="0xxxxxxxxx (10 số)"
            value={formData.phone}
            onChange={e => setFormData({...formData, phone: normalizePhoneInput(e.target.value)})}
            required
            disabled={modalMode === 'view'}
          />
          <NhapLieu 
            label="Người liên hệ" 
            value={formData.contact} 
            onChange={e => setFormData({...formData, contact: e.target.value})} 
            disabled={modalMode === 'view'}
          />
          <NhapLieu 
            label="Địa chỉ" 
            value={formData.address} 
            onChange={e => setFormData({...formData, address: e.target.value})} 
            disabled={modalMode === 'view'}
          />
          
          <div className="flex justify-end gap-3 pt-4">
            <NutBam type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              {modalMode === 'view' ? 'Đóng' : 'Hủy'}
            </NutBam>
            {modalMode !== 'view' && (
              <NutBam type="submit">Lưu</NutBam>
            )}
          </div>
        </form>
      </HopThoai>
    </div>
  )
}