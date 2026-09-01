'use client';

import React, { useState, useEffect } from 'react';
import { X, Package, Tag, Barcode, Save, Sparkles } from 'lucide-react';
import { Product, Category, Supplier } from '@/types';
import { generateBarcode } from '@/lib/utils';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: any) => void;
  editingProduct?: Product | null;
  categories: Category[];
  suppliers: Supplier[];
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingProduct,
  categories,
  suppliers,
}) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brand, setBrand] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [stockQuantity, setStockQuantity] = useState<number>(0);
  const [minStockLevel, setMinStockLevel] = useState<number>(5);
  const [unit, setUnit] = useState('pcs');
  const [supplierId, setSupplierId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setSku(editingProduct.sku);
      setBarcode(editingProduct.barcode);
      setDescription(editingProduct.description || '');
      setCategoryId(editingProduct.categoryId);
      setBrand(editingProduct.brand);
      setPurchasePrice(editingProduct.purchasePrice);
      setSellingPrice(editingProduct.sellingPrice);
      setDiscount(editingProduct.discount || 0);
      setStockQuantity(editingProduct.stockQuantity);
      setMinStockLevel(editingProduct.minStockLevel || 5);
      setUnit(editingProduct.unit || 'pcs');
      setSupplierId(editingProduct.supplierId || '');
      setImageUrl(editingProduct.imageUrl || '');
      setStatus(editingProduct.status as any || 'Active');
    } else {
      setName('');
      setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
      setBarcode(generateBarcode());
      setDescription('');
      setCategoryId(categories[0]?.id || '');
      setBrand('');
      setPurchasePrice(0);
      setSellingPrice(0);
      setDiscount(0);
      setStockQuantity(10);
      setMinStockLevel(5);
      setUnit('pcs');
      setSupplierId(suppliers[0]?.id || '');
      setImageUrl('');
      setStatus('Active');
    }
  }, [editingProduct, isOpen, categories, suppliers]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const category = categories.find(c => c.id === categoryId);
    const supplier = suppliers.find(s => s.id === supplierId);

    onSave({
      name,
      sku,
      barcode,
      description,
      categoryId,
      categoryName: category?.name || 'General',
      brand: brand || 'Standard',
      purchasePrice: Number(purchasePrice),
      sellingPrice: Number(sellingPrice),
      discount: Number(discount),
      stockQuantity: Number(stockQuantity),
      minStockLevel: Number(minStockLevel),
      unit,
      supplierId,
      supplierName: supplier?.name || 'Local Supplier',
      imageUrl,
      status,
    });
    onClose();
  };

  const handleGenerateBarcode = () => {
    setBarcode(generateBarcode());
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            <h3 className="text-base font-bold">
              {editingProduct ? 'Edit Product Item' : 'Add New Product to Inventory'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">


          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Product Title*
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Radhuni Pure Mustard Oil 500ml"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Product Image
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-blue-50 dark:file:bg-blue-950/60 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100 focus:outline-none focus:border-blue-500"
                />
                {imageUrl && (
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="Product preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                SKU / Item Code
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Barcode (EAN-13/UPC) *
                </label>
                <button
                  type="button"
                  onClick={handleGenerateBarcode}
                  className="text-[10px] text-blue-600 font-semibold hover:underline flex items-center gap-0.5"
                >
                  <Sparkles className="w-2.5 h-2.5" /> Auto Generate
                </button>
              </div>
              <input
                type="text"
                required
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Brand / Manufacturer
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Square / PRAN / Unilever"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Purchase Cost Price (৳) *
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                required
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Selling Retail Price (৳) *
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                required
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Product Discount Field */}
            <div>
              <label className="block text-xs font-bold text-rose-600 dark:text-rose-400 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                <span>Product Discount (৳)</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                placeholder="0"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-rose-200 dark:border-rose-900/60 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 focus:outline-none focus:border-rose-500"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">
                Fixed discount deducted automatically in POS cart
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {editingProduct ? 'Current Stock Quantity' : 'Initial Requisition Quantity (PO Units)'}
              </label>
              <input
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Min Low-Stock Alert Threshold
              </label>
              <input
                type="number"
                min="1"
                value={minStockLevel}
                onChange={(e) => setMinStockLevel(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Unit (e.g. pcs, kg, box, bottle)
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="pcs"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Assigned Supplier
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition"
            >
              <Save className="w-4 h-4" />
              <span>{editingProduct ? 'Save Changes' : 'Create Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
