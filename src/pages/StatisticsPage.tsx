/**
 * 統計ページ
 * カテゴリ別投稿数や人気ランキングを表示
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { contentService, type CategoryCount } from '../services/contentService';

const StatisticsPage: React.FC = () => {
  const [categoryCounts, setCategoryCounts] = useState<CategoryCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'total' | 'direct'>('total');

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

  // カテゴリを階層タイプ別に分類
  const getCategoriesByType = (type: string): CategoryCount[] => {
    return categoryCounts.filter((c) => c.type === type);
  };

  // ランキング用にソート（投稿がある物のみ）
  const getTopCategories = (limit: number = 10): CategoryCount[] => {
    const activeCategories = categoryCounts.filter((c) =>
      sortBy === 'total' ? c.totalCount > 0 : c.directCount > 0,
    );

    return activeCategories
      .sort((a, b) => {
        const countA = sortBy === 'total' ? a.totalCount : a.directCount;
        const countB = sortBy === 'total' ? b.totalCount : b.directCount;
        return countB - countA;
      })
      .slice(0, limit);
  };

  // 統計サマリー
  const getStatsSummary = (): {
    totalPosts: number;
    categoriesWithPosts: number;
    totalCategories: number;
  } => {
    const totalPosts = categoryCounts.reduce(
      (sum, c) => Math.max(sum, c.totalCount),
      0,
    );
    const categoriesWithPosts = categoryCounts.filter(
      (c) => c.directCount > 0,
    ).length;
    const totalCategories = categoryCounts.length;

    return {
      totalPosts,
      categoriesWithPosts,
      totalCategories,
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
  const topCategories = getTopCategories();

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
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-sm text-gray-600">総投稿数</div>
            <div className="text-3xl font-bold text-blue-600">
              {stats.totalPosts}
            </div>
            <div className="text-xs text-gray-500">アクティブな投稿</div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-sm text-gray-600">アクティブカテゴリ</div>
            <div className="text-3xl font-bold text-green-600">
              {stats.categoriesWithPosts}
            </div>
            <div className="text-xs text-gray-500">投稿があるカテゴリ</div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="text-sm text-gray-600">総カテゴリ数</div>
            <div className="text-3xl font-bold text-purple-600">
              {stats.totalCategories}
            </div>
            <div className="text-xs text-gray-500">全階層の合計</div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* 人気カテゴリランキング */}
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                🏆 人気カテゴリTOP10
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy('total')}
                  className={`rounded px-3 py-1 text-sm ${
                    sortBy === 'total'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  子含む
                </button>
                <button
                  onClick={() => setSortBy('direct')}
                  className={`rounded px-3 py-1 text-sm ${
                    sortBy === 'direct'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  直接のみ
                </button>
              </div>
            </div>

            {topCategories.length === 0 ? (
              <p className="text-gray-500">投稿データがありません</p>
            ) : (
              <div className="space-y-3">
                {topCategories.map((category, index) => {
                  const count =
                    sortBy === 'total'
                      ? category.totalCount
                      : category.directCount;
                  const percentage = (count / stats.totalPosts) * 100;

                  return (
                    <div key={category.id} className="relative">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
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
                          <div>
                            <Link
                              to={`/trade-posts?content_id=${category.id}&include_children=${sortBy === 'total'}`}
                              className="font-medium text-gray-900 hover:text-blue-600 hover:underline"
                            >
                              {category.name}
                            </Link>
                            <div className="text-xs text-gray-500">
                              {category.type === 'category' && 'カテゴリ'}
                              {category.type === 'genre' && 'ジャンル'}
                              {category.type === 'series' && 'シリーズ'}
                              {category.type === 'event' && 'イベント'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">
                            {count}件
                          </div>
                          <div className="text-xs text-gray-500">
                            {percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      {/* プログレスバー */}
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
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

          {/* 階層別統計 */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              📊 階層別統計
            </h2>

            <div className="space-y-4">
              {['category', 'genre', 'series', 'event'].map((type) => {
                const items = getCategoriesByType(type);
                const activeItems = items.filter((i) => i.directCount > 0);
                const totalInType = items.reduce(
                  (sum, i) => sum + i.directCount,
                  0,
                );

                return (
                  <div key={type} className="border-b pb-3 last:border-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {type === 'category' && '🏷️ カテゴリ'}
                          {type === 'genre' && '🎭 ジャンル'}
                          {type === 'series' && '📚 シリーズ'}
                          {type === 'event' && '🎪 イベント'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {activeItems.length} / {items.length} アクティブ
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">
                          {totalInType}件
                        </div>
                        <div className="text-xs text-gray-500">直接投稿</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
