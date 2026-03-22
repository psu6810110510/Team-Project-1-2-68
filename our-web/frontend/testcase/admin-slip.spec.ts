import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@born2code.com';
const ADMIN_PASSWORD = 'password123';

async function loginAsAdmin(page: any) {
    await page.goto('http://localhost:5173/login');
    await page.getByPlaceholder('อีเมล').fill(ADMIN_EMAIL);
    await page.getByPlaceholder('รหัสผ่าน').fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
}

// TEST 1: แอดมินล็อกอินและเข้าสู่หน้าตรวจสอบสลิป 
test('ทดสอบแอดมินล็อกอินและเข้าสู่หน้าการเงินและคำสั่งซื้อ', async ({ page }) => {
    await loginAsAdmin(page);

    await page.getByText('การเงินและคำสั่งซื้อ').click();
    await expect(page).toHaveURL(/.*admin-dashboard/);

    await expect(page.getByText('สลิปโอนเงิน')).toBeVisible();
    await expect(page.getByText('สถานะ')).toBeVisible();
    await expect(page.getByText('การจัดการ')).toBeVisible();
});

// TEST 2: แอดมินยืนยันสลิปการโอนเงิน
test('ทดสอบแอดมินยืนยันสลิปการโอนเงิน', async ({ page }) => {
    await loginAsAdmin(page);

    await page.getByText('การเงินและคำสั่งซื้อ').click();
    await expect(page.getByText('สลิปโอนเงิน')).toBeVisible();

    const pendingRows = page.locator('tr').filter({ hasText: 'รอตรวจสอบ' });
    const count = await pendingRows.count();

    if (count === 0) {
        await expect(page.getByText('สลิปโอนเงิน')).toBeVisible();
        return;
    }

    const pendingRow = pendingRows.first();
    await pendingRow.getByRole('button', { name: /ยืนยัน/ }).click();

    await expect(page.getByText('ชำระแล้ว').first()).toBeVisible({ timeout: 8000 });
});

// TEST 3: แอดมินปฏิเสธสลิปการโอนเงินพร้อมระบุเหตุผล
test('ทดสอบแอดมินปฏิเสธสลิปการโอนเงินพร้อมระบุเหตุผล', async ({ page }) => {
    await loginAsAdmin(page);

    await page.getByText('การเงินและคำสั่งซื้อ').click();
    await expect(page.getByText('สลิปโอนเงิน')).toBeVisible();

    const pendingRows = page.locator('tr').filter({ hasText: 'รอตรวจสอบ' });
    const count = await pendingRows.count();

    if (count === 0) {
        await expect(page.getByText('สลิปโอนเงิน')).toBeVisible();
        return;
    }

    page.on('dialog', async (dialog) => {
        if (dialog.type() === 'prompt') {
            await dialog.accept('สลิปไม่ชัดเจน');
        } else {
            await dialog.accept();
        }
    });

    const pendingRow = pendingRows.first();
    await pendingRow.getByRole('button', { name: /ปฏิเสธ/ }).click();

    await expect(pendingRow.getByRole('button', { name: /ปฏิเสธ/ })).toBeHidden({ timeout: 8000 });
});

// TEST 4: แอดมินเปิดดูสลิปและปิด modal
test('ทดสอบแอดมินเปิดดูสลิปโอนเงินและปิด modal', async ({ page }) => {
    await loginAsAdmin(page);

    await page.getByText('การเงินและคำสั่งซื้อ').click();
    await expect(page.getByText('สลิปโอนเงิน')).toBeVisible();

    const slipButtons = page.getByRole('button', { name: /ดูสลิป/ });
    const count = await slipButtons.count();

    if (count === 0) {
        await expect(page.getByText('สลิปโอนเงิน')).toBeVisible();
        return;
    }

    await slipButtons.first().click();

    await expect(page.getByRole('heading', { name: 'สลิปโอนเงิน' })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('เปิดเต็มจอ')).toBeVisible();

    await page.locator('button').filter({ hasText: '✕' }).click();
    await expect(page.getByRole('heading', { name: 'สลิปโอนเงิน' })).toBeHidden();
});
