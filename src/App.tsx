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
import { AppProvider, useApp } from './components/AppContext';
import { authApi, setAccessToken } from './utils/api';
import { getSupabaseClient } from './utils/supabase/client';
import { LogOut, Shield, Users as UsersIcon, Store } from 'lucide-react';

type View = 'dashboard' | 'pos' | 'inventory' | 'ledger' | 'sales' | 'customers' | 'admin' | 'users';

interface MainAppProps {
  handleSignOut: () => void;
}

function MainApp({ handleSignOut }: MainAppProps) {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  
  const handleNavigate = (view: string) => {
    setCurrentView(view as View);
  };
  const { shop } = useApp();


  const isSuperAdmin = shop?.role === 'super_admin';
  const isAdmin = shop?.role === 'admin';
  const isManager = shop?.role === 'manager';
  const isSalesman = shop?.role === 'salesman';

  // Super admin should only see admin panel
  const menuItems = isSuperAdmin ? [
    { id: 'admin', label: 'Shop Management', icon: <Shield size={20} />, show: true },
  ] : [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', show: true },
    { id: 'pos', label: 'POS', icon: '🛒', show: true },
    { id: 'inventory', label: 'Inventory', icon: '📦', show: isAdmin || isManager },
    { id: 'ledger', label: 'Ledger', icon: '💰', show: isAdmin || isManager },
    { id: 'sales', label: 'Sales', icon: '📜', show: true },
    { id: 'customers', label: 'Customers', icon: '👥', show: true },
    { id: 'users', label: 'Team', icon: <UsersIcon size={20} />, show: isAdmin },
  ];

  // Auto-redirect super admin to admin panel
  useEffect(() => {
    if (isSuperAdmin && currentView !== 'admin') {
      setCurrentView('admin');
    }
  }, [isSuperAdmin, currentView]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <Store className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  {isSuperAdmin ? 'Fertilizer POS - SaaS Platform' : (shop?.shopName || 'Fertilizer POS')}
                </h1>
                <p className="text-xs text-gray-500">
                  {isSuperAdmin && <span className="text-purple-600 font-medium">Platform Admin</span>}
                  {isAdmin && !isSuperAdmin && <span className="text-blue-600 font-medium">Shop Owner</span>}
                  {isManager && <span className="text-green-600 font-medium">Manager</span>}
                  {isSalesman && <span className="text-yellow-600 font-medium">Salesman</span>}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-x-auto">
          <div className="flex gap-2 p-2">
            {menuItems.filter(item => item.show).map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as View)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                  currentView === item.id
                    ? 'bg-green-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {typeof item.icon === 'string' ? (
                  <span className="text-lg">{item.icon}</span>
                ) : (
                  item.icon
                )}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* View Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {currentView === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
          {currentView === 'pos' && <POSInterface />}
          {currentView === 'inventory' && <InventoryManagement />}
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

  useEffect(() => {
    checkSession();
    
    // Listen for auth state changes
    const supabase = getSupabaseClient();
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, supabaseSession) => {
      console.log('Auth state changed:', event, supabaseSession);
      
      if (event === 'SIGNED_IN' && supabaseSession) {
        // Get shop data
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
        console.log('Token refreshed successfully');
        setAccessToken(supabaseSession.access_token);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      console.log('Checking session...');
      const supabase = getSupabaseClient();
      const { data: { session: supabaseSession } } = await supabase.auth.getSession();
      
      if (supabaseSession) {
        console.log('Supabase session found:', supabaseSession.user.email);
        setAccessToken(supabaseSession.access_token);
        
        // Get shop data from backend
        const result = await authApi.getSession();
        console.log('Session result:', result);
        
        if (result.shop) {
          setSession(result);
          setIsAuthenticated(true);
          console.log('Session authenticated successfully', result.shop);
        } else {
          console.log('Session exists but no shop data');
        }
      } else {
        console.log('No Supabase session found');
      }
    } catch (error) {
      console.error('Session check failed:', error);
      // Clear invalid session
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = (sessionData: any) => {
  console.log('🔐 handleAuthSuccess called with:', sessionData);
  
  if (!sessionData.shop) {
    // User authenticated but no shop (pending approval)
    alert('Your account is pending admin approval. Please wait for approval.');
    return;
  }
  
  // CRITICAL: Store the access token!
  if (sessionData.accessToken) {
    console.log('✅ Setting access token');
    setAccessToken(sessionData.accessToken);
  } else {
    console.error('❌ No accessToken in session data!');
  }
  
  setSession(sessionData);
  setIsAuthenticated(true);
  console.log('✅ Authentication successful');
};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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