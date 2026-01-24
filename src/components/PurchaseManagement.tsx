import { useState } from 'react';
import { useApp } from './AppContext';
import { purchasesApi } from '../utils/api';
import { Search, Plus, Minus, Trash2, ShoppingBag, Truck, AlertTriangle } from 'lucide-react';

export function PurchaseManagement() {
  const { products, suppliers, refreshData } = useApp();
  const [cart, setCart] = useState<any[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit'>('cash');
  const [amountPaid, setAmountPaid] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.price,
        total: product.price,
        unit: product.unit
      }]);
    }
  };

  const updateQuantity = (productId: string, change: number) => {
    setCart(cart.map(item => {
      if (item.productId === productId) {
        const newQuantity = item.quantity + change;
        if (newQuantity < 1) return item;
        return { ...item, quantity: newQuantity, total: newQuantity * item.price };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const total = subtotal; 

  const handleCompletePurchase = async () => {
    if (cart.length === 0) return alert('Cart is empty');
    if (!selectedSupplier) return alert('Please select a supplier');

    const supplier = suppliers.find(s => s.id === selectedSupplier);
    if (!supplier) return;

    setIsSubmitting(true);
    const paidAmount = paymentMethod === 'cash' ? total : amountPaid;
    const balance = total - paidAmount;

    try {
      await purchasesApi.create({
        supplierId: supplier.id,
        supplierName: supplier.name,
        items: cart.map(item => ({
          productId: item.productId,
          name: item.productName,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: total,
        paymentMethod,
        amountPaid: paidAmount,
        balance: Math.max(0, balance),
      });

      setCart([]);
      setSelectedSupplier('');
      setAmountPaid(0);
      setPaymentMethod('cash');
      await refreshData();
      alert('Purchase recorded and stock updated!');
    } catch (error: any) {
      alert(error.message || 'Failed to complete purchase');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Products Section (Matching POS) */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products to restock..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              onClick={() => addToCart(product.id)}
              className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-center h-20 bg-blue-50 rounded mb-3">
                <Package className="text-blue-600" size={32} />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm">{product.name}</h3>
              <p className="text-xs text-gray-500 mb-2">{product.category}</p>
              <div className="flex justify-between items-center">
                <span className="font-bold text-blue-700">RS.{product.price}</span>
                <span className="text-xs font-medium text-gray-500">
                   Stock: {product.stock} {product.unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Section (Matching POS) */}
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag className="text-blue-600" size={20} />
            <h3 className="font-semibold text-gray-800">Order Items ({cart.length})</h3>
          </div>

          <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
            {cart.map(item => (
              <div key={item.productId} className="flex items-center gap-2 border-b pb-2">
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-800">{item.productName}</p>
                  <p className="text-xs text-gray-500">RS.{item.price} each</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 hover:bg-gray-100 rounded">
                    <Minus size={14} />
                  </button>
                  <span className="px-2 text-sm font-medium">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 hover:bg-gray-100 rounded">
                    <Plus size={14} />
                  </button>
                </div>
                <span className="font-semibold text-sm w-16 text-right">RS.{item.total.toFixed(2)}</span>
                <button onClick={() => removeFromCart(item.productId)} className="p-1 hover:bg-red-50 rounded text-red-600">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {cart.length === 0 && (
              <p className="text-gray-400 text-center py-8 text-sm">No items in order</p>
            )}
          </div>

          <div className="space-y-3 border-t pt-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Supplier</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <div className="flex gap-2">
                {(['cash', 'credit'] as const).map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`flex-1 px-3 py-2 rounded capitalize ${
                      paymentMethod === method ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {paymentMethod === 'credit' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid (RS.)</label>
                <input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-lg font-bold border-t pt-1">
                <span>Total Bill:</span>
                <span className="text-blue-700">RS.{total.toFixed(2)}</span>
              </div>
              {paymentMethod === 'credit' && (
                <div className="flex justify-between text-orange-600">
                  <span>Payable Later:</span>
                  <span className="font-semibold">RS.{(total - amountPaid).toFixed(2)}</span>
                </div>
              )}
            </div>

            <button
              disabled={isSubmitting || cart.length === 0}
              onClick={handleCompletePurchase}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300"
            >
              {isSubmitting ? 'Processing...' : 'Complete Purchase'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Local Package SVG helper to match your code exactly
function Package({ className, size }: { className?: string; size: number }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
    </svg>
  );
}