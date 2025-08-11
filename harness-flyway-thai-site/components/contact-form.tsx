'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function ContactForm() {
  const [state, setState] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    setState('loading');
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: fd.get('name'),
        email: fd.get('email'),
        message: fd.get('message'),
        honey: fd.get('website') // honeypot
      })
    });
    setState(res.ok ? 'ok' : 'err');
  }
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div>
        <label className="block text-sm mb-1" htmlFor="name">ชื่อ*</label>
        <Input id="name" name="name" required />
      </div>
      <div>
        <label className="block text-sm mb-1" htmlFor="email">อีเมล*</label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="hidden">
        <label>เว็บไซต์</label>
        <input name="website" autoComplete="off" />
      </div>
      <div>
        <label className="block text-sm mb-1" htmlFor="message">ข้อความ*</label>
        <textarea id="message" name="message" required className="w-full rounded-md border p-2 min-h-[120px]" />
      </div>
      <Button disabled={state==='loading'} type="submit">{state==='loading'?'กำลังส่ง…':'ส่งข้อความ'}</Button>
      {state==='ok' && <p className="text-sm text-green-700">ส่งสำเร็จ ขอบคุณสำหรับคำติชม</p>}
      {state==='err' && <p className="text-sm text-red-700">ส่งไม่สำเร็จ โปรดลองอีกครั้ง</p>}
    </form>
  );
}
