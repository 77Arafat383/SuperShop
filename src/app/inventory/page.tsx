'use client';

import React, { useState } from 'react';
import { StockTable } from '@/components/inventory/StockTable';
import { StockAdjustmentModal } from '@/components/inventory/StockAdjustmentModal';
import { StockHistoryModal } from '@/components/inventory/StockHistoryModal';
import { useData } from '@/context/DataContext';
import { Product } from '@/types';

export default function InventoryPage() {
  const { products, adjustments, adjustStock } = useData();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleOpenAdjustment = (product: Product) => {
    setSelectedProduct(product);
    setIsAdjustmentOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Inventory & Stock Management
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Monitor real-time warehouse levels, configure reorder points, perform stock adjustments, and trace movement logs.
        </p>
      </div>

      <StockTable
        products={products}
        onOpenAdjustment={handleOpenAdjustment}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      <StockAdjustmentModal
        product={selectedProduct}
        isOpen={isAdjustmentOpen}
        onClose={() => setIsAdjustmentOpen(false)}
        onAdjust={adjustStock}
      />

      <StockHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        adjustments={adjustments}
      />
    </div>
  );
}
