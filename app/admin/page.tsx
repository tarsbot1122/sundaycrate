'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Product } from '@/types';
import { formatPrice, timeAgo } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ShieldCheck,
  ShoppingBag,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Inbox,
} from 'lucide-react';
import Link from 'next/link';

type ProductWithSeller = Product & {
  seller: { name: string; email: string } | null;
};

export default function AdminPage() {
  const [flaggedProducts, setFlaggedProducts] = useState<ProductWithSeller[]>([]);
  const [allProducts, setAllProducts] = useState<ProductWithSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'flagged' | 'all'>('flagged');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadAdmin() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        router.push('/login?redirect=/admin');
        return;
      }

      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', authUser.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        router.push('/');
        return;
      }

      const [flaggedRes, allRes] = await Promise.all([
        supabase
          .from('products')
          .select('*, seller:users(*)')
          .eq('status', 'flagged')
          .order('created_at', { ascending: false }),
        supabase
          .from('products')
          .select('*, seller:users(*)')
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

      setFlaggedProducts((flaggedRes.data ?? []) as ProductWithSeller[]);
      setAllProducts((allRes.data ?? []) as ProductWithSeller[]);
      setLoading(false);
    }

    loadAdmin();
  }, []);

  async function updateProductStatus(productId: string, status: 'active' | 'flagged' | 'draft') {
    await supabase.from('products').update({ status }).eq('id', productId);

    setFlaggedProducts((prev) =>
      status === 'flagged' ? prev : prev.filter((p) => p.id !== productId)
    );
    setAllProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, status } : p))
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <ShoppingBag className="h-10 w-10 text-gold animate-pulse" />
          <p className="text-sm text-gray-500">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const displayProducts = tab === 'flagged' ? flaggedProducts : allProducts;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <ShieldCheck className="h-7 w-7 text-navy" />
        <div>
          <h1 className="text-2xl font-bold text-[#1e293b]">Admin Moderation</h1>
          <p className="text-sm text-gray-500">Review and manage marketplace products</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('flagged')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'flagged'
              ? 'bg-navy text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <AlertTriangle className="h-4 w-4 inline mr-1.5" />
          Flagged ({flaggedProducts.length})
        </button>
        <button
          onClick={() => setTab('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'all'
              ? 'bg-navy text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All Products ({allProducts.length})
        </button>
      </div>

      {displayProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <Inbox className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-400">
            {tab === 'flagged' ? 'No flagged products' : 'No products yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayProducts.map((product) => {
            const statusBadge: Record<string, { variant: 'default' | 'success' | 'warning' | 'danger'; label: string }> = {
              active: { variant: 'success', label: 'Active' },
              draft: { variant: 'default', label: 'Draft' },
              flagged: { variant: 'danger', label: 'Flagged' },
            };
            const badge = statusBadge[product.status] ?? { variant: 'default' as const, label: product.status };

            return (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-28 aspect-[4/3] sm:aspect-auto sm:h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {product.preview_images?.[0] ? (
                      <img
                        src={product.preview_images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ShoppingBag className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div>
                        <h3 className="font-semibold text-[#1e293b]">{product.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          by {product.seller?.name ?? 'Unknown'} &middot; {product.category} &middot; {formatPrice(product.price_cents)} &middot; {timeAgo(product.created_at)}
                        </p>
                      </div>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{product.description}</p>

                    <div className="flex items-center gap-2">
                      <Link href={`/product/${product.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Button>
                      </Link>
                      {product.status !== 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateProductStatus(product.id, 'active')}
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Approve
                        </Button>
                      )}
                      {product.status !== 'flagged' && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => updateProductStatus(product.id, 'flagged')}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Flag
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
