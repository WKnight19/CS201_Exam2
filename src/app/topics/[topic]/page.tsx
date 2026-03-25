import { requireAuth } from "@/actions/auth";
import { getTopicWithLessons } from "@/lib/content/queries";
import { notFound } from "next/navigation";
import { TopicTabs } from "@/components/topics/TopicTabs";
import { Badge } from "@/components/ui/badge";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic: slug } = await params;
  await requireAuth();

  const topic = await getTopicWithLessons(slug);
  if (!topic) notFound();

  return (
    <div className="px-6 lg:px-12 py-8">
      <div className="mb-6">
        <Badge variant="secondary" className="mb-2">
          {topic.title}
        </Badge>
        <h1 className="text-3xl font-semibold">{topic.title}</h1>
        <p className="text-muted-foreground mt-1">{topic.description}</p>
      </div>
      <TopicTabs topic={topic} lessons={topic.lessons} />
    </div>
  );
}
