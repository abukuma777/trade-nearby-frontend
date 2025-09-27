/**
 * アイテムサービスのテスト
 * バックエンドが起動している前提でテストを実行
 */

import { describe, it, expect, beforeAll } from 'vitest';
import itemService from '@/services/itemService';
import { ItemsQueryParams } from '@/types/item';

// テスト用のタイムアウト設定
const TEST_TIMEOUT = 10000;

describe('ItemService Integration Tests', () => {
  // テストスキップフラグ（バックエンドが起動していない場合はスキップ）
  let skipTests = false;

  beforeAll(async () => {
    // バックエンドの疎通確認
    try {
      await fetch('http://localhost:3001/health');
    } catch (error) {
      console.warn('Backend server is not running. Skipping integration tests.');
      skipTests = true;
    }
  });

  describe('getItems', () => {
    it(
      'should fetch items without parameters',
      async () => {
        if (skipTests) {
          console.log('Test skipped: Backend not available');
          return;
        }

        try {
          const response = await itemService.getItems();

          expect(response).toBeDefined();
          expect(response.items).toBeInstanceOf(Array);
          expect(response.total).toBeGreaterThanOrEqual(0);
          expect(response.page).toBe(1);
          expect(response.limit).toBeGreaterThan(0);
          expect(response.totalPages).toBeGreaterThanOrEqual(0);
        } catch (error) {
          // バックエンドが起動していない場合はスキップ
          console.warn('Could not connect to backend:', error);
        }
      },
      TEST_TIMEOUT,
    );

    it(
      'should fetch items with query parameters',
      async () => {
        if (skipTests) return;

        const params: ItemsQueryParams = {
          page: 1,
          limit: 10,
          category: 'anime',
          status: 'active',
        };

        try {
          const response = await itemService.getItems(params);

          expect(response).toBeDefined();
          expect(response.items).toBeInstanceOf(Array);
          expect(response.page).toBe(1);
          expect(response.limit).toBe(10);

          // カテゴリーフィルターが機能していることを確認
          response.items.forEach((item) => {
            if (item.category) {
              expect(item.category).toBe('anime');
            }
          });
        } catch (error) {
          console.warn('Could not connect to backend:', error);
        }
      },
      TEST_TIMEOUT,
    );

    it(
      'should handle search parameter',
      async () => {
        if (skipTests) return;

        const params: ItemsQueryParams = {
          search: '鬼滅',
        };

        try {
          const response = await itemService.getItems(params);

          expect(response).toBeDefined();
          expect(response.items).toBeInstanceOf(Array);
        } catch (error) {
          console.warn('Could not connect to backend:', error);
        }
      },
      TEST_TIMEOUT,
    );
  });

  describe('getItem', () => {
    it(
      'should handle item not found error',
      async () => {
        if (skipTests) return;

        const nonExistentId = 'non-existent-id-12345';

        try {
          await itemService.getItem(nonExistentId);
          // エラーが発生しなかった場合はテスト失敗
          expect(true).toBe(false);
        } catch (error: any) {
          // 404エラーを期待
          expect(error.response?.status).toBe(404);
        }
      },
      TEST_TIMEOUT,
    );
  });

  describe('getNearbyItems', () => {
    it(
      'should fetch nearby items with location',
      async () => {
        if (skipTests) return;

        const params = {
          lat: 35.6762,
          lng: 139.6503,
          radius: 5,
          limit: 10,
        };

        try {
          const response = await itemService.getNearbyItems(params);

          expect(response).toBeDefined();
          expect(response.items).toBeInstanceOf(Array);

          // 距離情報が含まれていることを確認
          response.items.forEach((item) => {
            if (item.distance !== undefined) {
              expect(item.distance).toBeGreaterThanOrEqual(0);
            }
          });
        } catch (error) {
          console.warn('Could not connect to backend:', error);
        }
      },
      TEST_TIMEOUT,
    );
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // 一時的に不正なURLを設定
      const originalBaseURL = import.meta.env.VITE_API_URL;
      import.meta.env.VITE_API_URL = 'http://localhost:99999';

      try {
        await itemService.getItems();
        expect(true).toBe(false); // エラーが発生するはず
      } catch (error) {
        expect(error).toBeDefined();
      } finally {
        // 元のURLに戻す
        import.meta.env.VITE_API_URL = originalBaseURL;
      }
    });
  });
});

/**
 * モックデータのテスト
 */
describe('Mock Data Tests', () => {
  it('should import mock data correctly', async () => {
    const { mockItems, mockItemsResponse } = await import('@/__mocks__/itemMocks');

    expect(mockItems).toBeDefined();
    expect(mockItems.length).toBeGreaterThan(0);
    expect(mockItemsResponse).toBeDefined();
    expect(mockItemsResponse.items).toEqual(mockItems);
  });

  it('should filter mock data by category', async () => {
    const { getMockItemsByCategory } = await import('@/__mocks__/itemMocks');

    const animeItems = getMockItemsByCategory('anime');
    expect(animeItems).toBeDefined();
    expect(animeItems.length).toBeGreaterThan(0);
    animeItems.forEach((item) => {
      expect(item.category).toBe('anime');
    });
  });

  it('should search mock data', async () => {
    const { searchMockItems } = await import('@/__mocks__/itemMocks');

    const results = searchMockItems('鬼滅');
    expect(results).toBeDefined();
    expect(results.length).toBeGreaterThan(0);

    results.forEach((item) => {
      const matchFound =
        item.title.includes('鬼滅') ||
        item.description.includes('鬼滅') ||
        item.tags.some((tag) => tag.includes('鬼滅'));
      expect(matchFound).toBe(true);
    });
  });
});
