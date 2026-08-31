'use client';

import React from 'react';
import { 
  ShoppingCart, Trash2, Plus, Minus, Tag, User, 
  CreditCard, Sparkles, Percent, X 
} from 'lucide-react';
import { CartItem } from '@/types';
import { formatBDT } from '@/lib/utils';

interface CartDrawerProps {
  cartItems: CartItem[];
  customerName: string;
  customerPhone: string;
  taxRate: number;
  discountTotal: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onSetCustomerName: (name: string) => void;
  onSetCustomerPhone: (phone: string) => void;
  onSetDiscountTotal: (discount: number) => void;
  onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  cartItems,
  customerName,
  customerPhone,
  taxRate,
  discountTotal,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onSetCustomerName,
  onSetCustomerPhone,
  onSetDiscountTotal,
  onOpenCheckout,
}) => {
  const subtotal = cartItems.reduce((acc, item) => acc + item.subtotal, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const grandTotal = Math.max(0, subtotal - discountTotal + taxAmount);
  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl flex flex-col h-full overflow-hidden">
      {/* Cart Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              Current Order
            </h3>
            <p className="text-[10px] text-slate-400">
              {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'} in cart
            </p>
          </div>
        </div>

        {cartItems.length > 0 && (
          <button
            onClick={onClearCart}
            className="text-[11px] font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 px-2 py-1 rounded-lg transition flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Customer Quick Info */}
      <div className="p-3 bg-slate-50/70 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
            Customer Name
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => onSetCustomerName(e.target.value)}
            placeholder="Walk-in Customer"
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
            Phone / Wallet
          </label>
          <input
            type="tel"
            value={customerPhone}
            onChange={(e) => onSetCustomerPhone(e.target.value)}
            placeholder="01712..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {cartItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
            <ShoppingCart className="w-10 h-10 mb-2 opacity-30 stroke-[1.5]" />
            <p className="text-xs font-semibold text-slate-500">Cart is empty</p>
            <p className="text-[11px] text-slate-400 max-w-[180px]">
              Scan product barcode or click on catalog items to add
            </p>
          </div>
        ) : (
          cartItems.map((item) => {
            const unitPrice = item.customPrice ?? item.product.sellingPrice;
            const discount = item.customDiscount ?? item.product.discount ?? 0;
            const effectivePrice = Math.max(0, unitPrice - discount);

            return (
              <div
                key={item.product.id}
                className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {item.product.name}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                    <span>{formatBDT(effectivePrice)}</span>
                    {discount > 0 && (
                      <span className="text-[10px] text-rose-500 font-bold">
                        (-৳{discount})
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5">
                  <button
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                  >
                    <Minus className="w-3 h-3" />
                  </button>

                  <span className="w-6 text-center text-xs font-bold text-slate-900 dark:text-white">
                    {item.quantity}
                  </span>

                  <button
                    disabled={item.quantity >= item.product.stockQuantity}
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition disabled:opacity-30"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Subtotal & Delete */}
                <div className="text-right min-w-[65px]">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {formatBDT(item.subtotal)}
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="text-[10px] text-slate-400 hover:text-red-500 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bill Summary & Checkout */}
      <div className="p-4 bg-slate-50/90 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
        <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-900 dark:text-white">{formatBDT(subtotal)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1">
              <span>Order Discount</span>
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-400">৳</span>
              <input
                type="number"
                min="0"
                value={discountTotal === 0 ? '' : discountTotal}
                onChange={(e) => onSetDiscountTotal(Math.max(0, Number(e.target.value) || 0))}
                placeholder="0"
                className="w-16 text-right px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-xs font-semibold text-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-between">
            <span>Govt VAT ({taxRate}%)</span>
            <span className="font-semibold text-slate-900 dark:text-white">{formatBDT(taxAmount)}</span>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Total Payable
            </span>
            <span className="text-lg font-black text-blue-600 dark:text-blue-400">
              {formatBDT(grandTotal)}
            </span>
          </div>
        </div>

        {/* Checkout Trigger */}
        <button
          disabled={cartItems.length === 0}
          onClick={onOpenCheckout}
          className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99]"
        >
          <CreditCard className="w-4 h-4" />
          <span>Complete Payment ({formatBDT(grandTotal)})</span>
        </button>
      </div>
    </div>
  );
};
