/**
 * アイテムカードコンポーネント
 * グリッド表示用の個別アイテム表示
 */

import React from 'react';
import { Link } from 'react-router-dom';

import { Item, categoryLabels, conditionLabels } from '@/types/item';
import { replacePlaceholderImages } from '@/utils/sampleImages';

interface ItemCardProps {
  item: Item;
  onClick?: (item: Item) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onClick }) => {
  // デフォルト画像とサンプル画像の処理
  const defaultImage =
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop';
  const processedImages = replacePlaceholderImages(item.images);
  const imageUrl = processedImages[0] || defaultImage;

  // 日付フォーマット
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP');
  };

  // カード全体のクリックハンドラー
  const handleClick = (e: React.MouseEvent): void => {
    // Linkタグ内でのクリックは除外
    if ((e.target as HTMLElement).closest('a')) {
      return;
    }
    if (onClick) {
      onClick(item);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 ${
        item.status !== 'active' ? 'opacity-75' : ''
      } ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick ? handleClick : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const mockEvent = {
                  target: e.target,
                  currentTarget: e.currentTarget,
                  preventDefault: () => e.preventDefault(),
                  stopPropagation: () => e.stopPropagation(),
                } as unknown as React.MouseEvent;
                handleClick(mockEvent);
              }
            }
          : undefined
      }
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* 画像部分 */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Link to={`/items/${item.id}`}>
          <img
            src={imageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = defaultImage;
            }}
          />
        </Link>

        {/* ステータスバッジ */}
        {item.status !== 'active' && (
          <div className="absolute top-2 right-2">
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                item.status === 'traded' ? 'bg-gray-600 text-white' : 'bg-yellow-500 text-white'
              }`}
            >
              {item.status === 'traded' ? '交換済み' : '取引中'}
            </span>
          </div>
        )}

        {/* カテゴリーバッジ */}
        <div className="absolute bottom-2 left-2">
          <span className="px-2 py-1 text-xs font-semibold bg-blue-600 text-white rounded-full">
            {categoryLabels[item.category]}
          </span>
        </div>
      </div>

      {/* 情報部分 */}
      <div className="p-4">
        {/* タイトル */}
        <Link to={`/items/${item.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600">
            {item.title}
          </h3>
        </Link>

        {/* 説明文 */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>

        {/* タグ */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.slice(0, 3).map((tag) => (
              <span key={`tag-${tag}`} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                #{tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="px-2 py-1 text-xs text-gray-500">+{item.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* メタ情報 */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            {/* コンディション */}
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {conditionLabels[item.condition]}
            </span>

            {/* 場所 */}
            {item.location && (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {item.location.city || item.location.prefecture}
              </span>
            )}
          </div>

          {/* 投稿日時 */}
          <span>{formatDate(item.created_at)}</span>
        </div>

        {/* ユーザー情報 */}
        {item.user && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <Link
              to={`/users/${item.user.id}`}
              className="flex items-center space-x-2 hover:opacity-80"
            >
              <img
                src={item.user.avatar || 'https://via.placeholder.com/40x40?text=User'}
                alt={item.user.username}
                className="w-6 h-6 rounded-full"
              />
              <span className="text-sm text-gray-700">{item.user.username}</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemCard;
