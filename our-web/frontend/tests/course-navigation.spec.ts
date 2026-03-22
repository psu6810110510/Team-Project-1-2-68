import { test, expect } from '@playwright/test';

test.describe('Authentication Flow E2E', () => {
  test('should redirect unauthenticated users from secure pages to login page', async ({ page }) => {
    // เปิดหน้า Home Page
    await page.goto('/');

    // คลิกปุ่ม เริ่มเรียนเลย
    const startLearningBtn = page.locator('button:has-text("เริ่มเรียนเลย")').first();
    await startLearningBtn.click();

    // ระบบจะตรวจสอบว่ายังไม่ได้ Login จึงต้องเด้งไปที่หน้า /login อัตโนมัติ
    await expect(page).toHaveURL(/.*\/login/);

    //  ตรวจสอบว่ามีช่องกรอกอีเมล
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();

    // ตรวจสอบว่ามีช่องกรอกรหัสผ่าน
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();

    // จำลองการพิมพ์ ใส่อีเมลและรหัสผ่าน
    await emailInput.fill('student@born2code.com');
    await passwordInput.fill('password123');

    //  ตรวจสอบปุ่ม เข้าสู่ระบบว่ามีอยู่ไหม
    const loginBtn = page.locator('button[type="submit"]');
    await expect(loginBtn).toBeVisible();

    // กดปุ่ม เข้าสู่ระบบ เพื่อทำการล็อกอิน ถ้าเราใส่อีเมลและรหัสผ่านถูก
    await loginBtn.click();

    // ตรวจสอบว่าระบบเปลี่ยนหน้ากลับไปยังหน้าแรก
    // หรือหน้าต่างคอร์สเรียนได้สำเร็จหลังจากการล็อกอิน
    await expect(page).not.toHaveURL(/.*\/login/); // หน้าต้องเปลี่ยนออกจาก /login

  });
});
