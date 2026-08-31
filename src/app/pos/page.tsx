'use client';

import React, { useState } from 'react';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { CartDrawer } from '@/components/pos/CartDrawer';
import { PaymentModal } from '@/components/pos/PaymentModal';
import { ReceiptModal } from '@/components/pos/ReceiptModal';
import { BarcodeScannerModal } from '@/components/pos/BarcodeScannerModal';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { CartItem, Product, PaymentMethod, PaymentDetails, Sale } from '@/types';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { formatBDT } from '@/lib/utils';

export default function POSPage() {
  const { products, categories, processSale } = useData();
  const { currentUser } = useAuth();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [taxRate] = useState(5); // 5% standard VAT
  const [discountTotal, setDiscountTotal] = useState(0);
  const [activeMobileTab, setActiveMobileTab] = useState<'catalog' | 'cart'>('catalog');

  // Modals state
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      const unitPrice = product.sellingPrice;
      const discount = product.discount || 0;
      const effectivePrice = Math.max(0, unitPrice - discount);

      if (existing) {
        const newQty = existing.quantity + 1;
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: newQty, subtotal: effectivePrice * newQty }
            : item
        );
      } else {
        return [
          ...prev,
          {
            product,
            quantity: 1,
            subtotal: effectivePrice,
          }
        ];
      }
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }

    setCartItems(prev =>
      prev.map(item => {
        if (item.product.id === productId) {
          const unitPrice = item.customPrice ?? item.product.sellingPrice;
          const discount = item.customDiscount ?? item.product.discount ?? 0;
          const effectivePrice = Math.max(0, unitPrice - discount);
          return {
            ...item,
            quantity,
            subtotal: effectivePrice * quantity,
          };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
    setDiscountTotal(0);
  };

  // Checkout operations
  const handleOpenCheckout = () => {
    if (cartItems.length === 0) return;
    setIsPaymentOpen(true);
  };

  const handleCompleteSale = (paymentMethod: PaymentMethod, paymentDetails: PaymentDetails) => {
    const sale = processSale({
      cashierId: currentUser?.id || 'usr_cashier',
      cashierName: currentUser?.name || 'Store Cashier',
      customerName,
      customerPhone,
      cartItems,
      taxRate,
      discountTotal,
      paymentMethod,
      paymentDetails,
    });

    setCompletedSale(sale);
    setIsPaymentOpen(false);
    setIsReceiptOpen(true);
  };

  const handleNewSale = () => {
    setCartItems([]);
    setCustomerName('Walk-in Customer');
    setCustomerPhone('');
    setDiscountTotal(0);
    setIsReceiptOpen(false);
    setCompletedSale(null);
  };

  const subtotal = cartItems.reduce((acc, i) => acc + i.subtotal, 0);
  const totalAmount = Math.max(0, subtotal - discountTotal + (subtotal * taxRate) / 100);

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col gap-3 lg:gap-5">
      {/* Mobile Tab Toggle */}
      <div className="flex lg:hidden bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200 dark:border-slate-800/80">
        <button
          onClick={() => setActiveMobileTab('catalog')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
            activeMobileTab === 'catalog'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Catalog ({products.filter(p => p.status === 'Active').length})
        </button>
        <button
          onClick={() => setActiveMobileTab('cart')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
            activeMobileTab === 'cart'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Cart ({cartItems.reduce((sum, item) => sum + item.quantity, 0)})
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 min-h-0 relative">
        {/* Left Catalog Grid */}
        <div className={`flex-1 flex flex-col min-h-0 ${activeMobileTab === 'catalog' ? 'flex' : 'hidden lg:flex'}`}>
          <ProductGrid
            products={products}
            categories={categories}
            onAddToCart={handleAddToCart}
            onOpenBarcodeScanner={() => setIsScannerOpen(true)}
          />
        </div>

        {/* Right Cart Section */}
        <div className={`w-full lg:w-[400px] shrink-0 flex flex-col min-h-0 ${activeMobileTab === 'cart' ? 'flex' : 'hidden lg:flex'}`}>
          <CartDrawer
            cartItems={cartItems}
            customerName={customerName}
            customerPhone={customerPhone}
            taxRate={taxRate}
            discountTotal={discountTotal}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onSetCustomerName={setCustomerName}
            onSetCustomerPhone={setCustomerPhone}
            onSetDiscountTotal={setDiscountTotal}
            onOpenCheckout={handleOpenCheckout}
          />
        </div>
      </div>

      {/* Floating Checkout Button for Mobile view when on Catalog tab */}
      {activeMobileTab === 'catalog' && cartItems.length > 0 && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-30">
          <button
            onClick={() => setActiveMobileTab('cart')}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-between text-xs transition active:scale-[0.98]"
          >
            <span className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)} Items</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span>View Cart ({formatBDT(totalAmount)})</span>
              <ArrowRight className="w-4 h-4 animate-pulse" />
            </span>
          </button>
        </div>
      )}

      {/* Modals */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        totalAmount={totalAmount}
        customerPhone={customerPhone}
        onCompleteSale={handleCompleteSale}
      />

      <ReceiptModal
        sale={completedSale}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        onNewSale={handleNewSale}
      />

      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        products={products}
        onScanProduct={handleAddToCart}
      />
    </div>
  );
}
