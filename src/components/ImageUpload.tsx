/**
 * 画像アップロードコンポーネント
 * 画像の選択、プレビュー、並び替え、削除機能を提供
 */

import React, { useRef, useState } from 'react';
import { ImageData } from '../services/tradePostService';

interface ImageUploadProps {
  label: string;
  images: ImageData[];
  onImagesChange: (images: ImageData[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  images,
  onImagesChange,
  maxImages = 3,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // ファイルをBase64に変換
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // ファイル選択処理
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || disabled) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      alert(`最大${maxImages}枚まで選択できます`);
      return;
    }

    const filesToAdd = Array.from(files).slice(0, remainingSlots);
    const newImages: ImageData[] = [];

    for (let i = 0; i < filesToAdd.length; i++) {
      const file = filesToAdd[i];

      // ファイルタイプチェック
      if (!file.type.startsWith('image/')) {
        alert(`${file.name}は画像ファイルではありません`);
        continue;
      }

      // ファイルサイズチェック（5MB）
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name}は5MBを超えています`);
        continue;
      }

      try {
        const base64Data = await fileToBase64(file);
        const newImage: ImageData = {
          url: base64Data,
          order: images.length + newImages.length,
          is_main: images.length === 0 && newImages.length === 0,
        };
        newImages.push(newImage);
      } catch (error) {
        console.error('画像の読み込みエラー:', error);
        alert(`${file.name}の読み込みに失敗しました`);
      }
    }

    if (newImages.length > 0) {
      onImagesChange([...images, ...newImages]);
    }
  };

  // ドラッグ&ドロップ処理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  // 画像削除
  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    // メイン画像の再設定
    if (newImages.length > 0 && !newImages.some((img) => img.is_main)) {
      newImages[0].is_main = true;
    }
    // order の再設定
    newImages.forEach((img, i) => {
      img.order = i;
    });
    onImagesChange(newImages);
  };

  // メイン画像設定
  const handleSetMainImage = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      is_main: i === index,
    }));
    onImagesChange(newImages);
  };

  // 画像の順序変更（左へ移動）
  const handleMoveLeft = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    // order の再設定
    newImages.forEach((img, i) => {
      img.order = i;
    });
    onImagesChange(newImages);
  };

  // 画像の順序変更（右へ移動）
  const handleMoveRight = (index: number) => {
    if (index === images.length - 1) return;
    const newImages = [...images];
    [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    // order の再設定
    newImages.forEach((img, i) => {
      img.order = i;
    });
    onImagesChange(newImages);
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

      {/* 画像プレビューグリッド */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image.url}
                alt={`${label} ${index + 1}`}
                className={`w-full h-32 object-cover rounded-lg ${
                  image.is_main ? 'ring-2 ring-blue-500' : ''
                }`}
              />

              {/* メインバッジ */}
              {image.is_main && (
                <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  メイン
                </span>
              )}

              {/* 操作ボタン（ホバー時表示） */}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                {/* 左へ移動 */}
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => handleMoveLeft(index)}
                    className="p-1 bg-white rounded hover:bg-gray-100"
                    disabled={disabled}
                  >
                    ←
                  </button>
                )}

                {/* メインに設定 */}
                {!image.is_main && (
                  <button
                    type="button"
                    onClick={() => handleSetMainImage(index)}
                    className="p-1 bg-white rounded hover:bg-gray-100 text-xs"
                    disabled={disabled}
                  >
                    メイン
                  </button>
                )}

                {/* 削除 */}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                  disabled={disabled}
                >
                  ×
                </button>

                {/* 右へ移動 */}
                {index < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => handleMoveRight(index)}
                    className="p-1 bg-white rounded hover:bg-gray-100"
                    disabled={disabled}
                  >
                    →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* アップロードエリア */}
      {images.length < maxImages && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-600">クリックまたはドラッグして画像を追加</p>
          <p className="text-xs text-gray-500 mt-1">
            最大{maxImages}枚、各5MBまで（JPEG, PNG, WebP）
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            disabled={disabled}
          />
        </div>
      )}

      {/* 残り枚数表示 */}
      <p className="text-xs text-gray-500 mt-2">
        {images.length}/{maxImages}枚選択済み
      </p>
    </div>
  );
};

export default ImageUpload;
