'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Product, Category, Supplier, PurchaseOrder, Sale,
  StockAdjustment, ProductReturn, DashboardMetrics, CartItem,
  PaymentMethod, PaymentDetails, PurchasePaymentRecord
} from '@/types';
import {
  generateInvoiceNumber, generatePONumber, generateReceiptNumber,
  generateReturnNumber
} from '@/lib/utils';

interface DataContextType {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  purchases: PurchaseOrder[];
  sales: Sale[];
  adjustments: StockAdjustment[];
  returns: ProductReturn[];
  metrics: DashboardMetrics;

  // Product Operations
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Product;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductByBarcode: (barcode: string) => Product | undefined;

  // Category Operations
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Supplier Operations
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'totalPurchased' | 'totalPaid' | 'totalDue'>) => Supplier;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  // Purchase & Supplier Payment Operations
  createPurchaseOrder: (data: {
    supplierId: string;
    items: { productId: string; quantity: number; unitCost: number }[];
    paidAmount: number;
    paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Bank Transfer';
    transactionRef?: string;
    notes?: string;
    createdBy: string;
  }) => { po: PurchaseOrder; receipt?: PurchasePaymentRecord };

  receivePurchaseOrder: (poId: string, receivedBy: string) => void;

  recordSupplierPayment: (data: {
    purchaseId: string;
    amountPaid: number;
    paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Bank Transfer';
    transactionRef: string;
    notes?: string;
    recordedBy: string;
  }) => PurchasePaymentRecord;

  // POS & Sale Operations
  processSale: (data: {
    cashierId: string;
    cashierName: string;
    customerName: string;
    customerPhone?: string;
    cartItems: CartItem[];
    taxRate: number;
    discountTotal: number;
    paymentMethod: PaymentMethod;
    paymentDetails: PaymentDetails;
    notes?: string;
  }) => Sale;

  // Inventory Adjustment Operations
  adjustStock: (data: {
    productId: string;
    adjustmentType: 'Stock In' | 'Stock Out' | 'Correction';
    quantityChange: number;
    reason: string;
    adjustedBy: string;
  }) => void;

  // Returns Operations
  processReturn: (data: {
    saleId: string;
    invoiceNumber: string;
    productId: string;
    quantity: number;
    reason: string;
    processedBy: string;
  }) => ProductReturn;

  // Reset demo data
  resetToDefaultData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'rbms_products_v2',
  CATEGORIES: 'rbms_categories_v2',
  SUPPLIERS: 'rbms_suppliers_v2',
  PURCHASES: 'rbms_purchases_v2',
  SALES: 'rbms_sales_v2',
  ADJUSTMENTS: 'rbms_adjustments_v2',
  RETURNS: 'rbms_returns_v2',
};

const titleFromId = (id?: string) => {
  if (!id) return 'General';
  return id
    .replace(/^cat_/, '')
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const toNumber = (value: unknown) => Number(value ?? 0);

const mapSupplierFromApi = (supplier: any): Supplier => ({
  id: supplier.id,
  name: supplier.name,
  contactPerson: supplier.contactPerson ?? supplier.contact_person ?? '',
  phone: supplier.phone ?? '',
  email: supplier.email ?? '',
  address: supplier.address ?? '',
  paymentTerms: supplier.paymentTerms ?? supplier.payment_terms ?? 'Net 30',
  status: supplier.status ?? 'Active',
  totalPurchased: toNumber(supplier.totalPurchased ?? supplier.total_purchased),
  totalPaid: toNumber(supplier.totalPaid ?? supplier.total_paid),
  totalDue: toNumber(supplier.totalDue ?? supplier.total_due),
  suppliedProducts: supplier.suppliedProducts ?? [],
  createdAt: supplier.createdAt ?? supplier.created_at ?? new Date().toISOString(),
});

const mapCategoryFromApi = (category: any): Category => ({
  id: category.id,
  name: category.name,
  description: category.description ?? undefined,
  icon: category.icon ?? undefined,
  productCount: toNumber(category.productCount ?? category.product_count),
});

const mapProductFromApi = (product: any, suppliersById: Map<string, Supplier>): Product => {
  const categoryId = product.categoryId ?? product.category_id ?? '';
  const supplierId = product.supplierId ?? product.supplier_id ?? '';
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    barcode: product.barcode,
    description: product.description ?? '',
    categoryId,
    categoryName: product.categoryName ?? product.category_name ?? titleFromId(categoryId),
    brand: product.brand ?? 'Standard',
    purchasePrice: toNumber(product.purchasePrice ?? product.purchase_price),
    sellingPrice: toNumber(product.sellingPrice ?? product.selling_price),
    discount: toNumber(product.discount),
    stockQuantity: toNumber(product.stockQuantity ?? product.stock_quantity),
    minStockLevel: toNumber(product.minStockLevel ?? product.min_stock_level ?? 5),
    unit: product.unit ?? 'pcs',
    supplierId,
    supplierName: product.supplierName ?? product.supplier_name ?? suppliersById.get(supplierId)?.name ?? 'Local Supplier',
    imageUrl: product.imageUrl ?? product.image_url ?? undefined,
    status: product.status ?? 'Active',
    createdAt: product.createdAt ?? product.created_at ?? new Date().toISOString(),
    updatedAt: product.updatedAt ?? product.updated_at ?? new Date().toISOString(),
  };
};

const categoriesFromProducts = (products: Product[]): Category[] => {
  const byId = new Map<string, Category>();
  products.forEach(product => {
    if (!product.categoryId || byId.has(product.categoryId)) return;
    byId.set(product.categoryId, {
      id: product.categoryId,
      name: product.categoryName || titleFromId(product.categoryId),
      productCount: products.filter(p => p.categoryId === product.categoryId).length,
    });
  });
  return Array.from(byId.values());
};

const mapPurchasePaymentFromApi = (payment: any): PurchasePaymentRecord => ({
  id: payment.id,
  paymentDate: payment.paymentDate ?? payment.payment_date ?? new Date().toISOString(),
  amountPaid: toNumber(payment.amountPaid ?? payment.amount_paid),
  previousDue: toNumber(payment.previousDue ?? payment.previous_due),
  remainingDue: toNumber(payment.remainingDue ?? payment.remaining_due),
  paymentMethod: payment.paymentMethod ?? payment.payment_method,
  transactionRef: payment.transactionRef ?? payment.transaction_ref ?? '',
  receiptNumber: payment.receiptNumber ?? payment.receipt_number ?? '',
  notes: payment.notes ?? undefined,
  recordedBy: payment.recordedBy ?? payment.recorded_by ?? '',
});

const mapPurchaseFromApi = (purchase: any): PurchaseOrder => ({
  id: purchase.id,
  poNumber: purchase.poNumber ?? purchase.po_number,
  supplierId: purchase.supplierId ?? purchase.supplier_id,
  supplierName: purchase.supplierName ?? purchase.supplier_name,
  supplierPhone: purchase.supplierPhone ?? purchase.supplier_phone ?? '',
  items: (purchase.items ?? []).map((item: any) => ({
    productId: item.productId ?? item.product_id,
    productName: item.productName ?? item.product_name,
    sku: item.sku ?? '',
    unitCost: toNumber(item.unitCost ?? item.unit_cost),
    quantity: toNumber(item.quantity),
    subtotal: toNumber(item.subtotal),
  })),
  totalAmount: toNumber(purchase.totalAmount ?? purchase.total_amount),
  paidAmount: toNumber(purchase.paidAmount ?? purchase.paid_amount),
  dueAmount: toNumber(purchase.dueAmount ?? purchase.due_amount),
  status: purchase.status ?? 'Requested',
  paymentStatus: purchase.paymentStatus ?? purchase.payment_status ?? 'Due',
  orderDate: purchase.orderDate ?? purchase.order_date ?? new Date().toISOString(),
  receivedDate: purchase.receivedDate ?? purchase.received_date ?? undefined,
  createdBy: purchase.createdBy ?? purchase.created_by ?? '',
  notes: purchase.notes ?? undefined,
  paymentHistory: (purchase.paymentHistory ?? purchase.payment_history ?? []).map(mapPurchasePaymentFromApi),
});

const mapSaleFromApi = (sale: any): Sale => ({
  id: sale.id,
  invoiceNumber: sale.invoiceNumber ?? sale.invoice_number,
  cashierId: sale.cashierId ?? sale.cashier_id ?? '',
  cashierName: sale.cashierName ?? sale.cashier_name ?? '',
  customerName: sale.customerName ?? sale.customer_name ?? 'Walk-in Customer',
  customerPhone: sale.customerPhone ?? sale.customer_phone ?? undefined,
  items: (sale.items ?? []).map((item: any) => ({
    productId: item.productId ?? item.product_id,
    productName: item.productName ?? item.product_name,
    barcode: item.barcode ?? '',
    sku: item.sku ?? '',
    unitPrice: toNumber(item.unitPrice ?? item.unit_price),
    discount: toNumber(item.discount),
    quantity: toNumber(item.quantity),
    subtotal: toNumber(item.subtotal),
    costPrice: toNumber(item.costPrice ?? item.cost_price),
  })),
  subtotal: toNumber(sale.subtotal),
  discountTotal: toNumber(sale.discountTotal ?? sale.discount_total),
  taxRate: toNumber(sale.taxRate ?? sale.tax_rate),
  taxAmount: toNumber(sale.taxAmount ?? sale.tax_amount),
  totalAmount: toNumber(sale.totalAmount ?? sale.total_amount),
  paidAmount: toNumber(sale.paidAmount ?? sale.paid_amount),
  changeAmount: toNumber(sale.changeAmount ?? sale.change_amount),
  paymentMethod: sale.paymentMethod ?? sale.payment_method,
  paymentDetails: sale.paymentDetails ?? sale.payment_details ?? { method: sale.paymentMethod ?? sale.payment_method },
  saleDate: sale.saleDate ?? sale.sale_date ?? new Date().toISOString(),
  status: sale.status ?? 'Completed',
  notes: sale.notes ?? undefined,
});

const mapAdjustmentFromApi = (adjustment: any): StockAdjustment => ({
  id: adjustment.id,
  productId: adjustment.productId ?? adjustment.product_id,
  productName: adjustment.productName ?? adjustment.product_name,
  sku: adjustment.sku ?? '',
  adjustmentType: adjustment.adjustmentType ?? adjustment.adjustment_type,
  quantityBefore: toNumber(adjustment.quantityBefore ?? adjustment.quantity_before),
  quantityChange: toNumber(adjustment.quantityChange ?? adjustment.quantity_change),
  quantityAfter: toNumber(adjustment.quantityAfter ?? adjustment.quantity_after),
  reason: adjustment.reason ?? '',
  date: adjustment.date ?? new Date().toISOString(),
  adjustedBy: adjustment.adjustedBy ?? adjustment.adjusted_by ?? '',
});

const mapReturnFromApi = (productReturn: any): ProductReturn => ({
  id: productReturn.id,
  returnNumber: productReturn.returnNumber ?? productReturn.return_number,
  saleId: productReturn.saleId ?? productReturn.sale_id,
  invoiceNumber: productReturn.invoiceNumber ?? productReturn.invoice_number,
  productId: productReturn.productId ?? productReturn.product_id,
  productName: productReturn.productName ?? productReturn.product_name,
  quantity: toNumber(productReturn.quantity),
  unitPrice: toNumber(productReturn.unitPrice ?? productReturn.unit_price),
  refundAmount: toNumber(productReturn.refundAmount ?? productReturn.refund_amount),
  reason: productReturn.reason ?? '',
  returnDate: productReturn.returnDate ?? productReturn.return_date ?? new Date().toISOString(),
  processedBy: productReturn.processedBy ?? productReturn.processed_by ?? '',
  status: productReturn.status ?? 'Approved',
});

const sendJson = (url: string, method: string, body?: unknown) => {
  fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  }).catch(error => console.error(`Error calling ${url}:`, error));
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<PurchaseOrder[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [returns, setReturns] = useState<ProductReturn[]>([]);

  // Load initial state
  useEffect(() => {
    try {
      const getOrSet = (key: string, defaultVal: any) => {
        const val = localStorage.getItem(key);
        if (val) return JSON.parse(val);
        localStorage.setItem(key, JSON.stringify(defaultVal));
        return defaultVal;
      };

      setProducts(getOrSet(STORAGE_KEYS.PRODUCTS, []));
      setCategories(getOrSet(STORAGE_KEYS.CATEGORIES, []));
      setSuppliers(getOrSet(STORAGE_KEYS.SUPPLIERS, []));
      setPurchases(getOrSet(STORAGE_KEYS.PURCHASES, []));
      setSales(getOrSet(STORAGE_KEYS.SALES, []));
      setAdjustments(getOrSet(STORAGE_KEYS.ADJUSTMENTS, []));
      setReturns(getOrSet(STORAGE_KEYS.RETURNS, []));
    } catch (e) {
      console.error('Error hydrating data from localStorage:', e);
      setProducts([]);
      setCategories([]);
      setSuppliers([]);
      setPurchases([]);
      setSales([]);
      setAdjustments([]);
      setReturns([]);
    }

    const loadBackendData = async () => {
      try {
        const [productsResponse, suppliersResponse, categoriesResponse, purchasesResponse, salesResponse, adjustmentsResponse, returnsResponse] = await Promise.all([
          fetch('/api/products', { cache: 'no-store' }),
          fetch('/api/suppliers', { cache: 'no-store' }),
          fetch('/api/categories', { cache: 'no-store' }),
          fetch('/api/purchases', { cache: 'no-store' }),
          fetch('/api/sales', { cache: 'no-store' }),
          fetch('/api/adjustments', { cache: 'no-store' }),
          fetch('/api/returns', { cache: 'no-store' }),
        ]);

        if (!productsResponse.ok || !suppliersResponse.ok) return;

        const [productsResult, suppliersResult, categoriesResult, purchasesResult, salesResult, adjustmentsResult, returnsResult] = await Promise.all([
          productsResponse.json(),
          suppliersResponse.json(),
          categoriesResponse.ok ? categoriesResponse.json() : Promise.resolve({ categories: [] }),
          purchasesResponse.ok ? purchasesResponse.json() : Promise.resolve({ purchases: [] }),
          salesResponse.ok ? salesResponse.json() : Promise.resolve({ sales: [] }),
          adjustmentsResponse.ok ? adjustmentsResponse.json() : Promise.resolve({ adjustments: [] }),
          returnsResponse.ok ? returnsResponse.json() : Promise.resolve({ returns: [] }),
        ]);

        const apiSuppliers: Supplier[] = (suppliersResult.suppliers ?? []).map(mapSupplierFromApi);
        const suppliersById = new Map<string, Supplier>(apiSuppliers.map(supplier => [supplier.id, supplier]));
        const apiProducts = (productsResult.products ?? []).map((product: any) => mapProductFromApi(product, suppliersById));
        const apiCategories = (categoriesResult.categories ?? []).length > 0
          ? (categoriesResult.categories ?? []).map(mapCategoryFromApi)
          : categoriesFromProducts(apiProducts);
        const apiPurchases = (purchasesResult.purchases ?? []).map(mapPurchaseFromApi);
        const apiSales = (salesResult.sales ?? []).map(mapSaleFromApi);
        const apiAdjustments = (adjustmentsResult.adjustments ?? []).map(mapAdjustmentFromApi);
        const apiReturns = (returnsResult.returns ?? []).map(mapReturnFromApi);

        setProducts(apiProducts);
        setSuppliers(apiSuppliers);
        setCategories(apiCategories);
        setPurchases(apiPurchases);
        setSales(apiSales);
        setAdjustments(apiAdjustments);
        setReturns(apiReturns);
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(apiProducts));
        localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(apiSuppliers));
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(apiCategories));
        localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(apiPurchases));
        localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(apiSales));
        localStorage.setItem(STORAGE_KEYS.ADJUSTMENTS, JSON.stringify(apiAdjustments));
        localStorage.setItem(STORAGE_KEYS.RETURNS, JSON.stringify(apiReturns));
      } catch (error) {
        console.error('Error hydrating data from backend API:', error);
      }
    };

    loadBackendData();
  }, []);

  // Save helpers
  const saveProducts = (data: Product[]) => {
    setProducts(data);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data));
  };

  const saveCategories = (data: Category[]) => {
    setCategories(data);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data));
  };

  const saveSuppliers = (data: Supplier[]) => {
    setSuppliers(data);
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(data));
  };

  const savePurchases = (data: PurchaseOrder[]) => {
    setPurchases(data);
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(data));
  };

  const saveSales = (data: Sale[]) => {
    setSales(data);
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(data));
  };

  const saveAdjustments = (data: StockAdjustment[]) => {
    setAdjustments(data);
    localStorage.setItem(STORAGE_KEYS.ADJUSTMENTS, JSON.stringify(data));
  };

  const saveReturns = (data: ProductReturn[]) => {
    setReturns(data);
    localStorage.setItem(STORAGE_KEYS.RETURNS, JSON.stringify(data));
  };

  // ----------------------------------------------------
  // Product Operations
  // ----------------------------------------------------
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product => {
    const newProduct: Product = {
      ...productData,
      id: `prod_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newProduct, ...products];
    saveProducts(updated);
    sendJson('/api/products', 'POST', newProduct);
    return newProduct;
  };

  const updateProduct = (id: string, productUpdates: Partial<Product>) => {
    const updated = products.map(p =>
      p.id === id ? { ...p, ...productUpdates, updatedAt: new Date().toISOString() } : p
    );
    saveProducts(updated);
    const product = updated.find(p => p.id === id);
    if (product) sendJson('/api/products', 'PATCH', product);
  };

  const deleteProduct = (id: string) => {
    const updated = products.filter(p => p.id !== id);
    saveProducts(updated);
    sendJson(`/api/products?id=${encodeURIComponent(id)}`, 'DELETE');
  };

  const getProductByBarcode = (barcode: string) => {
    const clean = barcode.trim().toLowerCase();
    return products.find(p => p.barcode.toLowerCase() === clean || p.sku.toLowerCase() === clean);
  };

  // ----------------------------------------------------
  // Category Operations
  // ----------------------------------------------------
  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...categoryData,
      id: `cat_${Date.now()}`,
      productCount: 0,
    };
    saveCategories([...categories, newCat]);
    sendJson('/api/categories', 'POST', newCat);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    const updated = categories.map(c => c.id === id ? { ...c, ...updates } : c);
    saveCategories(updated);
    const category = updated.find(c => c.id === id);
    if (category) sendJson('/api/categories', 'PATCH', category);
  };

  const deleteCategory = (id: string) => {
    saveCategories(categories.filter(c => c.id !== id));
    sendJson(`/api/categories?id=${encodeURIComponent(id)}`, 'DELETE');
  };

  // ----------------------------------------------------
  // Supplier Operations
  // ----------------------------------------------------
  const addSupplier = (supplierData: Omit<Supplier, 'id' | 'createdAt' | 'totalPurchased' | 'totalPaid' | 'totalDue'>): Supplier => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: `sup_${Date.now()}`,
      totalPurchased: 0,
      totalPaid: 0,
      totalDue: 0,
      createdAt: new Date().toISOString(),
    };
    saveSuppliers([...suppliers, newSupplier]);
    sendJson('/api/suppliers', 'POST', newSupplier);
    return newSupplier;
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    const updated = suppliers.map(s => s.id === id ? { ...s, ...updates } : s);
    saveSuppliers(updated);
    const supplier = updated.find(s => s.id === id);
    if (supplier) sendJson('/api/suppliers', 'PATCH', supplier);
  };

  const deleteSupplier = (id: string) => {
    saveSuppliers(suppliers.filter(s => s.id !== id));
    sendJson(`/api/suppliers?id=${encodeURIComponent(id)}`, 'DELETE');
  };

  // ----------------------------------------------------
  // Purchase Operations (Multi-product, Due & Receipt generation)
  // ----------------------------------------------------
  const createPurchaseOrder = (data: {
    supplierId: string;
    items: { productId: string; quantity: number; unitCost: number }[];
    paidAmount: number;
    paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Bank Transfer';
    transactionRef?: string;
    notes?: string;
    createdBy: string;
  }) => {
    const supplier = suppliers.find(s => s.id === data.supplierId);
    if (!supplier) throw new Error('Supplier not found');

    const poItems = data.items.map(item => {
      const prod = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        productName: prod?.name || 'Unknown Product',
        sku: prod?.sku || '',
        unitCost: item.unitCost,
        quantity: item.quantity,
        subtotal: item.unitCost * item.quantity,
      };
    });

    const totalAmount = poItems.reduce((acc, curr) => acc + curr.subtotal, 0);
    const paidAmount = Math.min(data.paidAmount, totalAmount);
    const dueAmount = totalAmount - paidAmount;

    let paymentStatus: 'Paid' | 'Partial' | 'Due' = 'Due';
    if (paidAmount >= totalAmount) paymentStatus = 'Paid';
    else if (paidAmount > 0) paymentStatus = 'Partial';

    const poNumber = generatePONumber();
    const poId = `po_${Date.now()}`;

    let receipt: PurchasePaymentRecord | undefined;
    const paymentHistory: PurchasePaymentRecord[] = [];

    if (paidAmount > 0) {
      receipt = {
        id: `pay_rec_${Date.now()}`,
        paymentDate: new Date().toISOString(),
        amountPaid: paidAmount,
        previousDue: totalAmount,
        remainingDue: dueAmount,
        paymentMethod: data.paymentMethod,
        transactionRef: data.transactionRef || `TRX-${Date.now().toString().slice(-6)}`,
        receiptNumber: generateReceiptNumber('RCP-PUR'),
        notes: data.notes || 'Initial payment against Purchase Order',
        recordedBy: data.createdBy,
      };
      paymentHistory.push(receipt);
    }

    const newPO: PurchaseOrder = {
      id: poId,
      poNumber,
      supplierId: supplier.id,
      supplierName: supplier.name,
      supplierPhone: supplier.phone,
      items: poItems,
      totalAmount,
      paidAmount,
      dueAmount,
      status: 'Requested',
      paymentStatus,
      orderDate: new Date().toISOString(),
      createdBy: data.createdBy,
      notes: data.notes,
      paymentHistory,
    };

    savePurchases([newPO, ...purchases]);

    // Update supplier financial balances
    const updatedSuppliers = suppliers.map(s => {
      if (s.id === supplier.id) {
        return {
          ...s,
          totalPurchased: s.totalPurchased + totalAmount,
          totalPaid: s.totalPaid + paidAmount,
          totalDue: s.totalDue + dueAmount,
        };
      }
      return s;
    });
    saveSuppliers(updatedSuppliers);
    sendJson('/api/purchases', 'POST', newPO);

    return { po: newPO, receipt };
  };

  const receivePurchaseOrder = (poId: string, receivedBy: string) => {
    const po = purchases.find(p => p.id === poId);
    if (!po || po.status === 'Received') return;

    // 1. Mark PO as Received
    const updatedPurchases = purchases.map(p =>
      p.id === poId ? { ...p, status: 'Received' as const, receivedDate: new Date().toISOString() } : p
    );
    savePurchases(updatedPurchases);

    // 2. Increment stock quantities for all purchased items
    let updatedProducts = [...products];
    const newAdjustments: StockAdjustment[] = [];

    po.items.forEach(item => {
      const prod = updatedProducts.find(p => p.id === item.productId);
      if (prod) {
        const qtyBefore = prod.stockQuantity;
        const qtyAfter = qtyBefore + item.quantity;

        updatedProducts = updatedProducts.map(p =>
          p.id === prod.id ? { ...p, stockQuantity: qtyAfter, purchasePrice: item.unitCost } : p
        );

        newAdjustments.push({
          id: `adj_${Date.now()}_${item.productId}`,
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          adjustmentType: 'Stock In',
          quantityBefore: qtyBefore,
          quantityChange: item.quantity,
          quantityAfter: qtyAfter,
          reason: `Goods Received from PO #${po.poNumber}`,
          date: new Date().toISOString(),
          adjustedBy: receivedBy,
        });
      }
    });

    saveProducts(updatedProducts);
    saveAdjustments([...newAdjustments, ...adjustments]);
    sendJson('/api/purchases', 'PATCH', {
      action: 'receive',
      purchase: { ...po, status: 'Received', receivedDate: updatedPurchases.find(p => p.id === poId)?.receivedDate },
    });
    newAdjustments.forEach(adjustment => sendJson('/api/adjustments', 'POST', adjustment));
  };

  const recordSupplierPayment = (data: {
    purchaseId: string;
    amountPaid: number;
    paymentMethod: 'Cash' | 'bKash' | 'Nagad' | 'Bank Transfer';
    transactionRef: string;
    notes?: string;
    recordedBy: string;
  }): PurchasePaymentRecord => {
    const po = purchases.find(p => p.id === data.purchaseId);
    if (!po) throw new Error('Purchase Order not found');

    const previousDue = po.dueAmount;
    const actualPaid = Math.min(data.amountPaid, previousDue);
    const remainingDue = previousDue - actualPaid;

    const receipt: PurchasePaymentRecord = {
      id: `pay_rec_${Date.now()}`,
      paymentDate: new Date().toISOString(),
      amountPaid: actualPaid,
      previousDue,
      remainingDue,
      paymentMethod: data.paymentMethod,
      transactionRef: data.transactionRef,
      receiptNumber: generateReceiptNumber('RCP-DUE'),
      notes: data.notes,
      recordedBy: data.recordedBy,
    };

    const newTotalPaid = po.paidAmount + actualPaid;
    let paymentStatus: 'Paid' | 'Partial' | 'Due' = 'Due';
    if (remainingDue <= 0) paymentStatus = 'Paid';
    else if (newTotalPaid > 0) paymentStatus = 'Partial';

    const updatedPurchases = purchases.map(p => {
      if (p.id === po.id) {
        return {
          ...p,
          paidAmount: newTotalPaid,
          dueAmount: remainingDue,
          paymentStatus,
          paymentHistory: [...p.paymentHistory, receipt],
        };
      }
      return p;
    });
    savePurchases(updatedPurchases);

    // Update Supplier ledger
    const updatedSuppliers = suppliers.map(s => {
      if (s.id === po.supplierId) {
        return {
          ...s,
          totalPaid: s.totalPaid + actualPaid,
          totalDue: Math.max(0, s.totalDue - actualPaid),
        };
      }
      return s;
    });
    saveSuppliers(updatedSuppliers);
    sendJson('/api/purchases', 'PATCH', {
      action: 'payment',
      purchaseId: po.id,
      supplierId: po.supplierId,
      paidAmount: newTotalPaid,
      dueAmount: remainingDue,
      paymentStatus,
      payment: receipt,
    });

    return receipt;
  };

  // ----------------------------------------------------
  // POS & Sale Processing
  // ----------------------------------------------------
  const processSale = (data: {
    cashierId: string;
    cashierName: string;
    customerName: string;
    customerPhone?: string;
    cartItems: CartItem[];
    taxRate: number;
    discountTotal: number;
    paymentMethod: PaymentMethod;
    paymentDetails: PaymentDetails;
    notes?: string;
  }): Sale => {
    const saleItems = data.cartItems.map(item => {
      const unitPrice = item.customPrice ?? item.product.sellingPrice;
      const discount = item.customDiscount ?? item.product.discount ?? 0;
      const effectivePrice = Math.max(0, unitPrice - discount);
      return {
        productId: item.product.id,
        productName: item.product.name,
        barcode: item.product.barcode,
        sku: item.product.sku,
        unitPrice,
        discount,
        quantity: item.quantity,
        subtotal: effectivePrice * item.quantity,
        costPrice: item.product.purchasePrice,
      };
    });

    const subtotal = saleItems.reduce((acc, curr) => acc + curr.subtotal, 0);
    const taxAmount = (subtotal * data.taxRate) / 100;
    const totalAmount = Math.max(0, subtotal - data.discountTotal + taxAmount);

    let paidAmount = totalAmount;
    let changeAmount = 0;

    if (data.paymentMethod === 'Cash' && data.paymentDetails.cashTendered) {
      paidAmount = data.paymentDetails.cashTendered;
      changeAmount = Math.max(0, paidAmount - totalAmount);
    }

    const newSale: Sale = {
      id: `sale_${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(),
      cashierId: data.cashierId,
      cashierName: data.cashierName,
      customerName: data.customerName || 'Walk-in Customer',
      customerPhone: data.customerPhone,
      items: saleItems,
      subtotal,
      discountTotal: data.discountTotal,
      taxRate: data.taxRate,
      taxAmount,
      totalAmount,
      paidAmount,
      changeAmount,
      paymentMethod: data.paymentMethod,
      paymentDetails: data.paymentDetails,
      saleDate: new Date().toISOString(),
      status: 'Completed',
      notes: data.notes,
    };

    // 1. Atomic stock deduction
    let updatedProducts = [...products];
    const newAdjustments: StockAdjustment[] = [];

    data.cartItems.forEach(cartItem => {
      const prod = updatedProducts.find(p => p.id === cartItem.product.id);
      if (prod) {
        const qtyBefore = prod.stockQuantity;
        const qtyAfter = Math.max(0, qtyBefore - cartItem.quantity);

        updatedProducts = updatedProducts.map(p =>
          p.id === prod.id ? { ...p, stockQuantity: qtyAfter } : p
        );

        newAdjustments.push({
          id: `adj_sale_${Date.now()}_${prod.id}`,
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          adjustmentType: 'Stock Out',
          quantityBefore: qtyBefore,
          quantityChange: -cartItem.quantity,
          quantityAfter: qtyAfter,
          reason: `POS Sale #${newSale.invoiceNumber}`,
          date: new Date().toISOString(),
          adjustedBy: data.cashierName,
        });
      }
    });

    saveProducts(updatedProducts);
    saveAdjustments([...newAdjustments, ...adjustments]);
    saveSales([newSale, ...sales]);
    sendJson('/api/sales', 'POST', newSale);
    newAdjustments.forEach(adjustment => sendJson('/api/adjustments', 'POST', adjustment));

    return newSale;
  };

  // ----------------------------------------------------
  // Stock Adjustments
  // ----------------------------------------------------
  const adjustStock = (data: {
    productId: string;
    adjustmentType: 'Stock In' | 'Stock Out' | 'Correction';
    quantityChange: number;
    reason: string;
    adjustedBy: string;
  }) => {
    const prod = products.find(p => p.id === data.productId);
    if (!prod) return;

    const qtyBefore = prod.stockQuantity;
    let qtyAfter = qtyBefore;

    if (data.adjustmentType === 'Stock In') {
      qtyAfter = qtyBefore + Math.abs(data.quantityChange);
    } else if (data.adjustmentType === 'Stock Out') {
      qtyAfter = Math.max(0, qtyBefore - Math.abs(data.quantityChange));
    } else if (data.adjustmentType === 'Correction') {
      qtyAfter = Math.max(0, data.quantityChange); // Explicit new absolute quantity
    }

    const adjustmentRecord: StockAdjustment = {
      id: `adj_${Date.now()}`,
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      adjustmentType: data.adjustmentType,
      quantityBefore: qtyBefore,
      quantityChange: qtyAfter - qtyBefore,
      quantityAfter: qtyAfter,
      reason: data.reason,
      date: new Date().toISOString(),
      adjustedBy: data.adjustedBy,
    };

    updateProduct(prod.id, { stockQuantity: qtyAfter });
    saveAdjustments([adjustmentRecord, ...adjustments]);
    sendJson('/api/adjustments', 'POST', adjustmentRecord);
  };

  // ----------------------------------------------------
  // Product Returns
  // ----------------------------------------------------
  const processReturn = (data: {
    saleId: string;
    invoiceNumber: string;
    productId: string;
    quantity: number;
    reason: string;
    processedBy: string;
  }): ProductReturn => {
    const prod = products.find(p => p.id === data.productId);
    const unitPrice = prod?.sellingPrice || 0;
    const refundAmount = unitPrice * data.quantity;

    const retRecord: ProductReturn = {
      id: `ret_${Date.now()}`,
      returnNumber: generateReturnNumber(),
      saleId: data.saleId,
      invoiceNumber: data.invoiceNumber,
      productId: data.productId,
      productName: prod?.name || 'Returned Product',
      quantity: data.quantity,
      unitPrice,
      refundAmount,
      reason: data.reason,
      returnDate: new Date().toISOString(),
      processedBy: data.processedBy,
      status: 'Approved',
    };

    // Replenish stock for returned items
    if (prod) {
      const qtyBefore = prod.stockQuantity;
      const qtyAfter = qtyBefore + data.quantity;
      saveProducts(products.map(p => p.id === prod.id ? { ...p, stockQuantity: qtyAfter, updatedAt: new Date().toISOString() } : p));

      const returnAdjustment: StockAdjustment = {
        id: `adj_ret_${Date.now()}`,
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        adjustmentType: 'Stock In',
        quantityBefore: qtyBefore,
        quantityChange: data.quantity,
        quantityAfter: qtyAfter,
        reason: `Customer Return #${retRecord.returnNumber} from INV #${data.invoiceNumber}`,
        date: new Date().toISOString(),
        adjustedBy: data.processedBy,
      };
      saveAdjustments([returnAdjustment, ...adjustments]);
      sendJson('/api/adjustments', 'POST', returnAdjustment);
    }

    saveReturns([retRecord, ...returns]);
    sendJson('/api/returns', 'POST', retRecord);
    return retRecord;
  };

  // ----------------------------------------------------
  // Metrics Calculation (Yearly Purchases, Returns, Profit, Today Sales)
  // ----------------------------------------------------
  const metrics: DashboardMetrics = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let todaySales = 0;
    let todayTransactions = 0;
    let netRevenue = 0;
    let totalCostOfSoldGoods = 0;

    sales.forEach(sale => {
      const saleDate = new Date(sale.saleDate);
      if (sale.status === 'Completed') {
        netRevenue += sale.totalAmount;

        sale.items.forEach(item => {
          totalCostOfSoldGoods += (item.costPrice * item.quantity);
        });

        if (sale.saleDate.startsWith(todayStr)) {
          todaySales += sale.totalAmount;
          todayTransactions += 1;
        }
      }
    });

    let monthlyPurchases = 0;
    let yearlyPurchases = 0;

    purchases.forEach(po => {
      if (po.status !== 'Cancelled') {
        const orderDate = new Date(po.orderDate);
        if (orderDate.getFullYear() === currentYear) {
          yearlyPurchases += po.totalAmount;
          if (orderDate.getMonth() === currentMonth) {
            monthlyPurchases += po.totalAmount;
          }
        }
      }
    });

    const lowStockCount = products.filter(p => p.stockQuantity <= p.minStockLevel).length;

    const totalProductReturns = returns.reduce((acc, r) => acc + (r.status === 'Approved' ? r.quantity : 0), 0);
    const totalItemsSold = sales.reduce((acc, s) => acc + s.items.reduce((sum, item) => sum + item.quantity, 0), 0);
    const returnRate = totalItemsSold > 0 ? Number(((totalProductReturns / totalItemsSold) * 100).toFixed(1)) : 0;

    const totalProfit = Math.max(0, netRevenue - totalCostOfSoldGoods);

    return {
      todaySales,
      todayTransactions,
      netRevenue,
      monthlyPurchases,
      yearlyPurchases,
      lowStockCount,
      totalProductReturns,
      returnRate,
      totalProfit,
      totalProducts: products.length,
      totalSuppliers: suppliers.length,
      totalUsers: 6,
      pendingApprovals: 2,
    };
  }, [sales, purchases, products, suppliers, returns]);

  const resetToDefaultData = () => {
    saveProducts([]);
    saveCategories([]);
    saveSuppliers([]);
    savePurchases([]);
    saveSales([]);
    saveAdjustments([]);
    saveReturns([]);
  };

  return (
    <DataContext.Provider value={{
      products,
      categories,
      suppliers,
      purchases,
      sales,
      adjustments,
      returns,
      metrics,
      addProduct,
      updateProduct,
      deleteProduct,
      getProductByBarcode,
      addCategory,
      updateCategory,
      deleteCategory,
      addSupplier,
      updateSupplier,
      deleteSupplier,
      createPurchaseOrder,
      receivePurchaseOrder,
      recordSupplierPayment,
      processSale,
      adjustStock,
      processReturn,
      resetToDefaultData,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
