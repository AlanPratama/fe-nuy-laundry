export interface OutletProfile {
  outletName: string
  address: string
  phone: string
  openHour: string
  closeHour: string
  freeRadiusKm: number
  extraCostPerKm: number
  receiptFooterNote: string
  logoUrl?: string
  file?: File
  latitude?: number | null
  longitude?: number | null
  googleMapsUrl?: string
  instagram?: string
}

export interface StaffUser {
  id: string
  username: string
  name: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF'
  phone?: string
  address?: string
  profilePicture?: string
  createdAt: string
  isActive: boolean
}

export interface CreateStaffPayload {
  username: string
  name: string
  role: 'ADMIN' | 'STAFF'
  phone?: string
  address?: string
  password?: string
  file?: File
}

export interface UpdateStaffPayload {
  username: string
  name: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF'
  phone?: string
  address?: string
  profilePicture?: string
  removeProfilePicture?: boolean
  file?: File
  isActive?: boolean
}

export interface StaffQueryParams {
  page?: number
  size?: number
  name?: string
  username?: string
  phone?: string
  role?: 'ALL' | 'SUPER_ADMIN' | 'ADMIN' | 'STAFF'
  status?: 'ALL' | 'ACTIVE' | 'INACTIVE'
  sortBy?: 'createdAt' | 'name'
  direction?: 'asc' | 'desc'
}

export interface StaffPageResult {
  staffList: StaffUser[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}
