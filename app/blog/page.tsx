import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';
import { BookOpen, Calendar, Clock, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Blog — Shrinkwrap',
  description:
    'Resources, insights, and guides for mental health professionals. Expert articles on CBT worksheets, DBT skills, therapy tools, and building a successful practice.',
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen bg-gradient-to-b from-cream via-white to-white">
      {/* Hero */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 hero-pattern opacity-40" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 text-gold text-sm font-medium mb-6">
            <BookOpen className="h-4 w-4" />
            Shrinkwrap Blog
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-navy mb-6">
            The Shrinkwrap{' '}
            <span className="gradient-text">Blog</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Resources, insights, and guides for mental health professionals
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group"
              >
                <article className="bg-white rounded-2xl border border-gray-100 overflow-hidden card-hover h-full flex flex-col">
                  {/* Thumbnail placeholder */}
                  <div className="relative h-48 bg-gradient-to-br from-gold/10 via-cream to-teal/10 flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-gold/40" />
                    <div className="absolute top-4 left-4">
                      <span className="inline-block px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm text-xs font-medium text-navy">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(post.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {post.readTimeMinutes} min read
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-navy mb-2 group-hover:text-gold transition-colors duration-200 leading-snug">
                      {post.title}
                    </h2>

                    <p className="text-sm text-gray-500 leading-relaxed flex-1">
                      {post.excerpt}
                    </p>

                    <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-gold group-hover:gap-2.5 transition-all duration-200">
                      Read more
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
