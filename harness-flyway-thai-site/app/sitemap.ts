import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://example.com';
  const routes = ['', '/overview', '/process', '/requirements', '/resources', '/faq', '/troubleshooting', '/timeline', '/contact'];
  return routes.map((p) => ({ url: base + p, lastModified: new Date() }));
}
