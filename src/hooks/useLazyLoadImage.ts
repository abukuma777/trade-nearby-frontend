/**
 * 画像の遅延読み込み用カスタムフック
 */

import { useEffect, useRef, useState } from 'react';

interface UseLazyLoadImageOptions {
  threshold?: number; // 画像が表示される何px前から読み込みを開始するか
  rootMargin?: string; // Intersection Observerのマージン
}

/**
 * 画像の遅延読み込みを実装するカスタムフック
 * @param src 画像のURL
 * @param options オプション設定
 */
export const useLazyLoadImage = (
  src: string | null | undefined,
  options: UseLazyLoadImageOptions = {},
): {
  imgRef: React.RefObject<HTMLDivElement>;
  imageSrc: string | null;
  isLoading: boolean;
  isError: boolean;
} => {
  const { threshold = 0.1, rootMargin = '50px' } = options;

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!src || !imgRef.current) {return;}

    // refの値をローカル変数にキャプチャ
    const element = imgRef.current;

    // Intersection Observerがサポートされていない場合は即座に画像を読み込む
    if (!('IntersectionObserver' in window)) {
      setImageSrc(src);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 画像を読み込む
            const img = new Image();
            img.src = src;

            img.onload = () => {
              setImageSrc(src);
              setIsLoading(false);
              setIsError(false);
            };

            img.onerror = () => {
              setIsError(true);
              setIsLoading(false);
            };

            // 一度読み込んだら監視を停止
            if (element) {
              observer.unobserve(element);
            }
          }
        });
      },
      {
        threshold,
        rootMargin,
      },
    );

    // 監視開始
    observer.observe(element);

    // クリーンアップ
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [src, threshold, rootMargin]);

  return {
    imgRef,
    imageSrc,
    isLoading,
    isError,
  };
};

/**
 * 複数画像の遅延読み込みを管理するカスタムフック
 */
export const useLazyLoadImages = (): {
  isImageLoaded: (src: string) => boolean;
  markImageAsLoaded: (src: string) => void;
} => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const isImageLoaded = (src: string): boolean => loadedImages.has(src);

  const markImageAsLoaded = (src: string): void => {
    setLoadedImages((prev) => new Set(prev).add(src));
  };

  return {
    isImageLoaded,
    markImageAsLoaded,
  };
};
