# アイテム一覧機能 実行ガイド

## セットアップ

```bash
# フロントエンドディレクトリに移動
cd /workspace/Trade-Nearby/frontend

# 依存関係のインストール（line-clampプラグインを追加）
npm install

# 開発サーバーの起動
npm run dev
```

## アクセス方法

ブラウザで以下のURLにアクセス：
```
http://localhost:5173/items
```

## 実装した機能

### 1. ItemCard
- アイテム個別表示カード
- 画像、タイトル、説明、タグ表示
- ステータスバッジ（取引中/交換済み）
- カテゴリーバッジ
- ユーザー情報表示

### 2. ItemList
- グリッドレイアウト（レスポンシブ対応）
- ローディング時のスケルトン表示
- エラー時の表示
- 空データ時のメッセージ

### 3. ItemFilter
- キーワード検索（デバウンス付き）
- カテゴリーフィルター
- ステータスフィルター
- ソート機能
- フィルターリセット

### 4. Pagination
- ページ番号表示
- 前後ページ移動
- ページジャンプ（ドロップダウン）
- レスポンシブ対応

### 5. ItemsPage
- 全体のレイアウト管理
- URLパラメータ連携
- 出品ボタン
- フローティングアクションボタン（モバイル）

## URLパラメータ

以下のパラメータが利用可能：
```
/items?page=1&category=anime&status=active&search=鬼滅&sort=-created_at
```

- `page`: ページ番号
- `limit`: 1ページあたりの表示件数（デフォルト12）
- `category`: anime, manga, game, idol, sports, other
- `status`: active, traded, reserved
- `search`: 検索キーワード
- `sort`: -created_at（新しい順）, created_at（古い順）, distance（近い順）
- `tags`: タグ（カンマ区切り）

## 開発モード（モックデータ使用）

バックエンドが起動していない場合、ItemsPage.tsxで以下のコメントを外してモックデータを使用：

```typescript
// 開発用：APIが利用できない場合はモックデータを使用
const data = mockItemsResponse;
const isLoading = false;
const error = null;
```

## トラブルシューティング

### line-clampエラーの場合
```bash
# Tailwind CSSバージョンによってはline-clampが組み込まれている場合があります
# その場合はtailwind.config.jsのプラグイン設定を削除
```

### APIエラーの場合
1. バックエンドが起動していることを確認
2. CORS設定を確認
3. ポート番号（3001）が正しいことを確認

## 次の実装予定

- アイテム詳細ページ（/items/:id）
- アイテム出品フォーム（/items/new）
- 近隣アイテム検索機能
- お気に入り機能
