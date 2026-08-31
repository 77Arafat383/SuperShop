'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SupplierTable } from '@/components/suppliers/SupplierTable';
import { SupplierModal } from '@/components/suppliers/SupplierModal';
import { SupplierProductsDrawer } from '@/components/suppliers/SupplierProductsDrawer';
import { useData } from '@/context/DataContext';
import { Supplier } from '@/types';

export default function SuppliersPage() {
  const router = useRouter();
  const { suppliers, products, addSupplier, updateSupplier, deleteSupplier } = useData();

  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [activeCatalogSupplier, setActiveCatalogSupplier] = useState<Supplier | null>(null);

  const handleAdd = () => {
    setEditingSupplier(null);
    setIsSupplierModalOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsSupplierModalOpen(true);
  };

  const handleSave = (supplierData: any) => {
    if (editingSupplier) {
      updateSupplier(editingSupplier.id, supplierData);
    } else {
      addSupplier(supplierData);
    }
  };

  const handleQuickOrder = (supplier: Supplier) => {
    router.push('/purchases');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Suppliers & Vendor Directory
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage manufacturer and vendor partners, view provided product lines, track accounts payable, and settle dues.
        </p>
      </div>

      <SupplierTable
        suppliers={suppliers}
        products={products}
        onAddSupplier={handleAdd}
        onEditSupplier={handleEdit}
        onDeleteSupplier={deleteSupplier}
        onViewProducts={(s) => setActiveCatalogSupplier(s)}
      />

      <SupplierModal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        onSave={handleSave}
        editingSupplier={editingSupplier}
      />

      <SupplierProductsDrawer
        supplier={activeCatalogSupplier}
        isOpen={!!activeCatalogSupplier}
        onClose={() => setActiveCatalogSupplier(null)}
        products={products}
        onQuickOrder={handleQuickOrder}
      />
    </div>
  );
}
