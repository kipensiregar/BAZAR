import React from 'react';
import { Transaction, ReceiptSettings } from '../types';
import { formatRupiah, formatNumber, formatDateShort, formatTimeShort } from '../utils/formatters';

interface PrintableReceiptProps {
  transaction: Transaction | null;
  settings: ReceiptSettings;
  isScreenPreview?: boolean;
}

export const PrintableReceipt: React.FC<PrintableReceiptProps> = ({
  transaction,
  settings,
  isScreenPreview = false,
}) => {
  if (!transaction) return null;

  const is80mm = settings.paperSize === '80mm';
  // 58mm is ~48mm printable (~190px - 220px at 96dpi, or 48-58mm), 80mm is ~72mm (~280px - 310px)
  const containerWidthClass = is80mm ? 'w-[76mm] max-w-[320px]' : 'w-[56mm] max-w-[240px]';

  const paymentLabels: Record<string, string> = {
    CASH: 'TUNAI',
    QRIS: 'QRIS',
    TRANSFER: 'TRANSFER',
    DEBIT: 'KARTU DEBIT',
  };

  return (
    <div
      id={isScreenPreview ? undefined : 'printable-receipt-container'}
      className={`font-mono text-black bg-white ${
        isScreenPreview
          ? `mx-auto p-4 border border-dashed border-slate-300 shadow-md ${containerWidthClass} text-xs leading-tight`
          : `hidden print:block p-1 text-[11px] leading-[1.25] ${containerWidthClass}`
      }`}
    >
      {/* Header */}
      <div className="text-center mb-2">
        {settings.showLogo && (
          <div className="mb-1 text-base font-black tracking-wider flex items-center justify-center gap-1">
            <span>🎪</span>
            <span>{settings.storeName.toUpperCase()}</span>
          </div>
        )}
        {!settings.showLogo && (
          <div className="text-sm font-black tracking-wide">{settings.storeName.toUpperCase()}</div>
        )}

        {settings.bazaarEvent && (
          <div className="font-semibold text-[11px] text-slate-800">{settings.bazaarEvent}</div>
        )}
        {settings.boothNumber && (
          <div className="text-[10px] text-slate-700">{settings.boothNumber}</div>
        )}
        {settings.addressOrLocation && (
          <div className="text-[10px] text-slate-600">{settings.addressOrLocation}</div>
        )}
        {settings.phoneNumber && (
          <div className="text-[10px] text-slate-600">Telp: {settings.phoneNumber}</div>
        )}
      </div>

      <div className="border-b border-black border-dashed my-1.5" />

      {/* Meta Info */}
      <div className="text-[10px] flex justify-between">
        <span>No: #{transaction.orderNumber}</span>
        <span>{formatTimeShort(transaction.timestamp)}</span>
      </div>
      <div className="text-[10px] flex justify-between">
        <span>Tgl: {formatDateShort(transaction.timestamp)}</span>
        <span>Kasir: {transaction.cashierName}</span>
      </div>
      {transaction.customerName && (
        <div className="text-[10px]">Pelanggan: {transaction.customerName}</div>
      )}

      <div className="border-b border-black border-dashed my-1.5" />

      {/* Item List */}
      <div className="space-y-1.5 my-1">
        {transaction.items.map((item, idx) => {
          const itemTotal =
            item.product.price * item.quantity * (1 - (item.discountPercent || 0) / 100);
          return (
            <div key={idx} className="text-[10px]">
              <div className="font-bold text-slate-900 break-words">{item.product.name}</div>
              <div className="flex justify-between text-slate-800 pl-1">
                <span>
                  {item.quantity} x {formatNumber(item.product.price)}
                </span>
                <span className="font-semibold">{formatNumber(itemTotal)}</span>
              </div>
              {item.notes && (
                <div className="text-[9px] italic text-slate-600 pl-2">
                  * {item.notes}
                </div>
              )}
              {item.discountPercent && item.discountPercent > 0 && (
                <div className="text-[9px] text-red-600 pl-2">
                  Diskon {item.discountPercent}%
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="border-b border-black border-dashed my-1.5" />

      {/* Subtotal, Discounts, Tax */}
      <div className="text-[10px] space-y-0.5">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatRupiah(transaction.subtotal)}</span>
        </div>
        {transaction.discountAmount > 0 && (
          <div className="flex justify-between text-red-700">
            <span>Diskon Promo</span>
            <span>-{formatRupiah(transaction.discountAmount)}</span>
          </div>
        )}
        {transaction.taxAmount > 0 && (
          <div className="flex justify-between">
            <span>Pajak / PB1</span>
            <span>{formatRupiah(transaction.taxAmount)}</span>
          </div>
        )}
      </div>

      <div className="border-b-2 border-black my-1" />

      {/* Grand Total */}
      <div className="flex justify-between font-extrabold text-[12px] my-1">
        <span>TOTAL</span>
        <span>{formatRupiah(transaction.total)}</span>
      </div>

      <div className="border-b-2 border-black my-1" />

      {/* Payment Details */}
      <div className="text-[10px] space-y-0.5">
        <div className="flex justify-between">
          <span>Metode Bayar</span>
          <span className="font-semibold">{paymentLabels[transaction.paymentMethod] || transaction.paymentMethod}</span>
        </div>
        {transaction.paymentMethod === 'CASH' && (
          <>
            <div className="flex justify-between">
              <span>Uang Diterima</span>
              <span>{formatRupiah(transaction.amountPaid)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Kembalian</span>
              <span>{formatRupiah(transaction.changeAmount)}</span>
            </div>
          </>
        )}
      </div>

      <div className="border-b border-black border-dashed my-2" />

      {/* Barcode Simulator */}
      {settings.showBarcode && (
        <div className="my-2 text-center">
          <div className="flex justify-center items-center gap-[2px] h-7 px-2">
            {[4, 2, 6, 1, 3, 5, 2, 4, 1, 6, 3, 2, 5, 1, 4, 2, 5, 3, 1, 6, 2, 4, 3].map(
              (width, i) => (
                <div
                  key={i}
                  className="bg-black h-full"
                  style={{ width: `${(width % 3) + 1}px` }}
                />
              )
            )}
          </div>
          <div className="text-[9px] tracking-widest mt-0.5 font-mono">
            *{transaction.orderNumber}*
          </div>
        </div>
      )}

      {/* Footer message */}
      <div className="text-center text-[9px] space-y-0.5 mt-2 text-slate-700">
        {settings.footerMessage.split('\n').map((line, idx) => (
          <div key={idx}>{line}</div>
        ))}
        {settings.instagram && (
          <div className="font-semibold text-slate-900 mt-1">IG: {settings.instagram}</div>
        )}
      </div>

      {/* Trailing space for thermal tear */}
      <div className="h-6" />
    </div>
  );
};
