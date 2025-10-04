/**
 * React Query フックのテスト
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { mockItems, mockItemsResponse } from '@/__mocks__/itemMocks';
import { useItems, useItem, useCreateItem } from '@/hooks/useItems';
import * as itemService from '@/services/itemService';

// サービスモジュールをモック化
vi.mock('@/services/itemService');

describe('useItems hooks', () => {
  let queryClient: QueryClient;

  // テスト用のラッパーコンポーネント
  const createWrapper = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 0,
        },
      },
    });

    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useItems', () => {
    it('should fetch items successfully', async () => {
      // モックの設定
      vi.mocked(itemService.default.getItems).mockResolvedValue(mockItemsResponse);

      const { result } = renderHook(() => useItems(), {
        wrapper: createWrapper(),
      });

      // 初期状態の確認
      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();

      // データ取得を待つ
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // 取得したデータの確認
      expect(result.current.data).toEqual(mockItemsResponse);
      expect(result.current.data?.items.length).toBe(mockItems.length);
    });

    it('should handle query parameters', async () => {
      const params = {
        category: 'anime' as const,
        page: 1,
        limit: 10,
      };

      vi.mocked(itemService.default.getItems).mockResolvedValue({
        ...mockItemsResponse,
        items: mockItems.filter((item) => item.category === 'anime'),
      });

      const { result } = renderHook(() => useItems(params), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // サービスが正しいパラメータで呼ばれたことを確認
      expect(itemService.default.getItems).toHaveBeenCalledWith(params);
    });

    it('should handle errors', async () => {
      const errorMessage = 'Network error';
      vi.mocked(itemService.default.getItems).mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useItems(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe(errorMessage);
    });
  });

  describe('useItem', () => {
    it('should fetch a single item', async () => {
      const itemId = '1';
      const mockItem = mockItems[0];

      vi.mocked(itemService.default.getItem).mockResolvedValue(mockItem);

      const { result } = renderHook(() => useItem(itemId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockItem);
      expect(itemService.default.getItem).toHaveBeenCalledWith(itemId);
    });

    it('should not fetch when disabled', () => {
      const itemId = '1';

      const { result } = renderHook(() => useItem(itemId, false), {
        wrapper: createWrapper(),
      });

      // enabledがfalseの場合、フェッチしない
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(itemService.default.getItem).not.toHaveBeenCalled();
    });
  });

  describe('useCreateItem', () => {
    it('should create an item successfully', async () => {
      const newItemInput = {
        title: 'New Item',
        description: 'Test description',
        category: 'anime' as const,
        condition: 'new' as const,
      };

      const createdItem = {
        ...mockItems[0],
        ...newItemInput,
        id: 'new-id',
      };

      vi.mocked(itemService.default.createItem).mockResolvedValue(createdItem);

      const { result } = renderHook(() => useCreateItem(), {
        wrapper: createWrapper(),
      });

      // ミューテーションを実行
      result.current.mutate(newItemInput);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(createdItem);
      expect(itemService.default.createItem).toHaveBeenCalledWith(newItemInput);
    });

    it('should invalidate queries after creation', async () => {
      const newItemInput = {
        title: 'New Item',
        description: 'Test description',
        category: 'anime' as const,
        condition: 'new' as const,
      };

      const createdItem = {
        ...mockItems[0],
        ...newItemInput,
        id: 'new-id',
      };

      vi.mocked(itemService.default.createItem).mockResolvedValue(createdItem);

      const { result } = renderHook(() => useCreateItem(), {
        wrapper: createWrapper(),
      });

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      result.current.mutate(newItemInput);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // キャッシュが無効化されることを確認
      expect(invalidateSpy).toHaveBeenCalled();
    });
  });
});
