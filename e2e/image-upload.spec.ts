/**
 * 画像アップロード機能のE2Eテスト
 * SCRUM-61: アイテム投稿フォームへの画像アップロード統合
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import { 
  login, 
  logout, 
  waitForImageUpload,
  takeDebugScreenshot 
} from './helpers';

// テストデータ
const testItem = {
  title: 'E2Eテスト商品',
  description: 'これはE2Eテスト用の商品説明です。\n画像アップロード機能のテストを行います。',
  category: 'electronics',
  condition: 'good',
  tags: ['テスト', 'E2E', '自動テスト'],
};

// テスト前の準備
test.beforeEach(async ({ page }) => {
  // ログイン
  await login(page);
});

// テスト後の後処理
test.afterEach(async ({ page }) => {
  // ログアウト
  await logout(page);
});

test.describe('画像アップロード機能', () => {
  test('新規アイテム作成時に画像をアップロードできる', async ({ page }) => {
    // アイテム作成ページへ移動
    await page.goto('/items/create');
    
    // ページタイトルを確認
    await expect(page.locator('h1')).toHaveText('アイテムを出品する');
    
    // 画像をアップロード（ファイル選択ボタンを使用）
    const fileInput = page.locator('input[type="file"]');
    const testImagePath = path.join(__dirname, 'fixtures', 'test-image1.jpg');
    await fileInput.setInputFiles(testImagePath);
    
    // アップロード完了を待つ
    await waitForImageUpload(page);
    
    // プレビュー画像が表示されることを確認
    const previewImage = page.locator('img[alt="Preview"]').first();
    await expect(previewImage).toBeVisible();
    
    // 基本情報を入力
    await page.fill('input[name="title"]', testItem.title);
    await page.fill('textarea[name="description"]', testItem.description);
    await page.selectOption('select[name="category"]', testItem.category);
    await page.selectOption('select[name="condition"]', testItem.condition);
    
    // タグを追加
    for (const tag of testItem.tags) {
      await page.fill('input[placeholder="タグを入力してEnterキー"]', tag);
      await page.press('input[placeholder="タグを入力してEnterキー"]', 'Enter');
    }
    
    // 出品ボタンをクリック
    await page.click('button:has-text("出品する")');
    
    // アイテム詳細ページへリダイレクトされることを確認
    await page.waitForURL(/\/items\/\d+/, { timeout: 15000 });
    
    // 成功メッセージを確認
    await expect(page.locator('text=アイテムを作成しました')).toBeVisible();
    
    // 画像が表示されることを確認
    const itemImage = page.locator('.image-gallery img').first();
    await expect(itemImage).toBeVisible();
  });

  test('複数画像をアップロードできる', async ({ page }) => {
    await page.goto('/items/create');
    
    // 複数の画像をアップロード
    const fileInput = page.locator('input[type="file"]');
    const testImages = [
      path.join(__dirname, 'fixtures', 'test-image1.jpg'),
      path.join(__dirname, 'fixtures', 'test-image2.jpg'),
      path.join(__dirname, 'fixtures', 'test-image3.jpg'),
    ];
    await fileInput.setInputFiles(testImages);
    
    // すべての画像のアップロード完了を待つ
    await page.waitForTimeout(3000); // アップロード完了を待つ
    
    // 3枚の画像がプレビュー表示されることを確認
    const previewImages = page.locator('img[alt="Preview"]');
    await expect(previewImages).toHaveCount(3);
  });

  test('最大5枚の制限が機能する', async ({ page }) => {
    await page.goto('/items/create');
    
    // 5枚の画像をアップロード
    const fileInput = page.locator('input[type="file"]');
    const testImages = Array(5).fill(null).map((_, i) => 
      path.join(__dirname, 'fixtures', `test-image${i + 1}.jpg`)
    );
    await fileInput.setInputFiles(testImages);
    
    // アップロード完了を待つ
    await page.waitForTimeout(5000);
    
    // 5枚の画像が表示されることを確認
    const previewImages = page.locator('img[alt="Preview"]');
    await expect(previewImages).toHaveCount(5);
    
    // 6枚目を追加しようとする
    const additionalImage = path.join(__dirname, 'fixtures', 'test-image6.jpg');
    await fileInput.setInputFiles(additionalImage);
    
    // エラーメッセージが表示されることを確認
    await expect(page.locator('text=最大5枚まで')).toBeVisible();
  });

  test('画像を削除できる', async ({ page }) => {
    await page.goto('/items/create');
    
    // 画像をアップロード
    const fileInput = page.locator('input[type="file"]');
    const testImagePath = path.join(__dirname, 'fixtures', 'test-image1.jpg');
    await fileInput.setInputFiles(testImagePath);
    
    // アップロード完了を待つ
    await waitForImageUpload(page);
    
    // 削除ボタンをクリック
    await page.hover('img[alt="Preview"]');
    await page.click('button[aria-label="画像を削除"]');
    
    // 画像が削除されることを確認
    await expect(page.locator('img[alt="Preview"]')).toHaveCount(0);
  });

  test('ドラッグ&ドロップで画像をアップロードできる', async ({ page }) => {
    await page.goto('/items/create');
    
    // ドラッグ&ドロップゾーンを取得
    const dropZone = page.locator('.border-dashed').first();
    
    // ファイルをドラッグ&ドロップ
    const testImagePath = path.join(__dirname, 'fixtures', 'test-image1.jpg');
    
    // DataTransferをシミュレート
    await dropZone.dispatchEvent('drop', {
      dataTransfer: {
        files: [testImagePath],
      },
    });
    
    // アップロード完了を待つ
    await waitForImageUpload(page);
    
    // 画像が表示されることを確認
    await expect(page.locator('img[alt="Preview"]')).toBeVisible();
  });

  test('画像なしでの投稿はエラーになる', async ({ page }) => {
    await page.goto('/items/create');
    
    // 画像なしで基本情報のみ入力
    await page.fill('input[name="title"]', testItem.title);
    await page.fill('textarea[name="description"]', testItem.description);
    
    // 出品ボタンをクリック
    await page.click('button:has-text("出品する")');
    
    // エラーメッセージが表示されることを確認
    await expect(page.locator('text=最低1枚の画像をアップロードしてください')).toBeVisible();
  });
});

test.describe('アイテム編集時の画像管理', () => {
  let createdItemId: string;

  test.beforeEach(async ({ page }) => {
    // テスト用アイテムを作成
    await page.goto('/items/create');
    
    // 画像付きでアイテムを作成
    const fileInput = page.locator('input[type="file"]');
    const testImagePath = path.join(__dirname, 'fixtures', 'test-image1.jpg');
    await fileInput.setInputFiles(testImagePath);
    await waitForImageUpload(page);
    
    await page.fill('input[name="title"]', '編集テスト用アイテム');
    await page.fill('textarea[name="description"]', '編集テスト用の説明');
    await page.click('button:has-text("出品する")');
    
    // 作成されたアイテムのIDを取得
    await page.waitForURL(/\/items\/(\d+)/);
    const url = page.url();
    const match = url.match(/\/items\/(\d+)/);
    createdItemId = match ? match[1] : '';
  });

  test('既存画像を表示して新しい画像を追加できる', async ({ page }) => {
    // 編集ページへ移動
    await page.goto(`/items/${createdItemId}/edit`);
    
    // 既存画像が表示されることを確認
    await expect(page.locator('img[alt="Preview"]')).toHaveCount(1);
    
    // 新しい画像を追加
    const fileInput = page.locator('input[type="file"]');
    const newImagePath = path.join(__dirname, 'fixtures', 'test-image2.jpg');
    await fileInput.setInputFiles(newImagePath);
    
    // アップロード完了を待つ
    await waitForImageUpload(page);
    
    // 2枚の画像が表示されることを確認
    await expect(page.locator('img[alt="Preview"]')).toHaveCount(2);
    
    // 更新ボタンをクリック
    await page.click('button:has-text("更新する")');
    
    // アイテム詳細ページへリダイレクト
    await page.waitForURL(`/items/${createdItemId}`);
    
    // 成功メッセージを確認
    await expect(page.locator('text=アイテムを更新しました')).toBeVisible();
  });

  test('既存画像を削除できる', async ({ page }) => {
    await page.goto(`/items/${createdItemId}/edit`);
    
    // 既存画像を削除
    await page.hover('img[alt="Preview"]');
    await page.click('button[aria-label="画像を削除"]');
    
    // 画像が削除されることを確認
    await expect(page.locator('img[alt="Preview"]')).toHaveCount(0);
    
    // 新しい画像を追加（画像なしでは更新できないため）
    const fileInput = page.locator('input[type="file"]');
    const newImagePath = path.join(__dirname, 'fixtures', 'test-image3.jpg');
    await fileInput.setInputFiles(newImagePath);
    await waitForImageUpload(page);
    
    // 更新
    await page.click('button:has-text("更新する")');
    await page.waitForURL(`/items/${createdItemId}`);
  });
});

test.describe('画像アップロードのエラーハンドリング', () => {
  test('無効なファイル形式でエラーが表示される', async ({ page }) => {
    await page.goto('/items/create');
    
    // 無効なファイル形式（.txt）をアップロード試行
    const fileInput = page.locator('input[type="file"]');
    const invalidFile = path.join(__dirname, 'fixtures', 'invalid-file.txt');
    await fileInput.setInputFiles(invalidFile);
    
    // エラーメッセージが表示されることを確認
    await expect(page.locator('text=対応していないファイル形式')).toBeVisible();
  });

  test('大きすぎるファイルでエラーが表示される', async ({ page }) => {
    await page.goto('/items/create');
    
    // 10MBを超えるファイルをアップロード試行
    const fileInput = page.locator('input[type="file"]');
    const largeFile = path.join(__dirname, 'fixtures', 'large-file.jpg');
    await fileInput.setInputFiles(largeFile);
    
    // エラーメッセージが表示されることを確認
    await expect(page.locator('text=サイズが大きすぎます')).toBeVisible();
  });

  test('ネットワークエラー時の処理', async ({ page }) => {
    await page.goto('/items/create');
    
    // アップロードAPIをブロック
    await page.route('**/api/upload/single', route => route.abort());
    
    // 画像をアップロード試行
    const fileInput = page.locator('input[type="file"]');
    const testImagePath = path.join(__dirname, 'fixtures', 'test-image1.jpg');
    await fileInput.setInputFiles(testImagePath);
    
    // エラーメッセージが表示されることを確認
    await expect(page.locator('text=アップロードに失敗しました')).toBeVisible();
  });
});

test.describe('認証チェック', () => {
  test('未認証ユーザーは新規作成ページにアクセスできない', async ({ page }) => {
    // ログアウト状態で作成ページへアクセス
    await logout(page);
    await page.goto('/items/create');
    
    // ログインページへリダイレクトされることを確認
    await page.waitForURL('/login');
  });

  test('他のユーザーのアイテムは編集できない', async ({ page }) => {
    // 他のユーザーのアイテムIDを仮定
    const otherUserItemId = '99999';
    
    await page.goto(`/items/${otherUserItemId}/edit`);
    
    // エラーメッセージが表示されることを確認
    await expect(page.locator('text=このアイテムを編集する権限がありません')).toBeVisible();
  });
});
