/**
 * 特定ユーザーの出品商品一覧ページ
 */

import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Package, User, Loader, AlertCircle, ArrowLeft } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

import { useUserById } from '../hooks/useProfile';
import { useUserTradePosts } from '../hooks/useUserTradePosts';
import { useAuthStore } from '../stores/authStore';

type FilterStatus = 'all' | 'active' | 'trading' | 'completed';

const UserTradePostsPage: React.FC = () => {
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  // 現在のログインユーザーを取得
  const { user: currentUser } = useAuthStore();

  // ユーザー情報とその投稿を取得（usernameで取得）
  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
  } = useUserById(username || '');

  // 自分のプロフィールかどうかを判定（username比較）
  const isOwnProfile = currentUser?.username === username;

  const {
    data: tradePosts,
    isLoading: isLoadingPosts,
    error: postsError,
  } = useUserTradePosts(user?.id);

  // フィルタリングされた投稿
  const filteredPosts =
    tradePosts?.filter((post) => {
      if (filterStatus === 'all') {
        return true;
      }
      return post.status === filterStatus;
    }) || [];

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

  const getStatusBadge = (status: string): React.ReactElement => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      trading: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    const labels = {
      active: '募集中',
      trading: '取引中',
      completed: '完了',
    };
    return (
      <span
        className={`rounded-full px-2 py-1 text-xs font-medium ${
          styles[status as keyof typeof styles]
        }`}
      >
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getFilterButtonClass = (status: FilterStatus): string => {
    return filterStatus === status
      ? 'px-4 py-2 bg-blue-600 text-white rounded-md'
      : 'px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200';
  };

  if (isLoadingUser || isLoadingPosts) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex h-64 items-center justify-center">
            <Loader className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  if (userError || postsError) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 flex-shrink-0 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-red-900">
                  エラーが発生しました
                </h3>
                <p className="mt-1 text-red-700">
                  {userError?.message ||
                    postsError?.message ||
                    'データの取得に失敗しました'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
            <p className="text-yellow-700">ユーザーが見つかりません</p>
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
          <button
            onClick={() => navigate(-1)}
            className="mb-4 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            戻る
          </button>

          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold">
                  {user.username?.[0]?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isOwnProfile
                  ? 'あなたの出品商品'
                  : `${user.display_name || user.username}の出品商品`}
              </h1>
              <Link
                to={`/profile/${user.username}`}
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
              >
                <User className="h-3 w-3" />
                プロフィールを見る
              </Link>
            </div>
          </div>
        </div>

        {/* フィルターボタン */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={getFilterButtonClass('all')}
          >
            すべて ({tradePosts?.length || 0})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={getFilterButtonClass('active')}
          >
            募集中 (
            {tradePosts?.filter((p) => p.status === 'active').length || 0})
          </button>
          <button
            onClick={() => setFilterStatus('trading')}
            className={getFilterButtonClass('trading')}
          >
            取引中 (
            {tradePosts?.filter((p) => p.status === 'trading').length || 0})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={getFilterButtonClass('completed')}
          >
            完了 (
            {tradePosts?.filter((p) => p.status === 'completed').length || 0})
          </button>
        </div>

        {/* 投稿リスト */}
        {filteredPosts.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow">
            <Package className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <p className="text-gray-500">
              {filterStatus === 'all'
                ? 'まだ出品商品がありません'
                : `${filterStatus === 'active' ? '募集中' : filterStatus === 'trading' ? '取引中' : '完了済み'}の商品はありません`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => {
              const giveImage = getMainImage(post.give_item_images);
              const wantImage = getMainImage(post.want_item_images);

              return (
                <Link
                  key={post.id}
                  to={`/trade-posts/${post.id}`}
                  className="block cursor-pointer overflow-hidden rounded-lg bg-white shadow transition-shadow hover:shadow-lg"
                >
                  {/* 画像部分 */}
                  <div className="relative aspect-square bg-gray-100">
                    {giveImage || wantImage ? (
                      <img
                        src={(giveImage || wantImage) as string}
                        alt={post.give_item}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-400">
                        <Package className="h-16 w-16" />
                      </div>
                    )}
                    {/* ステータスバッジ */}
                    <div className="absolute right-2 top-2">
                      {getStatusBadge(post.status)}
                    </div>
                  </div>

                  {/* コンテンツ部分 */}
                  <div className="p-4">
                    <div className="mb-2">
                      <div className="mb-1 flex items-center">
                        <span className="w-8 text-xs font-medium text-gray-500">
                          譲)
                        </span>
                        <span className="flex-1 truncate text-sm font-bold text-gray-900">
                          {post.give_item}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-8 text-xs font-medium text-gray-500">
                          求)
                        </span>
                        <span className="flex-1 truncate text-sm font-bold text-gray-900">
                          {post.want_item}
                        </span>
                      </div>
                    </div>

                    {/* 説明（短縮表示） */}
                    {post.description && (
                      <p className="mb-2 line-clamp-2 text-xs text-gray-600">
                        {post.description}
                      </p>
                    )}

                    {/* メタ情報 */}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>
                        {post.location_name && `📍 ${post.location_name}`}
                      </span>
                      <span>
                        {format(new Date(post.created_at), 'M月d日', {
                          locale: ja,
                        })}
                      </span>
                    </div>

                    {/* 交渉用ボタン（他人の商品でアクティブな場合のみ） */}
                    {!isOwnProfile && post.status === 'active' && (
                      <div className="mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/trade-posts/${post.id}`, {
                              state: { proposeExchange: true },
                            });
                          }}
                          className="w-full rounded bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-700"
                        >
                          この商品で交渉する
                        </button>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTradePostsPage;
