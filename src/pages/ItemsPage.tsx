/**
 * アイテム一覧ページコンポーネント
 * メインのアイテム一覧表示ページ
 */

import { Plus } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

import ItemFilter from '@/components/items/ItemFilter';
import ItemList from '@/components/items/ItemList';
import Pagination from '@/components/items/Pagination';
import { useItems } from '@/hooks/useItems';
import { useAuthStore } from '@/stores/authStore';
import { ItemsQueryParams } from '@/types/item';
// モックデータ（開発用 - 実際のAPIが動作したらコメントアウト）
// import { mockItemsResponse } from '@/__mocks__/itemMocks';

const ItemsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [queryParams, setQueryParams] = useState<ItemsQueryParams>({});
  const { isAuthenticated } = useAuthStore();

  // URLパラメータから初期値を設定
  useEffect(() => {
    const params: ItemsQueryParams = {};

    const page = searchParams.get('page');
    if (page) {params.page = parseInt(page, 10);}

    const limit = searchParams.get('limit');
    if (limit) {params.limit = parseInt(limit, 10);}

    const category = searchParams.get('category');
    if (category) {params.category = category as ItemsQueryParams['category'];}

    const status = searchParams.get('status');
    if (status) {params.status = status as ItemsQueryParams['status'];}

    const search = searchParams.get('search');
    if (search) {params.search = search;}

    const sort = searchParams.get('sort');
    if (sort) {params.sort = sort as ItemsQueryParams['sort'];}

    const tags = searchParams.get('tags');
    if (tags) {params.tags = tags.split(',');}

    setQueryParams(params);
  }, []);

  // React Queryを使用してデータ取得
  const { data, isLoading, error } = useItems({
    ...queryParams,
    limit: queryParams.limit || 12,
  });

  // 開発用：APIが利用できない場合はモックデータを使用
  // const data = mockItemsResponse;
  // const isLoading = false;
  // const error = null;

  // フィルター変更時の処理
  const handleFilterChange = (filters: ItemsQueryParams) => {
    // URLパラメータを更新
    const newParams = new URLSearchParams();

    if (filters.page && filters.page > 1) {
      newParams.set('page', filters.page.toString());
    }
    if (filters.limit && filters.limit !== 12) {
      newParams.set('limit', filters.limit.toString());
    }
    if (filters.category) {
      newParams.set('category', filters.category);
    }
    if (filters.status) {
      newParams.set('status', filters.status);
    }
    if (filters.search) {
      newParams.set('search', filters.search);
    }
    if (filters.sort && filters.sort !== '-created_at') {
      newParams.set('sort', filters.sort);
    }
    if (filters.tags && filters.tags.length > 0) {
      newParams.set('tags', filters.tags.join(','));
    }

    setSearchParams(newParams);
    setQueryParams(filters);
  };

  // ページ変更時の処理
  const handlePageChange = (page: number) => {
    const newParams = { ...queryParams, page };
    handleFilterChange(newParams);

    // ページトップへスクロール
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // アイテムクリック時の処理
  const handleItemClick = (item: any) => {
    navigate(`/items/${item.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">グッズ一覧</h1>
              <p className="mt-1 text-sm text-gray-600">
                {data ? `${data.total}件のグッズが見つかりました` : '読み込み中...'}
              </p>
            </div>

            {/* 出品ボタン（認証済みユーザーのみ） */}
            {isAuthenticated && (
              <Link
                to="/items/create"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>出品する</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="container mx-auto px-4 py-8">
        {/* フィルター */}
        <ItemFilter
          onFilterChange={handleFilterChange}
          initialFilters={queryParams}
          loading={isLoading}
        />

        {/* アイテムリスト */}
        <ItemList
          items={data?.items || []}
          loading={isLoading}
          error={error}
          onItemClick={handleItemClick}
          columns={3}
        />

        {/* ページネーション */}
        {data && data.totalPages > 1 && (
          <Pagination
            currentPage={data.page}
            totalPages={data.totalPages}
            totalItems={data.total}
            itemsPerPage={data.limit}
            onPageChange={handlePageChange}
            loading={isLoading}
          />
        )}
      </div>

      {/* フローティングアクションボタン（モバイル用、認証済みユーザーのみ） */}
      {isAuthenticated && (
        <Link
          to="/items/create"
          className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center z-50"
          aria-label="出品する"
        >
          <Plus size={24} />
        </Link>
      )}
    </div>
  );
};

export default ItemsPage;
