/**
 * 評価表示コンポーネント
 * ユーザーの評価を星で表示
 */

import React from 'react';
import { Star } from 'lucide-react';

interface RatingDisplayProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  count?: number;
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  showNumber = false,
  count,
}) => {
  // サイズに応じたクラス
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  // 評価値を0-maxRatingの範囲に制限
  const clampedRating = Math.max(0, Math.min(rating, maxRating));

  return (
    <div className="flex items-center gap-1">
      {/* 星の表示 */}
      <div className="flex items-center">
        {[...Array(maxRating)].map((_, index) => {
          const fillPercentage = Math.max(0, Math.min(1, clampedRating - index));

          return (
            <div key={index} className="relative">
              {/* 背景の星（グレー） */}
              <Star className={`${sizeClasses[size]} text-gray-300 fill-gray-300`} />
              {/* 前景の星（黄色） */}
              {fillPercentage > 0 && (
                <div
                  className="absolute top-0 left-0 overflow-hidden"
                  style={{ width: `${fillPercentage * 100}%` }}
                >
                  <Star className={`${sizeClasses[size]} text-yellow-500 fill-yellow-500`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 数値表示 */}
      {showNumber && (
        <span className={`${textSizeClasses[size]} text-gray-700 font-medium ml-1`}>
          {rating.toFixed(1)}
        </span>
      )}

      {/* 評価件数 */}
      {count !== undefined && count > 0 && (
        <span className={`${textSizeClasses[size]} text-gray-500 ml-1`}>({count}件)</span>
      )}
    </div>
  );
};

export default RatingDisplay;
