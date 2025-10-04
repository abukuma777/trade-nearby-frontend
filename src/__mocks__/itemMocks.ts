/**
 * テスト用モックデータ
 */

import { Item, ItemsResponse } from '@/types/item';

// モックアイテムデータ
export const mockItems: Item[] = [
  {
    id: '1',
    user_id: 'user1',
    title: '鬼滅の刃 アクリルスタンド 竈門炭治郎',
    description: 'ジャンプショップで購入したアクリルスタンドです。未開封新品です。',
    category: 'anime',
    condition: 'new',
    images: ['https://via.placeholder.com/300x300?text=Item1'],
    tags: ['鬼滅の刃', '竈門炭治郎', 'アクスタ'],
    status: 'active',
    visibility: 'public',
    location: {
      latitude: 35.6762,
      longitude: 139.6503,
      prefecture: '東京都',
      city: '渋谷区',
    },
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    user: {
      id: 'user1',
      username: 'taro_trade',
      avatar: 'https://via.placeholder.com/50x50?text=User1',
    },
  },
  {
    id: '2',
    user_id: 'user2',
    title: '呪術廻戦 缶バッジセット 五条悟',
    description: 'イベント限定の缶バッジ5個セットです。バラ売り不可。',
    category: 'anime',
    condition: 'like_new',
    images: ['https://via.placeholder.com/300x300?text=Item2'],
    tags: ['呪術廻戦', '五条悟', '缶バッジ'],
    status: 'active',
    visibility: 'public',
    location: {
      latitude: 35.6895,
      longitude: 139.6917,
      prefecture: '東京都',
      city: '新宿区',
    },
    created_at: '2024-01-14T15:30:00Z',
    updated_at: '2024-01-14T15:30:00Z',
    user: {
      id: 'user2',
      username: 'hanako_anime',
      avatar: 'https://via.placeholder.com/50x50?text=User2',
    },
  },
  {
    id: '3',
    user_id: 'user3',
    title: 'ポケモンカード リザードンex SAR',
    description: '開封後すぐにスリーブに入れて保管していました。美品です。',
    category: 'game',
    condition: 'good',
    images: ['https://via.placeholder.com/300x300?text=Item3'],
    tags: ['ポケモンカード', 'リザードン', 'SAR'],
    status: 'active',
    visibility: 'public',
    location: {
      latitude: 34.6937,
      longitude: 135.5023,
      prefecture: '大阪府',
      city: '大阪市',
    },
    created_at: '2024-01-13T12:00:00Z',
    updated_at: '2024-01-13T12:00:00Z',
    user: {
      id: 'user3',
      username: 'pokemon_master',
      avatar: 'https://via.placeholder.com/50x50?text=User3',
    },
  },
  {
    id: '4',
    user_id: 'user4',
    title: 'ホロライブ 兎田ぺこら タペストリー',
    description: '公式通販で購入したタペストリーです。飾らずに保管していました。',
    category: 'idol',
    condition: 'new',
    images: ['https://via.placeholder.com/300x300?text=Item4'],
    tags: ['ホロライブ', '兎田ぺこら', 'タペストリー'],
    status: 'active',
    visibility: 'public',
    location: {
      latitude: 35.1815,
      longitude: 136.9066,
      prefecture: '愛知県',
      city: '名古屋市',
    },
    created_at: '2024-01-12T09:20:00Z',
    updated_at: '2024-01-12T09:20:00Z',
    user: {
      id: 'user4',
      username: 'vtuber_fan',
      avatar: 'https://via.placeholder.com/50x50?text=User4',
    },
  },
  {
    id: '5',
    user_id: 'user5',
    title: 'ONE PIECE フィギュア モンキー・D・ルフィ',
    description: 'P.O.P NEO-MAXIMUM フィギュアです。箱にダメージあり。',
    category: 'manga',
    condition: 'fair',
    images: ['https://via.placeholder.com/300x300?text=Item5'],
    tags: ['ワンピース', 'ルフィ', 'フィギュア', 'P.O.P'],
    status: 'active',
    visibility: 'public',
    location: {
      latitude: 33.5904,
      longitude: 130.4017,
      prefecture: '福岡県',
      city: '福岡市',
    },
    created_at: '2024-01-11T18:45:00Z',
    updated_at: '2024-01-11T18:45:00Z',
    user: {
      id: 'user5',
      username: 'onepiece_lover',
      avatar: 'https://via.placeholder.com/50x50?text=User5',
    },
  },
  {
    id: '6',
    user_id: 'user6',
    title: '阪神タイガース 選手サイン色紙',
    description: '2023年優勝記念の選手サイン色紙です。レプリカではありません。',
    category: 'sports',
    condition: 'good',
    images: ['https://via.placeholder.com/300x300?text=Item6'],
    tags: ['阪神タイガース', 'サイン', '色紙', '2023年優勝'],
    status: 'active',
    visibility: 'public',
    location: {
      latitude: 34.6851,
      longitude: 135.1956,
      prefecture: '兵庫県',
      city: '西宮市',
    },
    created_at: '2024-01-10T14:30:00Z',
    updated_at: '2024-01-10T14:30:00Z',
    user: {
      id: 'user6',
      username: 'tigers_fan',
      avatar: 'https://via.placeholder.com/50x50?text=User6',
    },
  },
];

// モックAPIレスポンス
export const mockItemsResponse: ItemsResponse = {
  items: mockItems,
  total: mockItems.length,
  page: 1,
  limit: 20,
  totalPages: 1,
};

// カテゴリー別のモックデータを取得
export const getMockItemsByCategory = (category?: string): Item[] => {
  if (!category) {return mockItems;}
  return mockItems.filter((item) => item.category === category);
};

// ステータス別のモックデータを取得
export const getMockItemsByStatus = (status?: string): Item[] => {
  if (!status) {return mockItems;}
  return mockItems.filter((item) => item.status === status);
};

// 検索用のモックデータを取得
export const searchMockItems = (query?: string): Item[] => {
  if (!query) {return mockItems;}
  const lowerQuery = query.toLowerCase();
  return mockItems.filter(
    (item) =>
      item.title.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery) ||
      item.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
  );
};
