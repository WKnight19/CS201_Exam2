"use client";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { LessonContent } from "@/components/lessons/LessonContent";

interface Lesson {
  id: string;
  title: string;
  conceptMd: string;
  pseudocodeMd: string;
  cppCode: string;
  order: number;
}

interface Topic {
  id: string;
  slug: string;
  title: string;
  description: string;
}

interface TopicTabsProps {
  topic: Topic;
  lessons: Lesson[];
}

const DISABLED_TAB_CLASSES = "opacity-50 cursor-not-allowed";

export function TopicTabs({ topic: _topic, lessons }: TopicTabsProps) {
  return (
    <Tabs defaultValue="lesson">
      <TabsList className="mb-6">
        <TabsTrigger value="lesson">Lesson</TabsTrigger>
        <TabsTrigger
          value="visualizations"
          disabled
          className={DISABLED_TAB_CLASSES}
          title="Available in a future update"
        >
          Visualizations
        </TabsTrigger>
        <TabsTrigger
          value="quiz"
          disabled
          className={DISABLED_TAB_CLASSES}
          title="Available in a future update"
        >
          Quiz
        </TabsTrigger>
        <TabsTrigger
          value="flashcards"
          disabled
          className={DISABLED_TAB_CLASSES}
          title="Available in a future update"
        >
          Flashcards
        </TabsTrigger>
      </TabsList>
      <TabsContent value="lesson">
        <LessonContent lessons={lessons} />
      </TabsContent>
      <TabsContent value="visualizations">
        <div className="min-h-[400px] flex items-center justify-center text-muted-foreground">
          Available in a future update
        </div>
      </TabsContent>
      <TabsContent value="quiz">
        <div className="min-h-[400px] flex items-center justify-center text-muted-foreground">
          Available in a future update
        </div>
      </TabsContent>
      <TabsContent value="flashcards">
        <div className="min-h-[400px] flex items-center justify-center text-muted-foreground">
          Available in a future update
        </div>
      </TabsContent>
    </Tabs>
  );
}
