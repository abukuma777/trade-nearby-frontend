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
  } => {
    const items = getFilteredByType(type);
    const activeItems = items.filter((i) => i.totalCount > 0);

    return {
      activeItems: activeItems.length,
      totalItems: items.length,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-3xl px-4">
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
        <div className="mx-auto max-w-3xl px-4">
          <div className="rounded-lg bg-red-100 p-4 text-red-700">{error}</div>
        </div>
      </div>
    );
  }

  const top5Items = getTop5(selectedType);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-3xl px-4">
        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">統計情報</h1>
          <p className="text-sm text-gray-600">
            カテゴリ別の投稿数や人気ランキングを確認できます
          </p>
        </div>

        {/* 階層別タブ */}
        <div className="mb-4 flex flex-wrap gap-2">
          {(['category', 'genre', 'series', 'event'] as const).map((type) => {
            const typeStats = getTypeStats(type);
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
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
        <div className="mb-4">
          <div className="inline-flex rounded-lg bg-white shadow">
            <button
              onClick={() => setShowActiveOnly(true)}
              className={`px-3 py-1.5 text-sm font-medium ${
                showActiveOnly
                  ? 'rounded-l-lg bg-blue-600 text-white'
                  : 'rounded-l-lg text-gray-700 hover:bg-gray-100'
              }`}
            >
              現在出品中のみ
            </button>
            <button
              onClick={() => setShowActiveOnly(false)}
              className={`px-3 py-1.5 text-sm font-medium ${
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
        <div className="rounded-lg bg-white p-4 shadow">
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            🏆 {getTypeName(selectedType)} 人気TOP5
          </h2>

          {top5Items.length === 0 ? (
            <p className="text-center text-gray-500">投稿データがありません</p>
          ) : (
            <div className="space-y-3">
              {top5Items.map((item, index) => {
                const displayCount = showActiveOnly
                  ? item.totalCount
                  : item.allTotalCount;

                const maxCount = Math.max(
                  ...top5Items.map((i) =>
                    showActiveOnly ? i.totalCount : i.allTotalCount,
                  ),
                );
                const percentage =
                  maxCount > 0 ? (displayCount / maxCount) * 100 : 0;

                return (
                  <div key={item.id} className="relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* 順位 */}
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
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          {showActiveOnly ? '現在出品中' : '取引完了含む'}
                        </div>
                        <div
                          className={`font-bold ${
                            showActiveOnly ? 'text-blue-600' : 'text-gray-900'
                          }`}
                        >
                          {displayCount}件
                        </div>
                      </div>
                    </div>

                    {/* プログレスバー */}
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200">
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

        {/* アクションボタン */}
        <div className="mt-6 text-center">
          <Link
            to="/trade-posts"
            className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
          >
            投稿一覧を見る
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
