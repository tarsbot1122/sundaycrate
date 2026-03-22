'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { User } from '@/types';
import {
  Menu,
  X,
  ShoppingBag,
  LayoutDashboard,
  LogOut,
  ChevronDown,
} from 'lucide-react';

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();
        if (data) setUser(data as User);
      }
    }
    getUser();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
    router.refresh();
  }

  const dashboardLink = user?.role === 'seller' ? '/seller' : user?.role === 'admin' ? '/admin' : '/buyer';

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <ShoppingBag className="h-7 w-7 text-gold" />
            <span className="text-xl font-bold text-navy">SundayCrate</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/browse" className="text-sm font-medium text-gray-600 hover:text-navy transition-colors">
              Browse
            </Link>
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-navy transition-colors"
                >
                  {user.name || user.email}
                  <ChevronDown className="h-4 w-4" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg border border-gray-100 py-1">
                    <Link
                      href={dashboardLink}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setProfileOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Log In</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary" size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-3">
            <Link href="/browse" className="block text-sm font-medium text-gray-600 hover:text-navy">
              Browse
            </Link>
            {user ? (
              <>
                <Link href={dashboardLink} className="block text-sm font-medium text-gray-600 hover:text-navy">
                  Dashboard
                </Link>
                <button onClick={handleSignOut} className="block text-sm font-medium text-gray-600 hover:text-navy">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block text-sm font-medium text-gray-600 hover:text-navy">
                  Log In
                </Link>
                <Link href="/signup" className="block text-sm font-medium text-navy font-bold">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
