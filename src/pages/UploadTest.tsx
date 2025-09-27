/**
 * 画像アップロードコンポーネントのテストページ
 */

import React, { useState } from 'react';
import { ImageUploader } from '@/components/upload';
import { UploadedImage } from '@/services/uploadService';

const UploadTestPage: React.FC = () => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const handleImagesChange = (images: UploadedImage[]) => {
    setUploadedImages(images);
    addLog(`画像が変更されました: ${images.length}枚`);
    images.forEach((img, index) => {
      addLog(`  画像${index + 1}: ${img.path}`);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">画像アップロードテスト</h1>

        {/* テストケース1: 通常の複数画像アップロード */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            テストケース1: 複数画像アップロード（最大5枚）
          </h2>
          <ImageUploader maxImages={5} uploadType="item" onImagesChange={handleImagesChange} />
        </div>

        {/* テストケース2: 単一画像アップロード（アバター） */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            テストケース2: アバター画像（1枚のみ）
          </h2>
          <ImageUploader
            maxImages={1}
            uploadType="avatar"
            onImagesChange={(images) => {
              addLog(`アバターが変更されました: ${images.length > 0 ? images[0].path : 'なし'}`);
            }}
          />
        </div>

        {/* テストケース3: 初期画像あり */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">テストケース3: 初期画像あり</h2>
          <ImageUploader
            maxImages={3}
            uploadType="item"
            initialImages={[
              {
                url: 'https://via.placeholder.com/400x400/FF6B6B/FFFFFF?text=Sample+1',
                path: 'sample/image1.jpg',
                thumbnail: 'https://via.placeholder.com/200x200/FF6B6B/FFFFFF?text=Thumb+1',
              },
            ]}
            onImagesChange={(images) => {
              addLog(`初期画像ありの変更: ${images.length}枚`);
            }}
          />
        </div>

        {/* アップロード結果表示 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">アップロード結果</h2>

          {uploadedImages.length > 0 ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                {uploadedImages.length}枚の画像がアップロードされています
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <img
                      src={image.thumbnail || image.url}
                      alt={`Uploaded ${index + 1}`}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                    <p className="text-xs text-gray-500 truncate">{image.path}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-gray-100 rounded">
                <h3 className="text-sm font-medium mb-2">JSON出力:</h3>
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(uploadedImages, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">まだ画像がアップロードされていません</p>
          )}
        </div>

        {/* ログ表示 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">イベントログ</h2>

          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            ) : (
              <div className="text-gray-500">ログはまだありません</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadTestPage;
