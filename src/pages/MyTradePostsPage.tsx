/**
 * 自分の交換投稿一覧ページ（画像対応版）
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTradePostStore } from '../stores/tradePostStore';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

const MyTradePostsPage: React.FC = () => {
  const { myPosts, loading, error, fetchMyPosts, updateStatus, deletePost, clearError } =
    useTradePostStore();
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchMyPosts();
    return () => clearError();
  }, []);

  // メイン画像またはデフォルト画像を取得
  const getMainImage = (images?: Array<{ url: string; is_main?: boolean }>) => {
    if (!images || images.length === 0) {
      return null;
    }
    const mainImage = images.find((img) => img.is_main);
    return mainImage ? mainImage.url : images[0].url;
  };

  const handleStatusChange = async (id: string, status: 'active' | 'completed' | 'cancelled') => {
    try {
      await updateStatus(id, status);
    } catch (err) {
      console.error('ステータス更新エラー:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePost(id);
      setShowDeleteConfirm(false);
      setSelectedPostId(null);
    } catch (err) {
      console.error('削除エラー:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      active: '募集中',
      completed: '完了',
      cancelled: 'キャンセル',
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (loading && myPosts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">読み込み中...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">自分の投稿</h1>
          <p className="text-gray-600">あなたが作成した交換投稿の管理ページです</p>
        </div>

        {/* エラー表示 */}
        {error && <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

        {/* アクションボタン */}
        <div className="mb-6 flex gap-4">
          <Link
            to="/trade-posts/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            新規投稿作成
          </Link>
          <Link
            to="/trade-posts"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            全投稿を見る
          </Link>
        </div>

        {/* 投稿リスト */}
        {myPosts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">まだ投稿がありません</p>
            <Link
              to="/trade-posts/create"
              className="inline-block mt-4 text-blue-600 hover:underline"
            >
              投稿を作成する
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {myPosts.map((post) => {
              const giveImage = getMainImage(post.give_item_images);
              const wantImage = getMainImage(post.want_item_images);

              return (
                <div key={post.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="flex">
                    {/* 画像部分 */}
                    <div className="flex-shrink-0 w-32 h-32 bg-gray-100">
                      {giveImage || wantImage ? (
                        <img
                          src={(giveImage || wantImage) as string}
                          alt={post.give_item}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg
                            className="w-8 h-8"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* コンテンツ部分 */}
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start mb-3">
                        {/* 交換情報 */}
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <span className="text-sm font-medium text-gray-500 w-10">譲)</span>
                            <span className="text-base font-bold text-gray-900">
                              {post.give_item}
                            </span>
                            {post.give_item_images && post.give_item_images.length > 0 && (
                              <span className="ml-2 text-xs text-gray-400">
                                📷 {post.give_item_images.length}枚
                              </span>
                            )}
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-500 w-10">求)</span>
                            <span className="text-base font-bold text-gray-900">
                              {post.want_item}
                            </span>
                            {post.want_item_images && post.want_item_images.length > 0 && (
                              <span className="ml-2 text-xs text-gray-400">
                                📷 {post.want_item_images.length}枚
                              </span>
                            )}
                          </div>
                        </div>

                        {/* ステータス */}
                        <div>{getStatusBadge(post.status)}</div>
                      </div>

                      {/* 説明（短縮表示） */}
                      {post.description && (
                        <p className="text-gray-600 text-sm mb-2 line-clamp-1">
                          {post.description}
                        </p>
                      )}

                      {/* メタ情報とアクション */}
                      <div className="flex justify-between items-center">
                        {/* 場所と日付 */}
                        <div className="text-xs text-gray-400">
                          {post.location_name && <span>📍 {post.location_name} / </span>}
                          {format(new Date(post.created_at), 'M月d日 HH:mm', { locale: ja })}
                        </div>

                        {/* アクションボタン */}
                        <div className="flex gap-2">
                          {post.status === 'active' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(post.id, 'completed')}
                                className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                              >
                                完了
                              </button>
                              <button
                                onClick={() => handleStatusChange(post.id, 'cancelled')}
                                className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                              >
                                キャンセル
                              </button>
                            </>
                          )}
                          {post.status === 'cancelled' && (
                            <button
                              onClick={() => handleStatusChange(post.id, 'active')}
                              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              再開
                            </button>
                          )}
                          <Link
                            to={`/trade-posts/${post.id}`}
                            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                          >
                            詳細
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedPostId(post.id);
                              setShowDeleteConfirm(true);
                            }}
                            className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 削除確認ダイアログ */}
        {showDeleteConfirm && selectedPostId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">削除確認</h3>
              <p className="text-gray-600 mb-6">この投稿を削除してもよろしいですか？</p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDelete(selectedPostId)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  削除する
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedPostId(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTradePostsPage;
