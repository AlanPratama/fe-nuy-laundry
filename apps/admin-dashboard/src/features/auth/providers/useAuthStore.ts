import { create } from 'zustand'
import type { AuthState, LoginRequestDTO } from '../models/AuthModel'
import { AuthRepository } from '../repositories/AuthRepository'
import { apiClient } from '../../../shared/api/apiClient'

interface AuthStore extends AuthState {
  login: (payload: LoginRequestDTO) => Promise<void>
  logout: () => void
  clearError: () => void
  syncCurrentUser: () => Promise<void>
}

const authRepo = new AuthRepository()

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: localStorage.getItem('nuy_user') ? JSON.parse(localStorage.getItem('nuy_user')!) : null,
  token: localStorage.getItem('nuy_token'),
  isAuthenticated: !!localStorage.getItem('nuy_token'),
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  login: async (payload: LoginRequestDTO) => {
    set({ isLoading: true, error: null })
    try {
      const { token, user } = await authRepo.login(payload)
      localStorage.setItem('nuy_token', token)
      localStorage.setItem('nuy_user', JSON.stringify(user))
      set({ token, user, isAuthenticated: true, isLoading: false, error: null })
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Login gagal'
      set({ error: errorMsg, isLoading: false })
      throw err
    }
  },

  syncCurrentUser: async () => {
    const { user: current } = get()
    const token = localStorage.getItem('nuy_token')
    if (!token || !current?.id) return

    try {
      const res = await apiClient.get<any>(`/api/v1/users/${current.id}`)
      if (res.data?.data) {
        const fresh = res.data.data
        const updated = {
          ...current,
          ...fresh,
          name: fresh.name || current.name,
          username: fresh.username || current.username,
          phone: fresh.phone ?? current.phone,
          address: fresh.address ?? current.address,
          role: fresh.role || current.role,
          profilePicture: fresh.profilePicture !== undefined ? fresh.profilePicture : current.profilePicture
        }
        localStorage.setItem('nuy_user', JSON.stringify(updated))
        set({ user: updated })
      }
    } catch (err) {
      console.warn('Failed to sync current user from server:', err)
    }
  },

  logout: () => {
    localStorage.removeItem('nuy_token')
    localStorage.removeItem('nuy_user')
    set({ user: null, token: null, isAuthenticated: false, error: null })
  }
}))
