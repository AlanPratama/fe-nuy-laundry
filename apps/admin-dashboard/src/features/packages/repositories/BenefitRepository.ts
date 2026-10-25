import type { BenefitItem, CreateBenefitPayload, UpdateBenefitPayload, BenefitQueryParams } from '../models/BenefitModel'
import type { ApiResponse, PageResponse } from '@nuy-laundry/shared-types'
import { apiClient } from '../../../shared/api/apiClient'

export interface IBenefitRepository {
  getAll(params?: BenefitQueryParams): Promise<BenefitItem[]>
  getById(id: string): Promise<BenefitItem>
  create(payload: CreateBenefitPayload): Promise<BenefitItem>
  update(id: string, payload: UpdateBenefitPayload): Promise<BenefitItem>
  delete(id: string): Promise<void>
}

export class BenefitRepository implements IBenefitRepository {
  async getAll(params?: BenefitQueryParams): Promise<BenefitItem[]> {
    try {
      const res = await apiClient.get<ApiResponse<PageResponse<any> | any[]>>('/api/v1/benefits', {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 100,
          name: params?.name || undefined,
          sortBy: params?.sortBy || 'createdAt',
          direction: params?.direction || 'desc'
        }
      })

      let rawList: any[] = []
      if (res.data?.data) {
        if ('content' in res.data.data && Array.isArray((res.data.data as PageResponse<any>).content)) {
          rawList = (res.data.data as PageResponse<any>).content
        } else if (Array.isArray(res.data.data)) {
          rawList = res.data.data
        }
      }

      return rawList.map(this.normalizeBenefit)
    } catch (err: any) {
      if (err?.response) {
        throw new Error(err.response?.data?.message || err.message || 'Gagal memuat benefit')
      }
      return []
    }
  }

  async getById(id: string): Promise<BenefitItem> {
    const res = await apiClient.get<ApiResponse<any>>(`/api/v1/benefits/${id}`)
    if (res.data?.data) {
      return this.normalizeBenefit(res.data.data)
    }
    throw new Error('Benefit tidak ditemukan')
  }

  async create(payload: CreateBenefitPayload): Promise<BenefitItem> {
    if (!payload.name?.trim()) throw new Error('Nama benefit wajib diisi')
    const res = await apiClient.post<ApiResponse<any>>('/api/v1/benefits', {
      name: payload.name.trim()
    })
    if (res.data?.data) {
      return this.normalizeBenefit(res.data.data)
    }
    throw new Error('Gagal menambahkan benefit')
  }

  async update(id: string, payload: UpdateBenefitPayload): Promise<BenefitItem> {
    if (!id || !payload.name?.trim()) throw new Error('Nama benefit wajib diisi')
    const res = await apiClient.put<ApiResponse<any>>(`/api/v1/benefits/${id}`, {
      name: payload.name.trim()
    })
    if (res.data?.data) {
      return this.normalizeBenefit(res.data.data)
    }
    throw new Error('Gagal memperbarui benefit')
  }

  async delete(id: string): Promise<void> {
    if (!id) return
    await apiClient.delete(`/api/v1/benefits/${id}`)
  }

  private normalizeBenefit(raw: any): BenefitItem {
    return {
      id: raw.id,
      name: raw.name,
      createdAt: raw.createdAt
    }
  }
}
