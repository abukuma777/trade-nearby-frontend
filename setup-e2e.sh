#!/bin/bash
# E2Eテストセットアップスクリプト

echo "📦 Playwright E2Eテスト環境をセットアップします..."

# Playwrightと関連パッケージのインストール
npm install --save-dev @playwright/test playwright

# Playwright設定ファイルの作成
echo "✅ Playwrightインストール完了"

# ブラウザのインストール
echo "🌐 テスト用ブラウザをインストール中..."
npx playwright install chromium

echo "✅ セットアップ完了！"
