import React, { useState, useMemo } from 'react';
import { Transaction, ReceiptSettings } from '../types';
import { formatRupiah, formatTimeShort, formatDateShort, formatTwoColumns } from '../utils/formatters';
import { History, Printer, Eye, Ban, X, Search, FileText } from 'lucide-react';

interface HistoryModalProps {
  transactions: Transaction[];
  settings: ReceiptSettings;
  onClose: () => void;
  onSelectTransactionForReprint: (tx: Transaction) => void;
  onToggleVoidTransaction: (txId: string) => void;
  onPrintShiftReport: (reportText: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  transactions,
  settings,
  onClose,
  onSelectTransactionForReprint,
  onToggleVoidTransaction,
  onPrintShiftReport,
}) => {
  const [search, setSearch] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('ALL');

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch =
        !search.trim() ||
        t.orderNumber.includes(search.trim()) ||
        (t.customerName && t.customerName.toLowerCase().includes(search.toLowerCase())) ||
        t.items.some((i) => i.product.name.toLowerCase().includes(search.toLowerCase()));

      const matchMethod = filterMethod === 'ALL' || t.paymentMethod === filterMethod;
      return matchSearch && matchMethod;
    });
  }, [transactions, search, filterMethod]);

  // Aggregate stats
  const activeTx = transactions.filter((t) => !t.isVoid);
  const totalOmset = activeTx.reduce((sum, t) => sum + t.total, 0);
  const cashOmset = activeTx
    .filter((t) => t.paymentMethod === 'CASH')
    .reduce((sum, t) => sum + t.total, 0);
  const qrisOmset = activeTx
    .filter((t) => t.paymentMethod === 'QRIS')
    .reduce((sum, t) => sum + t.total, 0);
  const otherOmset = activeTx
    .filter((t) => t.paymentMethod === 'TRANSFER' || t.paymentMethod === 'DEBIT')
    .reduce((sum, t) => sum + t.total, 0);

  // Generate shift recap receipt text for thermal printer
  const handlePrintReport = () => {
    const width = settings.paperSize === '80mm' ? 44 : 32;
    const divider = '-'.repeat(width);
    const doubleDivider = '='.repeat(width);
    const lines: string[] = [];

    lines.push(settings.storeName.toUpperCase().padStart((width + settings.storeName.length) / 2));
    if (settings.bazaarEvent) {
      lines.push(settings.bazaarEvent.padStart((width + settings.bazaarEvent.length) / 2));
    }
    lines.push('LAPORAN PENJUALAN BAZAR'.padStart((width + 23) / 2));
    lines.push(doubleDivider);

    lines.push(formatTwoColumns(`Tgl: ${formatDateShort(Date.now())}`, formatTimeShort(Date.now()), width));
    lines.push(formatTwoColumns(`Kasir: ${settings.cashierName}`, `Booth: ${settings.boothNumber}`, width));
    lines.push(divider);

    lines.push(formatTwoColumns('Total Transaksi', `${activeTx.length} Struk`, width));
    const voidCount = transactions.filter(t => t.isVoid).length;
    if (voidCount > 0) {
      lines.push(formatTwoColumns('Transaksi Dibatalkan', `${voidCount} Struk`, width));
    }
    lines.push(divider);

    lines.push('RINCIAN METODE BAYAR:');
    lines.push(formatTwoColumns('1. Tunai (Cash)', formatRupiah(cashOmset), width));
    lines.push(formatTwoColumns('2. QRIS Stand', formatRupiah(qrisOmset), width));
    if (otherOmset > 0) {
      lines.push(formatTwoColumns('3. Transfer / Kartu', formatRupiah(otherOmset), width));
    }

    lines.push(doubleDivider);
    lines.push(formatTwoColumns('TOTAL OMSET', formatRupiah(totalOmset), width));
    lines.push(doubleDivider);

    lines.push('\n');
    lines.push(formatTwoColumns('Kasir Bazar', 'Penanggung Jawab', width));
    lines.push('\n\n');
    lines.push(formatTwoColumns('(............)', '(............)', width));
    lines.push('\n\n');

    onPrintShiftReport(lines.join('\n'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm sm:text-base">
                Riwayat Transaksi & Laporan Tutup Kasir
              </h3>
              <p className="text-xs text-slate-400">
                {activeTx.length} struk berhasil • Omset: {formatRupiah(totalOmset)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Summary Cards */}
        <div className="p-4 bg-slate-850 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Total Omset</span>
            <div className="text-base sm:text-lg font-black text-emerald-400 font-mono mt-0.5">
              {formatRupiah(totalOmset)}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Uang Tunai (Cash)</span>
            <div className="text-base sm:text-lg font-black text-amber-300 font-mono mt-0.5">
              {formatRupiah(cashOmset)}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Non-Tunai (QRIS)</span>
            <div className="text-base sm:text-lg font-black text-sky-400 font-mono mt-0.5">
              {formatRupiah(qrisOmset)}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Laporan Shift</span>
            <button
              onClick={handlePrintReport}
              className="mt-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 transition shadow cursor-pointer"
              title="Cetak struk ringkasan tutup kasir hari ini"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Cetak Rekap</span>
            </button>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nomor struk atau menu..."
              className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            {['ALL', 'CASH', 'QRIS', 'TRANSFER'].map((method) => (
              <button
                key={method}
                onClick={() => setFilterMethod(method)}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterMethod === method
                    ? 'bg-slate-700 text-white border border-slate-600'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {method === 'ALL' ? 'Semua' : method}
              </button>
            ))}
          </div>
        </div>

        {/* Transaction Table / List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Belum ada riwayat transaksi yang cocok.
            </div>
          ) : (
            filtered.map((tx) => (
              <div
                key={tx.id}
                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition ${
                  tx.isVoid
                    ? 'bg-rose-950/20 border-rose-900/40 text-slate-400 opacity-75'
                    : 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-100 text-sm">
                      #{tx.orderNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.paymentMethod === 'CASH'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-sky-950 text-sky-300 border border-sky-800'
                      }`}
                    >
                      {tx.paymentMethod}
                    </span>
                    {tx.isVoid && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-900 text-rose-200">
                        BATAL (VOID)
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                    <span>{formatTimeShort(tx.timestamp)}</span>
                    <span>•</span>
                    <span>
                      {tx.items.length} macam menu ({tx.items.reduce((s, i) => s + i.quantity, 0)} item)
                    </span>
                    {tx.customerName && (
                      <>
                        <span>•</span>
                        <span className="text-slate-300 font-medium">{tx.customerName}</span>
                      </>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-400 mt-1 truncate max-w-md">
                    {tx.items.map((it) => `${it.product.name} (x${it.quantity})`).join(', ')}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700/60 shrink-0">
                  <div className="text-left sm:text-right">
                    <div className="text-base font-extrabold font-mono text-emerald-400">
                      {formatRupiah(tx.total)}
                    </div>
                    {tx.paymentMethod === 'CASH' && tx.changeAmount > 0 && (
                      <div className="text-[10px] text-slate-400">
                        Kembalian: {formatRupiah(tx.changeAmount)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSelectTransactionForReprint(tx)}
                      className="p-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 transition text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      title="Cetak Ulang Struk"
                    >
                      <Printer className="w-4 h-4" />
                      <span className="hidden md:inline">Cetak Ulang</span>
                    </button>

                    <button
                      onClick={() => onSelectTransactionForReprint(tx)}
                      className="p-2 rounded-lg bg-slate-700 hover:bg-slate-650 text-slate-300 transition"
                      title="Lihat Struk"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (
                          confirm(
                            tx.isVoid
                              ? 'Pulihkan transaksi ini?'
                              : 'Batalkan (VOID) transaksi ini? Nilai omset akan dikurangi.'
                          )
                        ) {
                          onToggleVoidTransaction(tx.id);
                        }
                      }}
                      className={`p-2 rounded-lg border transition ${
                        tx.isVoid
                          ? 'bg-slate-800 text-slate-400 border-slate-700'
                          : 'bg-rose-950/30 border-rose-800/60 text-rose-400 hover:bg-rose-900/40'
                      }`}
                      title={tx.isVoid ? 'Aktifkan Kembali' : 'Batalkan Transaksi (Void)'}
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-800 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-650 text-slate-200 text-xs font-semibold transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
