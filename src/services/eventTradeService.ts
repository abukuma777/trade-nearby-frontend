/**
 * イベント限定取引APIサービス
 * イベント会場での爆死即交換投稿管理
 */

import apiClient from './api';

// トレードアイテム型
export interface TradeItem {
  character_name: string;
  quantity: number;
}

// イベント情報型
export interface Event {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  venue: string;
  artist?: string;
  description?: string;
  venue_zones?: Array<{ code: string; zone: string }>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// イベント限定投稿型
export interface EventTrade {
  id: string;
  user_id: string;
  event_id: string;
  zone_code?: string;
  is_instant: boolean;
  give_item: string; // 譲るアイテム（テキスト）
  want_item: string; // 求めるアイテム（テキスト）
  description?: string;
  status: 'active' | 'matched' | 'completed';
  created_at: string;
  updated_at: string;
  // リレーション
  event?: Event;
  user?: {
    id: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
  give_items?: TradeItem[];
  want_items?: TradeItem[];
}

// 投稿作成データ型
export interface CreateEventTradeData {
  event_id: string;
  zone_code?: string;
  is_instant: boolean;
  give_items: TradeItem[];
  want_items: TradeItem[];
  description?: string;
}

class EventTradeService {
  /**
   * アクティブなイベント一覧取得
   */
  async getActiveEvents(): Promise<Event[]> {
    try {
      const response = await apiClient.get<{ success: boolean; events: Event[] }>(
        '/events/active',
      );
      return response.data.events || [];
    } catch (error) {
      console.error('イベント一覧取得エラー:', error);
      throw error;
    }
  }

  /**
   * イベント限定投稿作成
   */
  async createEventTrade(data: CreateEventTradeData): Promise<EventTrade> {
    try {
      const response = await apiClient.post<{ data: EventTrade }>(
        '/event-trades',
        data,
      );
      return response.data.data;
    } catch (error) {
      console.error('イベント投稿作成エラー:', error);
      throw error;
    }
  }

  /**
   * イベント限定投稿一覧取得
   */
  async getEventTrades(eventId?: string): Promise<EventTrade[]> {
    try {
      const params: Record<string, string> = {};
      if (eventId) {
        params.event_id = eventId;
      }
      const response = await apiClient.get<{ data: EventTrade[] }>(
        '/event-trades',
        { params },
      );
      return response.data.data || [];
    } catch (error) {
      console.error('イベント投稿一覧取得エラー:', error);
      throw error;
    }
  }

  /**
   * 爆死マッチング取得（新版）
   */
  async matchEventTrades(
    eventId: string,
    giveItems: TradeItem[],
    wantItems: TradeItem[],
    offset = 0,
    limit = 5,
  ): Promise<{
    matches: Array<{
      post_id: string;
      event_trade_id: string;
      user: {
        id: string;
        username: string;
        display_name?: string;
        avatar_url?: string;
      };
      give_items: TradeItem[];
      want_items: TradeItem[];
      zone_code?: string;
      created_at: string;
    }>;
    total_count: number;
    has_more: boolean;
  }> {
    try {
      const response = await apiClient.post('/event-trades/match', {
        event_id: eventId,
        give_items: giveItems,
        want_items: wantItems,
        offset,
        limit,
      });
      return response.data;
    } catch (error) {
      console.error('マッチングエラー:', error);
      throw error;
    }
  }

  /**
   * マッチング後のチャット開始
   */
  async startChat(
    eventId: string,
    matchedPostId: string,
    giveItems: TradeItem[],
    wantItems: TradeItem[],
    zoneCode?: string,
    description?: string,
  ): Promise<{
    post_id: string;
    trade_request_id: string;
    chat_available: boolean;
  }> {
    try {
      const response = await apiClient.post('/event-trades/start-chat', {
        event_id: eventId,
        matched_post_id: matchedPostId,
        give_items: giveItems,
        want_items: wantItems,
        zone_code: zoneCode,
        description,
      });
      return response.data.data;
    } catch (error) {
      console.error('チャット開始エラー:', error);
      throw error;
    }
  }

  /**
   * 爆死マッチング取得（旧版 - 非推奨）
   * @deprecated Use matchEventTrades instead
   */
  async getMatches(eventId: string): Promise<EventTrade[]> {
    try {
      const response = await apiClient.get<{ data: EventTrade[] }>(
        `/event-trades/match/${eventId}`,
      );
      return response.data.data || [];
    } catch (error) {
      console.error('爆死マッチング取得エラー:', error);
      throw error;
    }
  }
}

export const eventTradeService = new EventTradeService();
