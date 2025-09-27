# E2Eテスト - 画像アップロード機能

## 概要

SCRUM-61: アイテム投稿フォームへの画像アップロード統合のE2Eテストです。

## セットアップ

### 1. 必要なパッケージのインストール

```bash
cd frontend
npm run test:e2e:setup
```

### 2. テスト用画像の生成

```bash
npm run test:images
```

## テスト実行

### 通常実行

```bash
npm run test:e2e
```

### UIモードで実行（デバッグに便利）

```bash
npm run test:e2e:ui
```

### ヘッドレスモードではなく、ブラウザを表示して実行

```bash
npm run test:e2e:headed
```

### デバッグモード

```bash
npm run test:e2e:debug
```

### テストレポートの表示

```bash
npm run test:e2e:report
```

## テストケース

### 1. 画像アップロード機能

- ✅ 新規アイテム作成時に画像をアップロードできる
- ✅ 複数画像をアップロードできる（最大5枚）
- ✅ 最大5枚の制限が機能する
- ✅ 画像を削除できる
- ✅ ドラッグ&ドロップで画像をアップロードできる
- ✅ 画像なしでの投稿はエラーになる

### 2. アイテム編集時の画像管理

- ✅ 既存画像を表示して新しい画像を追加できる
- ✅ 既存画像を削除できる

### 3. エラーハンドリング

- ✅ 無効なファイル形式でエラーが表示される
- ✅ 大きすぎるファイル（10MB超）でエラーが表示される
- ✅ ネットワークエラー時の処理

### 4. 認証チェック

- ✅ 未認証ユーザーは新規作成ページにアクセスできない
- ✅ 他のユーザーのアイテムは編集できない

## ディレクトリ構造

```
frontend/
├── e2e/
│   ├── fixtures/           # テスト用画像ファイル
│   │   ├── test-image1.jpg
│   │   ├── test-image2.jpg
│   │   ├── ...
│   │   ├── large-file.jpg  # 10MB超のファイル
│   │   └── invalid-file.txt # 無効なファイル形式
│   ├── helpers.ts          # ヘルパー関数
│   └── image-upload.spec.ts # メインテストファイル
├── scripts/
│   └── generate-test-images.sh # テスト画像生成スクリプト
└── playwright.config.ts    # Playwright設定
```

## トラブルシューティング

### テストが失敗する場合

1. **サーバーが起動していることを確認**
   - バックエンド: `npm run dev` (ポート3001)
   - フロントエンド: `npm run dev` (ポート5173)

2. **テスト用画像が生成されていることを確認**
   ```bash
   ls -la e2e/fixtures/
   ```

3. **ブラウザがインストールされていることを確認**
   ```bash
   npx playwright install chromium
   ```

### デバッグ方法

1. **スクリーンショットを確認**
   - テスト失敗時は自動的にスクリーンショットが保存されます
   - `test-results/` ディレクトリを確認

2. **UIモードで実行**
   ```bash
   npm run test:e2e:ui
   ```
   - ステップごとの実行状態を確認できます
   - タイムトラベルデバッグが可能

3. **デバッグモードで実行**
   ```bash
   npm run test:e2e:debug
   ```
   - ブレークポイントを設定できます
   - Chrome DevToolsが使用可能

## CI/CD統合

GitHub Actionsなどでの実行例：

```yaml
name: E2E Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        cd frontend
        npm ci
        
    - name: Install Playwright browsers
      run: |
        cd frontend
        npx playwright install chromium
        
    - name: Generate test images
      run: |
        cd frontend
        npm run test:images
        
    - name: Run E2E tests
      run: |
        cd frontend
        npm run test:e2e
        
    - name: Upload test results
      if: always()
      uses: actions/upload-artifact@v3
      with:
        name: playwright-report
        path: frontend/playwright-report/
```

## メンテナンス

### テストの更新

1. **新機能追加時**
   - 対応するE2Eテストケースを追加
   - `image-upload.spec.ts` に新しいテストを追加

2. **UI変更時**
   - セレクターの更新が必要な場合があります
   - `helpers.ts` のヘルパー関数も更新

3. **API変更時**
   - モック関数の更新
   - レスポンス形式の変更に対応

## 参考リンク

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Vitest Documentation](https://vitest.dev/)
