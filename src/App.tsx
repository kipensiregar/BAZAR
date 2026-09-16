import { useState, useEffect } from 'react';
import { Product, CartItem, Transaction, ReceiptSettings } from './types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, DEFAULT_RECEIPT_SETTINGS } from './data/defaultProducts';
import { Header } from './components/Header';
import { ProductCatalog } from './components/ProductCatalog';
import { CartSection } from './components/CartSection';
import { CheckoutModal } from './components/CheckoutModal';
import { ReceiptModal } from './components/ReceiptModal';
import { PrintableReceipt } from './components/PrintableReceipt';
import { SettingsModal } from './components/SettingsModal';
import { HistoryModal } from './components/HistoryModal';
import { ProductManagementModal } from './components/ProductManagementModal';
import { BluetoothPrinterModal } from './components/BluetoothPrinterModal';
import { formatRupiah } from './utils/formatters';
import { ShoppingBag, ArrowRight, X } from 'lucide-react';

const STORAGE_KEYS = {
  PRODUCTS: 'kasir_bazar_products_v1',
  TRANSACTIONS: 'kasir_bazar_transactions_v1',
  SETTINGS: 'kasir_bazar_settings_v1',
};

export default function App() {
  // 1. Persistent Products
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // 2. Persistent Transactions
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 3. Persistent Settings
  const [settings, setSettings] = useState<ReceiptSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? { ...DEFAULT_RECEIPT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_RECEIPT_SETTINGS;
    } catch {
      return DEFAULT_RECEIPT_SETTINGS;
    }
  });

  // 4. Cart State
  const [cart, setCart] = useState<CartItem[]>([]);

  // 5. Modals State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isProductManagerOpen, setIsProductManagerOpen] = useState(false);
  const [isBluetoothOpen, setIsBluetoothOpen] = useState(false);

  // Mobile / Portrait Cart Drawer state for smaller iPad views or portrait orientation
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  // Active transaction for receipt modal / printer
  const [activeReceiptTransaction, setActiveReceiptTransaction] = useState<Transaction | null>(null);

  // Save to LocalStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products to localStorage', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions to localStorage', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  }, [settings]);

  // Derived categories from products
  const dynamicCategories = ['Semua', ...Array.from(new Set(products.map((p) => p.category)))];

  // Cart Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartDiscountTotal = cart.reduce((sum, item) => {
    const itemTotal = item.product.price * item.quantity;
    return sum + (itemTotal * (item.discountPercent || 0)) / 100;
  }, 0);
  const cartNetTotal = Math.max(0, cartSubtotal - cartDiscountTotal);
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Cart Handlers
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleUpdateItemDetails = (productId: string, notes?: string, discountPercent?: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, notes, discountPercent } : item
      )
    );
  };

  const handleAddCustomItem = (name: string, price: number) => {
    const customProduct: Product = {
      id: `custom-${Date.now()}`,
      name,
      price,
      category: 'Khusus Bazar',
      emoji: '✨',
      available: true,
    };
    handleAddToCart(customProduct);
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    setCart([]);
  };

  // Checkout Finish Handler
  const handleTransactionComplete = (newTx: Transaction) => {
    setTransactions((prev) => [newTx, ...prev]);
    setActiveReceiptTransaction(newTx);
    setCart([]);
    setIsCheckoutOpen(false);
    setIsMobileCartOpen(false);
    setIsReceiptOpen(true);

    // Auto-print if enabled in settings
    if (settings.autoPrintOnCheckout) {
      setTimeout(() => {
        window.print();
      }, 300);
    }
  };

  // Test print sample receipt from settings
  const handleTestPrint = () => {
    const sampleTx: Transaction = {
      id: 'sample-test-01',
      orderNumber: 'TEST-01',
      timestamp: Date.now(),
      items: [
        {
          product: {
            id: 'sample-1',
            name: 'Es Kopi Susu Aren (Tes)',
            price: 18000,
            category: 'Minuman',
            available: true,
          },
          quantity: 2,
        },
        {
          product: {
            id: 'sample-2',
            name: 'Dimsum Mentai (Tes)',
            price: 20000,
            category: 'Camilan',
            available: true,
          },
          quantity: 1,
        },
      ],
      subtotal: 56000,
      discountAmount: 0,
      taxAmount: 0,
      total: 56000,
      paymentMethod: 'CASH',
      amountPaid: 60000,
      changeAmount: 4000,
      cashierName: settings.cashierName,
      customerName: 'Pelanggan Tes',
    };
    setActiveReceiptTransaction(sampleTx);
    setIsReceiptOpen(true);
  };

  // Print shift report
  const handlePrintShiftReport = (reportText: string) => {
    // We can show receipt modal with simulated shift transaction or print directly
    const shiftTx: Transaction = {
      id: 'shift-report',
      orderNumber: 'REKAP',
      timestamp: Date.now(),
      items: [
        {
          product: {
            id: 'rekap-item',
            name: 'Laporan Tutup Kasir Shift',
            price: transactions.reduce((s, t) => s + (!t.isVoid ? t.total : 0), 0),
            category: 'Laporan',
            available: true,
          },
          quantity: 1,
        },
      ],
      subtotal: transactions.reduce((s, t) => s + (!t.isVoid ? t.total : 0), 0),
      discountAmount: 0,
      taxAmount: 0,
      total: transactions.reduce((s, t) => s + (!t.isVoid ? t.total : 0), 0),
      paymentMethod: 'CASH',
      amountPaid: 0,
      changeAmount: 0,
      cashierName: settings.cashierName,
      notes: reportText,
    };
    setActiveReceiptTransaction(shiftTx);
    setIsReceiptOpen(true);
  };

  const handleToggleVoidTransaction = (txId: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, isVoid: !t.isVoid } : t))
    );
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 select-none">
      {/* 1. Header Bar */}
      <Header
        settings={settings}
        transactions={transactions}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProductManager={() => setIsProductManagerOpen(true)}
        onOpenBluetooth={() => setIsBluetoothOpen(true)}
      />

      {/* 2. Main Workspace (Side-by-side on iPad landscape/Desktop, responsive) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left / Center: Menu Catalog */}
        <ProductCatalog
          products={products}
          categories={dynamicCategories}
          cart={cart}
          onAddToCart={handleAddToCart}
          onDecreaseItem={(productId) => handleUpdateQuantity(productId, -1)}
          onAddCustomItem={handleAddCustomItem}
        />

        {/* Right: Cart Section (Always visible on desktop / iPad landscape) */}
        <div className="hidden lg:flex h-full border-l border-slate-800">
          <CartSection
            cart={cart}
            subtotal={cartSubtotal}
            discountTotal={cartDiscountTotal}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onUpdateItemDetails={handleUpdateItemDetails}
            onClearCart={handleClearCart}
            onOpenCheckout={() => setIsCheckoutOpen(true)}
          />
        </div>
      </div>

      {/* 3. Mobile / iPad Portrait Bottom Floating Cart Bar */}
      <div className="lg:hidden shrink-0 bg-slate-900 border-t border-slate-800 p-3 flex items-center justify-between gap-3 shadow-2xl z-30">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileCartOpen(true)}
            className="relative w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200"
          >
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            {totalItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 font-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalItemCount}
              </span>
            )}
          </button>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Total Pesanan:</div>
            <div className="text-base font-black text-emerald-400 font-mono">
              {formatRupiah(cartNetTotal)}
            </div>
          </div>
        </div>

        <button
          disabled={cart.length === 0}
          onClick={() => {
            setIsMobileCartOpen(false);
            setIsCheckoutOpen(true);
          }}
          className={`py-2.5 px-5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition ${
            cart.length > 0
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          <span>Bayar</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 4. Slide-over Cart Drawer for Mobile / iPad Portrait */}
      {isMobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex justify-end bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 h-full flex flex-col shadow-2xl animate-in slide-in-from-right">
            <div className="p-3.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
              <span className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <span>Rincian Keranjang ({totalItemCount})</span>
              </span>
              <button
                onClick={() => setIsMobileCartOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <CartSection
                cart={cart}
                subtotal={cartSubtotal}
                discountTotal={cartDiscountTotal}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onUpdateItemDetails={handleUpdateItemDetails}
                onClearCart={handleClearCart}
                onOpenCheckout={() => {
                  setIsMobileCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 5. Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          cart={cart}
          subtotal={cartSubtotal}
          discountTotal={cartDiscountTotal}
          settings={settings}
          onClose={() => setIsCheckoutOpen(false)}
          onComplete={handleTransactionComplete}
        />
      )}

      {/* 6. Receipt Modal */}
      {isReceiptOpen && (
        <ReceiptModal
          transaction={activeReceiptTransaction}
          settings={settings}
          onClose={() => setIsReceiptOpen(false)}
          onNewTransaction={() => {
            setCart([]);
            setIsReceiptOpen(false);
          }}
          onConnectBluetoothPrompt={() => {
            setIsReceiptOpen(false);
            setIsBluetoothOpen(true);
          }}
        />
      )}

      {/* 7. Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onSave={(newSettings) => setSettings(newSettings)}
          onClose={() => setIsSettingsOpen(false)}
          onTestPrint={handleTestPrint}
        />
      )}

      {/* 8. History & Reports Modal */}
      {isHistoryOpen && (
        <HistoryModal
          transactions={transactions}
          settings={settings}
          onClose={() => setIsHistoryOpen(false)}
          onSelectTransactionForReprint={(tx) => {
            setActiveReceiptTransaction(tx);
            setIsReceiptOpen(true);
          }}
          onToggleVoidTransaction={handleToggleVoidTransaction}
          onPrintShiftReport={handlePrintShiftReport}
        />
      )}

      {/* 9. Product Manager Modal */}
      {isProductManagerOpen && (
        <ProductManagementModal
          products={products}
          categories={dynamicCategories}
          onSaveProducts={(newProds) => setProducts(newProds)}
          onClose={() => setIsProductManagerOpen(false)}
        />
      )}

      {/* 10. Bluetooth Printer Modal */}
      {isBluetoothOpen && (
        <BluetoothPrinterModal
          onClose={() => setIsBluetoothOpen(false)}
          onConnected={() => {
            setIsBluetoothOpen(false);
            if (activeReceiptTransaction) {
              setIsReceiptOpen(true);
            }
          }}
        />
      )}

      {/* 11. Hidden Printable Element for Browser/AirPrint (@media print) */}
      <PrintableReceipt
        transaction={activeReceiptTransaction}
        settings={settings}
        isScreenPreview={false}
      />
    </div>
  );
}
