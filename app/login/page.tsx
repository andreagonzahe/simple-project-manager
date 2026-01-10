'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock } from 'lucide-react';

function LoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Redirect to the page they were trying to access
        router.push(from);
        router.refresh();
      } else {
        setError('Invalid password. Please try again.');
        setPassword('');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--color-bg)' }}>
      {/* Background gradient effect */}
      <div 
        className="fixed inset-0 opacity-30"
        style={{
          background: 'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)',
        }}
      />

      <div className="relative w-full max-w-md">
        <div className="glass p-12 rounded-3xl" style={{ 
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(32px)',
          border: '1.5px solid rgba(255, 255, 255, 0.08)',
        }}>
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div 
              className="w-20 h-20 rounded-3xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
                border: '1.5px solid rgba(139, 92, 246, 0.3)',
                boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)',
              }}
            >
              <Lock size={36} style={{ color: 'var(--color-text-primary)' }} strokeWidth={2.5} />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-center mb-3" style={{ color: 'var(--color-text-primary)' }}>
            Andrea's Project Manager
          </h1>
          <p className="text-center text-lg mb-10" style={{ color: 'var(--color-text-tertiary)' }}>
            Enter password to continue
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-6 py-4 rounded-2xl text-lg font-light outline-none transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1.5px solid rgba(255, 255, 255, 0.1)',
                  color: 'var(--color-text-primary)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                  e.target.style.boxShadow = '0 0 0 4px rgba(139, 92, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.boxShadow = 'none';
                }}
                disabled={loading}
                autoFocus
                required
              />
            </div>

            {error && (
              <div 
                className="px-6 py-4 rounded-2xl text-sm"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1.5px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 rounded-2xl font-semibold text-lg transition-all"
              style={{
                background: loading 
                  ? 'rgba(139, 92, 246, 0.3)' 
                  : 'linear-gradient(135deg, rgba(139, 92, 246, 0.8), rgba(236, 72, 153, 0.8))',
                border: '1.5px solid rgba(139, 92, 246, 0.4)',
                color: 'var(--color-text-primary)',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(139, 92, 246, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {loading ? 'Verifying...' : 'Unlock'}
            </button>
          </form>
        </div>

        {/* Footer hint */}
        <p className="text-center mt-8 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
          Protected by password authentication
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
