import { useState } from 'react';
import { useApp } from './AppContext';
import { Search, FileText, Printer, Calendar, User } from 'lucide-react';

export function SalesHistory() {
  const { sales } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSale, setSelectedSale] = useState<string | null>(null);

  // Filter logic using type casting to avoid 'soldBy' property errors
  const filteredSales = (sales as any[]).filter(sale => {
    const matchesSearch = 
      sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.id.includes(searchTerm) ||
      (sale.soldBy?.toLowerCase().includes(searchTerm.toLowerCase())); 
    
    let matchesDate = true;
    if (startDate || endDate) {
      const saleDate = new Date(sale.date);
      if (startDate && saleDate < new Date(startDate)) matchesDate = false;
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        if (saleDate > endDateTime) matchesDate = false;
      }
    }
    return matchesSearch && matchesDate;
  });

  const selectedSaleDetails = (sales as any[]).find(s => s.id === selectedSale);

  // Restored printReceipt Function
  const printReceipt = (sale: any) => {
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
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
          .receipt-info { margin: 20px 0; width: 100%; border-collapse: collapse; }
          .items { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items th { background: #f5f5f5; border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          .items td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
          .total-section { float: right; width: 250px; margin-top: 10px; }
          .total-row { font-weight: bold; font-size: 16px; border-top: 2px solid #333; }
          .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #666; clear: both; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Sales Receipt</h2>
          <p>Handled by: ${sale.soldBy || 'Admin'}</p>
        </div>
        <table class="receipt-info">
          <tr>
            <td><strong>Invoice:</strong> #${sale.id.slice(-6)}</td>
            <td style="text-align:right"><strong>Date:</strong> ${new Date(sale.date).toLocaleDateString()}</td>
          </tr>
          <tr>
            <td colspan="2"><strong>Customer:</strong> ${sale.customerName}</td>
          </tr>
        </table>
        <table class="items">
          <thead>
            <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
          </thead>
          <tbody>
            ${sale.items.map((item: any) => `
              <tr>
                <td>${item.productName}</td>
                <td>${item.quantity}</td>
                <td>RS.${item.price.toLocaleString()}</td>
                <td>RS.${item.total.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="total-section">
          <table style="width:100%">
            <tr class="total-row">
              <td>Grand Total:</td>
              <td style="text-align:right">RS.${sale.total.toLocaleString()}</td>
            </tr>
          </table>
        </div>
        <div class="footer">
          <p>Thank you for your business!</p>
        </div>
        <script>window.onload = function() { window.print(); window.close(); }</script>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium text-gray-800">Sales History</h2>
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded border border-gray-200">
            <Calendar size={14} className="text-gray-400" />
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent border-none text-[11px] outline-none" />
            <span className="text-gray-300 text-[11px]">to</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent border-none text-[11px] outline-none" />
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text" 
              placeholder="Search customer, invoice, staff..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="pl-8 pr-3 py-1.5 border border-gray-200 rounded text-xs outline-none w-64 focus:border-green-500" 
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-[10px] font-bold uppercase">Invoice</th>
                <th className="px-4 py-2 text-[10px] font-bold uppercase">Date</th>
                <th className="px-4 py-2 text-[10px] font-bold uppercase">Customer</th>
                <th className="px-4 py-2 text-[10px] font-bold uppercase text-blue-600">Sold By</th>
                <th className="px-4 py-2 text-right text-[10px] font-bold uppercase">Total</th>
                <th className="px-4 py-2 text-center text-[10px] font-bold uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-medium text-gray-700">#{sale.id.slice(-6)}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(sale.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-xs text-gray-700">{sale.customerName}</td>
                  <td className="px-4 py-3 text-xs font-medium text-blue-600 italic">{sale.soldBy || 'Admin'}</td>
                  <td className="px-4 py-3 text-right text-xs font-semibold">RS. {sale.total.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => setSelectedSale(sale.id)} className="p-1 text-gray-400 hover:text-green-600">
                        <FileText size={16} />
                      </button>
                      <button onClick={() => printReceipt(sale)} className="p-1 text-gray-400 hover:text-blue-600">
                        <Printer size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded border border-gray-200 p-4 shadow-sm h-fit">
          {selectedSaleDetails ? (
            <div className="space-y-4">
              <div className="flex justify-between items-start border-b border-dashed pb-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-800">Invoice Details</h3>
                  <p className="text-[10px] text-gray-400">ID: {selectedSaleDetails.id}</p>
                </div>
                <div className="bg-blue-50 px-2 py-1 rounded flex items-center gap-1">
                  <User size={10} className="text-blue-600" />
                  <span className="text-[10px] font-bold text-blue-700 uppercase">{selectedSaleDetails.soldBy || 'Admin'}</span>
                </div>
              </div>
              <div className="space-y-2">
                {selectedSaleDetails.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span className="text-gray-600">{item.productName} (x{item.quantity})</span>
                    <span className="font-medium">RS. {item.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 space-y-1">
                <div className="flex justify-between text-sm font-bold text-green-700">
                  <span>Grand Total:</span>
                  <span>RS. {selectedSaleDetails.total.toLocaleString()}</span>
                </div>
                <button 
                  onClick={() => printReceipt(selectedSaleDetails)}
                  className="w-full mt-3 bg-gray-800 text-white py-2 rounded text-xs font-medium flex items-center justify-center gap-2 hover:bg-black transition-colors"
                >
                  <Printer size={14} /> Print Receipt
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <FileText className="mx-auto text-gray-200 mb-2" size={32} />
              <p className="text-xs text-gray-400 font-medium">Select a sale to view invoice</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}