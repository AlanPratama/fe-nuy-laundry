import type { CustomerItem, CustomerStats, CustomerQueryParams, CustomerPageResult, CustomerPayload } from '../models/CustomerModel'
import type { ApiResponse, PageResponse } from '@nuy-laundry/shared-types'
import { apiClient } from '../../../shared/api/apiClient'

export interface CustomerMetrics {
  totalCustomers: number
  activeCustomers: number
  newCustomersThisMonth: number
}

export interface ICustomerRepository {
  getAll(token?: string, params?: CustomerQueryParams): Promise<CustomerPageResult>
  create(token?: string, payload?: CustomerPayload): Promise<CustomerItem>
  update(token?: string, id?: string, payload?: CustomerPayload): Promise<CustomerItem>
  delete(token?: string, id?: string): Promise<void>
  getMetrics(token?: string): Promise<CustomerMetrics>
}

export class CustomerRepository implements ICustomerRepository {
  async getMetrics(_token?: string): Promise<CustomerMetrics> {
    try {
      const res = await apiClient.get<ApiResponse<CustomerMetrics>>('/api/v1/customers/metrics')
      if (res.data?.data) return res.data.data
    } catch (e) {
      console.error('Failed to get customer metrics', e)
    }
    return {
      totalCustomers: 0,
      activeCustomers: 0,
      newCustomersThisMonth: 0
    }
  }
  async getAll(_token?: string, params?: CustomerQueryParams): Promise<CustomerPageResult> {
    const page = params?.page ?? 0
    const size = params?.size ?? 10

    try {
      const res = await apiClient.get<ApiResponse<PageResponse<any>>>('/api/v1/customers', {
        params: {
          page,
          size,
          name: params?.name || undefined,
          phone: params?.phone || undefined,
          address: params?.address || undefined,
          sortBy: params?.sortBy === 'name' ? 'name' : 'createdAt',
          direction: params?.direction || 'desc'
        }
      })

      if (res.data?.data?.content && Array.isArray(res.data.data.content)) {
        const rawContent = res.data.data.content
        const totalElements = res.data.data.totalElements ?? rawContent.length
        const totalPages = res.data.data.totalPages ?? Math.max(1, Math.ceil(totalElements / size))

        const customers: CustomerItem[] = rawContent.map((c: any) => {
          const transactions = Array.isArray(c.transactions) ? c.transactions : []
          const totalOrders = c.totalTransaksi ?? transactions.length
          const totalSpent = transactions.length > 0
            ? transactions.reduce((acc: number, t: any) => acc + Number(t.totalPrice || 0), 0)
            : Number(c.totalSpent || 0)

          let calculatedWeight = 0
          const history = transactions.map((t: any) => {
            const firstDetail = t.transactionDetails?.[0]
            const qty = firstDetail?.quantity || 1
            if (firstDetail?.packageType === 'WEIGHT') {
              calculatedWeight += qty
            }
            return {
              id: t.id,
              invoiceNumber: t.invoiceNo || t.id,
              packageName: firstDetail?.packageName || 'Layanan Laundry',
              quantity: qty,
              unit: firstDetail?.packageType === 'PCS' ? 'pcs' : 'kg',
              totalAmount: Number(t.totalPrice || 0),
              status: t.status || 'IN_PROGRESS',
              createdAt: t.orderDate || t.createdAt || new Date().toISOString()
            }
          })

          const totalWeightKg = c.totalCucianKg !== undefined && c.totalCucianKg !== null
            ? Number(c.totalCucianKg)
            : calculatedWeight

          const lastOrderDate = c.lastOrder || transactions[0]?.orderDate || c.updatedAt || c.createdAt || new Date().toISOString()

          return {
            id: c.id,
            name: c.name,
            phone: c.phone || '-',
            address: c.address || '-',
            totalOrders,
            totalSpent,
            totalWeightKg,
            lastOrderDate,
            history
          }
        })

        const activeCount = customers.filter(c => c.totalOrders > 0).length
        const repeatCount = customers.filter(c => c.totalOrders > 1).length
        const repeatRate = totalElements > 0 ? `${Math.round((repeatCount / Math.max(1, customers.length)) * 100)}%` : '0%'

        return {
          customers,
          stats: {
            totalCustomers: totalElements,
            activeThisMonth: activeCount,
            repeatOrderRate: repeatRate
          },
          totalElements,
          totalPages,
          page,
          size
        }
      }
    } catch (err: any) {
      if (err?.response) {
        throw new Error(err.response?.data?.message || err.message || 'Gagal memuat data pelanggan')
      }
    }

    return {
      customers: [],
      stats: {
        totalCustomers: 0,
        activeThisMonth: 0,
        repeatOrderRate: '0%'
      },
      totalElements: 0,
      totalPages: 1,
      page,
      size
    }
  }

  async create(_token?: string, payload?: CustomerPayload): Promise<CustomerItem> {
    if (!payload?.name) throw new Error('Nama pelanggan wajib diisi')
    
    const res = await apiClient.post<ApiResponse<any>>('/api/v1/customers', {
      name: payload.name,
      phone: payload.phone || '',
      address: payload.address || ''
    })

    if (res.data?.data) {
      const c = res.data.data
      return {
        id: c.id,
        name: c.name,
        phone: c.phone || '-',
        address: c.address || '-',
        totalOrders: 0,
        totalSpent: 0,
        totalWeightKg: 0,
        lastOrderDate: new Date().toISOString(),
        history: []
      }
    }

    throw new Error('Gagal menambahkan pelanggan baru')
  }

  async update(_token?: string, id?: string, payload?: CustomerPayload): Promise<CustomerItem> {
    if (!id || !payload?.name) throw new Error('ID dan nama pelanggan wajib diisi')

    const res = await apiClient.put<ApiResponse<any>>(`/api/v1/customers/${id}`, {
      name: payload.name,
      phone: payload.phone || '',
      address: payload.address || ''
    })

    if (res.data?.data) {
      const c = res.data.data
      return {
        id: c.id,
        name: c.name,
        phone: c.phone || '-',
        address: c.address || '-',
        totalOrders: 0,
        totalSpent: 0,
        totalWeightKg: 0,
        lastOrderDate: new Date().toISOString()
      }
    }

    throw new Error('Gagal memperbarui data pelanggan')
  }

  async delete(_token?: string, id?: string): Promise<void> {
    if (!id) return
    await apiClient.delete(`/api/v1/customers/${id}`)
  }
}
