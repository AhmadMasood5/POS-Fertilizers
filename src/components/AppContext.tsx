import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { productsAPI, customerApi, salesApi, ledgerApi, authApi, suppliersApi, purchasesApi } from '../utils/api';

export interface Product {
  id: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  stock: number;
  minStock: number;
}
export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  address: string;
  balance: number;
  createdAt: string;
}
export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Purchase {
  id: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'credit';
  amountPaid: number;
  balance: number;
  date: string;
}
export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  balance: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Sale {
  id: string;
  date: string;
  customerId: string;
  customerName: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'credit';
  amountPaid: number;
  balance: number;
  soldBy?: string;
}

export interface LedgerEntry {
  id: string;
  date: string;
  type: 'sale' | 'payment' | 'purchase' | 'expense';
  customerId?: string;
  customerName?: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface Shop {
  id: string;
  shopName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  role?: string;
  createdAt: string;
}

interface AppContextType {
  shop: Shop | null;
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  ledgerEntries: LedgerEntry[];
  suppliers: Supplier[];  
  purchases: Purchase[];
  loading: boolean;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id' | 'balance'>) => Promise<void>;
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addSale: (sale: Omit<Sale, 'id' | 'date'>) => Promise<void>;
  addLedgerEntry: (entry: Omit<LedgerEntry, 'id' | 'date' | 'balance'>) => Promise<void>;
  addPayment: (customerId: string, amount: number, description: string) => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'balance' | 'createdAt'>) => Promise<void>;  
  updateSupplier: (id: string, supplier: Partial<Supplier>) => Promise<void>; 
  deleteSupplier: (id: string) => Promise<void>;  
  addPurchase: (purchase: Omit<Purchase, 'id' | 'date'>) => Promise<void>;  
  addSupplierPayment: (supplierId: string, amount: number, description: string) => Promise<void>;  
  refreshData: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
  initialShop: Shop;
  onSignOut: () => void;
}

export function AppProvider({ children, initialShop, onSignOut }: AppProviderProps) {
  const [shop] = useState<Shop>(initialShop);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
   const [suppliers, setSuppliers] = useState<Supplier[]>([]);  // ADD THIS LINE
  const [purchases, setPurchases] = useState<Purchase[]>([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

const loadData = async () => {
  setLoading(true);
  try {
    const [productsRes, customersRes, salesRes, ledgerRes, suppliersRes, purchasesRes] = await Promise.all([
      productsAPI.getAll(),
      customerApi.getAll(),
      salesApi.getAll(),
      ledgerApi.getAll(),
      suppliersApi.getAll(),
      purchasesApi.getAll(),
    ]);

    setProducts(productsRes.products || []);
    setCustomers(customersRes.customers || []);
    setSales(salesRes.sales || []);
    setLedgerEntries(ledgerRes.ledger || []);
    setSuppliers(suppliersRes.suppliers || []);  
    setPurchases(purchasesRes.purchases || []);
  } catch (error) {
    console.error('Failed to load data:', error);
  } finally {
    setLoading(false);
  }
};
  const addSupplier = async (supplier: Omit<Supplier, 'id' | 'balance' | 'createdAt'>) => {
    try {
      const result = await suppliersApi.create(supplier);
      setSuppliers([...suppliers, result.supplier]);
    } catch (error) {
      console.error('Failed to add supplier:', error);
      throw error;
    }
  };
    const updateSupplier = async (id: string, updates: Partial<Supplier>) => {
    try {
      const result = await suppliersApi.update(id, updates);
      setSuppliers(suppliers.map(s => s.id === id ? result.supplier : s));
    } catch (error) {
      console.error('Failed to update supplier:', error);
      throw error;
    }
  };
  const deleteSupplier = async (id: string) => {
    try {
      await suppliersApi.delete(id);
      setSuppliers(suppliers.filter(s => s.id !== id));
    } catch (error) {
      console.error('Failed to delete supplier:', error);
      throw error;
    }
  };
    const addPurchase = async (purchase: Omit<Purchase, 'id' | 'date'>) => {
    try {
      const result = await purchasesApi.create(purchase);
      setPurchases([result.purchase, ...purchases]);
      await loadData(); // Reload to update stock, supplier balances, and ledger
    } catch (error: any) {
      console.error('Failed to create purchase:', error);
      throw error;
    }
  };
   const addSupplierPayment = async (supplierId: string, amount: number, description: string) => {
    try {
      await ledgerApi.supplierPayment(supplierId, amount, description);
      await loadData();
    } catch (error) {
      console.error('Failed to record supplier payment:', error);
      throw error;
    }
  };



  const refreshData = async () => {
    await loadData();
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const result = await productsAPI.create(product);
      setProducts([...products, result.product]);
    } catch (error) {
      console.error('Failed to add product:', error);
      throw error;
    }
  };

  const updateProduct = async (id: string, updatedProduct: Partial<Product>) => {
    try {
      const result = await productsAPI.update(id, updatedProduct);
      setProducts(products.map(p => p.id === id ? result.product : p));
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productsAPI.delete(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete product:', error);
      throw error;
    }
  };

  const addCustomer = async (customer: Omit<Customer, 'id' | 'balance'>) => {
    try {
      const result = await customerApi.create(customer);
      setCustomers([...customers, result.customer]);
    } catch (error) {
      console.error('Failed to add customer:', error);
      throw error;
    }
  };

  const updateCustomer = async (id: string, updatedCustomer: Partial<Customer>) => {
    try {
      const result = await customerApi.update(id, updatedCustomer);
      setCustomers(customers.map(c => c.id === id ? result.customer : c));
    } catch (error) {
      console.error('Failed to update customer:', error);
      throw error;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      await customerApi.delete(id);
      setCustomers(customers.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete customer:', error);
      throw error;
    }
  };

  const addSale = async (sale: Omit<Sale, 'id' | 'date'>) => {
    try {
      const result = await salesApi.create(sale);
      // Refresh all data to get updated stock, customer balances, and ledger
      await refreshData();
    } catch (error) {
      console.error('Failed to add sale:', error);
      throw error;
    }
  };

  const addPayment = async (customerId: string, amount: number, description: string) => {
    try {
      await ledgerApi.paymentMethod(customerId, amount, description);
      // Refresh data to get updated customer balance and ledger
      await refreshData();
    } catch (error) {
      console.error('Failed to add payment:', error);
      throw error;
    }
  };

  const addLedgerEntry = async (entry: Omit<LedgerEntry, 'id' | 'date' | 'balance'>) => {
    try {
      const result = await ledgerApi.addEntry(entry);
      setLedgerEntries([result.entry, ...ledgerEntries]);
    } catch (error) {
      console.error('Failed to add ledger entry:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authApi.signout();
      onSignOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        shop,
        products,
        customers,
        sales,
        ledgerEntries,
        suppliers,
        purchases,
        loading,
        addProduct,
        updateProduct,
        deleteProduct,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addSale,
        addLedgerEntry,
        addPayment,
        addSupplier,  // Add this
    updateSupplier,  // Add this
    deleteSupplier,  // Add this
    addPurchase,  // Add this
    addSupplierPayment, 
        refreshData,
        signOut,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}