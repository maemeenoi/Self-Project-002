import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'โครงการ Harness vs Flyway | ศูนย์รวมข้อมูลและขั้นตอน',
  description: 'เว็บไซต์ภาษาไทยอธิบายโครงการประเมิน Harness (Liquibase) กับ Redgate Flyway แบบครบวงจร: ภาพรวม ขั้นตอน ข้อกำหนด ทรัพยากร FAQ ปัญหา ไทม์ไลน์ และติดต่อ',
  metadataBase: new URL('https://example.com'),
  openGraph: {
    title: 'โครงการ Harness vs Flyway',
    description: 'สรุปทั้งหมดของโครงการ ตั้งแต่ภาพรวมจนถึงส่งมอบ',
    url: 'https://example.com',
    siteName: 'Harness vs Flyway (TH)',
    images: [
      { url: '/og.png', width: 1200, height: 630, alt: 'Harness vs Flyway (TH)' }
    ],
    locale: 'th_TH',
    type: 'website'
  },
  twitter: { card: 'summary_large_image', title: 'โครงการ Harness vs Flyway', description: 'สรุปทั้งหมดของโครงการ', images: ['/og.png'] }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        <header className="border-b">
          <nav className="container flex items-center gap-6 py-4">
            <a className="font-semibold" href="/">Harness vs Flyway</a>
            <ul className="hidden md:flex gap-4 text-sm text-gray-600">
              <li><a href="/overview">ภาพรวม</a></li>
              <li><a href="/process">ขั้นตอน</a></li>
              <li><a href="/requirements">ข้อกำหนด</a></li>
              <li><a href="/resources">ทรัพยากร</a></li>
              <li><a href="/faq">FAQ</a></li>
              <li><a href="/troubleshooting">ปัญหา</a></li>
              <li><a href="/timeline">ไทม์ไลน์</a></li>
              <li><a href="/contact">ติดต่อ</a></li>
            </ul>
          </nav>
        </header>
        <main className="container py-8">{children}</main>
        <footer className="border-t mt-12">
          <div className="container py-6 text-sm text-gray-500">
            © {new Date().getFullYear()} Project Site · ทำด้วย Next.js + Tailwind
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
