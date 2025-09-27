/**
 * 交換リクエスト一覧ページ
 * 送信済み/受信済みリクエストの表示と管理
 */

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTradeStore } from '@/stores/tradeStore';
import { useAuthStore } from '@/stores/authStore';
import { TradeRequest } from '@/services/tradeService';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import TradeChatList from '@/components/trade/TradeChatList';

// ========================================
// メインコンポーネント
// ========================================

const TradePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sent' | 'received' | 'trading' | 'completed'>(
    'received',
  );
  const user = useAuthStore((state) => state.user);

  const {
    myRequests,
    receivedRequests,
    isLoading,
    error,
    successMessage,
    loadMyRequests,
    loadReceivedRequests,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    clearMessages,
  } = useTradeStore();

  // データ読み込み
  useEffect(() => {
    if (activeTab === 'sent') {
      loadMyRequests();
    } else if (activeTab === 'received') {
      loadReceivedRequests();
    } else if (activeTab === 'trading' || activeTab === 'completed') {
      // 取引中または完了のタブの場合、チャットルーム一覧は別コンポーネントで取得
      // ここでは従来のリクエストは読み込まない
    }
  }, [activeTab]);

  // メッセージクリア
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        clearMessages();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  // 表示するリクエストをフィルタリング
  const getFilteredRequests = () => {
    if (activeTab === 'sent') {
      return myRequests;
    } else if (activeTab === 'received') {
      return receivedRequests;
    } else {
      // trading タブの場合、両方から取引中のものを取得
      const allRequests = [...myRequests, ...receivedRequests];
      // 重複を削除
      const uniqueRequests = allRequests.filter(
        (request, index, self) => index === self.findIndex((r) => r.id === request.id),
      );
      return uniqueRequests.filter((r) => r.status === 'trading');
    }
  };

  const requests = getFilteredRequests();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">交換リクエスト</h1>
        <p className="text-gray-600">アイテムの交換リクエストを管理できます</p>
      </div>

      {/* メッセージ表示 */}
      {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">{successMessage}</div>
      )}

      {/* タブ */}
      <div className="mb-6 border-b">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('received')}
            className={`pb-3 px-1 font-medium transition-colors ${
              activeTab === 'received'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            受信したリクエスト
            {receivedRequests.filter((r) => r.status === 'pending').length > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                {receivedRequests.filter((r) => r.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`pb-3 px-1 font-medium transition-colors ${
              activeTab === 'sent'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            送信したリクエスト
          </button>
          <button
            onClick={() => setActiveTab('trading')}
            className={`pb-3 px-1 font-medium transition-colors ${
              activeTab === 'trading'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            取引中
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`pb-3 px-1 font-medium transition-colors ${
              activeTab === 'completed'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            取引完了
          </button>
        </div>
      </div>

      {/* ローディング */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      )}

      {/* リクエスト一覧 */}
      {!isLoading && (
        <>
          {activeTab === 'trading' ? (
            // 取引中タブの場合
            <TradeChatList status="active" />
          ) : activeTab === 'completed' ? (
            // 取引完了タブの場合
            <TradeChatList status="completed" />
          ) : (
            // その他のタブは従来のリクエスト一覧を表示
            <div className="space-y-4">
              {requests.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">
                    {activeTab === 'sent'
                      ? '送信したリクエストはありません'
                      : '受信したリクエストはありません'}
                  </p>
                </div>
              ) : (
                requests.map((request) => (
                  <TradeRequestCard
                    key={request.id}
                    request={request}
                    type={request.from_user_id === user?.id ? 'sent' : 'received'}
                    onAccept={acceptRequest}
                    onReject={rejectRequest}
                    onCancel={cancelRequest}
                  />
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* 交換リクエスト作成ボタン */}
      <Link
        to="/items"
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </Link>
    </div>
  );
};

// ========================================
// サブコンポーネント
// ========================================

interface TradeRequestCardProps {
  request: TradeRequest;
  type: 'sent' | 'received';
  onAccept: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
}

const TradeRequestCard: React.FC<TradeRequestCardProps> = ({
  request,
  type,
  onAccept,
  onReject,
  onCancel,
}) => {
  const [isActioning, setIsActioning] = useState(false);

  // アクション処理
  const handleAction = async (action: () => Promise<void>) => {
    setIsActioning(true);
    try {
      await action();
    } finally {
      setIsActioning(false);
    }
  };

  // ステータスバッジの色
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'trading':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // ステータステキスト
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '保留中';
      case 'trading':
        return '取引中';
      case 'rejected':
        return '拒否済み';
      case 'cancelled':
        return 'キャンセル済み';
      case 'completed':
        return '完了';
      default:
        return status;
    }
  };

  // 提供アイテムと希望アイテムを分離
  const offerItems = request.trade_request_items?.filter((item) => item.type === 'offer') || [];
  const requestItems = request.trade_request_items?.filter((item) => item.type === 'request') || [];

  const otherUser = type === 'sent' ? request.to_user : request.from_user;

  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* ヘッダー */}
      <Link to={`/trade/${request.id}`} className="block">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            {otherUser?.avatar_url ? (
              <img
                src={otherUser.avatar_url}
                alt={otherUser.display_name}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-semibold">
                  {otherUser?.display_name?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium">{otherUser?.display_name || '不明なユーザー'}</p>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(request.created_at), {
                  addSuffix: true,
                  locale: ja,
                })}
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(request.status)}`}
          >
            {getStatusText(request.status)}
          </span>
        </div>
      </Link>

      {/* メッセージ */}
      <Link to={`/trade/${request.id}`} className="block">
        {request.message && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-700">{request.message}</p>
          </div>
        )}

        {/* アイテム情報 */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* 提供アイテム */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              {type === 'sent' ? '提供するアイテム' : '相手が提供するアイテム'}
            </h3>
            <div className="space-y-2">
              {offerItems.map((item) => (
                <ItemCard key={item.item_id} item={item.items} />
              ))}
            </div>
          </div>

          {/* 希望アイテム */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              {type === 'sent' ? '希望するアイテム' : '相手が希望するアイテム'}
            </h3>
            <div className="space-y-2">
              {requestItems.map((item) => (
                <ItemCard key={item.item_id} item={item.items} />
              ))}
            </div>
          </div>
        </div>

        {/* 待ち合わせ情報 */}
        {(request.meeting_place || request.meeting_date) && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            {request.meeting_place && (
              <p className="text-sm text-gray-700">
                <span className="font-medium">場所:</span> {request.meeting_place}
              </p>
            )}
            {request.meeting_date && (
              <p className="text-sm text-gray-700">
                <span className="font-medium">日時:</span>{' '}
                {new Date(request.meeting_date).toLocaleString('ja-JP')}
              </p>
            )}
          </div>
        )}
      </Link>

      {/* アクションボタン */}
      {request.status === 'pending' && (
        <div className="flex justify-end space-x-2">
          {type === 'received' ? (
            <>
              <button
                onClick={() => handleAction(() => onReject(request.id))}
                disabled={isActioning}
                className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
              >
                拒否
              </button>
              <button
                onClick={() => handleAction(() => onAccept(request.id))}
                disabled={isActioning}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                承認
              </button>
            </>
          ) : (
            <button
              onClick={() => handleAction(() => onCancel(request.id))}
              disabled={isActioning}
              className="px-4 py-2 text-gray-600 border border-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              キャンセル
            </button>
          )}
        </div>
      )}

      {/* 取引中の場合のチャットボタン */}
      {request.status === 'trading' && (
        <div className="flex justify-end space-x-2">
          <Link
            to={`/trade/${request.id}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            チャットを開く
          </Link>
        </div>
      )}
    </div>
  );
};

// アイテム表示コンポーネント
const ItemCard: React.FC<{ item?: any }> = ({ item }) => {
  if (!item) {
    return <div className="p-2 bg-gray-100 rounded text-sm text-gray-500">アイテム情報なし</div>;
  }

  return (
    <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
      {item.images?.[0] && (
        <img src={item.images[0]} alt={item.title} className="w-12 h-12 object-cover rounded" />
      )}
      <div className="flex-1">
        <p className="text-sm font-medium">{item.title}</p>
      </div>
    </div>
  );
};

export default TradePage;
