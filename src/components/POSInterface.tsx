import { useState } from 'react';
import { useApp, SaleItem } from './AppContext';
import { Search, Plus, Minus, Trash2, ShoppingCart, AlertTriangle } from 'lucide-react';

export function POSInterface() {
  const { products, customers, addSale } = useApp();
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit'>('cash');
  const [amountPaid, setAmountPaid] = useState(0);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // ✅ Check if product has stock
    if (product.stock <= 0) {
      alert(`${product.name} is out of stock!`);
      return;
    }

    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
      // ✅ Check if adding one more would exceed stock
      if (existingItem.quantity + 1 > product.stock) {
        alert(`Cannot add more ${product.name}. Only ${product.stock} available in stock.`);
        return;
      }
      
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
      }]);
    }
  };

  const updateQuantity = (productId: string, change: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setCart(cart.map(item => {
      if (item.productId === productId) {
        const newQuantity = item.quantity + change;
        
        // ✅ Prevent going below 1
        if (newQuantity < 1) return item;
        
        // ✅ Check stock availability
        if (newQuantity > product.stock) {
          alert(`Cannot add more. Only ${product.stock} ${product.unit} available in stock.`);
          return item;
        }
        
        return { ...item, quantity: newQuantity, total: newQuantity * item.price };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const total = subtotal - discount;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }
    if (!selectedCustomer) {
      alert('Please select a customer');
      return;
    }

    // ✅ Final stock validation before checkout
    for (const item of cart) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        alert(`Product ${item.productName} not found`);
        return;
      }
      if (product.stock < item.quantity) {
        alert(`Insufficient stock for ${product.name}. Available: ${product.stock}, In cart: ${item.quantity}`);
        return;
      }
    }

    const customer = customers.find(c => c.id === selectedCustomer);
    if (!customer) return;

    const paidAmount = paymentMethod === 'cash' ? total : amountPaid;
    const balance = total - paidAmount;

    try {
      await addSale({
        customerId: customer.id,
        customerName: customer.name,
        items: cart,
        subtotal,
        discount,
        total,
        paymentMethod,
        amountPaid: paidAmount,
        balance: Math.max(0, balance),
      });

      // Reset
      setCart([]);
      setSelectedCustomer('');
      setDiscount(0);
      setAmountPaid(0);
      setPaymentMethod('cash');
      alert('Sale completed successfully!');
    } catch (error: any) {
      // ✅ Show backend error message
      alert(error.message || 'Failed to complete sale. Please try again.');
      console.error('Sale error:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Products Section */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              onClick={() => addToCart(product.id)}
              className={`bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-shadow ${
                product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="flex items-center justify-center h-20 bg-green-50 rounded mb-3">
                <Package className="text-green-600" size={32} />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm">{product.name}</h3>
              <p className="text-xs text-gray-500 mb-2">{product.category}</p>
              <div className="flex justify-between items-center">
                <span className="font-bold text-green-700">₹{product.price}</span>
                <span className={`text-xs font-medium ${
                  product.stock <= 0 ? 'text-red-600' : 
                  product.stock <= 10 ? 'text-orange-600' : 
                  'text-gray-500'
                }`}>
                  {product.stock <= 0 ? 'Out of Stock' : `${product.stock} ${product.unit}`}
                </span>
              </div>
              {product.stock > 0 && product.stock <= 1 && (
                <div className="mt-2 flex items-center gap-1 text-xs text-orange-600">
                  <AlertTriangle size={12} />
                  <span>Low stock</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Cart Section */}
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="text-green-600" size={20} />
            <h3 className="font-semibold text-gray-800">Cart ({cart.length})</h3>
          </div>

          <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
            {cart.map(item => {
              const product = products.find(p => p.id === item.productId);
              const hasStockIssue = product && item.quantity > product.stock;
              
              return (
                <div key={item.productId} className={`flex items-center gap-2 border-b pb-2 ${
                  hasStockIssue ? 'bg-red-50' : ''
                }`}>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-800">{item.productName}</p>
                    <p className="text-xs text-gray-500">₹{item.price} each</p>
                    {hasStockIssue && (
                      <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                        <AlertTriangle size={10} />
                        Only {product?.stock} available
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-2 text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="font-semibold text-sm w-16 text-right">₹{item.total.toFixed(2)}</span>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="p-1 hover:bg-red-50 rounded text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
            {cart.length === 0 && (
              <p className="text-gray-400 text-center py-8 text-sm">Cart is empty</p>
            )}
          </div>

          <div className="space-y-3 border-t pt-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount (₹)</label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex-1 px-3 py-2 rounded ${
                    paymentMethod === 'cash'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Cash
                </button>
                <button
                  onClick={() => setPaymentMethod('credit')}
                  className={`flex-1 px-3 py-2 rounded ${
                    paymentMethod === 'credit'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Credit
                </button>
              </div>
            </div>

            {paymentMethod === 'credit' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid (₹)</label>
                <input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            )}

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Discount:</span>
                <span className="font-medium">-₹{discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-1">
                <span>Total:</span>
                <span className="text-green-700">₹{total.toFixed(2)}</span>
              </div>
              {paymentMethod === 'credit' && (
                <div className="flex justify-between text-orange-600">
                  <span>Balance Due:</span>
                  <span className="font-semibold">₹{Math.max(0, total - amountPaid).toFixed(2)}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Complete Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Package({ className, size }: { className?: string; size: number }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}