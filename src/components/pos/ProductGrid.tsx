'use client';

import React, { useState } from 'react';
import { 
  Search, Barcode, Tag, Plus, Check, ShoppingBag, 
  Layers, AlertTriangle, Sparkles 
} from 'lucide-react';
import { Product, Category } from '@/types';
import { formatBDT } from '@/lib/utils';

interface ProductGridProps {
  products: Product[];
  categories: Category[];
  onAddToCart: (product: Product) => void;
  onOpenBarcodeScanner: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  categories,
  onAddToCart,
  onOpenBarcodeScanner,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.includes(searchTerm) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = selectedCategory === 'All' || p.categoryId === selectedCategory;

    return matchesSearch && matchesCat && p.status === 'Active';
  });

  const handleAdd = (product: Product) => {
    if (product.stockQuantity <= 0) return;
    onAddToCart(product);
    setRecentlyAddedId(product.id);
    setTimeout(() => setRecentlyAddedId(null), 500);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search input with Barcode trigger */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search items by name, barcode (e.g. 8941100...), brand..."
            className="w-full pl-10 pr-24 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-medium focus:outline-none focus:border-blue-500 shadow-sm transition"
          />
          <button
            onClick={onOpenBarcodeScanner}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-400 text-[11px] font-semibold flex items-center gap-1 border border-blue-200 dark:border-blue-800 transition"
          >
            <Barcode className="w-3.5 h-3.5" />
            <span>Scanner</span>
          </button>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${
            selectedCategory === 'All'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          All Items ({products.filter(p => p.status === 'Active').length})
        </button>

        {categories.map(cat => {
          const count = products.filter(p => p.categoryId === cat.id && p.status === 'Active').length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <span>{cat.name}</span>
              <span className="text-[10px] opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3.5 overflow-y-auto pr-1 flex-1">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold">No matching products found</p>
            <p className="text-xs text-slate-500">Try changing your search query or category filter</p>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const isOutOfStock = product.stockQuantity <= 0;
            const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= product.minStockLevel;
            const hasDiscount = product.discount > 0;
            const discountedPrice = Math.max(0, product.sellingPrice - product.discount);
            const isJustAdded = recentlyAddedId === product.id;

            return (
              <div
                key={product.id}
                onClick={() => !isOutOfStock && handleAdd(product)}
                className={`group relative bg-white dark:bg-slate-900 rounded-2xl border p-2.5 sm:p-3.5 flex flex-col justify-between transition-all select-none ${
                  isOutOfStock
                    ? 'opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-800'
                    : 'cursor-pointer hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 active:scale-[0.98] border-slate-200 dark:border-slate-800'
                } ${isJustAdded ? 'ring-2 ring-blue-500 scale-[1.02]' : ''}`}
              >
                {/* Badges row */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                    {product.brand}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    {hasDiscount && (
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-rose-500 text-white flex items-center gap-0.5">
                        <Tag className="w-2.5 h-2.5" />
                        -৳{product.discount}
                      </span>
                    )}
                    {isOutOfStock ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300">
                        Out
                      </span>
                    ) : isLowStock ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center gap-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        {product.stockQuantity}
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {product.stockQuantity} {product.unit}
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Name & SKU */}
                <div className="mb-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                    {product.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1 font-mono">
                    <Barcode className="w-3 h-3" />
                    <span>{product.barcode}</span>
                  </div>
                </div>

                {/* Bottom Pricing & Add Button */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div>
                    {hasDiscount ? (
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
                          {formatBDT(discountedPrice)}
                        </span>
                        <span className="text-[10px] text-slate-400 line-through">
                          {formatBDT(product.sellingPrice)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {formatBDT(product.sellingPrice)}
                      </span>
                    )}
                  </div>

                  <button
                    disabled={isOutOfStock}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition ${
                      isJustAdded
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white'
                    }`}
                  >
                    {isJustAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
