'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Order, SellerStats } from '@/types';
import { formatPrice, timeAgo } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Package,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Plus,
  ArrowRight,
  Inbox,
} from 'lucide-react';

type OrderWithProduct = Order & {
  product: { title: string } | null;
  buyer: { name: string; email: string } | null;
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

export default function SellerDashboardPage() {
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        router.push('/login?redirect=/seller');
        return;
      }

      try {
        // Fetch all in parallel
        const [productsRes, ordersRes] = await Promise.all([
          supabase
            .from('products')
            .select('id, status')
            .eq('seller_id', authUser.id),
          supabase
            .from('orders')
            .select(
              `id, amount_cents, platform_fee_cents, status, created_at,
               product:products(title),
               buyer:users!orders_buyer_id_fkey(name, email)`
            )
            .eq('seller_id', authUser.id)
            .order('created_at', { ascending: false })
            .limit(10),
        ]);

        if (productsRes.error) throw productsRes.error;
        if (ordersRes.error) throw ordersRes.error;

        const products = productsRes.data ?? [];
        const orders = (ordersRes.data ?? []) as unknown as OrderWithProduct[];

        const completedOrders = orders.filter((o) => o.status === 'completed');
        const totalEarnings = completedOrders.reduce(
          (sum, o) => sum + (o.amount_cents - o.platform_fee_cents),
          0
        );

        setStats({
          total_products: products.length,
          total_sales: completedOrders.length,
          total_earnings_cents: totalEarnings,
          total_orders: orders.length,
        });

        setRecentOrders(orders);
      } catch (err: any) {
        setError(err.message ?? 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
              <div className="h-7 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-1/4 mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded mb-2" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600 font-medium">Failed to load dashboard</p>
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

  const statCards = [
    {
      label: 'Total Products',
      value: stats?.total_products ?? 0,
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      format: (v: number) => v.toString(),
    },
    {
      label: 'Total Earnings',
      value: stats?.total_earnings_cents ?? 0,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50',
      format: (v: number) => formatPrice(v),
    },
    {
      label: 'Total Sales',
      value: stats?.total_sales ?? 0,
      icon: TrendingUp,
      color: 'text-gold',
      bg: 'bg-yellow-50',
      format: (v: number) => v.toString(),
    },
    {
      label: 'Total Orders',
      value: stats?.total_orders ?? 0,
      icon: ShoppingCart,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      format: (v: number) => v.toString(),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e293b]">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Overview of your seller account</p>
        </div>
        <Link href="/seller/products/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New Product
          </Button>
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg, format }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-500">{label}</p>
              <div className={`${bg} rounded-lg p-2`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#1e293b]">{format(value)}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#1e293b]">Recent Orders</h2>
          <Link
            href="/seller/orders"
            className="text-sm text-[#1e293b] font-medium hover:text-[#d4a853] transition-colors inline-flex items-center gap-1"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-16 text-center">
            <Inbox className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-400">No orders yet</p>
            <p className="text-xs text-gray-300 mt-1">
              Orders will appear here once customers purchase your products
            </p>
            <Link href="/seller/products/new">
              <Button variant="outline" size="sm" className="mt-4">
                <Plus className="h-4 w-4" />
                Add your first product
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Product
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Buyer
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Amount
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => {
                  const badge = ORDER_STATUS_BADGE[order.status] ?? {
                    variant: 'default' as const,
                    label: order.status,
                  };
                  const payout = order.amount_cents - order.platform_fee_cents;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-medium text-[#1e293b]">
                          {order.product?.title ?? '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">
                        {order.buyer?.name ?? order.buyer?.email ?? '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-[#1e293b]">
                          {formatPrice(payout)}
                        </span>
                        <span className="text-xs text-gray-400 ml-1">
                          (of {formatPrice(order.amount_cents)})
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 text-xs">
                        {timeAgo(order.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
