/**
 * 画像表示テストページ
 * Supabase Storageからの画像取得をテスト
 */

import React, { useState } from 'react';

const ImageTestPage: React.FC = () => {
  const [testUrl, setTestUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // DBから取得したサンプル画像URL
  const sampleImages = [
    {
      title: 'エマ缶バッチ2 - 譲',
      url: 'https://ewcyorpstxxabpkgcrqx.supabase.co/storage/v1/object/public/trade-images/f3dcbeb7-ad03-476d-9489-0c93a38a24b0/1758800475163-image-1758800473203-0.jpeg',
    },
    {
      title: '栞子缶バッチ2 - 求',
      url: 'https://ewcyorpstxxabpkgcrqx.supabase.co/storage/v1/object/public/trade-images/f3dcbeb7-ad03-476d-9489-0c93a38a24b0/1758800475917-image-1758800474566-0.jpeg',
    },
    {
      title: 'エマ缶バッチ1 - 譲',
      url: 'https://ewcyorpstxxabpkgcrqx.supabase.co/storage/v1/object/public/trade-images/f3dcbeb7-ad03-476d-9489-0c93a38a24b0/1758800421363-image-1758800419961-0.jpeg',
    },
    {
      title: '栞子缶バッチ1 - 求',
      url: 'https://ewcyorpstxxabpkgcrqx.supabase.co/storage/v1/object/public/trade-images/f3dcbeb7-ad03-476d-9489-0c93a38a24b0/1758800422054-image-1758800420696-0.jpeg',
    },
  ];

  const testImage = async (url: string) => {
    setLoading(true);
    setError('');

    try {
      // Fetch APIでURLにアクセス
      const response = await fetch(url, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log('画像URLアクセス成功:', url);
      console.log('Response Headers:', response.headers);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(`アクセスエラー: ${errorMsg}`);
      console.error('画像URLアクセスエラー:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">画像表示テストページ</h1>

        {/* カスタムURL入力 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">カスタムURL テスト</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="画像URLを入力..."
              className="flex-1 px-4 py-2 border rounded-lg"
            />
            <button
              onClick={() => testImage(testUrl)}
              disabled={!testUrl || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'テスト中...' : 'テスト'}
            </button>
          </div>
          {error && <div className="mt-2 text-red-600 text-sm">{error}</div>}
          {testUrl && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">画像プレビュー:</p>
              <img
                src={testUrl}
                alt="Test"
                className="max-w-full h-auto rounded-lg shadow"
                onLoad={() => console.log('画像読み込み成功:', testUrl)}
                onError={(e) => {
                  console.error('画像読み込みエラー:', testUrl);
                  console.error('Error event:', e);
                }}
              />
            </div>
          )}
        </div>

        {/* サンプル画像 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">DBに保存されている画像のテスト</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {sampleImages.map((image, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">{image.title}</h3>
                <p className="text-xs text-gray-500 mb-2 break-all">{image.url}</p>

                {/* 画像表示テスト */}
                <div className="mb-4">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-48 object-cover rounded-lg"
                    onLoad={(e) => {
                      console.log(`✅ 画像${index + 1}読み込み成功:`, image.title);
                      const img = e.currentTarget;
                      console.log(`  サイズ: ${img.naturalWidth}x${img.naturalHeight}`);
                    }}
                    onError={(e) => {
                      console.error(`❌ 画像${index + 1}読み込みエラー:`, image.title);
                      console.error('  URL:', image.url);
                      console.error('  Error:', e);
                      // エラー時はプレースホルダーを表示
                      e.currentTarget.src =
                        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZSIvPgogIDx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjIwMCIgeT0iMTUwIiBzdHlsZT0iZmlsbDojYWFhO2ZvbnQtd2VpZ2h0OmJvbGQ7Zm9udC1zaXplOjE5cHg7Zm9udC1mYW1pbHk6QXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWY7ZG9taW5hbnQtYmFzZWxpbmU6Y2VudHJhbCI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pgo8L3N2Zz4=';
                    }}
                  />
                </div>

                {/* アクセステストボタン */}
                <button
                  onClick={() => testImage(image.url)}
                  className="w-full px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  URLアクセステスト
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* デバッグ情報 */}
        <div className="mt-8 bg-gray-100 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">デバッグ情報</h2>
          <div className="text-sm space-y-2">
            <p>
              <strong>現在のURL:</strong> {window.location.href}
            </p>
            <p>
              <strong>プロトコル:</strong> {window.location.protocol}
            </p>
            <p>
              <strong>User Agent:</strong> {navigator.userAgent}
            </p>
            <p>
              <strong>環境:</strong> {import.meta.env.MODE}
            </p>
            <p>
              <strong>API URL:</strong> {import.meta.env.VITE_API_URL}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageTestPage;
