import { Hero } from "@/components/hero";
import { Stepper } from '@/components/stepper';
import { RequirementCard } from '@/components/requirement-card';
import { Card, CardContent } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';

export default function Home() {
  return (
    <div className="space-y-10">
      <Hero />

      <section>
        <h2 className="text-xl font-semibold mb-4">ขั้นตอนโดยสรุป</h2>
        <Stepper />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">ข้อกำหนดหลัก</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <RequirementCard title="Harness" desc="สิทธิ์เข้าใช้งาน + สร้าง Pipeline" />
          <RequirementCard title="Flyway CLI" desc="ติดตั้งเวอร์ชันล่าสุด + ใส่ไลเซนส์" />
          <RequirementCard title="ฐานข้อมูลทดสอบ" desc="PostgreSQL และ SQL Server (AdventureWorks)" />
        </div>
      </section>

      <Alert variant="info" title="เคล็ดลับ">
        ใช้ Markdown skeleton เติมเนื้อหาไปก่อน โครงเว็บไซต์พร้อมใช้งานทันที
      </Alert>

      <Card>
        <CardContent>
          <p className="text-sm text-gray-600">
            พร้อมเริ่มเลย? ไปที่หน้า <a className="underline" href="/process">ขั้นตอน</a> หรืออ่าน
            <a className="underline ml-1" href="/overview">ภาพรวมโครงการ</a> ก่อนก็ได้
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
