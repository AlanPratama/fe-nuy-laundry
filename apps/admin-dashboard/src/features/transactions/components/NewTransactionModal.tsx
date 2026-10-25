import React, { useState, useEffect } from 'react'
import type { CreateTransactionPayload, PackageType } from '../models/TransactionModel'
import type { PackageItem } from '../../packages/models/PackageModel'
import type { CustomerItem } from '../../customers/models/CustomerModel'
import { PackageRepository } from '../../packages/repositories/PackageRepository'
import { CustomerRepository } from '../../customers/repositories/CustomerRepository'
import { PhoneInput } from '../../../components/ui/PhoneInput'
import { SearchableSelect, type SearchableOption } from '../../../components/ui/SearchableSelect'
import { FormField } from '../../../components/ui/FormField'
import { validators } from '../../../shared/utils/validators'
import { ImageUploader } from './ImageUploader'
import { useToast } from '../../../components/ui/Toast'
import { X, Plus, Minus, UserPlus, Check, User, Banknote, Wallet, CreditCard, Trash2 } from 'lucide-react'

export interface CartItem {
  id: string
  packageId: string
  packageName: string
  packageType: PackageType
  quantity: number
  pricePerUnit: number
  unit: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onSubmit: (payload: CreateTransactionPayload) => Promise<void>
}

const packageRepo = new PackageRepository()
const customerRepo = new CustomerRepository()

export const NewTransactionModal: React.FC<Props> = ({ isOpen, onClose, onSubmit }) => {
  const { success, error: toastError } = useToast()

  // Customers state
  const [availableCustomers, setAvailableCustomers] = useState<CustomerItem[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')

  // Inline Add Customer Form
  const [isAddingNewCustomer, setIsAddingNewCustomer] = useState(false)
  const [newCustName, setNewCustName] = useState('')
  const [newCustPhone, setNewCustPhone] = useState('')
  const [newCustAddress, setNewCustAddress] = useState('')
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false)

  // Packages state (One to Many items)
  const [availablePackages, setAvailablePackages] = useState<PackageItem[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [beforeImages, setBeforeImages] = useState<string[]>([])
  const [beforeFiles, setBeforeFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Payment / Down Payment State
  const [paymentOption, setPaymentOption] = useState<'UNPAID' | 'DOWN_PAYMENT' | 'PAID'>('UNPAID')
  const [customDownPayment, setCustomDownPayment] = useState<string>('0')

  // Validation States
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (isOpen) {
      // Load packages
      packageRepo.getAll().then((pkgs) => {
        setAvailablePackages(pkgs)
        if (pkgs.length > 0 && cartItems.length === 0) {
          const first = pkgs[0]
          setCartItems([
            {
              id: Math.random().toString(36).substring(2, 9),
              packageId: first.id,
              packageName: first.name,
              packageType: first.type,
              quantity: 1,
              pricePerUnit: first.price,
              unit: first.unit || (first.type === 'WEIGHT' ? 'Kg' : 'Pcs')
            }
          ])
        }
      }).catch(() => {
        setAvailablePackages([])
      })

      // Load customers
      customerRepo.getAll(undefined, { size: 100, sortBy: 'name', direction: 'asc' }).then((res) => {
        setAvailableCustomers(res.customers)
        if (res.customers.length > 0 && !selectedCustomerId) {
          const firstCust = res.customers[0]
          setSelectedCustomerId(firstCust.id)
          setCustomerName(firstCust.name)
          setCustomerPhone(firstCust.phone && firstCust.phone !== '-' ? firstCust.phone : '')
          setCustomerAddress(firstCust.address && firstCust.address !== '-' ? firstCust.address : '')
        }
      }).catch(() => {
        setAvailableCustomers([])
      })
    }
  }, [isOpen])

  if (!isOpen) return null

  const customerOptions: SearchableOption[] = availableCustomers.map((c) => ({
    value: c.id,
    label: c.name,
    sublabel: `${c.phone || '-'} • ${c.address || 'Residensial'}`,
    badge: c.totalOrders > 0 ? `${c.totalOrders} order` : 'Baru'
  }))

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId)
    const found = availableCustomers.find((c) => c.id === customerId)
    if (found) {
      setCustomerName(found.name)
      setCustomerPhone(found.phone && found.phone !== '-' ? found.phone : '')
      setCustomerAddress(found.address && found.address !== '-' ? found.address : '')
    }
    if (touched.customer) validate()
  }

  const handleCreateNewCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCustName.trim()) {
      toastError('Nama pelanggan baru tidak boleh kosong')
      return
    }

    setIsCreatingCustomer(true)
    try {
      const created = await customerRepo.create(undefined, {
        name: newCustName.trim(),
        phone: newCustPhone.trim() || undefined,
        address: newCustAddress.trim() || undefined
      })

      setAvailableCustomers((prev) => [created, ...prev])
      setSelectedCustomerId(created.id)
      setCustomerName(created.name)
      setCustomerPhone(created.phone && created.phone !== '-' ? created.phone : '')
      setCustomerAddress(created.address && created.address !== '-' ? created.address : '')
      setIsAddingNewCustomer(false)
      setNewCustName('')
      setNewCustPhone('')
      setNewCustAddress('')
      success(`Pelanggan baru "${created.name}" berhasil ditambahkan dan dipilih!`)
    } catch (err: any) {
      toastError(err?.message || 'Gagal menambahkan pelanggan baru')
    } finally {
      setIsCreatingCustomer(false)
    }
  }

  const packageOptions: SearchableOption[] = availablePackages.map((p) => ({
    value: p.name,
    label: p.name,
    sublabel: `Rp${p.price.toLocaleString('id-ID')} / ${p.unit || (p.type === 'WEIGHT' ? 'Kg' : 'Pcs')} • Estimasi ${p.daysEstimation || 1} Hari`,
    badge: p.type === 'WEIGHT' ? 'Kiloan' : 'Satuan'
  }))

  const handleAddCartItem = () => {
    if (availablePackages.length === 0) return
    const defaultPkg = availablePackages[0]
    setCartItems((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        packageId: defaultPkg.id,
        packageName: defaultPkg.name,
        packageType: defaultPkg.type,
        quantity: 1,
        pricePerUnit: defaultPkg.price,
        unit: defaultPkg.unit || (defaultPkg.type === 'WEIGHT' ? 'Kg' : 'Pcs')
      }
    ])
  }

  const handleRemoveCartItem = (id: string) => {
    if (cartItems.length <= 1) return
    setCartItems((prev) => prev.filter((it) => it.id !== id))
  }

  const handleUpdateItemPackage = (id: string, selectedPackageName: string) => {
    const found = availablePackages.find((p) => p.name === selectedPackageName)
    if (!found) return
    setCartItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              packageId: found.id,
              packageName: found.name,
              packageType: found.type,
              pricePerUnit: found.price,
              unit: found.unit || (found.type === 'WEIGHT' ? 'Kg' : 'Pcs')
            }
          : it
      )
    )
  }

  const handleUpdateItemQuantity = (id: string, newQty: number) => {
    setCartItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, quantity: Math.max(0.1, newQty) } : it))
    )
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!selectedCustomerId && !customerName.trim()) {
      newErrors.customer = 'Silakan pilih pelanggan terdaftar atau buat baru.'
    }

    if (cartItems.length === 0) {
      newErrors.packages = 'Minimal pilih 1 paket layanan.'
    } else {
      const invalidQty = cartItems.some((it) => !it.quantity || it.quantity <= 0)
      if (invalidQty) {
        newErrors.packages = 'Semua jumlah paket harus lebih dari 0.'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const total = cartItems.reduce(
    (sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.pricePerUnit) || 0),
    0
  )
  const effectiveDp = paymentOption === 'PAID' 
    ? total 
    : paymentOption === 'UNPAID' 
      ? 0 
      : Math.min(total, Math.max(0, parseFloat(customDownPayment) || 0))
  const remainingBalance = Math.max(0, total - effectiveDp)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({
      customer: true,
      packages: true
    })

    if (!validate()) return

    const effectivePaymentStatus = paymentOption === 'PAID' || (effectiveDp >= total && total > 0)
      ? 'PAID'
      : effectiveDp > 0
        ? 'DOWN_PAYMENT'
        : 'UNPAID'

    setIsSubmitting(true)
    try {
      await onSubmit({
        customerId: selectedCustomerId || undefined,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || undefined,
        items: cartItems.map((it) => ({
          packageId: it.packageId,
          packageName: it.packageName,
          packageType: it.packageType,
          quantity: Number(it.quantity),
          pricePerUnit: Number(it.pricePerUnit)
        })),
        packageName: cartItems[0]?.packageName || '',
        packageType: cartItems[0]?.packageType || 'WEIGHT',
        quantity: cartItems[0]?.quantity || 1,
        pricePerUnit: cartItems[0]?.pricePerUnit || 0,
        downPayment: effectiveDp,
        paymentStatus: effectivePaymentStatus,
        conditionBeforeFiles: beforeFiles.length > 0 ? beforeFiles : undefined
      })
      success('Transaksi baru berhasil dibuat!')
      onClose()
    } catch (err: any) {
      toastError(err?.message || 'Gagal membuat transaksi baru')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Full Backdrop */}
      <div 
        className="fixed inset-0 bg-ink/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Centering wrapper */}
      <div className="min-h-full flex items-center justify-center p-4 sm:p-6 text-center">
        <div 
          className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-card border border-brand-50 relative text-left animate-in fade-in zoom-in-95 duration-200 my-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-brand-50">
            <div>
              <h3 className="text-xl font-bold text-ink">Catat Transaksi POS Baru</h3>
              <p className="text-xs text-ink-soft mt-0.5">Pilih pelanggan dan paket laundry yang dipesan</p>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-brand-50 text-ink hover:bg-brand-100 grid place-items-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
            {/* Customer Picker with Inline Create Button */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-ink uppercase tracking-wider">
                  Data Pelanggan <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingNewCustomer(!isAddingNewCustomer)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 transition active:scale-95"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{isAddingNewCustomer ? 'Batal Tambah' : '+ Pelanggan Baru'}</span>
                </button>
              </div>

              {/* Inline Form to Add Customer */}
              {isAddingNewCustomer ? (
                <div className="p-4 rounded-2xl bg-brand-50/60 border border-brand-200 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-700 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Tambah Pelanggan Cepat
                    </span>
                    <span className="text-[10px] text-ink-soft">Langsung tersimpan di database</span>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={newCustName}
                      onChange={(e) => setNewCustName(e.target.value)}
                      placeholder="Nama Lengkap Pelanggan..."
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-brand-100 text-xs text-ink focus:outline-none focus:border-brand-600 transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <PhoneInput
                      value={newCustPhone}
                      onChange={setNewCustPhone}
                      placeholder="No. WhatsApp / HP..."
                      className="!py-2 !text-xs !bg-white"
                    />
                    <input
                      type="text"
                      value={newCustAddress}
                      onChange={(e) => setNewCustAddress(e.target.value)}
                      placeholder="Alamat singkat..."
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-brand-100 text-xs text-ink focus:outline-none focus:border-brand-600 transition"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingNewCustomer(false)}
                      className="px-3 py-1.5 rounded-full text-xs font-bold text-ink-soft hover:bg-white"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      disabled={isCreatingCustomer || !newCustName.trim()}
                      onClick={handleCreateNewCustomer}
                      className="px-4 py-1.5 rounded-full bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isCreatingCustomer ? (
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>Simpan & Pilih</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <SearchableSelect
                    value={selectedCustomerId}
                    onChange={handleSelectCustomer}
                    options={customerOptions}
                    placeholder="Pilih nama pelanggan..."
                    searchPlaceholder="Cari nama, telepon, atau alamat pelanggan..."
                    error={!!(touched.customer && errors.customer)}
                  />
                  {touched.customer && errors.customer && (
                    <p className="text-xs text-rose-500 font-medium">{errors.customer}</p>
                  )}

                  {/* Selected Customer Info Badge */}
                  {selectedCustomerId && (
                    <div className="p-3 rounded-2xl bg-brand-50/40 border border-brand-50 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-ink">{customerName}</span>
                        <span className="text-ink-soft ml-2">📱 {customerPhone || '-'}</span>
                      </div>
                      <span className="text-[11px] text-brand-600 font-semibold truncate max-w-[150px]">
                        📍 {customerAddress || 'Residensial'}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Package Items (One to Many relationship) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-ink uppercase tracking-wider">
                  Daftar Paket Layanan ({cartItems.length} Paket) <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAddCartItem}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 transition active:scale-95 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Tambah Paket Lain</span>
                </button>
              </div>

              {touched.packages && errors.packages && (
                <p className="text-xs text-rose-500 font-medium">{errors.packages}</p>
              )}

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {cartItems.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="p-3.5 rounded-2xl bg-brand-50/40 border border-brand-100 space-y-2.5 relative"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-brand-600 text-white font-extrabold text-[10px] grid place-items-center">
                          {index + 1}
                        </span>
                        <span className="text-xs font-bold text-ink truncate max-w-[200px]">
                          {item.packageName || 'Pilih Paket'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          item.packageType === 'WEIGHT'
                            ? 'bg-brand-50 text-brand-600 border border-brand-100'
                            : 'bg-sun/20 text-amber-900 border border-sun/30'
                        }`}>
                          {item.packageType === 'WEIGHT' ? 'Kiloan' : 'Satuan'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-brand-600">
                          Rp{(item.quantity * item.pricePerUnit).toLocaleString('id-ID')}
                        </span>
                        {cartItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCartItem(item.id)}
                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition"
                            title="Hapus paket ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-ink-soft mb-1">
                          Pilih Paket
                        </label>
                        <SearchableSelect
                          value={item.packageName}
                          onChange={(val) => handleUpdateItemPackage(item.id, val)}
                          options={packageOptions}
                          placeholder="Pilih paket..."
                          searchPlaceholder="Ketik nama paket..."
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-ink-soft mb-1">
                          Jumlah ({item.packageType === 'WEIGHT' ? 'Kg' : 'Pcs'})
                        </label>
                        <div className="flex items-center rounded-xl p-1 bg-white border border-brand-100 shadow-xs">
                          <button
                            type="button"
                            onClick={() => {
                              const step = item.packageType === 'WEIGHT' ? 0.5 : 1
                              const nextVal = Math.max(0.5, Math.round(((Number(item.quantity) || 1) - step) * 10) / 10)
                              handleUpdateItemQuantity(item.id, nextVal)
                            }}
                            className="w-8 h-8 rounded-lg bg-brand-50 text-ink hover:bg-brand-100 grid place-items-center transition shrink-0"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <div className="flex-1 flex items-center justify-center gap-1 px-2">
                            <input
                              type="number"
                              step="0.1"
                              min="0.1"
                              value={item.quantity === 0 ? '' : item.quantity}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value)
                                handleUpdateItemQuantity(item.id, isNaN(val) ? 0 : val)
                              }}
                              className="w-full text-center font-bold text-sm text-ink bg-transparent focus:outline-none"
                              placeholder="1"
                            />
                            <span className="text-[11px] font-semibold text-ink-soft shrink-0">
                              {item.packageType === 'WEIGHT' ? 'Kg' : 'Pcs'}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const step = item.packageType === 'WEIGHT' ? 0.5 : 1
                              const nextVal = Math.round(((Number(item.quantity) || 1) + step) * 10) / 10
                              handleUpdateItemQuantity(item.id, nextVal)
                            }}
                            className="w-8 h-8 rounded-lg bg-brand-600 text-white hover:bg-brand-700 grid place-items-center transition shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Summary Banner */}
            <div className="p-4 rounded-2xl bg-brand-50/70 border border-brand-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-ink-soft">Rincian Paket:</p>
                <p className="text-xs font-bold text-ink">
                  {cartItems.length} Paket Layanan Dipilih
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-ink-soft">Total Tagihan:</p>
                <p className="text-lg font-extrabold text-brand-600">
                  Rp{total.toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            {/* Down Payment & Payment Status Section */}
            <div className="p-4 rounded-2xl bg-white border border-brand-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-ink flex items-center gap-1.5 uppercase tracking-wider">
                  <Banknote className="w-3.5 h-3.5 text-brand-600" />
                  <span>Status Pembayaran & Uang Muka (DP)</span>
                </label>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  paymentOption === 'PAID'
                    ? 'bg-emerald-100 text-emerald-700'
                    : paymentOption === 'DOWN_PAYMENT'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-rose-100 text-rose-700'
                }`}>
                  {paymentOption === 'PAID' ? 'LUNAS' : paymentOption === 'DOWN_PAYMENT' ? 'UANG MUKA (DP)' : 'BELUM BAYAR'}
                </span>
              </div>

              {/* 3 Quick Option Tabs */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentOption('UNPAID')
                    setCustomDownPayment('0')
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 border ${
                    paymentOption === 'UNPAID'
                      ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-xs'
                      : 'bg-brand-50/50 border-brand-100 text-ink-soft hover:bg-brand-100/50'
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Belum Bayar</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentOption('DOWN_PAYMENT')
                    if (!parseFloat(customDownPayment) || parseFloat(customDownPayment) >= total) {
                      setCustomDownPayment(String(Math.round(total * 0.5)))
                    }
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 border ${
                    paymentOption === 'DOWN_PAYMENT'
                      ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-xs'
                      : 'bg-brand-50/50 border-brand-100 text-ink-soft hover:bg-brand-100/50'
                  }`}
                >
                  <Banknote className="w-3.5 h-3.5" />
                  <span>Bayar DP</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentOption('PAID')
                    setCustomDownPayment(String(total))
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 border ${
                    paymentOption === 'PAID'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs'
                      : 'bg-brand-50/50 border-brand-100 text-ink-soft hover:bg-brand-100/50'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Bayar Lunas</span>
                </button>
              </div>

              {/* Down Payment Custom Amount Input if DOWN_PAYMENT */}
              {paymentOption === 'DOWN_PAYMENT' && (
                <div className="pt-2 border-t border-brand-100 space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-ink-soft">Nominal DP Diterima:</span>
                    <div className="flex items-center gap-1">
                      {[0.25, 0.5, 0.75].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setCustomDownPayment(String(Math.round(total * pct)))}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-brand-100 hover:bg-brand-200 text-brand-700 transition"
                        >
                          {pct * 100}%
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink-soft">
                      Rp
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={total}
                      value={customDownPayment}
                      onChange={(e) => setCustomDownPayment(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-brand-50/40 border border-brand-200 text-xs font-bold text-ink focus:outline-none focus:border-brand-600 transition"
                      placeholder="0"
                    />
                  </div>
                </div>
              )}

              {/* Payment Balance Breakdown */}
              <div className="pt-2 border-t border-brand-100/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-ink-soft">Sudah Dibayar: </span>
                  <span className="font-bold text-ink">Rp{effectiveDp.toLocaleString('id-ID')}</span>
                </div>
                <div className="text-right">
                  <span className="text-ink-soft">Sisa Tagihan: </span>
                  <span className={`font-bold ${remainingBalance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    Rp{remainingBalance.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* Photo Documentation Dropzone */}
            <div className="pt-2 border-t border-brand-50">
              <ImageUploader
                label="Foto Kondisi Awal Pakaian (Opsional)"
                sublabel="Unggah foto noda, luntur, atau kondisi pakaian sebelum dicuci"
                images={beforeImages}
                onAddImage={(url) => setBeforeImages((prev) => [...prev, url])}
                onAddFiles={(files) => setBeforeFiles((prev) => [...prev, ...files])}
                onRemoveImage={(idx) => {
                  setBeforeImages((prev) => prev.filter((_, i) => i !== idx))
                  setBeforeFiles((prev) => prev.filter((_, i) => i !== idx))
                }}
              />
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="pt-4 border-t border-brand-50 flex items-center justify-end gap-3">
              <button 
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-ink-soft hover:bg-brand-50 transition"
              >
                Batal
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-full bg-brand-600 text-white text-xs font-bold shadow-soft hover:bg-brand-700 active:scale-95 transition flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>{isSubmitting ? 'Menyimpan...' : 'Buat Transaksi'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
