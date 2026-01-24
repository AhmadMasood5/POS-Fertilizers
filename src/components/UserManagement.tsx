import { useState, useEffect } from 'react';
import { userApi } from '../utils/api';
import { Plus, Edit2, Trash2, User, UserCheck, Users } from 'lucide-react';

interface TeamUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isOwner?: boolean;
  createdAt?: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'salesman',
    phone: '',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const result = await userApi.getAll();
      setUsers(result.users || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userApi.create(formData);
      setFormData({ email: '', password: '', name: '', role: 'salesman', phone: '' });
      setShowForm(false);
      await loadUsers();
      alert('User created successfully!');
    } catch (error: any) {
      alert(`Failed to create user: ${error.message}`);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await userApi.delete(userId);
      await loadUsers();
      alert('User deleted successfully');
    } catch (error: any) {
      alert(`Failed to delete user: ${error.message}`);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await userApi.updateRole(userId, newRole);
      await loadUsers();
      alert('Role updated successfully');
    } catch (error: any) {
      alert(`Failed to update role: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Team Management</h2>
          <p className="text-gray-600 mt-1">Manage your shop's team members and their roles</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors shadow-md"
        >
          <Plus size={20} />
          Add Team Member
        </button>
      </div>

      {/* Role Info Card */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-500 rounded-lg p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="bg-green-500 rounded-full p-2">
            <Users className="text-white" size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">👥 Role Permissions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-3 border border-blue-200">
                <p className="font-medium text-blue-900 text-sm mb-1">🔵 Admin (You)</p>
                <p className="text-xs text-blue-700">Full access + user management</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <p className="font-medium text-green-900 text-sm mb-1">🟢 Manager</p>
                <p className="text-xs text-green-700">Products, sales, ledger, customers</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-yellow-200">
                <p className="font-medium text-yellow-900 text-sm mb-1">🟡 Salesman</p>
                <p className="text-xs text-yellow-700">Process sales & manage customers only</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-2xl font-bold text-blue-900">{users.length}</p>
          <p className="text-sm text-blue-700">Total Team Members</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-2xl font-bold text-purple-900">{users.filter(u => u.isOwner).length}</p>
          <p className="text-sm text-purple-700">Admins</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-2xl font-bold text-green-900">{users.filter(u => u.role === 'manager').length}</p>
          <p className="text-sm text-green-700">Managers</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-2xl font-bold text-yellow-900">{users.filter(u => u.role === 'salesman').length}</p>
          <p className="text-sm text-yellow-700">Salesmen</p>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Add New Team Member</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Minimum 6 characters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="salesman">Salesman</option>
                <option value="manager">Manager</option>
              </select>
            </div>
            <div className="col-span-2 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Create User
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      user.isOwner ? 'bg-purple-100' : 
                      user.role === 'manager' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {user.isOwner ? (
                        <UserCheck className={user.isOwner ? 'text-purple-600' : 'text-blue-600'} size={20} />
                      ) : (
                        <User className={user.role === 'manager' ? 'text-blue-600' : 'text-green-600'} size={20} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{user.name}</p>
                      {user.isOwner && (
                        <p className="text-xs text-purple-600">Shop Owner</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{user.phone || '-'}</td>
                <td className="px-6 py-4">
                  {user.isOwner ? (
                    <span className="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                      Admin (Owner)
                    </span>
                  ) : (
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="px-3 py-1 text-xs font-medium border border-gray-300 rounded"
                    >
                      <option value="manager">Manager</option>
                      <option value="salesman">Salesman</option>
                    </select>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {!user.isOwner && (
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}