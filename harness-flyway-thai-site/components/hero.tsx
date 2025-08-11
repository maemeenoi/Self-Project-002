import { Button } from '@/components/ui/button';
import { Rocket } from 'lucide-react';

export function Hero() {
  return (
    <section className="rounded-2xl bg-gradient-to-br from-indigo-50 to-white p-8 border">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">โครงการประเมิน Harness (Liquibase) vs Redgate Flyway</h1>
          <p className="text-gray-700">ศูนย์รวมข้อมูลขั้นตอน เอกสาร และไฟล์ตัวอย่าง—เข้าใจง่าย ใช้งานได้จริง พร้อมนำไป deploy ได้ทันที</p>
          <div className="flex gap-3">
            <a href="/process"><Button><Rocket className="mr-2 h-4 w-4"/>เริ่มต้นทันที</Button></a>
            <a className="underline text-sm py-2" href="/overview">อ่านภาพรวม</a>
          </div>
        </div>
      </div>
    </section>
  );
}
