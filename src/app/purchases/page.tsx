'use client';

import React, { useState } from 'react';
import { PurchaseOrderTable } from '@/components/purchases/PurchaseOrderTable';
import { CreatePOModal } from '@/components/purchases/CreatePOModal';
import { SupplierPaymentModal } from '@/components/purchases/SupplierPaymentModal';
import { PurchaseReceiptModal } from '@/components/purchases/PurchaseReceiptModal';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { PurchaseOrder, PurchasePaymentRecord } from '@/types';

export default function PurchasesPage() {
  const { suppliers, products, purchases, createPurchaseOrder, receivePurchaseOrder, recordSupplierPayment } = useData();
  const { currentUser } = useAuth();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPOForPayment, setSelectedPOForPayment] = useState<PurchaseOrder | null>(null);
  
  // Receipt viewing state
  const [activeReceiptPO, setActiveReceiptPO] = useState<PurchaseOrder | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<PurchasePaymentRecord | null>(null);

  const handleReceive = (poId: string) => {
    receivePurchaseOrder(poId, currentUser?.name || 'Store Manager');
  };

  const handlePayDue = (data: any) => {
    const receipt = recordSupplierPayment(data);
    const updatedPO = purchases.find(p => p.id === data.purchaseId);
    if (updatedPO) {
      setActiveReceiptPO(updatedPO);
      setActiveReceipt(receipt);
    }
  };

  const handleShowReceipt = (po: PurchaseOrder, receipt: PurchasePaymentRecord) => {
    setActiveReceiptPO(po);
    setActiveReceipt(receipt);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Purchases & Supplier Orders
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Issue purchase orders, receive incoming inventory shipments, track dues, and manage supplier payment receipts.
        </p>
      </div>

      <PurchaseOrderTable
        purchases={purchases}
        onOpenCreatePO={() => setIsCreateOpen(true)}
        onReceiveGoods={handleReceive}
        onOpenPayDue={(po) => setSelectedPOForPayment(po)}
        onViewReceipt={handleShowReceipt}
      />

      <CreatePOModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        suppliers={suppliers}
        products={products}
        onCreatePO={createPurchaseOrder}
        onShowReceipt={handleShowReceipt}
      />

      <SupplierPaymentModal
        po={selectedPOForPayment}
        isOpen={!!selectedPOForPayment}
        onClose={() => setSelectedPOForPayment(null)}
        onPayDue={handlePayDue}
      />

      <PurchaseReceiptModal
        po={activeReceiptPO}
        receipt={activeReceipt}
        isOpen={!!activeReceiptPO && !!activeReceipt}
        onClose={() => {
          setActiveReceiptPO(null);
          setActiveReceipt(null);
        }}
      />
    </div>
  );
}
