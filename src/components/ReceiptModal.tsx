import React, { useState } from 'react';
import { Transaction, ReceiptSettings } from '../types';
import { PrintableReceipt } from './PrintableReceipt';
import { printViaBluetooth, getBluetoothPrinterState } from '../utils/escpos';
import { generateReceiptText } from '../utils/formatters';
import { Printer, Bluetooth, Check, Copy, X, ArrowRight, Share2, AlertCircle } from 'lucide-react';

interface ReceiptModalProps {
  transaction: Transaction | null;
  settings: ReceiptSettings;
  onClose: () => void;
  onNewTransaction?: () => void;
  onConnectBluetoothPrompt: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  settings,
  onClose,
  onNewTransaction,
  onConnectBluetoothPrompt,
}) => {
  const [copied, setCopied] = useState(false);
  const [btStatus, setBtStatus] = useState<string | null>(null);
  const [isPrintingBt, setIsPrintingBt] = useState(false);

  if (!transaction) return null;

  const handleBrowserPrint = () => {
    window.print();
  };

  const handleBluetoothPrint = async () => {
    const btState = getBluetoothPrinterState();
    if (!btState.connected) {
      onConnectBluetoothPrompt();
      return;
    }

    setIsPrintingBt(true);
    setBtStatus('Mengirim data ke printer...');
    const res = await printViaBluetooth(transaction, settings);
    setIsPrintingBt(false);
    setBtStatus(res.message);
    setTimeout(() => setBtStatus(null), 4000);
  };

  const handleCopyText = async () => {
    const text = generateReceiptText(transaction, settings);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleShare = async () => {
    const text = generateReceiptText(transaction, settings);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Struk Transaksi #${transaction.orderNumber}`,
          text,
        });
      } catch {
        // user cancelled
      }
    } else {
      handleCopyText();
    }
  };

  const btState = getBluetoothPrinterState();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[95vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm sm:text-base">
                Struk Transaksi #{transaction.orderNumber}
              </h3>
              <p className="text-xs text-slate-400">
                Format Kertas: <span className="font-semibold text-emerald-400">{settings.paperSize}</span> • Thermal Roll
              </p>
            </div>
          </div>
          <button
            id="close-receipt-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split view on iPad/tablet, stacked on phone */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Left / Center: Receipt Paper Preview */}
          <div className="md:col-span-7 flex flex-col items-center">
            <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
              <span>Preview Cetak Kertas</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                {settings.paperSize === '80mm' ? 'Lebar 80mm' : 'Lebar 58mm'}
              </span>
            </div>

            {/* Paper Preview Container */}
            <div className="w-full flex justify-center py-2 px-1 bg-slate-950/60 rounded-xl border border-slate-800 overflow-x-auto">
              <div className="bg-white rounded-sm shadow-xl p-1 relative">
                {/* Paper jagged edge styling top & bottom */}
                <div className="absolute -top-1 left-0 right-0 h-1 bg-[radial-gradient(circle,_transparent_3px,_#ffffff_4px)] bg-[length:8px_8px]" />
                <PrintableReceipt
                  transaction={transaction}
                  settings={settings}
                  isScreenPreview={true}
                />
                <div className="absolute -bottom-1 left-0 right-0 h-1 bg-[radial-gradient(circle,_transparent_3px,_#ffffff_4px)] bg-[length:8px_8px]" />
              </div>
            </div>
          </div>

          {/* Right: Print Actions & Printer Setup */}
          <div className="md:col-span-5 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Metode Cetak Struk
                </h4>

                {/* Primary Button: AirPrint / Browser Print */}
                <button
                  id="print-thermal-btn"
                  onClick={handleBrowserPrint}
                  className="w-full mb-2.5 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition text-sm cursor-pointer"
                >
                  <Printer className="w-5 h-5" />
                  <span>Cetak Struk (AirPrint / USB)</span>
                </button>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                  Cocok untuk iPad & iPhone via AirPrint, printer WiFi/LAN, atau printer thermal USB/Bluetooth yang terdaftar di sistem iOS.
                </p>

                {/* Secondary Button: Direct Web Bluetooth */}
                <div className="pt-2 border-t border-slate-700">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Bluetooth className="w-3.5 h-3.5 text-blue-400" />
                      Thermal Bluetooth
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        btState.connected
                          ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {btState.connected ? btState.name : 'Belum Konek'}
                    </span>
                  </div>

                  <button
                    id="print-bluetooth-btn"
                    disabled={isPrintingBt}
                    onClick={handleBluetoothPrint}
                    className={`w-full py-2.5 px-3 rounded-lg border font-medium text-xs flex items-center justify-center gap-1.5 transition ${
                      btState.connected
                        ? 'bg-blue-600/20 border-blue-500/50 text-blue-300 hover:bg-blue-600/30'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Bluetooth className="w-4 h-4" />
                    <span>
                      {isPrintingBt
                        ? 'Mencetak...'
                        : btState.connected
                        ? `Cetak ke ${btState.name}`
                        : 'Hubungkan & Cetak Bluetooth'}
                    </span>
                  </button>

                  {btStatus && (
                    <div className="mt-2 text-xs text-amber-300 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{btStatus}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Share & Copy Utilities */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCopyText}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition"
                >
                  <Share2 className="w-4 h-4 text-sky-400" />
                  <span>Kirim / Share</span>
                </button>
              </div>
            </div>

            {/* Bottom: Next customer / close */}
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              {onNewTransaction && (
                <button
                  id="new-transaction-btn"
                  onClick={() => {
                    onNewTransaction();
                    onClose();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold flex items-center justify-center gap-2 shadow-md transition text-sm cursor-pointer"
                >
                  <span>Transaksi Baru (Bazar)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="w-full py-2 px-3 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition"
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
