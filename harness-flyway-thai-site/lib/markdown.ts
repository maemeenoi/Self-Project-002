import { remark } from 'remark';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

export async function markdownToHtml(md: string) {
  const file = await remark().use(remarkParse).use(remarkRehype).use(rehypeStringify).process(md);
  return String(file);
}
