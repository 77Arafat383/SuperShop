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
    <div className="flex flex-col h-full space-y-4 min-w-0 w-full">
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
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none min-w-0">
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

      {/* Product Cards Grid - Max 5 items per row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5 content-start overflow-y-auto pr-1 flex-1 min-w-0">
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
                className={`group relative bg-white dark:bg-slate-900 rounded-3xl border p-3 flex flex-col justify-between transition-all duration-300 select-none w-full mx-auto ${
                  isOutOfStock
                    ? 'opacity-60 cursor-not-allowed border-slate-200 dark:border-slate-800'
                    : 'cursor-pointer hover:border-blue-500/80 hover:shadow-xl hover:shadow-blue-500/5 active:scale-[0.98] border-slate-200 dark:border-slate-800/80'
                } ${isJustAdded ? 'ring-2 ring-blue-500 scale-[1.02]' : ''}`}
              >
                {/* Visual Avatar Preview */}
                <div className="w-full h-20 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/50 dark:to-slate-900/50 border border-slate-100 dark:border-slate-800/60 flex items-center justify-center mb-2.5 relative overflow-hidden group-hover:from-blue-500/5 dark:group-hover:from-blue-500/10 transition-colors duration-300">
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <span className="text-base font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent tracking-wider group-hover:scale-110 transition-transform duration-300">
                      {product.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                    </span>
                  )}
                  
                  {/* Top-Right Tag: Stock Status */}
                  <div className="absolute top-1.5 right-1.5">
                    {isOutOfStock ? (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-lg bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50">
                        Out
                      </span>
                    ) : isLowStock ? (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50 flex items-center gap-0.5">
                        Only {product.stockQuantity}
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                        {product.stockQuantity} {product.unit}
                      </span>
                    )}
                  </div>

                  {/* Top-Left Discount Tag */}
                  {hasDiscount && (
                    <div className="absolute top-1.5 left-1.5">
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-lg bg-gradient-to-r from-rose-500 to-orange-500 text-white flex items-center gap-0.5 shadow-sm shadow-rose-500/20">
                        <Tag className="w-2.5 h-2.5" />
                        -৳{product.discount}
                      </span>
                    </div>
                  )}
                </div>

                {/* Brand & SKU info */}
                <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  <span className="truncate max-w-[80px]">{product.brand}</span>
                  <span className="font-mono text-slate-400/85">{product.sku}</span>
                </div>

                {/* Product Name */}
                <div className="mb-2">
                  <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300" title={product.name}>
                    {product.name}
                  </h4>
                </div>

                {/* Bottom Pricing & Add Button */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="flex flex-col h-8 justify-end">
                    {hasDiscount ? (
                      <>
                        <span className="text-[10px] text-slate-400 line-through leading-none mb-0.5">
                          {formatBDT(product.sellingPrice)}
                        </span>
                        <span className="text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          {formatBDT(discountedPrice)}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {formatBDT(product.sellingPrice)}
                      </span>
                    )}
                  </div>

                  <button
                    disabled={isOutOfStock}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm ${
                      isJustAdded
                        ? 'bg-emerald-600 text-white'
                        : isOutOfStock
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-blue-500/20 active:scale-90'
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
