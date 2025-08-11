import { Card, CardContent } from '@/components/ui/card';

export function RequirementCard({ title, desc }: { title: string; desc: string }) {
  return (
    <Card>
      <CardContent>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-gray-600">{desc}</p>
      </CardContent>
    </Card>
  );
}
