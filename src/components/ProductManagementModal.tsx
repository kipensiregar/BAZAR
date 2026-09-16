import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { formatRupiah } from '../utils/formatters';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '../data/defaultProducts';
import { UtensilsCrossed, Plus, Edit2, Trash2, Check, X, RotateCcw } from 'lucide-react';

interface ProductManagementModalProps {
  products: Product[];
  categories: string[];
  onSaveProducts: (products: Product[]) => void;
  onClose: () => void;
}

export const ProductManagementModal: React.FC<ProductManagementModalProps> = ({
  products,
  categories,
  onSaveProducts,
  onClose,
}) => {
  const [productList, setProductList] = useState<Product[]>([...products]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(categories[1] || 'Makanan Berat');
  const [emoji, setEmoji] = useState('🍽️');

  // List of all unique categories available for manual selection / autocomplete
  const allCategoryOptions = useMemo(() => {
    const set = new Set<string>();
    INITIAL_CATEGORIES.filter((c) => c !== 'Semua').forEach((c) => set.add(c));
    categories.filter((c) => c !== 'Semua').forEach((c) => set.add(c));
    productList.forEach((p) => {
      if (p.category && p.category.trim() && p.category !== 'Semua') {
        set.add(p.category.trim());
      }
    });
    return Array.from(set);
  }, [categories, productList]);

  const startCreate = () => {
    setEditingProduct(null);
    setName('');
    setPrice('');
    setCategory(categories[1] || 'Makanan Berat');
    setEmoji('🍽️');
    setIsCreatingNew(true);
  };

  const startEdit = (p: Product) => {
    setIsCreatingNew(false);
    setEditingProduct(p);
    setName(p.name);
    setPrice(p.price.toString());
    setCategory(p.category);
    setEmoji(p.emoji || '🍽️');
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseInt(price.replace(/\D/g, ''), 10);
    if (!name.trim() || isNaN(priceNum) || priceNum <= 0) return;

    const finalCategory = category.trim() || 'Lainnya';

    if (isCreatingNew) {
      const newItem: Product = {
        id: `prod-${Date.now()}`,
        name: name.trim(),
        price: priceNum,
        category: finalCategory,
        emoji: emoji.trim() || '🍽️',
        available: true,
      };
      const updated = [newItem, ...productList];
      setProductList(updated);
      onSaveProducts(updated);
    } else if (editingProduct) {
      const updated = productList.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              name: name.trim(),
              price: priceNum,
              category: finalCategory,
              emoji: emoji.trim() || '🍽️',
            }
          : p
      );
      setProductList(updated);
      onSaveProducts(updated);
    }

    setIsCreatingNew(false);
    setEditingProduct(null);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Hapus produk ini dari daftar menu?')) {
      const updated = productList.filter((p) => p.id !== id);
      setProductList(updated);
      onSaveProducts(updated);
      if (editingProduct?.id === id) {
        setEditingProduct(null);
      }
    }
  };

  const handleToggleAvailable = (id: string) => {
    const updated = productList.map((p) => (p.id === id ? { ...p, available: !p.available } : p));
    setProductList(updated);
    onSaveProducts(updated);
  };

  const handleResetDefaults = () => {
    if (confirm('Kembalikan semua menu ke daftar menu bawaan bazar?')) {
      setProductList(INITIAL_PRODUCTS);
      onSaveProducts(INITIAL_PRODUCTS);
    }
  };

  const emojiPresets = ['☕', '🧋', '🍵', '🍋', '💧', '🍛', '🍢', '🍜', '🍲', '🥟', '🥖', '🧈', '🍟', '⭐', '✨', '🍔', '🌭', '🥪', '🍕', '🍰', '🧇'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[95vh]">
        {/* Modal Top */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm sm:text-base">
                Kelola Daftar Menu & Harga Bazar
              </h3>
              <p className="text-xs text-slate-400">Total {productList.length} produk terdaftar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Left Column: Product Form */}
          <div className="md:col-span-5 bg-slate-850 p-4 rounded-xl border border-slate-700/80">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              {isCreatingNew
                ? 'Tambah Menu Baru'
                : editingProduct
                ? 'Ubah Data Menu'
                : 'Pilih Menu Untuk Diedit'}
            </h4>

            {isCreatingNew || editingProduct ? (
              <form onSubmit={handleSaveItem} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Nama Menu</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Es Cendol Nangka"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Harga (Rp)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Contoh: 15000"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-slate-400 block">Kategori Menu</label>
                    <span className="text-[10px] text-emerald-400 font-medium">Bisa input manual</span>
                  </div>
                  <input
                    type="text"
                    required
                    list="category-suggestions"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Ketik nama kategori (cth: Minuman Dingin, Snack, Dessert)"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                  <datalist id="category-suggestions">
                    {allCategoryOptions.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>

                  {/* Rekomendasi Pilihan Cepat Kategori */}
                  <div className="mt-1.5">
                    <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                      {allCategoryOptions.map((cat) => {
                        const isSelected = category.trim().toLowerCase() === cat.toLowerCase();
                        return (
                          <button
                            type="button"
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                                : 'bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-700'
                            }`}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Ikon / Emoji</label>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={emoji}
                      onChange={(e) => setEmoji(e.target.value)}
                      className="w-14 px-2 py-1.5 text-center text-lg bg-slate-800 border border-slate-700 rounded-lg text-slate-100"
                      maxLength={2}
                    />
                    <span className="text-xs text-slate-400">Pilih dari rekomendasi:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-800 rounded-lg border border-slate-700">
                    {emojiPresets.map((em) => (
                      <button
                        type="button"
                        key={em}
                        onClick={() => setEmoji(em)}
                        className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-700 text-sm"
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingNew(false);
                      setEditingProduct(null);
                    }}
                    className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition flex items-center justify-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Simpan</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 text-center py-6">
                <p className="text-xs text-slate-400">
                  Klik tombol di bawah untuk menambah produk baru atau klik salah satu produk di daftar sebelah kanan untuk mengedit.
                </p>
                <button
                  onClick={startCreate}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Tambah Menu Baru</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Existing Products List */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Daftar Produk Bazar
              </span>
              <button
                onClick={startCreate}
                className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </div>

            <div className="flex-1 max-h-[380px] overflow-y-auto space-y-1.5 pr-1">
              {productList.map((prod) => (
                <div
                  key={prod.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition ${
                    editingProduct?.id === prod.id
                      ? 'bg-emerald-950/30 border-emerald-500'
                      : 'bg-slate-800/80 border-slate-700/80 hover:bg-slate-750'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg shrink-0">{prod.emoji || '🍽️'}</span>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-slate-200 truncate">
                        {prod.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {prod.category} •{' '}
                        <span className="text-emerald-400 font-mono font-bold">
                          {formatRupiah(prod.price)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleToggleAvailable(prod.id)}
                      className={`px-2 py-1 rounded text-[10px] font-semibold border ${
                        prod.available
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : 'bg-slate-700 text-slate-400 border-slate-600'
                      }`}
                      title="Status ketersediaan menu"
                    >
                      {prod.available ? 'Tersedia' : 'Habis'}
                    </button>

                    <button
                      onClick={() => startEdit(prod)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteItem(prod.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Menu Default</span>
              </button>

              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
