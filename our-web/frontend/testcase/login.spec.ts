import { test, expect } from '@playwright/test';

test('ทดสอบระบบ Login', async ({ page }) => {
    // 1. เปิดหน้าเว็บ (แก้ URL นี้ให้เป็นหน้า Frontend ของคุณที่เปิดหน้าจอ Login ขึ้นมา เช่น http://localhost:5173/login)
    await page.goto('http://localhost:5173/login');

    // 2. กรอกอีเมล (จุดที่ต้องแก้: เปลี่ยนคำว่า 'อีเมล' ให้ตรงกับ placeholder ของช่องกรอกในเว็บคุณ)
    await page.getByPlaceholder('อีเมล').fill('admin@born2code.com');

    // 3. กรอกรหัสผ่าน (เปลี่ยน 'รหัสผ่าน' ให้ตรงกับ placeholder ในเว็บ)
    await page.getByPlaceholder('รหัสผ่าน').fill('password123');

    // วางโค้ดนี้ "ก่อน" บรรทัดที่สั่งคลิกปุ่มเข้าสู่ระบบ
    page.once('dialog', dialog => dialog.accept());

    // 4. กดปุ่ม Login (เปลี่ยน 'เข้าสู่ระบบ' ให้ตรงกับข้อความบนปุ่ม)
    await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();

    // 5. รอเช็คผลลัพธ์ว่า URL เปลี่ยนไปหน้าแรก (Home/Dashboard)
    await expect(page).toHaveURL(/.*dashboard/);
});