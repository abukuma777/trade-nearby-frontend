/**
 * イベント限定取引ストア
 * Zustandを使用したグローバル状態管理
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import {
  eventTradeService,
  Event,
  EventTrade,
  CreateEventTradeData,
} from '../services/eventTradeService';

interface EventTradeStore {
  // 状態
  events: Event[];
  eventTrades: EventTrade[];
  matches: EventTrade[];
  currentEventTrade: EventTrade | null;
  loading: boolean;
  error: string | null;

  // アクション
  fetchActiveEvents: () => Promise<void>;
  fetchEventTrades: (eventId?: string) => Promise<void>;
  fetchMatches: (eventId: string) => Promise<void>;
  createEventTrade: (data: CreateEventTradeData) => Promise<string>;
  clearError: () => void;
}

interface AxiosErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const useEventTradeStore = create<EventTradeStore>()(
  devtools(
    (set) => ({
      // 初期状態
      events: [],
      eventTrades: [],
      matches: [],
      currentEventTrade: null,
      loading: false,
      error: null,

      // アクティブイベント一覧取得
      fetchActiveEvents: async () => {
        set({ loading: true, error: null });
        try {
          const events = await eventTradeService.getActiveEvents();
          set({ events, loading: false });
        } catch (error) {
          const axiosError = error as AxiosErrorResponse;
          set({
            error:
              axiosError.response?.data?.message ||
              'イベント一覧の取得に失敗しました',
            loading: false,
          });
        }
      },

      // イベント投稿一覧取得
      fetchEventTrades: async (eventId?: string) => {
        set({ loading: true, error: null });
        try {
          const eventTrades = await eventTradeService.getEventTrades(eventId);
          set({ eventTrades, loading: false });
        } catch (error) {
          const axiosError = error as AxiosErrorResponse;
          set({
            error:
              axiosError.response?.data?.message ||
              'イベント投稿の取得に失敗しました',
            loading: false,
          });
        }
      },

      // 爆死マッチング取得
      fetchMatches: async (eventId: string) => {
        set({ loading: true, error: null });
        try {
          const matches = await eventTradeService.getMatches(eventId);
          set({ matches, loading: false });
        } catch (error) {
          const axiosError = error as AxiosErrorResponse;
          set({
            error:
              axiosError.response?.data?.message ||
              'マッチング取得に失敗しました',
            loading: false,
          });
        }
      },

      // イベント投稿作成
      createEventTrade: async (data: CreateEventTradeData) => {
        set({ loading: true, error: null });
        try {
          const newEventTrade = await eventTradeService.createEventTrade(data);
          set({ loading: false });
          return newEventTrade.id;
        } catch (error) {
          const axiosError = error as AxiosErrorResponse;
          set({
            error:
              axiosError.response?.data?.message ||
              'イベント投稿の作成に失敗しました',
            loading: false,
          });
          throw error;
        }
      },

      // エラークリア
      clearError: () => set({ error: null }),
    }),
    {
      name: 'event-trade-store',
    },
  ),
);
