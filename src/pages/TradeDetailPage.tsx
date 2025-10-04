/**
 * 交換リクエスト詳細ページ（チャット機能付き）
 * 個別の交換リクエストの詳細情報を表示・管理
 * tradingステータス時にチャット機能を表示
 */

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
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams, useNavigate, Link } from 'react-router-dom';

import ConfirmModal from '@/components/common/ConfirmModal';
import { TradeRatingModal } from '@/components/trade';
import TradeChat from '@/components/trade/TradeChat';
import { useConfirm } from '@/hooks/useConfirm';
import { useAuthStore } from '@/stores/authStore';
import { useTradeStore } from '@/stores/tradeStore';

const TradeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const confirmModal = useConfirm();
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
  const [processingAction, setProcessingAction] = useState<
    'accept' | 'reject' | 'cancel' | null
  >(null);

  // データ読み込み
  useEffect(() => {
    if (id) {
      void loadRequestDetail(id);
    }
    return () => {
      clearMessages();
    };
  }, [id, loadRequestDetail, clearMessages]);

  // 評価送信ハンドラー
  const handleRatingSubmit = async (
    rating: number,
    comment: string,
  ): Promise<void> => {
    await completeRequest(currentRequest!.id, { rating, comment });
    setShowRatingModal(false);
    navigate('/trade');
  };

  // ローディング状態
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="mb-6 h-8 w-64 rounded bg-gray-200" />
          <div className="space-y-4 rounded-lg bg-white p-6">
            <div className="h-6 w-3/4 rounded bg-gray-200" />
            <div className="h-4 w-1/2 rounded bg-gray-200" />
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="h-32 rounded bg-gray-200" />
              <div className="h-32 rounded bg-gray-200" />
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
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h2 className="mb-2 text-2xl font-bold text-red-600">
            エラーが発生しました
          </h2>
          <p className="mb-4 text-red-600">
            {error || 'リクエストが見つかりませんでした'}
          </p>
          <button
            onClick={() => navigate('/trade')}
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
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
  const otherUser = isSender
    ? currentRequest.to_user
    : currentRequest.from_user;

  // ステータスアイコンと色の取得
  const getStatusDisplay = (
    status: string,
  ): { icon: JSX.Element; color: string; label: string } => {
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
  const handleAccept = async (): Promise<void> => {
    const confirmed = await confirmModal.confirm({
      title: 'リクエストを承認しますか？',
      message: '承認すると、取引が開始されます。',
      confirmText: '承認する',
      cancelText: 'キャンセル',
      variant: 'info',
    });

    if (!confirmed) {
      return;
    }

    setProcessingAction('accept');
    try {
      await acceptRequest(currentRequest.id);
      toast.success('リクエストを承認しました');
    } catch {
      toast.error('承認に失敗しました');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleReject = async (): Promise<void> => {
    const confirmed = await confirmModal.confirm({
      title: 'リクエストを拒否しますか？',
      message: '拒否すると、このリクエストは終了します。',
      confirmText: '拒否する',
      cancelText: 'キャンセル',
      variant: 'warning',
    });

    if (!confirmed) {
      return;
    }

    setProcessingAction('reject');
    try {
      await rejectRequest(currentRequest.id);
      toast.success('リクエストを拒否しました');
    } catch {
      toast.error('拒否に失敗しました');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleCancel = async (): Promise<void> => {
    const confirmed = await confirmModal.confirm({
      title: 'リクエストをキャンセルしますか？',
      message: 'キャンセルすると、このリクエストは終了します。',
      confirmText: 'キャンセルする',
      cancelText: '戻る',
      variant: 'warning',
    });

    if (!confirmed) {
      return;
    }

    setProcessingAction('cancel');
    try {
      await cancelRequest(currentRequest.id);
      toast.success('リクエストをキャンセルしました');
    } catch {
      toast.error('キャンセルに失敗しました');
    } finally {
      setProcessingAction(null);
    }
  };

  // アイテムの分離
  const offerItems =
    currentRequest.trade_request_items?.filter(
      (item) => item.type === 'offer',
    ) || [];
  const requestItems =
    currentRequest.trade_request_items?.filter(
      (item) => item.type === 'request',
    ) || [];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/trade')}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
          <span>一覧に戻る</span>
        </button>

        <div className="flex items-start justify-between">
          <h1 className="text-3xl font-bold">交換リクエスト詳細</h1>
          <div
            className={`flex items-center gap-2 rounded-full px-4 py-2 ${statusDisplay.color}`}
          >
            {statusDisplay.icon}
            <span className="font-medium">{statusDisplay.label}</span>
          </div>
        </div>
      </div>

      {/* タブナビゲーション（trading時のみ表示） */}
      {currentRequest.status === 'trading' && (
        <div className="mb-6 flex gap-4 border-b">
          <button
            onClick={(): void => setActiveTab('detail')}
            className={`border-b-2 px-1 pb-2 transition-colors ${
              activeTab === 'detail'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            詳細情報
          </button>
          <button
            onClick={(): void => setActiveTab('chat')}
            className={`flex items-center gap-2 border-b-2 px-1 pb-2 transition-colors ${
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
        <div className="rounded-lg border bg-white shadow-sm">
          {/* 相手ユーザー情報 */}
          <div className="border-b p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {otherUser?.avatar_url ? (
                  <img
                    src={otherUser.avatar_url}
                    alt={otherUser.display_name}
                    className="h-12 w-12 rounded-full"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-300">
                    <span className="text-lg font-semibold text-gray-600">
                      {otherUser?.display_name?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-lg font-medium">
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
            <div className="border-b p-6">
              <div className="flex items-start gap-2">
                <MessageSquare size={20} className="mt-1 text-gray-400" />
                <div className="flex-1">
                  <h3 className="mb-2 font-medium">メッセージ</h3>
                  <p className="whitespace-pre-wrap text-gray-700">
                    {currentRequest.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* アイテム情報 */}
          <div className="border-b p-6">
            <h3 className="mb-4 font-medium">交換アイテム</h3>
            <div className="grid gap-6 md:grid-cols-2">
              {/* 提供アイテム */}
              <div>
                <h4 className="mb-3 text-sm font-medium text-gray-600">
                  {isSender
                    ? 'あなたが提供'
                    : `${otherUser?.display_name}が提供`}
                </h4>
                <div className="space-y-2">
                  {offerItems.length > 0 ? (
                    offerItems.map((item) => (
                      <ItemCard key={item.item_id} item={item.items} />
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">アイテム情報なし</p>
                  )}
                </div>
              </div>

              {/* 矢印（モバイル時は非表示） */}
              <div className="absolute left-1/2 hidden -translate-x-1/2 transform items-center justify-center md:flex">
                <div className="text-gray-400">
                  <svg
                    className="h-8 w-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
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
                <h4 className="mb-3 text-sm font-medium text-gray-600">
                  {isSender
                    ? `${otherUser?.display_name}が提供`
                    : 'あなたが提供'}
                </h4>
                <div className="space-y-2">
                  {requestItems.length > 0 ? (
                    requestItems.map((item) => (
                      <ItemCard key={item.item_id} item={item.items} />
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">アイテム情報なし</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 待ち合わせ情報 */}
          {(currentRequest.meeting_place || currentRequest.meeting_date) && (
            <div className="border-b p-6">
              <h3 className="mb-3 font-medium">待ち合わせ情報</h3>
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
                    <span>
                      {new Date(currentRequest.meeting_date).toLocaleString(
                        'ja-JP',
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* アクションボタン */}
          {currentRequest.status === 'pending' && (
            <div className="bg-gray-50 p-6">
              <div className="flex justify-end gap-3">
                {isReceiver ? (
                  <>
                    <button
                      onClick={(): void => void handleReject()}
                      disabled={processingAction !== null}
                      className="rounded-lg border border-red-600 px-4 py-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {processingAction === 'reject' ? '拒否中...' : '拒否する'}
                    </button>
                    <button
                      onClick={(): void => void handleAccept()}
                      disabled={processingAction !== null}
                      className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {processingAction === 'accept' ? '承認中...' : '承認する'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={(): void => void handleCancel()}
                    disabled={processingAction !== null}
                    className="rounded-lg border border-gray-600 px-4 py-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {processingAction === 'cancel'
                      ? 'キャンセル中...'
                      : 'キャンセル'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 取引中の場合の案内と完了ボタン */}
          {currentRequest.status === 'trading' && (
            <div className="bg-blue-50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-700">取引が進行中です</p>
                  <p className="mt-1 text-sm text-blue-600">
                    チャットで詳細を相談し、実際に交換が完了したら「交換を完了」ボタンを押してください
                  </p>
                </div>
                <button
                  onClick={(): void => setShowRatingModal(true)}
                  className="whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
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
        onClose={(): void => setShowRatingModal(false)}
        onSubmit={handleRatingSubmit}
        otherUserName={otherUser?.display_name || '相手ユーザー'}
        tradeId={currentRequest.id}
      />

      {/* 確認モーダル */}
      <ConfirmModal
        {...confirmModal.props}
        loading={processingAction !== null}
      />
    </div>
  );
};

// アイテムカードコンポーネント用の型定義
interface ItemCardData {
  id: string;
  images?: string[];
  title: string;
  category: string;
  condition: string;
}

// アイテムカードコンポーネント
const ItemCard: React.FC<{ item?: ItemCardData }> = ({ item }) => {
  if (!item) {
    return (
      <div className="rounded-lg bg-gray-100 p-3 text-sm text-gray-500">
        アイテム情報なし
      </div>
    );
  }

  return (
    <Link
      to={`/items/${item.id}`}
      className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
    >
      {item.images?.[0] && (
        <img
          src={item.images[0]}
          alt={item.title}
          className="h-16 w-16 rounded object-cover"
        />
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
