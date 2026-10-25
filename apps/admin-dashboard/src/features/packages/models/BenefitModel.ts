export interface BenefitItem {
  id: string
  name: string
  createdAt?: string
}

export interface CreateBenefitPayload {
  name: string
}

export interface UpdateBenefitPayload {
  name: string
}

export interface BenefitQueryParams {
  page?: number
  size?: number
  name?: string
  sortBy?: string
  direction?: 'asc' | 'desc'
}
