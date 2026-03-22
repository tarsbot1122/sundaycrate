import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Product, Category } from '@/types';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { CATEGORIES } from '@/lib/categories';
import Link from 'next/link';
import {
  ArrowRight,
  Brain,
  HeartHandshake,
  ClipboardList,
  Users,
  ShieldCheck,
  Eye,
  Shield,
  Briefcase,
  Palette,
  Layers,
  Activity,
  Frame,
  ShoppingBag,
  DollarSign,
  Heart,
  Upload,
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Brain: <Brain className="h-6 w-6" />,
  HeartHandshake: <HeartHandshake className="h-6 w-6" />,
  ClipboardList: <ClipboardList className="h-6 w-6" />,
  Users: <Users className="h-6 w-6" />,
  ShieldCheck: <ShieldCheck className="h-6 w-6" />,
  Eye: <Eye className="h-6 w-6" />,
  Shield: <Shield className="h-6 w-6" />,
  Briefcase: <Briefcase className="h-6 w-6" />,
  Palette: <Palette className="h-6 w-6" />,
  Layers: <Layers className="h-6 w-6" />,
  Activity: <Activity className="h-6 w-6" />,
  Frame: <Frame className="h-6 w-6" />,
};

export default async function HomePage() {
  const supabase = createServerSupabaseClient();

  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*, seller:users(*)')
    .eq('status', 'active')
    .order('download_count', { ascending: false })
    .limit(8);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-cream to-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-navy leading-tight mb-6">
            Therapy resources, created
            <br />
            <span className="text-gold">by your community</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
            A marketplace where therapists and counselors sell digital products — worksheets,
            templates, toolkits, and more — to mental health professionals everywhere.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/browse">
              <Button size="lg" variant="primary">
                Browse Resources
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline">
                Start Selling
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy mb-4">Browse by Category</h2>
            <p className="text-gray-600">Find exactly what your practice needs</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/browse?category=${cat.slug}`}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border border-gray-200 hover:border-gold hover:shadow-md transition-all text-center group"
              >
                <div className="text-gray-400 group-hover:text-gold transition-colors">
                  {iconMap[cat.icon] || <ShoppingBag className="h-6 w-6" />}
                </div>
                <span className="text-sm font-medium text-navy">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {(featuredProducts?.length ?? 0) > 0 && (
        <section className="py-16 lg:py-24 bg-cream/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-navy mb-2">Popular Resources</h2>
                <p className="text-gray-600">Top picks from our community of therapists</p>
              </div>
              <Link href="/browse" className="hidden sm:block">
                <Button variant="ghost">
                  View All <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(featuredProducts as Product[])?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA for Sellers */}
      <section className="py-16 lg:py-24 bg-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Turn your clinical expertise into
                <span className="text-gold"> passive income</span>
              </h2>
              <p className="text-gray-300 mb-8 text-lg">
                Join a growing community of therapists who share their resources
                and earn income doing what they love. You keep 85% of every sale.
              </p>
              <Link href="/signup">
                <Button variant="secondary" size="lg">
                  Start Selling Today
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/10 rounded-xl p-6 text-center">
                <Upload className="h-8 w-8 text-gold mx-auto mb-3" />
                <p className="font-semibold text-lg">Upload</p>
                <p className="text-sm text-gray-400">Share your worksheets & templates</p>
              </div>
              <div className="bg-white/10 rounded-xl p-6 text-center">
                <DollarSign className="h-8 w-8 text-gold mx-auto mb-3" />
                <p className="font-semibold text-lg">Earn</p>
                <p className="text-sm text-gray-400">Keep 85% of each sale</p>
              </div>
              <div className="bg-white/10 rounded-xl p-6 text-center">
                <Users className="h-8 w-8 text-gold mx-auto mb-3" />
                <p className="font-semibold text-lg">Connect</p>
                <p className="text-sm text-gray-400">Reach clinicians worldwide</p>
              </div>
              <div className="bg-white/10 rounded-xl p-6 text-center">
                <Heart className="h-8 w-8 text-gold mx-auto mb-3" />
                <p className="font-semibold text-lg">Impact</p>
                <p className="text-sm text-gray-400">Support mental health care everywhere</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
