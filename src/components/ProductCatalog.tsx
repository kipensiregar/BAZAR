import React, { useState, useMemo } from 'react';
import { Product, CartItem } from '../types';
import { formatRupiah } from '../utils/formatters';
import { Search, Plus, Minus, Sparkles, X, Layers } from 'lucide-react';

interface ProductCatalogProps {
  products: Product[];
  categories: string[];
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
  onDecreaseItem?: (productId: string) => void;
  onAddCustomItem: (name: string, price: number) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  categories,
  cart,
  onAddToCart,
  onDecreaseItem,
  onAddCustomItem,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCustomItemModal, setShowCustomItemModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');

  // Mapping quantity in cart by productId for quick badge
  const cartQtyMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of cart) {
      map.set(item.product.id, (map.get(item.product.id) || 0) + item.quantity);
    }
    return map;
  }, [cart]);

  // Filter products by category & search
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'Semua' || p.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch && p.available;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleCreateCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseInt(customPrice.replace(/\D/g, ''), 10);
    if (!customName.trim() || isNaN(priceNum) || priceNum <= 0) return;

    onAddCustomItem(customName.trim(), priceNum);
    setCustomName('');
    setCustomPrice('');
    setShowCustomItemModal(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900 border-r border-slate-800">
      {/* Top Search & Filter Bar */}
      <div className="p-3 sm:p-4 bg-slate-900/95 border-b border-slate-800 space-y-3 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari menu bazar... (misal: kopi, dimsum)"
              className="w-full pl-9 pr-8 py-2.5 bg-slate-800/90 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Custom Item Button */}
          <button
            onClick={() => setShowCustomItemModal(true)}
            className="px-3 sm:px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5 shrink-0 transition active:scale-95 cursor-pointer shadow-sm"
            title="Tambah item custom cepat"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">+ Item Khusus</span>
            <span className="sm:hidden">+ Khusus</span>
          </button>
        </div>

        {/* Category Pills with Horizontal Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition cursor-pointer select-none ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/40'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750 hover:text-slate-100 border border-slate-700/70'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid (Optimized for iPad 3-4 columns, fast touch) */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        {filteredProducts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Layers className="w-12 h-12 text-slate-600 mb-2" />
            <p className="font-semibold text-slate-300 text-sm">Tidak ada menu yang cocok</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Coba cari dengan kata kunci lain atau pilih kategori &quot;Semua&quot;.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3.5">
            {filteredProducts.map((product) => {
              const qty = cartQtyMap.get(product.id) || 0;
              return (
                <div
                  key={product.id}
                  id={`product-card-${product.id}`}
                  onClick={() => onAddToCart(product)}
                  className="relative group bg-slate-800/90 hover:bg-slate-750 border border-slate-700/80 hover:border-emerald-500/60 rounded-2xl p-3 sm:p-4 text-left flex flex-col justify-between shadow-sm transition duration-150 cursor-pointer min-h-[110px] sm:min-h-[125px]"
                >
                  {/* Quantity In Cart Indicator Badge */}
                  {qty > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-slate-950 font-black text-[11px] sm:text-xs rounded-full min-w-5 h-5 px-1.5 flex items-center justify-center shadow-lg animate-in zoom-in-75">
                      {qty}
                    </span>
                  )}

                  {/* Header with Emoji / Color and Category tag */}
                  <div className="flex items-start justify-between gap-1 mb-2">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-700/60 border border-slate-600/40 flex items-center justify-center text-xl shrink-0">
                      {product.emoji || '🍽️'}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 rounded-md bg-slate-900/60 line-clamp-1">
                      {product.category}
                    </span>
                  </div>

                  {/* Product Name */}
                  <div className="font-bold text-slate-100 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-emerald-300 transition">
                    {product.name}
                  </div>

                  {/* Price Tag & - / + Action Buttons */}
                  <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between gap-2">
                    <span className="text-emerald-400 font-extrabold text-xs sm:text-sm tracking-tight truncate">
                      {formatRupiah(product.price)}
                    </span>
                    <div
                      className="flex items-center gap-1.5 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Minus button to decrease quantity */}
                      <button
                        type="button"
                        id={`btn-decrease-${product.id}`}
                        disabled={qty === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (qty > 0 && onDecreaseItem) {
                            onDecreaseItem(product.id);
                          }
                        }}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition select-none ${
                          qty > 0
                            ? 'bg-rose-950/70 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-700/80 cursor-pointer active:scale-90 shadow-sm'
                            : 'bg-slate-800 text-slate-600 border border-slate-700/40 cursor-not-allowed opacity-35'
                        }`}
                        title={qty > 0 ? `Kurangi 1 ${product.name}` : 'Belum ada di pesanan'}
                        aria-label={`Kurangi 1 ${product.name}`}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      {/* Plus button to add quantity */}
                      <button
                        type="button"
                        id={`btn-add-${product.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(product);
                        }}
                        className="w-7 h-7 rounded-lg bg-slate-700/90 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 flex items-center justify-center transition cursor-pointer active:scale-90 shadow-sm"
                        title={`Tambah 1 ${product.name}`}
                        aria-label={`Tambah 1 ${product.name}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Quick Custom Item */}
      {showCustomItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateCustomItem}
            className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Tambah Item Khusus Bazar</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCustomItemModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                Nama Barang / Jasa
              </label>
              <input
                type="text"
                autoFocus
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Contoh: Tambah Keju / Ongkir / Custom Order"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                Harga (Rp)
              </label>
              <input
                type="number"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                placeholder="Contoh: 10000"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCustomItemModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-medium text-xs hover:bg-slate-700 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
              >
                Masukkan ke Keranjang
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
