import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface TopicCardProps {
  slug: string;
  title: string;
  description: string;
}

export function TopicCard({ slug, title, description }: TopicCardProps) {
  return (
    <Link href={`/topics/${slug}`} className="block">
      <Card className="p-8 hover:ring-2 hover:ring-primary transition-shadow cursor-pointer h-full">
        <CardHeader className="p-0 mb-4">
          <h2 className="text-2xl font-semibold">{title}</h2>
        </CardHeader>
        <CardContent className="p-0">
          <p className="text-base text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
