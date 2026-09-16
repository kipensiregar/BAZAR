import { Transaction, ReceiptSettings } from '../types';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('id-ID').format(amount);
}

export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatDateShort(timestamp: number): string {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatTimeShort(timestamp: number): string {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

/**
 * Format string with padded columns for ESC/POS or fixed width thermal text
 * 58mm printer usually fits 32 characters
 * 80mm printer usually fits 42-48 characters
 */
export function formatTwoColumns(left: string, right: string, width: number = 32): string {
  const spaceLength = Math.max(1, width - left.length - right.length);
  return left + ' '.repeat(spaceLength) + right;
}

export function generateReceiptText(transaction: Transaction, settings: ReceiptSettings): string {
  const width = settings.paperSize === '80mm' ? 44 : 32;
  const divider = '-'.repeat(width);
  const doubleDivider = '='.repeat(width);

  const lines: string[] = [];

  // Header Center
  lines.push(settings.storeName.toUpperCase().padStart((width + settings.storeName.length) / 2));
  if (settings.bazaarEvent) {
    lines.push(settings.bazaarEvent.padStart((width + settings.bazaarEvent.length) / 2));
  }
  if (settings.boothNumber) {
    lines.push(settings.boothNumber.padStart((width + settings.boothNumber.length) / 2));
  }
  if (settings.addressOrLocation) {
    lines.push(settings.addressOrLocation.padStart((width + settings.addressOrLocation.length) / 2));
  }
  if (settings.phoneNumber) {
    lines.push(('Telp: ' + settings.phoneNumber).padStart((width + settings.phoneNumber.length + 6) / 2));
  }

  lines.push(doubleDivider);

  // Meta Info
  lines.push(formatTwoColumns(`No: #${transaction.orderNumber}`, formatTimeShort(transaction.timestamp), width));
  lines.push(formatTwoColumns(`Tgl: ${formatDateShort(transaction.timestamp)}`, `Kasir: ${transaction.cashierName}`, width));
  if (transaction.customerName) {
    lines.push(`Pelanggan: ${transaction.customerName}`);
  }

  lines.push(divider);

  // Items
  for (const item of transaction.items) {
    const itemTotal = (item.product.price * item.quantity) * (1 - (item.discountPercent || 0) / 100);
    lines.push(item.product.name);
    
    const qtyPrice = `  ${item.quantity} x ${formatNumber(item.product.price)}`;
    const totalStr = formatNumber(itemTotal);
    lines.push(formatTwoColumns(qtyPrice, totalStr, width));

    if (item.notes) {
      lines.push(`  * Catatan: ${item.notes}`);
    }
    if (item.discountPercent) {
      lines.push(`  * Diskon ${item.discountPercent}%`);
    }
  }

  lines.push(divider);

  // Totals
  lines.push(formatTwoColumns('Subtotal', formatRupiah(transaction.subtotal), width));
  if (transaction.discountAmount > 0) {
    lines.push(formatTwoColumns('Diskon Promo', `-${formatRupiah(transaction.discountAmount)}`, width));
  }
  if (transaction.taxAmount > 0) {
    lines.push(formatTwoColumns('Pajak / PB1', formatRupiah(transaction.taxAmount), width));
  }

  lines.push(doubleDivider);
  lines.push(formatTwoColumns('TOTAL', formatRupiah(transaction.total), width));
  lines.push(doubleDivider);

  // Payment
  const paymentLabels: Record<string, string> = {
    CASH: 'TUNAI',
    QRIS: 'QRIS',
    TRANSFER: 'TRANSFER',
    DEBIT: 'KARTU DEBIT',
  };
  lines.push(formatTwoColumns('Metode Bayar', paymentLabels[transaction.paymentMethod] || transaction.paymentMethod, width));
  
  if (transaction.paymentMethod === 'CASH') {
    lines.push(formatTwoColumns('Diterima', formatRupiah(transaction.amountPaid), width));
    lines.push(formatTwoColumns('Kembalian', formatRupiah(transaction.changeAmount), width));
  }

  lines.push(divider);

  // Footer Message
  if (settings.footerMessage) {
    const footerLines = settings.footerMessage.split('\n');
    for (const fl of footerLines) {
      lines.push(fl.trim().padStart((width + fl.trim().length) / 2));
    }
  }

  if (settings.instagram) {
    lines.push(settings.instagram.padStart((width + settings.instagram.length) / 2));
  }

  lines.push('\n\n'); // Feed lines for tearing paper
  return lines.join('\n');
}
