/**
 * 画像ギャラリーコンポーネント
 * 複数画像のスライド表示、サムネイル切り替え、拡大表示機能を提供
 */

import { ChevronLeft, ChevronRight, X, Expand } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';

import { replacePlaceholderImages } from '@/utils/sampleImages';

interface ImageGalleryProps {
  images: string[];
  title?: string;
  className?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  title = 'Image',
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // 画像が存在しない場合のフォールバック
  const processedImages = replacePlaceholderImages(images);
  const displayImages =
    processedImages.length > 0
      ? processedImages
      : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop'];

  // 次の画像へ
  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % displayImages.length);
  }, [displayImages.length]);

  // 前の画像へ
  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  }, [displayImages.length]);

  // サムネイルクリック時
  const handleThumbnailClick = (index: number): void => {
    setCurrentIndex(index);
  };

  // モーダルの開閉
  const openModal = (): void => setIsModalOpen(true);
  const closeModal = (): void => setIsModalOpen(false);

  // キーボードナビゲーション
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (!isModalOpen) {return;}

      if (e.key === 'ArrowLeft') {prevImage();}
      if (e.key === 'ArrowRight') {nextImage();}
      if (e.key === 'Escape') {closeModal();}
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, nextImage, prevImage]);

  // タッチ操作のハンドリング
  const handleTouchStart = (e: React.TouchEvent): void => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent): void => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (): void => {
    if (!touchStart || !touchEnd) {return;}

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && displayImages.length > 1) {
      nextImage();
    }
    if (isRightSwipe && displayImages.length > 1) {
      prevImage();
    }
  };

  return (
    <>
      <div className={`relative ${className}`}>
        {/* メイン画像 */}
        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
          <img
            src={displayImages[currentIndex]}
            alt={`${title} - ${currentIndex + 1}`}
            className="w-full h-full object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src =
                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop';
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />

          {/* 画像カウンター */}
          {displayImages.length > 1 && (
            <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {displayImages.length}
            </div>
          )}

          {/* 拡大ボタン */}
          <button
            onClick={openModal}
            className="absolute top-4 left-4 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="画像を拡大"
          >
            <Expand size={20} />
          </button>

          {/* ナビゲーションボタン */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="前の画像"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="次の画像"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>

        {/* サムネイル */}
        {displayImages.length > 1 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {displayImages.map((image, index) => (
              <button
                key={`thumb-${image}`}
                onClick={() => handleThumbnailClick(index)}
                className={`
                  flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all
                  ${
                    index === currentIndex
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-400'
                  }
                `}
                aria-label={`画像 ${index + 1}を表示`}
              >
                <img
                  src={image}
                  alt={`${title} サムネイル ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop';
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 拡大モーダル */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closeModal}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              closeModal();
            }
          }}
          role="presentation"
        >
          {/* クローズボタン */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="閉じる"
          >
            <X size={28} />
          </button>

          {/* 画像カウンター（モーダル） */}
          {displayImages.length > 1 && (
            <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full">
              {currentIndex + 1} / {displayImages.length}
            </div>
          )}

          {/* ナビゲーションボタン（モーダル） */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-3 hover:bg-white/20 rounded-full transition-colors"
                aria-label="前の画像"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-3 hover:bg-white/20 rounded-full transition-colors"
                aria-label="次の画像"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}

          {/* モーダル内画像 */}
          <button
            className="max-w-full max-h-full bg-transparent border-0 p-0 cursor-default"
            onClick={(e) => e.stopPropagation()}
            aria-label="画像表示エリア"
          >
            <img
              src={displayImages[currentIndex]}
              alt={`${title} - ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src =
                  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop';
              }}
            />
          </button>

          {/* サムネイル（モーダル） */}
          {displayImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/60 p-2 rounded-lg">
              {displayImages.map((image, index) => (
                <button
                  key={`modal-thumb-${image}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleThumbnailClick(index);
                  }}
                  className={`
                    w-12 h-12 rounded overflow-hidden border-2 transition-all
                    ${
                      index === currentIndex
                        ? 'border-white'
                        : 'border-gray-600 hover:border-gray-400'
                    }
                  `}
                  aria-label={`画像 ${index + 1}を表示`}
                >
                  <img
                    src={image}
                    alt={`サムネイル ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src =
                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=48&h=48&fit=crop';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ImageGallery;
