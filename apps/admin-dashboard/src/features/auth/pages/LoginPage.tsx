import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../providers/useAuthStore'
import { LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('Admin123!')
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading, error, clearError } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login({ username, password, deviceInfo: 'Admin-Browser-Vite' })
      navigate('/dashboard')
    } catch {
      // Handled in store
    }
  }

  const handleUsernameChange = (val: string) => {
    setUsername(val)
    if (error) clearError()
  }

  const handlePasswordChange = (val: string) => {
    setPassword(val)
    if (error) clearError()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-b from-brand-50/60 to-white">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-card border border-brand-50">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 grid place-items-center shadow-soft mx-auto mb-4">
            <div className="w-7 h-7 rounded-full border-[3px] border-white relative">
              <span className="absolute inset-1.5 rounded-full bg-sun"></span>
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-ink tracking-tight">
            Nuy<span className="text-brand-600">Laundry</span> Admin
          </h1>
          <p className="text-sm text-ink-soft mt-1">Masuk untuk mengelola operasional kasir & pesanan</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-900 mb-0.5">Gagal Masuk</p>
              <p className="leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
              Username
            </label>
            <input 
              type="text"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              required
              className="w-full px-4 py-3.5 rounded-2xl bg-brand-50/40 border border-brand-100 text-ink text-sm focus:border-brand-600 focus:bg-white focus:outline-none transition"
              placeholder="Masukkan username kasir..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                required
                className="w-full pl-4 pr-11 py-3.5 rounded-2xl bg-brand-50/40 border border-brand-100 text-ink text-sm focus:border-brand-600 focus:bg-white focus:outline-none transition"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-ink-soft hover:text-ink transition rounded-lg"
                title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-4 rounded-full bg-brand-600 text-white font-semibold shadow-soft hover:bg-brand-700 active:scale-95 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Masuk ke Dashboard</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-brand-50 text-center text-xs text-ink-soft space-y-1">
          <p>Kredensial Default: <span className="font-semibold text-ink">admin</span> / <span className="font-semibold text-ink">Admin123!</span></p>
          <p className="text-[11px] text-ink-muted">Atau akun perf: <span className="font-semibold text-ink">perf_admin</span> / <span className="font-semibold text-ink">Password123!</span></p>
        </div>
      </div>
    </div>
  )
}
