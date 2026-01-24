import { useState } from 'react';
import { useApp } from './AppContext';
import { Trash2, Edit2, User, Phone, DollarSign } from 'lucide-react';

export function SupplierManagement() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    phone: '',
    address: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, formData);
        alert('Supplier updated successfully!');
      } else {
        await addSupplier(formData);
        alert('Supplier added successfully!');
      }
      
      setShowForm(false);
      setEditingSupplier(null);
      setFormData({ name: '', contact: '', phone: '', address: '' });
    } catch (error: any) {
      alert(error.message || 'Failed to save supplier');
    }
  };

  const handleEdit = (supplier: any) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact: supplier.contact,
      phone: supplier.phone,
      address: supplier.address,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      try {
        await deleteSupplier(id);
        alert('Supplier deleted successfully!');
      } catch (error: any) {
        alert(error.message || 'Failed to delete supplier');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Supplier Management</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingSupplier(null);
            setFormData({ name: '', contact: '', phone: '', address: '' });
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Add Supplier
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="ABC Fertilizers"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Person *
              </label>
              <input
                type="text"
                required
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Mr. Sharma"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="1234567890"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="City, State"
              />
            </div>
            <div className="col-span-2 flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingSupplier ? 'Update' : 'Add'} Supplier
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingSupplier(null);
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Suppliers List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Supplier</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Contact</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Balance Due</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No suppliers added yet
                </td>
              </tr>
            ) : (
              suppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User className="text-gray-400" size={16} />
                      <div>
                        <p className="font-medium text-gray-800">{supplier.name}</p>
                        <p className="text-xs text-gray-500">{supplier.address}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{supplier.contact}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                      <Phone size={14} />
                      {supplier.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <DollarSign size={16} className={supplier.balance > 0 ? 'text-red-600' : 'text-gray-600'} />
                      <span className={`font-semibold ${supplier.balance > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        RS.{supplier.balance.toFixed(2)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(supplier)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(supplier.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}