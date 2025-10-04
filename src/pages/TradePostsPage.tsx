/**
 * 交換投稿一覧ページ（画像対応版）
 * カード型レイアウトでサムネイル表示
 */

import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import CategorySelect, {
  CategorySelection,
} from '../components/CategorySelect';
import { contentService, type CategoryCount } from '../services/contentService';
import { useTradePostStore } from '../stores/tradePostStore';

const TradePostsPage: React.FC = () => {
  const { posts, loading, error, fetchPosts, clearError } = useTradePostStore();
  const [searchParams, setSearchParams] = useSearchParams();

  // URLパラメータから初期値を取得
  const urlContentId = searchParams.get('content_id');
  const urlIncludeChildren = searchParams.get('include_children') !== 'false';

  // カテゴリフィルターの状態
  const [categorySelection, setCategorySelection] = useState<CategorySelection>(
    {},
  );
  const [includeChildren, setIncludeChildren] = useState(urlIncludeChildren);
  const [showFilter, setShowFilter] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [currentCategoryCount, setCurrentCategoryCount] =
    useState<CategoryCount | null>(null);

  // URLパラメータが変更されたときにフィルターを適用
  useEffect(() => {
    const initializeFromUrl = async (): Promise<void> => {
      if (!isInitialized && urlContentId) {
        setLoadingCategory(true);
        try {
          // URLから直接アクセスした場合、階層情報を取得
          const selection =
            await contentService.getSelectionFromContentId(urlContentId);
          setCategorySelection(selection);
          setIncludeChildren(urlIncludeChildren);

          // 投稿数を取得
          const count = await contentService.getCategoryCountById(urlContentId);
          setCurrentCategoryCount(count || null);

          // content_idで検索を実行
          void fetchPosts('active', urlContentId, urlIncludeChildren, true);
        } catch (error) {
          console.error('カテゴリ情報取得エラー:', error);
          // エラーが発生しても投稿は取得を試みる
          void fetchPosts('active', urlContentId, urlIncludeChildren, true);
        } finally {
          setLoadingCategory(false);
          setIsInitialized(true);
        }
      } else if (!urlContentId && !isInitialized) {
        // content_idが指定されていない場合は全件取得（自分の投稿を除外）
        void fetchPosts('active', undefined, undefined, true);
        setIsInitialized(true);
      }
    };

    void initializeFromUrl();
  }, [urlContentId, urlIncludeChildren, fetchPosts, isInitialized]);

  // フィルターを適用して投稿を取得
  const applyFilter = async (): Promise<void> => {
    // 最深階層のIDを取得
    const contentId =
      categorySelection.event_id ||
      categorySelection.series_id ||
      categorySelection.genre_id ||
      categorySelection.category_id;

    if (contentId) {
      // URLパラメータを更新
      const params = new URLSearchParams();
      params.set('content_id', contentId);
      params.set('include_children', includeChildren.toString());
      setSearchParams(params);

      // 投稿数を取得
      try {
        const count = await contentService.getCategoryCountById(contentId);
        setCurrentCategoryCount(count || null);
      } catch (error) {
        console.error('投稿数取得エラー:', error);
      }

      void fetchPosts('active', contentId, includeChildren, true);
    }
    setShowFilter(false); // フィルターを閉じる
  };

  // フィルターをクリア
  const clearFilter = (): void => {
    setCategorySelection({});
    setCurrentCategoryCount(null);
    setSearchParams({}); // URLパラメータをクリア
    void fetchPosts('active', undefined, undefined, true);
    setShowFilter(false);
  };

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  // デバッグ用：取得したデータを確認
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  useEffect(() => {
    // デバッグコードは本番環境では無効化
  }, [posts]);

  // メイン画像またはデフォルト画像を取得
  const getMainImage = (
    images?: Array<{ url: string; is_main?: boolean }>,
  ): string | null => {
    if (!images || images.length === 0) {
      return null;
    }
    const mainImage = images.find((img) => img.is_main);
    return mainImage ? mainImage.url : images[0].url;
  };

  // デフォルト画像のプレースホルダー
  const DefaultImagePlaceholder = ({ text }: { text: string }): JSX.Element => (
    <div className="flex h-48 w-full items-center justify-center rounded-t-lg bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="mt-2 text-xs text-gray-500">{text}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex h-64 items-center justify-center">
            <div className="text-gray-500">読み込み中...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">
            交換投稿一覧
          </h1>
          <p className="text-gray-600">
            シンプルな「譲)〇〇 求)〇〇」形式で交換相手を探しましょう
          </p>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* アクションボタン */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-4">
            <Link
              to="/trade-posts/create"
              className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              新規投稿作成
            </Link>
            <Link
              to="/trade-posts/my"
              className="rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
            >
              自分の投稿
            </Link>
          </div>

          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
            フィルター
          </button>
        </div>

        {/* フィルターパネル */}
        {showFilter && (
          <div className="mb-6 rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-bold text-gray-900">
              カテゴリで絞り込み
            </h3>

            <CategorySelect
              onSelectionChange={setCategorySelection}
              initialSelection={categorySelection}
              required={false}
            />

            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeChildren}
                  onChange={(e) => setIncludeChildren(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">
                  選択したカテゴリ以下のすべての投稿を含む
                </span>
              </label>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => void applyFilter()}
                className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
                disabled={!categorySelection.category_id}
              >
                フィルターを適用
              </button>
              <button
                onClick={clearFilter}
                className="rounded-lg bg-gray-300 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-400"
              >
                クリア
              </button>
            </div>
          </div>
        )}

        {/* 現在のフィルター表示 */}
        {(categorySelection.category_name ||
          categorySelection.genre_name ||
          categorySelection.series_name ||
          categorySelection.event_name ||
          (urlContentId && loadingCategory)) && (
          <div className="mb-4 flex items-center justify-between rounded-lg bg-blue-50 p-3">
            <div className="text-sm text-blue-900">
              {loadingCategory ? (
                <span>カテゴリ情報を読み込み中...</span>
              ) : (
                <>
                  <span className="font-medium">フィルター: </span>
                  {[
                    categorySelection.category_name,
                    categorySelection.genre_name,
                    categorySelection.series_name,
                    categorySelection.event_name,
                  ]
                    .filter(Boolean)
                    .join(' > ')}
                  {includeChildren && (
                    <span className="ml-2 text-xs text-blue-700">
                      （子カテゴリを含む）
                    </span>
                  )}
                  {currentCategoryCount && (
                    <span className="ml-2 text-xs font-bold text-blue-700">
                      (直接: {currentCategoryCount.directCount}件 / 子含む:{' '}
                      {currentCategoryCount.totalCount}件)
                    </span>
                  )}
                </>
              )}
            </div>
            <button
              onClick={clearFilter}
              className="text-sm text-blue-600 underline hover:text-blue-800"
              disabled={loadingCategory}
            >
              解除
            </button>
          </div>
        )}

        {/* 投稿グリッド */}
        <div className="mb-4 text-right text-sm text-gray-600">
          {currentCategoryCount ? (
            <span>
              現在のフィルター:
              {includeChildren
                ? `${currentCategoryCount.totalCount}件の投稿を表示中`
                : `${currentCategoryCount.directCount}件の投稿を表示中`}
            </span>
          ) : (
            <span>全{posts.length}件の投稿を表示中</span>
          )}
        </div>

        {posts.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow">
            <p className="text-gray-500">現在、投稿はありません</p>
            <Link
              to="/trade-posts/create"
              className="mt-4 inline-block text-blue-600 hover:underline"
            >
              最初の投稿を作成する
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {posts.map((post) => {
              const giveImage = getMainImage(post.give_item_images);
              const wantImage = getMainImage(post.want_item_images);
              const displayImage = giveImage || wantImage; // 譲画像優先

              return (
                <Link
                  to={`/trade-posts/${post.short_id || post.id}`}
                  key={post.id}
                  className="block transform overflow-hidden rounded-lg bg-white shadow transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* 画像部分 */}
                  {displayImage ? (
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      <img
                        src={displayImage}
                        alt={post.give_item}
                        className="h-full w-full object-cover"
                        onError={(e): void => {
                          // eslint-disable-next-line no-console
                          console.error(`画像読み込みエラー: ${displayImage}`);
                          e.currentTarget.onerror = null;
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      {/* 画像がある場合のバッジ */}
                      <div className="absolute left-2 top-2 flex gap-1">
                        {post.give_item_images &&
                          post.give_item_images.length > 0 && (
                            <span className="rounded bg-green-500 px-2 py-1 text-xs text-white">
                              譲
                            </span>
                          )}
                        {post.want_item_images &&
                          post.want_item_images.length > 0 && (
                            <span className="rounded bg-blue-500 px-2 py-1 text-xs text-white">
                              求
                            </span>
                          )}
                      </div>
                    </div>
                  ) : (
                    <DefaultImagePlaceholder text="画像なし" />
                  )}

                  {/* コンテンツ部分 */}
                  <div className="p-4">
                    {/* 交換情報 */}
                    <div className="mb-3">
                      <div className="mb-2 flex items-start">
                        <span className="mt-0.5 w-8 text-xs font-medium text-gray-500">
                          譲)
                        </span>
                        <span className="line-clamp-2 flex-1 text-sm font-bold text-gray-900">
                          {post.give_item}
                        </span>
                      </div>
                      <div className="flex items-start">
                        <span className="mt-0.5 w-8 text-xs font-medium text-gray-500">
                          求)
                        </span>
                        <span className="line-clamp-2 flex-1 text-sm font-bold text-gray-900">
                          {post.want_item}
                        </span>
                      </div>
                    </div>

                    {/* 説明（短縮表示） */}
                    {post.description && (
                      <p className="mb-3 line-clamp-2 text-xs text-gray-600">
                        {post.description}
                      </p>
                    )}

                    {/* メタ情報 */}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div>
                        {post.location_name && (
                          <span className="inline-flex items-center">
                            <svg
                              className="mr-1 h-3 w-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {post.location_name}
                          </span>
                        )}
                      </div>
                      <div>
                        {format(new Date(post.created_at), 'M/d', {
                          locale: ja,
                        })}
                      </div>
                    </div>

                    {/* ステータスバッジ */}
                    {post.status === 'completed' && (
                      <div className="mt-3 text-center">
                        <span className="inline-block rounded bg-gray-200 px-2 py-1 text-xs text-gray-600">
                          取引完了
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TradePostsPage;
