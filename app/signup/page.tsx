'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShoppingBag, Stethoscope, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function SignupPage() {
  const [step, setStep] = useState<'role' | 'details'>('role');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [practiceName, setPracticeName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role, practice_name: practiceName },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      await supabase.from('users').upsert({
        id: authData.user.id,
        email,
        name,
        role,
        practice_name: practiceName || null,
      });

      router.push(role === 'seller' ? '/seller' : '/buyer');
      router.refresh();
    }

    setLoading(false);
  }

  async function handleGoogleSignup() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?role=${role}`,
      },
    });
    if (error) setError(error.message);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream/30 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <ShoppingBag className="h-8 w-8 text-gold" />
            <span className="text-2xl font-bold text-navy">SundayCrate</span>
          </Link>
          <h1 className="text-2xl font-bold text-navy">Create your account</h1>
          <p className="text-gray-600 mt-1">Join the therapy resources marketplace</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {step === 'role' ? (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-4">I want to...</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setRole('buyer')}
                  className={cn(
                    'flex flex-col items-center gap-2 p-6 rounded-xl border-2 transition-all',
                    role === 'buyer'
                      ? 'border-navy bg-navy/5'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <Stethoscope className="h-8 w-8 text-navy" />
                  <span className="font-semibold text-navy">Buy Resources</span>
                  <span className="text-xs text-gray-500 text-center">Find resources for my practice</span>
                </button>
                <button
                  onClick={() => setRole('seller')}
                  className={cn(
                    'flex flex-col items-center gap-2 p-6 rounded-xl border-2 transition-all',
                    role === 'seller'
                      ? 'border-navy bg-navy/5'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <Palette className="h-8 w-8 text-gold" />
                  <span className="font-semibold text-navy">Sell Resources</span>
                  <span className="text-xs text-gray-500 text-center">Share & sell my creations</span>
                </button>
              </div>
              <Button onClick={() => setStep('details')} className="w-full">
                Continue
              </Button>
            </div>
          ) : (
            <div>
              <button
                onClick={() => setStep('role')}
                className="text-sm text-gray-500 hover:text-navy mb-4 inline-block"
              >
                &larr; Back
              </button>

              <button
                onClick={handleGoogleSignup}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-6"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-3 text-gray-500">or</span>
                </div>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <Input
                  id="name"
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Smith"
                  required
                />
                <Input
                  id="email"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@practice.com"
                  required
                />
                <Input
                  id="password"
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  minLength={6}
                  required
                />
                <Input
                  id="practice"
                  label="Practice Name (optional)"
                  value={practiceName}
                  onChange={(e) => setPracticeName(e.target.value)}
                  placeholder="Mindful Therapy Associates"
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" loading={loading} className="w-full">
                  Create Account as {role === 'seller' ? 'Seller' : 'Buyer'}
                </Button>
              </form>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-navy font-semibold hover:text-gold transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
