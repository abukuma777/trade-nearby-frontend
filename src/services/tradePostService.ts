/**
 * 交換投稿APIサービス
 * シンプルな「譲)エマ求)栞子」形式の投稿管理
 */

import apiClient from './api';

export interface ImageData {
  url: string;
  order?: number;
  is_main?: boolean;
}

export interface SimpleTradePost {
  id: string;
  user_id: string;
  short_id?: string; // 短縮ID追加
  slug?: string; // スラッグ追加
  give_item: string;
  want_item: string;
  description?: string;
  location_name?: string;
  status: 'active' | 'trading' | 'completed' | 'private';
  created_at: string;
  updated_at: string;
  // 画像フィールドを追加
  give_item_images?: ImageData[];
  want_item_images?: ImageData[];
}

export interface CreateTradePostData {
  give_item: string;
  want_item: string;
  description?: string;
  location_name?: string;
  // 画像フィールドを追加
  give_item_images?: ImageData[];
  want_item_images?: ImageData[];
}

export interface UpdateTradePostData {
  give_item?: string;
  want_item?: string;
  description?: string;
  location_name?: string;
  status?: 'active' | 'trading' | 'completed' | 'private';
  // 画像フィールドを追加
  give_item_images?: ImageData[];
  want_item_images?: ImageData[];
}

export interface UploadImageData {
  base64Data: string;
  fileName: string;
  mimeType: string;
  order?: number;
  is_main?: boolean;
}

class TradePostService {
  /**
   * 投稿一覧取得
   */
  async getAllPosts(
    status?: string,
    contentId?: string,
    includeChildren?: boolean,
  ): Promise<SimpleTradePost[]> {
    try {
      const params: Record<string, string> = {};
      if (status) {
        params.status = status;
      }
      if (contentId) {
        params.content_id = contentId;
        if (includeChildren !== undefined) {
          params.include_children = includeChildren.toString();
        }
      }
      const response = await apiClient.get<{ data: SimpleTradePost[] }>(
        '/trade-posts',
        {
          params,
        },
      );
      return response.data.data || [];
    } catch (error) {
      console.error('投稿一覧取得エラー:', error);
      throw error;
    }
  }

  /**
   * 自分の投稿一覧取得
   */
  async getMyPosts(): Promise<SimpleTradePost[]> {
    try {
      const response = await apiClient.get<{ data: SimpleTradePost[] }>(
        '/trade-posts/my',
      );
      return response.data.data || [];
    } catch (error) {
      console.error('自分の投稿取得エラー:', error);
      throw error;
    }
  }

  /**
   * 投稿詳細取得
   */
  async getPost(id: string): Promise<SimpleTradePost> {
    try {
      const response = await apiClient.get<{ data: SimpleTradePost }>(
        `/trade-posts/${id}`,
      );
      return response.data.data;
    } catch (error) {
      console.error('投稿詳細取得エラー:', error);
      throw error;
    }
  }

  /**
   * 投稿作成
   */
  async createPost(data: CreateTradePostData): Promise<SimpleTradePost> {
    try {
      const response = await apiClient.post<{ data: SimpleTradePost }>(
        '/trade-posts',
        data,
      );
      return response.data.data;
    } catch (error) {
      console.error('投稿作成エラー:', error);
      throw error;
    }
  }

  /**
   * 投稿更新
   */
  async updatePost(
    id: string,
    data: UpdateTradePostData,
  ): Promise<SimpleTradePost> {
    try {
      const response = await apiClient.put<{ data: SimpleTradePost }>(
        `/trade-posts/${id}`,
        data,
      );
      return response.data.data;
    } catch (error) {
      console.error('投稿更新エラー:', error);
      throw error;
    }
  }

  /**
   * ステータス更新
   */
  async updateStatus(
    id: string,
    status: 'active' | 'trading' | 'completed' | 'private',
  ): Promise<SimpleTradePost> {
    try {
      const response = await apiClient.patch<{ data: SimpleTradePost }>(
        `/trade-posts/${id}/status`,
        { status },
      );
      return response.data.data;
    } catch (error) {
      console.error('ステータス更新エラー:', error);
      throw error;
    }
  }

  /**
   * 投稿削除
   */
  async deletePost(id: string): Promise<void> {
    try {
      await apiClient.delete(`/trade-posts/${id}`);
    } catch (error) {
      console.error('投稿削除エラー:', error);
      throw error;
    }
  }

  /**
   * 画像アップロード
   */
  async uploadImages(images: UploadImageData[]): Promise<ImageData[]> {
    try {
      const response = await apiClient.post<{ data: { urls: ImageData[] } }>(
        '/trade-posts/upload-images',
        { images },
      );
      return response.data.data.urls || [];
    } catch (error) {
      console.error('画像アップロードエラー:', error);
      throw error;
    }
  }
}

export const tradePostService = new TradePostService();
