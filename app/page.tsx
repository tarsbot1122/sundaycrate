export const dynamic = "force-dynamic";
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Product } from '@/types';
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
  Search,
  Download,
  CreditCard,
  Sparkles,
  Star,
  CheckCircle,
  Store,
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

  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const { count: sellerCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'seller');

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-cream via-white to-white hero-pattern">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 text-gold-700 text-sm font-medium mb-8">
              <Sparkles className="h-4 w-4" />
              Curated resources by therapists, for therapists
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-navy leading-[1.1] mb-6 tracking-tight">
              Find the perfect resources
              <br />
              <span className="gradient-text">for your practice</span>
            </h1>

            <p className="text-lg lg:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Browse worksheets, templates, and toolkits created by experienced clinicians.
              Everything you need to enhance your therapy practice.
            </p>

            {/* Search bar */}
            <form action="/browse" className="max-w-xl mx-auto mb-8">
              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-gold transition-colors" />
                <input
                  type="text"
                  name="q"
                  placeholder="Search CBT worksheets, intake forms, anxiety resources..."
                  className="w-full pl-14 pr-32 py-4 text-base rounded-2xl border-2 border-gray-200 bg-white shadow-soft focus:outline-none focus:border-gold focus:ring-4 focus:ring-gold/10 transition-all duration-300 placeholder:text-gray-400"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-navy hover:bg-navy-800 text-white text-sm font-medium rounded-xl transition-all duration-200 hover:shadow-md"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Quick links */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-gray-500">
              <span>Popular:</span>
              {['CBT Worksheets', 'Intake Forms', 'Anxiety Management', 'DBT'].map((term) => (
                <Link
                  key={term}
                  href={`/browse?q=${encodeURIComponent(term)}`}
                  className="px-3 py-1 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-navy transition-all duration-200"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gold/10 flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy">{productCount || 0}+</p>
                <p className="text-xs text-gray-500">Resources</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-teal/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-teal" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy">{sellerCount || 0}+</p>
                <p className="text-xs text-gray-500">Sellers</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-navy/5 flex items-center justify-center">
                <Star className="h-5 w-5 text-navy" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy">12</p>
                <p className="text-xs text-gray-500">Categories</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-navy mb-4 tracking-tight">Browse by Category</h2>
            <p className="text-gray-500 text-lg">Find exactly what your practice needs</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/browse?category=${cat.slug}`}
                className="group relative flex flex-col items-center gap-3 p-6 lg:p-7 rounded-2xl border border-gray-100 bg-white hover:bg-gradient-to-br hover:from-gold/5 hover:to-transparent hover:border-gold/30 transition-all duration-300 text-center card-hover"
              >
                <div className="h-12 w-12 rounded-xl bg-cream flex items-center justify-center text-gray-400 group-hover:text-gold group-hover:bg-gold/10 transition-all duration-300">
                  {iconMap[cat.icon] || <ShoppingBag className="h-6 w-6" />}
                </div>
                <span className="text-sm font-semibold text-navy">{cat.name}</span>
                <span className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{cat.description}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* Featured / New Products */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-cream-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/10 text-teal-700 text-xs font-semibold uppercase tracking-wider mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                Popular
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-navy tracking-tight">Top Resources</h2>
              <p className="text-gray-500 mt-2">The most downloaded resources from our community</p>
            </div>
            <Link href="/browse" className="hidden sm:block">
              <Button variant="ghost" className="group">
                View All
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {(featuredProducts?.length ?? 0) > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(featuredProducts as Product[])?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
                  <div className="aspect-[4/3] bg-gradient-to-br from-cream to-gray-50 flex items-center justify-center">
                    <ShoppingBag className="h-10 w-10 text-gray-200" />
                  </div>
                  <div className="p-4">
                    <div className="h-3 bg-gray-100 rounded-full w-1/3 mb-3" />
                    <div className="h-4 bg-gray-100 rounded-full w-3/4 mb-2" />
                    <div className="h-4 bg-gray-100 rounded-full w-1/4" />
                  </div>
                </div>
              ))}
              <div className="col-span-full text-center mt-4">
                <p className="text-gray-400">New resources are being added every day. Check back soon!</p>
              </div>
            </div>
          )}

          <div className="sm:hidden mt-8 text-center">
            <Link href="/browse">
              <Button variant="outline" className="w-full">
                View All Resources <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-navy mb-4 tracking-tight">How It Works</h2>
            <p className="text-gray-500 text-lg">Get the resources you need in three simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                icon: <Search className="h-7 w-7" />,
                step: '01',
                title: 'Browse & Discover',
                description: 'Explore our curated library of therapy resources across 12 specialized categories.',
              },
              {
                icon: <CreditCard className="h-7 w-7" />,
                step: '02',
                title: 'Purchase Securely',
                description: 'Buy with confidence using secure Stripe payments. Your transaction is fully protected.',
              },
              {
                icon: <Download className="h-7 w-7" />,
                step: '03',
                title: 'Download Instantly',
                description: 'Get immediate access to your resources. Download and start using them right away.',
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center group">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-gold/10 to-teal/10 text-navy mb-6 group-hover:shadow-glow transition-all duration-300">
                  {item.icon}
                </div>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-[80px] font-bold text-gray-50 leading-none select-none -z-10">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-navy mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed max-w-xs mx-auto">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* Trust / Social Proof */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-white to-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-navy mb-4 tracking-tight">Why Therapists Choose Shrinkwrap</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">A trusted platform built specifically for mental health professionals</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: <CheckCircle className="h-6 w-6 text-teal" />,
                title: 'Clinician-Created Content',
                description: 'Every resource is created by licensed therapists and counselors who understand clinical needs.',
              },
              {
                icon: <Shield className="h-6 w-6 text-teal" />,
                title: 'Secure & Private',
                description: 'Enterprise-grade security with Stripe payments. Your data and transactions are always protected.',
              },
              {
                icon: <Download className="h-6 w-6 text-teal" />,
                title: 'Instant Downloads',
                description: 'No waiting. Purchase and download resources immediately, ready to use in your next session.',
              },
              {
                icon: <Star className="h-6 w-6 text-gold" />,
                title: 'Quality Curated',
                description: 'Each resource goes through our review process to ensure clinical accuracy and usefulness.',
              },
              {
                icon: <Users className="h-6 w-6 text-gold" />,
                title: 'Community Driven',
                description: 'Join a growing community of therapists sharing knowledge and supporting each other.',
              },
              {
                icon: <Sparkles className="h-6 w-6 text-gold" />,
                title: 'Always Growing',
                description: 'New resources added regularly across all categories and therapeutic modalities.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-6 lg:p-8 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-soft transition-all duration-300"
              >
                <div className="h-11 w-11 rounded-xl bg-gray-50 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-navy mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seller CTA — compact */}
      <section className="py-20 lg:py-24 bg-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-800 to-navy-900" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal/5 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-gold text-sm font-medium mb-8">
            <Store className="h-4 w-4" />
            For Sellers
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
            Turn your expertise into
            <span className="text-gold"> passive income</span>
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Earn money sharing the resources you&apos;ve already created.
            Join a growing community of therapists turning their expertise into income.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button variant="secondary" size="lg" className="shadow-lg">
                Start Selling Today
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/sell" className="text-gray-300 hover:text-white text-sm font-medium transition-colors flex items-center gap-1.5">
              Learn more about selling <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Mini feature cards */}
          <div className="grid grid-cols-3 gap-4 mt-14 max-w-lg mx-auto">
            {[
              { label: 'Upload', sublabel: 'Your resources' },
              { label: 'Get Paid', sublabel: 'Weekly payouts' },
              { label: 'Grow', sublabel: 'Your audience' },
            ].map((item) => (
              <div key={item.label} className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                <p className="font-bold text-white text-lg">{item.label}</p>
                <p className="text-xs text-gray-400">{item.sublabel}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
