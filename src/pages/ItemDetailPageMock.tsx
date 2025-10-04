/**
 * アイテム詳細ページコンポーネント（モックデータ版）
 * 開発・テスト用にモックデータを使用
 */

import { ArrowLeft, MapPin, Calendar, Tag, Package } from 'lucide-react';
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

import { mockItems } from '@/__mocks__/itemMocks';
import { categoryLabels, conditionLabels, statusLabels } from '@/types/item';

const ItemDetailPageMock: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // モックデータから該当アイテムを取得
  const item = mockItems.find((item) => item.id === id);

  // アイテムが見つからない場合
  if (!item) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <h2 className="mb-2 text-2xl font-bold text-red-600">
            エラーが発生しました
          </h2>
          <p className="mb-4 text-red-600">
            アイテムが見つかりませんでした（ID: {id}）
          </p>
          <button
            onClick={() => navigate('/items')}
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  // 日付フォーマット
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 開発モード表示 */}
      <div className="mb-4 rounded-lg bg-yellow-100 p-2 text-center text-yellow-800">
        ⚠️ 開発モード：モックデータを表示中
      </div>

      {/* 戻るボタン */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={20} />
        <span>戻る</span>
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* 画像セクション */}
        <div className="space-y-4">
          {/* メイン画像 */}
          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
            {item.images && item.images.length > 0 ? (
              <img
                src={item.images[0]}
                alt={item.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-image.svg';
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-400">
                <Package size={64} />
              </div>
            )}
          </div>

          {/* サムネイル画像 */}
          {item.images && item.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {item.images.slice(0, 4).map((image) => (
                <div
                  key={`thumb-${image}`}
                  className="aspect-square cursor-pointer overflow-hidden rounded bg-gray-100 hover:opacity-80"
                >
                  <img
                    src={image}
                    alt={`${item.title} thumbnail`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        '/placeholder-image.svg';
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 詳細情報セクション */}
        <div className="space-y-6">
          {/* タイトルとステータス */}
          <div>
            <div className="mb-2 flex items-start justify-between">
              <h1 className="text-3xl font-bold text-gray-900">{item.title}</h1>
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  item.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : item.status === 'reserved'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                }`}
              >
                {statusLabels[item.status]}
              </span>
            </div>

            {/* カテゴリとコンディション */}
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                {categoryLabels[item.category]}
              </span>
              <span className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-800">
                {conditionLabels[item.condition]}
              </span>
            </div>
          </div>

          {/* 説明文 */}
          <div>
            <h2 className="mb-2 text-lg font-semibold">商品説明</h2>
            <p className="whitespace-pre-wrap text-gray-700">
              {item.description}
            </p>
          </div>

          {/* タグ */}
          {item.tags && item.tags.length > 0 && (
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold">
                <Tag size={18} />
                タグ
              </h3>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/items?tags=${tag}`}
                    className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 位置情報 */}
          {item.location && (
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold">
                <MapPin size={18} />
                場所
              </h3>
              <p className="text-gray-700">
                {item.location.prefecture && item.location.city
                  ? `${item.location.prefecture} ${item.location.city}`
                  : item.location.address || '場所情報なし'}
              </p>
              {item.distance && (
                <p className="mt-1 text-sm text-gray-500">
                  現在地から約{item.distance.toFixed(1)}km
                </p>
              )}
            </div>
          )}

          {/* 出品者情報 */}
          {item.user && (
            <div className="border-t pt-6">
              <h3 className="mb-3 text-lg font-semibold">出品者情報</h3>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                  {item.user.avatar ? (
                    <img
                      src={item.user.avatar}
                      alt={item.user.username}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-semibold text-gray-600">
                      {item.user.username[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold">{item.user.username}</p>
                  <p className="text-sm text-gray-500">
                    ID: {item.user.id.slice(0, 8)}...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 投稿日時 */}
          <div className="flex items-center gap-2 border-t pt-6 text-sm text-gray-500">
            <Calendar size={16} />
            <span>投稿日: {formatDate(item.created_at)}</span>
            {item.updated_at !== item.created_at && (
              <span className="ml-4">
                更新日: {formatDate(item.updated_at)}
              </span>
            )}
          </div>

          {/* アクションボタン */}
          <div className="flex gap-4 pt-4">
            <button
              className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
              onClick={() => {
                // TODO: 交換リクエスト機能を実装
                // トースト通知を実装予定
              }}
              disabled={item.status !== 'active'}
            >
              交換リクエスト
            </button>
            <button
              className="rounded-lg border border-gray-300 px-6 py-3 hover:bg-gray-50"
              onClick={() => {
                // TODO: お気に入り機能を実装
                // トースト通知を実装予定
              }}
            >
              ♡ お気に入り
            </button>
          </div>
        </div>
      </div>

      {/* 関連アイテム */}
      <div className="mt-12 border-t pt-8">
        <h2 className="mb-6 text-2xl font-bold">関連アイテム</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {mockItems
            .filter(
              (relatedItem) =>
                relatedItem.id !== item.id &&
                relatedItem.category === item.category,
            )
            .slice(0, 4)
            .map((relatedItem) => (
              <Link key={relatedItem.id} to={`/items/${relatedItem.id}`}>
                <div className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg">
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={relatedItem.images?.[0] || ''}
                      alt={relatedItem.title}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          '/placeholder-image.svg';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="mb-1 line-clamp-1 text-sm font-semibold">
                      {relatedItem.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {relatedItem.location?.prefecture}{' '}
                      {relatedItem.location?.city}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ItemDetailPageMock;
