export type Role = "CUSTOMER" | "ADMIN";

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "CONFIRMED"
  | "IN_PRODUCTION"
  | "QUALITY_CHECK"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export type CustomRequestStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "QUOTE_SENT"
  | "APPROVED"
  | "IN_PRODUCTION"
  | "SHIPPED"
  | "COMPLETED"
  | "REJECTED";

export type QuoteStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  isActive: boolean;
  productCount?: number;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string | null;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  salePrice?: number | null;
  costPrice?: number | null;
  stockQuantity: number;
  lowStockThreshold: number;
  material: string;
  colorOptions: string[];
  dimensions?: string | null;
  productionTimeDays: number;
  isFeatured: boolean;
  isActive: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  categoryId: string;
  category?: Category;
  images: ProductImage[];
  rating?: number;
  reviewsCount?: number;
  stlUrl?: string | null; // Optional 3D preview file
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  selectedColor?: string | null;
  notes?: string | null;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CustomPrintFile {
  id: string;
  filename: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  estimatedVolumeCm3?: number | null;
  boundingBox?: { x: number; y: number; z: number } | null;
}

export interface CustomPrintQuote {
  id: string;
  requestId: string;
  unitPrice: number;
  quantity: number;
  materialCost?: number | null;
  laborCost?: number | null;
  shippingCost: number;
  totalAmount: number;
  productionTimeDays: number;
  validUntil: string;
  adminMessage?: string | null;
  status: QuoteStatus;
}

export interface CustomPrintMessage {
  id: string;
  requestId: string;
  senderId?: string | null;
  senderRole: Role;
  senderName: string;
  message: string;
  createdAt: string;
}

export interface CustomPrintRequest {
  id: string;
  requestNumber: string;
  userId?: string | null;
  guestEmail?: string | null;
  guestName?: string | null;
  guestPhone?: string | null;
  projectTitle: string;
  description: string;
  intendedUse?: string | null;
  quantity: number;
  dimensions?: string | null;
  preferredMaterial: string;
  preferredColor?: string | null;
  finish?: string | null;
  targetBudget?: number | null;
  deadline?: string | null;
  shippingAddress?: ShippingAddress | null;
  internalNotes?: string | null;
  status: CustomRequestStatus;
  files: CustomPrintFile[];
  quote?: CustomPrintQuote | null;
  messages?: CustomPrintMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId?: string | null;
  product?: Product | null;
  title: string;
  sku?: string | null;
  price: number;
  quantity: number;
  selectedColor?: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string | null;
  customerEmail: string;
  customerPhone?: string | null;
  status: OrderStatus;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  shippingDetails?: ShippingAddress | null;
  internalNotes?: string | null;
  items: OrderItem[];
  trackingNumber?: string | null;
  carrier?: string | null;
  customRequestId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  minOrderValue: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  timesUsed: number;
  isActive: boolean;
}
