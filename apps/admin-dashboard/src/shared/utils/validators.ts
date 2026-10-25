export const validators = {
  isNotEmpty: (val?: string | null): boolean => {
    return !!val && val.trim().length > 0
  },

  minLength: (val: string | undefined | null, min: number): boolean => {
    return !!val && val.trim().length >= min
  },

  isPhone: (val?: string | null): boolean => {
    if (!val) return false
    const digits = val.replace(/\D/g, '')
    return digits.length >= 9 && digits.length <= 15
  },

  isPositiveNumber: (val?: number | null): boolean => {
    return typeof val === 'number' && !isNaN(val) && val > 0
  },

  isMinNumber: (val: number | undefined | null, min: number): boolean => {
    return typeof val === 'number' && !isNaN(val) && val >= min
  }
}
