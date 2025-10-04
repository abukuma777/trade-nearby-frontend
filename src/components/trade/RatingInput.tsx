/**
 * 評価入力コンポーネント
 * ユーザーが評価を入力するための星選択UI
 */

import { Star } from 'lucide-react';
import React, { useState } from 'react';

interface RatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  required?: boolean;
}

const RatingInput: React.FC<RatingInputProps> = ({
  value,
  onChange,
  maxRating = 5,
  size = 'md',
  disabled = false,
  required = false,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // サイズに応じたクラス
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const handleClick = (rating: number) => {
    if (!disabled) {
      // 同じ評価をクリックした場合は0にリセット（required=falseの場合のみ）
      if (value === rating && !required) {
        onChange(0);
      } else {
        onChange(rating);
      }
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!disabled) {
      setHoverRating(rating);
    }
  };

  const handleMouseLeave = () => {
    setHoverRating(null);
  };

  const displayRating = hoverRating !== null ? hoverRating : value;

  return (
    <div className="flex items-center gap-1">
      {[...Array(maxRating)].map((_, index) => {
        const rating = index + 1;
        const isFilled = rating <= displayRating;
        const isHovered = hoverRating !== null && rating <= hoverRating;

        return (
          <button
            key={index}
            type="button"
            className={`transition-all ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'}`}
            onClick={() => handleClick(rating)}
            onMouseEnter={() => handleMouseEnter(rating)}
            onMouseLeave={handleMouseLeave}
            disabled={disabled}
            aria-label={`${rating}星`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                isFilled || isHovered
                  ? 'text-yellow-500 fill-yellow-500'
                  : 'text-gray-300 fill-gray-300'
              } ${disabled ? 'opacity-50' : ''}`}
            />
          </button>
        );
      })}

      {/* 評価テキスト */}
      <span className="ml-2 text-sm text-gray-600">
        {value > 0 ? `${value}/${maxRating}` : '未評価'}
      </span>
    </div>
  );
};

export default RatingInput;
