import { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import { ImageIcon, Download } from 'lucide-react';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const categorySlug = product.category?.toLowerCase().replace(/[&\s]+/g, '-').replace(/-+/g, '-');

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block rounded-2xl border border-gray-100 bg-white overflow-hidden card-hover"
    >
      {/* Image */}
      <div className="aspect-[4/3] bg-gradient-to-br from-cream to-gray-100 relative overflow-hidden">
        {product.preview_images?.[0] ? (
          <img
            src={product.preview_images[0]}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
            <ImageIcon className="h-10 w-10" />
            <span className="text-xs font-medium text-gray-400">Preview</span>
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-white/90 backdrop-blur-sm text-navy shadow-sm">
            {product.category}
          </span>
        </div>

        {/* Download count */}
        {product.download_count > 0 && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-navy/70 backdrop-blur-sm text-white">
              <Download className="h-3 w-3" />
              {product.download_count}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-navy text-sm leading-snug line-clamp-2 mb-2 group-hover:text-gold transition-colors duration-200">
          {product.title}
        </h3>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-lg font-bold text-navy">
            {formatPrice(product.price_cents)}
          </span>
          {product.seller && (
            <span className="text-xs text-gray-400 truncate ml-2 max-w-[120px]">
              {product.seller.practice_name || product.seller.name}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
