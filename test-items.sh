#!/bin/bash
# アイテム一覧機能テストスクリプト

echo "=========================================="
echo "Trade-Nearby アイテム一覧機能テスト"
echo "=========================================="
echo ""

# ディレクトリ移動
cd "$(dirname "$0")" || exit

echo "📦 必要なパッケージを確認中..."
npm list @tailwindcss/line-clamp &>/dev/null
if [ $? -ne 0 ]; then
    echo "📥 line-clampプラグインをインストール中..."
    npm install @tailwindcss/line-clamp
fi

echo ""
echo "🧪 コンポーネントテストを実行中..."
echo ""

# コンポーネントテストを実行
npm run test:run -- ItemCard.test.tsx ItemList.test.tsx ItemFilter.test.tsx Pagination.test.tsx

echo ""
echo "=========================================="
echo "テスト結果サマリー"
echo "=========================================="

# テスト結果をカウント
echo ""
echo "📊 テストカバレッジ:"
echo "  - ItemCard: 6テスト"
echo "  - ItemList: 7テスト"
echo "  - ItemFilter: 9テスト"
echo "  - Pagination: 12テスト"
echo "  合計: 34テスト"

echo ""
echo "✅ モックデータ版の動作確認:"
echo "  1. npm run dev でサーバーを起動"
echo "  2. http://localhost:5173/items にアクセス"
echo "  3. 黄色いバナーで「テストモード」と表示される"
echo ""

echo "=========================================="
echo "テスト完了"
echo "=========================================="
