import { useState, useEffect } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { Dashboard } from './components/Dashboard';
import { POSInterface } from './components/POSInterface';
import { InventoryManagement } from './components/InventoryManagement';
import { LedgerManagement } from './components/LedgerManagement';
import { SalesHistory } from './components/SalesHistory';
import { CustomerManagement } from './components/CustomerManagement';
import { AdminPanel } from './components/AdminPanel';
import { UserManagement } from './components/UserManagement';
import { SupplierManagement } from './components/SupplierManagement';
import { PurchaseManagement } from './components/PurchaseManagement'; 
import { AppProvider, useApp } from './components/AppContext';
import { authApi, setAccessToken } from './utils/api';
import { getSupabaseClient } from './utils/supabase/client';
import { 
  LogOut, 
  Shield, 
  Users as UsersIcon, 
  Store, 
  Truck, 
  ShoppingBag, 
  ShoppingCart, 
  Package, 
  LayoutDashboard, 
  History, 
  BookOpen 
} from 'lucide-react';

// View type definition
type View = 'dashboard' | 'pos' | 'inventory' | 'ledger' | 'sales' | 'customers' | 'admin' | 'users' | 'suppliers' | 'purchases';

interface MainAppProps {
  handleSignOut: () => void;
}

/**
 * Main Application Layout
 * Handles Navigation and Role-based View Rendering
 */
function MainApp({ handleSignOut }: MainAppProps) {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const { shop } = useApp();

  const handleNavigate = (view: string) => {
    setCurrentView(view as View);
  };

  const isSuperAdmin = shop?.role === 'super_admin';
  const isAdmin = shop?.role === 'admin';
  const isManager = shop?.role === 'manager';
  const isSalesman = shop?.role === 'salesman';

  // Navigation Menu Configuration - Refined for compact look
  const menuItems = isSuperAdmin ? [
    { id: 'admin', label: 'Platform Management', icon: <Shield size={18} />, show: true },
  ] : [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, show: true },
    { id: 'pos', label: 'POS (Sales)', icon: <ShoppingCart size={18} />, show: true },
    { id: 'purchases', label: 'Add Stock', icon: <ShoppingBag size={18} />, show: isAdmin || isManager },
    { id: 'inventory', label: 'Inventory', icon: <Package size={18} />, show: isAdmin || isManager },
    { id: 'suppliers', label: 'Suppliers', icon: <Truck size={18} />, show: isAdmin || isManager },
    { id: 'ledger', label: 'Ledger', icon: <BookOpen size={18} />, show: isAdmin || isManager },
    { id: 'sales', label: 'Sales History', icon: <History size={18} />, show: true },
    { id: 'customers', label: 'Customers', icon: <UsersIcon size={18} />, show: true },
    { id: 'users', label: 'Team', icon: <UsersIcon size={18} />, show: isAdmin },
  ];

  useEffect(() => {
    if (isSuperAdmin && currentView !== 'admin') {
      setCurrentView('admin');
    }
  }, [isSuperAdmin, currentView]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Navigation Bar - Reduced Height */}
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-2.5">
              <div className="bg-green-600 p-1.5 rounded shadow-sm">
                <Store className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-base font-semibold text-gray-800 leading-tight">
                  {isSuperAdmin ? 'Platform Control' : (shop?.shopName || 'Fertilizer POS')}
                </h1>
                <p className="text-[10px] font-medium tracking-wide">
                  {isSuperAdmin && <span className="text-purple-600 uppercase">Super Admin</span>}
                  {isAdmin && !isSuperAdmin && <span className="text-blue-600 uppercase">Shop Owner</span>}
                  {isManager && <span className="text-green-600 uppercase">Manager</span>}
                  {isSalesman && <span className="text-yellow-600 uppercase">Salesman</span>}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded text-sm font-medium transition-all"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex-grow w-full">
        
        {/* Compact Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-4 overflow-x-auto border border-gray-200">
          <div className="flex gap-1 p-1 min-w-max">
            {menuItems.filter(item => item.show).map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as View)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                  currentView === item.id
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Component Rendering Container */}
        <div className="bg-white rounded-lg shadow-sm p-5 min-h-[550px] border border-gray-200">
          {currentView === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
          {currentView === 'pos' && <POSInterface />}
          {currentView === 'purchases' && <PurchaseManagement />}
          {currentView === 'inventory' && <InventoryManagement />}
          {currentView === 'suppliers' && <SupplierManagement />}
          {currentView === 'ledger' && <LedgerManagement />}
          {currentView === 'sales' && <SalesHistory />}
          {currentView === 'customers' && <CustomerManagement />}
          {currentView === 'users' && <UserManagement />}
          {currentView === 'admin' && <AdminPanel />}
        </div>
      </div>
    </div>
  );
}

/**
 * Entry Point Component
 * Handles Authentication, Session Management, and Context Providers
 */
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  const handleSignOut = async () => {
    try {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
      setSession(null);
      setIsAuthenticated(false);
      setAccessToken(null);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const checkSession = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data: { session: supabaseSession } } = await supabase.auth.getSession();
      
      if (supabaseSession) {
        setAccessToken(supabaseSession.access_token);
        const result = await authApi.getSession();
        if (result.shop) {
          setSession(result);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Session check failed:', error);
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
    
    const supabase = getSupabaseClient();
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, supabaseSession) => {
      if (event === 'SIGNED_IN' && supabaseSession) {
        const result = await authApi.getSession();
        if (result.shop) {
          setSession(result);
          setIsAuthenticated(true);
        }
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setIsAuthenticated(false);
        setAccessToken(null);
      } else if (event === 'TOKEN_REFRESHED' && supabaseSession) {
        setAccessToken(supabaseSession.access_token);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleAuthSuccess = (sessionData: any) => {
    if (!sessionData.shop) {
      alert('Your account is pending admin approval.');
      return;
    }
    if (sessionData.accessToken) {
      setAccessToken(sessionData.accessToken);
    }
    setSession(sessionData);
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-500 text-sm font-medium">Synchronizing session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <AppProvider initialShop={session.shop} onSignOut={handleSignOut}>
      <MainApp handleSignOut={handleSignOut} />
    </AppProvider>
  );
}