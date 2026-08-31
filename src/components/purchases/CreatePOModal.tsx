'use client';

import React, { useState } from 'react';
import { 
  X, Truck, Plus, Trash2, ShoppingBag, CreditCard, 
  Save, Check, AlertCircle, Sparkles 
} from 'lucide-react';
import { Supplier, Product, PurchaseOrder, PurchasePaymentRecord } from '@/types';
import { formatBDT } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface CreatePOModalProps {
  isOpen: boolean;
  onClose: () => void;
  suppliers: Supplier[];
  products: Product[];
  onCreatePO: (data: any) => { po: PurchaseOrder; receipt?: PurchasePaymentRecord };
  onShowReceipt: (po: PurchaseOrder, receipt: PurchasePaymentRecord) => void;
}

export const CreatePOModal: React.FC<CreatePOModalProps> = ({
  isOpen,
  onClose,
  suppliers,
  products,
  onCreatePO,
  onShowReceipt,
}) => {
  const { currentUser } = useAuth();

  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  
  // Selected order items: Array of { productId, quantity, unitCost }
  const [orderItems, setOrderItems] = useState<Array<{ productId: string; quantity: number; unitCost: number }>>([]);
  
  // Payment Options
  const [paymentOption, setPaymentOption] = useState<'Full' | 'Partial' | 'Due'>('Full');
  const [customPaidAmount, setCustomPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'bKash' | 'Nagad' | 'Bank Transfer'>('Bank Transfer');
  const [transactionRef, setTransactionRef] = useState('');
  const [notes, setNotes] = useState('Standard replenishment stock batch');

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);

  // Filter products supplied by this supplier
  const supplierProducts = products.filter(p => p.supplierId === selectedSupplierId);

  React.useEffect(() => {
    if (suppliers.length > 0 && !selectedSupplierId) {
      setSelectedSupplierId(suppliers[0].id);
    }
  }, [suppliers, selectedSupplierId]);

  if (!isOpen) return null;

  const handleAddProductToPO = (product: Product) => {
    const existing = orderItems.find(i => i.productId === product.id);
    if (existing) {
      setOrderItems(orderItems.map(i => 
        i.productId === product.id ? { ...i, quantity: i.quantity + 10 } : i
      ));
    } else {
      setOrderItems([...orderItems, {
        productId: product.id,
        quantity: 20,
        unitCost: product.purchasePrice,
      }]);
    }
  };

  const handleUpdateQuantity = (productId: string, qty: number) => {
    setOrderItems(orderItems.map(i => 
      i.productId === productId ? { ...i, quantity: Math.max(1, qty) } : i
    ));
  };

  const handleUpdateUnitCost = (productId: string, cost: number) => {
    setOrderItems(orderItems.map(i => 
      i.productId === productId ? { ...i, unitCost: Math.max(0, cost) } : i
    ));
  };

  const handleRemoveProduct = (productId: string) => {
    setOrderItems(orderItems.filter(i => i.productId !== productId));
  };

  // Calculations
  const totalAmount = orderItems.reduce((acc, item) => acc + (item.unitCost * item.quantity), 0);
  
  let paidAmount = totalAmount;
  if (paymentOption === 'Due') {
    paidAmount = 0;
  } else if (paymentOption === 'Partial') {
    paidAmount = Math.min(totalAmount, customPaidAmount);
  }

  const dueAmount = Math.max(0, totalAmount - paidAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItems.length === 0) {
      alert('Please add at least one product to this Purchase Order');
      return;
    }

    const { po, receipt } = onCreatePO({
      supplierId: selectedSupplierId,
      items: orderItems,
      paidAmount,
      paymentMethod,
      transactionRef: transactionRef || `EFT-${Math.floor(100000 + Math.random() * 900000)}`,
      notes,
      createdBy: currentUser?.name || 'Purchase Manager',
    });

    onClose();
    // Clear state
    setOrderItems([]);
    setCustomPaidAmount(0);

    if (receipt) {
      onShowReceipt(po, receipt);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            <div>
              <h3 className="text-base font-bold">Create Supplier Purchase Order (PO)</h3>
              <p className="text-xs text-emerald-100">Select supplier products, review costs, and record payments/dues</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* 1. Supplier Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Target Supplier
            </label>
            <select
              value={selectedSupplierId}
              onChange={(e) => {
                setSelectedSupplierId(e.target.value);
                setOrderItems([]); // reset items on supplier change
              }}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            >
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} — Current Due: {formatBDT(s.totalDue)} ({s.phone})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Supplier Catalog: Products available from this supplier */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                <span>Products Catalog from {selectedSupplier?.name}:</span>
              </span>
              <span className="text-[11px] text-slate-400">Click &quot;+ Add&quot; to order</span>
            </div>

            {supplierProducts.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                No products currently mapped to this supplier.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {supplierProducts.map(prod => {
                  const isAdded = orderItems.some(i => i.productId === prod.id);

                  return (
                    <div
                      key={prod.id}
                      className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                          {prod.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Cost: {formatBDT(prod.purchasePrice)} • Stock: {prod.stockQuantity} {prod.unit}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddProductToPO(prod)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition shrink-0 ${
                          isAdded
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {isAdded ? '+ Add More' : '+ Add to PO'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Selected PO Line Items */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Purchase Order Line Items ({orderItems.length})
            </label>

            {orderItems.length === 0 ? (
              <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center text-xs text-slate-400">
                No items added yet. Click &quot;+ Add to PO&quot; from the supplier product catalog above.
              </div>
            ) : (
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950/60 font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                      <th className="py-2.5 px-3">Product</th>
                      <th className="py-2.5 px-3 text-center">Unit Cost (৳)</th>
                      <th className="py-2.5 px-3 text-center">Order Qty</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {orderItems.map(item => {
                      const prod = products.find(p => p.id === item.productId);
                      const sub = item.unitCost * item.quantity;

                      return (
                        <tr key={item.productId}>
                          <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                            {prod?.name}
                          </td>

                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="number"
                              min="1"
                              step="0.5"
                              value={item.unitCost}
                              onChange={(e) => handleUpdateUnitCost(item.productId, Number(e.target.value))}
                              className="w-20 px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-center"
                            />
                          </td>

                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleUpdateQuantity(item.productId, Number(e.target.value))}
                              className="w-20 px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-center"
                            />
                          </td>

                          <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                            {formatBDT(sub)}
                          </td>

                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveProduct(item.productId)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 4. Payment Terms & Settlement */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                Purchase Total:
              </span>
              <span className="text-lg font-black text-slate-900 dark:text-white">
                {formatBDT(totalAmount)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Initial Payment Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentOption('Full')}
                  className={`py-2 rounded-xl text-xs font-bold transition ${
                    paymentOption === 'Full'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  Full Payment (৳{totalAmount})
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentOption('Partial')}
                  className={`py-2 rounded-xl text-xs font-bold transition ${
                    paymentOption === 'Partial'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  Partial Advance
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentOption('Due')}
                  className={`py-2 rounded-xl text-xs font-bold transition ${
                    paymentOption === 'Due'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  On Credit (Due: ৳{totalAmount})
                </button>
              </div>
            </div>

            {paymentOption === 'Partial' && (
              <div className="animate-fade-in">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Advance Paid Amount (৳)
                </label>
                <input
                  type="number"
                  min="1"
                  max={totalAmount}
                  value={customPaidAmount}
                  onChange={(e) => setCustomPaidAmount(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>
            )}

            {paymentOption !== 'Due' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="Bank Transfer">Bank Transfer / EFT</option>
                    <option value="bKash">bKash Merchant</option>
                    <option value="Nagad">Nagad Direct</option>
                    <option value="Cash">Cash Voucher</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Transaction Reference #
                  </label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="e.g. EFT-992019"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs flex justify-between">
              <span className="text-slate-500">Remaining Supplier Due:</span>
              <span className={`font-black ${dueAmount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {formatBDT(dueAmount)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={orderItems.length === 0}
              className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition disabled:opacity-40"
            >
              <Save className="w-4 h-4" />
              <span>Create Purchase Order & Print Receipt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
