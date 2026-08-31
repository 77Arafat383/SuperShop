export type UserRole = 'Administrator' | 'Inventory Manager' | 'Purchase Manager' | 'Cashier';

export type UserStatus = 'Active' | 'Pending Approval' | 'Inactive' | 'Suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  requestedRole?: UserRole;
  status: UserStatus;
  phone?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  productCount?: number;
}

export interface SuppliedProduct {
  productId: string;
  productName: string;
  sku: string;
  supplierPrice: number;
  minOrderQuantity?: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  paymentTerms?: string;
  status: 'Active' | 'Inactive';
  totalPurchased: number;
  totalPaid: number;
  totalDue: number;
  suppliedProducts: SuppliedProduct[];
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  description: string;
  categoryId: string;
  categoryName: string;
  brand: string;
  purchasePrice: number;
  sellingPrice: number;
  discount: number; // Discount percentage or fixed BDT
  stockQuantity: number;
  minStockLevel: number;
  unit: string; // pcs, kg, box, bottle, pair
  supplierId: string;
  supplierName: string;
  imageUrl?: string;
  status: 'Active' | 'Inactive' | 'Discontinued';
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  customPrice?: number;
  customDiscount?: number;
  subtotal: number;
}

export type PaymentMethod = 'Cash' | 'bKash' | 'Nagad' | 'Card' | 'Split';

export interface PaymentDetails {
  method: PaymentMethod;
  cashTendered?: number;
  changeGiven?: number;
  trxId?: string;
  mobileNumber?: string;
  cardLast4?: string;
  cardType?: string;
  authCode?: string;
  splitCash?: number;
  splitDigital?: number;
  splitDigitalMethod?: 'bKash' | 'Nagad' | 'Card';
}

export interface SaleItem {
  productId: string;
  productName: string;
  barcode: string;
  sku: string;
  unitPrice: number;
  discount: number;
  quantity: number;
  subtotal: number;
  costPrice: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  cashierId: string;
  cashierName: string;
  customerName: string;
  customerPhone?: string;
  items: SaleItem[];
  subtotal: number;
  discountTotal: number;
  taxRate: number; // e.g. 5%
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  changeAmount: number;
  paymentMethod: PaymentMethod;
  paymentDetails: PaymentDetails;
  saleDate: string;
  status: 'Completed' | 'Refunded' | 'Cancelled';
  notes?: string;
}

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  sku: string;
  unitCost: number;
  quantity: number;
  subtotal: number;
}

export interface PurchasePaymentRecord {
  id: string;
  paymentDate: string;
  amountPaid: number;
  previousDue: number;
  remainingDue: number;
  paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Bank Transfer';
  transactionRef: string;
  receiptNumber: string;
  notes?: string;
  recordedBy: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  supplierPhone: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: 'Draft' | 'Requested' | 'Accepted' | 'Received' | 'Cancelled';
  paymentStatus: 'Paid' | 'Partial' | 'Due';
  orderDate: string;
  receivedDate?: string;
  createdBy: string;
  notes?: string;
  paymentHistory: PurchasePaymentRecord[];
}

export interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  adjustmentType: 'Stock In' | 'Stock Out' | 'Correction';
  quantityBefore: number;
  quantityChange: number;
  quantityAfter: number;
  reason: string;
  date: string;
  adjustedBy: string;
}

export interface ProductReturn {
  id: string;
  returnNumber: string;
  saleId: string;
  invoiceNumber: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  refundAmount: number;
  reason: string;
  returnDate: string;
  processedBy: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}

export interface DashboardMetrics {
  todaySales: number;
  todayTransactions: number;
  netRevenue: number;
  monthlyPurchases: number;
  yearlyPurchases: number;
  lowStockCount: number;
  totalProductReturns: number;
  returnRate: number;
  totalProfit: number;
  totalProducts: number;
  totalSuppliers: number;
  totalUsers: number;
  pendingApprovals: number;
}
