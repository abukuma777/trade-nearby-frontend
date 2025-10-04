/**
 * マイアイテムページコンポーネント（修正版）
 * - statusとvisibilityを分離
 */

import { Plus, Package, AlertCircle } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

import MyItemCard from '@/components/items/MyItemCard';
import Pagination from '@/components/items/Pagination';
import { useItems, useDeleteItem, useToggleItemVisibility } from '@/hooks/useItems';
import { useAuthStore } from '@/stores/authStore';

const MyItemsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();

  // statusとvisibilityを分離
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'reserved' | 'traded' | 'all'>(
    'all',
  );
  const [selectedVisibility, setSelectedVisibility] = useState<'public' | 'private'>('public');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // 削除用のmutation
  const deleteItemMutation = useDeleteItem();

  // visibility切り替え用のmutation
  const toggleVisibilityMutation = useToggleItemVisibility();

  // 認証されていない場合はログインページへリダイレクト
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/my-items' } });
    }
  }, [isAuthenticated, navigate]);

  // 初回アクセス時にvisibilityパラメータがない場合は追加
  useEffect(() => {
    if (isAuthenticated && !searchParams.get('visibility')) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('visibility', 'public');
      setSearchParams(newParams, { replace: true });
    }
  }, [isAuthenticated, searchParams, setSearchParams]);

  // URLパラメータからステートを更新
  useEffect(() => {
    const status = searchParams.get('status');
    if (
      status &&
      (status === 'all' || status === 'active' || status === 'reserved' || status === 'traded')
    ) {
      setSelectedStatus(status);
    }

    const visibility = searchParams.get('visibility');
    if (visibility && (visibility === 'public' || visibility === 'private')) {
      setSelectedVisibility(visibility);
    }
  }, [searchParams]);

  // React Queryを使用してデータ取得
  const { data, isLoading, error, refetch } = useItems({
    user_id: user?.id,
    limit: 12,
    page: parseInt(searchParams.get('page') || '1', 10),
    status: selectedStatus === 'all' ? undefined : selectedStatus,
    visibility: selectedVisibility, // selectedVisibilityを直接使用
  });

  // ステータスフィルターの変更
  const handleStatusChange = (status: typeof selectedStatus): void => {
    setSelectedStatus(status);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('status', status);
    // ページを1に戻す
    newParams.delete('page');
    setSearchParams(newParams);
  };

  // 可視性フィルターの変更
  const handleVisibilityChange = (visibility: 'public' | 'private'): void => {
    setSelectedVisibility(visibility);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('visibility', visibility);
    // ページを1に戻す
    newParams.delete('page');
    setSearchParams(newParams);
  };

  // ページ変更時の処理
  const handlePageChange = (page: number): void => {
    const newParams = new URLSearchParams(searchParams);
    if (page > 1) {
      newParams.set('page', page.toString());
    } else {
      newParams.delete('page');
    }
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // アイテムクリック時の処理（詳細ページへ遷移）
  interface ClickableItem {
    id: string;
  }
  const handleItemClick = (item: ClickableItem): void => {
    navigate(`/items/${item.id}`);
  };

  // アイテム編集
  const handleEditItem = (itemId: string): void => {
    navigate(`/items/${itemId}/edit`);
  };

  // アイテム削除
  const handleDeleteItem = async (itemId: string): Promise<void> => {
    try {
      await deleteItemMutation.mutateAsync(itemId);
      setShowDeleteConfirm(null);
      toast.success('アイテムを削除しました');
      void refetch(); // リストを再取得
    } catch (error) {
      console.error('Failed to delete item:', error);
      toast.error('アイテムの削除に失敗しました');
    }
  };

  // アイテムの公開/非公開切り替え
  const handleToggleVisibility = async (itemId: string): Promise<void> => {
    try {
      // 現在のアイテムを取得
      const currentItem = data?.items.find((item) => item.id === itemId);
      if (!currentItem) {return;}

      // 新しいvisibilityを決定
      const newVisibility = currentItem.visibility === 'public' ? 'private' : 'public';

      // APIを呼び出し
      await toggleVisibilityMutation.mutateAsync({
        itemId,
        visibility: newVisibility,
      });

      // 成功メッセージ
      toast.success(`アイテムを${newVisibility === 'public' ? '公開' : '非公開'}にしました`);

      // リストを再取得
      void refetch();
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
      toast.error('公開/非公開の切り替えに失敗しました');
    }
  };

  // ログインしていない場合は何も表示しない（リダイレクト中）
  if (!isAuthenticated || !user) {
    return null;
  }

  // タイトルの生成
  const getTitle = (): string => {
    const statusText =
      selectedStatus === 'active'
        ? '出品中'
        : selectedStatus === 'reserved'
          ? '取引中'
          : selectedStatus === 'traded'
            ? '交換済み'
            : '全て';

    const visibilityText = selectedVisibility === 'public' ? '公開' : '非公開';

    if (selectedStatus === 'all') {
      return `${visibilityText}のグッズ`;
    } else {
      return `${statusText}の${visibilityText}グッズ`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Package size={32} className="text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{getTitle()}</h1>
                <p className="mt-1 text-sm text-gray-600">
                  {data ? `${data.total}件` : '読み込み中...'}
                </p>
              </div>
            </div>

            {/* 新規出品ボタン */}
            <Link
              to="/items/create"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>新規出品</span>
            </Link>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="container mx-auto px-4 py-8">
        {/* フィルター */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          {/* ステータスフィルター */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">ステータス</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleStatusChange('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedStatus === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                全て
              </button>
              <button
                onClick={() => handleStatusChange('active')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedStatus === 'active'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                出品中
              </button>
              <button
                onClick={() => handleStatusChange('reserved')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedStatus === 'reserved'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                取引中
              </button>
              <button
                onClick={() => handleStatusChange('traded')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedStatus === 'traded'
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                交換済み
              </button>
            </div>
          </div>

          {/* 公開状態フィルター */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">公開状態</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleVisibilityChange('public')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedVisibility === 'public'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                公開
              </button>
              <button
                onClick={() => handleVisibilityChange('private')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedVisibility === 'private'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                非公開
              </button>
            </div>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center space-x-2">
            <AlertCircle className="text-red-600" size={20} />
            <p className="text-red-800">エラー: {error.message}</p>
          </div>
        )}

        {/* アイテムリスト */}
        {!isLoading && data && data.items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{getTitle()}はありません</h3>
            <p className="text-gray-600 mb-6">
              新しいグッズを出品して、他のユーザーと交換してみましょう！
            </p>
            <Link
              to="/items/create"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              <span>グッズを出品する</span>
            </Link>
          </div>
        ) : (
          <>
            {/* アイテムグリッド */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* スケルトンローダー */}
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
                  >
                    <div className="aspect-square bg-gray-300" />
                    <div className="p-4">
                      <div className="h-6 bg-gray-300 rounded mb-2" />
                      <div className="h-4 bg-gray-200 rounded mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                      <div className="flex space-x-2">
                        <div className="h-8 bg-gray-200 rounded flex-1" />
                        <div className="h-8 bg-gray-200 rounded flex-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {data?.items.map((item) => (
                  <MyItemCard
                    key={item.id}
                    item={item}
                    onEdit={handleEditItem}
                    onDelete={(itemId) => setShowDeleteConfirm(itemId)}
                    onToggleVisibility={() => void handleToggleVisibility(item.id)}
                    onClick={handleItemClick}
                  />
                ))}
              </div>
            )}

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
          </>
        )}
      </div>

      {/* 削除確認モーダル */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">アイテムを削除しますか？</h3>
            <p className="text-gray-600 mb-6">
              この操作は取り消せません。本当にこのアイテムを削除してもよろしいですか？
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={() => void handleDeleteItem(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                disabled={deleteItemMutation.isPending}
              >
                {deleteItemMutation.isPending ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* フローティングアクションボタン（モバイル用） */}
      <Link
        to="/items/create"
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center z-40"
        aria-label="新規出品"
      >
        <Plus size={24} />
      </Link>
    </div>
  );
};

export default MyItemsPage;
