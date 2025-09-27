#!/bin/bash
# テスト用画像生成スクリプト（簡易版）
# ImageMagickまたは単純なBase64画像を使用

echo "📸 テスト用画像を生成中..."

# fixturesディレクトリを作成
mkdir -p ../e2e/fixtures

# Base64エンコードされた1x1ピクセルのJPEG画像
BASE64_IMAGE="/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAr/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k="

# 各テスト画像を生成
for i in {1..6}; do
  echo $BASE64_IMAGE | base64 -d > ../e2e/fixtures/test-image${i}.jpg
  echo "✅ test-image${i}.jpg を生成しました"
done

# 大きなファイルを生成（dd コマンドを使用）
# 約11MBのダミーファイルを作成
dd if=/dev/zero of=../e2e/fixtures/large-file.jpg bs=1M count=11 2>/dev/null
echo "✅ large-file.jpg (11MB) を生成しました"

# 無効なテキストファイルを生成
echo "This is not an image file" > ../e2e/fixtures/invalid-file.txt
echo "✅ invalid-file.txt を生成しました"

echo ""
echo "✅ すべてのテストファイルが生成されました！"
echo "📂 場所: frontend/e2e/fixtures/"
