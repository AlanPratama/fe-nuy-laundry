import type { LoginRequestDTO, LoginResponseDTO, UserProfileDTO } from '../models/AuthModel'
import type { ApiResponse } from '@nuy-laundry/shared-types'
import { apiClient } from '../../../shared/api/apiClient'

export interface IAuthRepository {
  login(payload: LoginRequestDTO): Promise<{ token: string; user: UserProfileDTO }>
}

export class AuthRepository implements IAuthRepository {
  async login(payload: LoginRequestDTO): Promise<{ token: string; user: UserProfileDTO }> {
    try {
      const res = await apiClient.post<ApiResponse<LoginResponseDTO>>('/api/auth/login', {
        username: payload.username,
        password: payload.password,
        deviceInfo: payload.deviceInfo || 'Admin-Web-Dashboard'
      })

      const accessToken = res.data?.data?.accessToken
      if (accessToken) {
        let decodedPayload: any = {}
        try {
          const base64Url = accessToken.split('.')[1]
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
          decodedPayload = JSON.parse(decodeURIComponent(escape(atob(base64))))
        } catch {
          // Token decode fallback
        }

        let userProfile: UserProfileDTO = {
          id: decodedPayload.userId || 'USR-1',
          username: decodedPayload.sub || payload.username,
          name: decodedPayload.name || payload.username,
          role: decodedPayload.role || 'STAFF'
        }

        try {
          const meRes = await apiClient.get<ApiResponse<any>>('/api/auth/me', {
            headers: { Authorization: `Bearer ${accessToken}` }
          })
          if (meRes.data?.data) {
            const me = meRes.data.data
            userProfile = {
              id: me.id || userProfile.id,
              username: me.username || userProfile.username,
              name: me.name || userProfile.name,
              role: me.role || userProfile.role
            }
          }
        } catch {
          // Profile fetch fallback
        }

        return {
          token: accessToken,
          user: userProfile
        }
      }

      throw new Error(res.data?.message || 'Login gagal, token tidak diterima.')
    } catch (err: any) {
      const serverMessage = err?.response?.data?.message || err?.message
      if (err?.response) {
        throw new Error(serverMessage || 'Kredensial login tidak valid.')
      }

      if (!err?.response) {
        throw new Error('Tidak dapat terhubung ke server backend (Network Error). Pastikan server aktif di port 8080.')
      }

      throw err
    }
  }
}
