import { useState } from 'react';
import { useApp } from './AppContext';
import { ledgerApi } from '../utils/api'; 
import { Plus, Search, Truck, X, Calendar, FileText, TrendingUp } from 'lucide-react';

export function LedgerManagement() {
  const { ledgerEntries, customers, suppliers, refreshData } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [activeForm, setActiveForm] = useState<'customer_payment' | 'supplier_payment' | 'expense' | null>(null);
  const [expenseData, setExpenseData] = useState({ description: '', amount: 0 });
  const [custPaymentData, setCustPaymentData] = useState({ customerId: '', amount: 0, description: '' });
  const [suppPaymentData, setSuppPaymentData] = useState({ supplierId: '', amount: 0, description: '' });

  const closeForm = () => {
    setActiveForm(null);
    setExpenseData({ description: '', amount: 0 });
    setCustPaymentData({ customerId: '', amount: 0, description: '' });
    setSuppPaymentData({ supplierId: '', amount: 0, description: '' });
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
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium text-gray-800">Ledger Management</h2>
        <div className="text-right">
          <p className="text-[10px] text-gray-400 uppercase font-semibold">Total Balance</p>
          <p className={`text-lg font-semibold ${currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            RS. {currentBalance.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setActiveForm('customer_payment')} className="bg-green-600 text-white py-1.5 px-4 rounded text-sm font-medium hover:bg-green-700 flex items-center gap-2">
          <TrendingUp size={14}/> Customer Payment
        </button>
        <button onClick={() => setActiveForm('supplier_payment')} className="bg-blue-600 text-white py-1.5 px-4 rounded text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
          <Truck size={14}/> Supplier Payment
        </button>
        <button onClick={() => setActiveForm('expense')} className="bg-red-600 text-white py-1.5 px-4 rounded text-sm font-medium hover:bg-red-700 flex items-center gap-2">
          <Plus size={14}/> Shop Expense
        </button>
      </div>

      {activeForm && (
        <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {activeForm.replace('_', ' ')}
            </h3>
            <button onClick={closeForm} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {activeForm === 'supplier_payment' && (
              <>
                <select className="p-1.5 border rounded text-xs outline-none" value={suppPaymentData.supplierId} onChange={(e) => setSuppPaymentData({ ...suppPaymentData, supplierId: e.target.value })}>
                  <option value="">Select Supplier</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Payable: RS. {s.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
                <input type="number" placeholder="Amount" className="p-1.5 border rounded text-xs outline-none" value={suppPaymentData.amount || ''} onChange={(e) => setSuppPaymentData({...suppPaymentData, amount: parseFloat(e.target.value) || 0})} />
                <input type="text" placeholder="Note" className="p-1.5 border rounded text-xs outline-none" value={suppPaymentData.description} onChange={(e) => setSuppPaymentData({...suppPaymentData, description: e.target.value})} />
                <button onClick={handleSupplierPayment} className="bg-blue-600 text-white px-4 py-1.5 rounded text-xs font-medium">Save</button>
              </>
            )}
            {activeForm === 'customer_payment' && (
              <>
                <select className="p-1.5 border rounded text-xs outline-none" value={custPaymentData.customerId} onChange={(e) => setCustPaymentData({ ...custPaymentData, customerId: e.target.value })}>
                  <option value="">Select Customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Receivable: RS. {c.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
                <input type="number" placeholder="Amount" className="p-1.5 border rounded text-xs outline-none" value={custPaymentData.amount || ''} onChange={(e) => setCustPaymentData({...custPaymentData, amount: parseFloat(e.target.value) || 0})} />
                <input type="text" placeholder="Note" className="p-1.5 border rounded text-xs outline-none" value={custPaymentData.description} onChange={(e) => setCustPaymentData({...custPaymentData, description: e.target.value})} />
                <button onClick={handleCustomerPayment} className="bg-green-600 text-white px-4 py-1.5 rounded text-xs font-medium">Save</button>
              </>
            )}
            {activeForm === 'expense' && (
              <>
                <input type="text" placeholder="Description" className="p-1.5 border rounded text-xs outline-none md:col-span-2" value={expenseData.description} onChange={(e) => setExpenseData({...expenseData, description: e.target.value})} />
                <input type="number" placeholder="Amount" className="p-1.5 border rounded text-xs outline-none" value={expenseData.amount || ''} onChange={(e) => setExpenseData({...expenseData, amount: parseFloat(e.target.value) || 0})} />
                <button onClick={handleExpenseSubmit} className="bg-red-600 text-white px-4 py-1.5 rounded text-xs font-medium">Add</button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-3 items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded">
          <Calendar size={14} className="text-gray-400" />
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent border-none text-xs outline-none" />
          <span className="text-gray-300">to</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent border-none text-xs outline-none" />
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input 
            type="text" 
            placeholder="Search transaction..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded text-xs outline-none focus:border-green-500" 
          />
        </div>
      </div>

      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider">Date</th>
              <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider">Details</th>
              <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider">Debit (-)</th>
              <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider">Credit (+)</th>
              <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredEntries.map((entry: any) => (
              <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-xs text-gray-500">
                  {new Date(entry.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-700">{entry.description}</div>
                  <div className="text-[10px] text-gray-400">{entry.customerName || entry.supplierName || 'General'}</div>
                </td>
                <td className="px-4 py-3 text-right text-xs text-red-600">
                  {entry.debit > 0 ? entry.debit.toLocaleString() : '-'}
                </td>
                <td className="px-4 py-3 text-right text-xs text-green-600">
                  {entry.credit > 0 ? entry.credit.toLocaleString() : '-'}
                </td>
                <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                  {entry.balance.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}