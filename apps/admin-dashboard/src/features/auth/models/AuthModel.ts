import type { LoginRequestDTO, LoginResponseDTO, UserProfileDTO } from '@nuy-laundry/shared-types'

export type { LoginRequestDTO, LoginResponseDTO, UserProfileDTO }

export interface AuthState {
  user: UserProfileDTO | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}
