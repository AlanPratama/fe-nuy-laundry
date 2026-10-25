import React, { useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../features/auth/providers/useAuthStore'
import { UserProfileModal } from '../../features/auth/components/UserProfileModal'
import { useSettingsStore } from '../../features/settings/providers/useSettingsStore'
import { resolveImageUrl } from '../../shared/utils/imageUrl'
import { 
  LayoutDashboard, 
  Receipt, 
  Package, 
  Users, 
  UserCog, 
  Settings, 
  LogOut,
  Sparkles,
  BookOpen,
  Menu,
  X
} from 'lucide-react'

interface Props {
  children?: React.ReactNode
}

export const AdminLayout: React.FC<Props> = ({ children }) => {
  const { user, token, logout, syncCurrentUser } = useAuthStore()
  const { profile, fetchProfile } = useSettingsStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  const canManage = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

  useEffect(() => {
    fetchProfile(token || undefined)
    syncCurrentUser()
  }, [token, fetchProfile, syncCurrentUser])

  const allNavItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/transactions', label: 'Transaksi (POS)', icon: Receipt },
    { to: '/packages', label: 'Paket Laundry', icon: Package },
    { to: '/articles', label: 'Artikel & Tips', icon: BookOpen },
    { to: '/customers', label: 'Pelanggan', icon: Users },
    { to: '/staff', label: 'Staff Kasir', icon: UserCog },
    { to: '/settings', label: 'Pengaturan', icon: Settings, adminOnly: true },
  ]

  const navItems = allNavItems.filter(item => !item.adminOnly || canManage)

  const closeDrawer = () => setIsMobileMenuOpen(false)

  const getRoleLabel = (role?: string) => {
    if (role === 'SUPER_ADMIN') return 'Super Admin'
    if (role === 'ADMIN') return 'Admin Outlet'
    return 'Staff Kasir'
  }

  const renderNavLinks = () => (
    <nav className="p-4 space-y-1.5">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = location.pathname === item.to || (item.to === '/dashboard' && location.pathname === '/')
        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={closeDrawer}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition ${
              isActive
                ? 'bg-brand-50 text-brand-600 shadow-sm'
                : 'text-ink-soft hover:bg-brand-50/60 hover:text-ink font-medium'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )

  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const renderUserProfile = () => (
    <div className="p-4 border-t border-brand-50">
      <div className="p-2.5 rounded-2xl bg-brand-50/60 flex items-center justify-between hover:bg-brand-100/60 transition group">
        <button
          type="button"
          onClick={() => setIsProfileOpen(true)}
          className="flex items-center gap-2.5 overflow-hidden text-left flex-1 min-w-0"
          title="Klik untuk edit profil akun"
        >
          {user?.profilePicture ? (
            <img
              src={resolveImageUrl(user.profilePicture)}
              alt={user.name || 'User'}
              className="w-9 h-9 rounded-full object-cover shrink-0 shadow-soft border border-brand-200 aspect-square"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-brand-600 text-white font-bold text-xs grid place-items-center shrink-0 shadow-soft">
              {user?.name ? user.name[0] : 'A'}
            </div>
          )}
          <div className="truncate flex-1">
            <p className="text-xs font-bold text-ink truncate group-hover:text-brand-600 transition">
              {user?.name || 'Administrator'}
            </p>
            <p className="text-[10px] text-brand-600 font-semibold uppercase">{getRoleLabel(user?.role)}</p>
          </div>
        </button>

        <button 
          onClick={logout}
          title="Logout"
          className="w-8 h-8 rounded-xl hover:bg-white text-ink-soft hover:text-rose-600 grid place-items-center transition shrink-0 ml-1"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  )

  const outletHeader = profile?.outletName
    ? `${profile.outletName} • Buka ${profile.openHour || '08.00'} - ${profile.closeHour || '20.00'} WIB`
    : 'Nuy Laundry • Layanan Laundry Profesional'

  return (
    <div className="min-h-screen bg-[#F8F9FD] w-full">
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-brand-50 flex flex-col justify-between hidden lg:flex z-30">
        <div>
          <div className="h-20 flex items-center px-6 gap-2.5 border-b border-brand-50">
            {profile?.logoUrl ? (
              <img
                src={resolveImageUrl(profile.logoUrl)}
                alt="Logo"
                className="w-10 h-10 rounded-2xl object-cover shadow-soft border border-brand-100"
              />
            ) : (
              <span className="w-10 h-10 rounded-2xl bg-brand-600 grid place-items-center shadow-soft">
                <span className="w-5 h-5 rounded-full border-[3px] border-white relative">
                  <span className="absolute inset-1 rounded-full bg-sun"></span>
                </span>
              </span>
            )}
            <span className="text-xl font-extrabold tracking-tight">Nuy<span className="text-brand-600">Admin</span></span>
          </div>

          {renderNavLinks()}
        </div>

        {renderUserProfile()}
      </aside>

      {isMobileMenuOpen && (
        <div 
          onClick={closeDrawer}
          className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
        />
      )}

      <aside 
        className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white z-50 flex flex-col justify-between shadow-2xl transition-transform duration-300 lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="h-20 flex items-center justify-between px-6 border-b border-brand-50">
            <div className="flex items-center gap-2.5">
              {profile?.logoUrl ? (
                <img
                  src={resolveImageUrl(profile.logoUrl)}
                  alt="Logo"
                  className="w-10 h-10 rounded-2xl object-cover shadow-soft border border-brand-100"
                />
              ) : (
                <span className="w-10 h-10 rounded-2xl bg-brand-600 grid place-items-center shadow-soft">
                  <span className="w-5 h-5 rounded-full border-[3px] border-white relative">
                    <span className="absolute inset-1 rounded-full bg-sun"></span>
                  </span>
                </span>
              )}
              <span className="text-xl font-extrabold tracking-tight">Nuy<span className="text-brand-600">Admin</span></span>
            </div>

            <button 
              onClick={closeDrawer}
              className="w-9 h-9 rounded-full bg-brand-50 text-ink hover:bg-brand-100 grid place-items-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {renderNavLinks()}
        </div>

        {renderUserProfile()}
      </aside>

      <div className="lg:pl-64 flex flex-col min-h-screen min-w-0 w-full">
        <header className="h-16 sm:h-20 bg-white/95 backdrop-blur-md border-b border-brand-50 px-3 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 w-full min-w-0 shadow-xs">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 mr-2">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden w-10 h-10 rounded-2xl bg-brand-50 text-ink hover:bg-brand-100 grid place-items-center transition shrink-0"
              aria-label="Buka Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 truncate">
              <Sparkles className="w-4 h-4 text-sun shrink-0 hidden sm:inline" />
              <span className="text-xs font-semibold text-ink-soft truncate">
                {outletHeader}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <a 
              href="http://localhost:3000" 
              target="_blank" 
              rel="noreferrer"
              className="text-[11px] sm:text-xs font-semibold text-brand-600 bg-brand-50 px-3 sm:px-3.5 py-1.5 rounded-full hover:bg-brand-100 transition whitespace-nowrap"
            >
              Web Customer ↗
            </a>
            <button 
              onClick={logout}
              title="Keluar"
              className="lg:hidden p-2 rounded-xl text-ink-soft hover:text-rose-600"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0">
          {children || <Outlet />}
        </main>
      </div>

      <UserProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />
    </div>
  )
}
