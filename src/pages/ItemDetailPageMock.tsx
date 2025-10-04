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
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">エラーが発生しました</h2>
          <p className="text-red-600 mb-4">アイテムが見つかりませんでした（ID: {id}）</p>
          <button
            onClick={() => navigate('/items')}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  // 日付フォーマット
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 開発モード表示 */}
      <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 rounded-lg text-center">
        ⚠️ 開発モード：モックデータを表示中
      </div>

      {/* 戻るボタン */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        <span>戻る</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 画像セクション */}
        <div className="space-y-4">
          {/* メイン画像 */}
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {item.images && item.images.length > 0 ? (
              <img
                src={item.images[0]}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-image.svg';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Package size={64} />
              </div>
            )}
          </div>

          {/* サムネイル画像 */}
          {item.images && item.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {item.images.slice(0, 4).map((image, index) => (
                <div
                  key={index}
                  className="aspect-square bg-gray-100 rounded overflow-hidden cursor-pointer hover:opacity-80"
                >
                  <img
                    src={image}
                    alt={`${item.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-image.svg';
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
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{item.title}</h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
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
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {categoryLabels[item.category]}
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                {conditionLabels[item.condition]}
              </span>
            </div>
          </div>

          {/* 説明文 */}
          <div>
            <h2 className="text-lg font-semibold mb-2">商品説明</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{item.description}</p>
          </div>

          {/* タグ */}
          {item.tags && item.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Tag size={18} />
                タグ
              </h3>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/items?tags=${tag}`}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
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
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <MapPin size={18} />
                場所
              </h3>
              <p className="text-gray-700">
                {item.location.prefecture && item.location.city
                  ? `${item.location.prefecture} ${item.location.city}`
                  : item.location.address || '場所情報なし'}
              </p>
              {item.distance && (
                <p className="text-sm text-gray-500 mt-1">
                  現在地から約{item.distance.toFixed(1)}km
                </p>
              )}
            </div>
          )}

          {/* 出品者情報 */}
          {item.user && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-3">出品者情報</h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  {item.user.avatar ? (
                    <img
                      src={item.user.avatar}
                      alt={item.user.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 text-lg font-semibold">
                      {item.user.username[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold">{item.user.username}</p>
                  <p className="text-sm text-gray-500">ID: {item.user.id.slice(0, 8)}...</p>
                </div>
              </div>
            </div>
          )}

          {/* 投稿日時 */}
          <div className="text-sm text-gray-500 flex items-center gap-2 border-t pt-6">
            <Calendar size={16} />
            <span>投稿日: {formatDate(item.created_at)}</span>
            {item.updated_at !== item.created_at && (
              <span className="ml-4">更新日: {formatDate(item.updated_at)}</span>
            )}
          </div>

          {/* アクションボタン */}
          <div className="flex gap-4 pt-4">
            <button
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              onClick={() => {
                alert('交換リクエスト機能は実装予定です');
              }}
              disabled={item.status !== 'active'}
            >
              交換リクエスト
            </button>
            <button
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              onClick={() => {
                alert('お気に入り機能は実装予定です');
              }}
            >
              ♡ お気に入り
            </button>
          </div>
        </div>
      </div>

      {/* 関連アイテム */}
      <div className="mt-12 pt-8 border-t">
        <h2 className="text-2xl font-bold mb-6">関連アイテム</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockItems
            .filter(
              (relatedItem) => relatedItem.id !== item.id && relatedItem.category === item.category,
            )
            .slice(0, 4)
            .map((relatedItem) => (
              <Link key={relatedItem.id} to={`/items/${relatedItem.id}`}>
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={relatedItem.images?.[0] || ''}
                      alt={relatedItem.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-image.svg';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-1">{relatedItem.title}</h3>
                    <p className="text-xs text-gray-500">
                      {relatedItem.location?.prefecture} {relatedItem.location?.city}
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
