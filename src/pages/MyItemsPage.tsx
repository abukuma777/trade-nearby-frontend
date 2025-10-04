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
import {
  useItems,
  useDeleteItem,
  useToggleItemVisibility,
} from '@/hooks/useItems';
import { useAuthStore } from '@/stores/authStore';

// スケルトンローダー用の固定キー配列
const SKELETON_ITEMS = ['sk-1', 'sk-2', 'sk-3', 'sk-4', 'sk-5', 'sk-6'];

const MyItemsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();

  // statusとvisibilityを分離
  const [selectedStatus, setSelectedStatus] = useState<
    'active' | 'reserved' | 'traded' | 'all'
  >('all');
  const [selectedVisibility, setSelectedVisibility] = useState<
    'public' | 'private'
  >('public');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );

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
      (status === 'all' ||
        status === 'active' ||
        status === 'reserved' ||
        status === 'traded')
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
      if (!currentItem) {
        return;
      }

      // 新しいvisibilityを決定
      const newVisibility =
        currentItem.visibility === 'public' ? 'private' : 'public';

      // APIを呼び出し
      await toggleVisibilityMutation.mutateAsync({
        itemId,
        visibility: newVisibility,
      });

      // 成功メッセージ
      toast.success(
        `アイテムを${newVisibility === 'public' ? '公開' : '非公開'}にしました`,
      );

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
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Package size={32} className="text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {getTitle()}
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  {data ? `${data.total}件` : '読み込み中...'}
                </p>
              </div>
            </div>

            {/* 新規出品ボタン */}
            <Link
              to="/items/create"
              className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
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
        <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
          {/* ステータスフィルター */}
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-semibold text-gray-700">
              ステータス
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleStatusChange('all')}
                className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                  selectedStatus === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                全て
              </button>
              <button
                onClick={() => handleStatusChange('active')}
                className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                  selectedStatus === 'active'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                出品中
              </button>
              <button
                onClick={() => handleStatusChange('reserved')}
                className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                  selectedStatus === 'reserved'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                取引中
              </button>
              <button
                onClick={() => handleStatusChange('traded')}
                className={`rounded-lg px-4 py-2 font-medium transition-colors ${
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
            <h3 className="mb-2 text-sm font-semibold text-gray-700">
              公開状態
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleVisibilityChange('public')}
                className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                  selectedVisibility === 'public'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                公開
              </button>
              <button
                onClick={() => handleVisibilityChange('private')}
                className={`rounded-lg px-4 py-2 font-medium transition-colors ${
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
          <div className="mb-6 flex items-center space-x-2 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertCircle className="text-red-600" size={20} />
            <p className="text-red-800">エラー: {error.message}</p>
          </div>
        )}

        {/* アイテムリスト */}
        {!isLoading && data && data.items.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-sm">
            <Package size={64} className="mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              {getTitle()}はありません
            </h3>
            <p className="mb-6 text-gray-600">
              新しいグッズを出品して、他のユーザーと交換してみましょう！
            </p>
            <Link
              to="/items/create"
              className="inline-flex items-center space-x-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
            >
              <Plus size={20} />
              <span>グッズを出品する</span>
            </Link>
          </div>
        ) : (
          <>
            {/* アイテムグリッド */}
            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                {/* スケルトンローダー */}
                {SKELETON_ITEMS.map((key) => (
                  <div
                    key={key}
                    className="animate-pulse overflow-hidden rounded-lg bg-white shadow-md"
                  >
                    <div className="aspect-square bg-gray-300" />
                    <div className="p-4">
                      <div className="mb-2 h-6 rounded bg-gray-300" />
                      <div className="mb-2 h-4 rounded bg-gray-200" />
                      <div className="mb-3 h-4 w-3/4 rounded bg-gray-200" />
                      <div className="flex space-x-2">
                        <div className="h-8 flex-1 rounded bg-gray-200" />
                        <div className="h-8 flex-1 rounded bg-gray-200" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                {data?.items.map((item) => (
                  <MyItemCard
                    key={item.id}
                    item={item}
                    onEdit={handleEditItem}
                    onDelete={(itemId) => setShowDeleteConfirm(itemId)}
                    onToggleVisibility={() =>
                      void handleToggleVisibility(item.id)
                    }
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">
              アイテムを削除しますか？
            </h3>
            <p className="mb-6 text-gray-600">
              この操作は取り消せません。本当にこのアイテムを削除してもよろしいですか？
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 rounded-lg bg-gray-200 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-300"
              >
                キャンセル
              </button>
              <button
                onClick={() => void handleDeleteItem(showDeleteConfirm)}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
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
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-colors hover:bg-blue-700 lg:hidden"
        aria-label="新規出品"
      >
        <Plus size={24} />
      </Link>
    </div>
  );
};

export default MyItemsPage;
