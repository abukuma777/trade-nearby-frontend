/**
 * アイテム関連のカスタムフック（React Query使用）
 */

import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';

import itemService from '@/services/itemService';
import {
  Item,
  ItemsResponse,
  ItemsQueryParams,
  NearbyItemsQueryParams,
  CreateItemInput,
  UpdateItemInput,
} from '@/types/item';

// クエリキーの定義
export const itemQueryKeys = {
  all: ['items'] as const,
  lists: () => [...itemQueryKeys.all, 'list'] as const,
  list: (params?: ItemsQueryParams) => [...itemQueryKeys.lists(), params] as const,
  nearby: (params: NearbyItemsQueryParams) => [...itemQueryKeys.all, 'nearby', params] as const,
  details: () => [...itemQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...itemQueryKeys.details(), id] as const,
};

/**
 * アイテム一覧を取得するフック
 */
export const useItems = (params?: ItemsQueryParams): UseQueryResult<ItemsResponse, Error> => {
  return useQuery<ItemsResponse, Error>({
    queryKey: itemQueryKeys.list(params),
    queryFn: () => itemService.getItems(params),
    staleTime: 1000 * 60 * 5, // 5分間はキャッシュを使用
    retry: 2,
  });
};

/**
 * 近隣のアイテムを取得するフック
 */
export const useNearbyItems = (params: NearbyItemsQueryParams, enabled: boolean = true): UseQueryResult<ItemsResponse, Error> => {
  return useQuery<ItemsResponse, Error>({
    queryKey: itemQueryKeys.nearby(params),
    queryFn: () => itemService.getNearbyItems(params),
    enabled: enabled && !!params.lat && !!params.lng,
    staleTime: 1000 * 60 * 5, // 5分間はキャッシュを使用
    retry: 2,
  });
};

/**
 * アイテムの詳細を取得するフック
 */
export const useItem = (itemId: string, enabled: boolean = true): UseQueryResult<Item, Error> => {
  return useQuery<Item, Error>({
    queryKey: itemQueryKeys.detail(itemId),
    queryFn: () => itemService.getItem(itemId),
    enabled: enabled && !!itemId,
    staleTime: 1000 * 60 * 5, // 5分間はキャッシュを使用
    retry: 2,
  });
};

/**
 * アイテムを作成するフック
 */
export const useCreateItem = (): UseMutationResult<Item, Error, CreateItemInput> => {
  const queryClient = useQueryClient();

  return useMutation<Item, Error, CreateItemInput>({
    mutationFn: (data) => itemService.createItem(data),
    onSuccess: (newItem) => {
      // キャッシュを無効化して再取得
      void queryClient.invalidateQueries({ queryKey: itemQueryKeys.lists() });

      // 新しいアイテムを詳細キャッシュに追加
      queryClient.setQueryData(itemQueryKeys.detail(newItem.id), newItem);
    },
    onError: (error) => {
      console.error('Failed to create item:', error);
    },
  });
};

/**
 * アイテムを更新するフック
 */
export const useUpdateItem = (itemId: string): UseMutationResult<Item, Error, UpdateItemInput> => {
  const queryClient = useQueryClient();

  return useMutation<Item, Error, UpdateItemInput>({
    mutationFn: (data) => itemService.updateItem(itemId, data),
    onSuccess: (updatedItem) => {
      // キャッシュを更新
      queryClient.setQueryData(itemQueryKeys.detail(itemId), updatedItem);

      // リストキャッシュも無効化
      void queryClient.invalidateQueries({ queryKey: itemQueryKeys.lists() });
    },
    onError: (error) => {
      console.error(`Failed to update item ${itemId}:`, error);
    },
  });
};

/**
 * アイテムを削除するフック
 */
export const useDeleteItem = (): UseMutationResult<void, Error, string> => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (itemId) => itemService.deleteItem(itemId),
    onSuccess: (_, itemId) => {
      // キャッシュから削除
      queryClient.removeQueries({ queryKey: itemQueryKeys.detail(itemId) });

      // リストキャッシュを無効化
      void queryClient.invalidateQueries({ queryKey: itemQueryKeys.lists() });
    },
    onError: (error, itemId) => {
      console.error(`Failed to delete item ${itemId}:`, error);
    },
  });
};

/**
 * アイテムに画像をアップロードするフック
 */
export const useUploadItemImage = (itemId: string): UseMutationResult<{ url: string }, Error, File> => {
  const queryClient = useQueryClient();

  return useMutation<{ url: string }, Error, File>({
    mutationFn: (file) => itemService.uploadItemImage(itemId, file),
    onSuccess: () => {
      // アイテムの詳細を再取得
      void queryClient.invalidateQueries({ queryKey: itemQueryKeys.detail(itemId) });
    },
    onError: (error) => {
      console.error(`Failed to upload image for item ${itemId}:`, error);
    },
  });
};

/**
 * アイテムの公開/非公開を切り替えるフック
 */
export const useToggleItemVisibility = (): UseMutationResult<Item, Error, { itemId: string; visibility: 'public' | 'private' }> => {
  const queryClient = useQueryClient();

  return useMutation<Item, Error, { itemId: string; visibility: 'public' | 'private' }>({
    mutationFn: ({ itemId, visibility }) => itemService.toggleItemVisibility(itemId, visibility),
    onSuccess: (updatedItem) => {
      // キャッシュを更新
      queryClient.setQueryData(itemQueryKeys.detail(updatedItem.id), updatedItem);

      // リストキャッシュも無効化
      void queryClient.invalidateQueries({ queryKey: itemQueryKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to toggle item visibility:', error);
    },
  });
};

/**
 * 無限スクロール用のアイテム一覧取得フック（今後実装予定）
 */
export const useInfiniteItems = (baseParams?: Omit<ItemsQueryParams, 'page'>): UseQueryResult<ItemsResponse, Error> => {
  // TODO: useInfiniteQuery を使用した無限スクロール実装
  // 現時点では通常のuseItemsを使用
  return useItems(baseParams);
};
