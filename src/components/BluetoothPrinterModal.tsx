import React, { useState } from 'react';
import { connectBluetoothPrinter, getBluetoothPrinterState } from '../utils/escpos';
import { Bluetooth, Printer, CheckCircle2, AlertTriangle, X, RefreshCw } from 'lucide-react';

interface BluetoothPrinterModalProps {
  onClose: () => void;
  onConnected?: () => void;
}

export const BluetoothPrinterModal: React.FC<BluetoothPrinterModalProps> = ({
  onClose,
  onConnected,
}) => {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  const btState = getBluetoothPrinterState();

  const handleConnect = async () => {
    setLoading(true);
    setStatusMessage('Mencari printer thermal Bluetooth terdekat...');
    setIsSuccess(null);

    const result = await connectBluetoothPrinter();
    setLoading(false);
    setStatusMessage(result.message);
    setIsSuccess(result.success);

    if (result.success && onConnected) {
      onConnected();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Bluetooth className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Hubungkan Mesin Cetak Struk</h3>
              <p className="text-[11px] text-slate-400">Thermal Printer 58mm / 80mm</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status */}
        <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Status Koneksi:</span>
            <span
              className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                btState.connected
                  ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {btState.connected ? `Terhubung: ${btState.name}` : 'Belum Terhubung'}
            </span>
          </div>

          {statusMessage && (
            <div
              className={`text-xs p-2 rounded-lg flex items-start gap-1.5 ${
                isSuccess
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                  : 'bg-amber-950/60 text-amber-300 border border-amber-800'
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Action button */}
        <button
          onClick={handleConnect}
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900/50 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 transition cursor-pointer"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Bluetooth className="w-4 h-4" />
          )}
          <span>{loading ? 'Menghubungkan...' : 'Scan & Sambungkan Bluetooth'}</span>
        </button>

        {/* iPad / iOS Recommendation Box */}
        <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300 space-y-1.5">
          <div className="font-semibold text-slate-200 flex items-center gap-1.5 text-xs">
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span>Petunjuk Khusus iPad:</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            1. <strong>AirPrint (Paling Mudah):</strong> Cukup pilih menu <em>Cetak Struk (AirPrint)</em> di dialog pembayaran. iPad akan langsung mencetak ke printer thermal yang kompatibel dengan AirPrint atau printer jaringan/WiFi di stand bazar.<br />
            2. <strong>Printer Bluetooth Portable (RPP02N / Panda / GOOJPRT):</strong> Nyalakan Bluetooth printer, lakukan pairing di Pengaturan iPad, lalu klik tombol scan di atas. Jika menggunakan Safari biasa di iPad, Anda juga bisa menggunakan tombol <strong>Salin Teks</strong> untuk aplikasi pembantu (seperti RawBT / StarPRNT / POS Print).
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 text-xs text-slate-400 hover:text-slate-200 transition"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};
