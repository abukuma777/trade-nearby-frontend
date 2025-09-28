/**
 * 自分の交換投稿一覧ページ（画像対応版）
 */

import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useTradePostStore } from '../stores/tradePostStore';

const MyTradePostsPage: React.FC = () => {
  const {
    myPosts,
    loading,
    error,
    fetchMyPosts,
    updateStatus,
    deletePost,
    clearError,
  } = useTradePostStore();
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    void fetchMyPosts();
    return () => clearError();
  }, [fetchMyPosts, clearError]);

  // メイン画像またはデフォルト画像を取得
  const getMainImage = (
    images?: Array<{ url: string; is_main?: boolean }>,
  ): string | null => {
    if (!images || images.length === 0) {
      return null;
    }
    const mainImage = images.find((img) => img.is_main);
    return mainImage ? mainImage.url : images[0].url;
  };

  const handleStatusChange = async (
    id: string,
    status: 'active' | 'trading' | 'completed' | 'private',
  ): Promise<void> => {
    try {
      await updateStatus(id, status);
    } catch (err) {
      console.error('ステータス更新エラー:', err);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await deletePost(id);
      setShowDeleteConfirm(false);
      setSelectedPostId(null);
    } catch (err) {
      console.error('削除エラー:', err);
    }
  };

  const getStatusBadge = (status: string): JSX.Element => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      trading: 'bg-orange-100 text-orange-800',
      completed: 'bg-blue-100 text-blue-800',
      private: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      active: '募集中',
      trading: '取引中',
      completed: '完了',
      private: '非公開',
    };
    return (
      <span
        className={`rounded-full px-2 py-1 text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}
      >
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  if (loading && myPosts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex h-64 items-center justify-center">
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
          <h1 className="mb-4 text-3xl font-bold text-gray-900">自分の投稿</h1>
          <p className="text-gray-600">
            あなたが作成した交換投稿の管理ページです
          </p>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* アクションボタン */}
        <div className="mb-6 flex gap-4">
          <Link
            to="/trade-posts/create"
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            新規投稿作成
          </Link>
          <Link
            to="/trade-posts"
            className="rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
          >
            全投稿を見る
          </Link>
        </div>

        {/* 投稿リスト */}
        {myPosts.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow">
            <p className="text-gray-500">まだ投稿がありません</p>
            <Link
              to="/trade-posts/create"
              className="mt-4 inline-block text-blue-600 hover:underline"
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
                <div
                  key={post.id}
                  className="overflow-hidden rounded-lg bg-white shadow"
                >
                  <div className="flex">
                    {/* 画像部分 */}
                    <div className="h-32 w-32 flex-shrink-0 bg-gray-100">
                      {giveImage || wantImage ? (
                        <img
                          src={(giveImage || wantImage) as string}
                          alt={post.give_item}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                          <svg
                            className="h-8 w-8"
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
                      <div className="mb-3 flex items-start justify-between">
                        {/* 交換情報 */}
                        <div className="flex-1">
                          <div className="mb-1 flex items-center">
                            <span className="w-10 text-sm font-medium text-gray-500">
                              譲)
                            </span>
                            <span className="text-base font-bold text-gray-900">
                              {post.give_item}
                            </span>
                            {post.give_item_images &&
                              post.give_item_images.length > 0 && (
                                <span className="ml-2 text-xs text-gray-400">
                                  📷 {post.give_item_images.length}枚
                                </span>
                              )}
                          </div>
                          <div className="flex items-center">
                            <span className="w-10 text-sm font-medium text-gray-500">
                              求)
                            </span>
                            <span className="text-base font-bold text-gray-900">
                              {post.want_item}
                            </span>
                            {post.want_item_images &&
                              post.want_item_images.length > 0 && (
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
                        <p className="mb-2 line-clamp-1 text-sm text-gray-600">
                          {post.description}
                        </p>
                      )}

                      {/* メタ情報とアクション */}
                      <div className="flex items-center justify-between">
                        {/* 場所と日付 */}
                        <div className="text-xs text-gray-400">
                          {post.location_name && (
                            <span>📍 {post.location_name} / </span>
                          )}
                          {format(new Date(post.created_at), 'M月d日 HH:mm', {
                            locale: ja,
                          })}
                        </div>

                        {/* アクションボタン */}
                        <div className="flex gap-2">
                          {/* 詳細ボタンは常に表示（左端） */}
                          <Link
                            to={`/trade-posts/${post.id}`}
                            className="rounded bg-gray-500 px-2 py-1 text-xs text-white transition-colors hover:bg-gray-600"
                          >
                            詳細
                          </Link>

                          {/* 募集中: 非公開にする、削除 */}
                          {post.status === 'active' && (
                            <>
                              <button
                                onClick={() =>
                                  void handleStatusChange(post.id, 'private')
                                }
                                className="rounded bg-gray-600 px-2 py-1 text-xs text-white transition-colors hover:bg-gray-700"
                              >
                                非公開にする
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedPostId(post.id);
                                  setShowDeleteConfirm(true);
                                }}
                                className="rounded bg-red-600 px-2 py-1 text-xs text-white transition-colors hover:bg-red-700"
                              >
                                削除
                              </button>
                            </>
                          )}

                          {/* 取引中: アクションなし（詳細のみ） */}

                          {/* 非公開: 再公開 */}
                          {post.status === 'private' && (
                            <button
                              onClick={() =>
                                void handleStatusChange(post.id, 'active')
                              }
                              className="rounded bg-blue-600 px-2 py-1 text-xs text-white transition-colors hover:bg-blue-700"
                            >
                              公開する
                            </button>
                          )}

                          {/* 完了: アクションなし（詳細のみ） */}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="max-w-sm rounded-lg bg-white p-6">
              <h3 className="mb-4 text-lg font-bold text-gray-900">削除確認</h3>
              <p className="mb-6 text-gray-600">
                この投稿を完全に削除します。
                <br />
                削除された投稿は復元できません。
                <br />
                一時的に募集を停止したい場合は「非公開にする」をお使いください。
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => void handleDelete(selectedPostId)}
                  className="flex-1 rounded bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
                >
                  削除する
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedPostId(null);
                  }}
                  className="flex-1 rounded bg-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-400"
                >
                  やめる
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
