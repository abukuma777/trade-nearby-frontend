/**
 * プロフィール用商品サムネイル表示コンポーネント
 */

import { Package, Loader, AlertCircle, Plus } from 'lucide-react';
import React from 'react';
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

const ProfileTradePosts: React.FC<ProfileTradePostsProps> = ({ userId, username }) => {
  const navigate = useNavigate();
  const { data: tradePosts, isLoading, error } = useUserRecentTradePosts(8, userId);

  // メインの画像URLを取得
  const getMainImageUrl = (post: TradePost): string | null => {
    // give_item_imagesから最初の画像を取得（優先）
    if (post.give_item_images && post.give_item_images.length > 0) {
      const mainImage = post.give_item_images.find((img: TradePostImage): boolean => img.is_main ?? false);
      return mainImage ? mainImage.url : post.give_item_images[0].url;
    }

    // want_item_imagesから取得（フォールバック）
    if (post.want_item_images && post.want_item_images.length > 0) {
      const mainImage = post.want_item_images.find((img: TradePostImage): boolean => img.is_main ?? false);
      return mainImage ? mainImage.url : post.want_item_images[0].url;
    }

    return null;
  };

  // ローディング状態
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          出品商品
        </h2>
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  // エラー状態
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          出品商品
        </h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-red-700">商品の読み込みに失敗しました</p>
              <p className="text-sm text-red-600 mt-1">{error.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // データが無い場合
  if (!tradePosts || tradePosts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          出品商品
        </h2>
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">まだ出品商品がありません</p>
          <button
            onClick={() => navigate('/trade-posts/create')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            最初の商品を出品
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Package className="w-5 h-5" />
        出品商品
      </h2>

      {/* サムネイルグリッド */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
                <p className="text-gray-700 truncate font-medium">{post.give_item}</p>
                <p className="text-gray-500 text-xs truncate">↔ {post.want_item}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* もっと見るボタン（8個以上ある可能性がある場合） */}
      {tradePosts.length >= 8 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate(username ? `/user/${username}/trade-posts` : '/trade-posts/my')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            すべての出品商品を見る
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileTradePosts;
