export type PaymentMethod = 'CASH' | 'QRIS' | 'TRANSFER' | 'DEBIT';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  color?: string;
  emoji?: string;
  stock?: number;
  available: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
  discountPercent?: number; // 0 - 100
}

export interface Transaction {
  id: string;
  orderNumber: string;
  timestamp: number; // Date.now()
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  changeAmount: number;
  cashierName: string;
  customerName?: string;
  notes?: string;
  isVoid?: boolean;
}

export interface ReceiptSettings {
  storeName: string;
  bazaarEvent: string;
  boothNumber: string;
  addressOrLocation: string;
  phoneNumber: string;
  instagram: string;
  footerMessage: string;
  cashierName: string;
  paperSize: '58mm' | '80mm';
  showLogo: boolean;
  showBarcode: boolean;
  autoPrintOnCheckout: boolean;
  printKitchenSlip: boolean;
  taxRatePercent: number; // 0 for no tax
}
