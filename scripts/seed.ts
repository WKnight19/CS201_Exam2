import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { topics, lessons } from "../src/lib/db/schema";

// --- Types for structured JSON files ---

interface LessonData {
  title: string;
  conceptMd: string;
  pseudocodeMd: string;
  cppCode: string;
  order: number;
}

interface TopicData {
  slug: string;
  title: string;
  description: string;
  order: number;
}

interface SeedFile {
  topic: TopicData;
  lessons: LessonData[];
}

// --- Setup ---

const __dirname = dirname(fileURLToPath(import.meta.url));

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable is not set.");
  console.error("Run with: pnpm db:seed (uses --env-file=.env.local)");
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const db = drizzle(sql);

// --- Load structured JSON seed files ---

const SEED_FILES = [
  "huffman.json",
  "n-ary-trees.json",
  "red-black-trees.json",
  "b-trees.json",
];

const structuredDir = join(__dirname, "output", "structured");

function loadSeedFile(filename: string): SeedFile {
  const filePath = join(structuredDir, filename);
  const raw = readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as SeedFile;
}

// --- Main seed function ---

async function seed() {
  console.log("Starting database seed...");

  // Clear existing content (delete in dependency order: lessons first, then topics)
  console.log("Clearing existing topics and lessons...");
  await db.delete(lessons);
  await db.delete(topics);

  let totalLessons = 0;
  const lessonCounts: Record<string, number> = {};

  for (const filename of SEED_FILES) {
    const data = loadSeedFile(filename);

    // Insert topic
    const [insertedTopic] = await db
      .insert(topics)
      .values({
        slug: data.topic.slug,
        title: data.topic.title,
        description: data.topic.description,
        order: data.topic.order,
      })
      .returning({ id: topics.id });

    if (!insertedTopic) {
      throw new Error(`Failed to insert topic: ${data.topic.slug}`);
    }

    const topicId = insertedTopic.id;

    // Insert lessons for this topic
    const lessonRows = data.lessons.map((lesson) => ({
      topicId,
      title: lesson.title,
      conceptMd: lesson.conceptMd,
      pseudocodeMd: lesson.pseudocodeMd,
      cppCode: lesson.cppCode,
      order: lesson.order,
    }));

    await db.insert(lessons).values(lessonRows);

    lessonCounts[data.topic.slug] = data.lessons.length;
    totalLessons += data.lessons.length;

    console.log(
      `  + ${data.topic.title}: ${data.lessons.length} lessons`
    );
  }

  console.log(`\nSeeded 4 topics`);
  console.log(
    `Seeded ${totalLessons} lessons (${Object.entries(lessonCounts)
      .map(([slug, count]) => `${count} for ${slug}`)
      .join(", ")})`
  );
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
