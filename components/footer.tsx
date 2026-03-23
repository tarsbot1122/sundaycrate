import { ShoppingBag, Heart } from 'lucide-react';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';

export function Footer() {
  const topCategories = CATEGORIES.slice(0, 6);

  return (
    <footer className="bg-navy text-white">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <ShoppingBag className="h-7 w-7 text-gold" />
              <span className="text-xl font-bold">Shrinkwrap</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-6">
              A curated marketplace where therapists share and discover digital resources.
              Built by clinicians, for clinicians.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">Categories</h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              {topCategories.map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/browse?category=${cat.slug}`} className="hover:text-gold transition-colors duration-200">
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/browse" className="text-gold hover:text-gold-300 transition-colors duration-200 font-medium">
                  View All
                </Link>
              </li>
            </ul>
          </div>

          {/* For Sellers */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">For Sellers</h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link href="/signup" className="hover:text-gold transition-colors duration-200">Start Selling</Link></li>
              <li><Link href="/seller" className="hover:text-gold transition-colors duration-200">Seller Dashboard</Link></li>
              <li><Link href="/seller/products/new" className="hover:text-gold transition-colors duration-200">Upload a Resource</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-300 mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link href="/browse" className="hover:text-gold transition-colors duration-200">All Resources</Link></li>
              <li><Link href="/login" className="hover:text-gold transition-colors duration-200">Sign In</Link></li>
              <li><Link href="/signup" className="hover:text-gold transition-colors duration-200">Create Account</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Shrinkwrap. All rights reserved.
          </p>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            Made with <Heart className="h-3.5 w-3.5 text-gold fill-gold" /> for therapists everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
