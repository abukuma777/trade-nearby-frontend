/**
 * 関連アイテム表示コンポーネント
 * 同カテゴリのアイテムや同じ出品者の他アイテムを表示
 */

import { ChevronLeft, ChevronRight, Package, User, Loader2, AlertCircle } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import ItemCard from '@/components/items/ItemCard';
import { useItems } from '@/hooks/useItems';
import { Item, categoryLabels } from '@/types/item';

interface RelatedItemsProps {
  currentItem: Item;
  className?: string;
}

type TabType = 'category' | 'user';

export const RelatedItems: React.FC<RelatedItemsProps> = ({ currentItem, className = '' }) => {
  const [activeTab, setActiveTab] = useState<TabType>('category');
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 4; // デスクトップでの表示数

  // 同カテゴリのアイテムを取得
  const {
    data: categoryData,
    isLoading: isCategoryLoading,
    error: categoryError,
  } = useItems({
    category: currentItem.category,
    status: 'active',
    limit: 20, // 多めに取得してフィルタリング
  });

  // 同じ出品者のアイテムを取得
  const {
    data: userItemsData,
    isLoading: isUserLoading,
    error: userError,
  } = useItems({
    // user_idでのフィルタリング（APIがサポートしている場合）
    // 注: バックエンドAPIの実装によっては、このパラメータの調整が必要
    limit: 20,
  });

  // 現在のアイテムを除外してフィルタリング
  const categoryItems = categoryData?.items.filter((item) => item.id !== currentItem.id) || [];

  // ユーザーアイテムのフィルタリング（同じuser_idのアイテムのみ）
  const userItems =
    userItemsData?.items.filter(
      (item) => item.user_id === currentItem.user_id && item.id !== currentItem.id,
    ) || [];

  // 現在表示するアイテムを決定
  const currentItems = activeTab === 'category' ? categoryItems : userItems;
  const isLoading = activeTab === 'category' ? isCategoryLoading : isUserLoading;
  const error = activeTab === 'category' ? categoryError : userError;

  // ページネーション計算
  const totalPages = Math.ceil(currentItems.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const displayedItems = currentItems.slice(startIndex, startIndex + itemsPerPage);

  // ページ変更ハンドラー
  const handlePrevPage = (): void => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = (): void => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  // タブ切り替え時にページをリセット
  const handleTabChange = (tab: TabType): void => {
    setActiveTab(tab);
    setCurrentPage(0);
  };

  // アイテムクリックハンドラー
  const handleItemClick = (_item: Item): void => {
    // 新しいタブで開く、または現在のページを更新
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* タブヘッダー */}
      <div className="border-b">
        <div className="flex">
          <button
            onClick={() => handleTabChange('category')}
            className={`
              flex-1 px-6 py-4 text-sm font-medium transition-colors
              flex items-center justify-center gap-2
              ${
                activeTab === 'category'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <Package size={18} />
            同じカテゴリ
            {!isCategoryLoading && categoryItems.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                {categoryItems.length}
              </span>
            )}
          </button>
          <button
            onClick={() => handleTabChange('user')}
            className={`
              flex-1 px-6 py-4 text-sm font-medium transition-colors
              flex items-center justify-center gap-2
              ${
                activeTab === 'user'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <User size={18} />
            同じ出品者
            {!isUserLoading && userItems.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                {userItems.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* コンテンツエリア */}
      <div className="p-6">
        {/* ローディング状態 */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-3" />
            <p className="text-gray-500">読み込み中...</p>
          </div>
        )}

        {/* エラー状態 */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
            <p className="text-gray-600 font-medium mb-1">エラーが発生しました</p>
            <p className="text-sm text-gray-500">{error.message}</p>
          </div>
        )}

        {/* アイテムがない場合 */}
        {!isLoading && !error && currentItems.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {activeTab === 'category'
                ? `他に「${categoryLabels[currentItem.category]}」のアイテムはありません`
                : 'この出品者の他のアイテムはありません'}
            </p>
            <Link
              to="/items"
              className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              全てのアイテムを見る →
            </Link>
          </div>
        )}

        {/* アイテムグリッド */}
        {!isLoading && !error && displayedItems.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {displayedItems.map((item) => (
                <div key={item.id} className="transform transition-all hover:scale-105">
                  <ItemCard item={item} onClick={handleItemClick} />
                </div>
              ))}
            </div>

            {/* ページネーション */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                  className={`
                    p-2 rounded-full transition-colors
                    ${
                      currentPage === 0
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                  aria-label="前のページ"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, index) => (
                    <button
                      key={`page-${index}`}
                      onClick={() => setCurrentPage(index)}
                      className={`
                        w-2 h-2 rounded-full transition-all
                        ${
                          index === currentPage
                            ? 'w-8 bg-blue-600'
                            : 'bg-gray-300 hover:bg-gray-400'
                        }
                      `}
                      aria-label={`ページ ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages - 1}
                  className={`
                    p-2 rounded-full transition-colors
                    ${
                      currentPage === totalPages - 1
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                  aria-label="次のページ"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}

            {/* もっと見るリンク */}
            {currentItems.length > itemsPerPage && (
              <div className="text-center mt-6">
                <Link
                  to={`/items?${
                    activeTab === 'category'
                      ? `category=${currentItem.category}`
                      : `user=${currentItem.user_id}`
                  }`}
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  全て表示
                  <ChevronRight size={16} />
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      {/* モバイル用スクロールヒント */}
      {!isLoading && !error && displayedItems.length > 2 && (
        <div className="text-center pb-4 sm:hidden">
          <span className="text-xs text-gray-400">← スワイプで他のアイテムを表示 →</span>
        </div>
      )}
    </div>
  );
};

export default RelatedItems;
