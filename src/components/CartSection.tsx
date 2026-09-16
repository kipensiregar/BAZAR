import React, { useState } from 'react';
import { CartItem } from '../types';
import { formatRupiah } from '../utils/formatters';
import { ShoppingBag, Trash2, Plus, Minus, Edit3, Check, X, ArrowRight } from 'lucide-react';

interface CartSectionProps {
  cart: CartItem[];
  subtotal: number;
  discountTotal: number;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onUpdateItemDetails: (productId: string, notes?: string, discountPercent?: number) => void;
  onClearCart: () => void;
  onOpenCheckout: () => void;
}

export const CartSection: React.FC<CartSectionProps> = ({
  cart,
  subtotal,
  discountTotal,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateItemDetails,
  onClearCart,
  onOpenCheckout,
}) => {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemNote, setItemNote] = useState<string>('');
  const [itemDiscount, setItemDiscount] = useState<number>(0);

  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const netTotal = Math.max(0, subtotal - discountTotal);

  const startEditItem = (item: CartItem) => {
    setEditingItemId(item.product.id);
    setItemNote(item.notes || '');
    setItemDiscount(item.discountPercent || 0);
  };

  const saveEditItem = (productId: string) => {
    onUpdateItemDetails(productId, itemNote.trim() || undefined, itemDiscount || undefined);
    setEditingItemId(null);
  };

  return (
    <div className="w-full lg:w-96 xl:w-[410px] bg-slate-900 flex flex-col h-full shrink-0">
      {/* Cart Header */}
      <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm">Pesanan Sekarang</h3>
            <p className="text-[11px] text-slate-400">
              {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>

        {cart.length > 0 && (
          <button
            id="clear-cart-btn"
            onClick={onClearCart}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition text-xs flex items-center gap-1 cursor-pointer"
            title="Kosongkan Keranjang"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-500">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center mb-3 text-slate-400">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <p className="font-semibold text-slate-300 text-sm">Keranjang Masih Kosong</p>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
              Ketuk salah satu menu bazar di sebelah kiri untuk menambahkan pesanan.
            </p>
          </div>
        ) : (
          cart.map((item) => {
            const isEditing = editingItemId === item.product.id;
            const itemBaseTotal = item.product.price * item.quantity;
            const itemDiscountAmt = (itemBaseTotal * (item.discountPercent || 0)) / 100;
            const itemNetTotal = itemBaseTotal - itemDiscountAmt;

            return (
              <div
                key={item.product.id}
                className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/70 space-y-2 hover:border-slate-600 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{item.product.emoji || '🍽️'}</span>
                      <span className="font-semibold text-xs sm:text-sm text-slate-100 truncate block">
                        {item.product.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      @ {formatRupiah(item.product.price)}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs sm:text-sm font-bold text-emerald-400 font-mono">
                      {formatRupiah(itemNetTotal)}
                    </div>
                    {itemDiscountAmt > 0 && (
                      <div className="text-[10px] text-rose-400 line-through">
                        {formatRupiah(itemBaseTotal)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Item Notes / Discount details if set */}
                {(item.notes || (item.discountPercent && item.discountPercent > 0)) && !isEditing && (
                  <div className="text-[11px] bg-slate-900/60 px-2 py-1 rounded border border-slate-700/50 flex flex-wrap gap-2 text-slate-300">
                    {item.notes && <span>📝 {item.notes}</span>}
                    {item.discountPercent && item.discountPercent > 0 && (
                      <span className="text-rose-400 font-medium">Diskon {item.discountPercent}%</span>
                    )}
                  </div>
                )}

                {/* Inline Edit Form */}
                {isEditing ? (
                  <div className="pt-2 border-t border-slate-700 space-y-2 animate-in fade-in">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Catatan Khusus:</label>
                      <input
                        type="text"
                        value={itemNote}
                        onChange={(e) => setItemNote(e.target.value)}
                        placeholder="Contoh: Es sedikit / ekstra pedas"
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Diskon Item (%):</label>
                      <select
                        value={itemDiscount}
                        onChange={(e) => setItemDiscount(Number(e.target.value))}
                        className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                      >
                        <option value={0}>0% (Normal)</option>
                        <option value={5}>5%</option>
                        <option value={10}>10%</option>
                        <option value={20}>20%</option>
                        <option value={50}>50%</option>
                        <option value={100}>100% (Gratis / Bonus)</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-1.5 pt-1">
                      <button
                        onClick={() => setEditingItemId(null)}
                        className="px-2 py-1 rounded bg-slate-700 text-slate-300 text-[11px]"
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => saveEditItem(item.product.id)}
                        className="px-2.5 py-1 rounded bg-emerald-600 text-white font-semibold text-[11px] flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Simpan</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Quantity & Options Controls */
                  <div className="flex items-center justify-between pt-1 border-t border-slate-700/50">
                    <button
                      onClick={() => startEditItem(item)}
                      className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 py-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{item.notes ? 'Ubah Catatan' : '+ Catatan/Diskon'}</span>
                    </button>

                    <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-700/60">
                      <button
                        onClick={() => {
                          if (item.quantity === 1) {
                            onRemoveItem(item.product.id);
                          } else {
                            onUpdateQuantity(item.product.id, -1);
                          }
                        }}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 flex items-center justify-center transition active:scale-90"
                      >
                        {item.quantity === 1 ? (
                          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        ) : (
                          <Minus className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <span className="w-8 text-center text-xs font-bold text-slate-100 font-mono">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 flex items-center justify-center transition active:scale-90"
                      >
                        <Plus className="w-3.5 h-3.5 text-emerald-400" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Cart Footer Summary & Checkout Button */}
      <div className="p-4 bg-slate-850 border-t border-slate-800 space-y-3 shrink-0">
        <div className="space-y-1.5 text-xs text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-400">Subtotal</span>
            <span className="font-semibold">{formatRupiah(subtotal)}</span>
          </div>

          {discountTotal > 0 && (
            <div className="flex justify-between text-rose-400">
              <span>Diskon Menu</span>
              <span className="font-semibold">-{formatRupiah(discountTotal)}</span>
            </div>
          )}

          <div className="pt-2 border-t border-slate-700 flex justify-between items-baseline">
            <span className="font-bold text-slate-100 text-sm">Total Belanja</span>
            <span className="font-black text-emerald-400 text-lg sm:text-xl tracking-tight">
              {formatRupiah(netTotal)}
            </span>
          </div>
        </div>

        {/* Big Checkout Button for iPad */}
        <button
          id="checkout-btn"
          disabled={cart.length === 0}
          onClick={onOpenCheckout}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.98] cursor-pointer ${
            cart.length > 0
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          <span>Bayar ({formatRupiah(netTotal)})</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
