/**
 * コンテンツ階層APIサービス
 * カテゴリ、ジャンル、シリーズ、イベントの階層管理
 */

import apiClient from './api';

export interface ContentHierarchy {
  id: string;
  parent_id: string | null;
  type: 'category' | 'genre' | 'series' | 'event';
  slug: string;
  name: string;
  name_kana?: string | null;
  name_en?: string | null;
  search_tags?: string[] | null;
  display_order?: number;
  is_active?: boolean;
}

export interface CategorySelection {
  category_id?: string;
  category_name?: string;
  genre_id?: string;
  genre_name?: string;
  series_id?: string;
  series_name?: string;
  event_id?: string;
  event_name?: string;
}

export interface HierarchyNode extends ContentHierarchy {
  children: HierarchyNode[];
}

class ContentService {
  /**
   * カテゴリ一覧取得
   */
  async getCategories(): Promise<ContentHierarchy[]> {
    try {
      const response = await apiClient.get<ContentHierarchy[]>(
        '/content/categories',
      );
      return response.data || [];
    } catch (error) {
      console.error('カテゴリ一覧取得エラー:', error);
      throw error;
    }
  }

  /**
   * 子要素取得
   */
  async getChildren(parentId: string): Promise<ContentHierarchy[]> {
    try {
      const response = await apiClient.get<ContentHierarchy[]>(
        `/content/children/${parentId}`,
      );
      return response.data || [];
    } catch (error) {
      console.error('子要素取得エラー:', error);
      throw error;
    }
  }

  /**
   * 階層情報取得（パンくずリスト用）
   */
  async getBreadcrumbs(contentId: string): Promise<ContentHierarchy[]> {
    try {
      const response = await apiClient.get<ContentHierarchy[]>(
        `/content/${contentId}/breadcrumbs`,
      );
      return response.data || [];
    } catch (error) {
      console.error('階層情報取得エラー:', error);
      throw error;
    }
  }

  /**
   * IDから階層選択情報を生成
   */
  async getSelectionFromContentId(
    contentId: string,
  ): Promise<CategorySelection> {
    try {
      const breadcrumbs = await this.getBreadcrumbs(contentId);
      const selection: CategorySelection = {};

      breadcrumbs.forEach((item) => {
        switch (item.type) {
          case 'category':
            selection.category_id = item.id;
            selection.category_name = item.name;
            break;
          case 'genre':
            selection.genre_id = item.id;
            selection.genre_name = item.name;
            break;
          case 'series':
            selection.series_id = item.id;
            selection.series_name = item.name;
            break;
          case 'event':
            selection.event_id = item.id;
            selection.event_name = item.name;
            break;
        }
      });

      return selection;
    } catch (error) {
      console.error('階層選択情報取得エラー:', error);
      throw error;
    }
  }

  /**
   * 階層ツリー取得
   */
  async getHierarchyTree(): Promise<HierarchyNode[]> {
    try {
      const response = await apiClient.get<HierarchyNode[]>('/content/tree');
      return response.data || [];
    } catch (error) {
      console.error('階層ツリー取得エラー:', error);
      throw error;
    }
  }
}

export const contentService = new ContentService();
