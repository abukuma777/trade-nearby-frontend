/**
 * 統計ページ
 * 階層別のTOP5ランキングを表示
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { contentService, type CategoryCount } from '../services/contentService';

const StatisticsPage: React.FC = () => {
  const [categoryCounts, setCategoryCounts] = useState<CategoryCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<
    'category' | 'genre' | 'series' | 'event'
  >('category');
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  useEffect(() => {
    void fetchStatistics();
  }, []);

  const fetchStatistics = async (): Promise<void> => {
    setLoading(true);
    try {
      const counts = await contentService.getCategoryCounts();
      setCategoryCounts(counts);
    } catch (err) {
      setError('統計情報の取得に失敗しました');
      console.error('統計情報取得エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  // 階層タイプ別にフィルター
  const getFilteredByType = (type: string): CategoryCount[] => {
    return categoryCounts.filter((c) => c.type === type);
  };

  // TOP5取得（子含む数でソート）
  const getTop5 = (type: string): CategoryCount[] => {
    const filtered = getFilteredByType(type);
    return filtered
      .sort((a, b) => {
        const countA = showActiveOnly ? a.totalCount : a.allTotalCount;
        const countB = showActiveOnly ? b.totalCount : b.allTotalCount;
        return countB - countA;
      })
      .slice(0, 5);
  };

  // 統計サマリー
  const getStatsSummary = (): {
    activePosts: number;
    totalPosts: number;
    activeCategories: number;
    totalCategories: number;
  } => {
    const activePosts = categoryCounts.reduce(
      (sum, c) => Math.max(sum, c.totalCount),
      0,
    );
    const totalPosts = categoryCounts.reduce(
      (sum, c) => Math.max(sum, c.allTotalCount),
      0,
    );
    const activeCategories = categoryCounts.filter(
      (c) => c.totalCount > 0,
    ).length;
    const totalCategories = categoryCounts.length;

    return {
      activePosts,
      totalPosts,
      activeCategories,
      totalCategories,
    };
  };

  // タイプ名の日本語化
  const getTypeName = (type: string): string => {
    switch (type) {
      case 'category':
        return 'カテゴリ';
      case 'genre':
        return 'ジャンル';
      case 'series':
        return 'シリーズ';
      case 'event':
        return 'イベント';
      default:
        return type;
    }
  };

  // 階層別統計の取得
  const getTypeStats = (
    type: string,
  ): {
    activeItems: number;
    totalItems: number;
    activePosts: number;
    totalPosts: number;
  } => {
    const items = getFilteredByType(type);
    const activeItems = items.filter((i) => i.totalCount > 0);
    const totalActive = items.reduce((sum, i) => sum + i.totalCount, 0);
    const totalAll = items.reduce((sum, i) => sum + i.allTotalCount, 0);

    return {
      activeItems: activeItems.length,
      totalItems: items.length,
      activePosts: totalActive,
      totalPosts: totalAll,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex h-64 items-center justify-center">
            <div className="text-gray-500">統計情報を読み込み中...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="rounded-lg bg-red-100 p-4 text-red-700">{error}</div>
        </div>
      </div>
    );
  }

  const stats = getStatsSummary();
  const top5Items = getTop5(selectedType);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">統計情報</h1>
          <p className="text-gray-600">
            カテゴリ別の投稿数や人気ランキングを確認できます
          </p>
        </div>

        {/* サマリーカード */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-sm text-gray-600">アクティブ投稿</div>
            <div className="text-3xl font-bold text-blue-600">
              {stats.activePosts}
            </div>
            <div className="text-xs text-gray-500">現在出品中</div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-sm text-gray-600">総投稿数</div>
            <div className="text-3xl font-bold text-green-600">
              {stats.totalPosts}
            </div>
            <div className="text-xs text-gray-500">取引完了含む</div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-sm text-gray-600">アクティブカテゴリ</div>
            <div className="text-3xl font-bold text-purple-600">
              {stats.activeCategories}
            </div>
            <div className="text-xs text-gray-500">投稿があるカテゴリ</div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-sm text-gray-600">総カテゴリ数</div>
            <div className="text-3xl font-bold text-orange-600">
              {stats.totalCategories}
            </div>
            <div className="text-xs text-gray-500">全階層の合計</div>
          </div>
        </div>

        {/* 階層別タブ */}
        <div className="mb-6 flex flex-wrap gap-2">
          {(['category', 'genre', 'series', 'event'] as const).map((type) => {
            const typeStats = getTypeStats(type);
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  selectedType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{getTypeName(type)}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    selectedType === type
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {typeStats.activeItems}/{typeStats.totalItems}
                </span>
              </button>
            );
          })}
        </div>

        {/* 表示切り替え */}
        <div className="mb-6 flex justify-end">
          <div className="flex rounded-lg bg-white shadow">
            <button
              onClick={() => setShowActiveOnly(true)}
              className={`px-4 py-2 text-sm font-medium ${
                showActiveOnly
                  ? 'rounded-l-lg bg-blue-600 text-white'
                  : 'rounded-l-lg text-gray-700 hover:bg-gray-100'
              }`}
            >
              現在出品中のみ
            </button>
            <button
              onClick={() => setShowActiveOnly(false)}
              className={`px-4 py-2 text-sm font-medium ${
                !showActiveOnly
                  ? 'rounded-r-lg bg-blue-600 text-white'
                  : 'rounded-r-lg text-gray-700 hover:bg-gray-100'
              }`}
            >
              取引完了含む
            </button>
          </div>
        </div>

        {/* 人気TOP5ランキング */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-6 text-xl font-bold text-gray-900">
            🏆 {getTypeName(selectedType)} 人気TOP5
          </h2>

          {top5Items.length === 0 ? (
            <p className="text-center text-gray-500">投稿データがありません</p>
          ) : (
            <div className="space-y-4">
              {top5Items.map((item, index) => {
                const activeTotalCount = item.totalCount;
                const allTotalCount = item.allTotalCount;

                const maxCount = Math.max(
                  ...top5Items.map((i) =>
                    showActiveOnly ? i.totalCount : i.allTotalCount,
                  ),
                );
                const currentCount = showActiveOnly
                  ? activeTotalCount
                  : allTotalCount;
                const percentage =
                  maxCount > 0 ? (currentCount / maxCount) * 100 : 0;

                return (
                  <div key={item.id} className="relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* 順位 */}
                        <span
                          className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold ${
                            index === 0
                              ? 'bg-yellow-400 text-white'
                              : index === 1
                                ? 'bg-gray-300 text-gray-700'
                                : index === 2
                                  ? 'bg-orange-400 text-white'
                                  : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {index + 1}
                        </span>

                        {/* カテゴリ名 */}
                        <div className="flex-1">
                          <Link
                            to={`/trade-posts?content_id=${item.id}&include_children=true`}
                            className="font-medium text-gray-900 hover:text-blue-600 hover:underline"
                          >
                            {item.name}
                          </Link>
                        </div>
                      </div>

                      {/* 投稿数 */}
                      <div className="flex gap-8 text-right">
                        <div>
                          <div className="text-xs text-gray-500">
                            現在出品中
                          </div>
                          <div className="font-bold text-blue-600">
                            {activeTotalCount}件
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">
                            取引完了含む
                          </div>
                          <div className="font-bold text-gray-900">
                            {allTotalCount}件
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* プログレスバー */}
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 階層別統計サマリー */}
        <div className="mt-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            📊 階層別統計サマリー
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(['category', 'genre', 'series', 'event'] as const).map((type) => {
              const typeStats = getTypeStats(type);

              return (
                <div key={type} className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      {type === 'category' && '🏷️'}
                      {type === 'genre' && '🎭'}
                      {type === 'series' && '📚'}
                      {type === 'event' && '🎪'} {getTypeName(type)}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">アクティブ</span>
                      <span className="font-medium">
                        {typeStats.activeItems}/{typeStats.totalItems}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">現在出品</span>
                      <span className="font-medium text-blue-600">
                        {typeStats.activePosts}件
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">総投稿数</span>
                      <span className="font-medium">
                        {typeStats.totalPosts}件
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* アクションボタン */}
        <div className="mt-8 text-center">
          <Link
            to="/trade-posts"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
          >
            投稿一覧を見る
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
