import React, { useState } from 'react';
import { ReceiptSettings } from '../types';
import { Settings, Printer, Check, X, Sliders, RefreshCcw } from 'lucide-react';
import { DEFAULT_RECEIPT_SETTINGS } from '../data/defaultProducts';

interface SettingsModalProps {
  settings: ReceiptSettings;
  onSave: (newSettings: ReceiptSettings) => void;
  onClose: () => void;
  onTestPrint: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSave,
  onClose,
  onTestPrint,
}) => {
  const [formData, setFormData] = useState<ReceiptSettings>({ ...settings });
  const [savedBadge, setSavedBadge] = useState(false);

  const handleChange = (field: keyof ReceiptSettings, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSavedBadge(true);
    setTimeout(() => {
      setSavedBadge(false);
      onClose();
    }, 600);
  };

  const handleResetDefault = () => {
    if (confirm('Kembalikan pengaturan ke pengaturan awal?')) {
      setFormData({ ...DEFAULT_RECEIPT_SETTINGS });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm sm:text-base">
                Pengaturan Struk & Mesin Kasir
              </h3>
              <p className="text-xs text-slate-400">Konfigurasi Stand Bazar & Format Cetak Thermal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Thermal Paper Size Section */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>Ukuran Kertas Mesin Cetak Struk</span>
              </span>
              <button
                type="button"
                onClick={onTestPrint}
                className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
              >
                <span>Tes Cetak Struk</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleChange('paperSize', '58mm')}
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                  formData.paperSize === '58mm'
                    ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30 text-white'
                    : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold text-sm text-emerald-300">58mm (Standar Portabel)</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Untuk mini printer Bluetooth / kasir keliling (lebar kertas 58mm, 32 karakter).
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleChange('paperSize', '80mm')}
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                  formData.paperSize === '80mm'
                    ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30 text-white'
                    : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold text-sm text-emerald-300">80mm (Printer Meja / Pos Besar)</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Untuk printer kasir ukuran standar restoran / supermarket (Epson TM-T82, Star Micronics).
                </div>
              </button>
            </div>
          </div>

          {/* Stand & Event Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-purple-400" />
              <span>Identitas Stand Bazar</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Nama Stand / Brand Toko</label>
                <input
                  type="text"
                  value={formData.storeName}
                  onChange={(e) => handleChange('storeName', e.target.value)}
                  placeholder="KEDAI BAZAR NUSANTARA"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Nama Acara / Event Bazar</label>
                <input
                  type="text"
                  value={formData.bazaarEvent}
                  onChange={(e) => handleChange('bazaarEvent', e.target.value)}
                  placeholder="FESTIVAL BAZAR KULINER 2026"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Nomor Booth / Stand</label>
                <input
                  type="text"
                  value={formData.boothNumber}
                  onChange={(e) => handleChange('boothNumber', e.target.value)}
                  placeholder="Booth A-08"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Nama Kasir Aktif</label>
                <input
                  type="text"
                  value={formData.cashierName}
                  onChange={(e) => handleChange('cashierName', e.target.value)}
                  placeholder="Kasir 1"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">No. WhatsApp / HP</label>
                <input
                  type="text"
                  value={formData.phoneNumber}
                  onChange={(e) => handleChange('phoneNumber', e.target.value)}
                  placeholder="0812-3456-7890"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Akun Instagram</label>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => handleChange('instagram', e.target.value)}
                  placeholder="@bazar.nusantara"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Lokasi Stand</label>
              <input
                type="text"
                value={formData.addressOrLocation}
                onChange={(e) => handleChange('addressOrLocation', e.target.value)}
                placeholder="Area Panggung Utama, Senayan"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Pesan Penutup Struk (Footer)</label>
              <textarea
                rows={2}
                value={formData.footerMessage}
                onChange={(e) => handleChange('footerMessage', e.target.value)}
                placeholder="Terima kasih atas kunjungannya!"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="pt-2 border-t border-slate-800 space-y-2.5">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Cetak Barcode / Order ID</span>
                <span className="text-[11px] text-slate-400">Menampilkan garis barcode di bagian bawah struk</span>
              </div>
              <input
                type="checkbox"
                checked={formData.showBarcode}
                onChange={(e) => handleChange('showBarcode', e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Tampilkan Ikon Header</span>
                <span className="text-[11px] text-slate-400">Menampilkan emoji/ikon bazar di atas nama toko</span>
              </div>
              <input
                type="checkbox"
                checked={formData.showLogo}
                onChange={(e) => handleChange('showLogo', e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-500 cursor-pointer"
              />
            </label>
          </div>

          {/* Bottom Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleResetDefault}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 py-1"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-medium text-xs hover:bg-slate-700 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition cursor-pointer"
              >
                {savedBadge ? <Check className="w-4 h-4" /> : null}
                <span>{savedBadge ? 'Tersimpan!' : 'Simpan Pengaturan'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
