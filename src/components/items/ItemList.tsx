/**
 * アイテムリストコンポーネント
 * アイテムカードのグリッド表示を管理
 */

import React from 'react';

import ItemCard from './ItemCard';

import { Item } from '@/types/item';

interface ItemListProps {
  items: Item[];
  loading?: boolean;
  error?: Error | null;
  onItemClick?: (item: Item) => void;
  emptyMessage?: string;
  columns?: 2 | 3 | 4; // グリッドの列数
}

const ItemList: React.FC<ItemListProps> = ({
  items,
  loading = false,
  error = null,
  onItemClick,
  emptyMessage = 'アイテムが見つかりませんでした',
  columns = 3,
}) => {
  // グリッドの列数に応じたクラス名を取得
  const getGridClassName = () => {
    switch (columns) {
      case 2:
        return 'grid-cols-1 sm:grid-cols-2';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    }
  };

  // ローディング表示
  if (loading) {
    return (
      <div className={`grid ${getGridClassName()} gap-4 sm:gap-6`}>
        {/* スケルトンローダー */}
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="aspect-square bg-gray-300" />
            <div className="p-4">
              <div className="h-6 bg-gray-300 rounded mb-2" />
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="flex space-x-2">
                <div className="h-6 bg-gray-200 rounded w-16" />
                <div className="h-6 bg-gray-200 rounded w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // エラー表示
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 text-red-600 rounded-full mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">エラーが発生しました</h3>
        <p className="text-gray-600 mb-4">{error.message || 'データの読み込みに失敗しました'}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          ページを再読み込み
        </button>
      </div>
    );
  }

  // アイテムが空の場合
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 text-gray-400 rounded-full mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{emptyMessage}</h3>
        <p className="text-gray-600">条件を変更して再度検索してください</p>
      </div>
    );
  }

  // 通常の表示
  return (
    <div className={`grid ${getGridClassName()} gap-4 sm:gap-6`}>
      {items.map((item) => (
        <ItemCard key={item.id} item={item} onClick={onItemClick} />
      ))}
    </div>
  );
};

export default ItemList;
