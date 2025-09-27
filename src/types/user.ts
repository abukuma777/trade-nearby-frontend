/**
 * ユーザー関連の型定義
 */

// ユーザーの基本情報
export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  bio?: string;
  location?: {
    prefecture?: string;
    city?: string;
  };
  created_at: string;
  updated_at: string;
}

// ユーザーの統計情報
export interface UserStats {
  totalItems: number; // 出品アイテム数
  activeItems: number; // アクティブなアイテム数
  tradedItems: number; // 交換済みアイテム数
  rating: number; // 評価（1-5）
  ratingCount: number; // 評価数
  responseRate: number; // 返信率（%）
  responseTime: string; // 平均返信時間
  joinedDays: number; // 登録からの日数
}

// ユーザーの評価
export interface UserReview {
  id: string;
  reviewer_id: string;
  reviewer: {
    id: string;
    username: string;
    avatar?: string;
  };
  rating: number; // 1-5の評価
  comment?: string;
  trade_id?: string; // 取引ID
  created_at: string;
}

// ユーザープロフィール（詳細情報を含む）
export interface UserProfile extends User {
  stats?: UserStats;
  reviews?: UserReview[];
  badges?: UserBadge[];
  isVerified?: boolean; // 認証済みユーザー
  socialLinks?: {
    twitter?: string;
    instagram?: string;
  };
}

// ユーザーバッジ
export interface UserBadge {
  id: string;
  type: 'verified' | 'top_trader' | 'friendly' | 'quick_response' | 'trusted';
  name: string;
  description: string;
  icon: string;
  earned_at: string;
}

// バッジの日本語表示
export const badgeLabels: Record<string, string> = {
  verified: '認証済み',
  top_trader: 'トップトレーダー',
  friendly: 'フレンドリー',
  quick_response: '迅速対応',
  trusted: '信頼できる出品者',
};

// 評価レベルのラベル
export const getRatingLabel = (rating: number): string => {
  if (rating >= 4.5) return '非常に良い';
  if (rating >= 4.0) return '良い';
  if (rating >= 3.5) return '普通';
  if (rating >= 3.0) return 'まあまあ';
  return '改善が必要';
};

// 評価の星の色を取得
export const getRatingColor = (rating: number): string => {
  if (rating >= 4.5) return 'text-green-500';
  if (rating >= 4.0) return 'text-blue-500';
  if (rating >= 3.5) return 'text-yellow-500';
  if (rating >= 3.0) return 'text-orange-500';
  return 'text-red-500';
};
