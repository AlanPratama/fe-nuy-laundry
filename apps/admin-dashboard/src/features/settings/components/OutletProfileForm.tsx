import React, { useState, useEffect, useRef } from 'react'
import type { OutletProfile } from '../models/SettingsModel'
import { PhoneInput } from '../../../components/ui/PhoneInput'
import { CurrencyInput } from '../../../components/ui/CurrencyInput'
import { FormField } from '../../../components/ui/FormField'
import { validators } from '../../../shared/utils/validators'
import { resolveImageUrl } from '../../../shared/utils/imageUrl'
import { Save, CheckCircle2, Store, MapPin, Instagram, UploadCloud, X, Image as ImageIcon, ExternalLink, Navigation, Crosshair } from 'lucide-react'

interface Props {
  initialProfile: OutletProfile | null
  canManage?: boolean
  onSave: (profile: OutletProfile) => Promise<void>
}

export const OutletProfileForm: React.FC<Props> = ({ 
  initialProfile, 
  canManage = true, 
  onSave 
}) => {
  const [profile, setProfile] = useState<OutletProfile>({
    outletName: '',
    address: '',
    phone: '',
    openHour: '08:00',
    closeHour: '20:00',
    freeRadiusKm: 0,
    extraCostPerKm: 0,
    receiptFooterNote: '',
    logoUrl: '',
    latitude: null,
    longitude: null,
    googleMapsUrl: '',
    instagram: ''
  })

  const [logoPreview, setLogoPreview] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isSaving, setIsSaving] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Browser Anda tidak mendukung deteksi lokasi (Geolocation).')
      return
    }
    setIsGettingLocation(true)
    setLocationError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6))
        const lng = parseFloat(pos.coords.longitude.toFixed(6))
        setProfile((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          googleMapsUrl: prev.googleMapsUrl || `https://www.google.com/maps?q=${lat},${lng}`
        }))
        setIsGettingLocation(false)
      },
      (err) => {
        setLocationError(`Gagal mendeteksi lokasi: ${err.message}`)
        setIsGettingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile)
      if (initialProfile.logoUrl) {
        setLogoPreview(resolveImageUrl(initialProfile.logoUrl))
      }
    }
  }, [initialProfile])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setLogoPreview(uploadEvent.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = () => {
    setSelectedFile(null)
    setLogoPreview('')
    setProfile((prev) => ({ ...prev, logoUrl: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}

    if (!validators.isNotEmpty(profile.outletName)) {
      errs.outletName = 'Nama outlet laundry wajib diisi.'
    }

    if (!validators.isPhone(profile.phone)) {
      errs.phone = 'Nomor WhatsApp outlet tidak valid (minimal 9 digit).'
    }

    if (!validators.isNotEmpty(profile.address)) {
      errs.address = 'Alamat outlet wajib diisi.'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    validate()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canManage) return

    setTouched({
      outletName: true,
      phone: true,
      address: true
    })

    if (!validate()) return

    setIsSaving(true)
    try {
      await onSave({
        ...profile,
        file: selectedFile || undefined
      })
      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 4000)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="p-6 sm:p-8 rounded-3xl bg-white border border-brand-50 shadow-card space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-brand-50">
        <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 grid place-items-center">
          <Store className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-ink">Identitas & Informasi Outlet</h3>
          <p className="text-xs text-ink-soft">Data ini dicetak di struk nota kasir dan ditampilkan pada halaman pelacakan pelanggan.</p>
        </div>
      </div>

      {/* Logo Outlet Uploader */}
      <FormField label="Logo Resmi Outlet" sublabel="PNG, JPG, atau WebP (Disarankan rasio 1:1)">
        <div className="flex items-center gap-4">
          {logoPreview ? (
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-brand-100 bg-brand-50 shrink-0 group shadow-xs">
              <img
                src={logoPreview}
                alt="Logo Outlet"
                className="w-full h-full object-cover"
              />
              {canManage && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="absolute inset-0 bg-ink/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  title="Hapus logo"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-brand-50 border border-brand-100 text-brand-600 grid place-items-center shrink-0">
              <ImageIcon className="w-8 h-8 opacity-40" />
            </div>
          )}

          {canManage && (
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleLogoChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl border border-brand-200 hover:border-brand-600 hover:bg-brand-50 text-xs font-bold text-ink transition inline-flex items-center gap-2 shadow-xs"
              >
                <UploadCloud className="w-4 h-4 text-brand-600" />
                <span>{logoPreview ? 'Ganti Logo Outlet' : 'Unggah Logo Outlet'}</span>
              </button>
              <p className="text-[11px] text-ink-soft mt-1">
                Logo akan ditampilkan pada header aplikasi dan nota cetak pelanggan.
              </p>
            </div>
          )}
        </div>
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField
          label="Nama Outlet Laundry"
          required
          error={touched.outletName ? errors.outletName : null}
        >
          <input 
            type="text"
            disabled={!canManage}
            value={profile.outletName}
            onChange={(e) => {
              setProfile({ ...profile, outletName: e.target.value })
              if (touched.outletName) validate()
            }}
            onBlur={() => handleBlur('outletName')}
            placeholder="Contoh: Nuy Laundry Outlet Melati"
            className={`w-full px-4 py-3 rounded-2xl text-sm transition focus:outline-none disabled:bg-gray-50 disabled:text-gray-500 ${
              touched.outletName && errors.outletName
                ? 'bg-rose-50/30 border border-rose-400 focus:border-rose-500 text-rose-900'
                : 'bg-brand-50/40 border border-brand-100 focus:border-brand-600 focus:bg-white'
            }`}
          />
        </FormField>

        <FormField
          label="No. WhatsApp Layanan"
          sublabel="Hanya angka & -"
          required
          error={touched.phone ? errors.phone : null}
        >
          <PhoneInput
            disabled={!canManage}
            value={profile.phone}
            onChange={(cleanVal) => {
              setProfile({ ...profile, phone: cleanVal })
              if (touched.phone) validate()
            }}
            onBlur={() => handleBlur('phone')}
            placeholder="0812-xxxx-xxxx"
            error={!!(touched.phone && errors.phone)}
          />
        </FormField>
      </div>

      <FormField
        label="Alamat Lengkap Operasional"
        required
        error={touched.address ? errors.address : null}
      >
        <textarea 
          rows={2}
          disabled={!canManage}
          value={profile.address}
          onChange={(e) => {
            setProfile({ ...profile, address: e.target.value })
            if (touched.address) validate()
          }}
          onBlur={() => handleBlur('address')}
          placeholder="Jl. Melati Raya No. 12, Kelurahan, Kecamatan..."
          className={`w-full px-4 py-3 rounded-2xl text-sm transition focus:outline-none disabled:bg-gray-50 disabled:text-gray-500 ${
            touched.address && errors.address
              ? 'bg-rose-50/30 border border-rose-400 focus:border-rose-500 text-rose-900'
              : 'bg-brand-50/40 border border-brand-100 focus:border-brand-600 focus:bg-white'
          }`}
        />
      </FormField>

      {/* Geolocation: Latitude & Longitude */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField label="Latitude (Titik Garis Lintang)" sublabel="Contoh: -6.2088">
          <div className="relative">
            <input 
              type="number"
              step="any"
              disabled={!canManage}
              value={profile.latitude ?? ''}
              onChange={(e) => {
                const val = e.target.value === '' ? null : parseFloat(e.target.value)
                setProfile({ ...profile, latitude: val })
              }}
              placeholder="-6.2088"
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-brand-50/40 border border-brand-100 text-sm focus:border-brand-600 focus:bg-white focus:outline-none transition disabled:bg-gray-50"
            />
            <MapPin className="w-4 h-4 text-ink-soft absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </FormField>

        <FormField label="Longitude (Titik Garis Bujur)" sublabel="Contoh: 106.8456">
          <div className="relative">
            <input 
              type="number"
              step="any"
              disabled={!canManage}
              value={profile.longitude ?? ''}
              onChange={(e) => {
                const val = e.target.value === '' ? null : parseFloat(e.target.value)
                setProfile({ ...profile, longitude: val })
              }}
              placeholder="106.8456"
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-brand-50/40 border border-brand-100 text-sm focus:border-brand-600 focus:bg-white focus:outline-none transition disabled:bg-gray-50"
            />
            <MapPin className="w-4 h-4 text-ink-soft absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </FormField>
      </div>

      {/* Interactive Map Preview */}
      {(() => {
        const hasCoords = 
          typeof profile.latitude === 'number' && 
          typeof profile.longitude === 'number' && 
          !isNaN(profile.latitude) && 
          !isNaN(profile.longitude)
        const lat = hasCoords ? (profile.latitude as number) : -6.2088
        const lng = hasCoords ? (profile.longitude as number) : 106.8456
        const delta = 0.005
        const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`
        const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`
        const googleMapsDirectUrl = profile.googleMapsUrl || `https://www.google.com/maps?q=${lat},${lng}`

        return (
          <div className="rounded-3xl border border-brand-100/90 bg-brand-50/20 p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-ink">Preview Peta Lokasi Outlet</h4>
                  <p className="text-[11px] text-ink-soft">
                    {hasCoords 
                      ? `Koordinat: ${lat.toFixed(5)}, ${lng.toFixed(5)}`
                      : 'Menampilkan titik preview default (masukkan koordinat di atas untuk pin presisi)'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {canManage && (
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={isGettingLocation}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-brand-200 bg-white hover:bg-brand-50 text-brand-700 text-xs font-bold transition disabled:opacity-60 shadow-xs"
                    title="Gunakan koordinat GPS perangkat Anda saat ini"
                  >
                    <Crosshair className={`w-3.5 h-3.5 ${isGettingLocation ? 'animate-spin' : ''}`} />
                    <span>{isGettingLocation ? 'Mencari Lokasi...' : 'Ambil Lokasi Saya'}</span>
                  </button>
                )}
                <a
                  href={googleMapsDirectUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-brand-300 bg-white hover:bg-brand-50/50 text-ink text-xs font-bold transition shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-brand-600" />
                  <span>Buka di Google Maps</span>
                </a>
              </div>
            </div>

            {locationError && (
              <p className="text-xs text-rose-600 bg-rose-50 px-3 py-2 rounded-xl border border-rose-200">
                {locationError}
              </p>
            )}

            {/* Map Frame */}
            <div className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden border border-brand-100 bg-brand-50 shadow-inner group">
              <iframe
                title="Peta Lokasi Outlet"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={mapUrl}
                className="w-full h-full filter saturate-[1.15] contrast-[1.02]"
                loading="lazy"
              />
              <div className="absolute bottom-2.5 right-2.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-semibold text-ink-soft border border-brand-100 pointer-events-none shadow-xs">
                © OpenStreetMap
              </div>
            </div>
          </div>
        )
      })()}

      {/* Social & Maps Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField label="Link Google Maps" sublabel="URL tautan lokasi toko di Google Maps">
          <div className="relative flex items-center">
            <input 
              type="url"
              disabled={!canManage}
              value={profile.googleMapsUrl || ''}
              onChange={(e) => setProfile({ ...profile, googleMapsUrl: e.target.value })}
              placeholder="https://maps.google.com/?q=..."
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-brand-50/40 border border-brand-100 text-sm focus:border-brand-600 focus:bg-white focus:outline-none transition disabled:bg-gray-50"
            />
            <MapPin className="w-4 h-4 text-ink-soft absolute left-4 top-1/2 -translate-y-1/2" />
            {profile.googleMapsUrl && (
              <a
                href={profile.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="absolute right-3 p-1.5 rounded-lg text-brand-600 hover:bg-brand-50 transition"
                title="Buka Google Maps"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </FormField>

        <FormField label="Akun Instagram" sublabel="Username atau link akun Instagram">
          <div className="relative flex items-center">
            <input 
              type="text"
              disabled={!canManage}
              value={profile.instagram || ''}
              onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
              placeholder="@nuylaundry atau link IG"
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-brand-50/40 border border-brand-100 text-sm focus:border-brand-600 focus:bg-white focus:outline-none transition disabled:bg-gray-50"
            />
            <Instagram className="w-4 h-4 text-ink-soft absolute left-4 top-1/2 -translate-y-1/2" />
            {profile.instagram && (
              <a
                href={profile.instagram.startsWith('http') ? profile.instagram : `https://instagram.com/${profile.instagram.replace(/^@/, '')}`}
                target="_blank"
                rel="noreferrer"
                className="absolute right-3 p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                title="Buka Instagram"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Jam Buka Outlet">
            <input 
              type="time"
              disabled={!canManage}
              value={profile.openHour}
              onChange={(e) => setProfile({ ...profile, openHour: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl bg-brand-50/40 border border-brand-100 text-sm focus:border-brand-600 focus:bg-white focus:outline-none transition disabled:bg-gray-50"
            />
          </FormField>
          <FormField label="Jam Tutup Outlet">
            <input 
              type="time"
              disabled={!canManage}
              value={profile.closeHour}
              onChange={(e) => setProfile({ ...profile, closeHour: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl bg-brand-50/40 border border-brand-100 text-sm focus:border-brand-600 focus:bg-white focus:outline-none transition disabled:bg-gray-50"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Gratis Antar Jemput">
            <div className="relative">
              <input 
                type="number"
                disabled={!canManage}
                value={profile.freeRadiusKm}
                onChange={(e) => setProfile({ ...profile, freeRadiusKm: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-4 py-3 rounded-2xl bg-brand-50/40 border border-brand-100 text-sm focus:border-brand-600 focus:bg-white focus:outline-none transition disabled:bg-gray-50 pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-soft">km</span>
            </div>
          </FormField>

          <FormField label="Ongkir Ekstra / km">
            <CurrencyInput
              disabled={!canManage}
              value={profile.extraCostPerKm}
              onChange={(val) => setProfile({ ...profile, extraCostPerKm: val })}
              placeholder="2.000"
            />
          </FormField>
        </div>
      </div>

      <FormField label="Catatan Kaki Struk / Nota Digital">
        <input 
          type="text"
          disabled={!canManage}
          value={profile.receiptFooterNote}
          onChange={(e) => setProfile({ ...profile, receiptFooterNote: e.target.value })}
          className="w-full px-4 py-3 rounded-2xl bg-brand-50/40 border border-brand-100 text-sm focus:border-brand-600 focus:bg-white focus:outline-none transition disabled:bg-gray-50"
        />
      </FormField>

      {canManage && (
        <div className="pt-4 border-t border-brand-50 flex items-center justify-between">
          {isSuccess ? (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Pengaturan outlet berhasil diperbarui!
            </span>
          ) : (
            <span></span>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 rounded-full bg-brand-600 text-white font-semibold text-xs shadow-soft hover:bg-brand-700 active:scale-95 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
          </button>
        </div>
      )}
    </form>
  )
}
