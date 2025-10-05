/**
 * プロフィール用商品サムネイル表示コンポーネント
 */

import { Package, Loader, AlertCircle, Plus } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ThumbnailLazyImage } from '@/components/common/LazyLoadImage';
import { useUserRecentTradePosts } from '@/hooks/useUserTradePosts';

// 型定義
interface TradePostImage {
  url: string;
  is_main?: boolean;
}

interface TradePost {
  id: string;
  give_item: string;
  want_item: string;
  give_item_images?: TradePostImage[];
  want_item_images?: TradePostImage[];
  status?: string;
}

interface ProfileTradePostsProps {
  userId?: string;
  username?: string;
}

const ProfileTradePosts: React.FC<ProfileTradePostsProps> = ({
  userId,
  username,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  // タブに応じてデータを取得
  const {
    data: tradePosts,
    isLoading,
    error,
  } = useUserRecentTradePosts(8, userId, activeTab);

  // メインの画像URLを取得
  const getMainImageUrl = (post: TradePost): string | null => {
    // give_item_imagesから最初の画像を取得（優先）
    if (post.give_item_images && post.give_item_images.length > 0) {
      const mainImage = post.give_item_images.find(
        (img: TradePostImage): boolean => img.is_main ?? false,
      );
      return mainImage ? mainImage.url : post.give_item_images[0].url;
    }

    // want_item_imagesから取得（フォールバック）
    if (post.want_item_images && post.want_item_images.length > 0) {
      const mainImage = post.want_item_images.find(
        (img: TradePostImage): boolean => img.is_main ?? false,
      );
      return mainImage ? mainImage.url : post.want_item_images[0].url;
    }

    return null;
  };

  // ローディング状態
  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
          <Package className="h-5 w-5" />
          出品商品
        </h2>
        <div className="flex items-center justify-center py-12">
          <Loader className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  // エラー状態
  if (error) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
          <Package className="h-5 w-5" />
          出品商品
        </h2>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
            <div>
              <p className="text-red-700">商品の読み込みに失敗しました</p>
              <p className="mt-1 text-sm text-red-600">{error.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // データが無い場合の表示
  const renderEmptyState = (): JSX.Element => (
    <div className="py-12 text-center">
      <Package className="mx-auto mb-4 h-16 w-16 text-gray-300" />
      <p className="mb-4 text-gray-500">
        {activeTab === 'active'
          ? '募集中の商品がありません'
          : '完了済みの商品がありません'}
      </p>
      {activeTab === 'active' && !username && (
        <button
          onClick={() => navigate('/trade-posts/create')}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          最初の商品を出品
        </button>
      )}
    </div>
  );

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
          <Package className="h-5 w-5" />
          出品商品
        </h2>
      </div>

      {/* タブ */}
      <div className="mb-6 flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 pb-2 text-sm font-medium transition-colors ${
            activeTab === 'active'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          募集中
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 pb-2 text-sm font-medium transition-colors ${
            activeTab === 'completed'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          完了済み
        </button>
      </div>

      {/* サムネイルグリッド */}
      {!tradePosts || tradePosts.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {tradePosts.map((post): React.ReactElement => {
            const imageUrl = getMainImageUrl(post);
            return (
              <div key={post.id}>
                <ThumbnailLazyImage
                  src={imageUrl}
                  alt={post.give_item}
                  status={post.status}
                  onClick={() => navigate(`/trade-posts/${post.id}`)}
                />

                {/* アイテム名（画像の下に表示） */}
                <div className="mt-2 text-sm">
                  <p className="truncate font-medium text-gray-700">
                    {post.give_item}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    ↔ {post.want_item}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* もっと見るボタン */}
      <div className="mt-6 text-center">
        <button
          onClick={() =>
            navigate(
              username ? `/user/${username}/trade-posts` : '/trade-posts/my',
            )
          }
          className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200"
        >
          すべての出品商品を見る
        </button>
      </div>
    </div>
  );
};

export default ProfileTradePosts;
