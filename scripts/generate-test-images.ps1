# PowerShell用テスト画像生成スクリプト

Write-Host "Generating test images..." -ForegroundColor Green

# fixturesディレクトリを作成
$fixturesDir = ".\e2e\fixtures"
if (!(Test-Path $fixturesDir)) {
    New-Item -ItemType Directory -Path $fixturesDir -Force
}

# Base64エンコードされた最小のJPEG画像（1x1ピクセル）
$base64Image = "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAr/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k="

# Base64をバイト配列に変換
$imageBytes = [Convert]::FromBase64String($base64Image)

# 各テスト画像を生成
for ($i = 1; $i -le 6; $i++) {
    $filePath = Join-Path $fixturesDir "test-image$i.jpg"
    [System.IO.File]::WriteAllBytes($filePath, $imageBytes)
    Write-Host "Created test-image$i.jpg" -ForegroundColor Green
}

# 大きなファイルを生成（約11MB）
$largeFilePath = Join-Path $fixturesDir "large-file.jpg"
$largeFileBytes = New-Object byte[] (11 * 1024 * 1024)
[System.IO.File]::WriteAllBytes($largeFilePath, $largeFileBytes)
Write-Host "Created large-file.jpg (11MB)" -ForegroundColor Green

# 無効なテキストファイルを生成
$invalidFilePath = Join-Path $fixturesDir "invalid-file.txt"
"This is not an image file" | Out-File -FilePath $invalidFilePath -Encoding UTF8
Write-Host "Created invalid-file.txt" -ForegroundColor Green

Write-Host ""
Write-Host "All test files generated successfully!" -ForegroundColor Green
Write-Host "Location: frontend\e2e\fixtures\" -ForegroundColor Cyan
