import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// --- Question type enum ---

export const questionTypeEnum = pgEnum("question_type", [
  "multiple_choice",
  "fill_blank",
  "trace_step",
  "debug_step",
  "short_answer",
]);

// --- Content tables (seeded, read-only after seed) ---

export const topics = pgTable("topics", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const lessons = pgTable("lessons", {
  id: uuid("id").primaryKey().defaultRandom(),
  topicId: uuid("topic_id").notNull().references(() => topics.id),
  title: text("title").notNull(),
  conceptMd: text("concept_md").notNull(),
  pseudocodeMd: text("pseudocode_md").notNull(),
  cppCode: text("cpp_code").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const questions = pgTable("questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  topicId: uuid("topic_id").notNull().references(() => topics.id),
  questionType: questionTypeEnum("question_type").notNull(),
  prompt: text("prompt").notNull(),
  content: jsonb("content").notNull(),
  explanation: text("explanation"),
  difficulty: integer("difficulty").default(2).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const flashcards = pgTable("flashcards", {
  id: uuid("id").primaryKey().defaultRandom(),
  topicId: uuid("topic_id").notNull().references(() => topics.id),
  front: text("front").notNull(),
  back: text("back").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- SR / Progress tables (empty in Phase 1; queried in Phase 3+) ---

export const userTopicCards = pgTable(
  "user_topic_cards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    topicId: uuid("topic_id").notNull().references(() => topics.id),
    stability: text("stability").default("0").notNull(),
    difficulty: text("difficulty").default("0").notNull(),
    elapsedDays: integer("elapsed_days").default(0).notNull(),
    scheduledDays: integer("scheduled_days").default(0).notNull(),
    reps: integer("reps").default(0).notNull(),
    lapses: integer("lapses").default(0).notNull(),
    state: integer("state").default(0).notNull(),
    due: timestamp("due", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique().on(t.userId, t.topicId)]
);

export const userQuestionCards = pgTable(
  "user_question_cards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    questionId: uuid("question_id").notNull().references(() => questions.id),
    stability: text("stability").default("0").notNull(),
    difficulty: text("difficulty").default("0").notNull(),
    elapsedDays: integer("elapsed_days").default(0).notNull(),
    scheduledDays: integer("scheduled_days").default(0).notNull(),
    reps: integer("reps").default(0).notNull(),
    lapses: integer("lapses").default(0).notNull(),
    state: integer("state").default(0).notNull(),
    due: timestamp("due", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique().on(t.userId, t.questionId)]
);

export const reviewHistory = pgTable(
  "review_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    questionId: uuid("question_id").notNull().references(() => questions.id),
    rating: integer("rating").notNull(),
    correct: boolean("correct").notNull(),
    answeredAt: timestamp("answered_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("review_history_user_idx").on(t.userId, t.answeredAt)]
);

// --- Relations ---

export const topicsRelations = relations(topics, ({ many }) => ({
  lessons: many(lessons),
  questions: many(questions),
  flashcards: many(flashcards),
}));

export const lessonsRelations = relations(lessons, ({ one }) => ({
  topic: one(topics, { fields: [lessons.topicId], references: [topics.id] }),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  topic: one(topics, { fields: [questions.topicId], references: [topics.id] }),
}));

export const flashcardsRelations = relations(flashcards, ({ one }) => ({
  topic: one(topics, { fields: [flashcards.topicId], references: [topics.id] }),
}));
