import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import AnimateOnScroll from '@/components/animate-on-scroll'
import Link from 'next/link'

interface Post {
  slug: string
  title: string
  excerpt: string
  date: string
  author: string
}

const posts: Post[] = [
  {
    slug: 'unlocking-pdf-data-insights',
    title: 'Unlocking PDF Data Insights',
    excerpt:
      'Learn how to extract structured data from PDF files using DataAI’s intelligent parsing engine — turning static documents into actionable dashboards.',
    date: '2024-04-10',
    author: 'Sarah Chen',
  },
  {
    slug: 'real-time-analytics-with-ai',
    title: 'Real-time Analytics with AI',
    excerpt:
      'Discover how our AI-powered streaming pipeline enables live data exploration and anomaly detection, keeping your decisions current and confident.',
    date: '2024-04-05',
    author: 'James Okafor',
  },
  {
    slug: 'csv-analyzer-saves-hours',
    title: 'How Our CSV Analyzer Saves Hours',
    excerpt:
      'See practical examples of teams cutting data preparation time by 80% using automatic schema detection, column profiling, and one-click visualizations.',
    date: '2024-03-28',
    author: 'Maya Patel',
  },
]

export default function BlogPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <AnimateOnScroll>
        <section className="mb-16 text-center">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            DataAI Blog
          </h1>
          <p className="mt-4 text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto">
            Insights, tutorials, and best practices for turning your data into decisions with AI.
          </p>
        </section>
      </AnimateOnScroll>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <AnimateOnScroll key={post.slug}>
            <Card className="flex flex-col h-full border border-border/40 bg-card transition-colors duration-200 hover:border-border">
              <CardHeader>
                <CardTitle className="font-heading text-xl leading-snug">
                  {post.title}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground mt-1">
                  {new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                  {' · '}
                  {post.author}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-base text-foreground/80 leading-relaxed line-clamp-4">
                  {post.excerpt}
                </p>
              </CardContent>
              <CardFooter>
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label={`Read more about ${post.title}`}
                >
                  Read more
                  <svg
                    className="ml-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </CardFooter>
            </Card>
          </AnimateOnScroll>
        ))}
      </div>
    </main>
  )
}