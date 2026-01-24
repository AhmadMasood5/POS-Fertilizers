import { projectId, publicAnonKey } from './supabase/info'
import { getSupabaseClient } from './supabase/client'

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a01dd888`

let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
  console.log('🔑 Access token set:', token ? 'Token stored' : 'Token cleared')
}

export async function getAccessToken() {
  // First check if we have a token stored in memory
  if (accessToken) {
    console.log('✅ Using stored access token')
    return accessToken
  }

  // Otherwise try to get it from Supabase session
  const supabase = getSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (session?.access_token) {
    console.log('✅ Using Supabase session token')
    accessToken = session.access_token
    return session.access_token
  }

  console.log('⚠️ No access token available')
  return null
}

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  const token = await getAccessToken()
  headers['Authorization'] = `Bearer ${token ?? publicAnonKey}`

  console.log(`📡 API Request: ${options.method || 'GET'} ${endpoint}`, token ? 'with token' : 'without token')

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ error: `Request failed with status ${response.status}` }))

      if (response.status === 401) {
        console.log('🔄 401 Error - Attempting to refresh session...')
        const supabase = getSupabaseClient()
        const { data } = await supabase.auth.refreshSession()

        if (data.session) {
          console.log('✅ Session refreshed successfully')
          headers['Authorization'] = `Bearer ${data.session.access_token}`

          const retryResponse = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers,
          })

          if (retryResponse.ok) {
            return await retryResponse.json()
          } else {
            console.log('❌ Retry failed - Signing out')
            await supabase.auth.signOut()
            setAccessToken(null)
          }
        }

        throw new Error(`Unauthorized: ${errorBody.error}`)
      }

      throw new Error(errorBody.error || `Request failed with status ${response.status}`)
    }

    return await response.json()
  } catch (error: any) {
    throw error
  }
}

export const authApi = {
  signUp: (data: {
    email: string
    password: string
    shopName: string
    ownerName: string
    phone?: string
    address?: string
  }) => apiRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  signin: async (email: string, password: string) => {
    const result = await apiRequest('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    if (result.accessToken) {
      console.log('🔐 Setting access token from signin response')
      setAccessToken(result.accessToken)
    }
    return result
  },

  getSession: async () => {
    try {
      return await apiRequest('/auth/session')
    } catch {
      return { session: null }
    }
  },

  signout: async () => {
    const result = await apiRequest('/auth/signout', { method: 'POST' })
    setAccessToken(null)
    return result
  },
}

export const productsAPI = {
  getAll: () => apiRequest('/products'),
  create: (product: any) => apiRequest('/products', {
    method: 'POST',
    body: JSON.stringify(product),
  }),
  update: (id: string, updates: any) => apiRequest(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
  delete: (id: string) => apiRequest(`/products/${id}`, {
    method: 'DELETE',
  }),
}

export const shopAPI = {
  getAll: () => apiRequest('/products'),
  create: (product: any) => apiRequest('/products', {
    method: 'POST',
    body: JSON.stringify(product),
  }),
  update: (id: string, updates: any) => apiRequest(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
  delete: (id: string) => apiRequest(`/products/${id}`, {
    method: 'DELETE',
  }),
}

export const customerApi = {
  getAll: () => apiRequest('/customers'),
  create: (customer: any) => apiRequest('/customers', {
    method: 'POST',
    body: JSON.stringify(customer),
  }),
  update: (id: string, updates: any) => apiRequest(`/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
  delete: (id: string) => apiRequest(`/customers/${id}`, {
    method: 'DELETE',
  }),
}

export const salesApi = {
  getAll: () => apiRequest('/sales'),
  create: (sale: any) => apiRequest('/sales', {
    method: 'POST',
    body: JSON.stringify(sale),
  }),
}
export const suppliersApi = {
  getAll: () => apiRequest('/suppliers'),
  create: (supplier: any) => apiRequest('/suppliers', {
    method: 'POST',
    body: JSON.stringify(supplier),
  }),
  update: (id: string, updates: any) => apiRequest(`/suppliers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
  delete: (id: string) => apiRequest(`/suppliers/${id}`, {
    method: 'DELETE',
  }),
};

export const purchasesApi = {
  getAll: () => apiRequest('/purchases'),
  create: (purchase: any) => apiRequest('/purchases', {
    method: 'POST',
    body: JSON.stringify(purchase),
  }),
};
export const ledgerApi = {
  getAll: () => apiRequest('/ledger'),
  addEntry: (entry: any) => apiRequest('/ledger/entry', {
    method: 'POST',
    body: JSON.stringify(entry),
  }),
  paymentMethod: (customerId: string, amount: number, description: string) => apiRequest('/ledger/payment', {
    method: 'POST',
    body: JSON.stringify({ customerId, amount, description }),
  }),
   supplierPayment: (supplierId: string, amount: number, description: string) => apiRequest('/ledger/supplier-payment', {
    method: 'POST',
    body: JSON.stringify({ supplierId, amount, description }),
  }),
}

export const adminApi = {
  getPendingApprovals: () => apiRequest('/admin/pending-approvals'),
  getApprovedShops: () => apiRequest('/admin/approved-shops'),
  approveShop: (userId: string, paymentConfirmed: boolean) => apiRequest(`/admin/approve/${userId}`, {
    method: 'POST',
    body: JSON.stringify({ paymentConfirmed }),
  }),
  rejectShop: (userId: string, reason: string) => apiRequest(`/admin/reject/${userId}`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  }),
  updateShopStatus: (shopId: string, status: string) => apiRequest(`/admin/shop/${shopId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
  extendSubscription: (shopId: string, months: number) => apiRequest(`/admin/shop/${shopId}/extend-subscription`, {
    method: 'POST',
    body: JSON.stringify({ months }),
  }),
}

export const userApi = {
  getAll: () => apiRequest('/users'),
  create: (users: any) => apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(users),
  }),
  updateRole: (userId: string, role: string) => apiRequest(`/users/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  }),
  delete: (userId: string) => apiRequest(`/users/${userId}`, {
    method: 'DELETE',
  }),
}