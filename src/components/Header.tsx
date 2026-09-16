import React, { useState, useEffect } from 'react';
import { ReceiptSettings, Transaction } from '../types';
import { formatRupiah } from '../utils/formatters';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { getBluetoothPrinterState } from '../utils/escpos';
import {
  Store,
  History,
  Settings,
  Bluetooth,
  Download,
  UtensilsCrossed,
  Wifi,
  TrendingUp,
} from 'lucide-react';

interface HeaderProps {
  settings: ReceiptSettings;
  transactions: Transaction[];
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onOpenProductManager: () => void;
  onOpenBluetooth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  transactions,
  onOpenHistory,
  onOpenSettings,
  onOpenProductManager,
  onOpenBluetooth,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Clock effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Today's summary metrics
  const todayTransactions = transactions.filter((t) => !t.isVoid);
  const totalOmset = todayTransactions.reduce((sum, t) => sum + t.total, 0);
  const totalOrders = todayTransactions.length;

  const btState = getBluetoothPrinterState();

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-3 sm:px-5 flex items-center justify-between shrink-0 select-none">
      {/* Left: Store & Bazaar Brand Identity */}
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-950/40">
          <Store className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-black text-sm sm:text-base text-slate-100 tracking-tight leading-none">
              {settings.storeName || 'KASIR BAZAR'}
            </h1>
            {settings.boothNumber && (
              <span className="hidden md:inline px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/80">
                {settings.boothNumber}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
            <span className="truncate max-w-[140px] sm:max-w-none">
              {settings.bazaarEvent || 'Bazar & Festival'}
            </span>
            <span>•</span>
            <span className="text-slate-300 font-mono font-medium">{currentTime}</span>
          </div>
        </div>
      </div>

      {/* Center: Live Today's Omset Widget (iPad friendly view) */}
      <div className="hidden lg:flex items-center gap-4 bg-slate-850 border border-slate-800 px-3.5 py-1.5 rounded-xl">
        <div className="flex items-center gap-2 text-xs">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-400">Omset Hari Ini:</span>
          <span className="font-extrabold text-emerald-400 font-mono">
            {formatRupiah(totalOmset)}
          </span>
        </div>
        <span className="text-slate-700">|</span>
        <div className="text-xs text-slate-400">
          <span className="font-bold text-slate-200">{totalOrders}</span> Struk Terbit
        </div>
        <span className="text-slate-700">|</span>
        <div className="flex items-center gap-1 text-[11px] text-emerald-400">
          <Wifi className="w-3 h-3 text-emerald-400" />
          <span>Offline Ready</span>
        </div>
      </div>

      {/* Right: Quick Action Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Bluetooth Thermal Indicator Button */}
        <button
          onClick={onOpenBluetooth}
          className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition cursor-pointer ${
            btState.connected
              ? 'bg-blue-900/40 text-blue-300 border-blue-700'
              : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750 border-slate-700'
          }`}
          title={btState.connected ? `Terhubung: ${btState.name}` : 'Hubungkan Printer Thermal Bluetooth'}
        >
          <Bluetooth className="w-4 h-4 text-blue-400" />
          <span className="hidden xl:inline">
            {btState.connected ? btState.name : 'Printer'}
          </span>
        </button>

        {/* Product Menu Editor */}
        <button
          onClick={onOpenProductManager}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-semibold transition cursor-pointer"
          title="Kelola Menu & Harga"
        >
          <UtensilsCrossed className="w-4 h-4 text-amber-400" />
          <span className="hidden xl:inline">Kelola Menu</span>
        </button>

        {/* Transaction History & Daily Report */}
        <button
          onClick={onOpenHistory}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-semibold transition cursor-pointer"
          title="Riwayat Struk & Laporan Kasir"
        >
          <History className="w-4 h-4 text-sky-400" />
          <span className="hidden md:inline">Riwayat</span>
          {totalOrders > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-950 text-sky-300 font-mono font-bold border border-sky-800">
              {totalOrders}
            </span>
          )}
        </button>

        {/* Receipt & App Settings */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-semibold transition cursor-pointer"
          title="Pengaturan Struk (58mm / 80mm)"
        >
          <Settings className="w-4 h-4 text-purple-400" />
          <span className="hidden xl:inline">Pengaturan</span>
        </button>

        {/* PWA Install Button on iPad / Web */}
        {!isInstalled && isInstallable && (
          <button
            onClick={install}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Install App</span>
          </button>
        )}

        {!isInstalled && isIOS && (
          <>
            <button
              onClick={() => setShowIOSGuide(true)}
              className="p-2 sm:px-2.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition"
              title="Petunjuk Pasang di Layar iPad"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">iPad App</span>
            </button>

            {showIOSGuide && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-200">
                  <h3 className="text-base font-bold text-white mb-2">Pasang di Layar Utama iPad</h3>
                  <p className="text-xs text-slate-400 leading-relaxed space-y-2">
                    Agar aplikasi berjalan layar penuh (fullscreen) tanpa bar Safari di iPad:
                  </p>
                  <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1.5 mt-2 bg-slate-800 p-3 rounded-xl border border-slate-700">
                    <li>Tekan tombol <strong>Share / Bagikan</strong> di Safari iPad.</li>
                    <li>Geser ke bawah dan pilih <strong>&quot;Tambah ke Layar Utama&quot; (Add to Home Screen)</strong>.</li>
                    <li>Buka aplikasi langsung dari ikon layar depan iPad Anda!</li>
                  </ol>
                  <button
                    onClick={() => setShowIOSGuide(false)}
                    className="mt-4 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                  >
                    Mengerti
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
};
