export const dynamic = "force-dynamic";
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Product } from '@/types';
import { formatPrice, getInitials, timeAgo } from '@/lib/utils';
import { ProductCard } from '@/components/product-card';
import { notFound } from 'next/navigation';
import { Download, ShoppingCart, User as UserIcon } from 'lucide-react';
import { PurchaseButton } from './purchase-button';

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();

  const { data: product } = await supabase
    .from('products')
    .select('*, seller:users(*)')
    .eq('id', params.id)
    .eq('status', 'active')
    .single();

  if (!product) return notFound();

  const p = product as Product;

  // Related products
  const { data: related } = await supabase
    .from('products')
    .select('*, seller:users(*)')
    .eq('category', p.category)
    .eq('status', 'active')
    .neq('id', p.id)
    .limit(4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="grid lg:grid-cols-2 gap-10 mb-16">
        {/* Preview Images */}
        <div>
          <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 mb-4">
            {p.preview_images?.[0] ? (
              <img
                src={p.preview_images[0]}
                alt={p.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <ShoppingCart className="h-16 w-16" />
              </div>
            )}
          </div>
          {p.preview_images && p.preview_images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {p.preview_images.slice(1).map((img, i) => (
                <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <p className="text-sm font-medium text-gold uppercase tracking-wide mb-2">
            {p.category}
          </p>
          <h1 className="text-3xl lg:text-4xl font-bold text-navy mb-4">{p.title}</h1>

          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
            <span className="text-3xl font-bold text-navy">{formatPrice(p.price_cents)}</span>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Download className="h-4 w-4" />
              {p.download_count} downloads
            </div>
          </div>

          <div className="prose prose-gray max-w-none mb-8">
            <p className="text-gray-600 whitespace-pre-wrap">{p.description}</p>
          </div>

          <div className="mb-8">
            <p className="text-sm text-gray-500 mb-1">File type</p>
            <p className="font-medium text-navy">{p.file_type || 'Digital Download'}</p>
          </div>

          <PurchaseButton productId={p.id} priceFormatted={formatPrice(p.price_cents)} />

          {/* Seller Info */}
          {p.seller && (
            <div className="mt-8 p-4 rounded-xl bg-cream/50 border border-gray-100">
              <div className="flex items-center gap-3">
                {p.seller.avatar_url ? (
                  <img src={p.seller.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-navy/10 flex items-center justify-center text-sm font-medium text-navy">
                    {getInitials(p.seller.name || 'S')}
                  </div>
                )}
                <div>
                  <p className="font-medium text-navy">{p.seller.name}</p>
                  {p.seller.practice_name && (
                    <p className="text-sm text-gray-500">{p.seller.practice_name}</p>
                  )}
                </div>
              </div>
              {p.seller.bio && (
                <p className="text-sm text-gray-600 mt-3">{p.seller.bio}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {(related?.length ?? 0) > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-navy mb-6">Related Resources</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(related as Product[])?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
