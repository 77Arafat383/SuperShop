'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Product, Category, Supplier, PurchaseOrder, Sale, 
  StockAdjustment, ProductReturn, DashboardMetrics, CartItem,
  PaymentMethod, PaymentDetails, PurchasePaymentRecord
} from '@/types';
import { 
  INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_SUPPLIERS, 
  INITIAL_PURCHASES, INITIAL_SALES, INITIAL_ADJUSTMENTS, INITIAL_RETURNS 
} from '@/lib/mockData';
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

      setProducts(getOrSet(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS));
      setCategories(getOrSet(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES));
      setSuppliers(getOrSet(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS));
      setPurchases(getOrSet(STORAGE_KEYS.PURCHASES, INITIAL_PURCHASES));
      setSales(getOrSet(STORAGE_KEYS.SALES, INITIAL_SALES));
      setAdjustments(getOrSet(STORAGE_KEYS.ADJUSTMENTS, INITIAL_ADJUSTMENTS));
      setReturns(getOrSet(STORAGE_KEYS.RETURNS, INITIAL_RETURNS));
    } catch (e) {
      console.error('Error hydrating data from localStorage:', e);
      setProducts(INITIAL_PRODUCTS);
      setCategories(INITIAL_CATEGORIES);
      setSuppliers(INITIAL_SUPPLIERS);
      setPurchases(INITIAL_PURCHASES);
      setSales(INITIAL_SALES);
      setAdjustments(INITIAL_ADJUSTMENTS);
      setReturns(INITIAL_RETURNS);
    }
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
    return newProduct;
  };

  const updateProduct = (id: string, productUpdates: Partial<Product>) => {
    const updated = products.map(p => 
      p.id === id ? { ...p, ...productUpdates, updatedAt: new Date().toISOString() } : p
    );
    saveProducts(updated);
  };

  const deleteProduct = (id: string) => {
    const updated = products.filter(p => p.id !== id);
    saveProducts(updated);
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
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    saveCategories(categories.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCategory = (id: string) => {
    saveCategories(categories.filter(c => c.id !== id));
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
    return newSupplier;
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    saveSuppliers(suppliers.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteSupplier = (id: string) => {
    saveSuppliers(suppliers.filter(s => s.id !== id));
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
      updateProduct(prod.id, { stockQuantity: qtyAfter });

      saveAdjustments([{
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
      }, ...adjustments]);
    }

    saveReturns([retRecord, ...returns]);
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
    saveProducts(INITIAL_PRODUCTS);
    saveCategories(INITIAL_CATEGORIES);
    saveSuppliers(INITIAL_SUPPLIERS);
    savePurchases(INITIAL_PURCHASES);
    saveSales(INITIAL_SALES);
    saveAdjustments(INITIAL_ADJUSTMENTS);
    saveReturns(INITIAL_RETURNS);
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
