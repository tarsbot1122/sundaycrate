import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <ShoppingBag className="h-7 w-7 text-gold" />
              <span className="text-xl font-bold">SundayCrate</span>
            </Link>
            <p className="text-gray-400 text-sm max-w-md">
              Therapy resources, created by your community. A marketplace where therapists and
              counselors sell digital products to mental health professionals everywhere.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Browse</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/browse?category=cbt-worksheets" className="hover:text-gold transition-colors">CBT Worksheets</Link></li>
              <li><Link href="/browse?category=dbt-worksheets" className="hover:text-gold transition-colors">DBT Worksheets</Link></li>
              <li><Link href="/browse?category=intake-assessment-forms" className="hover:text-gold transition-colors">Intake & Assessment</Link></li>
              <li><Link href="/browse?category=anxiety-stress-management" className="hover:text-gold transition-colors">Anxiety & Stress</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/browse" className="hover:text-gold transition-colors">All Products</Link></li>
              <li><Link href="/signup" className="hover:text-gold transition-colors">Become a Seller</Link></li>
              <li><Link href="/login" className="hover:text-gold transition-colors">Sign In</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} SundayCrate. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
