import type { PackageType } from '@nuy-laundry/shared-types'
import type { BenefitItem } from './BenefitModel'

export type { PackageType }

export interface PackageItem {
  id: string
  name: string
  type: PackageType
  price: number
  unit: string
  description?: string
  daysEstimation: number
  estimateHours: number
  photo?: string
  benefitIds?: string[]
  benefits?: BenefitItem[]
  isActive: boolean
  isPopular?: boolean
  createdAt?: string
}

export interface CreatePackagePayload {
  name: string
  type: PackageType
  price: number
  unit: string
  description?: string
  daysEstimation: number
  estimateHours?: number
  benefitIds: string[]
  file?: File
  removePhoto?: boolean
  isPopular?: boolean
}

export interface UpdatePackagePayload extends Partial<CreatePackagePayload> {
  isActive?: boolean
}

export interface PackageQueryParams {
  name?: string
  description?: string
  type?: PackageType
  status?: 'ALL' | 'ACTIVE' | 'INACTIVE'
  sortBy?: 'createdAt' | 'price' | 'estimateHours'
  direction?: 'asc' | 'desc'
}
