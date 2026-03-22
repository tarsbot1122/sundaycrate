'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Order } from '@/types';
import { formatPrice, timeAgo } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Download,
  ShoppingBag,
  Inbox,
  ArrowRight,
} from 'lucide-react';

type OrderWithProduct = Order & {
  product: { id: string; title: string; file_url: string; file_type: string; preview_images: string[] } | null;
  seller: { name: string } | null;
};

const ORDER_STATUS_BADGE: Record<
  string,
  { variant: 'default' | 'success' | 'warning' | 'danger'; label: string }
> = {
  pending: { variant: 'warning', label: 'Pending' },
  completed: { variant: 'success', label: 'Completed' },
  refunded: { variant: 'danger', label: 'Refunded' },
  failed: { variant: 'danger', label: 'Failed' },
};

export default function BuyerDashboardPage() {
  const [orders, setOrders] = useState<OrderWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadOrders() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        router.push('/login?redirect=/buyer');
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('orders')
          .select(
            `id, amount_cents, platform_fee_cents, status, created_at,
             product:products(id, title, file_url, file_type, preview_images),
             seller:users!orders_seller_id_fkey(name)`
          )
          .eq('buyer_id', authUser.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        setOrders((data ?? []) as unknown as OrderWithProduct[]);
      } catch (err: any) {
        setError(err.message ?? 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
            <div className="flex gap-4">
              <div className="h-20 w-28 bg-gray-200 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600 font-medium">Failed to load your purchases</p>
        <p className="text-sm text-red-400 mt-1">{error}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1e293b]">My Purchases</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your order history and downloads</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <Inbox className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-400">No purchases yet</p>
          <p className="text-xs text-gray-300 mt-1">
            Browse our marketplace to find therapy resources
          </p>
          <Link href="/browse">
            <Button variant="outline" size="sm" className="mt-4">
              <ShoppingBag className="h-4 w-4" />
              Browse Resources
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const badge = ORDER_STATUS_BADGE[order.status] ?? {
              variant: 'default' as const,
              label: order.status,
            };
            const isCompleted = order.status === 'completed';

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Preview */}
                  <div className="w-full sm:w-32 aspect-[4/3] sm:aspect-auto sm:h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {order.product?.preview_images?.[0] ? (
                      <img
                        src={order.product.preview_images[0]}
                        alt={order.product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ShoppingBag className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {order.product ? (
                          <Link
                            href={`/product/${order.product.id}`}
                            className="font-semibold text-[#1e293b] hover:text-[#d4a853] transition-colors"
                          >
                            {order.product.title}
                          </Link>
                        ) : (
                          <span className="font-semibold text-gray-400">Product unavailable</span>
                        )}
                        {order.seller && (
                          <p className="text-xs text-gray-500 mt-0.5">by {order.seller.name}</p>
                        )}
                      </div>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="font-medium text-[#1e293b]">
                          {formatPrice(order.amount_cents)}
                        </span>
                        <span>{timeAgo(order.created_at)}</span>
                        {order.product?.file_type && (
                          <span className="uppercase text-xs font-medium bg-gray-100 px-2 py-0.5 rounded">
                            {order.product.file_type}
                          </span>
                        )}
                      </div>

                      {isCompleted && order.product?.file_url && (
                        <a
                          href={order.product.file_url}
                          download
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e293b] hover:text-[#d4a853] transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </a>
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
