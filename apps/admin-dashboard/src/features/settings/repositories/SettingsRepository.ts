import type { OutletProfile, StaffUser, CreateStaffPayload, UpdateStaffPayload, StaffQueryParams, StaffPageResult } from '../models/SettingsModel'
import type { ApiResponse, PageResponse } from '@nuy-laundry/shared-types'
import { apiClient } from '../../../shared/api/apiClient'

export interface StaffMetrics {
  totalStaff: number
  activeStaff: number
  inactiveStaff: number
  adminCount: number
  cashierCount: number
}

export interface ISettingsRepository {
  getProfile(token?: string): Promise<OutletProfile>
  updateProfile(token?: string, profile?: OutletProfile): Promise<OutletProfile>
  getStaffList(token?: string, params?: StaffQueryParams): Promise<StaffPageResult>
  addStaff(token?: string, payload?: CreateStaffPayload): Promise<StaffUser>
  updateStaff(token?: string, id?: string, payload?: UpdateStaffPayload): Promise<StaffUser>
  deleteStaff(token?: string, id?: string): Promise<void>
  getStaffMetrics(token?: string): Promise<StaffMetrics>
}

export class SettingsRepository implements ISettingsRepository {
  async getStaffMetrics(_token?: string): Promise<StaffMetrics> {
    try {
      const res = await apiClient.get<ApiResponse<StaffMetrics>>('/api/v1/users/metrics')
      if (res.data?.data) return res.data.data
    } catch (e) {
      console.error('Failed to get staff metrics', e)
    }
    return {
      totalStaff: 0,
      activeStaff: 0,
      inactiveStaff: 0,
      adminCount: 0,
      cashierCount: 0
    }
  }
  async getProfile(_token?: string): Promise<OutletProfile> {
    try {
      const res = await apiClient.get<ApiResponse<OutletProfile>>('/api/v1/outlet/profile')
      if (res.data?.data) return res.data.data
    } catch {
      // Return neutral empty profile
    }

    return {
      outletName: 'Nuy Laundry',
      address: '',
      phone: '',
      openHour: '08:00',
      closeHour: '20:00',
      freeRadiusKm: 0,
      extraCostPerKm: 0,
      receiptFooterNote: 'Terima kasih telah menggunakan jasa kami',
      logoUrl: '',
      latitude: null,
      longitude: null,
      googleMapsUrl: '',
      instagram: ''
    }
  }

  async updateProfile(_token?: string, profile?: OutletProfile): Promise<OutletProfile> {
    if (!profile) throw new Error('Profile required')

    if (profile.file) {
      const formData = new FormData()
      const { file, ...jsonPart } = profile
      formData.append('request', new Blob([JSON.stringify(jsonPart)], { type: 'application/json' }))
      formData.append('file', file)
      const res = await apiClient.put<ApiResponse<OutletProfile>>('/api/v1/outlet/profile', formData)
      if (res.data?.data) return res.data.data
    } else {
      const res = await apiClient.put<ApiResponse<OutletProfile>>('/api/v1/outlet/profile', profile)
      if (res.data?.data) return res.data.data
    }

    throw new Error('Gagal memperbarui profil outlet')
  }

  async getStaffList(_token?: string, params?: StaffQueryParams): Promise<StaffPageResult> {
    const page = params?.page ?? 0
    const size = params?.size ?? 10

    try {
      const res = await apiClient.get<ApiResponse<PageResponse<any>>>('/api/v1/users', {
        params: {
          page,
          size,
          name: params?.name || undefined,
          role: (params?.role && params.role !== 'ALL') ? params.role : undefined,
          sortBy: params?.sortBy || 'createdAt',
          direction: params?.direction || 'desc'
        }
      })

      if (res.data?.data?.content && Array.isArray(res.data.data.content)) {
        let mapped = res.data.data.content.map(this.normalizeStaff)
        const totalElements = res.data.data.totalElements ?? mapped.length
        const totalPages = res.data.data.totalPages ?? Math.max(1, Math.ceil(totalElements / size))

        return {
          staffList: mapped,
          totalElements,
          totalPages,
          page,
          size
        }
      }
    } catch (err: any) {
      if (err?.response) {
        throw new Error(err.response?.data?.message || err.message || 'Gagal memuat daftar staff')
      }
    }

    return {
      staffList: [],
      totalElements: 0,
      totalPages: 1,
      page,
      size
    }
  }

  async addStaff(_token?: string, payload?: CreateStaffPayload): Promise<StaffUser> {
    if (!payload) throw new Error('Payload required')

    const passwordToSend = payload.password && payload.password.length >= 8 
      ? payload.password 
      : 'Password123!'

    const requestDTO = {
      name: payload.name,
      username: payload.username,
      password: passwordToSend,
      phone: payload.phone || '',
      address: payload.address || '',
      role: payload.role
    }

    const formData = new FormData()
    formData.append(
      'request',
      new Blob([JSON.stringify(requestDTO)], { type: 'application/json' })
    )
    if (payload.file) {
      formData.append('file', payload.file)
    }

    const res = await apiClient.post<ApiResponse<any>>('/api/v1/users', formData)
    if (res.data?.data) {
      return this.normalizeStaff(res.data.data)
    }

    throw new Error('Gagal menambahkan staff')
  }

  async updateStaff(_token?: string, id?: string, payload?: UpdateStaffPayload): Promise<StaffUser> {
    if (!id || !payload) throw new Error('ID dan data pengguna wajib diisi')

    const requestDTO = {
      name: payload.name,
      username: payload.username,
      phone: payload.phone || '',
      address: payload.address || '',
      role: payload.role,
      isActive: payload.isActive,
      removeProfilePicture: Boolean(payload.removeProfilePicture)
    }

    const formData = new FormData()
    formData.append(
      'request',
      new Blob([JSON.stringify(requestDTO)], { type: 'application/json' })
    )
    if (payload.file) {
      formData.append('file', payload.file)
    }

    const res = await apiClient.put<ApiResponse<any>>(`/api/v1/users/${id}`, formData)
    if (res.data?.data) {
      return this.normalizeStaff(res.data.data)
    }

    throw new Error('Gagal memperbarui data staff')
  }

  async deleteStaff(_token?: string, id?: string): Promise<void> {
    if (!id) return
    await apiClient.delete(`/api/v1/users/${id}`)
  }

  private normalizeStaff(raw: any): StaffUser {
    return {
      id: raw.id,
      username: raw.username,
      name: raw.name,
      role: raw.role || 'STAFF',
      phone: raw.phone || '-',
      address: raw.address,
      profilePicture: raw.profilePicture,
      createdAt: raw.createdAt || new Date().toISOString(),
      isActive: raw.isActive !== undefined ? Boolean(raw.isActive) : true
    }
  }
}
