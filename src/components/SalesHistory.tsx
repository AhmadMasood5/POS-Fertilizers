import { useState } from 'react';
import { useApp } from './AppContext';
import { Search, FileText, Printer, Calendar } from 'lucide-react';

export function SalesHistory() {
  const { sales } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSale, setSelectedSale] = useState<string | null>(null);

  const filteredSales = sales.filter(sale => {
    // Text search
    const matchesSearch = sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.id.includes(searchTerm);
    
    // Date range filter
    let matchesDate = true;
    if (startDate || endDate) {
      const saleDate = new Date(sale.date);
      if (startDate && saleDate < new Date(startDate)) {
        matchesDate = false;
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999); // Include the entire end date
        if (saleDate > endDateTime) {
          matchesDate = false;
        }
      }
    }
    
    return matchesSearch && matchesDate;
  });

  const selectedSaleDetails = sales.find(s => s.id === selectedSale);

  const printReceipt = (sale: typeof selectedSaleDetails) => {
    if (!sale) return;

    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) {
      alert('Please allow popups to print receipts');
      return;
    }

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt #${sale.id.slice(-6)}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .header p {
            margin: 5px 0;
            font-size: 14px;
          }
          .receipt-info {
            margin-bottom: 20px;
          }
          .receipt-info table {
            width: 100%;
          }
          .receipt-info td {
            padding: 5px 0;
          }
          .items {
            margin: 20px 0;
          }
          .items table {
            width: 100%;
            border-collapse: collapse;
          }
          .items th {
            background: #f5f5f5;
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
          }
          .items td {
            border: 1px solid #ddd;
            padding: 8px;
          }
          .total-section {
            margin-top: 20px;
            float: right;
            width: 300px;
          }
          .total-section table {
            width: 100%;
          }
          .total-section td {
            padding: 5px 0;
          }
          .total-row {
            font-weight: bold;
            font-size: 18px;
            border-top: 2px solid #333;
          }
          .footer {
            margin-top: 60px;
            text-align: center;
            font-size: 12px;
            color: #666;
            clear: both;
          }
          @media print {
            body {
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Fertilizer Shop POS</h1>
          <p>Sales Receipt</p>
        </div>
        
        <div class="receipt-info">
          <table>
            <tr>
              <td><strong>Receipt #:</strong> ${sale.id.slice(-6)}</td>
              <td style="text-align: right"><strong>Date:</strong> ${new Date(sale.date).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td colspan="2"><strong>Customer:</strong> ${sale.customerName}</td>
            </tr>
          </table>
        </div>

        <div class="items">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${sale.items.map(item => `
                <tr>
                  <td>${item.productName}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.price.toFixed(2)}</td>
                  <td>₹${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="total-section">
          <table>
            <tr>
              <td>Subtotal:</td>
              <td style="text-align: right">₹${sale.subtotal.toFixed(2)}</td>
            </tr>
            ${sale.discount > 0 ? `
            <tr>
              <td>Discount:</td>
              <td style="text-align: right">-₹${sale.discount.toFixed(2)}</td>
            </tr>
            ` : ''}
            <tr class="total-row">
              <td>Total:</td>
              <td style="text-align: right">₹${sale.total.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Amount Paid:</td>
              <td style="text-align: right">₹${sale.amountPaid.toFixed(2)}</td>
            </tr>
            ${sale.balance > 0 ? `
            <tr>
              <td>Balance Due:</td>
              <td style="text-align: right">₹${sale.balance.toFixed(2)}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <div class="footer">
          <p>Payment Method: ${sale.paymentMethod.toUpperCase()}</p>
          <p>Thank you for your business!</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
            // Close window after printing (optional)
            // window.onafterprint = function() { window.close(); };
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Sales History</h2>
        <div className="flex gap-3 items-center">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Start Date"
            />
          </div>
          <span className="text-gray-500">to</span>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="End Date"
            />
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by customer or invoice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-80"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales List */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      #{sale.id.slice(-6)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(sale.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">{sale.customerName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{sale.items.length}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      ₹{sale.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        sale.paymentMethod === 'cash'
                          ? 'bg-green-100 text-green-800'
                          : sale.balance > 0
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {sale.paymentMethod === 'cash' ? 'Cash' : sale.balance > 0 ? 'Partial' : 'Credit Paid'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedSale(sale.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <FileText size={18} />
                      </button>
                      <button
                        onClick={() => printReceipt(sale)}
                        className="text-blue-600 hover:text-blue-700 ml-2"
                      >
                        <Printer size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredSales.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No sales found' : 'No sales yet'}
              </div>
            )}
          </div>
        </div>

        {/* Invoice Details */}
        <div className="bg-white rounded-lg shadow p-6">
          {selectedSaleDetails ? (
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-semibold text-gray-800 mb-2">Invoice Details</h3>
                <p className="text-sm text-gray-600">Invoice #: {selectedSaleDetails.id.slice(-6)}</p>
                <p className="text-sm text-gray-600">
                  Date: {new Date(selectedSaleDetails.date).toLocaleDateString()}
                </p>
              </div>

              <div className="border-b pb-4">
                <h4 className="font-medium text-gray-700 mb-2">Customer</h4>
                <p className="text-sm text-gray-800">{selectedSaleDetails.customerName}</p>
              </div>

              <div className="border-b pb-4">
                <h4 className="font-medium text-gray-700 mb-2">Items</h4>
                <div className="space-y-2">
                  {selectedSaleDetails.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <div>
                        <p className="text-gray-800">{item.productName}</p>
                        <p className="text-gray-500">
                          {item.quantity} × ₹{item.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-medium text-gray-800">₹{item.total.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium text-gray-800">
                    ₹{selectedSaleDetails.subtotal.toFixed(2)}
                  </span>
                </div>
                {selectedSaleDetails.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-medium text-gray-800">
                      -₹{selectedSaleDetails.discount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-green-700">₹{selectedSaleDetails.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="font-medium text-gray-800">
                    ₹{selectedSaleDetails.amountPaid.toFixed(2)}
                  </span>
                </div>
                {selectedSaleDetails.balance > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Balance Due:</span>
                    <span className="font-medium text-orange-700">
                      ₹{selectedSaleDetails.balance.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <span className={`px-3 py-1 text-sm font-medium rounded ${
                  selectedSaleDetails.paymentMethod === 'cash'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  Payment: {selectedSaleDetails.paymentMethod.toUpperCase()}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="mx-auto mb-2 text-gray-400" size={48} />
              <p>Select a sale to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}