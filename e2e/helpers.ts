/**
 * E2Eテスト用ヘルパー関数
 */

import { Page, expect } from '@playwright/test';

/**
 * テスト用ユーザー情報
 */
export const testUser = {
  email: 'test@example.com',
  password: 'TestPassword123!',
  username: 'testuser',
};

/**
 * ログイン処理
 */
export async function login(page: Page) {
  await page.goto('/login');
  await page.fill('input[name="email"]', testUser.email);
  await page.fill('input[name="password"]', testUser.password);
  await page.click('button[type="submit"]');
  
  // ログイン完了を待つ
  await page.waitForURL('/', { timeout: 10000 });
  
  // ユーザー名が表示されることを確認
  await expect(page.locator('text=' + testUser.email)).toBeVisible();
}

/**
 * ログアウト処理
 */
export async function logout(page: Page) {
  await page.click('button:has-text("ログアウト")');
  await page.waitForURL('/');
}

/**
 * テスト用画像ファイルを作成
 */
export function createTestImageFile(filename: string = 'test-image.jpg'): string {
  return `./e2e/fixtures/${filename}`;
}

/**
 * アイテムの作成（画像なし）
 */
export async function createItemWithoutImage(
  page: Page,
  data: {
    title: string;
    description: string;
    category?: string;
    condition?: string;
  }
) {
  await page.goto('/items/create');
  
  // 基本情報入力
  await page.fill('input[name="title"]', data.title);
  await page.fill('textarea[name="description"]', data.description);
  
  if (data.category) {
    await page.selectOption('select[name="category"]', data.category);
  }
  
  if (data.condition) {
    await page.selectOption('select[name="condition"]', data.condition);
  }
  
  // 送信
  await page.click('button:has-text("出品する")');
}

/**
 * 画像アップロードの待機
 */
export async function waitForImageUpload(page: Page, timeout: number = 10000) {
  // プログレスバーが消えるまで待つ
  await page.waitForSelector('.animate-spin', { 
    state: 'detached',
    timeout 
  });
  
  // アップロード完了メッセージを待つ
  await page.waitForSelector('img[alt="Preview"]', {
    timeout
  });
}

/**
 * アイテムの削除
 */
export async function deleteItem(page: Page, itemId: string) {
  await page.goto(`/items/${itemId}`);
  
  // 削除ボタンをクリック
  await page.click('button:has-text("削除")');
  
  // 確認ダイアログで「OK」をクリック
  page.on('dialog', dialog => dialog.accept());
  
  // リダイレクトを待つ
  await page.waitForURL('/items');
}

/**
 * スクリーンショット取得（デバッグ用）
 */
export async function takeDebugScreenshot(
  page: Page, 
  name: string
) {
  if (process.env.DEBUG) {
    await page.screenshot({ 
      path: `./e2e/screenshots/${name}.png`,
      fullPage: true 
    });
  }
}

/**
 * ネットワークエラーのモック
 */
export async function mockNetworkError(page: Page, url: string) {
  await page.route(url, route => {
    route.abort('failed');
  });
}

/**
 * APIレスポンスのモック
 */
export async function mockApiResponse(
  page: Page,
  url: string,
  response: any
) {
  await page.route(url, route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}
