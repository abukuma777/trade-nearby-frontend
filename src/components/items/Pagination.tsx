/**
 * ページネーションコンポーネント
 */

import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  loading = false,
}) => {
  // ページ番号の配列を生成
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 7;
    const halfRange = Math.floor(maxPagesToShow / 2);

    if (totalPages <= maxPagesToShow) {
      // 全ページを表示
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 省略記号を含むページ番号を生成
      if (currentPage <= halfRange + 1) {
        // 開始位置に近い場合
        for (let i = 1; i <= maxPagesToShow - 2; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - halfRange) {
        // 終了位置に近い場合
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - maxPagesToShow + 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // 中間位置の場合
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // 表示範囲の計算
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // ページが1つしかない場合は表示しない
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 mt-8">
      {/* アイテム数の表示 */}
      <div className="text-sm text-gray-600">
        {totalItems}件中 {startItem}-{endItem}件を表示
      </div>

      {/* ページネーションボタン */}
      <nav className="flex items-center space-x-1">
        {/* 前へボタン */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentPage === 1 || loading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
          }`}
          aria-label="前のページ"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* ページ番号 */}
        <div className="hidden sm:flex items-center space-x-1">
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              // 省略記号の位置を判定（前半か後半か）
              const ellipsisPosition = index < getPageNumbers().length / 2 ? 'start' : 'end';
              return (
                <span key={`ellipsis-${ellipsisPosition}`} className="px-3 py-2 text-sm text-gray-400">
                  ...
                </span>
              );
            }

            const pageNumber = page as number;
            return (
              <button
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                disabled={loading}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === pageNumber
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                } ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
                aria-label={`ページ ${pageNumber}`}
                aria-current={currentPage === pageNumber ? 'page' : undefined}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>

        {/* モバイル用：現在のページ表示 */}
        <div className="sm:hidden px-3 py-2 text-sm text-gray-700">
          {currentPage} / {totalPages}
        </div>

        {/* 次へボタン */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentPage === totalPages || loading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
          }`}
          aria-label="次のページ"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </nav>

      {/* ページジャンプ（オプション） */}
      <div className="hidden lg:flex items-center space-x-2">
        <span className="text-sm text-gray-600">ページ:</span>
        <select
          value={currentPage}
          onChange={(e) => onPageChange(Number(e.target.value))}
          disabled={loading}
          className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <option key={`page-option-${page}`} value={page}>
              {page}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Pagination;
