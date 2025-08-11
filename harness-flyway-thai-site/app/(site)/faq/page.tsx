import { getFAQ } from '@/lib/content';
import { FAQAccordion } from '@/components/faq-accordion';

export const dynamic = 'force-static';

export default async function Page() {
  const faq = await getFAQ();
  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">คำถามพบบ่อย (FAQ)</h1>
      <FAQAccordion items={faq} />
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faq.map((q) => ({ '@type': 'Question', name: q.q, acceptedAnswer: { '@type': 'Answer', text: q.a } }))
          })
        }}
      />
    </section>
  );
}
