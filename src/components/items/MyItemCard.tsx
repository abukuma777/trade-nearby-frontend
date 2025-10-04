/**
 * マイアイテムカードコンポーネント（修正版）
 * - visibility フィールドを使用するように修正
 */

import { Edit2, Trash2, EyeOff, Eye } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

import { Item, categoryLabels, conditionLabels } from '@/types/item';
import { replacePlaceholderImages } from '@/utils/sampleImages';

interface MyItemCardProps {
  item: Item;
  onEdit: (itemId: string) => void;
  onDelete: (itemId: string) => void;
  onToggleVisibility?: (itemId: string) => void;
  onClick?: (item: Item) => void;
}

const MyItemCard: React.FC<MyItemCardProps> = ({
  item,
  onEdit,
  onDelete,
  onToggleVisibility,
  onClick,
}) => {
  // デフォルト画像とサンプル画像の処理
  const defaultImage =
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop';
  const processedImages = replacePlaceholderImages(item.images);
  const imageUrl = processedImages[0] || defaultImage;

  // 日付フォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP');
  };

  // カード全体のクリックハンドラー
  const handleClick = (e: React.MouseEvent) => {
    // Link、編集、削除ボタンのクリックは除外
    if ((e.target as HTMLElement).closest('a') || (e.target as HTMLElement).closest('button')) {
      return;
    }
    if (onClick) {
      onClick(item);
    }
  };

  // ステータスに応じた背景色とラベル
  const getStatusStyle = () => {
    // まずvisibilityをチェック
    if (item.visibility === 'private') {
      return {
        badge: 'bg-purple-100 text-purple-800',
        label: '非公開',
        cardOpacity: 'opacity-60',
      };
    }

    switch (item.status) {
      case 'active':
        return {
          badge: 'bg-green-100 text-green-800',
          label: '出品中',
          cardOpacity: '',
        };
      case 'reserved':
        return {
          badge: 'bg-yellow-100 text-yellow-800',
          label: '取引中',
          cardOpacity: 'opacity-90',
        };
      case 'traded':
        return {
          badge: 'bg-gray-100 text-gray-800',
          label: '交換済み',
          cardOpacity: 'opacity-75',
        };
      default:
        return {
          badge: 'bg-gray-100 text-gray-800',
          label: item.status,
          cardOpacity: '',
        };
    }
  };

  const statusStyle = getStatusStyle();

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 ${statusStyle.cardOpacity}`}
      onClick={handleClick}
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

        {/* ステータスバッジ（右上） */}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyle.badge}`}>
            {statusStyle.label}
          </span>
        </div>

        {/* カテゴリーバッジ（左下） */}
        <div className="absolute bottom-2 left-2">
          <span className="px-2 py-1 text-xs font-semibold bg-blue-600 text-white rounded-full">
            {categoryLabels[item.category]}
          </span>
        </div>
      </div>

      {/* コンテンツ部分 */}
      <div className="p-4">
        {/* タイトル */}
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
          <Link to={`/items/${item.id}`} className="hover:text-blue-600">
            {item.title}
          </Link>
        </h3>

        {/* 説明 */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{item.description}</p>

        {/* メタ情報 */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>状態: {conditionLabels[item.condition]}</span>
          <span>{formatDate(item.created_at)}</span>
        </div>

        {/* タグ */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full"
              >
                #{tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full">
                +{item.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex space-x-2 pt-3 border-t border-gray-200">
          {item.status === 'traded' ? (
            // 交換済みの場合は非公開ボタンのみ
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleVisibility) {onToggleVisibility(item.id);}
              }}
              className="w-full flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded hover:bg-purple-700 transition-colors"
            >
              <EyeOff size={14} />
              <span>非公開にする</span>
            </button>
          ) : item.visibility === 'private' ? (
            // 非公開の場合は公開ボタン
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleVisibility) {onToggleVisibility(item.id);}
              }}
              className="w-full flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors"
            >
              <Eye size={14} />
              <span>公開する</span>
            </button>
          ) : (
            // 通常の編集・削除ボタン
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item.id);
                }}
                className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-1.5 text-sm font-medium rounded transition-colors bg-blue-600 text-white hover:bg-blue-700"
                disabled={false}
              >
                <Edit2 size={14} />
                <span>編集</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                className={`flex-1 flex items-center justify-center space-x-1.5 px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                  item.status === 'reserved'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
                disabled={item.status === 'reserved'}
              >
                <Trash2 size={14} />
                <span>削除</span>
              </button>
            </>
          )}
        </div>

        {/* ステータスに応じた注意書き */}
        {item.status === 'reserved' && (
          <p className="mt-2 text-xs text-yellow-700 bg-yellow-50 rounded px-2 py-1">
            ※ 取引中のアイテムは削除できません
          </p>
        )}
        {item.status === 'traded' && (
          <p className="mt-2 text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
            ※ 交換済みアイテムは編集・削除できません
          </p>
        )}
        {item.visibility === 'private' && (
          <p className="mt-2 text-xs text-purple-700 bg-purple-50 rounded px-2 py-1">
            ※ このアイテムは非公開です
          </p>
        )}
      </div>
    </div>
  );
};

export default MyItemCard;
