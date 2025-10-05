/**
 * 取引チャットサービス
 * trade_chat_roomsテーブルとtrade_chat_messagesテーブルを使用
 */

import apiClient from './api';

// 型定義
export interface ChatRoom {
  id: string;
  post1_id: string;
  post2_id: string;
  user1_id: string;
  user2_id: string;
  waiting_user_id: string; // 元の投稿者（待つ側）
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at?: string;
  post1?: TradePost;
  post2?: TradePost;
  user1?: UserInfo;
  user2?: UserInfo;
}

export interface TradePost {
  id: string;
  give_item: string;
  want_item: string;
  give_item_images?: Array<{ url: string }>;
  want_item_images?: Array<{ url: string }>;
  status: 'active' | 'trading' | 'completed';
}

export interface UserInfo {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  sender?: UserInfo;
}

class TradeChatService {
  private basePath = '/trade-chat';

  /**
   * チャットルーム情報を取得
   */
  async getChatRoomById(roomId: string): Promise<ChatRoom> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: ChatRoom;
      }>(`${this.basePath}/rooms/${roomId}`);

      return response.data.data;
    } catch (error) {
      console.error('チャットルーム取得エラー:', error);
      throw error;
    }
  }

  /**
   * チャットメッセージ一覧を取得
   */
  async getMessages(roomId: string): Promise<ChatMessage[]> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: ChatMessage[];
      }>(`${this.basePath}/rooms/${roomId}/messages`);
      return response.data.data || [];
    } catch (error) {
      console.error('メッセージ取得エラー:', error);
      throw error;
    }
  }

  /**
   * メッセージを送信
   */
  async sendMessage(roomId: string, message: string): Promise<ChatMessage> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        data: ChatMessage;
      }>(`${this.basePath}/rooms/${roomId}/messages`, { message });
      return response.data.data;
    } catch (error) {
      console.error('メッセージ送信エラー:', error);
      throw error;
    }
  }

  /**
   * 取引を完了
   */
  async completeTransaction(roomId: string): Promise<void> {
    try {
      await apiClient.post(`${this.basePath}/rooms/${roomId}/complete`, {});
    } catch (error) {
      console.error('取引完了エラー:', error);
      throw error;
    }
  }

  /**
   * チャットルーム一覧を取得（自分が関わっているもの）
   */
  async getMyChatRooms(): Promise<ChatRoom[]> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: ChatRoom[];
      }>(`${this.basePath}/rooms/my`);
      return response.data.data || [];
    } catch (error) {
      console.error('チャットルーム一覧取得エラー:', error);
      throw error;
    }
  }

  /**
   * QRコードを検証
   */
  async verifyQRCode(
    roomId: string,
    scannedUserId: string,
  ): Promise<{
    verified: boolean;
    message: string;
  }> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        verified: boolean;
        message: string;
      }>(`${this.basePath}/rooms/${roomId}/verify-qr`, {
        scanned_user_id: scannedUserId,
      });
      return {
        verified: response.data.verified,
        message: response.data.message,
      };
    } catch (error) {
      console.error('QRコード検証エラー:', error);
      throw error;
    }
  }
}

// シングルトンインスタンスをエクスポート
export const tradeChatService = new TradeChatService();
