# เว็บไซต์โครงการ Harness vs Flyway (ภาษาไทย)

เว็บไซต์นี้สร้างด้วย Next.js + Tailwind + TypeScript และโครงคอนเทนต์รูปแบบ Markdown/YAML/JSON

## คุณสมบัติ
- โฮม + หน้าย่อยครบตามสเปก (overview/process/requirements/resources/faq/troubleshooting/timeline/contact)
- Checklist กดติ๊กได้ (Client state)
- ฟอร์มติดต่อผ่าน API route + honeypot, รองรับ webhook
- SEO/OG + Sitemap + robots + FAQ Structured Data
- รองรับมือถือ, โฟกัส/คอนทราสต์ตาม WCAG AA
- พร้อม Deploy บน Vercel

## แก้ไขเนื้อหาอย่างไร?
- แก้ไฟล์ในโฟลเดอร์ `/content`:
  - Markdown: overview.md, requirements.md, process/*.md
  - JSON/YAML: resources.json, faq.yml, troubleshooting.yml, timeline.yml
- บันทึกแล้ว Deploy ใหม่ หรือใช้ ISR/SSG ตามกลยุทธ์ของทีม

## การ Deploy บน Vercel
1. สร้างโปรเจกต์ใหม่ใน Vercel และเชื่อม Git repo
2. ตั้งค่า Environment Variables ตาม `.env.example`
3. Deploy และตรวจ Lighthouse/Accessibility ให้ผ่านเป้า
