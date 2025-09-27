# テスト実行ガイド

## セットアップ

テスト実行前に必要なパッケージをインストールしてください：

```bash
cd /workspace/Trade-Nearby/frontend
npm install
```

## テストの実行方法

### 1. 基本的なテスト実行

```bash
# ウォッチモードでテストを実行（ファイル変更を検知して自動実行）
npm test

# 単発でテストを実行
npm run test:run

# UIモードでテストを実行（ブラウザでテスト結果を確認）
npm run test:ui

# カバレッジレポートを生成
npm run test:coverage
```

### 2. 特定のテストファイルのみ実行

```bash
# 型定義のテストのみ実行
npm test -- item.test.ts

# サービス層のテストのみ実行
npm test -- itemService.test.ts

# フックのテストのみ実行
npm test -- useItems.test.tsx
```

## テストファイル構成

```
frontend/src/
├── types/
│   └── __tests__/
│       └── item.test.ts          # 型定義とモックデータのテスト
├── services/
│   └── __tests__/
│       └── itemService.test.ts   # API通信サービスのテスト
├── hooks/
│   └── __tests__/
│       └── useItems.test.tsx     # React Queryフックのテスト
└── test/
    └── setup.ts                   # テスト環境のセットアップ
```

## テスト内容

### 1. 型定義テスト（item.test.ts）
- ✅ カテゴリーラベルの確認
- ✅ コンディションラベルの確認
- ✅ ステータスラベルの確認
- ✅ モックデータのインポート確認
- ✅ モックデータの構造確認

### 2. サービステスト（itemService.test.ts）
- ✅ アイテム一覧の取得
- ✅ クエリパラメータの処理
- ✅ 検索機能
- ✅ 近隣アイテムの検索
- ✅ エラーハンドリング
- ✅ 404エラーの処理

### 3. フックテスト（useItems.test.tsx）
- ✅ useItemsフックの動作
- ✅ useItemフックの動作
- ✅ useCreateItemフックの動作
- ✅ キャッシュの無効化処理
- ✅ エラーハンドリング

## バックエンドとの統合テスト

バックエンドが起動している場合、実際のAPIとの通信テストが実行されます：

### バックエンドの起動
```bash
# 別ターミナルで実行
cd /workspace/Trade-Nearby
npm run dev:mobile
```

### 統合テストの実行
```bash
cd /workspace/Trade-Nearby/frontend
npm run test:run -- itemService.test.ts
```

バックエンドが起動していない場合は、統合テストは自動的にスキップされます。

## トラブルシューティング

### エラー: Cannot find module '@testing-library/jest-dom'
```bash
npm install --save-dev @testing-library/jest-dom @testing-library/react vitest jsdom
```

### エラー: vi is not defined
setupファイルが正しく読み込まれていることを確認してください。
`vitest.config.ts`の`setupFiles`設定を確認。

### テストが失敗する場合
1. バックエンドのAPIエンドポイントを確認
2. CORS設定を確認
3. 環境変数（VITE_API_URL）を確認

## カバレッジレポート

カバレッジレポートは以下のディレクトリに生成されます：
```
frontend/coverage/
├── index.html    # ブラウザで開いて確認
├── coverage.json # JSON形式のレポート
└── ...
```

ブラウザでカバレッジレポートを確認：
```bash
npm run test:coverage
# 生成後、coverage/index.htmlをブラウザで開く
```
