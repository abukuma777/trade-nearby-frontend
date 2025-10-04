/**
 * アイテム関連のAPI通信サービス
 */

import apiClient from './api'; // 共通のAPIクライアントを使用

import { ApiSuccessResponse } from '@/types/api-error';
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

      if (params?.page) {queryParams.append('page', params.page.toString());}
      if (params?.limit) {queryParams.append('limit', params.limit.toString());}
      if (params?.category) {queryParams.append('category', params.category);}
      if (params?.status) {queryParams.append('status', params.status);}
      if (params?.visibility) {queryParams.append('visibility', params.visibility);}
      if (params?.tags && params.tags.length > 0) {
        queryParams.append('tags', params.tags.join(','));
      }
      if (params?.search) {queryParams.append('search', params.search);}
      if (params?.sort) {queryParams.append('sort', params.sort);}
      if (params?.user_id) {queryParams.append('user_id', params.user_id);}

      const response = await apiClient.get<ApiSuccessResponse<Item[]>>(`/api/items?${queryParams.toString()}`);

      // バックエンドのレスポンス形式に対応
      const responseData = response.data;
      if (responseData.success && responseData.data) {
        // 新しい形式: {success: true, data: [...], pagination: {...}}
        return {
          items: responseData.data,
          total: responseData.pagination?.total || responseData.data.length,
          page: responseData.pagination?.page || 1,
          limit: responseData.pagination?.per_page || 10,
          totalPages: responseData.pagination?.total_pages || 1,
        };
      } else if ('items' in response.data && Array.isArray((response.data as {items?: unknown}).items)) {
        // 既存の形式
        return response.data as ItemsResponse;
      } else {
        // データが配列の場合
        const items = Array.isArray(response.data) ? response.data as Item[] : [];
        return {
          items,
          total: items.length,
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

      if (params.radius) {queryParams.append('radius', params.radius.toString());}
      if (params.limit) {queryParams.append('limit', params.limit.toString());}
      if (params.category) {queryParams.append('category', params.category);}

      const response = await apiClient.get<ItemsResponse>(`/api/items/nearby?${queryParams.toString()}`);

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
      const response = await apiClient.get<ApiSuccessResponse<Item> | Item>(`/api/items/${itemId}`);
      // バックエンドのレスポンス形式に対応
      const responseData = response.data;
      if (typeof responseData === 'object' && 'success' in responseData && responseData.success && responseData.data) {
        return responseData.data;
      }
      return responseData as Item;
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
      const response = await apiClient.post<ApiSuccessResponse<Item> | Item>('/api/items', data);
      // バックエンドのレスポンス形式に対応
      const responseData = response.data;
      if (typeof responseData === 'object' && 'success' in responseData && responseData.success && responseData.data) {
        return responseData.data;
      }
      return responseData as Item;
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
      const response = await apiClient.put<ApiSuccessResponse<Item> | Item>(`/api/items/${itemId}`, data);
      // バックエンドのレスポンス形式に対応
      const responseData = response.data;
      if (typeof responseData === 'object' && 'success' in responseData && responseData.success && responseData.data) {
        return responseData.data;
      }
      return responseData as Item;
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

      const response = await apiClient.post<{ url: string }>(`/api/items/${itemId}/upload`, formData, {
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
      const response = await apiClient.patch<ApiSuccessResponse<Item> | Item>(`/api/items/${itemId}/visibility`, {
        visibility,
      });
      // バックエンドのレスポンス形式に対応
      const responseData = response.data;
      if (typeof responseData === 'object' && 'success' in responseData && responseData.success && responseData.data) {
        return responseData.data;
      }
      return responseData as Item;
    } catch (error) {
      console.error(`Error toggling visibility for item ${itemId}:`, error);
      throw error;
    }
  },
};

// デフォルトエクスポート
export default itemService;
