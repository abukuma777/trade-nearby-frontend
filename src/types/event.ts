/**
 * イベント関連の型定義
 */

// イベント基本型
export interface Event {
  id: string;
  content_id?: string;
  name: string;
  start_date: string;
  end_date: string;
  venue: string;
  artist?: string;
  url?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 物販種別（番号管理用）
export interface MerchandiseType {
  id: string;
  event_id: string;
  type_name: string;        // "ポラロイド風ホログラムトレカ" | "ガチャ"
  total_items: number;       // 12 | 49
  display_order: number;
  image_url?: string;        // 物販種別の画像URL
  created_at?: string;
}

// ウィッシュリスト（番号管理）
export interface WishList {
  id: string;
  user_id: string;
  event_id: string;
  type_name: string;         // 物販種別名
  item_numbers: number[];    // 欲しい番号の配列
  created_at: string;
  updated_at: string;
}

// ガチャ結果
export interface GachaResult {
  id: string;
  user_id: string;
  event_id: string;
  type_name: string;
  obtained_numbers: number[];    // 取得した番号
  keeping_numbers: number[];     // キープする番号
  tradeable_numbers: number[];   // 交換可能な番号
  created_at: string;
  updated_at: string;
}

// イベント投稿
export interface EventTrade {
  id: string;
  event_id: string;
  post_id: string;
  zone_code?: string;
  is_instant: boolean;
  expires_at: string;
  created_at: string;
}

// API リクエスト型
export interface SetWishListRequest {
  type_name: string;
  item_numbers: number[];
}

export interface RegisterGachaResultRequest {
  type_name: string;
  obtained_numbers: number[];
}

// API レスポンス型
export interface MerchandiseTypesResponse {
  success: boolean;
  data: MerchandiseType[];
}

export interface WishListResponse {
  success: boolean;
  data: WishList[];
}

export interface GachaResultResponse {
  success: boolean;
  data: {
    keeping: number[];
    tradeable: number[];
  };
}

// 番号選択用のヘルパー型
export interface NumberSelectionItem {
  number: number;
  selected: boolean;
  disabled?: boolean;
  owned?: boolean;        // 既に所有している
  tradeable?: boolean;    // 交換可能
}

// 物販種別ごとの番号設定
export const MERCHANDISE_CONFIG = {
  'ポラロイド風ホログラムトレカ': {
    totalItems: 12,
    displayName: 'ホログラムトレカ',
    maxSelection: 5,
    gridColumns: 4,
  },
  'ガチャ': {
    totalItems: 49,
    displayName: 'ガチャ',
    maxSelection: 10,
    gridColumns: 7,
  },
} as const;

// 番号を表示用にフォーマット
export function formatItemNumber(number: number, typeName: string): string {
  if (typeName === 'ポラロイド風ホログラムトレカ') {
    return `No.${number.toString().padStart(2, '0')}`;
  }
  return `${number}番`;
}

// 番号の配列をテキスト表示用にフォーマット
export function formatNumberList(numbers: number[]): string {
  if (numbers.length === 0) return 'なし';
  
  const sorted = [...numbers].sort((a, b) => a - b);
  const groups: string[] = [];
  let start = sorted[0];
  let end = sorted[0];
  
  for (let i = 1; i <= sorted.length; i++) {
    if (i === sorted.length || sorted[i] !== end + 1) {
      if (start === end) {
        groups.push(start.toString());
      } else if (end === start + 1) {
        groups.push(`${start}, ${end}`);
      } else {
        groups.push(`${start}〜${end}`);
      }
      
      if (i < sorted.length) {
        start = sorted[i];
        end = sorted[i];
      }
    } else {
      end = sorted[i];
    }
  }
  
  return groups.join(', ');
}
