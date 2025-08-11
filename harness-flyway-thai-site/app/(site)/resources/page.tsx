import { getResources } from '@/lib/content';

export default async function Page() {
  const resources = await getResources();
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">ทรัพยากรและไฟล์ดาวน์โหลด</h1>
      <ul className="divide-y rounded-md border">
        {resources.map((r) => (
          <li key={r.url} className="p-4">
            <p className="font-medium">{r.name}</p>
            <p className="text-sm text-gray-600">{r.description}</p>
            <a className="text-indigo-600 underline text-sm" href={r.url}>ดาวน์โหลด</a>
          </li>
        ))}
      </ul>
    </section>
  );
}
