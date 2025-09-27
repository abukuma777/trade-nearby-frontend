/**
 * 交換リクエスト詳細ページ（チャット機能付き）
 * 個別の交換リクエストの詳細情報を表示・管理
 * tradingステータス時にチャット機能を表示
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useTradeStore } from '@/stores/tradeStore';
import { TradeRequest } from '@/services/tradeService';
import { RatingInput, TradeRatingModal } from '@/components/trade';
import TradeChat from '@/components/trade/TradeChat';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Loader,
} from 'lucide-react';

const TradeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    currentRequest,
    isLoading,
    error,
    loadRequestDetail,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    completeRequest,
    clearMessages,
  } = useTradeStore();

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'detail' | 'chat'>('detail');

  // データ読み込み
  useEffect(() => {
    if (id) {
      loadRequestDetail(id);
    }
    return () => {
      clearMessages();
    };
  }, [id]);

  // 評価送信ハンドラー
  const handleRatingSubmit = async (rating: number, comment: string) => {
    await completeRequest(currentRequest!.id, { rating, comment });
    setShowRatingModal(false);
    navigate('/trade');
  };

  // ローディング状態
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-6"></div>
          <div className="bg-white rounded-lg p-6 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // エラー状態
  if (error || !currentRequest) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h2 className="text-2xl font-bold text-red-600 mb-2">エラーが発生しました</h2>
          <p className="text-red-600 mb-4">{error || 'リクエストが見つかりませんでした'}</p>
          <button
            onClick={() => navigate('/trade')}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  // ユーザータイプの判定
  const isSender = user?.id === currentRequest.from_user_id;
  const isReceiver = user?.id === currentRequest.to_user_id;
  const otherUser = isSender ? currentRequest.to_user : currentRequest.from_user;

  // ステータスアイコンと色の取得
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: <Clock size={20} />,
          color: 'text-yellow-600 bg-yellow-100',
          label: '保留中',
        };
      case 'trading':
        return {
          icon: <Loader size={20} className="animate-spin" />,
          color: 'text-blue-600 bg-blue-100',
          label: '取引中',
        };
      case 'rejected':
        return {
          icon: <XCircle size={20} />,
          color: 'text-red-600 bg-red-100',
          label: '拒否済み',
        };
      case 'cancelled':
        return {
          icon: <XCircle size={20} />,
          color: 'text-gray-600 bg-gray-100',
          label: 'キャンセル済み',
        };
      case 'completed':
        return {
          icon: <CheckCircle size={20} />,
          color: 'text-green-600 bg-green-100',
          label: '完了',
        };
      default:
        return {
          icon: <AlertCircle size={20} />,
          color: 'text-gray-600 bg-gray-100',
          label: status,
        };
    }
  };

  const statusDisplay = getStatusDisplay(currentRequest.status);

  // アクションハンドラー
  const handleAccept = async () => {
    if (
      window.confirm(
        'この交換リクエストを承認しますか？承認すると取引が開始され、チャット機能が有効になります。',
      )
    ) {
      await acceptRequest(currentRequest.id);
    }
  };

  const handleReject = async () => {
    if (window.confirm('この交換リクエストを拒否しますか？')) {
      await rejectRequest(currentRequest.id);
    }
  };

  const handleCancel = async () => {
    if (window.confirm('この交換リクエストをキャンセルしますか？')) {
      await cancelRequest(currentRequest.id);
    }
  };

  // アイテムの分離
  const offerItems =
    currentRequest.trade_request_items?.filter((item) => item.type === 'offer') || [];
  const requestItems =
    currentRequest.trade_request_items?.filter((item) => item.type === 'request') || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* ヘッダー */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/trade')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          <span>一覧に戻る</span>
        </button>

        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold">交換リクエスト詳細</h1>
          <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${statusDisplay.color}`}>
            {statusDisplay.icon}
            <span className="font-medium">{statusDisplay.label}</span>
          </div>
        </div>
      </div>

      {/* タブナビゲーション（trading時のみ表示） */}
      {currentRequest.status === 'trading' && (
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('detail')}
            className={`pb-2 px-1 border-b-2 transition-colors ${
              activeTab === 'detail'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            詳細情報
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`pb-2 px-1 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'chat'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <MessageSquare size={18} />
            チャット
          </button>
        </div>
      )}

      {/* メインコンテンツ */}
      {currentRequest.status === 'trading' && activeTab === 'chat' ? (
        // チャット画面
        <TradeChat
          tradeRequestId={currentRequest.id}
          otherUserId={otherUser?.id || ''}
          otherUserName={otherUser?.display_name || '不明なユーザー'}
          otherUserAvatar={otherUser?.avatar_url}
        />
      ) : (
        // 詳細画面
        <div className="bg-white rounded-lg shadow-sm border">
          {/* 相手ユーザー情報 */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {otherUser?.avatar_url ? (
                  <img
                    src={otherUser.avatar_url}
                    alt={otherUser.display_name}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-semibold text-lg">
                      {otherUser?.display_name?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-lg">
                    {otherUser?.display_name || '不明なユーザー'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {isSender ? 'リクエスト送信先' : 'リクエスト送信元'}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(currentRequest.created_at), {
                  addSuffix: true,
                  locale: ja,
                })}
              </p>
            </div>
          </div>

          {/* メッセージ */}
          {currentRequest.message && (
            <div className="p-6 border-b">
              <div className="flex items-start gap-2">
                <MessageSquare size={20} className="text-gray-400 mt-1" />
                <div className="flex-1">
                  <h3 className="font-medium mb-2">メッセージ</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{currentRequest.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* アイテム情報 */}
          <div className="p-6 border-b">
            <h3 className="font-medium mb-4">交換アイテム</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {/* 提供アイテム */}
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-3">
                  {isSender ? 'あなたが提供' : `${otherUser?.display_name}が提供`}
                </h4>
                <div className="space-y-2">
                  {offerItems.length > 0 ? (
                    offerItems.map((item) => <ItemCard key={item.item_id} item={item.items} />)
                  ) : (
                    <p className="text-sm text-gray-500">アイテム情報なし</p>
                  )}
                </div>
              </div>

              {/* 矢印（モバイル時は非表示） */}
              <div className="hidden md:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
                <div className="text-gray-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>
              </div>

              {/* 希望アイテム */}
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-3">
                  {isSender ? `${otherUser?.display_name}が提供` : 'あなたが提供'}
                </h4>
                <div className="space-y-2">
                  {requestItems.length > 0 ? (
                    requestItems.map((item) => <ItemCard key={item.item_id} item={item.items} />)
                  ) : (
                    <p className="text-sm text-gray-500">アイテム情報なし</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 待ち合わせ情報 */}
          {(currentRequest.meeting_place || currentRequest.meeting_date) && (
            <div className="p-6 border-b">
              <h3 className="font-medium mb-3">待ち合わせ情報</h3>
              <div className="space-y-2">
                {currentRequest.meeting_place && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin size={18} className="text-gray-400" />
                    <span>{currentRequest.meeting_place}</span>
                  </div>
                )}
                {currentRequest.meeting_date && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar size={18} className="text-gray-400" />
                    <span>{new Date(currentRequest.meeting_date).toLocaleString('ja-JP')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* アクションボタン */}
          {currentRequest.status === 'pending' && (
            <div className="p-6 bg-gray-50">
              <div className="flex justify-end gap-3">
                {isReceiver ? (
                  <>
                    <button
                      onClick={handleReject}
                      className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
                    >
                      拒否する
                    </button>
                    <button
                      onClick={handleAccept}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      承認する
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-gray-600 border border-gray-600 rounded-lg hover:bg-gray-50"
                  >
                    キャンセル
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 取引中の場合の案内と完了ボタン */}
          {currentRequest.status === 'trading' && (
            <div className="p-6 bg-blue-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-700 font-medium">取引が進行中です</p>
                  <p className="text-blue-600 text-sm mt-1">
                    チャットで詳細を相談し、実際に交換が完了したら「交換を完了」ボタンを押してください
                  </p>
                </div>
                <button
                  onClick={() => setShowRatingModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
                >
                  交換を完了
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 評価モーダル */}
      <TradeRatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleRatingSubmit}
        otherUserName={otherUser?.display_name || '相手ユーザー'}
        tradeId={currentRequest.id}
      />
    </div>
  );
};

// アイテムカードコンポーネント
const ItemCard: React.FC<{ item?: any }> = ({ item }) => {
  if (!item) {
    return <div className="p-3 bg-gray-100 rounded-lg text-sm text-gray-500">アイテム情報なし</div>;
  }

  return (
    <Link
      to={`/items/${item.id}`}
      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
    >
      {item.images?.[0] && (
        <img src={item.images[0]} alt={item.title} className="w-16 h-16 object-cover rounded" />
      )}
      <div className="flex-1">
        <p className="font-medium">{item.title}</p>
        <p className="text-sm text-gray-500">
          {item.category} / {item.condition}
        </p>
      </div>
    </Link>
  );
};

export default TradeDetailPage;
