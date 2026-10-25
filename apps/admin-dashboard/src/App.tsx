import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './features/auth/pages/LoginPage'
import { AdminLayout } from './components/layout/AdminLayout'
import { DashboardOverviewPage } from './features/dashboard/pages/DashboardOverviewPage'
import { TransactionsPage } from './features/transactions/pages/TransactionsPage'
import { PackagesPage } from './features/packages/pages/PackagesPage'
import { ArticlesPage } from './features/articles/pages/ArticlesPage'
import { ArticleEditorPage } from './features/articles/pages/ArticleEditorPage'
import { CustomersPage } from './features/customers/pages/CustomersPage'
import { StaffPage } from './features/settings/pages/StaffPage'
import { SettingsPage } from './features/settings/pages/SettingsPage'
import { ProtectedRoute, AdminOnlyRoute, PublicRoute } from './routes/ProtectedRoute'
import { ToastProvider } from './components/ui/Toast'

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />

        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardOverviewPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/packages" element={<PackagesPage />} />
            <Route path="/articles" element={<ArticlesPage />} />
            <Route path="/articles/create" element={<ArticleEditorPage />} />
            <Route path="/articles/edit/:id" element={<ArticleEditorPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/staff" element={<StaffPage />} />

            <Route element={<AdminOnlyRoute />}>
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App
