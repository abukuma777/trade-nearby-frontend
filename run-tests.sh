#!/bin/bash
# Trade-Nearby フロントエンドテスト実行スクリプト

echo "=========================================="
echo "Trade-Nearby Frontend Test Runner"
echo "=========================================="
echo ""

# ディレクトリ移動
cd "$(dirname "$0")" || exit

# 依存関係のインストール確認
echo "📦 依存関係をチェック中..."
if [ ! -d "node_modules" ]; then
    echo "📥 パッケージをインストール中..."
    npm install
fi

# テストモードの選択
echo ""
echo "テストモードを選択してください:"
echo "1) 簡単なテスト（型定義とモックデータ）"
echo "2) すべてのテスト（統合テスト含む）"
echo "3) ウォッチモード（ファイル変更を監視）"
echo "4) UIモード（ブラウザで結果確認）"
echo "5) カバレッジレポート生成"
echo ""

read -p "選択 (1-5): " choice

case $choice in
    1)
        echo "🧪 簡単なテストを実行中..."
        npm run test:run -- item.test.ts
        ;;
    2)
        echo "🧪 すべてのテストを実行中..."
        npm run test:run
        ;;
    3)
        echo "👀 ウォッチモードで起動中..."
        npm test
        ;;
    4)
        echo "🌐 UIモードで起動中..."
        npm run test:ui
        ;;
    5)
        echo "📊 カバレッジレポートを生成中..."
        npm run test:coverage
        echo ""
        echo "✅ カバレッジレポートが生成されました"
        echo "📁 coverage/index.html をブラウザで開いてください"
        ;;
    *)
        echo "❌ 無効な選択です"
        exit 1
        ;;
esac

echo ""
echo "=========================================="
echo "テスト完了"
echo "=========================================="
