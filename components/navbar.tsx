'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
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
  Search,
  Store,
} from 'lucide-react';

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
    router.refresh();
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  }

  const dashboardLink = user?.role === 'seller' ? '/seller' : user?.role === 'admin' ? '/admin' : '/buyer';

  return (
    <nav className={`sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b transition-all duration-300 ${scrolled ? 'border-gray-200 nav-scrolled' : 'border-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <ShoppingBag className="h-7 w-7 text-gold transition-transform duration-300 group-hover:scale-110" />
            </div>
            <span className="text-xl font-bold text-navy">SundayCrate</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/browse"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-navy rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              Browse
            </Link>
            <Link
              href="/seller"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-navy rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center gap-1.5"
            >
              <Store className="h-4 w-4" />
              Sell
            </Link>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search resources..."
                    className="w-64 pl-4 pr-10 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
                    onBlur={() => {
                      if (!searchQuery) setSearchOpen(false);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                    className="absolute right-3 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-gray-500 hover:text-navy rounded-lg hover:bg-gray-50 transition-all duration-200"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-200" />

            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-navy rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-gold to-gold-600 flex items-center justify-center text-white text-xs font-bold">
                    {(user.name || user.email)[0].toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">{user.name || user.email}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white shadow-lift border border-gray-100 py-1.5 animate-fade-in">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-navy truncate">{user.name || user.email}</p>
                      <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                    </div>
                    <Link
                      href={dashboardLink}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4 text-gray-400" />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
                    >
                      <LogOut className="h-4 w-4 text-gray-400" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Log In</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary" size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-5 w-5 text-gray-600" /> : <Menu className="h-5 w-5 text-gray-600" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-1 animate-fade-in">
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="px-1 mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search resources..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
                />
              </div>
            </form>

            <Link
              href="/browse"
              className="block px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-navy hover:bg-gray-50 rounded-lg transition-all"
              onClick={() => setMenuOpen(false)}
            >
              Browse
            </Link>
            <Link
              href="/seller"
              className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-navy hover:bg-gray-50 rounded-lg transition-all"
              onClick={() => setMenuOpen(false)}
            >
              <Store className="h-4 w-4" />
              Sell
            </Link>

            <div className="my-2 border-t border-gray-100" />

            {user ? (
              <>
                <Link
                  href={dashboardLink}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-navy hover:bg-gray-50 rounded-lg transition-all"
                  onClick={() => setMenuOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-navy hover:bg-gray-50 rounded-lg transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-2 px-3 pt-2">
                <Link href="/login" className="flex-1" onClick={() => setMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">Log In</Button>
                </Link>
                <Link href="/signup" className="flex-1" onClick={() => setMenuOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
