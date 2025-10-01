const API_URL = String(import.meta.env.VITE_API_URL || 'http://localhost:3000');

export interface Notification {
  id: string;
  user_id: string;
  type: 'trade_chat' | 'offer_accepted' | 'offer_received' | 'trade_completed';
  data: {
    title: string;
    message: string;
    sender_name?: string;
    trade_post_id?: string;
    chat_room_id?: string;
  };
  related_url?: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

class NotificationService {
  private listeners: Set<(notification: Notification) => void> = new Set();
  private userId: string | null = null;
  private pollingInterval: NodeJS.Timeout | null = null;

  /**
   * 認証トークンを取得
   */
  private getAuthHeader(): HeadersInit {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('No access token found in localStorage');
      return {};
    }
    return { Authorization: `Bearer ${token}` };
  }

  /**
   * 通知サービスを初期化
   */
  initialize(userId: string): void {
    this.userId = userId;
    this.startPolling();
  }

  /**
   * ポーリングを開始（リアルタイムの代替）
   */
  private startPolling(): void {
    if (!this.userId) {
      return;
    }

    // 既存のポーリングを停止
    this.stopPolling();

    // 30秒ごとに新着通知をチェック
    this.pollingInterval = setInterval(() => {
      void this.checkNewNotifications();
    }, 30000);

    // 初回はすぐに実行
    void this.checkNewNotifications();
  }

  /**
   * ポーリングを停止
   */
  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * 新着通知をチェック
   */
  private async checkNewNotifications(): Promise<void> {
    try {
      const lastCheck = localStorage.getItem('lastNotificationCheck');
      const notifications = await this.getUnreadNotifications();

      if (lastCheck) {
        // 最後のチェック以降の新着通知を処理
        const lastCheckTime = new Date(lastCheck).getTime();
        const newNotifications = notifications.filter(
          (n) => new Date(n.created_at).getTime() > lastCheckTime,
        );

        newNotifications.forEach((notification) => {
          this.handleNewNotification(notification);
        });
      }

      localStorage.setItem('lastNotificationCheck', new Date().toISOString());
    } catch (error) {
      console.error('Failed to check new notifications:', error);
    }
  }

  /**
   * 新着通知を処理
   */
  private handleNewNotification(notification: Notification): void {
    // 登録されているリスナーに通知
    this.listeners.forEach((listener) => {
      listener(notification);
    });

    // ブラウザ通知を表示（権限があれば）
    void this.showBrowserNotification(notification);
  }

  /**
   * ブラウザ通知を表示
   */
  private async showBrowserNotification(
    notification: Notification,
  ): Promise<void> {
    if (!('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      const { title, message } = notification.data;
      new Notification(title, {
        body: message,
        icon: '/logo192.png',
        tag: notification.id,
      });
    } else if (Notification.permission !== 'denied') {
      // 権限をリクエスト
      await Notification.requestPermission();
    }
  }

  /**
   * 通知リスナーを登録
   */
  onNotification(callback: (notification: Notification) => void): () => void {
    this.listeners.add(callback);
    // クリーンアップ関数を返す
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * 未読通知を取得
   */
  async getUnreadNotifications(): Promise<Notification[]> {
    try {
      const authHeader = this.getAuthHeader();
      const response = await fetch(
        `${API_URL}/api/notifications?unread_only=true`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = (await response.json()) as {
        data?: { notifications?: Notification[] };
      };
      return data.data?.notifications || [];
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return [];
    }
  }

  /**
   * 全通知を取得（ページネーション対応）
   */
  async getAllNotifications(
    page = 1,
    limit = 20,
  ): Promise<{
    notifications: Notification[];
    hasMore: boolean;
  }> {
    try {
      const authHeader = this.getAuthHeader();
      const response = await fetch(
        `${API_URL}/api/notifications?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = (await response.json()) as {
        data?: { notifications?: Notification[]; hasMore?: boolean };
      };
      return {
        notifications: data.data?.notifications || [],
        hasMore: data.data?.hasMore || false,
      };
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return { notifications: [], hasMore: false };
    }
  }

  /**
   * 未読通知数を取得
   */
  async getUnreadCount(): Promise<number> {
    try {
      const authHeader = this.getAuthHeader();
      const response = await fetch(
        `${API_URL}/api/notifications/unread-count`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch unread count');
      }

      const data = (await response.json()) as { data?: { count?: number } };
      return data.data?.count || 0;
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      return 0;
    }
  }

  /**
   * 通知を既読にする
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const authHeader = this.getAuthHeader();
      const response = await fetch(
        `${API_URL}/api/notifications/${notificationId}/read`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  /**
   * 全通知を既読にする
   */
  async markAllAsRead(): Promise<void> {
    try {
      const authHeader = this.getAuthHeader();
      const response = await fetch(
        `${API_URL}/api/notifications/mark-all-read`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }

  /**
   * 通知を削除
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const authHeader = this.getAuthHeader();
      const response = await fetch(
        `${API_URL}/api/notifications/${notificationId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }

  /**
   * サービスをリセット
   */
  reset(): void {
    this.stopPolling();
    this.listeners.clear();
    this.userId = null;
  }
}

// シングルトンインスタンスをエクスポート
export const notificationService = new NotificationService();
