import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { ImageIcon } from 'lucide-react';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/product/${product.id}`}
      className="group block rounded-xl border border-gray-200 bg-white overflow-hidden transition-all hover:shadow-lg hover:border-gold/50"
    >
      <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
        {product.preview_images?.[0] ? (
          <img
            src={product.preview_images[0]}
            alt={product.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ImageIcon className="h-12 w-12" />
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-gold font-medium uppercase tracking-wide mb-1">
          {product.category}
        </p>
        <h3 className="font-semibold text-navy line-clamp-2 mb-2 group-hover:text-gold transition-colors">
          {product.title}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-navy">{formatPrice(product.price_cents)}</span>
          {product.seller && (
            <span className="text-xs text-gray-500">{product.seller.practice_name || product.seller.name}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
