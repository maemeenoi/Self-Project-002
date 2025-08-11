import { getTimeline } from '@/lib/content';
import { Timeline as TL } from '@/components/timeline';

export default async function Page() {
  const data = await getTimeline();
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">ไทม์ไลน์/แผนงาน</h1>
      <TL items={data} />
    </section>
  );
}
