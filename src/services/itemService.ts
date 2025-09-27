/**
 * アイテム関連のAPI通信サービス
 */

import apiClient from './api'; // 共通のAPIクライアントを使用
import {
  Item,
  ItemsResponse,
  ItemsQueryParams,
  NearbyItemsQueryParams,
  CreateItemInput,
  UpdateItemInput,
} from '@/types/item';

/**
 * アイテム関連APIサービス
 */
export const itemService = {
  /**
   * アイテム一覧を取得
   */
  async getItems(params?: ItemsQueryParams): Promise<ItemsResponse> {
    try {
      // クエリパラメータを構築
      const queryParams = new URLSearchParams();

      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.category) queryParams.append('category', params.category);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.visibility) queryParams.append('visibility', params.visibility);
      if (params?.tags && params.tags.length > 0) {
        queryParams.append('tags', params.tags.join(','));
      }
      if (params?.search) queryParams.append('search', params.search);
      if (params?.sort) queryParams.append('sort', params.sort);
      if (params?.user_id) queryParams.append('user_id', params.user_id);

      const response = await apiClient.get(`/api/items?${queryParams.toString()}`);

      // バックエンドのレスポンス形式に対応
      if (response.data.success && response.data.data) {
        // 新しい形式: {success: true, data: [...], pagination: {...}}
        return {
          items: response.data.data,
          total: response.data.pagination?.total || response.data.data.length,
          page: response.data.pagination?.page || 1,
          limit: response.data.pagination?.limit || 10,
          totalPages: response.data.pagination?.totalPages || 1,
        };
      } else if (response.data.items) {
        // 既存の形式
        return response.data;
      } else {
        // データが配列の場合
        return {
          items: Array.isArray(response.data) ? response.data : [],
          total: Array.isArray(response.data) ? response.data.length : 0,
          page: 1,
          limit: 10,
          totalPages: 1,
        };
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      throw error;
    }
  },

  /**
   * 近隣のアイテムを検索
   */
  async getNearbyItems(params: NearbyItemsQueryParams): Promise<ItemsResponse> {
    try {
      const queryParams = new URLSearchParams({
        lat: params.lat.toString(),
        lng: params.lng.toString(),
      });

      if (params.radius) queryParams.append('radius', params.radius.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.category) queryParams.append('category', params.category);

      const response = await apiClient.get(`/api/items/nearby?${queryParams.toString()}`);

      return response.data;
    } catch (error) {
      console.error('Error fetching nearby items:', error);
      throw error;
    }
  },

  /**
   * アイテムの詳細を取得
   */
  async getItem(itemId: string): Promise<Item> {
    try {
      const response = await apiClient.get(`/api/items/${itemId}`);
      // バックエンドのレスポンス形式に対応
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      console.error(`Error fetching item ${itemId}:`, error);
      throw error;
    }
  },

  /**
   * アイテムを作成
   */
  async createItem(data: CreateItemInput): Promise<Item> {
    try {
      const response = await apiClient.post('/api/items', data);
      // バックエンドのレスポンス形式に対応
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  },

  /**
   * アイテムを更新
   */
  async updateItem(itemId: string, data: UpdateItemInput): Promise<Item> {
    try {
      const response = await apiClient.put(`/api/items/${itemId}`, data);
      // バックエンドのレスポンス形式に対応
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      console.error(`Error updating item ${itemId}:`, error);
      throw error;
    }
  },

  /**
   * アイテムを削除
   */
  async deleteItem(itemId: string): Promise<void> {
    try {
      await apiClient.delete(`/api/items/${itemId}`);
    } catch (error) {
      console.error(`Error deleting item ${itemId}:`, error);
      throw error;
    }
  },

  /**
   * アイテムに画像をアップロード
   */
  async uploadItemImage(itemId: string, file: File): Promise<{ url: string }> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await apiClient.post(`/api/items/${itemId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error(`Error uploading image for item ${itemId}:`, error);
      throw error;
    }
  },

  /**
   * アイテムの公開/非公開を切り替え
   */
  async toggleItemVisibility(itemId: string, visibility: 'public' | 'private'): Promise<Item> {
    try {
      const response = await apiClient.patch(`/api/items/${itemId}/visibility`, {
        visibility,
      });
      // バックエンドのレスポンス形式に対応
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      console.error(`Error toggling visibility for item ${itemId}:`, error);
      throw error;
    }
  },
};

// デフォルトエクスポート
export default itemService;
