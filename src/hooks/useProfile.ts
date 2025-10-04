/**
 * ユーザープロフィール関連のカスタムフック（React Query使用）
 */

import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';

import apiClient, { ApiResponse } from '@/services/api';
import authService from '@/services/authService';
import { User , useAuthStore } from '@/stores/authStore';

// ユーザー統計情報の型定義
export interface UserStats {
  totalItems: number;
  activeItems: number;
  tradedItems: number;
  reservedItems: number;
  joinedDaysAgo: number;
}

// クエリキーの定義
export const profileQueryKeys = {
  all: ['profile'] as const,
  current: () => [...profileQueryKeys.all, 'current'] as const,
  stats: (userId?: string) =>
    userId
      ? ([...profileQueryKeys.all, 'stats', userId] as const)
      : ([...profileQueryKeys.all, 'stats'] as const),
  byId: (userId: string) => [...profileQueryKeys.all, 'user', userId] as const,
};

/**
 * 現在のユーザープロフィールを取得するフック
 */
export const useCurrentUser = (): UseQueryResult<User, Error> => {
  return useQuery<User, Error>({
    queryKey: profileQueryKeys.current(),
    queryFn: () => authService.getCurrentUser(),
    staleTime: 1000 * 60 * 10, // 10分間はキャッシュを使用
    retry: 2,
  });
};

/**
 * 特定のユーザープロフィールを取得するフック
 */
export const useUserById = (userId: string): UseQueryResult<User, Error> => {
  return useQuery<User, Error>({
    queryKey: profileQueryKeys.byId(userId),
    queryFn: async (): Promise<User> => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const response = await apiClient.get<ApiResponse<User>>(`/users/${userId}`, {});

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'ユーザー情報の取得に失敗しました');
      }

      return response.data.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 10, // 10分間はキャッシュを使用
    retry: 2,
  });
};

/**
 * ユーザー統計情報を取得するフック
 */
export const useUserStats = (userId?: string): UseQueryResult<UserStats, Error> => {
  return useQuery<UserStats, Error>({
    queryKey: profileQueryKeys.stats(userId),
    queryFn: async (): Promise<UserStats> => {
      const token = useAuthStore.getState().getAccessToken();
      const endpoint = userId ? `/users/${userId}/stats` : '/users/me/stats';

      const response = await apiClient.get<ApiResponse<UserStats>>(endpoint, {
        headers: userId
          ? {}
          : {
              Authorization: `Bearer ${token}`,
            },
      });

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || '統計情報の取得に失敗しました');
      }

      return response.data.data;
    },
    staleTime: 1000 * 60 * 5, // 5分間はキャッシュを使用
    retry: 2,
  });
};

/**
 * プロフィールを更新するフック
 */
export const useUpdateProfile = (): UseMutationResult<User, Error, Partial<User>> => {
  const queryClient = useQueryClient();

  return useMutation<User, Error, Partial<User>>({
    mutationFn: async (updates): Promise<User> => {
      const result = await authService.updateProfile(updates);
      return result;
    },
    onSuccess: (updatedUser) => {

      // キャッシュを更新
      queryClient.setQueryData(profileQueryKeys.current(), updatedUser);

      // 認証ストアのユーザー情報も更新
      const { updateUser } = useAuthStore.getState();
      updateUser(updatedUser);

      // invalidateQueriesは401エラーの原因となるため削除
      // 代わりにsetQueryDataでキャッシュを直接更新
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);
    },
  });
};
