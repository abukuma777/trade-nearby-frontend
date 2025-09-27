/**
 * 交換投稿詳細ページ
 * 画像スワイプ機能付き
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTradePostStore } from '../stores/tradePostStore';
import { useAuthStore } from '../stores/authStore';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import CommentSection from '../components/trade/CommentSection';

const TradePostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentPost, loading, error, fetchPost, clearError } = useTradePostStore();
  const { user } = useAuthStore(); // 現在のユーザー情報を取得

  // 画像カルーセルの状態
  const [giveImageIndex, setGiveImageIndex] = useState(0);
  const [wantImageIndex, setWantImageIndex] = useState(0);

  // 自分の投稿かどうかを判定
  const isMyPost = currentPost && user && currentPost.user_id === user.id;

  useEffect(() => {
    if (id) {
      fetchPost(id);
    }
    return () => clearError();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
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
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
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
  }) => {
    if (!images || images.length === 0) {
      return (
        <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
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
        <div className="bg-gray-100 rounded-lg overflow-hidden h-96">
          <img
            src={images[currentIndex].url}
            alt={`${title} ${currentIndex + 1}`}
            className="w-full h-full object-contain"
          />
        </div>

        {/* 画像が複数ある場合のナビゲーション */}
        {images.length > 1 && (
          <>
            {/* 左矢印 */}
            <button
              onClick={() => onIndexChange(currentIndex > 0 ? currentIndex - 1 : images.length - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              onClick={() => onIndexChange(currentIndex < images.length - 1 ? currentIndex + 1 : 0)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* インジケーター */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => onIndexChange(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>

            {/* 画像カウンター */}
            <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
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
  }) => {
    if (!images || images.length <= 1) return null;

    return (
      <div className="flex gap-2 mt-4 overflow-x-auto">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => onIndexChange(index)}
            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
              index === currentIndex ? 'border-blue-500' : 'border-gray-300'
            }`}
          >
            <img
              src={image.url}
              alt={`サムネイル ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* ヘッダー */}
        <div className="mb-6 flex items-center justify-between">
          <Link to="/trade-posts" className="text-blue-600 hover:underline flex items-center">
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            投稿日: {format(new Date(currentPost.created_at), 'yyyy年M月d日 HH:mm', { locale: ja })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* タイトル部分 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">譲るもの</h2>
                <p className="text-xl font-bold text-gray-900">{currentPost.give_item}</p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500 mb-1">求めるもの</h2>
                <p className="text-xl font-bold text-gray-900">{currentPost.want_item}</p>
              </div>
            </div>
          </div>

          {/* 画像セクション */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              {/* 譲るものの画像 */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <span className="bg-green-100 text-green-700 text-sm px-2 py-1 rounded mr-2">
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
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <span className="bg-blue-100 text-blue-700 text-sm px-2 py-1 rounded mr-2">
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
                <h3 className="text-sm font-medium text-gray-500 mb-2">詳細説明</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{currentPost.description}</p>
              </div>
            )}

            {/* メタ情報 */}
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              {currentPost.location_name && (
                <div>
                  <span className="font-medium text-gray-500">取引場所：</span>
                  <span className="text-gray-700 ml-2">{currentPost.location_name}</span>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-500">ステータス：</span>
                <span
                  className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
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
                <span className="text-gray-700 ml-2">
                  {format(new Date(currentPost.updated_at), 'M月d日 HH:mm', { locale: ja })}
                </span>
              </div>
            </div>
          </div>

          {/* アクション（投稿者本人の場合は編集・削除ボタンを表示） */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              戻る
            </button>

            <div className="flex gap-2">
              {/* 自分の投稿の場合の編集ボタン */}
              {isMyPost && (
                <>
                  <button
                    onClick={() => {
                      // TODO: 編集画面へ遷移
                      alert('編集機能は実装中です');
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('この投稿を削除してもよろしいですか？')) {
                        // TODO: 削除処理
                        alert('削除機能は実装中です');
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
                    const commentSection = document.getElementById('comment-section');
                    if (commentSection) {
                      commentSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  コメントで交換を申し込む
                </button>
              )}
            </div>
          </div>
        </div>

        {/* コメントセクション */}
        <CommentSection 
          postId={currentPost.id} 
          postUserId={currentPost.user_id}
          postStatus={currentPost.status}
        />
      </div>
    </div>
  );
};

export default TradePostDetailPage;
