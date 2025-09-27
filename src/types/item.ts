/**
 * アイテム関連の型定義
 */

// アイテムのカテゴリー
export type ItemCategory = 'anime' | 'manga' | 'game' | 'idol' | 'sports' | 'other';

// アイテムのコンディション
export type ItemCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor';

// アイテムのステータス
export type ItemStatus = 'active' | 'traded' | 'reserved';

// アイテムの公開状態
export type ItemVisibility = 'public' | 'private';

// 位置情報
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  prefecture?: string;
  city?: string;
}

// アイテムの基本型
export interface Item {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: ItemCategory;
  condition: ItemCondition;
  images: string[];
  tags: string[];
  status: ItemStatus;
  visibility: ItemVisibility;
  location?: Location;
  created_at: string;
  updated_at: string;
  // 追加フィールド（APIレスポンスに含まれる場合）
  user?: {
    id: string;
    username: string;
    avatar?: string;
  };
  distance?: number; // 近隣検索時の距離（km）
}

// アイテム一覧取得時のクエリパラメータ
export interface ItemsQueryParams {
  page?: number;
  limit?: number;
  category?: ItemCategory;
  status?: ItemStatus;
  visibility?: ItemVisibility;
  tags?: string[];
  search?: string;
  sort?: 'created_at' | '-created_at' | 'distance';
  user_id?: string; // 特定ユーザーのアイテムのみ取得
}

// 近隣アイテム検索時のクエリパラメータ
export interface NearbyItemsQueryParams {
  lat: number;
  lng: number;
  radius?: number; // km
  limit?: number;
  category?: ItemCategory;
}

// APIレスポンスの型
export interface ItemsResponse {
  items: Item[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// アイテム作成時の入力データ
export interface CreateItemInput {
  title: string;
  description: string;
  category: ItemCategory;
  condition: ItemCondition;
  images?: string[];
  tags?: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
}

// アイテム更新時の入力データ
export interface UpdateItemInput extends Partial<CreateItemInput> {
  status?: ItemStatus;
  visibility?: ItemVisibility;
}

// カテゴリーの日本語表示
export const categoryLabels: Record<ItemCategory, string> = {
  anime: 'アニメ',
  manga: 'マンガ',
  game: 'ゲーム',
  idol: 'アイドル',
  sports: 'スポーツ',
  other: 'その他',
};

// コンディションの日本語表示
export const conditionLabels: Record<ItemCondition, string> = {
  new: '新品',
  like_new: '未使用に近い',
  good: '良い',
  fair: '可',
  poor: '悪い',
};

// ステータスの日本語表示
export const statusLabels: Record<ItemStatus, string> = {
  active: '出品中',
  traded: '交換済み',
  reserved: '取引中',
};

// 公開状態の日本語表示
export const visibilityLabels: Record<ItemVisibility, string> = {
  public: '公開',
  private: '非公開',
};
