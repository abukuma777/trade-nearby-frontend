# Trade Nearby フロントエンド

AI-Native推し活グッズ交換プラットフォームのフロントエンドアプリケーションです。

## 技術スタック

- **Framework**: React 18
- **Build Tool**: Vite 4
- **Language**: TypeScript 5
- **Styling**: TailwindCSS 3
- **State Management**: Zustand
- **Routing**: React Router v6
- **API Client**: Axios + React Query

## セットアップ

### 前提条件

- Node.js 18以上
- npm または yarn
- バックエンドサーバーが起動していること

### インストール

```bash
# 依存関係のインストール
npm install
```

### 開発サーバー起動

```bash
# 開発サーバーを起動
npm run dev

# ネットワーク上の他のデバイスからもアクセス可能にする場合
npm run dev:host
```

### ビルド

```bash
# プロダクションビルド
npm run build

# ビルドされたアプリのプレビュー
npm run preview
```

## プロジェクト構造

```
frontend/
├── src/
│   ├── components/      # 共通UIコンポーネント
│   ├── features/        # 機能別モジュール
│   │   ├── auth/       # 認証機能
│   │   ├── items/      # アイテム管理
│   │   ├── trade/      # 取引機能
│   │   └── messages/   # メッセージ機能
│   ├── hooks/          # カスタムフック
│   ├── services/       # API通信サービス
│   ├── stores/         # Zustandストア
│   ├── types/          # TypeScript型定義
│   └── utils/          # ユーティリティ関数
├── public/             # 静的ファイル
└── index.html          # エントリーHTML
```

## 環境変数

`.env.development`ファイルに以下の環境変数を設定してください：

```env
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 開発ガイドライン

### コンポーネント設計

- Atomic Designの簡易版を採用
- `components/`: 汎用UIコンポーネント
- `features/`: ビジネスロジックを持つ機能モジュール

### 状態管理

- **Zustand**: グローバル状態管理
- **React Query**: サーバー状態管理
- **useState/useReducer**: ローカル状態

### コーディング規約

- TypeScriptの厳格モードを使用
- ESLintとPrettierによる自動フォーマット
- パスエイリアス（`@/`）の使用

## スクリプト

- `npm run dev` - 開発サーバー起動
- `npm run build` - プロダクションビルド
- `npm run preview` - ビルドプレビュー
- `npm run lint` - ESLint実行
# イベントモード実装完了
