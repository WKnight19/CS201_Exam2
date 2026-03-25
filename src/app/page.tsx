import { requireAuth } from "@/actions/auth";
import { getTopics } from "@/lib/content/queries";
import { TopicCard } from "@/components/topics/TopicCard";

export default async function Home() {
  await requireAuth();
  const topics = await getTopics();

  return (
    <main className="px-6 lg:px-12 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">CS 201 — Exam 2 Topics</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Select a topic to start studying
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {topics.map((topic) => (
          <TopicCard
            key={topic.id}
            slug={topic.slug}
            title={topic.title}
            description={topic.description}
          />
        ))}
      </div>
    </main>
  );
}
