import { getRequirements } from '@/lib/content';
import { markdownToHtml } from '@/lib/markdown';

export default async function Page() {
  const md = await getRequirements();
  const html = await markdownToHtml(md);
  return <article className="prose max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
}
