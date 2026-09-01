'use client';

import React, { useState } from 'react';
import { 
  Package, Search, Plus, Edit2, Trash2, Barcode as BarcodeIcon, 
  Tag, AlertTriangle, Filter, Sparkles 
} from 'lucide-react';
import { Product, Category, Supplier } from '@/types';
import { formatBDT } from '@/lib/utils';

interface ProductTableProps {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onPrintBarcode: (product: Product) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  categories,
  suppliers,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onPrintBarcode,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSupplier, setSelectedSupplier] = useState('All');

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.includes(searchTerm) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = selectedCategory === 'All' || p.categoryId === selectedCategory;
    const matchesSup = selectedSupplier === 'All' || p.supplierId === selectedSupplier;

    return matchesSearch && matchesCat && matchesSup;
  });

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, SKU, barcode, brand..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Filters and Add button */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="All">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="All">All Suppliers</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <button
            onClick={onAddProduct}
            className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition ml-auto md:ml-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              Products Catalog ({filteredProducts.length})
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Product Info</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4 text-right">Cost Price</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4 text-right">Discount</th>
                <th className="py-3 px-4 text-center">Stock</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No products found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.stockQuantity <= p.minStockLevel;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {p.name}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 font-mono">
                          <span>{p.sku}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <BarcodeIcon className="w-3 h-3" />
                            {p.barcode}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {p.categoryName}
                      </td>

                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {p.supplierName}
                      </td>

                      <td className="py-3 px-4 text-right font-medium text-slate-500">
                        {formatBDT(p.purchasePrice)}
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                        {formatBDT(p.sellingPrice)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {p.discount > 0 ? (
                          <span className="font-bold text-rose-500">
                            -৳{p.discount}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {p.stockQuantity <= 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300/40">
                            <AlertTriangle className="w-3 h-3" />
                            Awaiting Purchase (0 {p.unit})
                          </span>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            isLow
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}>
                            {isLow && <AlertTriangle className="w-3 h-3" />}
                            {p.stockQuantity} {p.unit}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onPrintBarcode(p)}
                            title="Print Barcode Labels"
                            className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-400 transition"
                          >
                            <BarcodeIcon className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onEditProduct(p)}
                            title="Edit Product"
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Delete product "${p.name}"?`)) {
                                onDeleteProduct(p.id);
                              }
                            }}
                            title="Delete Product"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
