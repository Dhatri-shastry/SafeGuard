import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import mockFirebase from '../firebase/mockFirebase'; // ✅ make sure this path is correct

const AuthPages = ({ setCurrentUser, setCurrentPage }) => {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (mode === 'login') {
        const result = await mockFirebase.signIn(email, password);
        setCurrentUser(result.user);
        setCurrentPage('home');
      } else if (mode === 'signup') {
        const result = await mockFirebase.signUp(email, password);
        setCurrentUser(result.user);
        setCurrentPage('home');
      } else if (mode === 'forgot') {
        await mockFirebase.resetPassword(email);
        setError('Password reset email sent!');
        setMode('login');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await mockFirebase.signInWithGoogle();
      setCurrentUser(result.user);
      setCurrentPage('home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-purple-100 rounded-full mb-4">
            <Shield className="w-12 h-12 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">SafeGuard</h1>
          <p className="text-gray-600">Your Safety, Our Priority</p>
        </div>

        {error && (
          <div className={`mb-4 p-3 rounded-lg ${error.includes('sent') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>

          {mode !== 'forgot' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Sign Up' : 'Reset Password'}
          </button>
        </form>

        {mode !== 'forgot' && (
          <>
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-gray-500 text-sm">OR</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </>
        )}

        <div className="mt-6 text-center space-y-2">
          {mode === 'login' && (
            <>
              <button
                onClick={() => setMode('forgot')}
                className="text-purple-600 hover:underline text-sm"
              >
                Forgot Password?
              </button>
              <div className="text-gray-600 text-sm">
                Don't have an account?{' '}
                <button onClick={() => setMode('signup')} className="text-purple-600 hover:underline font-semibold">
                  Sign Up
                </button>
              </div>
            </>
          )}
          {mode === 'signup' && (
            <div className="text-gray-600 text-sm">
              Already have an account?{' '}
              <button onClick={() => setMode('login')} className="text-purple-600 hover:underline font-semibold">
                Sign In
              </button>
            </div>
          )}
          {mode === 'forgot' && (
            <button onClick={() => setMode('login')} className="text-purple-600 hover:underline text-sm">
              Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPages;
