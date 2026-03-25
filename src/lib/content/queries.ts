import { db } from "@/lib/db";
import { topics, lessons } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function getTopics() {
  return db.query.topics.findMany({
    orderBy: [asc(topics.order)],
  });
}

export async function getTopicWithLessons(slug: string) {
  return db.query.topics.findFirst({
    where: eq(topics.slug, slug),
    with: {
      lessons: {
        orderBy: [asc(lessons.order)],
      },
    },
  });
}
