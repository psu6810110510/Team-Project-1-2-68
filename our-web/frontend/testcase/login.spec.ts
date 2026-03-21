import { test, expect } from '@playwright/test';

test('ทดสอบการล็อกอินแอดมินและลบนักเรียนออก', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.getByPlaceholder('อีเมล').fill('admin@born2code.com');
    await page.getByPlaceholder('รหัสผ่าน').fill('password123');
    await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();
    await expect(page).toHaveURL(/.*dashboard/);
    await page.getByText('จัดการผู้ใช้งาน').click();
    await page.getByText('นักเรียน', { exact: true }).click();
    await expect(page).toHaveURL(/.*admin-dashboard/);
    await expect(page.getByText('รายชื่อนักเรียนทั้งหมด')).toBeVisible();
    const studentRow = page.locator('tr').filter({ hasText: 'student@born2code.com' });
    page.on('dialog', dialog => dialog.accept());
    await studentRow.getByRole('button', { name: 'ลบ' }).click();
    await expect(page.getByText('student@born2code.com')).toBeHidden();
});