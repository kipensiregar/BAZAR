import React, { useState, useMemo } from 'react';
import { CartItem, PaymentMethod, Transaction, ReceiptSettings } from '../types';
import { formatRupiah } from '../utils/formatters';
import { Banknote, QrCode, CreditCard, ArrowRight, X, Delete, CheckCircle2 } from 'lucide-react';

interface CheckoutModalProps {
  cart: CartItem[];
  subtotal: number;
  discountTotal: number;
  settings: ReceiptSettings;
  onClose: () => void;
  onComplete: (transaction: Transaction) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  cart,
  subtotal,
  discountTotal,
  settings,
  onClose,
  onComplete,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [cashTenderedStr, setCashTenderedStr] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  // Tax calculation if enabled in settings
  const taxRate = settings.taxRatePercent || 0;
  const rawSubtotalAfterItemDiscounts = subtotal - discountTotal;
  const promoDiscountAmount = (rawSubtotalAfterItemDiscounts * discountPercent) / 100;
  const netSubtotal = rawSubtotalAfterItemDiscounts - promoDiscountAmount;
  const taxAmount = (netSubtotal * taxRate) / 100;
  const grandTotal = Math.max(0, netSubtotal + taxAmount);

  const cashTendered = parseInt(cashTenderedStr || '0', 10);
  const changeAmount = Math.max(0, cashTendered - grandTotal);
  const isCashSufficient = paymentMethod !== 'CASH' || cashTendered >= grandTotal;

  // Preset cash buttons tailored to Indonesian Rupiah notes
  const presetAmounts = useMemo(() => {
    const roundedUp10k = Math.ceil(grandTotal / 10000) * 10000;
    const roundedUp50k = Math.ceil(grandTotal / 50000) * 50000;
    const roundedUp100k = Math.ceil(grandTotal / 100000) * 100000;

    const set = new Set<number>([
      grandTotal, // Uang pas
      roundedUp10k > grandTotal ? roundedUp10k : 0,
      roundedUp50k > grandTotal ? roundedUp50k : 0,
      roundedUp100k > grandTotal ? roundedUp100k : 0,
      50000,
      100000,
    ].filter(n => n > 0));

    return Array.from(set).sort((a, b) => a - b);
  }, [grandTotal]);

  const handleKeypadPress = (val: string) => {
    if (val === 'CLEAR') {
      setCashTenderedStr('');
    } else if (val === 'BACKSPACE') {
      setCashTenderedStr(prev => prev.slice(0, -1));
    } else if (val === '000') {
      if (cashTenderedStr) {
        setCashTenderedStr(prev => prev + '000');
      }
    } else {
      setCashTenderedStr(prev => prev + val);
    }
  };

  const handleFinishCheckout = () => {
    if (!isCashSufficient) return;

    const orderNumber = `${Date.now().toString().slice(-6)}`;
    const finalTransaction: Transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      orderNumber,
      timestamp: Date.now(),
      items: cart,
      subtotal,
      discountAmount: discountTotal + promoDiscountAmount,
      taxAmount,
      total: grandTotal,
      paymentMethod,
      amountPaid: paymentMethod === 'CASH' ? (cashTendered || grandTotal) : grandTotal,
      changeAmount: paymentMethod === 'CASH' ? changeAmount : 0,
      cashierName: settings.cashierName || 'Kasir',
      customerName: customerName.trim() || undefined,
    };

    onComplete(finalTransaction);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[96vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/90 border-b border-slate-700">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Pembayaran Kasir Bazar</h2>
            <p className="text-xs text-slate-400">
              {cart.reduce((sum, item) => sum + item.quantity, 0)} item pesanan • {settings.bazaarEvent || 'Bazar Stand'}
            </p>
          </div>
          <button
            id="close-checkout-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content: 2-column layout on iPad / Tablet */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Payment Summary & Method */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            {/* Grand Total Box */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-inner">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tagihan</div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 mt-1 tracking-tight">
                {formatRupiah(grandTotal)}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700/70 text-xs text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Subtotal Item</span>
                  <span>{formatRupiah(subtotal)}</span>
                </div>
                {(discountTotal + promoDiscountAmount) > 0 && (
                  <div className="flex justify-between text-rose-400 font-medium">
                    <span>Total Diskon</span>
                    <span>-{formatRupiah(discountTotal + promoDiscountAmount)}</span>
                  </div>
                )}
                {taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pajak ({taxRate}%)</span>
                    <span>{formatRupiah(taxAmount)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                Pilih Cara Bayar
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  id="pay-method-cash"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition text-center cursor-pointer ${
                    paymentMethod === 'CASH'
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-750'
                  }`}
                >
                  <Banknote className="w-5 h-5" />
                  <span className="text-xs font-bold">Tunai (Cash)</span>
                </button>

                <button
                  type="button"
                  id="pay-method-qris"
                  onClick={() => setPaymentMethod('QRIS')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition text-center cursor-pointer ${
                    paymentMethod === 'QRIS'
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-750'
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                  <span className="text-xs font-bold">QRIS Stand</span>
                </button>

                <button
                  type="button"
                  id="pay-method-transfer"
                  onClick={() => setPaymentMethod('TRANSFER')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition text-center cursor-pointer ${
                    paymentMethod === 'TRANSFER'
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-750'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="text-xs font-bold">Transfer</span>
                </button>

                <button
                  type="button"
                  id="pay-method-debit"
                  onClick={() => setPaymentMethod('DEBIT')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition text-center cursor-pointer ${
                    paymentMethod === 'DEBIT'
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-750'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="text-xs font-bold">Debit EDC</span>
                </button>
              </div>
            </div>

            {/* Optional Customer Name & Discount */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Nama Pembeli (Opsional)
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Contoh: Meja 3 / Kak Rian"
                    className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="w-28">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Diskon Bazar (%)
                  </label>
                  <select
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full px-2 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value={0}>0%</option>
                    <option value={5}>5%</option>
                    <option value={10}>10%</option>
                    <option value={15}>15%</option>
                    <option value={20}>20%</option>
                    <option value={50}>50%</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Cash Keypad OR QRIS Guide */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            {paymentMethod === 'CASH' ? (
              <div className="space-y-3.5">
                {/* Cash Tendered & Change Display */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-3">
                    <span className="text-[11px] font-semibold text-slate-400 block">Uang Diterima:</span>
                    <div className="text-xl sm:text-2xl font-bold text-slate-100 font-mono tracking-tight mt-0.5">
                      {cashTenderedStr ? formatRupiah(cashTendered) : 'Rp 0'}
                    </div>
                  </div>

                  <div
                    className={`border rounded-xl p-3 transition ${
                      isCashSufficient
                        ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                        : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                    }`}
                  >
                    <span className="text-[11px] font-semibold block opacity-90">
                      {isCashSufficient ? 'Kembalian:' : 'Uang Kurang:'}
                    </span>
                    <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight mt-0.5">
                      {isCashSufficient
                        ? formatRupiah(changeAmount)
                        : `-${formatRupiah(grandTotal - cashTendered)}`}
                    </div>
                  </div>
                </div>

                {/* Quick Cash Presets (Pill Buttons for Fast Touch on iPad) */}
                <div>
                  <span className="text-[11px] font-medium text-slate-400 mb-1.5 block">
                    Pilihan Uang Cepat (Tap Langsung):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {presetAmounts.map((amt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCashTenderedStr(amt.toString())}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition active:scale-95 cursor-pointer ${
                          cashTendered === amt
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                            : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200'
                        }`}
                      >
                        {amt === grandTotal ? '✨ Uang Pas' : formatRupiah(amt)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Large iPad Numeric Keypad */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleKeypadPress(val)}
                      className="h-12 sm:h-14 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-lg sm:text-xl font-bold text-slate-100 border border-slate-700 shadow-sm transition active:scale-[0.97] flex items-center justify-center cursor-pointer select-none"
                    >
                      {val}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleKeypadPress('BACKSPACE')}
                    className="h-12 sm:h-14 rounded-xl bg-slate-800 hover:bg-rose-900/40 active:bg-slate-600 text-slate-300 border border-slate-700 shadow-sm transition active:scale-[0.97] flex items-center justify-center cursor-pointer"
                  >
                    <Delete className="w-6 h-6 text-rose-400" />
                  </button>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleKeypadPress('CLEAR')}
                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold underline px-2 py-1 cursor-pointer"
                  >
                    Hapus / Reset Nominal
                  </button>
                </div>
              </div>
            ) : paymentMethod === 'QRIS' ? (
              <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-800/40 border border-slate-700 rounded-2xl text-center space-y-4">
                <div className="p-4 bg-white rounded-2xl shadow-xl">
                  {/* Standalone QR code visual simulator */}
                  <div className="w-48 h-48 sm:w-56 sm:h-56 bg-white border-2 border-black flex flex-col items-center justify-center p-2 relative">
                    <QrCode className="w-full h-full text-black" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 text-base">QRIS Dinamis / Statis Stand</h4>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    Minta pembeli scan barcode QRIS di meja stand bazar sebesar{' '}
                    <strong className="text-emerald-400">{formatRupiah(grandTotal)}</strong>.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Siap diverifikasi pada aplikasi QRIS / m-Banking Anda</span>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-800/40 border border-slate-700 rounded-2xl text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                  <CreditCard className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 text-base">
                    Pembayaran {paymentMethod === 'TRANSFER' ? 'Transfer Bank' : 'Kartu Debit / EDC'}
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    Nominal transaksi:{' '}
                    <strong className="text-emerald-400">{formatRupiah(grandTotal)}</strong>.
                    Pastikan dana telah masuk atau struk EDC telah berhasil dicetak sebelum menyelesaikan transaksi.
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Finalize Button */}
            <div className="pt-4 border-t border-slate-800 mt-4">
              <button
                id="submit-payment-btn"
                type="button"
                disabled={!isCashSufficient}
                onClick={handleFinishCheckout}
                className={`w-full py-4 px-6 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-xl transition cursor-pointer ${
                  isCashSufficient
                    ? 'bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white shadow-emerald-950/50'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <span>Konfirmasi Pembayaran ({formatRupiah(grandTotal)})</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
