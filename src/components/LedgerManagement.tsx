import { useState } from 'react';
import { useApp } from './AppContext';
import { Plus, DollarSign, TrendingDown, TrendingUp, ShoppingCart } from 'lucide-react';

export function LedgerManagement() {
  const { ledgerEntries, customers, addLedgerEntry, addPayment } = useApp();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [expenseData, setExpenseData] = useState({
    description: '',
    amount: 0,
  });
  const [purchaseData, setPurchaseData] = useState({
    description: '',
    amount: 0,
    supplierName: '',
  });
  const [paymentData, setPaymentData] = useState({
    customerId: '',
    amount: 0,
    description: '',
  });

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addLedgerEntry({
        type: 'expense',
        description: expenseData.description,
        debit: expenseData.amount,
        credit: 0,
      });
      setExpenseData({ description: '', amount: 0 });
      setShowExpenseForm(false);
    } catch (error) {
      alert('Failed to add expense. Please try again.');
    }
  };

  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addLedgerEntry({
        type: 'purchase',
        description: `Purchase from ${purchaseData.supplierName}: ${purchaseData.description}`,
        debit: purchaseData.amount,
        credit: 0,
        customerName: purchaseData.supplierName, // Using customerName field for supplier
      });
      setPurchaseData({ description: '', amount: 0, supplierName: '' });
      setShowPurchaseForm(false);
    } catch (error) {
      alert('Failed to add purchase. Please try again.');
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find(c => c.id === paymentData.customerId);
    if (!customer) return;

    try {
      await addPayment(
        paymentData.customerId,
        paymentData.amount,
        paymentData.description || `Payment received from ${customer.name}`
      );
      setPaymentData({ customerId: '', amount: 0, description: '' });
      setShowPaymentForm(false);
    } catch (error) {
      alert('Failed to record payment. Please try again.');
    }
  };

  const currentBalance = ledgerEntries.length > 0 ? ledgerEntries[0].balance : 0;
  const totalCredit = ledgerEntries.reduce((sum, entry) => sum + entry.credit, 0);
  const totalDebit = ledgerEntries.reduce((sum, entry) => sum + entry.debit, 0);
  const customersWithBalance = customers.filter(c => c.balance > 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Ledger Management</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPaymentForm(!showPaymentForm)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <DollarSign size={20} />
            Record Payment
          </button>
          <button
            onClick={() => setShowExpenseForm(!showExpenseForm)}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus size={20} />
            Add Expense
          </button>
          <button
            onClick={() => setShowPurchaseForm(!showPurchaseForm)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <ShoppingCart size={20} />
            Add Purchase
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Current Balance</p>
              <p className="text-2xl font-bold text-gray-800">RS.{currentBalance.toFixed(2)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Income</p>
              <p className="text-2xl font-bold text-green-700">RS.{totalCredit.toFixed(2)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Expenses</p>
              <p className="text-2xl font-bold text-red-700">RS.{totalDebit.toFixed(2)}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <TrendingDown className="text-red-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Forms */}
      {showPaymentForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Record Customer Payment</h3>
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              <select
                required
                value={paymentData.customerId}
                onChange={(e) => setPaymentData({ ...paymentData, customerId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Customer</option>
                {customersWithBalance.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} (Balance: RS.{customer.balance.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (RS.)</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={paymentData.amount}
                onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
              <input
                type="text"
                value={paymentData.description}
                onChange={(e) => setPaymentData({ ...paymentData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowPaymentForm(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Record Payment
              </button>
            </div>
          </form>
        </div>
      )}

      {showExpenseForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Add Expense</h3>
          <form onSubmit={handleExpenseSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                required
                value={expenseData.description}
                onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
                placeholder="e.g., Rent, Utilities, Purchase"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (RS.)</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={expenseData.amount}
                onChange={(e) => setExpenseData({ ...expenseData, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowExpenseForm(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Add Expense
              </button>
            </div>
          </form>
        </div>
      )}

      {showPurchaseForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Add Purchase</h3>
          <form onSubmit={handlePurchaseSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
              <input
                type="text"
                required
                value={purchaseData.supplierName}
                onChange={(e) => setPurchaseData({ ...purchaseData, supplierName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                required
                value={purchaseData.description}
                onChange={(e) => setPurchaseData({ ...purchaseData, description: e.target.value })}
                placeholder="e.g., Raw Materials, Equipment"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (RS.)</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={purchaseData.amount}
                onChange={(e) => setPurchaseData({ ...purchaseData, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowPurchaseForm(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Add Purchase
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Accounts Receivable */}
      {customersWithBalance.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Accounts Receivable</h3>
          <div className="space-y-2">
            {customersWithBalance.map(customer => (
              <div key={customer.id} className="flex justify-between items-center p-3 bg-orange-50 rounded">
                <div>
                  <p className="font-medium text-gray-800">{customer.name}</p>
                  <p className="text-sm text-gray-600">{customer.phone}</p>
                </div>
                <span className="font-bold text-orange-700">RS.{customer.balance.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ledger Entries */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">Transaction History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Debit</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Credit</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {ledgerEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(entry.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      entry.type === 'sale' ? 'bg-green-100 text-green-800' :
                      entry.type === 'payment' ? 'bg-blue-100 text-blue-800' :
                      entry.type === 'expense' ? 'bg-red-100 text-red-800' :
                      entry.type === 'purchase' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {entry.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">{entry.description}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{entry.customerName || '-'}</td>
                  <td className="px-6 py-4 text-sm text-right text-red-600">
                    {entry.debit > 0 ? `RS.${entry.debit.toFixed(2)}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-green-600">
                    {entry.credit > 0 ? `RS.${entry.credit.toFixed(2)}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-medium text-gray-800">
                    RS.{entry.balance.toFixed(2)}
                  </td>
                </tr>
              ))}
              {ledgerEntries.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No transactions yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}