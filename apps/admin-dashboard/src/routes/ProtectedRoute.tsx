import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../features/auth/providers/useAuthStore'

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export const AdminOnlyRoute: React.FC = () => {
  const { user } = useAuthStore()
  const canAccess = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

  if (!canAccess) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
