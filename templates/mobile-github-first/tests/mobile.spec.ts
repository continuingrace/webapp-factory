import { test, expect } from '@playwright/test';

const criticalViewportChecks = async (page: import('@playwright/test').Page) => {
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow, '페이지에 가로 스크롤이 없어야 합니다.').toBeFalsy();
};

test('기본 페이지가 모바일에서 정상 표시된다', async ({ page }) => {
  await criticalViewportChecks(page);
});

test('LocalStorage 상태가 새로고침 뒤에도 유지된다', async ({ page }) => {
  await page.goto('/');
  const editable = page.locator('textarea, input[type="text"], [contenteditable="true"]').first();
  if (await editable.count()) {
    await editable.fill('RE QA autosave check');
    await page.waitForTimeout(500);
    await page.reload();
    await expect(editable).toHaveValue('RE QA autosave check');
  }
});

test('콘솔 오류가 발생하지 않는다', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.waitForTimeout(500);
  expect(errors).toEqual([]);
});
