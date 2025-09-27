/**
 * アイテム一覧ページコンポーネント（テスト用モックデータ版）
 * メインのアイテム一覧表示ページ
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// import { useItems } from '@/hooks/useItems';
import { ItemsQueryParams } from '@/types/item';
import ItemList from '@/components/items/ItemList';
import ItemFilter from '@/components/items/ItemFilter';
import Pagination from '@/components/items/Pagination';
// モックデータを使用
import {
  mockItemsResponse,
  searchMockItems,
  getMockItemsByCategory,
  getMockItemsByStatus,
} from '@/__mocks__/itemMocks';

const ItemsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [queryParams, setQueryParams] = useState<ItemsQueryParams>({});

  // モックデータ用の状態
  const [filteredData, setFilteredData] = useState(mockItemsResponse);

  // URLパラメータから初期値を設定
  useEffect(() => {
    const params: ItemsQueryParams = {};

    const page = searchParams.get('page');
    if (page) params.page = parseInt(page, 10);

    const limit = searchParams.get('limit');
    if (limit) params.limit = parseInt(limit, 10);

    const category = searchParams.get('category');
    if (category) params.category = category as ItemsQueryParams['category'];

    const status = searchParams.get('status');
    if (status) params.status = status as ItemsQueryParams['status'];

    const search = searchParams.get('search');
    if (search) params.search = search;

    const sort = searchParams.get('sort');
    if (sort) params.sort = sort as ItemsQueryParams['sort'];

    const tags = searchParams.get('tags');
    if (tags) params.tags = tags.split(',');

    setQueryParams(params);
  }, []);

  // モックデータのフィルタリング
  useEffect(() => {
    let items = [...mockItemsResponse.items];

    // 検索フィルター
    if (queryParams.search) {
      items = searchMockItems(queryParams.search);
    }

    // カテゴリーフィルター
    if (queryParams.category) {
      items = items.filter((item) => item.category === queryParams.category);
    }

    // ステータスフィルター
    if (queryParams.status) {
      items = items.filter((item) => item.status === queryParams.status);
    }

    // ソート
    if (queryParams.sort === 'created_at') {
      items.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (queryParams.sort === '-created_at') {
      items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    // ページネーション
    const page = queryParams.page || 1;
    const limit = queryParams.limit || 12;
    const start = (page - 1) * limit;
    const paginatedItems = items.slice(start, start + limit);

    setFilteredData({
      items: paginatedItems,
      total: items.length,
      page,
      limit,
      totalPages: Math.ceil(items.length / limit),
    });
  }, [queryParams]);

  // モックデータ用の設定
  const data = filteredData;
  const isLoading = false;
  const error = null;

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
      {/* テストモード表示 */}
      <div className="bg-yellow-50 border-b border-yellow-200">
        <div className="container mx-auto px-4 py-2">
          <p className="text-sm text-yellow-800">
            🧪 テストモード：モックデータを使用しています（アイテム数:{' '}
            {mockItemsResponse.items.length}件）
          </p>
        </div>
      </div>

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
            <button
              onClick={() => navigate('/items/new')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>出品する</span>
            </button>
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

      {/* フローティングアクションボタン（モバイル用） */}
      <button
        onClick={() => navigate('/items/new')}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center z-50"
        aria-label="出品する"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
};

export default ItemsPage;
