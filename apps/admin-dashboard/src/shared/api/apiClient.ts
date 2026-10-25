import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nuy_token')
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }

    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const resData = error.response?.data
    if (resData) {
      if (resData.message) {
        error.message = resData.message
      } else if (resData.error) {
        error.message = resData.error
      } else if (resData.errors) {
        if (typeof resData.errors === 'string') {
          error.message = resData.errors
        } else if (Array.isArray(resData.errors)) {
          error.message = resData.errors.join(', ')
        } else if (typeof resData.errors === 'object') {
          const firstErr = Object.values(resData.errors)[0]
          if (Array.isArray(firstErr)) {
            error.message = firstErr.join(', ')
          } else if (typeof firstErr === 'string') {
            error.message = firstErr
          } else {
            error.message = JSON.stringify(resData.errors)
          }
        }
      }
    }

    if (error.response?.status === 403) {
      error.message = resData?.message || 'Akses ditolak: Anda tidak memiliki izin untuk melakukan tindakan ini.'
    }

    const isLoginEndpoint = error.config?.url?.includes('/api/auth/login')
    if (error.response?.status === 401 && !isLoginEndpoint) {
      localStorage.removeItem('nuy_token')
      localStorage.removeItem('nuy_user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)
