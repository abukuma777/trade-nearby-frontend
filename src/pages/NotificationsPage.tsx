import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

import {
  notificationService,
  type Notification,
} from '@/services/notificationService';
import { useAuthStore } from '@/stores/authStore';

type FilterType = 'all' | 'unread' | 'read';

const NotificationsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // 通知タイプに応じたアイコンを取得
  const getNotificationIcon = (type: Notification['type']): string => {
    switch (type) {
      case 'trade_chat':
        return '💬';
      case 'offer_accepted':
        return '✅';
      case 'offer_received':
        return '📥';
      case 'trade_completed':
        return '🎉';
      default:
        return '📢';
    }
  };

  // 通知タイプに応じた色を取得
  const getNotificationColor = (type: Notification['type']): string => {
    switch (type) {
      case 'trade_chat':
        return 'bg-blue-50 border-blue-200';
      case 'offer_accepted':
        return 'bg-green-50 border-green-200';
      case 'offer_received':
        return 'bg-yellow-50 border-yellow-200';
      case 'trade_completed':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // 通知を読み込む
  const loadNotifications = useCallback(async (page = 1, resetList = false) => {
    setLoading(true);
    try {
      const result = await notificationService.getAllNotifications(page, 20);

      if (resetList) {
        setNotifications(result.notifications);
      } else {
        setNotifications((prev) => [...prev, ...result.notifications]);
      }

      setHasMore(result.hasMore);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初期化とリアルタイム接続
  useEffect(() => {
    if (!user?.id) {
      return;
    }

    // 初回ロード
    void loadNotifications(1, true);

    // 通知サービスの初期化
    notificationService.initialize(user.id);

    // 新着通知のリスナー登録
    const unsubscribe = notificationService.onNotification((notification) => {
      setNotifications((prev) => {
        // 重複チェック
        const isDuplicate = prev.some((n) => n.id === notification.id);
        if (isDuplicate) {
          return prev;
        }
        return [notification, ...prev];
      });
    });

    // クリーンアップ
    return () => {
      unsubscribe();
    };
  }, [user?.id, loadNotifications]);

  // フィルタリングされた通知を取得
  const filteredNotifications = notifications.filter((notification) => {
    switch (filter) {
      case 'unread':
        return !notification.is_read;
      case 'read':
        return notification.is_read;
      default:
        return true;
    }
  });

  // 通知を既読にする
  const handleMarkAsRead = async (notificationId: string): Promise<void> => {
    await notificationService.markAsRead(notificationId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)),
    );
  };

  // 全て既読にする
  const handleMarkAllAsRead = async (): Promise<void> => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  // 通知を削除
  const handleDeleteNotification = async (
    notificationId: string,
  ): Promise<void> => {
    await notificationService.deleteNotification(notificationId);
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  // もっと読み込む
  const handleLoadMore = (): void => {
    if (!loading && hasMore) {
      void loadNotifications(currentPage + 1);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">通知</h1>
          {unreadCount > 0 && (
            <p className="mt-1 text-sm text-gray-600">
              {unreadCount}件の未読通知があります
            </p>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => void handleMarkAllAsRead()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            すべて既読にする
          </button>
        )}
      </div>

      {/* フィルタータブ */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setFilter('all')}
            className={`whitespace-nowrap border-b-2 px-1 py-2 text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            すべて
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`whitespace-nowrap border-b-2 px-1 py-2 text-sm font-medium transition-colors ${
              filter === 'unread'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            未読
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`whitespace-nowrap border-b-2 px-1 py-2 text-sm font-medium transition-colors ${
              filter === 'read'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            既読
          </button>
        </nav>
      </div>

      {/* 通知リスト */}
      <div className="space-y-4">
        {loading && filteredNotifications.length === 0 ? (
          <div className="py-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="mt-4 text-gray-600">
              {filter === 'unread'
                ? '未読の通知はありません'
                : filter === 'read'
                  ? '既読の通知はありません'
                  : '通知はありません'}
            </p>
          </div>
        ) : (
          <>
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`relative rounded-lg border ${
                  !notification.is_read
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-gray-200 bg-white'
                } p-4 transition-all hover:shadow-md`}
              >
                <div className="flex items-start space-x-4">
                  {/* アイコン */}
                  <div
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 ${getNotificationColor(
                      notification.type,
                    )}`}
                  >
                    <span className="text-xl">
                      {getNotificationIcon(notification.type)}
                    </span>
                  </div>

                  {/* コンテンツ */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-base font-semibold text-gray-900">
                          {notification.data.title}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          {notification.data.message}
                        </p>
                        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                          <span>
                            {formatDistanceToNow(
                              new Date(notification.created_at),
                              {
                                addSuffix: true,
                                locale: ja,
                              },
                            )}
                          </span>
                          {notification.data.sender_name && (
                            <span>from {notification.data.sender_name}</span>
                          )}
                        </div>
                      </div>

                      {/* アクションボタン */}
                      <div className="ml-4 flex items-center space-x-2">
                        {!notification.is_read && (
                          <button
                            onClick={() =>
                              void handleMarkAsRead(notification.id)
                            }
                            className="text-blue-600 hover:text-blue-700"
                            title="既読にする"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() =>
                            void handleDeleteNotification(notification.id)
                          }
                          className="text-gray-400 hover:text-red-600"
                          title="削除"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* 関連リンク */}
                    {notification.related_url && (
                      <div className="mt-3">
                        <Link
                          to={notification.related_url}
                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                        >
                          詳細を見る
                          <svg
                            className="ml-1 h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* 未読インジケーター */}
                {!notification.is_read && (
                  <div className="absolute left-0 top-0 h-full w-1 rounded-l-lg bg-blue-600" />
                )}
              </div>
            ))}

            {/* もっと読み込むボタン */}
            {hasMore && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="rounded-lg bg-gray-100 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? '読み込み中...' : 'もっと読み込む'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
