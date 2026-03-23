import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllPosts, getPostBySlug } from '@/lib/blog';
import { CATEGORIES } from '@/lib/categories';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Tag,
  ArrowRight,
} from 'lucide-react';

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: 'Post Not Found — Shrinkwrap' };
  return {
    title: `${post.title} — Shrinkwrap Blog`,
    description: post.excerpt,
  };
}

function renderContent(content: string) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (const line of lines) {
    if (line.startsWith('## ')) {
      elements.push(
        <h2
          key={key++}
          className="text-2xl font-bold text-navy mt-10 mb-4"
        >
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith('**') && line.endsWith('**')) {
      elements.push(
        <p key={key++} className="font-semibold text-navy mt-4 mb-2">
          {line.slice(2, -2)}
        </p>
      );
    } else if (line.startsWith('- ')) {
      elements.push(
        <li
          key={key++}
          className="ml-6 text-gray-600 leading-relaxed list-disc"
        >
          {renderInline(line.slice(2))}
        </li>
      );
    } else if (line.trim() === '') {
      // skip empty lines, they separate paragraphs
    } else {
      elements.push(
        <p key={key++} className="text-gray-600 leading-relaxed mb-4">
          {renderInline(line)}
        </p>
      );
    }
  }

  return elements;
}

function renderInline(text: string): React.ReactNode {
  // Handle bold text within lines
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-navy">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const relatedCategories = CATEGORIES.filter((cat) =>
    post.relatedProductCategories.includes(cat.slug)
  );

  const allPosts = getAllPosts();
  const otherPosts = allPosts
    .filter((p) => p.slug !== post.slug)
    .slice(0, 2);

  return (
    <main className="min-h-screen bg-gradient-to-b from-cream via-white to-white">
      {/* Header */}
      <section className="relative pt-12 pb-16 lg:pt-16 lg:pb-24 overflow-hidden">
        <div className="absolute inset-0 hero-pattern opacity-30" />
        <div className="absolute top-10 right-20 w-72 h-72 bg-gold/8 rounded-full blur-3xl" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-gold transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          <div className="inline-block px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-medium mb-4">
            <Tag className="h-3 w-3 inline mr-1" />
            {post.category}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-navy mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-5 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {post.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {new Date(post.date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {post.readTimeMinutes} min read
            </span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-16 lg:pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <article className="prose-custom">{renderContent(post.content)}</article>

          {/* Related Products CTA */}
          {relatedCategories.length > 0 && (
            <div className="mt-16 p-8 bg-gradient-to-br from-cream to-white rounded-2xl border border-gray-100">
              <h3 className="text-xl font-bold text-navy mb-2">
                Related Resources on Shrinkwrap
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Browse professionally designed resources related to this article.
              </p>
              <div className="flex flex-wrap gap-3">
                {relatedCategories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/browse?category=${cat.slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-100 text-sm font-medium text-navy hover:border-gold hover:text-gold transition-all duration-200 card-hover"
                  >
                    {cat.name}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="section-divider my-16" />

          {/* More Posts */}
          {otherPosts.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-navy mb-6">
                More from the Blog
              </h3>
              <div className="grid sm:grid-cols-2 gap-6">
                {otherPosts.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/blog/${p.slug}`}
                    className="group p-5 rounded-2xl border border-gray-100 hover:border-gray-200 bg-white card-hover"
                  >
                    <span className="text-xs font-medium text-gold">
                      {p.category}
                    </span>
                    <h4 className="text-base font-bold text-navy mt-1 mb-2 group-hover:text-gold transition-colors duration-200 leading-snug">
                      {p.title}
                    </h4>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {p.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
