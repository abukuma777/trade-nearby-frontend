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

  const testImage = async (url: string): Promise<void> => {
    setLoading(true);
    setError('');

    try {
      // Fetch APIでURLにアクセス
      const response = await fetch(url, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // 画像アクセス成功ログ
      // console.log('画像URLアクセス成功:', url);
      // console.log('Response Headers:', response.headers);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(`アクセスエラー: ${errorMsg}`);
      // エラーログ
      // console.error('画像URLアクセスエラー:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          画像表示テストページ
        </h1>

        {/* カスタムURL入力 */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">カスタムURL テスト</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="画像URLを入力..."
              className="flex-1 rounded-lg border px-4 py-2"
            />
            <button
              onClick={() => void testImage(testUrl)}
              disabled={!testUrl || loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'テスト中...' : 'テスト'}
            </button>
          </div>
          {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
          {testUrl && (
            <div className="mt-4">
              <p className="mb-2 text-sm text-gray-600">画像プレビュー:</p>
              <img
                src={testUrl}
                alt="Test"
                className="h-auto max-w-full rounded-lg shadow"
                onLoad={() => {
                  // 画像読み込み成功ログ
                  // console.log('画像読み込み成功:', testUrl);
                }}
                onError={(e) => {
                  // 画像読み込みエラーログ
                  const target = e.currentTarget;
                  target.src =
                    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZSIvPgogIDx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjIwMCIgeT0iMTUwIiBzdHlsZT0iZmlsbDojYWFhO2ZvbnQtd2VpZ2h0OmJvbGQ7Zm9udC1zaXplOjE5cHg7Zm9udC1mYW1pbHk6QXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWY7ZG9taW5hbnQtYmFzZWxpbmU6Y2VudHJhbCI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pgo8L3N2Zz4=';
                }}
              />
            </div>
          )}
        </div>

        {/* サンプル画像 */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">
            DBに保存されている画像のテスト
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {sampleImages.map((image) => (
              <div
                key={`sample-${image.title}`}
                className="rounded-lg border p-4"
              >
                <h3 className="mb-2 font-medium">{image.title}</h3>
                <p className="mb-2 break-all text-xs text-gray-500">
                  {image.url}
                </p>

                {/* 画像表示テスト */}
                <div className="mb-4">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="h-48 w-full rounded-lg object-cover"
                    onLoad={(e) => {
                      // 画像読み込み成功ログ
                      const _img = e.currentTarget;
                      // サイズ: ${_img.naturalWidth}x${_img.naturalHeight}
                    }}
                    onError={(e) => {
                      // 画像読み込みエラーログ
                      // エラー時はプレースホルダーを表示
                      e.currentTarget.src =
                        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZSIvPgogIDx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9IjIwMCIgeT0iMTUwIiBzdHlsZT0iZmlsbDojYWFhO2ZvbnQtd2VpZ2h0OmJvbGQ7Zm9udC1zaXplOjE5cHg7Zm9udC1mYW1pbHk6QXJpYWwsSGVsdmV0aWNhLHNhbnMtc2VyaWY7ZG9taW5hbnQtYmFzZWxpbmU6Y2VudHJhbCI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pgo8L3N2Zz4=';
                    }}
                  />
                </div>

                {/* アクセステストボタン */}
                <button
                  onClick={() => void testImage(image.url)}
                  className="w-full rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                >
                  URLアクセステスト
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* デバッグ情報 */}
        <div className="mt-8 rounded-lg bg-gray-100 p-6">
          <h2 className="mb-4 text-xl font-semibold">デバッグ情報</h2>
          <div className="space-y-2 text-sm">
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
