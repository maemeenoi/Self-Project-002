import { getTroubles } from '@/lib/content';

export default async function Page() {
  const rows = await getTroubles();
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">ปัญหาที่พบบ่อย & วิธีแก้</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">อาการ</th>
              <th className="p-2 text-left">สาเหตุที่เป็นไปได้</th>
              <th className="p-2 text-left">วิธีแก้</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t align-top">
                <td className="p-2 whitespace-pre-wrap">{r.symptom}</td>
                <td className="p-2 whitespace-pre-wrap">{r.cause}</td>
                <td className="p-2 whitespace-pre-wrap">{r.fix}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
