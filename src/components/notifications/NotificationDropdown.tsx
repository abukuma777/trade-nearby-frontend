import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import {
  notificationService,
  type Notification,
} from '@/services/notificationService';

interface NotificationDropdownProps {
  userId: string;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  userId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 初期化とリアルタイム接続
  useEffect(() => {
    void notificationService.initialize(userId);
    void loadNotifications();
    void loadUnreadCount();

    // 新着通知のリスナー登録
    const unsubscribe = notificationService.onNotification((notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    // クリーンアップ
    return () => {
      unsubscribe();
    };
  }, [userId]);

  // ドロップダウン外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return (): void => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 通知を読み込む
  const loadNotifications = async (): Promise<void> => {
    setLoading(true);
    try {
      const unreadNotifications =
        await notificationService.getUnreadNotifications();
      setNotifications(unreadNotifications);
    } finally {
      setLoading(false);
    }
  };

  // 未読数を読み込む
  const loadUnreadCount = async (): Promise<void> => {
    const count = await notificationService.getUnreadCount();
    setUnreadCount(count);
  };

  // 通知をクリック
  const handleNotificationClick = async (
    notification: Notification,
  ): Promise<void> => {
    if (!notification.is_read) {
      await notificationService.markAsRead(notification.id);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, is_read: true } : n,
        ),
      );
    }
    setIsOpen(false);
  };

  // 全て既読にする
  const handleMarkAllAsRead = async (): Promise<void> => {
    await notificationService.markAllAsRead();
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ベルアイコンボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 transition-colors hover:text-blue-600"
        aria-label="通知"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* 未読バッジ */}
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex translate-x-1/2 transform items-center justify-center rounded-full bg-red-500 px-2 py-1 text-xs font-bold leading-none text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* ドロップダウンメニュー */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 flex max-h-[500px] w-80 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl sm:w-96">
          {/* ヘッダー */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <h3 className="text-lg font-semibold text-gray-900">通知</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => void handleMarkAllAsRead()}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                すべて既読にする
              </button>
            )}
          </div>

          {/* 通知リスト */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">読み込み中...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
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
                <p className="mt-2">新しい通知はありません</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <Link
                    key={notification.id}
                    to={notification.related_url || '#'}
                    onClick={() => void handleNotificationClick(notification)}
                    className={`block px-4 py-3 transition-colors hover:bg-gray-50 ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* アイコン */}
                      <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border ${getNotificationColor(
                          notification.type,
                        )}`}
                      >
                        <span className="text-lg">
                          {getNotificationIcon(notification.type)}
                        </span>
                      </div>

                      {/* コンテンツ */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {notification.data.title}
                        </p>
                        <p className="line-clamp-2 text-sm text-gray-600">
                          {notification.data.message}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {formatDistanceToNow(
                            new Date(notification.created_at),
                            {
                              addSuffix: true,
                              locale: ja,
                            },
                          )}
                        </p>
                      </div>

                      {/* 未読インジケーター */}
                      {!notification.is_read && (
                        <div className="flex-shrink-0">
                          <div className="h-2 w-2 rounded-full bg-blue-600" />
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* フッター */}
          <div className="border-t border-gray-200 px-4 py-3">
            <Link
              to="/notifications"
              className="block text-center text-sm text-blue-600 hover:text-blue-700"
              onClick={() => setIsOpen(false)}
            >
              すべての通知を見る
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
