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

export default function POSPage() {
  const { products, categories, processSale } = useData();
  const { currentUser } = useAuth();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [taxRate] = useState(5); // 5% standard VAT
  const [discountTotal, setDiscountTotal] = useState(0);

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
    <div className="h-[calc(100vh-6.5rem)] flex flex-col lg:flex-row gap-5">
      {/* Left Catalog Grid */}
      <div className="flex-1 flex flex-col min-h-0">
        <ProductGrid
          products={products}
          categories={categories}
          onAddToCart={handleAddToCart}
          onOpenBarcodeScanner={() => setIsScannerOpen(true)}
        />
      </div>

      {/* Right Cart Section */}
      <div className="w-full lg:w-[400px] shrink-0 flex flex-col min-h-0">
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
