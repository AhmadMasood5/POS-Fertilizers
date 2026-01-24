import { useState } from 'react';
import { useApp } from './AppContext';
import { 
  DollarSign, 
  Package, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Truck, 
  ArrowRight,
  Filter,
  User
} from 'lucide-react';
import { WelcomeBanner } from './WelcomeBanner';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { products, customers, sales, ledgerEntries, suppliers, shop } = useApp();
  const [staffFilter, setStaffFilter] = useState<string>('all');

  // 1. Get unique list of staff members from sales history for the filter
  const staffMembers = Array.from(new Set(sales.map(s => (s as any).soldBy || 'Admin')));

  // 2. Normalize "Today" to midnight for accurate comparison
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // 3. Filter sales based on selected staff
  const filteredSales = sales.filter(sale => {
    const matchesStaff = staffFilter === 'all' || ((sale as any).soldBy || 'Admin') === staffFilter;
    return matchesStaff;
  });

  // 4. Calculate stats based on filtered data
  const todaySales = filteredSales.filter(sale => {
    const saleDate = new Date(sale.date);
    saleDate.setHours(0, 0, 0, 0);
    return saleDate.getTime() === todayStart.getTime();
  });

  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  
  // These stats remain global (business-wide)
  const totalReceivables = customers.reduce((sum, customer) => sum + customer.balance, 0);
  const totalPayables = suppliers.reduce((sum, supplier) => sum + (supplier.balance || 0), 0);
  const currentBalance = ledgerEntries.length > 0 ? ledgerEntries[0].balance : 0;
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  return (
    <div className="space-y-5">
      <WelcomeBanner />
      
      {/* Header & Staff Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-lg font-semibold text-gray-800 tracking-tight">Business Overview</h2>
        
        <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
          <Filter size={14} className="text-gray-400" />
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">Filter by Staff:</span>
          <select 
            value={staffFilter}
            onChange={(e) => setStaffFilter(e.target.value)}
            className="text-xs font-semibold text-blue-600 bg-transparent outline-none cursor-pointer"
          >
            <option value="all">All Team Members</option>
            {staffMembers.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Interactive Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Today's Sales */}
        <div 
          onClick={() => onNavigate('sales')}
          className="bg-white p-3 rounded border border-gray-200 shadow-sm cursor-pointer hover:border-green-400 hover:bg-green-50/30 transition-all group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Today</p>
              <p className="text-lg font-bold text-gray-800">RS.{todayRevenue.toLocaleString()}</p>
              <p className="text-[10px] text-green-600 font-medium">{todaySales.length} Orders</p>
            </div>
            <div className="bg-green-50 p-1.5 rounded group-hover:bg-green-100 transition-colors">
              <DollarSign className="text-green-600" size={16} />
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div 
          onClick={() => onNavigate('sales')}
          className="bg-white p-3 rounded border border-gray-200 shadow-sm cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Revenue</p>
              <p className="text-lg font-bold text-gray-800">RS.{totalRevenue.toLocaleString()}</p>
              <p className="text-[10px] text-gray-400 font-medium">{staffFilter === 'all' ? 'Total' : `By ${staffFilter}`}</p>
            </div>
            <div className="bg-blue-50 p-1.5 rounded group-hover:bg-blue-100 transition-colors">
              <TrendingUp className="text-blue-600" size={16} />
            </div>
          </div>
        </div>

        {/* Receivables */}
        <div 
          onClick={() => onNavigate('customers')}
          className="bg-white p-3 rounded border border-gray-200 shadow-sm cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 transition-all group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Receivable</p>
              <p className="text-lg font-bold text-orange-600">RS.{totalReceivables.toLocaleString()}</p>
            </div>
            <div className="bg-orange-50 p-1.5 rounded group-hover:bg-orange-100 transition-colors">
              <Users className="text-orange-600" size={16} />
            </div>
          </div>
        </div>

        {/* Payables */}
        <div 
          onClick={() => onNavigate('suppliers')}
          className="bg-white p-3 rounded border border-gray-200 shadow-sm cursor-pointer hover:border-red-400 hover:bg-red-50/30 transition-all group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Payable</p>
              <p className="text-lg font-bold text-red-600">RS.{totalPayables.toLocaleString()}</p>
            </div>
            <div className="bg-red-50 p-1.5 rounded group-hover:bg-red-100 transition-colors">
              <Truck className="text-red-600" size={16} />
            </div>
          </div>
        </div>

        {/* Stock */}
        <div 
          onClick={() => onNavigate('inventory')}
          className="bg-white p-3 rounded border border-gray-200 shadow-sm cursor-pointer hover:border-purple-400 hover:bg-purple-50/30 transition-all group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Stock</p>
              <p className="text-lg font-bold text-gray-800">{products.length} Items</p>
              {lowStockProducts.length > 0 && (
                <p className="text-[10px] text-red-500 font-bold animate-pulse">{lowStockProducts.length} LOW</p>
              )}
            </div>
            <div className="bg-purple-50 p-1.5 rounded group-hover:bg-purple-100 transition-colors">
              <Package className="text-purple-600" size={16} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Sales with Staff Filter */}
        <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              {staffFilter === 'all' ? 'Recent Transactions' : `Sales by ${staffFilter}`}
            </h3>
            <button onClick={() => onNavigate('sales')} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              VIEW HISTORY <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {filteredSales.length > 0 ? (
              filteredSales.slice(0, 6).map(sale => (
                <div key={sale.id} className="px-4 py-3 flex justify-between items-center hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{sale.customerName}</p>
                    <p className="text-[10px] text-gray-400 flex items-center gap-2">
                      {new Date(sale.date).toLocaleDateString()}
                      <span className="flex items-center gap-1 text-blue-500 font-medium">
                        <User size={10} /> {(sale as any).soldBy || 'Admin'}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">RS.{sale.total.toLocaleString()}</p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${sale.balance > 0 ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                      {sale.balance > 0 ? 'Credit' : 'Paid'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center">
                <p className="text-xs text-gray-400">No sales found for this filter.</p>
              </div>
            )}
          </div>
        </div>

        {/* Financial Health Summary */}
        <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Financial Health</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center p-3 bg-green-50/50 border border-green-100 rounded">
              <div>
                <p className="text-[10px] text-green-700 font-bold uppercase">Cash Balance</p>
                <p className="text-base font-bold text-green-800">RS.{currentBalance.toLocaleString()}</p>
              </div>
              <DollarSign size={20} className="text-green-600 opacity-30" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div 
                onClick={() => onNavigate('customers')}
                className="p-3 border border-gray-100 rounded cursor-pointer hover:bg-gray-50"
              >
                <p className="text-[10px] text-gray-400 font-bold uppercase">Total Receivables</p>
                <p className="text-sm font-bold text-orange-600">RS.{totalReceivables.toLocaleString()}</p>
              </div>
              <div 
                onClick={() => onNavigate('suppliers')}
                className="p-3 border border-gray-100 rounded cursor-pointer hover:bg-gray-50"
              >
                <p className="text-[10px] text-gray-400 font-bold uppercase">Total Payables</p>
                <p className="text-sm font-bold text-red-600">RS.{totalPayables.toLocaleString()}</p>
              </div>
            </div>

            <button 
              onClick={() => onNavigate('ledger')} 
              className="w-full mt-2 py-2 border border-blue-600 text-blue-600 rounded text-[11px] font-bold hover:bg-blue-600 hover:text-white transition-all uppercase tracking-wide shadow-sm"
            >
              Open Business Ledger
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}