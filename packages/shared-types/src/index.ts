/**
 * API Response Wrapper Ground Truth from Backend Spring Boot
 */
export interface ApiResponse<T> {
  status: 'SUCCESS' | 'FAILED';
  message: string;
  timestamp: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

/**
 * Transaction Status & Types
 */
export type TransactionStatus = 'IN_PROGRESS' | 'DONE' | 'CANCELED';
export type PaymentStatus = 'UNPAID' | 'DOWN_PAYMENT' | 'PAID';
export type PackageType = 'WEIGHT' | 'PCS';
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'STAFF';

export interface Benefit {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Package / Laundry Service Model
 */
export interface LaundryPackage {
  id: string;
  name: string;
  type: PackageType;
  price: number;
  unit: string; // e.g. "kg" or "pcs"
  description?: string;
  daysEstimation?: number;
  estimateHours?: number;
  photo?: string;
  benefitIds?: string[];
  benefits?: Benefit[];
  isPopular?: boolean;
}

/**
 * Transaction File Model (MinIO storage)
 */
export interface TransactionFile {
  id: string;
  fileUrl: string;
  fileType: 'PAYMENT_RECEIPT' | 'INVOICE_DOCUMENT' | 'CONDITION_BEFORE' | 'CONDITION_AFTER' | 'OTHER';
}

/**
 * Transaction Detail Item
 */
export interface TransactionItem {
  id: string;
  packageId: string;
  packageName: string;
  packageType: PackageType;
  pricePerUnit: number;
  quantity: number; // e.g. 5.5 kg or 2 pcs
  subtotal: number;
  notes?: string;
  targetDate?: string;
  deliveredDate?: string | null;
}

/**
 * Transaction Response DTO (Matches backend TransactionResponseDTO)
 */
export interface TransactionResponseDTO {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  customerId?: string;
  picName?: string;
  picPhone?: string;
  targetDate?: string;
  orderDate?: string;
  status: TransactionStatus;
  downPayment?: number;
  remainingBalance?: number;
  paymentStatus?: PaymentStatus;
  totalAmount: number;
  items: TransactionItem[];
  paymentReceiptUrl?: string;
  invoiceDocumentUrl?: string;
  conditionBeforeUrls: string[];
  conditionAfterUrls: string[];
  otherUrls: string[];
  transactionFiles?: Array<{
    id: string;
    filePath?: string;
    fileUrl?: string;
    fileType?: string;
  }>;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Auth Types
 */
export interface LoginRequestDTO {
  username: string;
  password: string;
  deviceInfo?: string;
}

export interface LoginResponseDTO {
  accessToken: string;
  refreshToken: string;
  deviceInfo?: string;
}

export interface UserProfileDTO {
  id: string;
  username: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  role: UserRole;
  profilePicture?: string;
  isActive?: boolean;
}

/**
 * Article Model for Web Customer
 */
export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'Tips Perawatan' | 'Panduan Bahan' | 'Info & Promo';
  readingTime: string;
  author: string;
  publishedAt: string;
  thumbnailUrl: string;
  tags?: string[];
}
