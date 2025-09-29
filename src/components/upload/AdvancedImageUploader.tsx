/**
 * Pre-signed URL方式を使用した改良版ImageUploaderコンポーネント
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { presignedUploadService, UploadedImage } from '@/services/presignedUploadService';

export interface AdvancedImageUploaderProps {
  maxImages?: number;
  onImagesChange: (images: UploadedImage[]) => void;
  initialImages?: UploadedImage[];
  disabled?: boolean;
  className?: string;
  label?: string;
}

interface PreviewImage extends UploadedImage {
  id: string;
  file?: File;
  uploading: boolean;
  progress: number;
  error?: string;
}

export const AdvancedImageUploader: React.FC<AdvancedImageUploaderProps> = ({
  maxImages = 5,
  onImagesChange,
  initialImages = [],
  disabled = false,
  className = '',
  label,
}) => {
  const [previewImages, setPreviewImages] = useState<PreviewImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);
  const abortControllers = useRef<Map<string, AbortController>>(new Map());

  // 初期画像の設定
  useEffect(() => {
    if (initialImages.length > 0) {
      const previews: PreviewImage[] = initialImages.map((image, index) => ({
        ...image,
        id: `initial-${index}`,
        uploading: false,
        progress: 100,
      }));
      setPreviewImages(previews);
    }
  }, [initialImages]);

  // メモリリークの防止
  useEffect(() => {
    const controllers = abortControllers.current;
    return () => {
      // アップロード中のリクエストをキャンセル
      controllers.forEach((controller) => {
        controller.abort();
      });
    };
  }, []);

  /**
   * ファイル選択ハンドラー
   */
  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0 || disabled) return;

      const fileArray = Array.from(files);
      const currentCount = previewImages.filter((img) => !img.error).length;
      const availableSlots = maxImages - currentCount;

      if (availableSlots <= 0) {
        setError(`最大${maxImages}枚まで画像をアップロードできます`);
        return;
      }

      const filesToUpload = fileArray.slice(0, availableSlots);
      setError(null);

      // 並列アップロード処理
      const uploadPromises = filesToUpload.map(async (file, index) => {
        const id = `${Date.now()}-${Math.random()}`;
        
        // ファイル検証
        const validation = presignedUploadService.validateFile(file);
        if (!validation.valid) {
          setError(validation.error || 'ファイル検証エラー');
          return null;
        }

        // プレビュー追加
        const preview: PreviewImage = {
          id,
          file,
          url: URL.createObjectURL(file),
          path: '',
          size: file.size,
          type: file.type,
          uploading: true,
          progress: 0,
          order: currentCount + index,
          is_main: currentCount === 0 && index === 0,
        };

        setPreviewImages((prev) => [...prev, preview]);

        // アップロード実行
        const controller = new AbortController();
        abortControllers.current.set(id, controller);

        try {
          const uploadedImage = await presignedUploadService.uploadImage(file, {
            signal: controller.signal,
            onProgress: (progress) => {
              setPreviewImages((prev) =>
                prev.map((img) => 
                  img.id === id ? { ...img, progress } : img
                )
              );
            },
          });

          // プレビューURLを解放
          URL.revokeObjectURL(preview.url);

          // アップロード成功
          setPreviewImages((prev) =>
            prev.map((img) =>
              img.id === id
                ? {
                    ...img,
                    ...uploadedImage,
                    uploading: false,
                    progress: 100,
                  }
                : img
            )
          );

          return uploadedImage;
        } catch (error) {
          // エラー処理
          setPreviewImages((prev) =>
            prev.map((img) =>
              img.id === id
                ? {
                    ...img,
                    uploading: false,
                    error: error instanceof Error ? error.message : 'アップロードエラー',
                  }
                : img
            )
          );
          return null;
        } finally {
          abortControllers.current.delete(id);
        }
      });

      // アップロード完了を待って親コンポーネントに通知
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter((r): r is UploadedImage => r !== null);
      
      if (successfulUploads.length > 0) {
        const allImages = previewImages
          .filter((img) => !img.error && !img.uploading)
          .concat(successfulUploads);
        onImagesChange(allImages);
      }
    },
    [previewImages, maxImages, disabled, onImagesChange]
  );

  /**
   * 画像削除
   */
  const handleRemoveImage = useCallback(
    async (imageId: string) => {
      const imageToRemove = previewImages.find((img) => img.id === imageId);
      if (!imageToRemove) return;

      // アップロード中の場合はキャンセル
      if (imageToRemove.uploading) {
        const controller = abortControllers.current.get(imageId);
        controller?.abort();
      }

      // サーバーから削除
      if (!imageToRemove.uploading && imageToRemove.path) {
        try {
          await presignedUploadService.deleteImage(imageToRemove.path);
        } catch (error) {
          console.error('Failed to delete:', error);
        }
      }

      // リストから削除
      const newImages = previewImages.filter((img) => img.id !== imageId);
      
      // メイン画像の再設定
      if (imageToRemove.is_main && newImages.length > 0) {
        newImages[0].is_main = true;
      }
      
      // 順序の再設定
      newImages.forEach((img, index) => {
        img.order = index;
      });

      setPreviewImages(newImages);
      onImagesChange(newImages.filter((img) => !img.error && !img.uploading));
    },
    [previewImages, onImagesChange]
  );

  /**
   * メイン画像設定
   */
  const handleSetMainImage = useCallback(
    (imageId: string) => {
      const newImages = previewImages.map((img) => ({
        ...img,
        is_main: img.id === imageId,
      }));
      setPreviewImages(newImages);
      onImagesChange(newImages.filter((img) => !img.error && !img.uploading));
    },
    [previewImages, onImagesChange]
  );

  /**
   * 画像の順序変更
   */
  const handleReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      const newImages = [...previewImages];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      
      // 順序の再設定
      newImages.forEach((img, index) => {
        img.order = index;
      });

      setPreviewImages(newImages);
      onImagesChange(newImages.filter((img) => !img.error && !img.uploading));
    },
    [previewImages, onImagesChange]
  );

  // ドラッグ&ドロップハンドラー
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      if (!disabled) {
        void handleFileSelect(e.dataTransfer.files);
      }
    },
    [disabled, handleFileSelect]
  );

  const canAddMore = previewImages.filter((img) => !img.error).length < maxImages;

  return (
    <div className={`advanced-image-uploader ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      )}

      {/* エラーメッセージ */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* 画像プレビューグリッド */}
      {previewImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
          {previewImages.map((image, index) => (
            <div key={image.id} className="relative group rounded-lg overflow-hidden bg-gray-100">
              <div className="aspect-square">
                <img
                  src={image.url}
                  alt="Preview"
                  className={`w-full h-full object-cover ${
                    image.is_main ? 'ring-2 ring-blue-500' : ''
                  }`}
                />
              </div>

              {/* メインバッジ */}
              {image.is_main && (
                <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  メイン
                </span>
              )}

              {/* アップロード中オーバーレイ */}
              {image.uploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="mb-2">
                      <div className="w-16 h-16 mx-auto border-4 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                    <span className="text-sm">{image.progress}%</span>
                  </div>
                </div>
              )}

              {/* エラー表示 */}
              {image.error && (
                <div className="absolute inset-0 bg-red-500 bg-opacity-75 flex items-center justify-center p-2">
                  <div className="text-white text-center">
                    <AlertCircle className="w-8 h-8 mx-auto mb-1" />
                    <span className="text-xs">{image.error}</span>
                  </div>
                </div>
              )}

              {/* 操作ボタン */}
              {!image.uploading && !disabled && (
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {/* 順序変更 */}
                  {index > 0 && (
                    <button
                      onClick={() => void handleReorder(index, index - 1)}
                      className="p-1.5 bg-white rounded-full hover:bg-gray-100"
                      type="button"
                      aria-label="左へ移動"
                    >
                      ←
                    </button>
                  )}

                  {/* メインに設定 */}
                  {!image.is_main && !image.error && (
                    <button
                      onClick={() => handleSetMainImage(image.id)}
                      className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                      type="button"
                    >
                      メイン
                    </button>
                  )}

                  {/* 削除 */}
                  <button
                    onClick={() => void handleRemoveImage(image.id)}
                    className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                    type="button"
                    aria-label="削除"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* 順序変更 */}
                  {index < previewImages.length - 1 && (
                    <button
                      onClick={() => void handleReorder(index, index + 1)}
                      className="p-1.5 bg-white rounded-full hover:bg-gray-100"
                      type="button"
                      aria-label="右へ移動"
                    >
                      →
                    </button>
                  )}
                </div>
              )}

              {/* プログレスバー */}
              {image.uploading && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${image.progress}%` }}
                  />
                </div>
              )}
            </div>
          ))}

          {/* 追加ボタン */}
          {canAddMore && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className={`
                aspect-square border-2 border-dashed border-gray-300 rounded-lg
                flex flex-col items-center justify-center transition-colors
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 cursor-pointer'}
              `}
              type="button"
            >
              <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-xs text-gray-500">追加</span>
            </button>
          )}
        </div>
      )}

      {/* ドロップゾーン（画像がない場合） */}
      {previewImages.length === 0 && canAddMore && (
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              fileInputRef.current?.click();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="画像をアップロード"
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-2">画像をドラッグ&ドロップまたはクリックして選択</p>
          <p className="text-sm text-gray-500">
            {maxImages > 1 ? `最大${maxImages}枚まで` : '1枚のみ'}
            ・JPEG, PNG, GIF, WebP対応・最大10MB
          </p>
        </div>
      )}

      {/* ファイル入力（非表示） */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={maxImages > 1}
        onChange={(e) => void handleFileSelect(e.target.files)}
        disabled={disabled}
        className="hidden"
      />
    </div>
  );
};
