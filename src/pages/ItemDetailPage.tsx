/**
 * アイテム詳細ページコンポーネント
 * 個別アイテムの詳細情報を表示
 */

import { ArrowLeft, MapPin, Calendar, Tag, Package, Edit, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

import Breadcrumbs from '@/components/common/Breadcrumbs';
import { ImageGallery } from '@/components/gallery';
import RelatedItems from '@/components/items/RelatedItems';
import { TradeRequestModal } from '@/components/trade';
import { UserInfoDetail } from '@/components/user';
import { useItem } from '@/hooks/useItems';
import { itemService } from '@/services/itemService';
import { useAuthStore } from '@/stores/authStore';
import { categoryLabels, conditionLabels, statusLabels } from '@/types/item';

const ItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  // 交換リクエストモーダルの状態管理
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

  // アイテム詳細を取得
  const { data: item, isLoading, error } = useItem(id || '', !!id);

  // 現在のユーザーが所有者かどうかをチェック
  const isOwner = isAuthenticated && item && user?.id === item.user_id;

  // 交換リクエストボタンのハンドラー
  const handleTradeRequest = () => {
    if (!isAuthenticated) {
      // 未ログインの場合はログインページへ
      navigate('/login', { state: { from: `/items/${id}` } });
      return;
    }
    // モーダルを開く
    setIsTradeModalOpen(true);
  };

  // 削除ハンドラー
  const handleDelete = async () => {
    if (!window.confirm('本当にこのアイテムを削除しますか？')) {
      return;
    }

    try {
      await itemService.deleteItem(id!);
      // 削除後は一覧ページへリダイレクト（強制リロード）
      window.location.href = '/items';
    } catch (error) {
      alert('削除に失敗しました');
    }
  };

  // ローディング状態
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-gray-200 rounded mb-4" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 rounded-lg" />
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-32 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // エラー状態
  if (error || !item) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">エラーが発生しました</h2>
          <p className="text-red-600 mb-4">{error?.message || 'アイテムが見つかりませんでした'}</p>
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
      {/* パンくずリスト */}
      <Breadcrumbs
        items={[{ label: 'グッズ一覧', href: '/items' }, { label: item.title || 'アイテム詳細' }]}
      />

      <div className="flex justify-between items-center mb-6">
        {/* 戻るボタン */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
          <span>戻る</span>
        </button>

        {/* 編集・削除ボタン（所有者のみ、交換済み以外で表示） */}
        {isOwner && item.status !== 'traded' && (
          <div className="flex gap-2">
            <Link
              to={`/items/${id}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit size={18} />
              <span>編集</span>
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Trash2 size={18} />
              <span>削除</span>
            </button>
          </div>
        )}

        {/* 交換済みの場合のメッセージ */}
        {isOwner && item.status === 'traded' && (
          <div className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">
            <span className="text-sm">※ 交換済みのアイテムは編集・削除できません</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 画像ギャラリーセクション */}
        <div>
          <ImageGallery images={item.images || []} title={item.title} className="sticky top-4" />
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
              <h3 className="text-lg font-semibold mb-4">出品者情報</h3>
              <UserInfoDetail userId={item.user_id} user={item.user} />
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

          {/* アクションボタン（所有者以外） */}
          {!isOwner && (
            <div className="flex gap-4 pt-4">
              <button
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                onClick={handleTradeRequest}
                disabled={item.status !== 'active'}
              >
                交換リクエスト
              </button>
              <button
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                onClick={() => {
                  // TODO: お気に入り機能を実装
                  alert('お気に入り機能は実装予定です');
                }}
              >
                ♡ お気に入り
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 関連アイテム */}
      <div className="mt-12 pt-8 border-t">
        <h2 className="text-2xl font-bold mb-6">関連アイテム</h2>
        <RelatedItems currentItem={item} />
      </div>

      {/* 交換リクエストモーダル */}
      <TradeRequestModal
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
        targetItem={item}
      />
    </div>
  );
};

export default ItemDetailPage;
