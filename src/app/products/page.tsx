'use client';

import React, { useState } from 'react';
import { ProductTable } from '@/components/products/ProductTable';
import { ProductModal } from '@/components/products/ProductModal';
import { BarcodeGeneratorModal } from '@/components/products/BarcodeGeneratorModal';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/types';

export default function ProductsPage() {
  const { products, categories, suppliers, addProduct, updateProduct, deleteProduct } = useData();
  const { currentUser } = useAuth();

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [barcodeProduct, setBarcodeProduct] = useState<Product | null>(null);

  const handleAdd = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleSave = (productData: any) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData, currentUser?.name ? `${currentUser.name} (${currentUser.role})` : 'Inventory Manager');
      alert('Product created! Purchase Requisition PO sent to Purchase Manager for supplier order fulfillment.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Products & Catalog Management
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Maintain product catalogue, retail prices, discounts, barcodes, and supplier associations.
        </p>
      </div>

      <ProductTable
        products={products}
        categories={categories}
        suppliers={suppliers}
        onAddProduct={handleAdd}
        onEditProduct={handleEdit}
        onDeleteProduct={deleteProduct}
        onPrintBarcode={(p) => setBarcodeProduct(p)}
      />

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSave}
        editingProduct={editingProduct}
        categories={categories}
        suppliers={suppliers}
      />

      <BarcodeGeneratorModal
        product={barcodeProduct}
        isOpen={!!barcodeProduct}
        onClose={() => setBarcodeProduct(null)}
      />
    </div>
  );
}
