import { useState } from 'react';
import { authApi, adminApi } from '../utils/api';
import { getSupabaseClient } from '../utils/supabase/client';
import { Store, Mail, Lock, User, Phone, MapPin, AlertCircle, Clock, CheckCircle, Sparkles, Shield } from 'lucide-react';

interface AuthScreenProps {
  onAuthSuccess: (session: any) => void;
}

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [showPendingMessage, setShowPendingMessage] = useState(false);

  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  });

  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    shopName: '',
    ownerName: '',
    phone: '',
    address: '',
  });

const handleSignIn = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const result = await authApi.signin(signInData.email, signInData.password);
    
    console.log('✅ Sign in successful:', result);
    console.log('📦 Result structure:', {
      hasAccessToken: !!result.accessToken,
      hasUser: !!result.user,
      hasShop: !!result.shop
    });
    
    // Pass the complete result to parent
    onAuthSuccess(result);
  } catch (err: any) {
    console.error('❌ Sign in error:', err);
    setError(err.message || 'Failed to sign in');
    setLoading(false); // Only set loading false on error
  }
  // Don't set loading false here - let onAuthSuccess handle the UI transition
};
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (signUpData.password !== signUpData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (signUpData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const result = await authApi.signUp({
        email: signUpData.email,
        password: signUpData.password,
        shopName: signUpData.shopName,
        ownerName: signUpData.ownerName,
        phone: signUpData.phone,
        address: signUpData.address,
      });

      // Check if it requires approval or was auto-approved
      if (result.status === 'approved') {
        // Super admin - auto approved, show success and switch to sign in
        alert('Super Admin account created successfully! Please sign in.');
        setIsSignUp(false);
        setSignInData({ email: signUpData.email, password: '' });
      } else if (result.status === 'pending') {
        // Regular shop - pending approval
        setPendingUserId(result.userId);
        setShowPendingMessage(true);
        console.log('✅ Shop registration submitted successfully! Request ID:', result.userId);
        console.log('📝 Your request has been stored in the database and is awaiting super admin approval.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
            <Store className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Fertilizer Shop POS</h1>
          <p className="text-gray-600 mt-2">Multi-tenant SaaS Management System</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setIsSignUp(false);
                setError('');
              }}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                !isSignUp
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsSignUp(true);
                setError('');
              }}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                isSignUp
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {!isSignUp ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    required
                    value={signInData.email}
                    onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    required
                    value={signInData.password}
                    onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    required
                    value={signUpData.shopName}
                    onChange={(e) => setSignUpData({ ...signUpData, shopName: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Green Fields Fertilizers"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    required
                    value={signUpData.ownerName}
                    onChange={(e) => setSignUpData({ ...signUpData, ownerName: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    required
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    value={signUpData.phone}
                    onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="1234567890"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address (Optional)</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                  <textarea
                    value={signUpData.address}
                    onChange={(e) => setSignUpData({ ...signUpData, address: e.target.value })}
                    rows={2}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Shop address"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    required
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    required
                    value={signUpData.confirmPassword}
                    onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create Shop Account'}
              </button>
            </form>
          )}
        </div>

        {showPendingMessage && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-4">
            <div className="flex items-start gap-3">
              <Clock className="text-yellow-600 flex-shrink-0 mt-0.5" size={24} />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 mb-2">Registration Pending Approval</h3>
                <p className="text-sm text-yellow-800 mb-4">
                  Your account has been created successfully! Please complete the following steps:
                </p>
                <div className="bg-white rounded-lg p-4 mb-4">
                  <p className="font-medium text-gray-800 mb-2">📋 Next Steps:</p>
                  <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                    <li>Transfer the registration fee to the admin's bank account</li>
                    <li>Send payment proof to the admin</li>
                    <li>Wait for admin approval (usually within 24 hours)</li>
                    <li>You'll receive a notification once approved</li>
                  </ol>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                  <p className="text-sm font-medium text-green-900">💰 Payment Details:</p>
                  <p className="text-xs text-green-800 mt-1">
                    <div style={{ 
  backgroundColor: '#fff3cd', 
  padding: '15px', 
  borderRadius: '8px',
  border: '1px solid #ffc107',
  marginBottom: '15px'
}}>
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
    <span style={{ fontSize: '18px', marginRight: '8px' }}>💰</span>
    <strong>Payment Details:</strong>
  </div>
  
  <div style={{ marginBottom: '12px' }}>
    Contact admin for bank details: <strong>03424315253</strong>
  </div>
  
  <div style={{ 
    display: 'flex', 
    gap: '12px', 
    flexWrap: 'wrap',
    alignItems: 'center'
  }}>
    <a 
      href="https://wa.me/923424315253?text=Hi,%20I%20need%20bank%20details" 
      target="_blank" 
      rel="noopener noreferrer"
      style={{ 
        backgroundColor: '#25D366', 
        color: 'white', 
        padding: '10px 20px', 
        borderRadius: '6px', 
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '500',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        whiteSpace: 'nowrap',
        border: 'none',
        cursor: 'pointer'
      }}
    >
      💬 WhatsApp
    </a>
    
    <a 
      href="tel:+923424315253"
      style={{ 
        backgroundColor: '#007bff', 
        color: 'white', 
        padding: '10px 20px', 
        borderRadius: '6px', 
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '500',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        whiteSpace: 'nowrap',
        border: 'none',
        cursor: 'pointer'
      }}
    >
      📞 Call
    </a>
  </div>
</div>
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowPendingMessage(false);
                    setError('');
                  }}
                  className="text-sm text-green-600 hover:text-green-700 font-medium underline"
                >
                  Close and return to sign in
                </button>
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-sm text-gray-600">
          {!isSignUp ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            {!isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </p>

        
      </div>
    </div>
  );
}