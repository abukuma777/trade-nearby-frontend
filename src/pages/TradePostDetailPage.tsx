/**
 * 交換投稿詳細ページ
 * 画像スワイプ機能付き
 * 日付処理のエラーハンドリング追加版
 */

import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

import CommentSection from '../components/trade/CommentSection';
import { useAuthStore } from '../stores/authStore';
import { useTradePostStore } from '../stores/tradePostStore';

// 安全な日付フォーマット関数
const safeFormatDate = (
  dateValue: string | null | undefined,
  formatStr: string,
): string => {
  if (!dateValue) {
    return '不明';
  }

  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) {
      return '不明';
    }
    return format(date, formatStr, { locale: ja });
  } catch (error) {
    console.error('日付フォーマットエラー:', error);
    return '不明';
  }
};

const TradePostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentPost, loading, error, fetchPost, clearError } =
    useTradePostStore();
  const { user } = useAuthStore(); // 現在のユーザー情報を取得

  // 画像カルーセルの状態
  const [giveImageIndex, setGiveImageIndex] = useState(0);
  const [wantImageIndex, setWantImageIndex] = useState(0);

  // 自分の投稿かどうかを判定
  const isMyPost = currentPost && user && currentPost.user_id === user.id;

  useEffect(() => {
    if (id) {
      void fetchPost(id);
    }
    return () => clearError();
  }, [id, fetchPost, clearError]);

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

  if (error || !currentPost) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">
            {error || '投稿が見つかりませんでした'}
          </div>
          <Link to="/trade-posts" className="text-blue-600 hover:underline">
            ← 一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  // 画像カルーセルコンポーネント
  const ImageCarousel = ({
    images,
    currentIndex,
    onIndexChange,
    title,
  }: {
    images?: Array<{ url: string; is_main?: boolean }>;
    currentIndex: number;
    onIndexChange: (index: number) => void;
    title: string;
  }): JSX.Element => {
    if (!images || images.length === 0) {
      return (
        <div className="flex h-96 items-center justify-center rounded-lg bg-gray-100">
          <div className="text-center text-gray-400">
            <svg
              className="mx-auto h-16 w-16"
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
            <p className="mt-2 text-sm">画像なし</p>
          </div>
        </div>
      );
    }

    return (
      <div className="relative">
        {/* メイン画像 */}
        <div className="h-96 overflow-hidden rounded-lg bg-gray-100">
          <img
            src={images[currentIndex].url}
            alt={`${title} ${currentIndex + 1}`}
            className="h-full w-full object-contain"
          />
        </div>

        {/* 画像が複数ある場合のナビゲーション */}
        {images.length > 1 && (
          <>
            {/* 左矢印 */}
            <button
              onClick={() =>
                onIndexChange(
                  currentIndex > 0 ? currentIndex - 1 : images.length - 1,
                )
              }
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black bg-opacity-50 p-2 text-white transition-opacity hover:bg-opacity-70"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* 右矢印 */}
            <button
              onClick={() =>
                onIndexChange(
                  currentIndex < images.length - 1 ? currentIndex + 1 : 0,
                )
              }
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black bg-opacity-50 p-2 text-white transition-opacity hover:bg-opacity-70"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* インジケーター */}
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              {images.map((img, index) => (
                <button
                  key={`${img.url}-indicator`}
                  onClick={() => onIndexChange(index)}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    index === currentIndex
                      ? 'bg-white'
                      : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>

            {/* 画像カウンター */}
            <div className="absolute right-4 top-4 rounded bg-black bg-opacity-50 px-2 py-1 text-sm text-white">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>
    );
  };

  // サムネイル画像コンポーネント
  const ThumbnailList = ({
    images,
    currentIndex,
    onIndexChange,
  }: {
    images?: Array<{ url: string; is_main?: boolean }>;
    currentIndex: number;
    onIndexChange: (index: number) => void;
  }): JSX.Element | null => {
    if (!images || images.length <= 1) {
      return null;
    }

    return (
      <div className="mt-4 flex gap-2 overflow-x-auto">
        {images.map((image, index) => (
          <button
            key={`${image.url}-thumb`}
            onClick={() => onIndexChange(index)}
            className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
              index === currentIndex ? 'border-blue-500' : 'border-gray-300'
            }`}
          >
            <img
              src={image.url}
              alt={`サムネイル ${index + 1}`}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-6xl px-4">
        {/* ヘッダー */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/trade-posts"
            className="flex items-center text-blue-600 hover:underline"
          >
            <svg
              className="mr-1 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            一覧に戻る
          </Link>
          <div className="text-sm text-gray-500">
            投稿日:{' '}
            {safeFormatDate(currentPost.created_at, 'yyyy年M月d日 HH:mm')}
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow-lg">
          {/* タイトル部分 */}
          <div className="border-b bg-gradient-to-r from-blue-50 to-purple-50 p-6">
            {/* カテゴリ階層表示 */}
            {'content_hierarchy' in currentPost &&
              Array.isArray(
                (currentPost as { content_hierarchy: unknown })
                  .content_hierarchy,
              ) && (
                <div className="mb-4">
                  <nav className="flex text-sm text-gray-600">
                    {(
                      currentPost as {
                        content_hierarchy: Array<{
                          id: string;
                          name: string;
                          name_kana?: string | null;
                        }>;
                      }
                    ).content_hierarchy.map((item, index, array) => (
                      <React.Fragment key={item.id}>
                        {index > 0 && <span className="mx-2">{'>'}</span>}
                        {index < array.length - 1 ? (
                          <Link
                            to={`/trade-posts?content_id=${item.id}&include_children=true`}
                            className="cursor-pointer hover:text-blue-600 hover:underline"
                            title={item.name_kana ?? item.name}
                          >
                            {item.name}
                          </Link>
                        ) : (
                          <span
                            className="font-medium text-gray-900"
                            title={item.name_kana ?? item.name}
                          >
                            {item.name}
                          </span>
                        )}
                      </React.Fragment>
                    ))}
                  </nav>
                </div>
              )}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h2 className="mb-1 text-sm font-medium text-gray-500">
                  譲るもの
                </h2>
                <p className="text-xl font-bold text-gray-900">
                  {currentPost.give_item}
                </p>
              </div>
              <div>
                <h2 className="mb-1 text-sm font-medium text-gray-500">
                  求めるもの
                </h2>
                <p className="text-xl font-bold text-gray-900">
                  {currentPost.want_item}
                </p>
              </div>
            </div>
          </div>

          {/* 画像セクション */}
          <div className="p-6">
            <div className="grid gap-8 md:grid-cols-2">
              {/* 譲るものの画像 */}
              <div>
                <h3 className="mb-4 flex items-center text-lg font-bold text-gray-800">
                  <span className="mr-2 rounded bg-green-100 px-2 py-1 text-sm text-green-700">
                    譲
                  </span>
                  {currentPost.give_item}
                </h3>
                <ImageCarousel
                  images={currentPost.give_item_images}
                  currentIndex={giveImageIndex}
                  onIndexChange={setGiveImageIndex}
                  title="譲るもの"
                />
                <ThumbnailList
                  images={currentPost.give_item_images}
                  currentIndex={giveImageIndex}
                  onIndexChange={setGiveImageIndex}
                />
              </div>

              {/* 求めるものの画像 */}
              <div>
                <h3 className="mb-4 flex items-center text-lg font-bold text-gray-800">
                  <span className="mr-2 rounded bg-blue-100 px-2 py-1 text-sm text-blue-700">
                    求
                  </span>
                  {currentPost.want_item}
                </h3>
                <ImageCarousel
                  images={currentPost.want_item_images}
                  currentIndex={wantImageIndex}
                  onIndexChange={setWantImageIndex}
                  title="求めるもの"
                />
                <ThumbnailList
                  images={currentPost.want_item_images}
                  currentIndex={wantImageIndex}
                  onIndexChange={setWantImageIndex}
                />
              </div>
            </div>
          </div>

          {/* 詳細情報 */}
          <div className="border-t p-6">
            {/* 説明 */}
            {currentPost.description && (
              <div className="mb-6">
                <h3 className="mb-2 text-sm font-medium text-gray-500">
                  詳細説明
                </h3>
                <p className="whitespace-pre-wrap text-gray-700">
                  {currentPost.description}
                </p>
              </div>
            )}

            {/* メタ情報 */}
            <div className="grid gap-4 text-sm md:grid-cols-3">
              {currentPost.location_name && (
                <div>
                  <span className="font-medium text-gray-500">取引場所：</span>
                  <span className="ml-2 text-gray-700">
                    {currentPost.location_name}
                  </span>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-500">ステータス：</span>
                <span
                  className={`ml-2 rounded-full px-2 py-1 text-xs font-medium ${
                    currentPost.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : currentPost.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {currentPost.status === 'active'
                    ? '募集中'
                    : currentPost.status === 'completed'
                      ? '完了'
                      : 'キャンセル'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-500">更新日：</span>
                <span className="ml-2 text-gray-700">
                  {safeFormatDate(currentPost.updated_at, 'M月d日 HH:mm')}
                </span>
              </div>
            </div>
          </div>

          {/* アクション（投稿者本人の場合は編集・削除ボタンを表示） */}
          <div className="flex justify-between bg-gray-50 px-6 py-4">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-gray-600 transition-colors hover:text-gray-800"
            >
              戻る
            </button>

            <div className="flex gap-2">
              {/* 自分の投稿の場合の編集ボタン */}
              {isMyPost && (
                <>
                  <button
                    onClick={() => {
                      navigate(
                        `/trade-posts/${currentPost.short_id || currentPost.id}/edit`,
                      );
                    }}
                    className="rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => {
                      /* eslint-disable no-alert */
                      if (
                        window.confirm('この投稿を削除してもよろしいですか？')
                      ) {
                        // TODO: 削除処理
                        // eslint-disable-next-line no-console
                        console.log('削除機能は実装中です');
                      }
                      /* eslint-enable no-alert */
                    }}
                    className="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
                  >
                    削除
                  </button>
                </>
              )}

              {/* 他人の投稿の場合の交換申し込みボタン */}
              {!isMyPost && currentPost.status === 'active' && (
                <button
                  onClick={() => {
                    // TODO: コメント欄へスクロール
                    const commentSection =
                      document.getElementById('comment-section');
                    if (commentSection) {
                      commentSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  コメントで交換を申し込む
                </button>
              )}
            </div>
          </div>
        </div>

        {/* コメントセクション - postIdが存在する場合のみレンダリング */}
        {currentPost?.id && (
          <CommentSection
            postId={currentPost.id}
            postUserId={currentPost.user_id}
            postStatus={currentPost.status}
          />
        )}
      </div>
    </div>
  );
};

export default TradePostDetailPage;
