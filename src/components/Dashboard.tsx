import { useApp } from './AppContext';
import { DollarSign, Package, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { WelcomeBanner } from './WelcomeBanner';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { products, customers, sales, ledgerEntries } = useApp();

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const todaySales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    const today = new Date();
    return saleDate.toDateString() === today.toDateString();
  });
  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);

  const totalReceivables = customers.reduce((sum, customer) => sum + customer.balance, 0);
  const currentBalance = ledgerEntries.length > 0 ? ledgerEntries[0].balance : 0;

  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  return (
    <div className="space-y-6">
      <WelcomeBanner />
      
      <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Today's Sales</p>
              <p className="text-2xl font-bold text-gray-800">₹{todayRevenue.toFixed(2)}</p>
              <p className="text-sm text-gray-600 mt-1">{todaySales.length} transactions</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800">₹{totalRevenue.toFixed(2)}</p>
              <p className="text-sm text-gray-600 mt-1">{sales.length} total sales</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Products</p>
              <p className="text-2xl font-bold text-gray-800">{products.length}</p>
              <p className="text-sm text-gray-600 mt-1">{lowStockProducts.length} low stock</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Package className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Customers</p>
              <p className="text-2xl font-bold text-gray-800">{customers.length}</p>
              <p className="text-sm text-gray-600 mt-1">₹{totalReceivables.toFixed(2)} pending</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Users className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900">Low Stock Alert</h3>
              <p className="text-sm text-yellow-800 mt-1">
                {lowStockProducts.length} product(s) are running low on stock:
              </p>
              <ul className="mt-2 space-y-1">
                {lowStockProducts.map(product => (
                  <li key={product.id} className="text-sm text-yellow-800">
                    • {product.name}: {product.stock} {product.unit} (Min: {product.minStock} {product.unit})
                  </li>
                ))}
              </ul>
              <button
                onClick={() => onNavigate('inventory')}
                className="mt-3 text-sm font-medium text-yellow-900 hover:text-yellow-700 underline"
              >
                Manage Inventory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Sales and Ledger Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Sales</h3>
          <div className="space-y-3">
            {sales.slice(0, 5).map(sale => (
              <div key={sale.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium text-gray-800">{sale.customerName}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(sale.date).toLocaleDateString()} • {sale.items.length} items
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">₹{sale.total.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{sale.paymentMethod}</p>
                </div>
              </div>
            ))}
            {sales.length === 0 && (
              <p className="text-gray-500 text-center py-4">No sales yet</p>
            )}
          </div>
          <button
            onClick={() => onNavigate('sales')}
            className="mt-4 w-full text-center text-sm text-green-700 hover:text-green-600 font-medium"
          >
            View All Sales
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Ledger Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
              <span className="text-gray-700">Current Balance</span>
              <span className="font-bold text-green-700">₹{currentBalance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
              <span className="text-gray-700">Accounts Receivable</span>
              <span className="font-bold text-orange-700">₹{totalReceivables.toFixed(2)}</span>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-gray-700">Recent Transactions:</p>
              {ledgerEntries.slice(0, 3).map(entry => (
                <div key={entry.id} className="flex justify-between text-sm border-b pb-2">
                  <span className="text-gray-600">{entry.description}</span>
                  <span className={entry.credit > 0 ? 'text-green-600' : 'text-red-600'}>
                    {entry.credit > 0 ? '+' : '-'}₹{(entry.credit || entry.debit).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => onNavigate('ledger')}
            className="mt-4 w-full text-center text-sm text-green-700 hover:text-green-600 font-medium"
          >
            View Full Ledger
          </button>
        </div>
      </div>
    </div>
  );
}