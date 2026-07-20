import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blog | DataViz",
  description: "Insights, updates, and stories from the DataViz team.",
}

// ---------------------------------------------------------------------------
// Mock data – replace with real content source when ready
// ---------------------------------------------------------------------------
interface BlogPost {
  id: string
  title: string
  excerpt: string
  date: string // ISO string
}

const posts: BlogPost[] = [
  {
    id: "1",
    title: "Why Modern Data Teams Choose AI-Native Analytics",
    excerpt:
      "Learn how conversational interfaces are transforming the way analysts explore and share data, reducing time to insight from hours to seconds.",
    date: "2025-04-01T10:00:00.000Z",
  },
  {
    id: "2",
    title: "Building Trust in Machine-Learning Insights",
    excerpt:
      "Transparency and explainability are key when AI helps drive business decisions. Here’s how we make sure every chart and recommendation is auditable.",
    date: "2025-03-24T14:30:00.000Z",
  },
  {
    id: "3",
    title: "From CSV to Dashboard in Under Five Minutes",
    excerpt:
      "A step-by-step walkthrough of uploading raw data, asking natural‑language questions, and exporting a polished PDF report – no training required.",
    date: "2025-03-15T08:00:00.000Z",
  },
  {
    id: "4",
    title: "Introducing Pro Plan: Unlimited Everything",
    excerpt:
      "We listened to power users. Now you can upload as many CSVs as you need, send unlimited AI queries, and export professional reports without limits.",
    date: "2025-03-01T09:00:00.000Z",
  },
  {
    id: "5",
    title: "How We Built a Streaming Query Engine in Rust",
    excerpt:
      "A peek under the hood at the real‑time architecture that powers our natural‑language‑to‑SQL pipeline and the trade‑offs we made along the way.",
    date: "2025-02-20T11:00:00.000Z",
  },
  {
    id: "6",
    title: "Data Visualization Best Practices for Busy Executives",
    excerpt:
      "Clear charts, consistent palettes, and a hierarchy that tells a story – practical tips for dashboards that actually get used in the boardroom.",
    date: "2025-02-10T16:00:00.000Z",
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default function BlogPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Header */}
      <section className="mb-12">
        <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Blog
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Insights, updates, and stories from the DataViz team – from technical
          deep dives to practical tips for getting the most out of your data.
        </p>
      </section>

      {/* Grid */}
      <section>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post: BlogPost) => (
            <article
              key={post.id}
              className="group flex flex-col rounded-lg border border-border bg-card p-6 shadow-sm transition-colors hover:bg-accent/5"
            >
              <h2 className="font-heading text-lg font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                {post.title}
              </h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                {post.excerpt}
              </p>
              <time
                dateTime={post.date}
                className="mt-4 block text-xs text-muted-foreground"
              >
                {formatDate(post.date)}
              </time>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}