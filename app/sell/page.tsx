export const dynamic = "force-dynamic";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Upload,
  DollarSign,
  Users,
  BarChart3,
  Zap,
  Shield,
  Clock,
  FileText,
  Palette,
  ClipboardList,
  Briefcase,
  Frame,
  Sparkles,
  Store,
  CheckCircle,
  ChevronDown,
} from 'lucide-react';

export default function SellPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy via-navy-800 to-navy-900">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-teal/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-gold text-sm font-medium mb-8">
              <Store className="h-4 w-4" />
              SundayCrate Seller Program
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
              Turn Your Expertise Into
              <br />
              <span className="text-gold">Passive Income</span>
            </h1>

            <p className="text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              You&apos;ve already created incredible therapy resources. Now share them with thousands
              of clinicians and earn money while helping others grow their practice.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button variant="secondary" size="lg" className="shadow-lg text-base px-10">
                  Start Selling Today
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <a href="#how-it-works" className="text-gray-300 hover:text-white text-sm font-medium transition-colors flex items-center gap-1.5">
                See how it works <ChevronDown className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-navy mb-4 tracking-tight">How It Works</h2>
            <p className="text-gray-500 text-lg">Start earning in three simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                icon: <Users className="h-7 w-7" />,
                step: '01',
                title: 'Sign Up',
                description: 'Create your free seller account and connect your Stripe account to receive payments directly.',
              },
              {
                icon: <Upload className="h-7 w-7" />,
                step: '02',
                title: 'Upload Resources',
                description: 'Upload your therapy worksheets, templates, and toolkits. Set your own prices and write descriptions.',
              },
              {
                icon: <DollarSign className="h-7 w-7" />,
                step: '03',
                title: 'Earn Money',
                description: 'Every time a therapist purchases your resource, you get paid. It\'s that simple.',
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

      {/* Revenue Breakdown */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-cream-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-navy mb-4 tracking-tight">You Keep 85% of Every Sale</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              We believe creators deserve the lion&apos;s share. Our transparent pricing means more money in your pocket.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Visual breakdown */}
            <div className="bg-white rounded-2xl border border-gray-100 p-8 lg:p-10 shadow-soft">
              <div className="text-center mb-8">
                <p className="text-sm text-gray-500 mb-2">Example: You sell a resource for</p>
                <p className="text-5xl font-bold text-navy">$10.00</p>
              </div>

              {/* Bar visualization */}
              <div className="relative h-14 rounded-2xl overflow-hidden mb-6">
                <div className="absolute inset-y-0 left-0 w-[85%] bg-gradient-to-r from-gold to-gold-500 rounded-l-2xl flex items-center justify-center">
                  <span className="font-bold text-navy text-lg">$8.50 — You</span>
                </div>
                <div className="absolute inset-y-0 right-0 w-[15%] bg-navy flex items-center justify-center">
                  <span className="font-semibold text-white text-sm">$1.50</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-gold" />
                  <span className="font-medium text-navy">85% — Seller earnings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-navy" />
                  <span className="font-medium text-gray-500">15% — Platform fee</span>
                </div>
              </div>
            </div>

            {/* Additional context */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
                <p className="text-2xl font-bold text-navy mb-1">$0</p>
                <p className="text-sm text-gray-500">Upfront costs</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
                <p className="text-2xl font-bold text-navy mb-1">$0</p>
                <p className="text-sm text-gray-500">Monthly fees</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You Can Sell */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-navy mb-4 tracking-tight">What You Can Sell</h2>
            <p className="text-gray-500 text-lg">If you&apos;ve created it for your practice, other therapists need it too</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <FileText className="h-6 w-6 text-teal" />, title: 'Worksheets', description: 'CBT, DBT, anxiety, trauma — any therapeutic worksheets you use with clients.' },
              { icon: <ClipboardList className="h-6 w-6 text-teal" />, title: 'Intake & Assessment Forms', description: 'Client intake forms, consent forms, treatment plans, and progress notes.' },
              { icon: <Briefcase className="h-6 w-6 text-teal" />, title: 'Templates & Toolkits', description: 'Session planning templates, billing templates, and practice management tools.' },
              { icon: <Palette className="h-6 w-6 text-gold" />, title: 'Art Therapy Resources', description: 'Guided art prompts, emotion wheels, and expressive therapy worksheets.' },
              { icon: <Frame className="h-6 w-6 text-gold" />, title: 'Posters & Office Decor', description: 'Grounding techniques, coping skills posters, and waiting room decor.' },
              { icon: <Sparkles className="h-6 w-6 text-gold" />, title: 'And More', description: 'Group therapy activities, psychoeducation handouts, self-care plans — the possibilities are endless.' },
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

      <div className="section-divider" />

      {/* Benefits */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-white to-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-navy mb-4 tracking-tight">Why Sell on SundayCrate</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Everything you need to succeed as a seller</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Zap className="h-6 w-6 text-gold" />, title: 'Instant Payouts', description: 'Get paid directly to your bank account via Stripe. No waiting around.' },
              { icon: <Users className="h-6 w-6 text-gold" />, title: 'Growing Community', description: 'Reach thousands of therapists actively looking for quality resources.' },
              { icon: <Shield className="h-6 w-6 text-teal" />, title: 'No Upfront Costs', description: 'It\'s completely free to sign up and list your resources. We only earn when you do.' },
              { icon: <BarChart3 className="h-6 w-6 text-teal" />, title: 'Analytics Dashboard', description: 'Track your sales, views, and earnings with a detailed seller dashboard.' },
            ].map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-soft transition-all duration-300 text-center"
              >
                <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center mb-4 mx-auto">
                  {item.icon}
                </div>
                <h3 className="text-base font-bold text-navy mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-navy mb-4 tracking-tight">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {[
              {
                question: 'How much does it cost to become a seller?',
                answer: 'Nothing! Signing up and listing your resources is completely free. We only take a 15% platform fee when you make a sale.',
              },
              {
                question: 'How do I get paid?',
                answer: 'Payments are processed through Stripe. Once you connect your Stripe account, earnings are deposited directly into your bank account on a weekly basis.',
              },
              {
                question: 'What file formats can I upload?',
                answer: 'You can upload PDFs, Word documents, images, and other common file formats. We recommend PDF for worksheets and forms to ensure consistent formatting.',
              },
              {
                question: 'Can I set my own prices?',
                answer: 'Absolutely! You have full control over pricing your resources. We recommend researching similar products to find competitive price points.',
              },
              {
                question: 'How much of each sale do I keep?',
                answer: 'You keep 85% of every sale. The remaining 15% covers payment processing, hosting, and platform maintenance.',
              },
              {
                question: 'What types of resources sell best?',
                answer: 'CBT and DBT worksheets, intake forms, and anxiety management resources are consistently popular. But any quality therapy resource has an audience!',
              },
              {
                question: 'Do I retain ownership of my resources?',
                answer: 'Yes, 100%. You retain full ownership and copyright of everything you upload. You can remove your resources at any time.',
              },
            ].map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-gray-100 bg-white hover:border-gray-200 transition-all duration-200"
              >
                <summary className="flex items-center justify-between cursor-pointer p-6 text-left">
                  <span className="font-semibold text-navy pr-4">{faq.question}</span>
                  <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0 transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-6 -mt-2">
                  <p className="text-gray-500 leading-relaxed">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 lg:py-24 bg-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-800 to-navy-900" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal/5 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
            Ready to start
            <span className="text-gold"> earning?</span>
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Join our community of therapists who are already earning passive income
            by sharing the resources they&apos;ve created.
          </p>
          <Link href="/signup">
            <Button variant="secondary" size="lg" className="shadow-lg text-base px-10">
              Create Your Seller Account
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <p className="text-gray-400 text-sm mt-6">Free to sign up. No credit card required.</p>
        </div>
      </section>
    </div>
  );
}
