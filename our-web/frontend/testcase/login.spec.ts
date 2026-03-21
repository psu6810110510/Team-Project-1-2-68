import { test, expect } from '@playwright/test';

test('ทดสอบระบบ Login', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.getByPlaceholder('อีเมล').fill('admin@born2code.com');
    await page.getByPlaceholder('รหัสผ่าน').fill('password123');
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();
    await expect(page).toHaveURL(/.*dashboard/);
});