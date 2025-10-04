/**
 * 交換機能の状態管理（Zustand）
 * 交換リクエスト、通知、UIステートを管理
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import {
  tradeService,
  TradeRequest,
  TradeNotification,
  CreateTradeRequestDto,
} from '@/services/tradeService';
import { getErrorMessage } from '@/types/api-error';

// ========================================
// 型定義
// ========================================

interface TradeState {
  // データ
  myRequests: TradeRequest[];
  receivedRequests: TradeRequest[];
  currentRequest: TradeRequest | null;
  notifications: TradeNotification[];
  unreadCount: number;

  // UI状態
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;

  // アクション
  createRequest: (data: CreateTradeRequestDto) => Promise<void>;
  loadMyRequests: () => Promise<void>;
  loadReceivedRequests: () => Promise<void>;
  loadRequestDetail: (id: string) => Promise<void>;
  acceptRequest: (id: string) => Promise<void>;
  rejectRequest: (id: string) => Promise<void>;
  cancelRequest: (id: string) => Promise<void>;
  completeRequest: (id: string, data?: { rating?: number; comment?: string }) => Promise<void>;
  loadNotifications: (unread_only?: boolean) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  loadUnreadCount: () => Promise<void>;

  // ヘルパー
  clearMessages: () => void;
  setError: (error: string | null) => void;
  setSuccessMessage: (message: string | null) => void;
}

// ========================================
// Storeの作成
// ========================================

export const useTradeStore = create<TradeState>()(
  devtools(
    persist(
      (set) => ({
        // 初期状態
        myRequests: [],
        receivedRequests: [],
        currentRequest: null,
        notifications: [],
        unreadCount: 0,
        isLoading: false,
        error: null,
        successMessage: null,

        // ========================================
        // アクション実装
        // ========================================

        /**
         * 交換リクエストを作成
         */
        createRequest: async (data: CreateTradeRequestDto) => {
          set({ isLoading: true, error: null });
          try {
            const newRequest = await tradeService.createRequest(data);
            set((state) => ({
              myRequests: [newRequest, ...state.myRequests],
              successMessage: '交換リクエストを送信しました',
              isLoading: false,
            }));
          } catch (error) {
            set({
              error: getErrorMessage(error),
              isLoading: false,
            });
            throw error;
          }
        },

        /**
         * 自分が送信した交換リクエスト一覧を取得
         */
        loadMyRequests: async () => {
          set({ isLoading: true, error: null });
          try {
            const requests = await tradeService.getMyRequests();
            set({
              myRequests: requests,
              isLoading: false,
            });
          } catch (error) {
            set({
              error: getErrorMessage(error),
              isLoading: false,
            });
          }
        },

        /**
         * 自分宛の交換リクエスト一覧を取得
         */
        loadReceivedRequests: async () => {
          set({ isLoading: true, error: null });
          try {
            const requests = await tradeService.getReceivedRequests();
            set({
              receivedRequests: requests,
              isLoading: false,
            });
          } catch (error) {
            set({
              error: getErrorMessage(error),
              isLoading: false,
            });
          }
        },

        /**
         * 交換リクエストの詳細を取得
         */
        loadRequestDetail: async (id: string) => {
          set({ isLoading: true, error: null });
          try {
            const request = await tradeService.getRequestDetail(id);
            set({
              currentRequest: request,
              isLoading: false,
            });
          } catch (error) {
            set({
              error: getErrorMessage(error),
              isLoading: false,
            });
            throw error;
          }
        },

        /**
         * 交換リクエストを承認
         */
        acceptRequest: async (id: string) => {
          set({ isLoading: true, error: null });
          try {
            const updatedRequest = await tradeService.acceptRequest(id);
            set((state) => ({
              receivedRequests: state.receivedRequests.map((req) =>
                req.id === id ? updatedRequest : req,
              ),
              currentRequest:
                state.currentRequest?.id === id ? updatedRequest : state.currentRequest,
              successMessage: '交換リクエストを承認しました',
              isLoading: false,
            }));
          } catch (error) {
            set({
              error: getErrorMessage(error),
              isLoading: false,
            });
            throw error;
          }
        },

        /**
         * 交換リクエストを拒否
         */
        rejectRequest: async (id: string) => {
          set({ isLoading: true, error: null });
          try {
            const updatedRequest = await tradeService.rejectRequest(id);
            set((state) => ({
              receivedRequests: state.receivedRequests.map((req) =>
                req.id === id ? updatedRequest : req,
              ),
              currentRequest:
                state.currentRequest?.id === id ? updatedRequest : state.currentRequest,
              successMessage: '交換リクエストを拒否しました',
              isLoading: false,
            }));
          } catch (error) {
            set({
              error: getErrorMessage(error),
              isLoading: false,
            });
            throw error;
          }
        },

        /**
         * 交換リクエストをキャンセル
         */
        cancelRequest: async (id: string) => {
          set({ isLoading: true, error: null });
          try {
            const updatedRequest = await tradeService.cancelRequest(id);
            set((state) => ({
              myRequests: state.myRequests.map((req) => (req.id === id ? updatedRequest : req)),
              currentRequest:
                state.currentRequest?.id === id ? updatedRequest : state.currentRequest,
              successMessage: '交換リクエストをキャンセルしました',
              isLoading: false,
            }));
          } catch (error) {
            set({
              error: getErrorMessage(error),
              isLoading: false,
            });
            throw error;
          }
        },

        /**
         * 交換を完了
         */
        completeRequest: async (id: string, data?: { rating?: number; comment?: string }) => {
          set({ isLoading: true, error: null });
          try {
            const updatedRequest = await tradeService.completeRequest(id, data);
            set((state) => ({
              myRequests: state.myRequests.map((req) => (req.id === id ? updatedRequest : req)),
              receivedRequests: state.receivedRequests.map((req) =>
                req.id === id ? updatedRequest : req,
              ),
              currentRequest:
                state.currentRequest?.id === id ? updatedRequest : state.currentRequest,
              successMessage: '交換が完了しました',
              isLoading: false,
            }));
          } catch (error) {
            set({
              error: getErrorMessage(error),
              isLoading: false,
            });
            throw error;
          }
        },

        /**
         * 通知一覧を取得
         */
        loadNotifications: async (unread_only = false) => {
          set({ isLoading: true, error: null });
          try {
            const { notifications, unread_count } = await tradeService.getNotifications({
              unread_only,
            });
            set({
              notifications,
              unreadCount: unread_count,
              isLoading: false,
            });
          } catch (error) {
            set({
              error: getErrorMessage(error),
              isLoading: false,
            });
          }
        },

        /**
         * 通知を既読にする
         */
        markNotificationAsRead: async (id: string) => {
          try {
            const updatedNotification = await tradeService.markNotificationAsRead(id);
            set((state) => ({
              notifications: state.notifications.map((notif) =>
                notif.id === id ? updatedNotification : notif,
              ),
              unreadCount: Math.max(0, state.unreadCount - 1),
            }));
          } catch (error) {
            console.error('既読処理エラー:', error);
          }
        },

        /**
         * すべての通知を既読にする
         */
        markAllNotificationsAsRead: async () => {
          try {
            await tradeService.markAllNotificationsAsRead();
            set((state) => ({
              notifications: state.notifications.map((notif) => ({
                ...notif,
                is_read: true,
                read_at: new Date().toISOString(),
              })),
              unreadCount: 0,
            }));
          } catch (error) {
            console.error('一括既読処理エラー:', error);
          }
        },

        /**
         * 未読通知数を取得
         */
        loadUnreadCount: async () => {
          try {
            const count = await tradeService.getUnreadCount();
            set({ unreadCount: count });
          } catch (error) {
            console.error('未読数取得エラー:', error);
          }
        },

        // ========================================
        // ヘルパー関数
        // ========================================

        /**
         * メッセージをクリア
         */
        clearMessages: () => {
          set({ error: null, successMessage: null });
        },

        /**
         * エラーメッセージを設定
         */
        setError: (error: string | null) => {
          set({ error });
        },

        /**
         * 成功メッセージを設定
         */
        setSuccessMessage: (message: string | null) => {
          set({ successMessage: message });
        },
      }),
      {
        name: 'trade-store',
        // 永続化するフィールドを限定（通知数のみ）
        partialize: (state) => ({
          unreadCount: state.unreadCount,
        }),
      },
    ),
    {
      name: 'TradeStore',
    },
  ),
);

// ========================================
// セレクター（パフォーマンス最適化）
// ========================================

export const useMyRequests = (): TradeRequest[] => useTradeStore((state) => state.myRequests);
export const useReceivedRequests = (): TradeRequest[] => useTradeStore((state) => state.receivedRequests);
export const useCurrentRequest = (): TradeRequest | null => useTradeStore((state) => state.currentRequest);
export const useNotifications = (): TradeNotification[] => useTradeStore((state) => state.notifications);
export const useUnreadCount = (): number => useTradeStore((state) => state.unreadCount);
export const useTradeLoading = (): boolean => useTradeStore((state) => state.isLoading);
export const useTradeError = (): string | null => useTradeStore((state) => state.error);
export const useTradeSuccess = (): string | null => useTradeStore((state) => state.successMessage);
