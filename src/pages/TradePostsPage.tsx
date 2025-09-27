/**
 * 交換投稿一覧ページ（画像対応版）
 * カード型レイアウトでサムネイル表示
 */

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTradePostStore } from '../stores/tradePostStore';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

const TradePostsPage: React.FC = () => {
  const { posts, loading, error, fetchPosts, clearError } = useTradePostStore();

  useEffect(() => {
    fetchPosts('active');
    return () => clearError();
  }, []);

  // デバッグ用：取得したデータを確認
  useEffect(() => {
    if (posts.length > 0) {
      console.log('=== 取得した投稿データ ===');
      console.log('投稿数:', posts.length);
      posts.forEach((post, index) => {
        console.log(`投稿${index + 1}:`, {
          id: post.id,
          give_item: post.give_item,
          want_item: post.want_item,
          give_item_images: post.give_item_images,
          want_item_images: post.want_item_images,
        });
      });
    }
  }, [posts]);

  // メイン画像またはデフォルト画像を取得
  const getMainImage = (images?: Array<{ url: string; is_main?: boolean }>) => {
    if (!images || images.length === 0) {
      return null;
    }
    const mainImage = images.find((img) => img.is_main);
    return mainImage ? mainImage.url : images[0].url;
  };

  // デフォルト画像のプレースホルダー
  const DefaultImagePlaceholder = ({ text }: { text: string }) => (
    <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-t-lg">
      <div className="text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
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
        <p className="mt-2 text-xs text-gray-500">{text}</p>
      </div>
    </div>
  );

  if (loading) {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">交換投稿一覧</h1>
          <p className="text-gray-600">シンプルな「譲)〇〇 求)〇〇」形式で交換相手を探しましょう</p>
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
            to="/trade-posts/my"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            自分の投稿
          </Link>
        </div>

        {/* 投稿グリッド */}
        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">現在、投稿はありません</p>
            <Link
              to="/trade-posts/create"
              className="inline-block mt-4 text-blue-600 hover:underline"
            >
              最初の投稿を作成する
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {posts.map((post) => {
              const giveImage = getMainImage(post.give_item_images);
              const wantImage = getMainImage(post.want_item_images);
              const displayImage = giveImage || wantImage; // 譲画像優先

              return (
                <Link
                  to={`/trade-posts/${post.id}`}
                  key={post.id}
                  className="block bg-white rounded-lg shadow hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 overflow-hidden"
                >
                  {/* 画像部分 */}
                  {displayImage ? (
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      <img
                        src={displayImage}
                        alt={post.give_item}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error(`画像読み込みエラー: ${displayImage}`);
                          e.currentTarget.onerror = null;
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      {/* 画像がある場合のバッジ */}
                      <div className="absolute top-2 left-2 flex gap-1">
                        {post.give_item_images && post.give_item_images.length > 0 && (
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                            譲
                          </span>
                        )}
                        {post.want_item_images && post.want_item_images.length > 0 && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            求
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <DefaultImagePlaceholder text="画像なし" />
                  )}

                  {/* コンテンツ部分 */}
                  <div className="p-4">
                    {/* 交換情報 */}
                    <div className="mb-3">
                      <div className="flex items-start mb-2">
                        <span className="text-xs font-medium text-gray-500 w-8 mt-0.5">譲)</span>
                        <span className="text-sm font-bold text-gray-900 flex-1 line-clamp-2">
                          {post.give_item}
                        </span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-xs font-medium text-gray-500 w-8 mt-0.5">求)</span>
                        <span className="text-sm font-bold text-gray-900 flex-1 line-clamp-2">
                          {post.want_item}
                        </span>
                      </div>
                    </div>

                    {/* 説明（短縮表示） */}
                    {post.description && (
                      <p className="text-gray-600 text-xs mb-3 line-clamp-2">{post.description}</p>
                    )}

                    {/* メタ情報 */}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div>
                        {post.location_name && (
                          <span className="inline-flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {post.location_name}
                          </span>
                        )}
                      </div>
                      <div>{format(new Date(post.created_at), 'M/d', { locale: ja })}</div>
                    </div>

                    {/* ステータスバッジ */}
                    {post.status === 'completed' && (
                      <div className="mt-3 text-center">
                        <span className="inline-block bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded">
                          取引完了
                        </span>
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

export default TradePostsPage;
