import { Separator } from "@/components/ui/separator";

interface Lesson {
  id: string;
  title: string;
  conceptMd: string;
  pseudocodeMd: string;
  cppCode: string;
  order: number;
}

interface LessonContentProps {
  lessons: Lesson[];
}

export function LessonContent({ lessons }: LessonContentProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="space-y-16">
        {lessons.map((lesson, index) => (
          <div key={lesson.id}>
            {index > 0 && <Separator className="mb-16" />}
            <h2 className="text-2xl font-semibold mb-8">{lesson.title}</h2>
            <div className="space-y-12">
              <section>
                <h3 className="text-xl font-semibold mb-4">Concept</h3>
                <div
                  className="prose prose-invert max-w-none text-base leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: lesson.conceptMd.replace(/\n\n/g, "</p><p>").replace(/^/, "<p>").replace(/$/, "</p>") }}
                />
              </section>
              <section>
                <h3 className="text-xl font-semibold mb-4">Pseudocode</h3>
                <pre className="bg-card rounded-lg p-4 overflow-x-auto">
                  <code className="text-sm font-mono leading-relaxed">
                    {lesson.pseudocodeMd}
                  </code>
                </pre>
              </section>
              <section>
                <h3 className="text-xl font-semibold mb-4">
                  C++ Implementation
                </h3>
                <pre className="bg-card rounded-lg p-4 overflow-x-auto">
                  <code className="text-sm font-mono leading-relaxed">
                    {lesson.cppCode}
                  </code>
                </pre>
              </section>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
