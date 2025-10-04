/**
 * ユーザーの投稿取得用カスタムフック
 */

import { useQuery } from '@tanstack/react-query';

import apiClient from '@/services/api';
import { useAuthStore } from '@/stores/authStore';

// 投稿データの型定義
export interface UserTradePost {
  id: string;
  user_id: string;
  give_item: string;
  want_item: string;
  description?: string;
  location_name?: string;
  status: 'active' | 'completed' | 'cancelled' | 'trading';
  created_at: string;
  updated_at: string;
  give_item_images?: Array<{
    url: string;
    order?: number;
    is_main?: boolean;
  }>;
  want_item_images?: Array<{
    url: string;
    order?: number;
    is_main?: boolean;
  }>;
}

// クエリキーの定義
export const userTradePostsQueryKeys = {
  all: ['userTradePosts'] as const,
  byUserId: (userId: string) => [...userTradePostsQueryKeys.all, userId] as const,
  recent: (userId: string, limit: number) =>
    [...userTradePostsQueryKeys.byUserId(userId), 'recent', limit] as const,
};

/**
 * ユーザーの最近の投稿を取得するフック
 * @param limit 取得する投稿数（デフォルト: 8）
 * @param userId 対象ユーザーID（省略時は自分）
 */
export const useUserRecentTradePosts = (limit: number = 8, userId?: string) => {
  const { user } = useAuthStore();
  const targetUserId = userId || user?.id || '';

  return useQuery<UserTradePost[], Error>({
    queryKey: userTradePostsQueryKeys.recent(targetUserId, limit),
    queryFn: async () => {
      if (!targetUserId) {
        throw new Error('ユーザーIDが見つかりません');
      }

      const response = await apiClient.get('/trade-posts', {
        params: {
          user_id: targetUserId,
          limit: limit,
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || '投稿の取得に失敗しました');
      }

      // 最新のlimit件だけを返す
      return (response.data.data || []).slice(0, limit);
    },
    enabled: !!targetUserId,
    staleTime: 1000 * 60 * 5, // 5分間はキャッシュを使用
    retry: 2,
  });
};

/**
 * ユーザーの全投稿を取得するフック
 * @param userId 対象ユーザーID（省略時は自分）
 */
export const useUserTradePosts = (userId?: string) => {
  const { user } = useAuthStore();
  const targetUserId = userId || user?.id || '';

  return useQuery<UserTradePost[], Error>({
    queryKey: userTradePostsQueryKeys.byUserId(targetUserId),
    queryFn: async () => {
      if (!targetUserId) {
        throw new Error('ユーザーIDが見つかりません');
      }

      const response = await apiClient.get('/trade-posts', {
        params: {
          user_id: targetUserId,
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || '投稿の取得に失敗しました');
      }

      return response.data.data || [];
    },
    enabled: !!targetUserId,
    staleTime: 1000 * 60 * 5, // 5分間はキャッシュを使用
    retry: 2,
  });
};
