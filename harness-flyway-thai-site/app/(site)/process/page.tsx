import { getProcessSteps } from '@/lib/content';
import { Checklist } from '@/components/checklist';

export default async function Page() {
  const steps = await getProcessSteps();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">ขั้นตอนการทำงาน (Step-by-Step)</h1>
      <Checklist steps={steps} />
    </div>
  );
}
