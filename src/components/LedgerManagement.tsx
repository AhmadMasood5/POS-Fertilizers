import { useState } from 'react';
import { useApp } from './AppContext';
import { ledgerApi } from '../utils/api'; 
import { Plus, Search, Truck, X, Calendar, FileText, TrendingUp, Wallet } from 'lucide-react';

export function LedgerManagement() {
  const { ledgerEntries, customers, suppliers, refreshData } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [activeForm, setActiveForm] = useState<'customer_payment' | 'supplier_payment' | 'expense' | 'opening_balance' | null>(null);
  
  const [openingData, setOpeningData] = useState({ description: 'Initial Business Cash', amount: 0 });
  const [expenseData, setExpenseData] = useState({ description: '', amount: 0 });
  const [custPaymentData, setCustPaymentData] = useState({ customerId: '', amount: 0, description: '' });
  const [suppPaymentData, setSuppPaymentData] = useState({ supplierId: '', amount: 0, description: '' });

  const closeForm = () => {
    setActiveForm(null);
    setOpeningData({ description: 'Initial Business Cash', amount: 0 });
    setExpenseData({ description: '', amount: 0 });
    setCustPaymentData({ customerId: '', amount: 0, description: '' });
    setSuppPaymentData({ supplierId: '', amount: 0, description: '' });
  };

  // --- HANDLERS ---
  const handleOpeningSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (openingData.amount <= 0) return alert("Please enter a valid amount");
    try {
      await ledgerApi.addEntry({ 
        type: 'general', 
        description: openingData.description, 
        debit: 0, 
        credit: openingData.amount, 
        date: new Date().toISOString() 
      });
      refreshData?.();
      closeForm();
      alert('Opening balance added!');
    } catch (error) { alert('Failed to add opening balance'); }
  };

  const handleCustomerPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ledgerApi.paymentMethod(custPaymentData.customerId, custPaymentData.amount, custPaymentData.description || 'Customer Payment');
      refreshData?.();
      closeForm();
    } catch (error) { alert('Failed to record customer payment'); }
  };

  const handleSupplierPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ledgerApi.supplierPayment(suppPaymentData.supplierId, suppPaymentData.amount, suppPaymentData.description || 'Supplier Payment');
      refreshData?.();
      closeForm();
    } catch (error) { alert('Failed to record supplier payment'); }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ledgerApi.addEntry({ type: 'expense', description: expenseData.description, debit: expenseData.amount, credit: 0, date: new Date().toISOString() });
      refreshData?.();
      closeForm();
    } catch (error) { alert('Failed to add expense'); }
  };

  // --- FILTERS ---
  const filteredEntries = ledgerEntries.filter((entry: any) => {
    const matchesSearch = entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.customerName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (entry.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()));

    let matchesDate = true;
    if (startDate || endDate) {
      const entryDate = new Date(entry.date);
      if (startDate && entryDate < new Date(startDate)) matchesDate = false;
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        if (entryDate > endDateTime) matchesDate = false;
      }
    }
    return matchesSearch && matchesDate;
  });

  const currentBalance = ledgerEntries.length > 0 ? (ledgerEntries[0] as any).balance : 0;

  return (
    <div className="space-y-5 pb-10">
      {/* Header & Total Balance Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 tracking-tight">Ledger Management</h2>
          <p className="text-xs text-gray-500 font-normal">Track your cash flow and balances</p>
        </div>
        <div className="bg-gray-50 px-6 py-2 rounded-lg border border-gray-100 text-left sm:text-right w-full sm:w-auto">
          <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-widest">Total Cash Balance</p>
          <p className={`text-xl font-semibold ${currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            RS. {currentBalance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2">
        <button onClick={() => setActiveForm('opening_balance')} className="bg-amber-600 text-white py-2.5 px-4 rounded-lg text-xs font-semibold hover:bg-amber-700 flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95">
          <Wallet size={16}/> Opening Cash
        </button>
        <button onClick={() => setActiveForm('customer_payment')} className="bg-green-600 text-white py-2.5 px-4 rounded-lg text-xs font-semibold hover:bg-green-700 flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95">
          <TrendingUp size={16}/> Customer Payment
        </button>
        <button onClick={() => setActiveForm('supplier_payment')} className="bg-blue-600 text-white py-2.5 px-4 rounded-lg text-xs font-semibold hover:bg-blue-700 flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95">
          <Truck size={16}/> Supplier Payment
        </button>
        <button onClick={() => setActiveForm('expense')} className="bg-red-600 text-white py-2.5 px-4 rounded-lg text-xs font-semibold hover:bg-red-700 flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95">
          <Plus size={16}/> Shop Expense
        </button>
      </div>

      {/* Dynamic Form Area */}
      {activeForm && (
        <div className="bg-white p-5 rounded-xl border-2 border-gray-100 shadow-md animate-in fade-in zoom-in duration-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-widest flex items-center gap-2">
              <Plus size={16} className="text-blue-500" />
              {activeForm.replace('_', ' ')}
            </h3>
            <button onClick={closeForm} className="p-1 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"><X size={20}/></button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeForm === 'opening_balance' && (
              <>
                <div className="lg:col-span-2">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase mb-1 block">Description</label>
                  <input type="text" className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500" value={openingData.description} onChange={(e) => setOpeningData({...openingData, description: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase mb-1 block">Cash Amount</label>
                  <input type="number" placeholder="Enter Total RS" className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-amber-700" value={openingData.amount || ''} onChange={(e) => setOpeningData({...openingData, amount: parseFloat(e.target.value) || 0})} />
                </div>
                <div className="flex items-end">
                  <button onClick={handleOpeningSubmit} className="bg-amber-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold w-full shadow-md hover:bg-amber-700 transition-colors">Confirm Cash</button>
                </div>
              </>
            )}

            {activeForm === 'supplier_payment' && (
              <>
                <select className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" value={suppPaymentData.supplierId} onChange={(e) => setSuppPaymentData({ ...suppPaymentData, supplierId: e.target.value })}>
                  <option value="">Select Supplier</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (Payable: {s.balance})</option>
                  ))}
                </select>
                <input type="number" placeholder="Amount" className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" value={suppPaymentData.amount || ''} onChange={(e) => setSuppPaymentData({...suppPaymentData, amount: parseFloat(e.target.value) || 0})} />
                <input type="text" placeholder="Note/Cheque #" className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" value={suppPaymentData.description} onChange={(e) => setSuppPaymentData({...suppPaymentData, description: e.target.value})} />
                <button onClick={handleSupplierPayment} className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold w-full hover:bg-blue-700">Save Payment</button>
              </>
            )}

            {activeForm === 'customer_payment' && (
              <>
                <select className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500" value={custPaymentData.customerId} onChange={(e) => setCustPaymentData({ ...custPaymentData, customerId: e.target.value })}>
                  <option value="">Select Customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} (Balance: {c.balance})</option>
                  ))}
                </select>
                <input type="number" placeholder="Amount" className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500" value={custPaymentData.amount || ''} onChange={(e) => setCustPaymentData({...custPaymentData, amount: parseFloat(e.target.value) || 0})} />
                <input type="text" placeholder="Note" className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500" value={custPaymentData.description} onChange={(e) => setCustPaymentData({...custPaymentData, description: e.target.value})} />
                <button onClick={handleCustomerPayment} className="bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold w-full hover:bg-green-700">Save Receipt</button>
              </>
            )}

            {activeForm === 'expense' && (
              <>
                <div className="lg:col-span-2">
                  <input type="text" placeholder="Expense Description (e.g. Electricity, Rent)" className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500" value={expenseData.description} onChange={(e) => setExpenseData({...expenseData, description: e.target.value})} />
                </div>
                <input type="number" placeholder="Amount" className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-500" value={expenseData.amount || ''} onChange={(e) => setExpenseData({...expenseData, amount: parseFloat(e.target.value) || 0})} />
                <button onClick={handleExpenseSubmit} className="bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold w-full hover:bg-red-700">Add Expense</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Search and Date Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg w-full md:w-auto border border-gray-100">
          <Calendar size={16} className="text-gray-400" />
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent border-none text-xs outline-none font-semibold text-gray-600" />
          <span className="text-gray-300 font-semibold text-xs uppercase">to</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent border-none text-xs outline-none font-semibold text-gray-600" />
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by name or note..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500 transition-all" 
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-gray-50 text-gray-400 border-b border-gray-200">
              <tr className="text-[10px] font-semibold uppercase tracking-widest">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Transaction Details</th>
                <th className="px-6 py-4 text-right">Debit (-)</th>
                <th className="px-6 py-4 text-right">Credit (+)</th>
                <th className="px-6 py-4 text-right">Running Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEntries.map((entry: any) => (
                <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-xs font-semibold text-gray-500">
                    {new Date(entry.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-800">{entry.description}</div>
                    <div className="text-[10px] font-semibold text-blue-500 uppercase tracking-tight">
                      {entry.customerName || entry.supplierName || 'General Account'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-red-600 font-semibold">
                    {entry.debit > 0 ? `-${entry.debit.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-green-600 font-semibold">
                    {entry.credit > 0 ? `+${entry.credit.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    {entry.balance.toLocaleString()}
                  </td>
                </tr>
              ))}
              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400 italic">No transactions found for these filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}