/**
 * 遅延読み込み対応の画像コンポーネント
 */

import { Image as ImageIcon, Loader } from 'lucide-react';
import React from 'react';

import { useLazyLoadImage } from '@/hooks/useLazyLoadImage';

interface LazyLoadImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  onError?: () => void;
  onClick?: () => void;
}

const LazyLoadImage: React.FC<LazyLoadImageProps> = ({
  src,
  alt,
  className = '',
  fallbackClassName = '',
  onError,
  onClick,
}) => {
  const { imgRef, imageSrc, isLoading, isError } = useLazyLoadImage(src, {
    rootMargin: '100px', // 画像が表示される100px前から読み込み開始
    threshold: 0.01,
  });

  return (
    <div 
      ref={imgRef} 
      className="relative w-full h-full" 
      onClick={onClick}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* ローディング中のプレースホルダー */}
      {isLoading && !imageSrc && (
        <div
          className={`absolute inset-0 flex items-center justify-center bg-gray-100 ${fallbackClassName}`}
        >
          <Loader className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
      )}

      {/* エラー時のフォールバック */}
      {isError && (
        <div
          className={`flex items-center justify-center w-full h-full bg-gray-100 ${fallbackClassName}`}
        >
          <ImageIcon className="w-12 h-12 text-gray-400" />
        </div>
      )}

      {/* 画像本体 */}
      {imageSrc && !isError && (
        <img
          src={imageSrc}
          alt={alt}
          className={className}
          loading="lazy" // ネイティブのlazy loadingも併用
          decoding="async" // 非同期デコーディングでパフォーマンス向上
          onError={() => {
            onError?.();
          }}
        />
      )}

      {/* 画像なしの場合 */}
      {!src && (
        <div
          className={`flex items-center justify-center w-full h-full bg-gray-100 ${fallbackClassName}`}
        >
          <ImageIcon className="w-12 h-12 text-gray-400" />
        </div>
      )}
    </div>
  );
};

export default LazyLoadImage;

/**
 * サムネイル用のLazyLoadImageコンポーネント
 */
export const ThumbnailLazyImage: React.FC<{
  src: string | null | undefined;
  alt: string;
  status?: string;
  onClick?: () => void;
}> = ({ src, alt, status, onClick }) => {
  // ステータスに応じたバッジの取得
  const getStatusBadge = (): JSX.Element | null => {
    switch (status) {
      case 'active':
        return (
          <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-md z-10">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            出品中
          </span>
        );
      case 'trading':
        return (
          <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-md z-10">
            <span className="w-2 h-2 bg-white rounded-full" />
            取引中
          </span>
        );
      case 'completed':
        return (
          <span className="absolute top-2 left-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-md z-10">
            ✓ 完了
          </span>
        );
      case 'cancelled':
        return (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow-md z-10">
            キャンセル
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className="relative group cursor-pointer" 
      onClick={onClick}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100 border border-gray-200 hover:border-blue-400 transition-all duration-200 hover:shadow-lg">
        <LazyLoadImage
          src={src}
          alt={alt}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          fallbackClassName="rounded-lg"
        />

        {/* ステータスバッジ */}
        {status && getStatusBadge()}

        {/* ホバー時のオーバーレイ */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 pointer-events-none" />
      </div>
    </div>
  );
};
