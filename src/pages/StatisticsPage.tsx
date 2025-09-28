/**
 * 統計ページ
 * 階層別のTOP5ランキングを表示
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { contentService, type CategoryCount } from '../services/contentService';

interface HierarchyNode {
  id: string;
  name: string;
  children: HierarchyNode[];
}

interface HierarchicalGroup {
  parent: CategoryCount;
  items: CategoryCount[];
}

const StatisticsPage: React.FC = () => {
  const [categoryCounts, setCategoryCounts] = useState<CategoryCount[]>([]);
  const [hierarchyTree, setHierarchyTree] = useState<HierarchyNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<
    'category' | 'genre' | 'series' | 'event'
  >('category');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedSeries, setSelectedSeries] = useState<string>('all');
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  useEffect(() => {
    void fetchStatistics();
  }, []);

  const fetchStatistics = async (): Promise<void> => {
    setLoading(true);
    try {
      const [counts, tree] = await Promise.all([
        contentService.getCategoryCounts(),
        contentService.getHierarchyTree(),
      ]);
      setCategoryCounts(counts);
      setHierarchyTree(tree as HierarchyNode[]);
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

  // 階層構造を反映したデータ取得
  const getHierarchicalData = (): CategoryCount[] | HierarchicalGroup[] => {
    if (selectedType === 'category') {
      // カテゴリのTOP5
      return getTop5('category');
    }

    const result: HierarchicalGroup[] = [];
    const countsMap = new Map<string, CategoryCount>();
    categoryCounts.forEach((c) => countsMap.set(c.id, c));

    if (selectedType === 'genre') {
      // カテゴリフィルタリング対応
      const categoriesToProcess =
        selectedCategory === 'all'
          ? hierarchyTree
          : hierarchyTree.filter((cat) => cat.id === selectedCategory);

      // 各カテゴリのジャンルTOP5
      categoriesToProcess.forEach((category) => {
        const categoryCount = countsMap.get(category.id);
        if (!categoryCount) {
          return;
        }

        const genreCounts = category.children
          .map((child) => countsMap.get(child.id))
          .filter((c): c is CategoryCount => c !== undefined)
          .sort((a, b) => {
            const countA = showActiveOnly ? a.totalCount : a.allTotalCount;
            const countB = showActiveOnly ? b.totalCount : b.allTotalCount;
            return countB - countA;
          })
          .slice(0, 5);

        if (
          genreCounts.some(
            (g) => (showActiveOnly ? g.totalCount : g.allTotalCount) > 0,
          )
        ) {
          result.push({
            parent: categoryCount,
            items: genreCounts,
          });
        }
      });
    } else if (selectedType === 'series') {
      // カテゴリ/ジャンルフィルタリング対応
      const categoriesToProcess =
        selectedCategory === 'all'
          ? hierarchyTree
          : hierarchyTree.filter((cat) => cat.id === selectedCategory);

      categoriesToProcess.forEach((category) => {
        const genresToProcess =
          selectedGenre === 'all'
            ? category.children
            : category.children.filter((g) => g.id === selectedGenre);

        genresToProcess.forEach((genre) => {
          const genreCount = countsMap.get(genre.id);
          if (!genreCount) {
            return;
          }

          const seriesCounts = genre.children
            .map((child) => countsMap.get(child.id))
            .filter((c): c is CategoryCount => c !== undefined)
            .sort((a, b) => {
              const countA = showActiveOnly ? a.totalCount : a.allTotalCount;
              const countB = showActiveOnly ? b.totalCount : b.allTotalCount;
              return countB - countA;
            })
            .slice(0, 5);

          if (
            seriesCounts.some(
              (s) => (showActiveOnly ? s.totalCount : s.allTotalCount) > 0,
            )
          ) {
            result.push({
              parent: genreCount,
              items: seriesCounts,
            });
          }
        });
      });
    } else if (selectedType === 'event') {
      // カテゴリ/ジャンル/シリーズフィルタリング対応
      const categoriesToProcess =
        selectedCategory === 'all'
          ? hierarchyTree
          : hierarchyTree.filter((cat) => cat.id === selectedCategory);

      categoriesToProcess.forEach((category) => {
        const genresToProcess =
          selectedGenre === 'all'
            ? category.children
            : category.children.filter((g) => g.id === selectedGenre);

        genresToProcess.forEach((genre) => {
          const seriesToProcess =
            selectedSeries === 'all'
              ? genre.children
              : genre.children.filter((s) => s.id === selectedSeries);

          seriesToProcess.forEach((series) => {
            const seriesCount = countsMap.get(series.id);
            if (!seriesCount) {
              return;
            }

            const eventCounts = series.children
              .map((child) => countsMap.get(child.id))
              .filter((c): c is CategoryCount => c !== undefined)
              .sort((a, b) => {
                const countA = showActiveOnly ? a.totalCount : a.allTotalCount;
                const countB = showActiveOnly ? b.totalCount : b.allTotalCount;
                return countB - countA;
              })
              .slice(0, 5);

            if (
              eventCounts.some(
                (e) => (showActiveOnly ? e.totalCount : e.allTotalCount) > 0,
              )
            ) {
              result.push({
                parent: seriesCount,
                items: eventCounts,
              });
            }
          });
        });
      });
    }

    return result;
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

  const hierarchicalData = getHierarchicalData();

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
          {(['category', 'genre', 'series', 'event'] as const).map((type) => (
            <button
              key={type}
              onClick={() => {
                setSelectedType(type);
                // タブ切り替え時にフィルターをリセット
                if (type === 'category') {
                  setSelectedCategory('all');
                  setSelectedGenre('all');
                  setSelectedSeries('all');
                } else if (type === 'genre') {
                  setSelectedGenre('all');
                  setSelectedSeries('all');
                } else if (type === 'series') {
                  setSelectedSeries('all');
                }
              }}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {getTypeName(type)}
            </button>
          ))}
        </div>

        {/* フィルター */}
        {(selectedType === 'genre' ||
          selectedType === 'series' ||
          selectedType === 'event') && (
          <div className="mb-4 space-y-2">
            {/* カテゴリフィルター */}
            <div className="flex flex-wrap gap-2">
              <span className="py-1.5 text-sm font-medium text-gray-600">
                カテゴリ:
              </span>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedGenre('all');
                  setSelectedSeries('all');
                }}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                全カテゴリ
              </button>
              {hierarchyTree.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setSelectedGenre('all');
                    setSelectedSeries('all');
                  }}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* ジャンルフィルター（シリーズ、イベント選択時のみ） */}
            {(selectedType === 'series' || selectedType === 'event') &&
              selectedCategory !== 'all' &&
              (() => {
                const selectedCat = hierarchyTree.find(
                  (c) => c.id === selectedCategory,
                );
                if (!selectedCat || selectedCat.children.length === 0)
                  {return null;}

                return (
                  <div className="flex flex-wrap gap-2">
                    <span className="py-1.5 text-sm font-medium text-gray-600">
                      ジャンル:
                    </span>
                    <button
                      onClick={() => {
                        setSelectedGenre('all');
                        setSelectedSeries('all');
                      }}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                        selectedGenre === 'all'
                          ? 'bg-purple-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      全ジャンル
                    </button>
                    {selectedCat.children.map((genre) => (
                      <button
                        key={genre.id}
                        onClick={() => {
                          setSelectedGenre(genre.id);
                          setSelectedSeries('all');
                        }}
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                          selectedGenre === genre.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {genre.name}
                      </button>
                    ))}
                  </div>
                );
              })()}

            {/* シリーズフィルター（イベント選択時のみ） */}
            {selectedType === 'event' &&
              selectedGenre !== 'all' &&
              (() => {
                const selectedCat = hierarchyTree.find(
                  (c) => c.id === selectedCategory,
                );
                if (!selectedCat) {return null;}
                const selectedGen = selectedCat.children.find(
                  (g) => g.id === selectedGenre,
                );
                if (!selectedGen || selectedGen.children.length === 0)
                  {return null;}

                return (
                  <div className="flex flex-wrap gap-2">
                    <span className="py-1.5 text-sm font-medium text-gray-600">
                      シリーズ:
                    </span>
                    <button
                      onClick={() => setSelectedSeries('all')}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                        selectedSeries === 'all'
                          ? 'bg-orange-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      全シリーズ
                    </button>
                    {selectedGen.children.map((series) => (
                      <button
                        key={series.id}
                        onClick={() => setSelectedSeries(series.id)}
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                          selectedSeries === series.id
                            ? 'bg-orange-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {series.name}
                      </button>
                    ))}
                  </div>
                );
              })()}
          </div>
        )}

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
        {selectedType === 'category' ? (
          // カテゴリのTOP5表示
          <div className="rounded-lg bg-white p-4 shadow">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              🏆 {getTypeName(selectedType)} 人気TOP5
            </h2>

            {(hierarchicalData as CategoryCount[]).length === 0 ? (
              <p className="text-center text-gray-500">
                投稿データがありません
              </p>
            ) : (
              <div className="space-y-3">
                {(hierarchicalData as CategoryCount[]).map((item, index) => {
                  const displayCount = showActiveOnly
                    ? item.totalCount
                    : item.allTotalCount;

                  const maxCount = Math.max(
                    ...(hierarchicalData as CategoryCount[]).map((i) =>
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
        ) : (
          // 階層構造で表示
          <div className="space-y-6">
            {(hierarchicalData as HierarchicalGroup[]).length === 0 ? (
              <div className="rounded-lg bg-white p-4 shadow">
                <p className="text-center text-gray-500">
                  投稿データがありません
                </p>
              </div>
            ) : (
              (hierarchicalData as HierarchicalGroup[]).map((group) => (
                <div
                  key={group.parent.id}
                  className="rounded-lg bg-white p-4 shadow"
                >
                  <h3 className="mb-3 border-b pb-2 text-lg font-bold text-gray-900">
                    {group.parent.name}
                  </h3>
                  <div className="space-y-2">
                    {group.items.map((item: CategoryCount, index: number) => {
                      const displayCount = showActiveOnly
                        ? item.totalCount
                        : item.allTotalCount;

                      const maxCount = Math.max(
                        ...group.items.map((i: CategoryCount) =>
                          showActiveOnly ? i.totalCount : i.allTotalCount,
                        ),
                      );
                      const percentage =
                        maxCount > 0 ? (displayCount / maxCount) * 100 : 0;

                      return (
                        <div key={item.id} className="relative">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {/* 順位 */}
                              <span
                                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
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

                              {/* 名前 */}
                              <Link
                                to={`/trade-posts?content_id=${item.id}&include_children=true`}
                                className="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline"
                              >
                                {item.name}
                              </Link>
                            </div>

                            {/* 投稿数 */}
                            <div
                              className={`text-sm font-bold ${
                                showActiveOnly
                                  ? 'text-blue-600'
                                  : 'text-gray-900'
                              }`}
                            >
                              {displayCount}件
                            </div>
                          </div>

                          {/* プログレスバー */}
                          <div className="mt-1 h-1 overflow-hidden rounded-full bg-gray-200">
                            <div
                              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

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
