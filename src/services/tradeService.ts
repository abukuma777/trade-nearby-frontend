/**
 * 交換機能APIサービス
 * 交換リクエストとチャット機能の管理
 */

import apiClient, { ApiResponse } from './api';

// ========================================
// 型定義
// ========================================

export interface TradeRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: 'pending' | 'trading' | 'rejected' | 'cancelled' | 'completed';
  message?: string;
  meeting_place?: string;
  meeting_date?: string;
  created_at: string;
  updated_at: string;
  from_user?: UserInfo;
  to_user?: UserInfo;
  trade_request_items?: TradeRequestItem[];
}

export interface UserInfo {
  id: string;
  display_name: string;
  avatar_url?: string;
}

export interface TradeRequestItem {
  item_id: string;
  type: 'offer' | 'request';
  items?: ItemInfo;
}

export interface ItemInfo {
  id: string;
  title: string;
  description?: string;
  images?: string[];
  category?: string;
  condition?: string;
}

export interface TradeNotification {
  id: string;
  user_id: string;
  trade_id: string;
  type: 'request' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  message: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  trade_request?: TradeRequest;
}

export interface ChatMessage {
  id: string;
  trade_request_id: string;
  sender_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  sender?: UserInfo;
}

export interface CreateTradeRequestDto {
  to_user_id: string;
  offer_post_ids: string[];
  request_post_ids: string[];
  message?: string;
  meeting_place?: string;
  meeting_date?: string;
}

// ========================================
// TradeService クラス
// ========================================

class TradeService {
  private basePath = '/trades';

  /**
   * 交換リクエストを作成
   */
  async createRequest(data: CreateTradeRequestDto): Promise<TradeRequest> {
    try {
      const response = await apiClient.post<ApiResponse<TradeRequest>>(
        `${this.basePath}/request`,
        data,
      );
      return response.data.data!;
    } catch (error) {
      console.error('交換リクエスト作成エラー:', error);
      throw error;
    }
  }

  /**
   * 自分が送信した交換リクエスト一覧を取得
   */
  async getMyRequests(): Promise<TradeRequest[]> {
    try {
      const response = await apiClient.get<ApiResponse<TradeRequest[]>>(
        `${this.basePath}/my-requests`,
      );
      return response.data.data || [];
    } catch (error) {
      console.error('送信済みリクエスト取得エラー:', error);
      throw error;
    }
  }

  /**
   * 自分宛の交換リクエスト一覧を取得
   */
  async getReceivedRequests(): Promise<TradeRequest[]> {
    try {
      const response = await apiClient.get<ApiResponse<TradeRequest[]>>(
        `${this.basePath}/received`,
      );
      return response.data.data || [];
    } catch (error) {
      console.error('受信リクエスト取得エラー:', error);
      throw error;
    }
  }

  /**
   * 特定の交換リクエストの詳細を取得
   */
  async getRequestDetail(id: string): Promise<TradeRequest> {
    try {
      const response = await apiClient.get<ApiResponse<TradeRequest>>(`${this.basePath}/${id}`);
      return response.data.data!;
    } catch (error) {
      console.error('リクエスト詳細取得エラー:', error);
      throw error;
    }
  }

  /**
   * 交換リクエストを承認
   */
  async acceptRequest(id: string): Promise<TradeRequest> {
    try {
      const response = await apiClient.post<ApiResponse<TradeRequest>>(
        `${this.basePath}/${id}/approve`,
        {},
      );
      return response.data.data!;
    } catch (error) {
      console.error('リクエスト承認エラー:', error);
      throw error;
    }
  }

  /**
   * 交換リクエストを拒否
   */
  async rejectRequest(id: string): Promise<TradeRequest> {
    try {
      const response = await apiClient.put<ApiResponse<TradeRequest>>(
        `${this.basePath}/${id}/reject`,
      );
      return response.data.data!;
    } catch (error) {
      console.error('リクエスト拒否エラー:', error);
      throw error;
    }
  }

  /**
   * 交換リクエストをキャンセル
   */
  async cancelRequest(id: string): Promise<TradeRequest> {
    try {
      const response = await apiClient.put<ApiResponse<TradeRequest>>(
        `${this.basePath}/${id}/cancel`,
      );
      return response.data.data!;
    } catch (error) {
      console.error('リクエストキャンセルエラー:', error);
      throw error;
    }
  }

  /**
   * 交換を完了
   */
  async completeRequest(
    id: string,
    data?: { rating?: number; comment?: string },
  ): Promise<TradeRequest> {
    try {
      const response = await apiClient.post<ApiResponse<TradeRequest>>(
        `${this.basePath}/${id}/complete`,
        data,
      );
      return response.data.data!;
    } catch (error) {
      console.error('交換完了エラー:', error);
      throw error;
    }
  }

  // ========================================
  // チャット機能
  // ========================================

  /**
   * チャットメッセージを送信
   */
  async sendChatMessage(tradeRequestId: string, message: string): Promise<ChatMessage> {
    try {
      const response = await apiClient.post<ApiResponse<ChatMessage>>(
        `${this.basePath}/${tradeRequestId}/chat`,
        { message },
      );
      return response.data.data!;
    } catch (error) {
      console.error('メッセージ送信エラー:', error);
      throw error;
    }
  }

  /**
   * チャットメッセージ一覧を取得
   */
  async getChatMessages(
    tradeRequestId: string,
    params?: { limit?: number; offset?: number },
  ): Promise<{ messages: ChatMessage[]; pagination: { limit: number; offset: number } }> {
    try {
      const response = await apiClient.get<
        ApiResponse<ChatMessage[]> & { pagination: { limit: number; offset: number } }
      >(`${this.basePath}/${tradeRequestId}/chat`, { params });

      return {
        messages: response.data.data || [],
        pagination: response.data.pagination || { limit: 50, offset: 0 },
      };
    } catch (error) {
      console.error('メッセージ取得エラー:', error);
      throw error;
    }
  }

  /**
   * 未読チャット数を取得
   */
  async getUnreadChatCount(tradeRequestId: string): Promise<number> {
    try {
      const response = await apiClient.get<ApiResponse<{ unread_count: number }>>(
        `${this.basePath}/${tradeRequestId}/chat/unread-count`,
      );
      return response.data.data?.unread_count || 0;
    } catch (error) {
      console.error('未読数取得エラー:', error);
      return 0;
    }
  }

  // ========================================
  // 通知機能
  // ========================================

  /**
   * 通知一覧を取得
   */
  async getNotifications(params?: {
    limit?: number;
    offset?: number;
    unread_only?: boolean;
  }): Promise<{
    notifications: TradeNotification[];
    unread_count: number;
  }> {
    try {
      const response = await apiClient.get<
        ApiResponse<TradeNotification[]> & { unread_count: number }
      >(`${this.basePath}/notifications`, { params });
      return {
        notifications: response.data.data || [],
        unread_count: response.data.unread_count || 0,
      };
    } catch (error) {
      console.error('通知取得エラー:', error);
      throw error;
    }
  }

  /**
   * 通知を既読にする
   */
  async markNotificationAsRead(id: string): Promise<TradeNotification> {
    try {
      const response = await apiClient.patch<ApiResponse<TradeNotification>>(
        `${this.basePath}/notifications/${id}/read`,
      );
      return response.data.data!;
    } catch (error) {
      console.error('既読処理エラー:', error);
      throw error;
    }
  }

  /**
   * すべての通知を既読にする
   */
  async markAllNotificationsAsRead(): Promise<{ updated_count: number }> {
    try {
      const response = await apiClient.patch<ApiResponse<{ updated_count: number }>>(
        `${this.basePath}/notifications/read-all`,
      );
      return response.data.data!;
    } catch (error) {
      console.error('一括既読処理エラー:', error);
      throw error;
    }
  }

  /**
   * 未読通知数を取得
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await apiClient.get<ApiResponse<{ unread_count: number }>>(
        `${this.basePath}/notifications/unread-count`,
      );
      return response.data.data?.unread_count || 0;
    } catch (error) {
      console.error('未読数取得エラー:', error);
      return 0;
    }
  }
}

// シングルトンインスタンスをエクスポート
export const tradeService = new TradeService();
