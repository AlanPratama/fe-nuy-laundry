import type { PackageItem, CreatePackagePayload, UpdatePackagePayload, PackageQueryParams } from '../models/PackageModel'
import type { ApiResponse, PageResponse } from '@nuy-laundry/shared-types'
import { apiClient } from '../../../shared/api/apiClient'

export interface PackageMetrics {
  totalPackages: number
  activePackages: number
  weightPackages: number
  piecePackages: number
}

export interface IPackageRepository {
  getAll(token?: string, params?: PackageQueryParams): Promise<PackageItem[]>
  create(token?: string, payload?: CreatePackagePayload): Promise<PackageItem>
  update(token?: string, id?: string, payload?: UpdatePackagePayload): Promise<PackageItem>
  delete(token?: string, id?: string): Promise<void>
  getMetrics(token?: string): Promise<PackageMetrics>
}

export class PackageRepository implements IPackageRepository {
  async getMetrics(_token?: string): Promise<PackageMetrics> {
    try {
      const res = await apiClient.get<ApiResponse<PackageMetrics>>('/api/v1/packages/metrics')
      if (res.data?.data) return res.data.data
    } catch (e) {
      console.error('Failed to get package metrics', e)
    }
    return {
      totalPackages: 0,
      activePackages: 0,
      weightPackages: 0,
      piecePackages: 0
    }
  }
  async getAll(_token?: string, params?: PackageQueryParams): Promise<PackageItem[]> {
    try {
      const res = await apiClient.get<ApiResponse<PageResponse<any> | any[]>>('/api/v1/packages', {
        params: {
          page: 0,
          size: 50,
          name: params?.name || undefined,
          description: params?.description || undefined,
          type: params?.type || undefined,
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

      if (rawList.length > 0) {
        return rawList.map(this.normalizePackage)
      }
    } catch (err: any) {
      if (err?.response) {
        throw new Error(err.response?.data?.message || err.message || 'Gagal memuat data paket')
      }
    }

    return []
  }

  async create(_token?: string, payload?: CreatePackagePayload): Promise<PackageItem> {
    if (!payload) throw new Error('Payload required')

    const daysEstimation = payload.daysEstimation || Math.max(1, Math.round((payload.estimateHours || 24) / 24))
    const benefitIds = (payload.benefitIds && payload.benefitIds.length > 0) 
      ? payload.benefitIds 
      : await this.resolveValidBenefitIds()

    const requestDTO = {
      name: payload.name,
      description: payload.description || 'Layanan laundry profesional terpercaya',
      type: payload.type,
      price: payload.price,
      daysEstimation,
      benefitIds
    }

    const formData = new FormData()
    formData.append(
      'request',
      new Blob([JSON.stringify(requestDTO)], { type: 'application/json' })
    )
    if (payload.file) {
      formData.append('file', payload.file)
    }

    const res = await apiClient.post<ApiResponse<any>>('/api/v1/packages', formData)
    if (res.data?.data) {
      return this.normalizePackage(res.data.data)
    }

    throw new Error('Gagal menambahkan paket baru')
  }

  async update(_token?: string, id?: string, payload?: UpdatePackagePayload): Promise<PackageItem> {
    if (!id || !payload) throw new Error('ID and payload required')

    const daysEstimation = payload.daysEstimation || Math.max(1, Math.round((payload.estimateHours || 24) / 24))
    const rawBenefitIds = (payload.benefitIds && payload.benefitIds.length > 0) 
      ? payload.benefitIds 
      : await this.resolveValidBenefitIds(id)
    const benefitIds = Array.from(new Set(rawBenefitIds.filter(Boolean)))

    const requestDTO = {
      name: payload.name || 'Paket Layanan',
      description: payload.description || 'Layanan laundry profesional terpercaya',
      type: payload.type || 'WEIGHT',
      price: payload.price || 8000,
      daysEstimation,
      benefitIds,
      removePhoto: Boolean(payload.removePhoto)
    }

    const formData = new FormData()
    formData.append(
      'request',
      new Blob([JSON.stringify(requestDTO)], { type: 'application/json' })
    )
    if (payload.file) {
      formData.append('file', payload.file)
    }

    const res = await apiClient.put<ApiResponse<any>>(`/api/v1/packages/${id}`, formData)
    if (res.data?.data) {
      return this.normalizePackage(res.data.data)
    }

    throw new Error('Gagal memperbarui data paket')
  }

  async delete(_token?: string, id?: string): Promise<void> {
    if (!id) return
    await apiClient.delete(`/api/v1/packages/${id}`)
  }

  private async resolveValidBenefitIds(existingPackageId?: string): Promise<string[]> {
    if (existingPackageId) {
      try {
        const pkgRes = await apiClient.get<ApiResponse<any>>(`/api/v1/packages/${existingPackageId}`)
        if (pkgRes.data?.data?.benefitIds && Array.isArray(pkgRes.data.data.benefitIds) && pkgRes.data.data.benefitIds.length > 0) {
          return Array.from(new Set(pkgRes.data.data.benefitIds))
        }
      } catch {
        // Fall through
      }
    }

    try {
      const benRes = await apiClient.get<ApiResponse<any>>('/api/v1/benefits', { params: { size: 5 } })
      const benContent = benRes.data?.data?.content || benRes.data?.data
      if (Array.isArray(benContent) && benContent.length > 0 && benContent[0]?.id) {
        return [benContent[0].id]
      }
    } catch {
      // Fall through
    }

    return []
  }

  private normalizePackage(raw: any): PackageItem {
    const days = raw.daysEstimation || Math.max(1, Math.round((raw.estimateHours || 24) / 24))
    const estimateHours = raw.estimateHours || days * 24
    const unit = raw.unit || (raw.type === 'WEIGHT' ? 'kg' : 'pcs')
    const benefitIds = raw.benefitIds || (raw.benefits ? raw.benefits.map((b: any) => b.id) : [])

    return {
      id: raw.id,
      name: raw.name,
      type: raw.type || 'WEIGHT',
      price: Number(raw.price || 0),
      unit,
      description: raw.description,
      daysEstimation: days,
      estimateHours,
      photo: raw.photo,
      benefitIds,
      benefits: raw.benefits || [],
      isActive: raw.isActive !== undefined ? raw.isActive : true,
      isPopular: raw.isPopular || false,
      createdAt: raw.createdAt
    }
  }
}

