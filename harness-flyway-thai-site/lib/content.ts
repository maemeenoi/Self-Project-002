import fs from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';

const ROOT = process.cwd();

export async function getOverview() {
  return fs.readFile(path.join(ROOT, 'content/overview.md'), 'utf8');
}
export async function getRequirements() {
  return fs.readFile(path.join(ROOT, 'content/requirements.md'), 'utf8');
}
export async function getProcessSteps() {
  const dir = path.join(ROOT, 'content/process');
  const files = await fs.readdir(dir);
  const sorted = files.sort();
  const items = await Promise.all(sorted.map(async (f) => fs.readFile(path.join(dir, f), 'utf8')));
  // very small parser: first line is title, rest are bullet lines
  return items.map((md) => {
    const [first, ...rest] = md.split('\n');
    const title = first.replace(/^#\s*/, '').trim();
    const list = rest.filter((l) => l.trim().startsWith('- ')).map((l) => l.replace(/^\-\s*/, ''));
    return { title, items: list };
  });
}
export async function getResources() {
  const raw = await fs.readFile(path.join(ROOT, 'content/resources.json'), 'utf8');
  return JSON.parse(raw) as { name: string; description: string; url: string }[];
}
export async function getFAQ() {
  const raw = await fs.readFile(path.join(ROOT, 'content/faq.yml'), 'utf8');
  return (await import('yaml')).default.parse(raw) as { q: string; a: string }[];
}
export async function getTroubles() {
  const raw = await fs.readFile(path.join(ROOT, 'content/troubleshooting.yml'), 'utf8');
  return (await import('yaml')).default.parse(raw) as { symptom: string; cause: string; fix: string }[];
}
export async function getTimeline() {
  const raw = await fs.readFile(path.join(ROOT, 'content/timeline.yml'), 'utf8');
  return (await import('yaml')).default.parse(raw) as { task: string; owner: string; status: any; due?: string }[];
}
