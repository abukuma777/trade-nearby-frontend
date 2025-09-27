/**
 * アイテム検索・フィルターコンポーネント
 */

import React, { useState, useEffect } from 'react';
import {
  ItemsQueryParams,
  ItemCategory,
  ItemStatus,
  categoryLabels,
  statusLabels,
} from '@/types/item';

interface ItemFilterProps {
  onFilterChange: (filters: ItemsQueryParams) => void;
  initialFilters?: ItemsQueryParams;
  loading?: boolean;
}

const ItemFilter: React.FC<ItemFilterProps> = ({
  onFilterChange,
  initialFilters = {},
  loading = false,
}) => {
  const [filters, setFilters] = useState<ItemsQueryParams>(initialFilters);
  const [searchText, setSearchText] = useState(initialFilters.search || '');
  const [isExpanded, setIsExpanded] = useState(false);

  // カテゴリーオプション
  const categories: (ItemCategory | 'all')[] = [
    'all',
    'anime',
    'manga',
    'game',
    'idol',
    'sports',
    'other',
  ];

  // ステータスオプション
  const statuses: (ItemStatus | 'all')[] = ['all', 'active', 'traded', 'reserved'];

  // ソートオプション
  const sortOptions = [
    { value: '-created_at', label: '新しい順' },
    { value: 'created_at', label: '古い順' },
    { value: 'distance', label: '近い順' },
  ];

  // フィルター変更時の処理
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchText !== filters.search) {
        const newFilters = { ...filters, search: searchText || undefined };
        setFilters(newFilters);
        onFilterChange(newFilters);
      }
    }, 500); // デバウンス処理

    return () => clearTimeout(timeoutId);
  }, [searchText]);

  // カテゴリー変更
  const handleCategoryChange = (category: ItemCategory | 'all') => {
    const newFilters = {
      ...filters,
      category: category === 'all' ? undefined : category,
      page: 1, // ページをリセット
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // ステータス変更
  const handleStatusChange = (status: ItemStatus | 'all') => {
    const newFilters = {
      ...filters,
      status: status === 'all' ? undefined : status,
      page: 1,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // ソート変更
  const handleSortChange = (sort: string) => {
    const newFilters = {
      ...filters,
      sort: sort as ItemsQueryParams['sort'],
      page: 1,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // フィルターリセット
  const handleReset = () => {
    setSearchText('');
    setFilters({});
    onFilterChange({});
  };

  // アクティブなフィルター数を計算
  const activeFilterCount = Object.keys(filters).filter(
    (key) =>
      key !== 'page' && key !== 'limit' && filters[key as keyof ItemsQueryParams] !== undefined,
  ).length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      {/* 検索バー */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="グッズを検索..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
          <span>フィルター</span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* 詳細フィルター */}
      {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          {/* カテゴリー */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリー</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  disabled={loading}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50 ${
                    (category === 'all' && !filters.category) || filters.category === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category === 'all' ? 'すべて' : categoryLabels[category]}
                </button>
              ))}
            </div>
          </div>

          {/* ステータス */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ステータス</label>
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={loading}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50 ${
                    (status === 'all' && !filters.status) || filters.status === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'すべて' : statusLabels[status]}
                </button>
              ))}
            </div>
          </div>

          {/* ソート */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">並び順</label>
            <select
              value={filters.sort || '-created_at'}
              onChange={(e) => handleSortChange(e.target.value)}
              disabled={loading}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* リセットボタン */}
          {activeFilterCount > 0 && (
            <div className="flex justify-end">
              <button
                onClick={handleReset}
                disabled={loading}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
              >
                フィルターをリセット
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ItemFilter;
