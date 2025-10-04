/**
 * ImageUploaderコンポーネント
 * 画像のアップロード、プレビュー、削除機能を提供
 */

import { X, Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';
import React, { useState, useRef, useCallback, useEffect } from 'react';

import { uploadService, UploadedImage } from '@/services/uploadService';

// ========== 型定義 ==========

export interface ImageUploaderProps {
  /**
   * 最大アップロード可能画像数（デフォルト: 5）
   */
  maxImages?: number;

  /**
   * 画像変更時のコールバック
   */
  onImagesChange: (images: UploadedImage[]) => void;

  /**
   * 初期画像URL配列
   */
  initialImages?: UploadedImage[];

  /**
   * アップロードタイプ（item: 商品画像, avatar: アバター）
   */
  uploadType?: 'item' | 'avatar';

  /**
   * 無効化フラグ
   */
  disabled?: boolean;

  /**
   * カスタムクラス名
   */
  className?: string;
}

interface PreviewImage {
  id: string;
  file?: File;
  url: string;
  uploaded: boolean;
  uploading: boolean;
  progress: number;
  error?: string;
  uploadedData?: UploadedImage;
}

// ========== コンポーネント ==========

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  maxImages = 5,
  onImagesChange,
  initialImages = [],
  uploadType = 'item',
  disabled = false,
  className = '',
}) => {
  // State管理
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
        id: `initial-${index}`,
        url: image.url,
        uploaded: true,
        uploading: false,
        progress: 100,
        uploadedData: image,
      }));
      setPreviewImages(previews);
    }
  }, [initialImages]);

  // メモリリークの防止
  useEffect(() => {
    return () => {
      // コンポーネントアンマウント時にプレビューURLを解放
      previewImages.forEach((image) => {
        if (image.file && !image.uploaded) {
          uploadService.revokePreviewUrl(image.url);
        }
      });

      // アップロード中のリクエストをキャンセル
      abortControllers.current.forEach((controller) => {
        controller.abort();
      });
    };
  }, []);

  /**
   * ファイル選択ハンドラー
   */
  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) {return;}

      const fileArray = Array.from(files);
      const currentCount = previewImages.filter((img) => img.uploaded || img.uploading).length;
      const availableSlots = maxImages - currentCount;

      if (availableSlots <= 0) {
        setError(`最大${maxImages}枚まで画像をアップロードできます`);
        return;
      }

      const filesToUpload = fileArray.slice(0, availableSlots);

      // ファイル検証
      const validationError = uploadService.validateFiles(filesToUpload, availableSlots);
      if (validationError) {
        setError(validationError);
        return;
      }

      // プレビュー作成とアップロード開始
      const newPreviews: PreviewImage[] = filesToUpload.map((file) => {
        const id = `${Date.now()}-${Math.random()}`;
        return {
          id,
          file,
          url: uploadService.createPreviewUrl(file),
          uploaded: false,
          uploading: true,
          progress: 0,
        };
      });

      setPreviewImages((prev) => [...prev, ...newPreviews]);
      setError(null);

      // 各ファイルをアップロード
      newPreviews.forEach((preview) => {
        uploadImage(preview);
      });
    },
    [previewImages, maxImages],
  );

  /**
   * 画像アップロード処理
   */
  const uploadImage = async (preview: PreviewImage) => {
    if (!preview.file) {return;}

    const controller = new AbortController();
    abortControllers.current.set(preview.id, controller);

    try {
      const uploadedImage = await uploadService.uploadSingleImage(preview.file, {
        type: uploadType,
        signal: controller.signal,
        onProgress: (progress) => {
          setPreviewImages((prev) =>
            prev.map((img) => (img.id === preview.id ? { ...img, progress } : img)),
          );
        },
      });

      // アップロード成功
      setPreviewImages((prev) =>
        prev.map((img) =>
          img.id === preview.id
            ? {
                ...img,
                uploaded: true,
                uploading: false,
                progress: 100,
                uploadedData: uploadedImage,
              }
            : img,
        ),
      );

      // プレビューURLを解放
      if (preview.url && preview.file) {
        uploadService.revokePreviewUrl(preview.url);
      }

      // 親コンポーネントに通知
      notifyImagesChange();
    } catch (error: any) {
      // アップロードエラー
      setPreviewImages((prev) =>
        prev.map((img) =>
          img.id === preview.id
            ? {
                ...img,
                uploading: false,
                error: error.message || 'アップロードに失敗しました',
              }
            : img,
        ),
      );
    } finally {
      abortControllers.current.delete(preview.id);
    }
  };

  /**
   * 画像削除ハンドラー
   */
  const handleRemoveImage = useCallback(
    async (imageId: string) => {
      const imageToRemove = previewImages.find((img) => img.id === imageId);
      if (!imageToRemove) {return;}

      // アップロード中の場合はキャンセル
      if (imageToRemove.uploading) {
        const controller = abortControllers.current.get(imageId);
        controller?.abort();
      }

      // サーバーから削除（アップロード済みの場合）
      if (imageToRemove.uploaded && imageToRemove.uploadedData) {
        try {
          const bucket = uploadType === 'avatar' ? 'user-avatars' : 'item-images';
          const filePath = uploadService.extractFilePathFromUrl(imageToRemove.uploadedData.url);
          await uploadService.deleteImage(bucket, filePath);
        } catch (error) {
          console.error('Failed to delete image from server:', error);
          // エラーが発生しても画像リストからは削除する
        }
      }

      // プレビューURLを解放
      if (!imageToRemove.uploaded && imageToRemove.file) {
        uploadService.revokePreviewUrl(imageToRemove.url);
      }

      // リストから削除
      setPreviewImages((prev) => prev.filter((img) => img.id !== imageId));

      // 親コンポーネントに通知
      notifyImagesChange();
    },
    [previewImages, uploadType],
  );

  /**
   * 親コンポーネントへの変更通知
   */
  const notifyImagesChange = useCallback(() => {
    setTimeout(() => {
      setPreviewImages((currentImages) => {
        const uploadedImages = currentImages
          .filter((img) => img.uploaded && img.uploadedData)
          .map((img) => img.uploadedData!);
        onImagesChange(uploadedImages);
        return currentImages;
      });
    }, 0);
  }, [onImagesChange]);

  /**
   * ドラッグ&ドロップハンドラー
   */
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

      if (disabled) {return;}

      const files = e.dataTransfer.files;
      handleFileSelect(files);
    },
    [disabled, handleFileSelect],
  );

  /**
   * ファイル選択ボタンクリック
   */
  const handleButtonClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  /**
   * ファイル入力変更ハンドラー
   */
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(e.target.files);
      // 同じファイルを再選択できるようにリセット
      e.target.value = '';
    },
    [handleFileSelect],
  );

  // レンダリング
  const hasImages = previewImages.length > 0;
  const canAddMore =
    previewImages.filter((img) => img.uploaded || img.uploading).length < maxImages;

  return (
    <div className={`image-uploader ${className}`}>
      {/* エラーメッセージ */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* ドラッグ&ドロップゾーン */}
      {(!hasImages || canAddMore) && (
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
          onClick={handleButtonClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={maxImages > 1}
            onChange={handleFileInputChange}
            disabled={disabled}
            className="hidden"
          />

          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />

          <p className="text-gray-600 mb-2">画像をドラッグ&ドロップまたはクリックして選択</p>

          <p className="text-sm text-gray-500">
            {maxImages > 1 ? `最大${maxImages}枚まで` : '1枚のみ'}
            ・JPEG, PNG, GIF, WebP対応・最大10MB
          </p>
        </div>
      )}

      {/* プレビューグリッド */}
      {hasImages && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
          {previewImages.map((image) => (
            <div key={image.id} className="relative group rounded-lg overflow-hidden bg-gray-100">
              {/* 画像 */}
              <div className="aspect-square">
                <img
                  src={image.uploadedData?.thumbnail || image.url}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* オーバーレイ */}
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

              {/* 削除ボタン */}
              {!image.uploading && !disabled && (
                <button
                  onClick={() => handleRemoveImage(image.id)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  type="button"
                  aria-label="画像を削除"
                >
                  <X className="w-4 h-4" />
                </button>
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
          {canAddMore && hasImages && (
            <button
              onClick={handleButtonClick}
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
    </div>
  );
};
